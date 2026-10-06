import React, { useState, useEffect } from 'react';
import { TrekLocation, TrekAnalysisResult } from './types';
import { POPULAR_TREKS } from './services/googleMapsLoader';
import { fetchTrekWeather } from './services/weatherService';
import { extractAndEngineerFeatures, predictWeatherRisk } from './services/mlRiskEngine';
import { LocationSearch } from './components/LocationSearch';
import { DatePicker } from './components/DatePicker';
import { RiskScore } from './components/RiskScore';
import { MapView } from './components/MapView';
import { WeatherCard } from './components/WeatherCard';
import { RiskFactors } from './components/RiskFactors';
import { WeatherTimeline } from './components/WeatherTimeline';
import { SavedTreksModal } from './components/SavedTreksModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { AuthModal } from './components/AuthModal';
import { NearbyTreksModal } from './components/NearbyTreksModal';
import { TrekChecklist } from './components/TrekChecklist';
import { CityTrekExplorer } from './components/CityTrekExplorer';
import { ProfileModal } from './components/ProfileModal';
import { useAuth } from './context/AuthContext';
import { enrichTrekWithTrailway } from './services/trailPathwayService';
import { db } from './services/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import {
  Compass,
  Bookmark,
  Printer,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Key,
  User as UserIcon,
  LogIn,
  LogOut,
  Navigation,
  Route,
  Flame,
  Radio,
  Sliders,
  Target,
  Maximize2
} from 'lucide-react';

export default function App() {
  const { user, logout } = useAuth();

  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedTrek, setSelectedTrek] = useState<TrekLocation>(() => enrichTrekWithTrailway(POPULAR_TREKS[0]));
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const [analysis, setAnalysis] = useState<TrekAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [savedTreks, setSavedTreks] = useState<TrekAnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem('apex_saved_itineraries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  useEffect(() => {
    if (!user) return;

    async function loadUserTreks() {
      try {
        const treksRef = collection(db, 'users', user!.uid, 'savedTreks');
        const q = query(treksRef, orderBy('savedAt', 'desc'));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userTreks: TrekAnalysisResult[] = [];
          querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            if (data.analysisPayload) {
              userTreks.push(data.analysisPayload);
            }
          });
          if (userTreks.length > 0) {
            setSavedTreks(userTreks);
            localStorage.setItem('apex_saved_itineraries', JSON.stringify(userTreks));
          }
        }
      } catch (err) {
        console.warn('Failed to load user saved treks from Firestore:', err);
      }
    }

    loadUserTreks();
  }, [user]);

  const runAnalysis = async (trek: TrekLocation = selectedTrek, date: string = selectedDate) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const weatherData = await fetchTrekWeather(trek.latitude, trek.longitude, date);
      const engineeredFeatures = extractAndEngineerFeatures(weatherData, trek.elevation);
      const prediction = predictWeatherRisk(engineeredFeatures);

      const result: TrekAnalysisResult = {
        trek,
        date,
        weather: weatherData,
        features: engineeredFeatures,
        risk: prediction,
        timestamp: new Date().toISOString()
      };

      setAnalysis(result);
    } catch (err: any) {
      console.error('Analysis error:', err);
      setErrorMessage(err.message || 'Geospatial or weather sensor link interrupted.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis(selectedTrek, selectedDate);
  }, []);

  const handleSelectTrek = (trek: TrekLocation) => {
    setSelectedTrek(trek);
    runAnalysis(trek, selectedDate);
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    runAnalysis(selectedTrek, date);
  };

  const handleSaveTrek = async () => {
    if (!analysis) return;
    const exists = savedTreks.some(
      (item) => item.trek.id === analysis.trek.id && item.date === analysis.date
    );

    if (exists) {
      setSaveSuccessNotice(true);
      setTimeout(() => setSaveSuccessNotice(false), 2000);
      return;
    }

    const updated = [analysis, ...savedTreks];
    setSavedTreks(updated);
    try {
      localStorage.setItem('apex_saved_itineraries', JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage write warning:', e);
    }

    if (user) {
      try {
        const recordId = `${analysis.trek.id}_${analysis.date.replace(/-/g, '')}`;
        const trekDocRef = doc(db, 'users', user.uid, 'savedTreks', recordId);
        await setDoc(trekDocRef, {
          userId: user.uid,
          trekId: analysis.trek.id,
          trekName: analysis.trek.name,
          region: analysis.trek.region || '',
          date: analysis.date,
          latitude: analysis.trek.latitude,
          longitude: analysis.trek.longitude,
          elevation: analysis.trek.elevation || 0,
          riskScore: analysis.risk.score,
          riskBand: analysis.risk.band,
          temperature: analysis.weather.temperature,
          rainProbability: analysis.weather.rainProbability,
          analysisPayload: analysis,
          savedAt: new Date().toISOString()
        });
      } catch (err) {
        console.warn('Cloud sync error for saved trek:', err);
      }
    }

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  const handleRemoveSavedTrek = async (index: number) => {
    const itemToRemove = savedTreks[index];
    const updated = savedTreks.filter((_, i) => i !== index);
    setSavedTreks(updated);
    localStorage.setItem('apex_saved_itineraries', JSON.stringify(updated));

    if (user && itemToRemove) {
      try {
        const recordId = `${itemToRemove.trek.id}_${itemToRemove.date.replace(/-/g, '')}`;
        const trekDocRef = doc(db, 'users', user.uid, 'savedTreks', recordId);
        await deleteDoc(trekDocRef);
      } catch (err) {
        console.warn('Error deleting trek from Firestore:', err);
      }
    }
  };

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#0A0D14] text-[#E2E8F0] flex flex-col font-sans bg-apex-slate selection:bg-orange-500/30 selection:text-orange-300">
      
      {/* Top Header / Aerospace Command Bar */}
      <header className="sticky top-0 z-40 bg-[#0A0D14]/95 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-500 text-black flex items-center justify-center font-black font-mono shadow-[0_0_20px_rgba(249,115,22,0.4)]">
              ▲
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-lg sm:text-xl font-black text-white tracking-wider uppercase">
                  APEXTRAIL OS
                </h1>
                <span className="text-[8px] font-mono font-bold tracking-widest px-1.5 py-0.2 bg-orange-500/20 text-orange-400 border border-orange-500/40">
                  BUILD 4.2
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/40 hidden sm:block">
                Autonomous Alpine Risk Telemetry & Meteorological Forecasting
              </p>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-2 font-mono text-xs">
            {/* Trailhead Catalog */}
            <button
              onClick={() => setIsNearbyModalOpen(true)}
              className="px-3 py-1.5 bg-[#141B2B] hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 transition-all cursor-pointer"
              title="Global Summit Directory"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">INDEX</span>
            </button>

            {/* Saved Treks */}
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className="px-3 py-1.5 bg-[#141B2B] hover:bg-white/10 border border-white/10 text-white flex items-center gap-1.5 transition-all cursor-pointer relative"
              title="Saved Expeditions"
            >
              <Bookmark className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">ARCHIVES</span>
              {savedTreks.length > 0 && (
                <span className="w-4 h-4 bg-orange-500 text-black text-[9px] font-bold flex items-center justify-center ml-0.5">
                  {savedTreks.length}
                </span>
              )}
            </button>

            {/* API Config */}
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="p-1.5 bg-[#141B2B] hover:bg-white/10 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
              title="Maps API Settings"
            >
              <Key className="w-3.5 h-3.5 text-orange-400" />
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-2.5 py-1 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-xs font-bold text-orange-300 flex items-center gap-1.5 max-w-[170px] truncate transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-orange-400 shrink-0" />
                  <span className="truncate">{user.displayName || user.email?.split('@')[0] || 'Explorer'}</span>
                  <span className="text-[8px] uppercase tracking-wider text-orange-400/80 hidden md:inline">
                    // DOSSIER
                  </span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1.5 bg-[#141B2B] hover:bg-rose-500/20 border border-white/10 text-white/60 hover:text-rose-400 transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-white/10">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-[#141B2B] hover:bg-white/10 border border-white/10 text-white transition-all cursor-pointer"
                >
                  LOGIN
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-black font-bold transition-all cursor-pointer hidden sm:block"
                >
                  REGISTER
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Input Command Strip */}
        <section className="bg-[#0F1420] border border-white/10 p-5 sm:p-6 shadow-2xl space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            
            {/* Location search column */}
            <div className="lg:col-span-6">
              <LocationSearch
                selectedTrek={selectedTrek}
                onSelectTrek={handleSelectTrek}
                disabled={isLoading}
              />
            </div>

            {/* Date picker column */}
            <div className="lg:col-span-4">
              <DatePicker
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                disabled={isLoading}
              />
            </div>

            {/* Execute Button */}
            <div className="lg:col-span-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="w-full py-2.5 px-4 bg-orange-500 hover:bg-orange-400 text-black text-xs sm:text-sm font-mono font-black uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(249,115,22,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-black" />
                    <span>CALCULATING...</span>
                  </>
                ) : (
                  <>
                    <Target className="w-4 h-4 text-black" />
                    <span>COMPUTE RISK</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </section>

        {/* Regional Base & Mountain Hub Explorer */}
        <CityTrekExplorer
          selectedTrek={selectedTrek}
          onSelectTrek={(trek) => {
            handleSelectTrek(trek);
          }}
          disabled={isLoading}
        />

        {/* Progress State */}
        {isLoading && (
          <div className="py-12 bg-[#0F1420]/90 border border-white/10 text-center space-y-3">
            <div className="w-10 h-10 border-2 border-white/10 border-t-orange-500 animate-spin mx-auto" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-widest text-white">
              RUNNING ALPINE RISK SIMULATION MATRIX
            </h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
              Interrogating Open-Meteo satellite arrays, computing adiabatic lapse rates, and calculating SHAP vectors...
            </p>
          </div>
        )}

        {/* Error State Banner */}
        {errorMessage && !isLoading && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-start gap-3 font-mono">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase">TELEMETRY ANOMALY DETECTED</h4>
              <p className="text-xs text-rose-200">{errorMessage}</p>
              <button
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="text-xs font-bold underline text-rose-300 hover:text-white pt-1 block cursor-pointer"
              >
                Retry Uplink
              </button>
            </div>
          </div>
        )}

        {/* Results Stream */}
        {analysis && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-200">
            
            {/* Trail Heading Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0F1420] p-5 sm:p-6 border border-white/10">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-orange-400 uppercase tracking-widest">
                  <span>EXPEDITION VECTOR</span>
                  <span>•</span>
                  <span>{analysis.trek.trailDifficulty || 'MODERATE'}</span>
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight mt-1">
                  {analysis.trek.name}
                </h2>
                <p className="text-xs font-mono text-white/50">
                  {analysis.trek.region} • ALTITUDE {analysis.trek.elevation || analysis.weather.elevation}M MSL
                </p>

                {analysis.trek.startPoint && analysis.trek.endPoint && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[10px] font-mono">
                    <span className="px-2 py-0.5 bg-orange-500/10 text-orange-400 border border-orange-500/20">
                      TRAILHEAD: {analysis.trek.startPoint.name}
                    </span>
                    <span className="text-white/40">→</span>
                    <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      SUMMIT: {analysis.trek.endPoint.name}
                    </span>
                    {analysis.trek.trailLengthKm && (
                      <span className="px-2 py-0.5 bg-[#141B2B] text-white/60 border border-white/5">
                        {analysis.trek.trailLengthKm} KM MAPPED
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 font-mono text-xs">
                <button
                  onClick={handleSaveTrek}
                  className="px-3.5 py-2 bg-[#141B2B] hover:bg-white/10 border border-white/10 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-orange-400" />
                  <span>{saveSuccessNotice ? 'ARCHIVED!' : 'ARCHIVE ROUTE'}</span>
                </button>

                <button
                  onClick={handleExportReport}
                  className="px-3.5 py-2 bg-[#141B2B] hover:bg-white/10 border border-white/10 text-white font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-white/60" />
                  <span className="hidden sm:inline">PRINT DOSSIER</span>
                </button>
              </div>
            </div>

            {/* 1. Industrial Risk Gauge & Segmented Readout */}
            <RiskScore risk={analysis.risk} />

            {/* 2. Side-by-Side Map & Atmospheric Synopsis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Map Column */}
              <div className="lg:col-span-7">
                <MapView
                  trek={analysis.trek}
                  riskScore={analysis.risk.score}
                />
              </div>

              {/* Weather Synopsis Column */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                <div className="bg-[#0F1420] border border-white/10 p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <div>
                        <span className="font-mono text-[9px] tracking-widest uppercase text-orange-400 font-bold block">
                          METEOROLOGICAL SENSORS
                        </span>
                        <h3 className="font-display text-sm font-bold text-white tracking-tight">
                          Synoptic Profile
                        </h3>
                      </div>
                      <span className="text-xs font-mono text-orange-400">
                        {analysis.date}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed mb-4 font-sans">
                      Target date <strong>{analysis.date}</strong> models temperature at <strong>{analysis.weather.temperature}°C</strong> (chill factor {analysis.weather.feelsLike}°C). Precipitation likelihood is calculated at <strong>{analysis.weather.rainProbability}%</strong> with gusts up to <strong>{analysis.weather.windGust} km/h</strong>.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-mono border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">Rain Accumulation</span>
                      <strong className="text-white">{analysis.weather.rainAmount} mm</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">Cloud Cover</span>
                      <strong className="text-white">{analysis.weather.cloudCover}%</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/40">Azimuth Direction</span>
                      <strong className="text-white">{analysis.weather.windDirection}°</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-white/40">Lightning Index</span>
                      <strong className={`${analysis.weather.thunderstormProbability > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {analysis.weather.thunderstormProbability}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="p-3 bg-[#141B2B] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <span className="text-white/60">PACKING PROTOCOL ALIGNED</span>
                  <span className="text-orange-400 font-bold uppercase">
                    TELEMETRY LOCKED
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Expedition Gear Manifest */}
            <TrekChecklist
              weather={analysis.weather}
              trailName={analysis.trek.name}
            />

            {/* 4. Sharp 6-Block Weather Metrics */}
            <WeatherCard weather={analysis.weather} />

            {/* 5. Explainable Feature Attributions */}
            <RiskFactors
              factors={analysis.risk.factors}
              baseRisk={analysis.risk.baseRisk}
            />

            {/* 6. Chronological 24-Hour Scrubber */}
            <WeatherTimeline
              hourly={analysis.weather.hourly}
              forecastDate={analysis.date}
            />

          </div>
        )}

      </main>

      {/* Industrial Footer */}
      <footer className="border-t border-white/10 bg-[#080B12] py-6 text-xs text-white/40 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-orange-500 font-bold">▲ APEXTRAIL OS</span>
            <span>— Alpine Meteorological Risk Prediction Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span>Google Maps Platform</span>
            <span>•</span>
            <span>Open-Meteo High-Resolution Model</span>
            <span>•</span>
            <span>Firestore Persistent Storage</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <SavedTreksModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedTreks={savedTreks}
        onSelectTrek={(item) => {
          setSelectedTrek(item.trek);
          setSelectedDate(item.date);
          setAnalysis(item);
        }}
        onRemoveTrek={handleRemoveSavedTrek}
        onExportReport={handleExportReport}
      />

      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        onKeyUpdated={() => {
          if (analysis) {
            runAnalysis(analysis.trek, analysis.date);
          }
        }}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      <NearbyTreksModal
        isOpen={isNearbyModalOpen}
        onClose={() => setIsNearbyModalOpen(false)}
        onSelectTrek={(trek) => {
          handleSelectTrek(trek);
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

    </div>
  );
}

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
  Mountain,
  Compass,
  Bookmark,
  Share2,
  Printer,
  Calendar,
  AlertTriangle,
  RotateCcw,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Key,
  Info,
  User as UserIcon,
  LogIn,
  LogOut,
  Navigation,
  Route,
  Flag,
  Backpack,
  Radio,
  Activity,
  Layers
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
      const stored = localStorage.getItem('treksafe_saved_itineraries');
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
            localStorage.setItem('treksafe_saved_itineraries', JSON.stringify(userTreks));
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
      if (err.message && err.message.includes('status 404')) {
        setErrorMessage('Weather forecast telemetry unavailable for this location/date.');
      } else {
        setErrorMessage(err.message || 'Geospatial or weather sensor link interrupted.');
      }
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
      localStorage.setItem('treksafe_saved_itineraries', JSON.stringify(updated));
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
    localStorage.setItem('treksafe_saved_itineraries', JSON.stringify(updated));

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
    <div className="min-h-screen bg-[#0B0F0D] text-[#E2E8E0] flex flex-col font-sans bg-topo-dark selection:bg-emerald-500/20 selection:text-emerald-300">
      
      {/* Top Header / Tactical HUD Bar */}
      <header className="sticky top-0 z-40 bg-[#0E1411]/90 backdrop-blur-md border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Operational Status */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-[0_0_15px_rgba(52,211,153,0.2)]">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-mono font-extrabold text-white tracking-wider uppercase">
                  TrekSafe AI
                </h1>
                <span className="text-[9px] font-mono font-bold tracking-widest px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  EXPEDITION OS
                </span>
              </div>
              <p className="text-[10px] font-mono text-white/50 hidden sm:block">
                Synoptic Alpine Microclimate & Machine Learning Trail Risk Engine
              </p>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* Trailhead Hub Finder */}
            <button
              onClick={() => setIsNearbyModalOpen(true)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Regional Summit Directory"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Directory</span>
            </button>

            {/* Saved Treks */}
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer relative"
              title="Archived Itineraries"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Archived</span>
              {savedTreks.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-emerald-500 text-black text-[9px] font-bold flex items-center justify-center">
                  {savedTreks.length}
                </span>
              )}
            </button>

            {/* API Settings */}
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/70 hover:text-white rounded-xl transition-all cursor-pointer"
              title="Google Maps API Config"
            >
              <Key className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {/* Auth / Account Controls */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-2.5 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold text-emerald-300 flex items-center gap-1.5 max-w-[170px] truncate transition-all cursor-pointer"
                  title="View and edit your personal trekker dossier"
                >
                  <UserIcon className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{user.displayName || user.email?.split('@')[0] || 'Trekker'}</span>
                  <span className="text-[9px] uppercase tracking-wider font-semibold text-emerald-400/80 ml-0.5 hidden md:inline">
                    • Profile
                  </span>
                </button>
                <button
                  onClick={() => logout()}
                  className="p-1.5 bg-white/5 hover:bg-rose-500/20 border border-white/10 text-white/60 hover:text-rose-400 rounded-xl transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1 border-l border-white/10">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-mono font-semibold flex items-center gap-1 transition-all cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-black font-mono rounded-xl text-xs font-bold transition-all cursor-pointer hidden sm:flex items-center gap-1"
                >
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

        {/* Input Panel Card (Location Search & Date Picker) */}
        <section className="bg-[#111714] border border-white/10 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5">
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

            {/* Analyze Action Button */}
            <div className="lg:col-span-2">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black rounded-xl text-xs sm:text-sm font-mono font-bold uppercase tracking-wider transition-all shadow-[0_0_20px_rgba(52,211,153,0.25)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-black" />
                    <span>Computing...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-black" />
                    <span>Run Analysis</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </section>

        {/* Dedicated City & Mountain Hub Explorer */}
        <CityTrekExplorer
          selectedTrek={selectedTrek}
          onSelectTrek={(trek) => {
            handleSelectTrek(trek);
          }}
          disabled={isLoading}
        />

        {/* Loading Progress State */}
        {isLoading && (
          <div className="py-12 bg-[#111714]/80 border border-white/10 rounded-2xl text-center space-y-3 shadow-2xl">
            <div className="w-12 h-12 rounded-full border-2 border-white/10 border-t-emerald-400 animate-spin mx-auto" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
              Running Alpine Microclimate Inference & Risk Matrix
            </h3>
            <p className="text-xs text-white/50 max-w-sm mx-auto font-mono">
              Extracting Open-Meteo vectors, engineering altitude exposure, and executing SHAP feature attribution...
            </p>
          </div>
        )}

        {/* Error State Banner */}
        {errorMessage && !isLoading && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start gap-3 font-mono">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase">Analysis Interrupted</h4>
              <p className="text-xs text-rose-200">{errorMessage}</p>
              <button
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="text-xs font-bold underline text-rose-300 hover:text-white pt-1 block cursor-pointer"
              >
                Retry Telemetry Fetch
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results Display */}
        {analysis && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Trail Title & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#111714] p-5 rounded-2xl border border-white/10 shadow-xl">
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-wider">
                  <span>EXPEDITION TARGET</span>
                  <span>•</span>
                  <span>{analysis.trek.trailDifficulty || 'Moderate'}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold font-mono text-white tracking-tight">
                  {analysis.trek.name}
                </h2>
                <p className="text-xs font-mono text-white/50">
                  {analysis.trek.region} • Elevation ~{analysis.trek.elevation || analysis.weather.elevation}m MSL
                </p>

                {analysis.trek.startPoint && analysis.trek.endPoint && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-white/5 text-[11px] font-mono">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Start: {analysis.trek.startPoint.name}
                    </span>
                    <span className="text-white/30">→</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                      Summit: {analysis.trek.endPoint.name}
                    </span>
                    {analysis.trek.trailLengthKm && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 text-white/60 border border-white/5">
                        <Route className="w-3 h-3 text-emerald-400" />
                        {analysis.trek.trailLengthKm} km route
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons for Results */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSaveTrek}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{saveSuccessNotice ? 'Archived!' : 'Bookmark Trail'}</span>
                </button>

                <button
                  onClick={handleExportReport}
                  className="px-3.5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-white/60" />
                  <span className="hidden sm:inline">Print Dossier</span>
                </button>
              </div>
            </div>

            {/* 1. Large Readable Risk Score & Recommendation */}
            <RiskScore risk={analysis.risk} />

            {/* 2. Geospatial Interactive Google Map & Weather Summary Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Map Column */}
              <div className="lg:col-span-7">
                <MapView
                  trek={analysis.trek}
                  riskScore={analysis.risk.score}
                />
              </div>

              {/* Weather Summary Column */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-3">
                <div className="bg-[#111714] border border-white/10 rounded-2xl p-5 shadow-xl flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                      <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                        <Radio className="w-3.5 h-3.5 text-emerald-400" /> Synoptic Meteorological Brief
                      </h3>
                      <span className="text-xs font-mono text-emerald-400">
                        {analysis.date}
                      </span>
                    </div>

                    <p className="text-xs text-white/70 leading-relaxed mb-4 font-sans">
                      Forecast for <strong>{analysis.date}</strong> indicates daylight temperature modeled at <strong>{analysis.weather.temperature}°C</strong> (perceived feels-like index: {analysis.weather.feelsLike}°C). Rain probability is calculated at <strong>{analysis.weather.rainProbability}%</strong> with gusts up to <strong>{analysis.weather.windGust} km/h</strong>.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-mono border-t border-white/5 pt-3">
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/50">Cumulative Rain</span>
                      <strong className="text-white">{analysis.weather.rainAmount} mm</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/50">Cloud Cover</span>
                      <strong className="text-white">{analysis.weather.cloudCover}%</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-white/5">
                      <span className="text-white/50">Wind Direction</span>
                      <strong className="text-white">{analysis.weather.windDirection}° Azimuth</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-white/50">Thunderstorm Probability</span>
                      <strong className={`${analysis.weather.thunderstormProbability > 25 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {analysis.weather.thunderstormProbability}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Trail Readiness Banner */}
                <div className="p-3.5 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/20 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <Backpack className="w-4 h-4 text-emerald-400" />
                    <span className="text-white/80">Packing Manifest Aligned</span>
                  </div>
                  <span className="text-emerald-400 font-bold uppercase">
                    Model Ready
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Major Trek Checklist & Gear Essentials */}
            <TrekChecklist
              weather={analysis.weather}
              trailName={analysis.trek.name}
            />

            {/* 4. Detailed 6-Tile Weather Metrics */}
            <WeatherCard weather={analysis.weather} />

            {/* 5. Key Trail Hazard & Weather Factors */}
            <RiskFactors
              factors={analysis.risk.factors}
              baseRisk={analysis.risk.baseRisk}
            />

            {/* 6. 24-Hour Diurnal Weather Timeline */}
            <WeatherTimeline
              hourly={analysis.weather.hourly}
              forecastDate={analysis.date}
            />

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#0E1411] py-6 text-xs text-white/40 font-mono mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">TrekSafe AI</span>
            <span>— Alpine Meteorological Risk Prediction Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
            <span>Google Maps Geospatial Vectors</span>
            <span>•</span>
            <span>Open-Meteo High-Resolution Telemetry</span>
            <span>•</span>
            <span>Encrypted Firestore Sync</span>
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

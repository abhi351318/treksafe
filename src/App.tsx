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
import { ModelTrainingModal } from './components/ModelTrainingModal';
import { useAuth } from './context/AuthContext';
import { enrichTrekWithTrailway } from './services/trailPathwayService';
import { db } from './services/firebase';
import { collection, doc, setDoc, deleteDoc, getDocs, query, orderBy } from 'firebase/firestore';
import {
  Mountain,
  Bookmark,
  Printer,
  AlertTriangle,
  RotateCcw,
  Key,
  User as UserIcon,
  LogOut,
  Navigation,
  Cpu,
  ShieldCheck,
  Sparkles
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

  const [selectedTrek, setSelectedTrek] = useState<TrekLocation>(() =>
    enrichTrekWithTrailway(POPULAR_TREKS[0])
  );
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  const [analysis, setAnalysis] = useState<TrekAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isModelModalOpen, setIsModelModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [savedTreks, setSavedTreks] = useState<TrekAnalysisResult[]>(() => {
    try {
      const stored =
        localStorage.getItem('treksafe_saved_itineraries') ||
        localStorage.getItem('apex_saved_itineraries');
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
      setErrorMessage(err.message || 'Unable to load weather or trail risk forecast.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    runAnalysis(selectedTrek, selectedDate);
  }, []);

  const handleSelectTrek = (trek: TrekLocation) => {
    const enriched = enrichTrekWithTrailway(trek);
    setSelectedTrek(enriched);
    runAnalysis(enriched, selectedDate);
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
    <div className="min-h-screen bg-[#F5F3EC] text-[#1F2520] flex flex-col font-sans bg-topo">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E4E0D2] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center shadow-xs shrink-0">
              <Mountain className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-extrabold text-[#243B2A] tracking-tight whitespace-nowrap">
                  TrekSafe AI
                </h1>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#526B4F]/15 text-[#243B2A] whitespace-nowrap">
                  MVP v1.0
                </span>
              </div>
              <p className="text-xs text-[#6B7262] hidden sm:block truncate">
                Plan the trail. Understand the weather. Trek smarter.
              </p>
            </div>
          </div>

          {/* Navigation Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsNearbyModalOpen(true)}
              className="px-3.5 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-xs"
              title="Find Treks Near Any City"
            >
              <Navigation className="w-3.5 h-3.5 text-[#D7A84A]" />
              <span className="hidden sm:inline">Find Near City</span>
            </button>

            <button
              type="button"
              onClick={() => setIsSavedModalOpen(true)}
              className="px-3.5 py-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap relative"
              title="Saved Trail Plans"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#526B4F]" />
              <span className="hidden md:inline">Saved</span>
              {savedTreks.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#243B2A] text-[#D7A84A] text-[10px] font-bold flex items-center justify-center">
                  {savedTreks.length}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsModelModalOpen(true)}
              className="p-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#526B4F] hover:text-[#243B2A] rounded-xl transition-all cursor-pointer"
              title="ML Risk Model Details"
            >
              <Cpu className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className="p-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#526B4F] hover:text-[#243B2A] rounded-xl transition-all cursor-pointer"
              title="Google Maps API Settings"
            >
              <Key className="w-4 h-4" />
            </button>

            {/* Auth / Profile */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E4E0D2]">
                <button
                  type="button"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-2.5 py-1.5 bg-[#243B2A]/10 hover:bg-[#243B2A]/20 border border-[#D5D0C0]/80 rounded-xl text-xs font-semibold text-[#243B2A] flex items-center gap-1.5 max-w-[175px] truncate transition-all cursor-pointer"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#526B4F] shrink-0" />
                  <span className="truncate">
                    {user.displayName || user.email?.split('@')[0] || 'Trekker'}
                  </span>
                  <span className="text-[10px] text-[#526B4F] hidden lg:inline">• Profile</span>
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="p-2 bg-white hover:bg-[#FDECEC] border border-[#D5D0C0] text-[#6B7262] hover:text-[#991B1B] rounded-xl transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-2 border-l border-[#E4E0D2]">
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3.5 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold transition-all cursor-pointer hidden sm:block whitespace-nowrap"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Search & Date Planner Card */}
        <section className="rounded-2xl bg-white border border-[#E4E0D2] p-5 sm:p-6 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            <div className="lg:col-span-6">
              <LocationSearch
                selectedTrek={selectedTrek}
                onSelectTrek={handleSelectTrek}
                disabled={isLoading}
              />
            </div>

            <div className="lg:col-span-4">
              <DatePicker
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                disabled={isLoading}
              />
            </div>

            <div className="lg:col-span-2 lg:pt-6">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="w-full py-2.5 px-4 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 whitespace-nowrap"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-[#D7A84A]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#D7A84A]" />
                    <span>Analyze Risk</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {/* City & Popular Trek Explorer */}
        <CityTrekExplorer
          selectedTrek={selectedTrek}
          onSelectTrek={(trek) => handleSelectTrek(trek)}
          disabled={isLoading}
        />

        {/* Loading State */}
        {isLoading && (
          <div className="py-12 bg-white border border-[#E4E0D2] rounded-2xl text-center space-y-3 shadow-xs">
            <div className="w-10 h-10 rounded-full border-3 border-[#EAE6D8] border-t-[#243B2A] animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-[#243B2A]">
              Predicting Trail Weather & Risk Score
            </h3>
            <p className="text-xs text-[#6B7262] max-w-sm mx-auto">
              Fetching Open-Meteo forecasts, calculating elevation stress factors, and preparing your adaptive packing list...
            </p>
          </div>
        )}

        {/* Error Banner */}
        {errorMessage && !isLoading && (
          <div className="p-4 rounded-2xl bg-[#FDECEC] border border-[#F5C2C2] text-[#991B1B] flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold uppercase">Forecast Unavailable</h4>
              <p className="text-xs">{errorMessage}</p>
              <button
                type="button"
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="text-xs font-bold underline pt-1 block cursor-pointer"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results */}
        {analysis && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Trail Summary Header Card */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FAF8F3] p-5 rounded-2xl border border-[#E4E0D2] shadow-xs">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#526B4F]">
                  <span>Selected Trail</span>
                  <span>·</span>
                  <span>{analysis.trek.trailDifficulty || 'Moderate'}</span>
                  <span>·</span>
                  <span className="tabular-nums">
                    {analysis.trek.elevation || analysis.weather.elevation}m elevation
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-[#243B2A] tracking-tight">
                  {analysis.trek.name}
                </h2>

                <p className="text-xs text-[#6B7262]">
                  {analysis.trek.region}
                  {analysis.trek.description ? ` — ${analysis.trek.description}` : ''}
                </p>

                {analysis.trek.startPoint && analysis.trek.endPoint && (
                  <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      Start: {analysis.trek.startPoint.name}
                    </span>
                    <span className="text-[#8C8675]">→</span>
                    <span className="px-2.5 py-1 rounded-full bg-red-50 text-red-800 border border-red-200 font-medium">
                      Summit: {analysis.trek.endPoint.name}
                    </span>
                    {analysis.trek.trailLengthKm && (
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#243B2A] border border-[#E4E0D2] font-semibold tabular-nums">
                        {analysis.trek.trailLengthKm} km
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleSaveTrek}
                  className="px-4 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#D7A84A]" />
                  <span>{saveSuccessNotice ? 'Saved!' : 'Save Trail'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-white hover:bg-[#EAE6D8] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Printer className="w-3.5 h-3.5 text-[#526B4F]" />
                  <span className="hidden sm:inline">Print Report</span>
                </button>
              </div>
            </div>

            {/* 1. Risk Gauge Card */}
            <RiskScore risk={analysis.risk} />

            {/* 2. Map & Atmospheric Synopsis */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7">
                <MapView trek={analysis.trek} riskScore={analysis.risk.score} />
              </div>

              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 flex-1 flex flex-col justify-between shadow-xs">
                  <div>
                    <div className="flex items-center justify-between border-b border-[#EAE6D8] pb-3 mb-4">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#526B4F] block">
                          Atmospheric Synopsis
                        </span>
                        <h3 className="text-base font-bold text-[#243B2A]">
                          Trail Forecast Summary
                        </h3>
                      </div>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#FAF8F3] border border-[#E4E0D2] text-[#243B2A] tabular-nums">
                        {analysis.date}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#526B4F] leading-relaxed mb-4">
                      On <strong>{analysis.date}</strong>, expected trail temperature is{' '}
                      <strong>{analysis.weather.temperature}°C</strong> (feels like{' '}
                      <strong>{analysis.weather.feelsLike}°C</strong>). Precipitation probability is{' '}
                      <strong>{analysis.weather.rainProbability}%</strong> with wind gusts up to{' '}
                      <strong>{analysis.weather.windGust} km/h</strong>.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs border-t border-[#EAE6D8] pt-3 tabular-nums">
                    <div className="flex items-center justify-between py-1 border-b border-[#F0EDE3]">
                      <span className="text-[#6B7262]">Expected Rainfall</span>
                      <strong className="text-[#1F2520]">{analysis.weather.rainAmount} mm</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#F0EDE3]">
                      <span className="text-[#6B7262]">Cloud Cover</span>
                      <strong className="text-[#1F2520]">{analysis.weather.cloudCover}%</strong>
                    </div>
                    <div className="flex items-center justify-between py-1 border-b border-[#F0EDE3]">
                      <span className="text-[#6B7262]">Wind Direction</span>
                      <strong className="text-[#1F2520]">{analysis.weather.windDirection}°</strong>
                    </div>
                    <div className="flex items-center justify-between py-1">
                      <span className="text-[#6B7262]">Thunderstorm Chance</span>
                      <strong
                        className={
                          analysis.weather.thunderstormProbability > 25
                            ? 'text-[#991B1B]'
                            : 'text-[#2E5A36]'
                        }
                      >
                        {analysis.weather.thunderstormProbability}%
                      </strong>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#FAF8F3] border border-[#E4E0D2] flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2 text-[#243B2A] font-semibold">
                    <ShieldCheck className="w-4 h-4 text-[#2E5A36]" />
                    <span>Trail Safety & Packing Readiness</span>
                  </div>
                  <span className="font-bold text-[#526B4F]">Weather-Adaptive</span>
                </div>
              </div>
            </div>

            {/* 3. Adaptive Packing Checklist */}
            <TrekChecklist weather={analysis.weather} trailName={analysis.trek.name} />

            {/* 4. 6-Tile Weather Summary */}
            <WeatherCard weather={analysis.weather} />

            {/* 5. ML Risk Factors Breakdown */}
            <RiskFactors factors={analysis.risk.factors} baseRisk={analysis.risk.baseRisk} />

            {/* 6. 24-Hour Timeline */}
            <WeatherTimeline hourly={analysis.weather.hourly} forecastDate={analysis.date} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E0D2] bg-[#FAF8F3] py-6 text-xs text-[#6B7262] mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-[#243B2A]" />
            <span className="font-bold text-[#243B2A]">
              TrekSafe AI — Minimalist Trek Management & Weather Risk Platform
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span>Google Maps</span>
            <span>·</span>
            <span>Open-Meteo Forecast</span>
            <span>·</span>
            <span>Firebase Cloud Sync</span>
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
        onSelectTrek={(trek) => handleSelectTrek(trek)}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />

      <ModelTrainingModal
        isOpen={isModelModalOpen}
        onClose={() => setIsModelModalOpen(false)}
        onModelRetrained={() => {
          if (analysis) {
            runAnalysis(analysis.trek, analysis.date);
          }
        }}
      />
    </div>
  );
}

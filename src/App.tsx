import React, { useState, useEffect } from 'react';
import {
  TrekLocation,
  WeatherData,
  MLFeatures,
  RiskPrediction,
  TrekAnalysisResult
} from './types';
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
  Backpack
} from 'lucide-react';

export default function App() {
  const { user, logout } = useAuth();

  // Today's date string YYYY-MM-DD
  const getTodayStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedTrek, setSelectedTrek] = useState<TrekLocation>(() => enrichTrekWithTrailway(POPULAR_TREKS[0])); // Kudremukh default with route
  const [selectedDate, setSelectedDate] = useState<string>(getTodayStr());

  // Current analysis state
  const [analysis, setAnalysis] = useState<TrekAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals state
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isNearbyModalOpen, setIsNearbyModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Saved itineraries stored in localStorage & synced with Firestore for logged in user
  const [savedTreks, setSavedTreks] = useState<TrekAnalysisResult[]>(() => {
    try {
      const stored = localStorage.getItem('treksafe_saved_itineraries');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  // Sync saved treks from Firestore if user logs in
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

  // Trigger analysis pipeline
  const runAnalysis = async (trek: TrekLocation = selectedTrek, date: string = selectedDate) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      // 1. Fetch weather forecast for target coordinates & date
      const weatherData = await fetchTrekWeather(trek.latitude, trek.longitude, date);

      // 2. Feature Engineering
      const engineeredFeatures = extractAndEngineerFeatures(weatherData, trek.elevation);

      // 3. Calibrated ML Risk Prediction + SHAP Attribution
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
      // Graceful error as per PRD Section 27
      if (err.message && err.message.includes('status 404')) {
        setErrorMessage('Weather forecast unavailable for this location/date. Try another nearby trail or date.');
      } else {
        setErrorMessage(err.message || 'Location or weather service is temporarily unavailable. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Run initial analysis on first load
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
      (s) => s.trek.name === analysis.trek.name && s.date === analysis.date
    );

    if (!exists) {
      const updated = [analysis, ...savedTreks];
      setSavedTreks(updated);
      try {
        localStorage.setItem('treksafe_saved_itineraries', JSON.stringify(updated));
      } catch (e) {
        console.warn('Storage save failed:', e);
      }

      // If user is authenticated, sync to Firestore cloud subcollection
      if (user) {
        try {
          const trekDocId = `${analysis.trek.name.replace(/[^a-zA-Z0-9]/g, '_')}_${analysis.date}`;
          const trekDocRef = doc(db, 'users', user.uid, 'savedTreks', trekDocId);
          await setDoc(trekDocRef, {
            userId: user.uid,
            trekId: analysis.trek.id,
            trekName: analysis.trek.name,
            region: analysis.trek.region || '',
            date: analysis.date,
            latitude: analysis.trek.latitude,
            longitude: analysis.trek.longitude,
            elevation: analysis.trek.elevation || 1500,
            riskScore: analysis.risk.score,
            riskBand: analysis.risk.band,
            temperature: analysis.weather.temperature,
            rainProbability: analysis.weather.rainProbability,
            savedAt: new Date().toISOString(),
            analysisPayload: analysis
          });
        } catch (err) {
          console.warn('Firestore trek save error:', err);
        }
      }
    }

    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2000);
  };

  const handleRemoveSavedTrek = async (index: number) => {
    const itemToRemove = savedTreks[index];
    const updated = savedTreks.filter((_, i) => i !== index);
    setSavedTreks(updated);
    try {
      localStorage.setItem('treksafe_saved_itineraries', JSON.stringify(updated));
    } catch (e) {
      console.warn('Storage remove failed:', e);
    }

    if (user && itemToRemove) {
      try {
        const trekDocId = `${itemToRemove.trek.name.replace(/[^a-zA-Z0-9]/g, '_')}_${itemToRemove.date}`;
        await deleteDoc(doc(db, 'users', user.uid, 'savedTreks', trekDocId));
      } catch (err) {
        console.warn('Firestore trek delete error:', err);
      }
    }
  };

  const handleExportReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#F5F3EC] text-[#1F2520] flex flex-col font-sans selection:bg-[#526B4F]/20 selection:text-[#243B2A]">
      
      {/* Top Header / Brand Bar */}
      <header className="sticky top-0 z-40 bg-[#FAF8F3]/95 backdrop-blur-md border-b border-[#E4E0D2] shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          
          {/* Logo & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center shadow-xs">
              <Mountain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-extrabold text-[#243B2A] tracking-tight">
                  TrekSafe AI
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-[#526B4F]/15 text-[#243B2A]">
                  MVP v1.0
                </span>
              </div>
              <p className="text-[11px] text-[#526B4F] hidden sm:block">
                Plan the trail. Understand the weather. Trek smarter.
              </p>
            </div>
          </div>

          {/* Action Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* Find Treks Near City or Location button */}
            <button
              onClick={() => setIsNearbyModalOpen(true)}
              className="px-3 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              title="Find treks near city or current GPS location"
            >
              <Navigation className="w-3.5 h-3.5 text-[#D7A84A]" />
              <span className="hidden sm:inline">Find Near City</span>
            </button>

            {/* Saved Treks */}
            <button
              onClick={() => setIsSavedModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer relative"
              title="Saved trail itineraries"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#526B4F]" />
              <span className="hidden sm:inline">Saved</span>
              {savedTreks.length > 0 && (
                <span className="w-4 h-4 rounded-full bg-[#243B2A] text-[#D7A84A] text-[10px] font-bold flex items-center justify-center">
                  {savedTreks.length}
                </span>
              )}
            </button>

            {/* Google Maps API Key Indicator */}
            <button
              onClick={() => setIsApiModalOpen(true)}
              className="p-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#526B4F] hover:text-[#243B2A] rounded-xl transition-all shadow-2xs cursor-pointer"
              title="Google Maps API Config"
            >
              <Key className="w-3.5 h-3.5 text-[#D7A84A]" />
            </button>

            {/* Auth / Account Controls */}
            {user ? (
              <div className="flex items-center gap-1.5 pl-1 border-l border-[#E4E0D2]">
                <div className="px-2.5 py-1 bg-[#243B2A]/10 rounded-xl text-xs font-bold text-[#243B2A] flex items-center gap-1.5 max-w-[140px] truncate">
                  <UserIcon className="w-3.5 h-3.5 text-[#526B4F] shrink-0" />
                  <span className="truncate">{user.displayName || user.email?.split('@')[0] || 'Trekker'}</span>
                </div>
                <button
                  onClick={() => logout()}
                  className="p-1.5 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#526B4F] hover:text-red-700 rounded-xl transition-all shadow-2xs cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 pl-1 border-l border-[#E4E0D2]">
                <button
                  onClick={() => {
                    setAuthModalMode('login');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1 transition-all shadow-2xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#526B4F]" />
                  <span>Login</span>
                </button>
                <button
                  onClick={() => {
                    setAuthModalMode('register');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer hidden sm:flex items-center gap-1"
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
        <section className="bg-white border border-[#E4E0D2] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
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
                className="w-full py-2.5 px-4 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RotateCcw className="w-4 h-4 animate-spin text-[#D7A84A]" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Compass className="w-4 h-4 text-[#D7A84A]" />
                    <span>Analyze Trek</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </section>

        {/* Loading Progress State */}
        {isLoading && (
          <div className="py-12 bg-white/70 border border-[#E4E0D2] rounded-2xl text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full border-3 border-[#D5D0C0] border-t-[#243B2A] animate-spin mx-auto" />
            <h3 className="text-sm font-bold text-[#243B2A]">
              Retrieving Weather & Computing ML Risk Model
            </h3>
            <p className="text-xs text-[#526B4F] max-w-sm mx-auto">
              Querying high-resolution mountain forecast, running feature engineering, and evaluating SHAP attributions...
            </p>
          </div>
        )}

        {/* Error State Banner */}
        {errorMessage && !isLoading && (
          <div className="p-4 rounded-2xl bg-red-50/90 border border-red-200 text-red-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Analysis Could Not Complete</h4>
              <p className="text-xs text-red-700">{errorMessage}</p>
              <button
                onClick={() => runAnalysis(selectedTrek, selectedDate)}
                className="text-xs font-semibold underline text-red-800 hover:text-red-900 pt-1 block cursor-pointer"
              >
                Retry Analysis
              </button>
            </div>
          </div>
        )}

        {/* Analysis Results Display (PRD Section 16 & 17) */}
        {analysis && !isLoading && (
          <div className="space-y-6 animate-in fade-in duration-300">
            
            {/* Trail Title & Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#FAF8F3] p-4 rounded-2xl border border-[#E4E0D2]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#526B4F]">
                    Selected Trailhead
                  </span>
                  <span className="text-[11px] font-mono text-[#8C8675]">
                    • {analysis.trek.trailDifficulty || 'Moderate'}
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#243B2A]">
                  {analysis.trek.name}
                </h2>
                <p className="text-xs text-[#526B4F]">
                  {analysis.trek.region} • Elevation ~{analysis.trek.elevation || analysis.weather.elevation}m
                </p>

                {/* Trailhead Start & End pathway badge */}
                {analysis.trek.startPoint && analysis.trek.endPoint && (
                  <div className="flex flex-wrap items-center gap-2 mt-2 pt-2 border-t border-[#EAE6D8] text-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <strong>Start:</strong> {analysis.trek.startPoint.name}
                    </span>
                    <span className="text-[#8C8675]">→</span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-50 text-red-800 border border-red-200 font-medium">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                      <strong>Summit:</strong> {analysis.trek.endPoint.name}
                    </span>
                    {analysis.trek.trailLengthKm && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#FAF8F3] text-[#526B4F] border border-[#D5D0C0] font-mono text-[11px]">
                        <Route className="w-3 h-3 text-[#243B2A]" />
                        {analysis.trek.trailLengthKm} km mapped path
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons for Results */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleSaveTrek}
                  className="px-3 py-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-[#526B4F]" />
                  <span>{saveSuccessNotice ? 'Saved!' : 'Save Trail'}</span>
                </button>

                <button
                  onClick={handleExportReport}
                  className="px-3 py-2 bg-white hover:bg-[#FAF8F3] border border-[#D5D0C0] text-[#243B2A] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-[#526B4F]" />
                  <span className="hidden sm:inline">Print Report</span>
                </button>
              </div>
            </div>

            {/* 1. Large Readable Risk Score & Recommendation (PRD Section 8 & 17) */}
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
                <div className="bg-white border border-[#E4E0D2] rounded-2xl p-5 shadow-xs flex-1">
                  <div className="flex items-center justify-between border-b border-[#E4E0D2] pb-3 mb-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#D7A84A]" /> Atmospheric Synopsis
                    </h3>
                    <span className="text-xs font-mono text-[#526B4F]">
                      {analysis.date}
                    </span>
                  </div>

                  <p className="text-xs text-[#526B4F] leading-relaxed mb-4">
                    On <strong>{analysis.date}</strong>, expected day temperatures average around <strong>{analysis.weather.temperature}°C</strong> (feels like {analysis.weather.feelsLike}°C). Rain probability is modeled at <strong>{analysis.weather.rainProbability}%</strong> with peak wind gusts reaching <strong>{analysis.weather.windGust} km/h</strong>.
                  </p>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EDE3]">
                      <span className="text-[#6B7262]">Precipitation Sum</span>
                      <strong className="text-[#1F2520]">{analysis.weather.rainAmount} mm</strong>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EDE3]">
                      <span className="text-[#6B7262]">Cloud Cover</span>
                      <strong className="text-[#1F2520]">{analysis.weather.cloudCover}%</strong>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-[#F0EDE3]">
                      <span className="text-[#6B7262]">Peak Wind Speed</span>
                      <strong className="text-[#1F2520]">{analysis.weather.windSpeed} km/h</strong>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-[#6B7262]">Thunderstorm Index</span>
                      <strong className={`${analysis.weather.thunderstormProbability > 25 ? 'text-red-700' : 'text-[#1F2520]'}`}>
                        {analysis.weather.thunderstormProbability}%
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Clean Trail Readiness Card */}
                <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-[#E4E0D2] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Backpack className="w-4 h-4 text-[#526B4F]" />
                    <span className="text-[#526B4F] font-medium">Trail Safety & Packing Readiness</span>
                  </div>
                  <span className="text-[#243B2A] font-bold">
                    Weather-Adaptive
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Major Trek Checklist & Gear Essentials */}
            <TrekChecklist
              weather={analysis.weather}
              trailName={analysis.trek.name}
            />

            {/* 4. Detailed 6-Tile Weather Metrics (PRD Section 9) */}
            <WeatherCard weather={analysis.weather} />

            {/* 5. Key Trail Hazard & Weather Factors */}
            <RiskFactors
              factors={analysis.risk.factors}
              baseRisk={analysis.risk.baseRisk}
            />

            {/* 6. 24-Hour Diurnal Weather Timeline (PRD FR-09) */}
            <WeatherTimeline
              hourly={analysis.weather.hourly}
              forecastDate={analysis.date}
            />

            {/* Model Governance Limitation Banner (PRD Section 29 & 32) */}
            <section className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E4E0D2] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#526B4F] shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#243B2A]">
                    Outdoor Trail Safety Advisory
                  </h4>
                  <p className="text-xs text-[#526B4F] leading-relaxed">
                    This platform predicts atmospheric weather-related risks. It does not replace local ranger guidelines, mountain trail permits, or personal physical conditioning. Always register with local trail checkpoints before commencing your hike.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] font-bold text-[#243B2A] bg-[#FAF8F3] px-3 py-1.5 rounded-xl border border-[#D5D0C0]">
                  Official Weather Advisory
                </span>
              </div>
            </section>

          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-[#E4E0D2] bg-[#FAF8F3] py-6 mt-12 text-center text-xs text-[#6B7262]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mountain className="w-4 h-4 text-[#243B2A]" />
            <span className="font-bold text-[#243B2A]">TrekSafe AI</span>
            <span>— Minimalist Trek Management & Weather Risk Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Google Maps Geospatial Integration</span>
            <span>•</span>
            <span>Live Trail Weather Analytics</span>
            <span>•</span>
            <span>Outdoor Gear Checklists</span>
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

    </div>
  );
}

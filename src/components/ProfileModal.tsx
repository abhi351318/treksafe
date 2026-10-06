import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  TrekkerProfile,
  TrekExperienceLevel,
  FitnessLevel,
  PreferredDifficulty
} from '../types';
import {
  getTrekkerProfile,
  saveTrekkerProfile,
  calculateProfileCompletion,
  DEFAULT_TREKKER_PROFILE
} from '../services/profileService';
import {
  X,
  User,
  HeartPulse,
  Loader2,
  CheckCircle,
  Activity,
  Compass,
  Radio
} from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TREK_TYPES_OPTIONS = [
  'Day Hikes',
  'Monolith & Rock',
  'High Altitude',
  'Cave Exploration',
  'Forest Trails',
  'Multi-day Trekking',
  'Glacier / Snow',
  'Waterfalls & Rivers',
  'Night Trekking'
];

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<TrekkerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [photoURL, setPhotoURL] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [experienceLevel, setExperienceLevel] = useState<TrekExperienceLevel>('Intermediate');
  const [preferredDifficulty, setPreferredDifficulty] = useState<PreferredDifficulty>('Moderate');
  const [preferredTrekTypes, setPreferredTrekTypes] = useState<string[]>([]);
  const [fitnessLevel, setFitnessLevel] = useState<FitnessLevel>('Moderate');
  const [typicalDistanceKm, setTypicalDistanceKm] = useState<number>(10);
  const [maxElevationMeters, setMaxElevationMeters] = useState<number>(1800);

  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Family');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [trekReminders, setTrekReminders] = useState(true);

  useEffect(() => {
    if (!isOpen || !user) return;

    let isMounted = true;
    setIsLoading(true);
    setStatusMessage(null);

    getTrekkerProfile(user.uid)
      .then((data) => {
        if (!isMounted) return;
        const initial: TrekkerProfile = data || {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Trekker',
          email: user.email || '',
          ...DEFAULT_TREKKER_PROFILE
        };

        setProfile(initial);
        setDisplayName(initial.displayName);
        setPhotoURL(initial.photoURL || user.photoURL || '');
        setPhone(initial.phone || '');
        setCity(initial.city || 'Bengaluru');
        setExperienceLevel(initial.experienceLevel);
        setPreferredDifficulty(initial.preferredDifficulty);
        setPreferredTrekTypes(initial.preferredTrekTypes || []);
        setFitnessLevel(initial.fitnessLevel);
        setTypicalDistanceKm(initial.typicalDistanceKm || 10);
        setMaxElevationMeters(initial.maxElevationMeters || 1800);

        setEmergencyName(initial.emergencyContact?.name || '');
        setEmergencyRelationship(initial.emergencyContact?.relationship || 'Family');
        setEmergencyPhone(initial.emergencyContact?.phone || '');

        setWeatherAlerts(initial.preferences?.weatherAlerts ?? true);
        setRiskAlerts(initial.preferences?.riskAlerts ?? true);
        setTrekReminders(initial.preferences?.trekReminders ?? true);
      })
      .catch((err) => {
        console.warn('Error loading trekker profile:', err);
        const fallback: TrekkerProfile = {
          uid: user.uid,
          displayName: user.displayName || user.email?.split('@')[0] || 'Trekker',
          email: user.email || '',
          ...DEFAULT_TREKKER_PROFILE
        };
        setProfile(fallback);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const toggleTrekType = (type: string) => {
    if (preferredTrekTypes.includes(type)) {
      setPreferredTrekTypes(preferredTrekTypes.filter((t) => t !== type));
    } else {
      setPreferredTrekTypes([...preferredTrekTypes, type]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setStatusMessage(null);
    setIsSaving(true);

    const updated: TrekkerProfile = {
      ...profile,
      displayName: displayName.trim() || 'Trekker',
      photoURL: photoURL.trim(),
      phone: phone.trim(),
      city: city.trim(),
      experienceLevel,
      preferredDifficulty,
      preferredTrekTypes,
      fitnessLevel,
      typicalDistanceKm: Number(typicalDistanceKm) || 10,
      maxElevationMeters: Number(maxElevationMeters) || 1500,
      emergencyContact: {
        name: emergencyName.trim(),
        relationship: emergencyRelationship.trim() || 'Family',
        phone: emergencyPhone.trim()
      },
      preferences: {
        weatherAlerts,
        riskAlerts,
        trekReminders
      }
    };

    try {
      await saveTrekkerProfile(updated);
      setProfile(updated);
      setIsEditing(false);
      setStatusMessage({ type: 'success', text: 'Dossier saved to cloud profile.' });
      setTimeout(() => setStatusMessage(null), 3000);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to sync dossier.' });
    } finally {
      setIsSaving(false);
    }
  };

  const currentProfileData: Partial<TrekkerProfile> = isEditing
    ? {
        displayName,
        photoURL,
        email: user.email || '',
        phone,
        city,
        experienceLevel,
        preferredDifficulty,
        preferredTrekTypes,
        fitnessLevel,
        emergencyContact: {
          name: emergencyName,
          relationship: emergencyRelationship,
          phone: emergencyPhone
        }
      }
    : profile || {};

  const completionPercent = calculateProfileCompletion(currentProfileData);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0F1420] border border-white/10 w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#141B2B] flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-orange-400 font-bold block">
              IDENT: {user.uid.slice(0, 8)}
            </span>
            <h2 className="font-display text-base font-bold text-white tracking-tight">
              Explorer Dossier & Biometrics
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && !isLoading && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-400 text-black text-xs font-mono font-bold uppercase transition-all cursor-pointer"
              >
                EDIT DOSSIER
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Readiness Bar */}
        <div className="px-6 py-2.5 bg-black/40 border-b border-white/5 flex items-center justify-between text-xs font-mono">
          <span className="text-white/50">DOSSIER COMPLETION:</span>
          <div className="flex items-center gap-3">
            <div className="w-32 bg-white/10 h-1.5 overflow-hidden">
              <div
                className="h-full bg-orange-500 transition-all duration-300"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="font-bold text-orange-400">{completionPercent}%</span>
          </div>
        </div>

        {/* Message */}
        {statusMessage && (
          <div
            className={`px-6 py-2 text-xs font-mono flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-b border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-300 border-b border-rose-500/20'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-white/50">
              <Loader2 className="w-6 h-6 animate-spin text-orange-400 mx-auto mb-2" />
              Retrieving explorer records...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-5">
              
              {/* 1. Identity */}
              <div className="p-4 bg-[#141B2B] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-orange-400 tracking-wider block border-b border-white/5 pb-1.5">
                  1. IDENTITY & COMMUNICATIONS
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">CALLSIGN / FULL NAME</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      />
                    ) : (
                      <p className="font-bold text-white py-1">{displayName}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">REGISTERED EMAIL</label>
                    <p className="text-white/60 font-mono py-1">{user.email}</p>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">PHONE NUMBER</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      />
                    ) : (
                      <p className="text-white/80 font-mono py-1">{phone || 'None'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">OPERATING BASE / CITY</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      />
                    ) : (
                      <p className="text-white/80 py-1">{city || 'Bengaluru'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Fitness & Conditioning */}
              <div className="p-4 bg-[#141B2B] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-orange-400 tracking-wider block border-b border-white/5 pb-1.5">
                  2. ALPINE EXPERIENCE & BIOMETRIC PROFILE
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">TRAIL GRADE</label>
                    {isEditing ? (
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="Expert">Expert</option>
                      </select>
                    ) : (
                      <p className="font-bold text-white py-1">{experienceLevel}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">CARDIO CAPACITY</label>
                    {isEditing ? (
                      <select
                        value={fitnessLevel}
                        onChange={(e) => setFitnessLevel(e.target.value as any)}
                        className="w-full px-2 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      >
                        <option value="Low / Leisure">Low / Leisure</option>
                        <option value="Moderate">Moderate</option>
                        <option value="High">High</option>
                        <option value="Athletic / Endurance">Athletic / Ultra</option>
                      </select>
                    ) : (
                      <p className="font-bold text-white py-1">{fitnessLevel}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">MAX ALTITUDE EXPOSURE</label>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={maxElevationMeters}
                          onChange={(e) => setMaxElevationMeters(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                        />
                        <span className="text-white/40 font-mono text-xs">m</span>
                      </div>
                    ) : (
                      <p className="font-bold text-white py-1">{maxElevationMeters}m MSL</p>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[9px] font-mono text-white/50 block mb-1.5">TERRAIN SPECIALIZATIONS</label>
                  <div className="flex flex-wrap gap-1">
                    {TREK_TYPES_OPTIONS.map((t) => {
                      const isSel = preferredTrekTypes.includes(t);
                      return (
                        <button
                          key={t}
                          type="button"
                          disabled={!isEditing}
                          onClick={() => toggleTrekType(t)}
                          className={`px-2.5 py-1 text-[10px] font-mono transition-all ${
                            isSel
                              ? 'bg-orange-500 text-black font-bold'
                              : 'bg-white/5 text-white/50 border border-white/5'
                          } ${!isEditing ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. ICE Emergency Contacts */}
              <div className="p-4 bg-[#141B2B] border border-white/5 space-y-3">
                <span className="text-[10px] font-mono font-bold uppercase text-rose-400 tracking-wider block border-b border-white/5 pb-1.5 flex items-center justify-between">
                  <span>3. IN CASE OF EMERGENCY (I.C.E.)</span>
                  <HeartPulse className="w-3.5 h-3.5" />
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">CONTACT NAME</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      />
                    ) : (
                      <p className="font-bold text-white py-1">{emergencyName || 'None'}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">RELATIONSHIP</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      />
                    ) : (
                      <p className="text-white/80 py-1">{emergencyRelationship}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-white/50 block mb-1">EMERGENCY PHONE</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#090D15] border border-white/10 text-white font-mono text-xs focus:border-orange-500 outline-hidden"
                      />
                    ) : (
                      <p className="text-white/80 font-mono py-1">{emergencyPhone || 'Not set'}</p>
                    )}
                  </div>
                </div>
              </div>

              {isEditing && (
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-white/10 text-white/60 hover:text-white text-xs font-mono cursor-pointer"
                  >
                    DISCARD
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-orange-500 hover:bg-orange-400 text-black font-mono font-bold text-xs uppercase cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? 'SYNCHRONIZING...' : 'SAVE DOSSIER'}
                  </button>
                </div>
              )}

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#141B2B] flex items-center justify-between text-[10px] font-mono text-white/40">
          <span>UID: {user.uid}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-mono cursor-pointer transition-colors"
          >
            CLOSE
          </button>
        </div>

      </div>
    </div>
  );
};

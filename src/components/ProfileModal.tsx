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
  Mail,
  Phone,
  MapPin,
  Mountain,
  Compass,
  Activity,
  HeartPulse,
  Bell,
  Shield,
  Save,
  CheckCircle,
  AlertCircle,
  Loader2,
  Camera,
  Layers,
  Sparkles,
  ArrowRight
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

  // Form State
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

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('Family');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Notification Preferences
  const [weatherAlerts, setWeatherAlerts] = useState(true);
  const [riskAlerts, setRiskAlerts] = useState(true);
  const [trekReminders, setTrekReminders] = useState(true);

  // Load Profile from Firestore
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
        // Fallback to local default
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
      setStatusMessage({ type: 'success', text: 'Personal trekker profile saved successfully!' });
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (err: any) {
      console.error('Failed to save profile:', err);
      setStatusMessage({ type: 'error', text: err.message || 'Failed to save changes. Please try again.' });
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center font-bold shadow-2xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#243B2A] uppercase tracking-wider flex items-center gap-2">
                Personal Trekker Profile
              </h2>
              <p className="text-xs text-[#526B4F]">
                Manage your alpine preferences, fitness level, and safety contacts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing && !isLoading && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-3 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <span>Edit Profile</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Completion Bar */}
        <div className="px-6 py-3 bg-[#FAF8F3]/80 border-b border-[#EAE6D8] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs">
            <Sparkles className="w-4 h-4 text-[#D7A84A]" />
            <span className="font-bold text-[#243B2A]">Profile Readiness:</span>
            <span className="text-[#526B4F] hidden sm:inline">
              {completionPercent === 100
                ? 'All safety credentials & trail preferences complete!'
                : 'Complete your profile for personalized trail risk analysis'}
            </span>
          </div>

          <div className="flex items-center gap-2.5">
            <div className="w-28 sm:w-36 bg-[#E8E4D8] h-2 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  completionPercent === 100 ? 'bg-emerald-600' : 'bg-[#243B2A]'
                }`}
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#1F2520]">
              {completionPercent}%
            </span>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`px-6 py-2.5 text-xs flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
                : 'bg-red-50 text-red-800 border-b border-red-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="text-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#243B2A] mx-auto" />
              <p className="text-xs text-[#526B4F]">Loading your personal trekker records...</p>
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* 1. Identity & Contact Details */}
              <div className="bg-[#FAF8F3] border border-[#EAE6D8] rounded-xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-[#EAE6D8] pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#526B4F]" /> Basic Identity & Contact
                  </h3>
                  <span className="text-[10px] text-[#6B7262] font-mono">UID: {user.uid.slice(0, 8)}...</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Avatar Photo */}
                  <div className="flex flex-col items-center gap-2 shrink-0">
                    <div className="w-20 h-20 rounded-2xl bg-[#243B2A] text-[#FAF8F3] overflow-hidden border-2 border-[#D5D0C0] flex items-center justify-center relative shadow-sm">
                      {photoURL ? (
                        <img
                          src={photoURL}
                          alt={displayName}
                          className="w-full h-full object-cover"
                          onError={() => setPhotoURL('')}
                        />
                      ) : (
                        <span className="text-2xl font-bold uppercase">
                          {(displayName || user.email || 'T')[0]}
                        </span>
                      )}
                    </div>
                    {isEditing && (
                      <span className="text-[10px] text-[#526B4F]">Photo URL below</span>
                    )}
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 flex-1 w-full">
                    {/* Display Name */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                        Full Name / Moniker
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="e.g. Abhilash H"
                          className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                        />
                      ) : (
                        <p className="text-xs font-bold text-[#1F2520] py-1">
                          {displayName || 'Not specified'}
                        </p>
                      )}
                    </div>

                    {/* Email (Read-only Auth) */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                        Email Address
                      </label>
                      <p className="text-xs text-[#526B4F] py-1 font-mono flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-[#8C8675]" />
                        {user.email || 'No email associated'}
                      </p>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+91 98765 43210"
                          className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                        />
                      ) : (
                        <p className="text-xs text-[#1F2520] py-1 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#526B4F]" />
                          {phone || 'Not provided'}
                        </p>
                      )}
                    </div>

                    {/* Home City */}
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                        Home City / Trek Hub
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="e.g. Bengaluru, Kolar"
                          className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                        />
                      ) : (
                        <p className="text-xs text-[#1F2520] py-1 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#526B4F]" />
                          {city || 'Bengaluru'}
                        </p>
                      )}
                    </div>

                    {/* Profile Photo URL (when editing) */}
                    {isEditing && (
                      <div className="sm:col-span-2">
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                          Avatar / Profile Photo URL
                        </label>
                        <input
                          type="url"
                          value={photoURL}
                          onChange={(e) => setPhotoURL(e.target.value)}
                          placeholder="https://images.unsplash.com/... or direct image link"
                          className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Trekking Experience & Fitness */}
              <div className="bg-[#FAF8F3] border border-[#EAE6D8] rounded-xl p-4 sm:p-5 space-y-4">
                <div className="border-b border-[#EAE6D8] pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-1.5">
                    <Mountain className="w-3.5 h-3.5 text-[#526B4F]" /> Trail Experience & Physical Conditioning
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {/* Experience Level */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Experience Level
                    </label>
                    {isEditing ? (
                      <select
                        value={experienceLevel}
                        onChange={(e) => setExperienceLevel(e.target.value as TrekExperienceLevel)}
                        className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs cursor-pointer"
                      >
                        <option value="Beginner">Beginner (1-3 easy treks)</option>
                        <option value="Intermediate">Intermediate (Monoliths & ridges)</option>
                        <option value="Advanced">Advanced (Western Ghats & Himalayas)</option>
                        <option value="Expert">Expert (High-altitude expeditions)</option>
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-[#D5D0C0] text-xs font-bold text-[#243B2A]">
                        {experienceLevel}
                      </span>
                    )}
                  </div>

                  {/* Preferred Difficulty */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Preferred Difficulty
                    </label>
                    {isEditing ? (
                      <select
                        value={preferredDifficulty}
                        onChange={(e) => setPreferredDifficulty(e.target.value as PreferredDifficulty)}
                        className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs cursor-pointer"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Challenging">Challenging</option>
                        <option value="Strenuous">Strenuous</option>
                        <option value="Expert">Expert</option>
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-[#D5D0C0] text-xs font-bold text-[#243B2A]">
                        {preferredDifficulty}
                      </span>
                    )}
                  </div>

                  {/* Fitness Level */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Cardio & Fitness Level
                    </label>
                    {isEditing ? (
                      <select
                        value={fitnessLevel}
                        onChange={(e) => setFitnessLevel(e.target.value as FitnessLevel)}
                        className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs cursor-pointer"
                      >
                        <option value="Low / Leisure">Low / Leisure</option>
                        <option value="Moderate">Moderate (Jogging / Weekend hikes)</option>
                        <option value="High">High (Regular cardio & endurance)</option>
                        <option value="Athletic / Endurance">Athletic / Ultra Endurance</option>
                      </select>
                    ) : (
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-white border border-[#D5D0C0] text-xs font-bold text-[#243B2A]">
                        {fitnessLevel}
                      </span>
                    )}
                  </div>

                  {/* Typical Distance */}
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Typical Trek Distance
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={2}
                          max={60}
                          value={typicalDistanceKm}
                          onChange={(e) => setTypicalDistanceKm(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                        />
                        <span className="text-xs text-[#526B4F] font-bold">km</span>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-[#1F2520] py-1">
                        ~{typicalDistanceKm} km per trek
                      </p>
                    )}
                  </div>

                  {/* Elevation Experience */}
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Max Elevation Experience
                    </label>
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={200}
                          max={7500}
                          step={50}
                          value={maxElevationMeters}
                          onChange={(e) => setMaxElevationMeters(Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                        />
                        <span className="text-xs text-[#526B4F] font-bold">meters</span>
                      </div>
                    ) : (
                      <p className="text-xs font-bold text-[#1F2520] py-1">
                        Up to {maxElevationMeters}m altitude
                      </p>
                    )}
                  </div>
                </div>

                {/* Preferred Trek Types */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-2">
                    Preferred Trek Types & Terrains
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {TREK_TYPES_OPTIONS.map((type) => {
                      const isSelected = preferredTrekTypes.includes(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          disabled={!isEditing}
                          onClick={() => toggleTrekType(type)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                            isSelected
                              ? 'bg-[#243B2A] text-white border border-[#243B2A] shadow-xs'
                              : 'bg-white text-[#526B4F] border border-[#D5D0C0] hover:border-[#243B2A]'
                          } ${!isEditing ? 'cursor-default opacity-90' : 'cursor-pointer'}`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Emergency Contact Details */}
              <div className="bg-[#FAF8F3] border border-[#EAE6D8] rounded-xl p-4 sm:p-5 space-y-4">
                <div className="border-b border-[#EAE6D8] pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-1.5">
                    <HeartPulse className="w-3.5 h-3.5 text-red-600" /> Emergency Safety Contact
                  </h3>
                  <p className="text-[11px] text-[#526B4F] mt-0.5">
                    Contact details displayed for trail check-in and distress notifications during adverse weather.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Contact Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyName}
                        onChange={(e) => setEmergencyName(e.target.value)}
                        placeholder="e.g. Sarah H"
                        className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                      />
                    ) : (
                      <p className="text-xs font-bold text-[#1F2520] py-1">
                        {emergencyName || 'None listed'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Relationship
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={emergencyRelationship}
                        onChange={(e) => setEmergencyRelationship(e.target.value)}
                        placeholder="e.g. Spouse / Sibling / Friend"
                        className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                      />
                    ) : (
                      <p className="text-xs text-[#526B4F] py-1">
                        {emergencyRelationship || 'Family'}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-[#243B2A] mb-1">
                      Emergency Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={emergencyPhone}
                        onChange={(e) => setEmergencyPhone(e.target.value)}
                        placeholder="+91 99000 11223"
                        className="w-full px-3 py-2 bg-white border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-xs font-medium text-[#1F2520] outline-hidden shadow-2xs"
                      />
                    ) : (
                      <p className="text-xs font-mono font-bold text-[#1F2520] py-1">
                        {emergencyPhone || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 4. Alert Preferences */}
              <div className="bg-[#FAF8F3] border border-[#EAE6D8] rounded-xl p-4 sm:p-5 space-y-3">
                <div className="border-b border-[#EAE6D8] pb-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#243B2A] flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-[#526B4F]" /> Weather & Risk Alert Preferences
                  </h3>
                </div>

                <div className="space-y-2.5">
                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#EAE6D8] cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-[#1F2520]">Severe Weather & Gale Alerts</p>
                      <p className="text-[11px] text-[#526B4F]">Receive instant warnings when high gusts or thunderstorms threaten selected summits.</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      checked={weatherAlerts}
                      onChange={(e) => setWeatherAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#243B2A] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#EAE6D8] cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-[#1F2520]">High Risk Model Advisory</p>
                      <p className="text-[11px] text-[#526B4F]">Prioritize gear warnings when trail safety model predicts score above 65.</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      checked={riskAlerts}
                      onChange={(e) => setRiskAlerts(e.target.checked)}
                      className="w-4 h-4 accent-[#243B2A] cursor-pointer"
                    />
                  </label>

                  <label className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-[#EAE6D8] cursor-pointer">
                    <div>
                      <p className="text-xs font-bold text-[#1F2520]">Pre-Trek Packing Reminders</p>
                      <p className="text-[11px] text-[#526B4F]">Remind 24 hours prior to check off required hydration, footwear, and thermal layers.</p>
                    </div>
                    <input
                      type="checkbox"
                      disabled={!isEditing}
                      checked={trekReminders}
                      onChange={(e) => setTrekReminders(e.target.checked)}
                      className="w-4 h-4 accent-[#243B2A] cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Action Buttons when editing */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => {
                      setIsEditing(false);
                      setStatusMessage(null);
                    }}
                    className="px-4 py-2 border border-[#D5D0C0] hover:bg-[#FAF8F3] text-[#526B4F] rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D7A84A]" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5 text-[#D7A84A]" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              )}

            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E4E0D2] bg-[#FAF8F3] flex justify-between items-center text-xs text-[#6B7262]">
          <span>Profile secured via Firebase Firestore. Encrypted under UID: {user.uid.slice(0, 12)}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

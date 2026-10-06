import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  Loader2,
  CheckCircle,
  Compass
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { loginWithEmail, registerWithEmail, loginWithGoogle } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name or callsign.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg('Password should be at least 6 characters.');
        return;
      }
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
        setSuccessMsg('Session authenticated. Access granted.');
      } else {
        await registerWithEmail(name, email, password);
        setSuccessMsg('Callsign registered! Welcome to ApexTrail OS.');
      }

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 700);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid credentials.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email already registered. Switch to Sign In.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase Console Settings.');
      } else {
        setErrorMsg(err.message || 'Authentication failed.');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      setIsLoading(false);
      onClose();
    } catch (err: any) {
      setIsLoading(false);
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('Domain not authorized in Firebase settings.');
      } else if (err.code !== 'auth/popup-closed-by-user') {
        setErrorMsg(err.message || 'Google sign-in error.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-sm">
      <div className="bg-[#0F1420] border border-white/10 w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 bg-[#141B2B] flex items-center justify-between">
          <div>
            <span className="font-mono text-[9px] tracking-widest uppercase text-orange-400 font-bold block">
              ACCESS PROTOCOL
            </span>
            <h2 className="font-display text-base font-bold text-white tracking-tight">
              {mode === 'login' ? 'Authenticate Explorer' : 'Register New Callsign'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 hover:bg-white/10 text-white/60 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-2 border-b border-white/10 bg-black/40 text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-center transition-all cursor-pointer ${
              mode === 'login'
                ? 'border-b-2 border-orange-500 text-orange-400 font-bold bg-white/[0.02]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-2.5 text-center transition-all cursor-pointer ${
              mode === 'register'
                ? 'border-b-2 border-orange-500 text-orange-400 font-bold bg-white/[0.02]'
                : 'text-white/40 hover:text-white'
            }`}
          >
            REGISTER
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          
          {errorMsg && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-mono flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Google Quick Sign-In */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white text-xs font-mono font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>CONTINUE WITH GOOGLE AUTH</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-white/10 w-full"></div>
            <span className="bg-[#0F1420] px-2 text-[9px] font-mono uppercase tracking-widest text-white/40 relative">
              OR CREDENTIALS
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                  CALLSIGN / NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Victor Peak"
                  className="w-full px-3 py-2 bg-[#090D15] border border-white/10 focus:border-orange-500 text-xs font-mono text-white outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="explorer@apex.org"
                className="w-full px-3 py-2 bg-[#090D15] border border-white/10 focus:border-orange-500 text-xs font-mono text-white outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                PASSWORD
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[#090D15] border border-white/10 focus:border-orange-500 text-xs font-mono text-white outline-hidden"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-[9px] font-mono uppercase tracking-widest text-white/50 mb-1">
                  CONFIRM PASSWORD
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#090D15] border border-white/10 focus:border-orange-500 text-xs font-mono text-white outline-hidden"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-orange-500 hover:bg-orange-400 text-black text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>AUTHENTICATING...</span>
                </>
              ) : mode === 'login' ? (
                <span>CONFIRM SIGN-IN</span>
              ) : (
                <span>CREATE PROFILE</span>
              )}
            </button>
          </form>

        </div>

      </div>
    </div>
  );
};

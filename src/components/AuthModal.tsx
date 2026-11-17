import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  X,
  AlertCircle,
  Loader2,
  CheckCircle,
  Mountain
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

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'register') {
      if (!name.trim()) {
        setErrorMsg('Please enter your full name.');
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
        setSuccessMsg('Signed in successfully.');
      } else {
        await registerWithEmail(name, email, password);
        setSuccessMsg('Account created! Welcome to TrekSafe AI.');
      }

      setTimeout(() => {
        setIsLoading(false);
        onClose();
      }, 650);
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Auth error:', err);
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        setErrorMsg('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('This email is already registered. Please sign in.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password must be at least 6 characters.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMsg('This domain is not yet authorized in Firebase Console settings.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/50 backdrop-blur-xs">
      <div className="bg-white border border-[#E4E0D2] rounded-2xl w-full max-w-md flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E0D2] bg-[#FAF8F3] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#243B2A] text-[#D7A84A] flex items-center justify-center">
              <Mountain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#243B2A]">
                {mode === 'login' ? 'Sign In to TrekSafe AI' : 'Create Trekker Account'}
              </h2>
              <p className="text-xs text-[#526B4F]">
                Save trails & personalize your safety profile
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-[#EAE6D8] text-[#526B4F] flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 border-b border-[#E4E0D2] bg-[#FAF8F3]/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-3 text-center transition-all cursor-pointer border-b-2 ${
              mode === 'login'
                ? 'border-[#243B2A] text-[#243B2A] bg-white'
                : 'border-transparent text-[#6B7262] hover:text-[#243B2A]'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg(null);
            }}
            className={`py-3 text-center transition-all cursor-pointer border-b-2 ${
              mode === 'register'
                ? 'border-[#243B2A] text-[#243B2A] bg-white'
                : 'border-transparent text-[#6B7262] hover:text-[#243B2A]'
            }`}
          >
            Register
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-[#FDECEC] border border-[#F5C2C2] text-[#991B1B] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-[#EBF3EC] border border-[#C5DEC9] text-[#2E5A36] text-xs flex items-start gap-2">
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#FAF8F3] hover:bg-[#EAE6D8] border border-[#D5D0C0] rounded-xl text-[#243B2A] text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <span>Continue with Google</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#E4E0D2] w-full" />
            <span className="bg-white px-3 text-[11px] font-medium text-[#8C8675] relative shrink-0">
              or with email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#526B4F] mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-sm text-[#1F2520] outline-hidden"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-[#526B4F] mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="trekker@example.com"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-sm text-[#1F2520] outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#526B4F] mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-sm text-[#1F2520] outline-hidden"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-[#526B4F] mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-[#FAF8F3] border border-[#D5D0C0] focus:border-[#243B2A] rounded-xl text-sm text-[#1F2520] outline-hidden"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-2.5 bg-[#243B2A] hover:bg-[#1A2C1F] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Please wait...</span>
                </>
              ) : mode === 'login' ? (
                <span>Sign In</span>
              ) : (
                <span>Create Account</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

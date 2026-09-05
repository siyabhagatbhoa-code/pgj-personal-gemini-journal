import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { GeminiLogo } from './GeminiLogo';

interface AuthScreenProps {
  initialIsSignUp?: boolean;
  onBackToHome?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ initialIsSignUp = false, onBackToHome }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [isSignUp, setIsSignUp] = useState(initialIsSignUp);

  useEffect(() => {
    setIsSignUp(initialIsSignUp);
  }, [initialIsSignUp]);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Email format validation
  const trimmedEmail = email.trim();
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);
  const hasEmailInput = trimmedEmail.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate email format
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }

    if (!isEmailValid) {
      setError('Please enter a valid email address (example: name@gmail.com).');
      return;
    }

    if (isSignUp) {
      if (!fullName.trim()) {
        setError('Please enter your name.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match. Please re-enter your password.');
        return;
      }
      if (!agreedToTerms) {
        setError('Please agree to the privacy terms to continue.');
        return;
      }

      setLoading(true);
      try {
        await signUpWithEmail(trimmedEmail, password, fullName.trim());
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Failed to create account.';
        if (msg.includes('email-already-in-use')) {
          setError('An account with this email already exists. Please log in instead.');
        } else if (msg.includes('invalid-email')) {
          setError('The email address is not valid. Please check and try again.');
        } else if (msg.includes('weak-password')) {
          setError('Password is too weak. Please use at least 6 characters.');
        } else {
          setError(msg.replace('Firebase: ', ''));
        }
      } finally {
        setLoading(false);
      }
    } else {
      if (!password) {
        setError('Please enter your password.');
        return;
      }

      setLoading(true);
      try {
        await signInWithEmail(trimmedEmail, password);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Invalid credentials. Please try again.';
        if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
          setError('Incorrect email or password. Please try again.');
        } else if (msg.includes('too-many-requests')) {
          setError('Too many attempts. Please wait a few moments and try again.');
        } else {
          setError(msg.replace('Firebase: ', ''));
        }
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed.';
      if (msg.includes('unauthorized-domain')) {
        setError(
          'Google Sign-In domain error: "pgj-personal-gemini-journal.onrender.com" is not authorized in Firebase Console. Please add this domain under Firebase Console -> Authentication -> Settings -> Authorized domains.'
        );
      } else if (msg.includes('popup-closed-by-user')) {
        setError('Google sign-in window was closed before completing. Please try again.');
      } else if (msg.includes('popup-blocked')) {
        setError('Google sign-in popup was blocked by your browser. Please allow popups for this site.');
      } else {
        setError(msg.replace('Firebase: ', ''));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 md:p-8">
      {/* Centered Glass Card replicating Image 1 */}
      <div className="w-full max-w-[540px] rounded-3xl bg-white/75 backdrop-blur-2xl p-6 sm:p-10 border border-white/80 shadow-[0_20px_60px_-15px_rgba(107,56,212,0.15),0_1px_2px_rgba(255,255,255,0.95)_inset] flex flex-col items-center text-center relative overflow-hidden">
        {onBackToHome && (
          <button
            type="button"
            onClick={onBackToHome}
            className="absolute top-5 left-5 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-purple-700 transition-colors px-2.5 py-1 rounded-full hover:bg-purple-50/60"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Home</span>
          </button>
        )}

        {/* Soft Ambient Inner Highlight */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-purple-200/40 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-sky-200/40 blur-3xl pointer-events-none" />

        {/* 3D Glass Badge Logo */}
        <div className="mb-4 relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-100/90 via-pink-50/80 to-sky-100/90 p-1 border border-white/90 shadow-[0_8px_24px_rgba(107,56,212,0.12),0_1px_2px_rgba(255,255,255,0.9)_inset] flex items-center justify-center">
            <div className="flex flex-col items-center">
              <GeminiLogo size={26} />
              <span className="text-[10px] font-bold text-purple-700 tracking-wider mt-0.5">PGJ</span>
            </div>
          </div>
        </div>

        {/* Header Pill */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold tracking-wider uppercase mb-3">
          <span className="material-symbols-outlined text-[14px]">auto_awesome</span>
          <span>{isSignUp ? 'New Account' : 'Welcome Back'}</span>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-2">
          {isSignUp ? 'Create your journal account' : 'Log in to your journal'}
        </h1>
        <p className="text-sm text-slate-600 max-w-sm mb-6 leading-relaxed">
          Chat freely with Gemini AI. 100% private, safe, and stored securely.
        </p>

        {/* Error Notification */}
        {error && (
          <div className="w-full mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200/60 text-rose-700 text-xs text-left flex items-start gap-2 animate-fadeIn">
            <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">error</span>
            <span>{error}</span>
          </div>
        )}

        {/* Form Inputs */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 text-left">
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="auth-name">
                Your Name
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">
                  person
                </span>
                <input
                  id="auth-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-md text-sm text-slate-800 border border-slate-200/70 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all"
                />
              </div>
            </div>
          )}

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700" htmlFor="auth-email">
                Email Address
              </label>
              {hasEmailInput && (
                <span className={`text-[11px] font-medium flex items-center gap-0.5 ${isEmailValid ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isEmailValid ? (
                    <>
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      <span>Valid email</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[14px]">info</span>
                      <span>Invalid format</span>
                    </>
                  )}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">
                alternate_email
              </span>
              <input
                id="auth-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@gmail.com"
                required
                className={`w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/90 backdrop-blur-md text-sm text-slate-800 border transition-all ${
                  hasEmailInput
                    ? isEmailValid
                      ? 'border-emerald-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      : 'border-amber-300 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
                    : 'border-slate-200/70 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20'
                } shadow-sm`}
              />
              {hasEmailInput && (
                <span
                  className={`absolute right-3 material-symbols-outlined text-[18px] ${
                    isEmailValid ? 'text-emerald-500' : 'text-amber-500'
                  }`}
                >
                  {isEmailValid ? 'check_circle' : 'error'}
                </span>
              )}
            </div>
            {hasEmailInput && !isEmailValid && (
              <span className="text-[11px] text-amber-600 -mt-0.5">
                Please enter a full email address like yourname@gmail.com
              </span>
            )}
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700" htmlFor="auth-password">
                {isSignUp ? 'Create Password' : 'Password'}
              </label>
              {isSignUp && <span className="text-[11px] text-slate-500">At least 6 characters</span>}
            </div>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">
                lock
              </span>
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                required
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/90 backdrop-blur-md text-sm text-slate-800 border border-slate-200/70 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-600 transition-colors"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                <span className="material-symbols-outlined text-[18px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Confirm Password in Sign Up */}
          {isSignUp && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700" htmlFor="auth-confirm">
                Confirm Password
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3.5 material-symbols-outlined text-slate-400 text-[18px]">
                  shield
                </span>
                <input
                  id="auth-confirm"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/90 backdrop-blur-md text-sm text-slate-800 border border-slate-200/70 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 shadow-sm transition-all"
                />
              </div>
            </div>
          )}

          {/* Privacy Terms Agreement */}
          {isSignUp && (
            <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-xs text-slate-600 leading-snug">
                I agree to the{' '}
                <span className="text-purple-700 font-semibold underline decoration-purple-300">
                  Privacy Policy & Terms of Service
                </span>{' '}
                (Your entries remain 100% private).
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-6 rounded-full bg-gradient-to-r from-purple-600 via-purple-700 to-fuchsia-600 text-white font-semibold text-sm shadow-[0_6px_20px_rgba(107,56,212,0.35),0_1px_1px_rgba(255,255,255,0.4)_inset] hover:opacity-95 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                <span>Please wait...</span>
              </span>
            ) : (
              <>
                <span>{isSignUp ? 'Create Account' : 'Log In'}</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-slate-200/80" />
          <span className="absolute px-3 py-0.5 rounded-full bg-slate-100/90 text-[10px] font-semibold text-slate-500 uppercase tracking-wider backdrop-blur-md">
            or continue with
          </span>
        </div>

        {/* Google Sign In Button */}
        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          type="button"
          className="w-full py-2.5 px-5 rounded-full bg-white/90 hover:bg-white text-slate-700 text-sm font-semibold border border-slate-200/80 shadow-sm hover:shadow transition-all flex items-center justify-center gap-2.5 active:scale-[0.99]"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Toggle Mode */}
        <div className="mt-5 text-xs text-slate-600">
          {isSignUp ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className="text-purple-700 font-semibold hover:underline"
              >
                Log in here →
              </button>
            </span>
          ) : (
            <span>
              Don&apos;t have an account yet?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className="text-purple-700 font-semibold hover:underline"
              >
                Sign up here →
              </button>
            </span>
          )}
        </div>

        {/* Trust Badges */}
        <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-purple-600">lock</span>
            <span>100% Private</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-emerald-600">verified_user</span>
            <span>Zero ad tracking</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-sky-600">psychology</span>
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, Mail, ArrowRight, CheckCircle2, Lock, Sparkles,
  RefreshCw, Check, X, KeyRound, AlertCircle, User, Settings, ExternalLink
} from 'lucide-react';
import {
  loginWithGooglePopup,
  hasFirebaseConfig,
  saveFirebaseConfig,
  getFirebaseConfig,
  clearFirebaseConfig
} from '../firebase';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export default function AuthModal({
  isOpen,
  onClose,
  onLoginSuccess,
  onToast,
  canClose = true
}) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [devOtpPreview, setDevOtpPreview] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  // Google / Firebase State
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showFirebaseConfig, setShowFirebaseConfig] = useState(false);
  const [rawFirebaseConfigInput, setRawFirebaseConfigInput] = useState('');
  const [firebaseConfigured, setFirebaseConfigured] = useState(hasFirebaseConfig());
  const googleBtnRef = useRef(null);
  const otpInputRefs = useRef([]);

  // Check config on modal open
  useEffect(() => {
    if (isOpen) {
      setFirebaseConfigured(hasFirebaseConfig());
    }
  }, [isOpen]);

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Real Google Account Sign-In via Firebase Popup (accounts.google.com)
  const handleFirebaseGoogleLogin = async () => {
    setGoogleLoading(true);
    setErrorMsg(null);

    // If Firebase configuration is not present, open the fast configuration helper
    if (!hasFirebaseConfig()) {
      setShowFirebaseConfig(true);
      setGoogleLoading(false);
      return;
    }

    try {
      const googleUser = await loginWithGooglePopup();
      if (!googleUser || !googleUser.email) {
        throw new Error('Google sign-in was cancelled or failed to retrieve email.');
      }

      // Sync verified Google user with backend/serverless database
      const res = await fetch(`${API_BASE}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: googleUser.email,
          name: googleUser.displayName,
          picture: googleUser.photoURL,
          token: googleUser.idToken,
          stay_signed_in: rememberMe,
          provider: 'google'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'Failed to authenticate Google user');
      }

      const data = await res.json();
      finishLogin(data.user);
    } catch (e) {
      console.error('Firebase Google Auth error:', e);
      if (e.code === 'auth/popup-closed-by-user') {
        setErrorMsg('Sign-in popup was closed before completing. Please try again.');
      } else if (e.code === 'auth/configuration-not-found' || e.code === 'auth/invalid-api-key') {
        setErrorMsg('Invalid Firebase configuration. Please update your Firebase API keys.');
        setShowFirebaseConfig(true);
      } else if (e.code === 'auth/unauthorized-domain') {
        setErrorMsg(`Domain not authorized. Please add "${window.location.hostname}" to Authorized Domains in Firebase Console > Authentication > Settings.`);
      } else {
        setErrorMsg(e.message || 'Google account sign-in error');
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Helper to parse and save user's Firebase config
  const handleSaveFirebaseConfig = (e) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    try {
      let configObj = null;
      const text = rawFirebaseConfigInput.trim();

      if (text.startsWith('{') && text.endsWith('}')) {
        configObj = JSON.parse(text);
      } else {
        // Parse JS snippet format: const firebaseConfig = { apiKey: "...", ... }
        const extractField = (fieldName) => {
          const match = text.match(new RegExp(`${fieldName}:\\s*["']([^"']+)["']`));
          return match ? match[1] : null;
        };

        const apiKey = extractField('apiKey');
        const authDomain = extractField('authDomain');
        const projectId = extractField('projectId');
        const storageBucket = extractField('storageBucket');
        const messagingSenderId = extractField('messagingSenderId');
        const appId = extractField('appId');

        if (apiKey && authDomain) {
          configObj = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
        }
      }

      if (!configObj || !configObj.apiKey || !configObj.authDomain) {
        throw new Error('Please paste valid Firebase configuration containing at least apiKey and authDomain.');
      }

      saveFirebaseConfig(configObj);
      setFirebaseConfigured(true);
      setShowFirebaseConfig(false);
      setRawFirebaseConfigInput('');

      if (onToast) {
        onToast('Firebase configured! Opening real Google popup...');
      }

      // Immediately launch the real Google popup window
      setTimeout(() => {
        handleFirebaseGoogleLogin();
      }, 200);
    } catch (err) {
      setErrorMsg(err.message || 'Could not parse Firebase configuration format.');
    }
  };

  // 1. Send OTP Code to Email
  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setOtpLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: name.trim() || cleanEmail.split('@')[0],
          type: mode
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'Failed to send OTP code');
      }

      const data = await res.json();
      setOtpSent(true);
      setResendCooldown(60);
      if (data.dev_otp) {
        setDevOtpPreview(data.dev_otp);
      }

      if (onToast) {
        onToast(`📬 Verification code sent to ${cleanEmail}`);
      }

      // Auto-focus first digit input box
      setTimeout(() => {
        if (otpInputRefs.current[0]) {
          otpInputRefs.current[0].focus();
        }
      }, 100);

    } catch (e) {
      setErrorMsg(e.message || 'Unable to dispatch verification email');
    } finally {
      setOtpLoading(false);
    }
  };

  // 2. Handle 6-Digit OTP Input
  const handleDigitChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...otpDigits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setOtpDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        if (otpInputRefs.current[nextIndex]) {
          otpInputRefs.current[nextIndex].focus();
        }
        if (pasted.length === 6) {
          triggerVerification(newDigits.join(''));
        }
        return;
      }
    }

    const singleDigit = value.replace(/\D/g, '').slice(-1);
    const newDigits = [...otpDigits];
    newDigits[index] = singleDigit;
    setOtpDigits(newDigits);

    if (singleDigit && index < 5) {
      if (otpInputRefs.current[index + 1]) {
        otpInputRefs.current[index + 1].focus();
      }
    }

    if (singleDigit && index === 5) {
      const fullOtp = newDigits.join('');
      if (fullOtp.length === 6) {
        triggerVerification(fullOtp);
      }
    }
  };

  const handleDigitKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const newDigits = [...otpDigits];
      newDigits[index - 1] = '';
      setOtpDigits(newDigits);
      if (otpInputRefs.current[index - 1]) {
        otpInputRefs.current[index - 1].focus();
      }
    }
  };

  // 3. Verify OTP Code
  const triggerVerification = async (codeToVerify) => {
    const cleanEmail = email.trim().toLowerCase();
    const fullCode = codeToVerify || otpDigits.join('');

    if (fullCode.length !== 6) {
      setErrorMsg('Please enter all 6 digits of your verification code');
      return;
    }

    setVerifyLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: fullCode,
          name: name.trim() || cleanEmail.split('@')[0],
          stay_signed_in: rememberMe
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'Invalid or expired verification code');
      }

      const data = await res.json();
      finishLogin(data.user);
    } catch (e) {
      setErrorMsg(e.message || 'Verification failed. Please check code and try again.');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Complete login, save persistence ("never ask again"), and trigger celebration
  const finishLogin = (user) => {
    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch (e) {}

    // Save session in localStorage so it never asks again
    localStorage.setItem('ai_humanizer_user', JSON.stringify(user));
    localStorage.setItem('ai_humanizer_remember', rememberMe ? 'true' : 'false');

    if (onToast) {
      onToast(`🎉 Welcome back, ${user.name || user.email}!`);
    }

    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-scale-in">
      
      {/* Modal Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative transition-colors duration-200">
        
        {/* Close button if user already logged in and just viewing */}
        {canClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition z-10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Header Banner */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800/80 bg-gradient-to-r from-teal-500/10 via-emerald-500/5 to-cyan-500/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0f4c5c] to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 dark:text-white leading-tight">
                {mode === 'signup' ? 'Create Free Account' : 'Welcome to AI Humanizer'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                100% Bypass • SpaCy Entity Locking • 7-Detector Matrix
              </p>
            </div>
          </div>

          {/* Tab Selector: Sign In / Create Account */}
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mt-4">
            <button
              onClick={() => {
                setMode('login');
                setErrorMsg(null);
                setOtpSent(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
                setOtpSent(false);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <div className="flex-1">{errorMsg}</div>
            </div>
          )}

          {/* 1. REAL GOOGLE ACCOUNT AUTHENTICATION (FIREBASE POPUP) */}
          {showFirebaseConfig ? (
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 border border-teal-500/30 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center font-bold text-xs">
                    G
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 dark:text-white">
                    Connect Real Google Sign-In
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFirebaseConfig(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                Paste your Firebase configuration snippet from{' '}
                <a
                  href="https://console.firebase.google.com/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-teal-600 dark:text-teal-400 underline font-semibold inline-flex items-center gap-0.5"
                >
                  Firebase Console <ExternalLink className="w-2.5 h-2.5" />
                </a>{' '}
                (Project Settings ➔ General ➔ Your apps):
              </p>

              <textarea
                value={rawFirebaseConfigInput}
                onChange={(e) => setRawFirebaseConfigInput(e.target.value)}
                placeholder='const firebaseConfig = { apiKey: "AIzaSy...", authDomain: "your-app.firebaseapp.com", projectId: "your-app" };'
                rows={4}
                className="w-full text-[11px] font-mono p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:border-teal-500 transition resize-none"
              />

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSaveFirebaseConfig}
                  className="flex-1 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
                >
                  Save & Open Real Google Popup
                </button>
                <button
                  type="button"
                  onClick={() => setShowFirebaseConfig(false)}
                  className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold text-xs rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleFirebaseGoogleLogin}
                disabled={googleLoading}
                className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/70 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-3 transition shadow-2xs hover:shadow-xs active:scale-[0.99] cursor-pointer disabled:opacity-50"
              >
                {googleLoading ? (
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                )}
                <span>{mode === 'signup' ? 'Sign up with Google (Real Account)' : 'Continue with Google Account'}</span>
              </button>

              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] text-slate-400">
                  {firebaseConfigured ? '✓ Firebase Google Auth active' : 'Real Google accounts.google.com popup'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowFirebaseConfig(true)}
                  className="text-[10px] text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer font-medium"
                >
                  <Settings className="w-2.5 h-2.5" />
                  {firebaseConfigured ? 'Change Firebase Config' : 'Setup Firebase'}
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="relative flex items-center justify-center my-3">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider relative">
              OR EMAIL OTP
            </span>
          </div>

          {/* 2. EMAIL OTP FLOW */}
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-3">
              {mode === 'signup' && (
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Bhanu Srikar"
                      className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com or user@gmail.com"
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition"
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  We'll send a real 6-digit one-time passcode to this email.
                </p>
              </div>

              {/* Remember device checkbox ("Dont ask again") */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="rememberMe"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                />
                <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer font-medium select-none">
                  Stay signed in on this device (Don't ask again)
                </label>
              </div>

              <button
                type="submit"
                disabled={otpLoading || !email.trim()}
                className="w-full py-2.5 bg-[#0f4c5c] hover:bg-[#0c3e4b] dark:bg-teal-600 dark:hover:bg-teal-500 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {otpLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* OTP VERIFICATION STEP */
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 rounded-full text-xs font-semibold text-teal-800 dark:text-teal-300">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Code sent to {email}</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                  Enter the 6-digit code sent to your inbox:
                </p>
              </div>

              {/* 6 Digit Input Blocks */}
              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => otpInputRefs.current[idx] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(idx, e.target.value)}
                    onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                    className="w-12 h-14 text-center font-mono text-xl font-extrabold bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white outline-none focus:border-teal-500 dark:focus:border-teal-400 focus:bg-white dark:focus:bg-slate-900 focus:shadow-md transition"
                  />
                ))}
              </div>

              {/* Instant Dev Preview Helper (Guarantees zero friction in testing) */}
              {devOtpPreview && (
                <div className="p-2.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-xl flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Quick-fill test code: <strong>{devOtpPreview}</strong></span>
                  </div>
                  <button
                    onClick={() => {
                      const arr = devOtpPreview.split('');
                      setOtpDigits(arr);
                      triggerVerification(devOtpPreview);
                    }}
                    className="px-2.5 py-1 bg-amber-200/70 hover:bg-amber-300 dark:bg-amber-800/50 text-amber-900 dark:text-amber-100 rounded-lg font-bold text-[11px] transition cursor-pointer"
                  >
                    Auto-Fill
                  </button>
                </div>
              )}

              {/* Verify Button */}
              <button
                onClick={() => triggerVerification()}
                disabled={verifyLoading || otpDigits.join('').length !== 6}
                className="w-full py-2.5 bg-gradient-to-r from-[#0f4c5c] to-emerald-600 hover:from-[#0d404f] hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {verifyLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Verify & Enter Workspace</span>
                  </>
                )}
              </button>

              {/* Resend & Change Email */}
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtpDigits(['', '', '', '', '', '']);
                    setErrorMsg(null);
                  }}
                  className="hover:text-slate-800 dark:hover:text-white transition cursor-pointer"
                >
                  ← Change email
                </button>

                <button
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || otpLoading}
                  className="text-teal-600 dark:text-teal-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Note */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-500" />
          <span>Once signed in, you won't be asked again on this device.</span>
        </div>

      </div>

    </div>
  );
}

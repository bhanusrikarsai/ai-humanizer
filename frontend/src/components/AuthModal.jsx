import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  ShieldCheck, Mail, ArrowRight, CheckCircle2, Lock, Sparkles,
  RefreshCw, Check, X, KeyRound, AlertCircle, User, Settings, ExternalLink, Trash2
} from 'lucide-react';
import brainLogo from '../assets/logo.png';
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
  canClose = true,
  initialMode = 'signup'
}) {
  const [mode, setMode] = useState(initialMode); // 'signup' first, 'login' next
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // OTP State
  const [otpSent, setOtpSent] = useState(false);
  const [otpToken, setOtpToken] = useState(null);
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState(null);

  // Google Authentication States
  const [googleLoading, setGoogleLoading] = useState(false);
  const [rememberedAccounts, setRememberedAccounts] = useState([]);
  const otpInputRefs = useRef([]);

  // Load remembered accounts from device localStorage and server
  useEffect(() => {
    if (!isOpen) return;

    let localAccs = [];
    try {
      const stored = localStorage.getItem('ai_humanizer_remembered_accounts');
      if (stored) {
        localAccs = JSON.parse(stored) || [];
      } else {
        const single = localStorage.getItem('ai_humanizer_user');
        if (single) {
          const u = JSON.parse(single);
          if (u && u.email) localAccs = [u];
        }
      }
    } catch (e) {}

    if (localAccs.length > 0) {
      setRememberedAccounts(localAccs);
      if (initialMode === 'login' || (!initialMode && localAccs.length > 0)) {
        setMode('login');
      }
    } else {
      setMode(initialMode || 'signup');
    }

    // Also fetch registered accounts from server to ensure complete sync
    fetch(`${API_BASE}/api/auth/saved-accounts`)
      .then(res => res.json())
      .then(data => {
        if (data && data.success && Array.isArray(data.accounts) && data.accounts.length > 0) {
          setRememberedAccounts(prev => {
            const combined = [...prev];
            for (const acc of data.accounts) {
              if (!combined.some(c => (c.email || '').toLowerCase() === (acc.email || '').toLowerCase())) {
                combined.push(acc);
              }
            }
            try {
              localStorage.setItem('ai_humanizer_remembered_accounts', JSON.stringify(combined));
            } catch (e) {}
            return combined;
          });
          if (initialMode === 'login') {
            setMode('login');
          }
        }
      })
      .catch(() => {});
  }, [isOpen, initialMode]);

  // Resend timer countdown
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const getGoogleClientId = () => {
    return localStorage.getItem('ai_humanizer_google_client_id') || import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  };

  // Main Google Sign-In Trigger
  const handleGoogleClick = async () => {
    setErrorMsg(null);

    const clientId = getGoogleClientId();

    // 1. If Google Cloud Client ID is available, open the official accounts.google.com popup window!
    if (clientId && window.google?.accounts?.oauth2) {
      try {
        setGoogleLoading(true);
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile openid',
          callback: async (tokenResponse) => {
            if (tokenResponse.error) {
              setErrorMsg(tokenResponse.error_description || tokenResponse.error || 'Google sign-in cancelled');
              setGoogleLoading(false);
              return;
            }
            try {
              const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
              });
              const profile = await res.json();
              if (!profile.email) {
                throw new Error('Google did not return an email address.');
              }
              await authenticateGoogleAccount(
                profile.email,
                profile.name || profile.given_name,
                profile.picture,
                tokenResponse.access_token
              );
            } catch (err) {
              setErrorMsg(err.message || 'Failed to retrieve Google profile');
              setGoogleLoading(false);
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('GIS Token client error:', err);
        setGoogleLoading(false);
      }
    }

    // 2. If Firebase is configured with active keys, attempt Firebase popup
    if (hasFirebaseConfig()) {
      try {
        setGoogleLoading(true);
        const googleUser = await loginWithGooglePopup();
        if (googleUser && googleUser.email) {
          await authenticateGoogleAccount(
            googleUser.email,
            googleUser.displayName,
            googleUser.photoURL,
            googleUser.idToken
          );
          return;
        }
      } catch (err) {
        console.warn('Firebase popup notice:', err);
      } finally {
        setGoogleLoading(false);
      }
    }

    // 3. Fallback: Prompt user to enter their Google / Gmail address for real OTP verification
    setMode('signup');
    setErrorMsg('Please enter your Google / Gmail address below to receive your 6-digit verification code.');
  };

  // Authenticate Google account with backend/serverless database
  const authenticateGoogleAccount = async (targetEmail, targetName = null, targetPicture = null, idToken = null) => {
    setGoogleLoading(true);
    setErrorMsg(null);

    try {
      const cleanEmail = targetEmail.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
        throw new Error('Please enter a valid Google / Gmail address');
      }

      const formattedName = targetName?.trim() || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const picture = targetPicture || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`;

      const res = await fetch(`${API_BASE}/api/auth/google-login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: formattedName,
          picture,
          token: idToken || `google_oauth_${Date.now()}`,
          stay_signed_in: rememberMe,
          provider: 'google'
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || err.detail || 'Google sign-in failed');
      }

      const data = await res.json();
      setShowGoogleChooser(false);
      finishLogin(data.user);
    } catch (e) {
      setErrorMsg(e.message || 'Google account sign-in error');
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
      if (data.email_sent === false) {
        throw new Error(data.error || data.detail || 'Email delivery failed. Please check your email address.');
      }
      if (data.otp_token) {
        setOtpToken(data.otp_token);
      }
      setOtpSent(true);
      setResendCooldown(60);

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
          otp: fullCode.trim(),
          otp_token: otpToken,
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

    // Add to permanent remembered accounts list on this device
    try {
      const stored = localStorage.getItem('ai_humanizer_remembered_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      const updated = [user, ...accounts.filter(a => a.email !== user.email)];
      localStorage.setItem('ai_humanizer_remembered_accounts', JSON.stringify(updated));
      setRememberedAccounts(updated);
    } catch (e) {}

    if (onToast) {
      onToast(`🎉 Welcome, ${user.name || user.email}!`);
    }

    if (onLoginSuccess) {
      onLoginSuccess(user);
    }
  };

  // Direct Login for Remembered Users (NO OTP NEEDED)
  const handleRememberedLogin = async (targetEmail = null, targetName = null) => {
    const cleanEmail = (targetEmail || email).trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Please enter a valid email address');
      return;
    }

    setVerifyLoading(true);
    setErrorMsg(null);

    // 1. Check local device memory first for instant, reliable login!
    let savedAcc = null;
    try {
      const stored = localStorage.getItem('ai_humanizer_remembered_accounts');
      const accounts = stored ? JSON.parse(stored) : [];
      savedAcc = accounts.find(a => a.email && a.email.toLowerCase() === cleanEmail);
      if (!savedAcc) {
        const single = localStorage.getItem('ai_humanizer_user');
        if (single) {
          const u = JSON.parse(single);
          if (u && u.email && u.email.toLowerCase() === cleanEmail) {
            savedAcc = u;
          }
        }
      }
    } catch (e) {}

    if (savedAcc) {
      // Instantly log in using verified account from this device
      finishLogin(savedAcc);
      // Synchronize with server in the background
      fetch(`${API_BASE}/api/auth/login-remembered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: savedAcc.name || targetName || name,
          saved_user: savedAcc,
          stay_signed_in: rememberMe
        })
      }).catch(() => {});
      setVerifyLoading(false);
      return;
    }

    // 2. Query backend database if not cached on this device
    try {
      const res = await fetch(`${API_BASE}/api/auth/login-remembered`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: targetName || name || cleanEmail.split('@')[0],
          stay_signed_in: rememberMe
        })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorMsg(err.error || err.detail || 'Account not found. You must create an account first by verifying your email with OTP.');
        setEmail(cleanEmail);
        setMode('signup');
        return;
      }

      const data = await res.json();
      finishLogin(data.user);
    } catch (e) {
      setErrorMsg(e.message || 'Account not found. You must create an account first by verifying your email with OTP.');
      setEmail(cleanEmail);
      setMode('signup');
    } finally {
      setVerifyLoading(false);
    }
  };

  // Clear all previous test data on this device and backend
  const handleClearSavedData = async () => {
    try {
      localStorage.removeItem('ai_humanizer_user');
      localStorage.removeItem('ai_humanizer_remembered_accounts');
      localStorage.removeItem('ai_humanizer_remember');
      setRememberedAccounts([]);
      await fetch(`${API_BASE}/api/auth/clear-data`, { method: 'POST' }).catch(() => {});
      if (onToast) onToast('✨ Stored accounts wiped clean. Ready for fresh signups!');
    } catch (e) {}
  };

  // Remove a single saved account from device
  const handleRemoveSingleAccount = (emailToRemove, e) => {
    if (e) e.stopPropagation();
    const updated = rememberedAccounts.filter(a => (a.email || '').toLowerCase() !== (emailToRemove || '').toLowerCase());
    setRememberedAccounts(updated);
    try {
      localStorage.setItem('ai_humanizer_remembered_accounts', JSON.stringify(updated));
      const single = localStorage.getItem('ai_humanizer_user');
      if (single) {
        const u = JSON.parse(single);
        if (u && (u.email || '').toLowerCase() === (emailToRemove || '').toLowerCase()) {
          localStorage.removeItem('ai_humanizer_user');
        }
      }
    } catch (e) {}
    if (onToast) onToast('Removed account from this device');
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
                <div className="w-11 h-11 rounded-2xl glass-badge-brain flex items-center justify-center p-1.5 shrink-0 shadow-lg shadow-teal-500/20 bg-slate-900 border border-teal-500/30 overflow-hidden group">
                  <img src={brainLogo} alt="AI Humanizer Logo" className="w-full h-full object-contain filter brightness-110 drop-shadow-sm group-hover:scale-105 transition-transform duration-300" />
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

              {/* Tab Selector: Sign Up & Log In */}
              <div className="flex p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl mt-4">
                <button
                  type="button"
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
                  Sign Up
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                    setOtpSent(false);
                  }}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    mode === 'login'
                      ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
                  }`}
                >
                  <span>Log In</span>
                  {rememberedAccounts.length > 0 && (
                    <span className="px-1.5 py-0.2 text-[10px] bg-emerald-500 text-white rounded-full font-bold">
                      {rememberedAccounts.length}
                    </span>
                  )}
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

              {/* 2. MODE === 'SIGNUP': MAIL OTP -> VERIFY TO CREATE PERMANENT ACCOUNT */}
              {mode === 'signup' ? (
                !otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3">
                    {/* Quick switch banner if accounts are already saved on this device */}
                    {rememberedAccounts.length > 0 && (
                      <div className="p-2.5 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 rounded-xl flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                          <div className="text-[11px] text-teal-900 dark:text-teal-200 truncate">
                            Saved account: <span className="font-bold">{rememberedAccounts[0].name || rememberedAccounts[0].email}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setMode('login');
                            setErrorMsg(null);
                          }}
                          className="px-2 py-0.5 text-[10px] font-bold bg-[#0f4c5c] hover:bg-[#0c3e4b] dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-lg shrink-0 cursor-pointer"
                        >
                          Log In →
                        </button>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                        />
                      </div>
                    </div>

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
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                        We'll send a 6-digit OTP code to verify and activate your account.
                      </p>
                    </div>

                    {/* Remember device checkbox */}
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-4 h-4 rounded text-teal-600 focus:ring-teal-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer"
                      />
                      <label htmlFor="rememberMe" className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer font-medium select-none">
                        Remember this account on this device
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
                          <span>Sending Verification Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Verification OTP Code</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('login');
                          setErrorMsg(null);
                        }}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                      >
                        Already have an account? Log In →
                      </button>
                    </div>
                  </form>
                ) : (
                  /* OTP VERIFICATION STEP */
                  <div className="space-y-4">
                    <div className="text-center space-y-1">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 rounded-full text-xs font-semibold text-teal-800 dark:text-teal-300">
                        <Mail className="w-3.5 h-3.5" />
                        <span>OTP sent to {email}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                        Enter the 6-digit OTP code to create your account permanently:
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

                    {/* Real Email Inbox Notice (No OTP displayed on screen) */}
                    <div className="p-3 bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-xl text-center text-xs text-teal-800 dark:text-teal-300">
                      <span>We sent a 6-digit security code to <strong>{email}</strong>. Please check your inbox (and Spam folder) to enter the code.</span>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="button"
                      onClick={() => triggerVerification()}
                      disabled={verifyLoading || otpDigits.join('').length !== 6}
                      className="w-full py-2.5 bg-gradient-to-r from-[#0f4c5c] to-emerald-600 hover:from-[#0d404f] hover:to-emerald-500 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {verifyLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Creating Permanent Account...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Verify OTP & Permanently Create Account</span>
                        </>
                      )}
                    </button>

                    {/* Resend & Change Email */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <button
                        type="button"
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
                        type="button"
                        onClick={handleSendOtp}
                        disabled={resendCooldown > 0 || otpLoading}
                        className="text-teal-600 dark:text-teal-400 font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP'}
                      </button>
                    </div>
                  </div>
                )
              ) : (
                /* 3. MODE === 'LOGIN': SAVED ACCOUNTS + DIRECT EMAIL SIGN IN */
                <div className="space-y-4">
                  {/* Saved Accounts on this Device */}
                  {rememberedAccounts.length > 0 ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span className="uppercase tracking-wider">Saved Accounts ({rememberedAccounts.length})</span>
                        </span>
                        <button
                          type="button"
                          onClick={handleClearSavedData}
                          className="text-[11px] text-red-500 hover:text-red-600 dark:text-red-400 font-semibold hover:underline cursor-pointer"
                        >
                          Clear all
                        </button>
                      </div>

                      <div className="space-y-2">
                        {rememberedAccounts.map((acc, idx) => (
                          <div
                            key={idx}
                            onClick={() => handleRememberedLogin(acc.email, acc.name)}
                            className="w-full p-3 bg-gradient-to-r from-teal-50/90 via-slate-50 to-emerald-50/70 dark:from-slate-800 dark:via-slate-800/90 dark:to-teal-950/40 hover:from-teal-100 hover:to-emerald-100 dark:hover:from-slate-750 dark:hover:to-teal-900/50 border border-teal-200/90 dark:border-teal-800/70 hover:border-teal-400 dark:hover:border-teal-500 rounded-2xl flex items-center gap-3 transition-all cursor-pointer group shadow-2xs text-left"
                          >
                            <div className="relative shrink-0">
                              <img
                                src={acc.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(acc.name || acc.email)}`}
                                alt={acc.name}
                                className="w-10 h-10 rounded-full border-2 border-teal-500 bg-white dark:bg-slate-900 object-cover shadow-xs"
                              />
                              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full" />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition truncate flex items-center gap-1.5">
                                <span>{acc.name || acc.email.split('@')[0]}</span>
                                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded-full border border-emerald-300 dark:border-emerald-800">
                                  Saved
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {acc.email}
                              </div>
                              <div className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                                {acc.plan || 'Pro Unlimited'}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                disabled={verifyLoading}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRememberedLogin(acc.email, acc.name);
                                }}
                                className="px-3 py-1.5 bg-[#0f4c5c] hover:bg-[#0c3e4b] dark:bg-teal-600 dark:hover:bg-teal-500 text-white rounded-xl text-[11px] font-bold shadow-2xs group-hover:scale-105 transition-transform flex items-center gap-1 cursor-pointer"
                              >
                                <span>Log In</span>
                                <ArrowRight className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                title="Remove account from device"
                                onClick={(e) => handleRemoveSingleAccount(acc.email, e)}
                                className="p-1.5 text-slate-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition hover:bg-slate-100 dark:hover:bg-slate-700/60 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="relative flex py-1 items-center">
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                        <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">or log in with another email</span>
                        <div className="flex-grow border-t border-slate-200 dark:border-slate-800" />
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/70 rounded-xl text-center space-y-1">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        No saved accounts on this device yet
                      </p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        If you have already signed up, enter your registered email below to log in directly.
                      </p>
                    </div>
                  )}

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!email.trim()) return;
                      handleRememberedLogin(email, name);
                    }}
                    className="space-y-3 pt-1"
                  >
                    <div>
                      <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {rememberedAccounts.length > 0 ? 'Email Address' : 'Registered Email Address'}
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="name@example.com"
                          required
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:border-teal-500 transition"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={verifyLoading || !email.trim()}
                      className="w-full py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {verifyLoading ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4" />
                      )}
                      <span>Log In</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMode('signup');
                          setErrorMsg(null);
                          setOtpSent(false);
                        }}
                        className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer"
                      >
                        Don't have an account? Sign Up with OTP →
                      </button>
                    </div>
                  </form>
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

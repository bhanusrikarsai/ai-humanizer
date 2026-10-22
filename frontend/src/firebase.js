import { initializeApp, getApps, getApp, deleteApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const STORAGE_KEY = 'ai_humanizer_firebase_config';

/**
 * Clean and normalize a configuration object by trimming strings and stripping accidental quotes.
 */
function normalizeConfig(config) {
  if (!config || typeof config !== 'object') return null;

  const clean = (val) => {
    if (val === null || val === undefined) return '';
    const str = String(val).trim().replace(/^["']|["']$/g, '');
    return str === 'undefined' || str === 'null' ? '' : str;
  };

  const apiKey = clean(config.apiKey);
  const authDomain = clean(config.authDomain);

  if (!apiKey || !authDomain) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId: clean(config.projectId) || undefined,
    storageBucket: clean(config.storageBucket) || undefined,
    messagingSenderId: clean(config.messagingSenderId) || undefined,
    appId: clean(config.appId) || undefined
  };
}

/**
 * Retrieve the active Firebase config either from localStorage, window object, or Vite environment variables.
 */
export function getFirebaseConfig() {
  // 1. Check localStorage for user-provided custom configuration
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const custom = window.localStorage.getItem(STORAGE_KEY);
      if (custom && custom !== 'undefined' && custom !== 'null') {
        const parsed = typeof custom === 'string' ? JSON.parse(custom) : custom;
        const normalized = normalizeConfig(parsed);
        if (normalized) {
          return normalized;
        }
      }
    }
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }

  // 2. Check window.__FIREBASE_CONFIG__ if injected at runtime
  if (typeof window !== 'undefined' && window.__FIREBASE_CONFIG__) {
    const normalized = normalizeConfig(window.__FIREBASE_CONFIG__);
    if (normalized) {
      return normalized;
    }
  }

  // 3. Check Vite environment variables (VITE_FIREBASE_*)
  try {
    const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
    if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_AUTH_DOMAIN) {
      const normalized = normalizeConfig({
        apiKey: env.VITE_FIREBASE_API_KEY,
        authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: env.VITE_FIREBASE_APP_ID
      });
      if (normalized) {
        return normalized;
      }
    }
  } catch (e) {
    console.warn('Error reading Vite Firebase environment variables:', e);
  }

  return null;
}

/**
 * Check if a valid Firebase configuration is active
 */
export function hasFirebaseConfig() {
  return !!getFirebaseConfig();
}

/**
 * Validate that a config object has required fields
 */
export function validateFirebaseConfig(config) {
  const normalized = normalizeConfig(config);
  if (!normalized) {
    throw new Error('Invalid Firebase config. apiKey and authDomain are required.');
  }
  return normalized;
}

/**
 * Delete all existing initialized Firebase apps
 */
export async function deleteExistingApps() {
  const apps = getApps();
  await Promise.all(
    apps.map(app => {
      try {
        return deleteApp(app);
      } catch (e) {
        return Promise.resolve();
      }
    })
  );
}

/**
 * Save Firebase configuration to localStorage and reset existing app instances
 */
export function saveFirebaseConfig(config) {
  const cleanConfig = validateFirebaseConfig(config);

  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cleanConfig));
  }

  // Synchronously delete existing apps so subsequent calls to getFirebaseApp()
  // immediately initialize with the new configuration
  const apps = getApps();
  apps.forEach(app => {
    try {
      deleteApp(app);
    } catch (e) {}
  });

  return initializeApp(cleanConfig);
}

/**
 * Clear saved Firebase configuration and tear down active apps
 */
export function clearFirebaseConfig() {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const apps = getApps();
  apps.forEach(app => {
    try {
      deleteApp(app);
    } catch (e) {}
  });
}

/**
 * Get or initialize Firebase App instance with current configuration
 */
export function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error('Firebase configuration missing. Please connect your Firebase project.');
  }

  const apps = getApps();
  if (apps.length > 0) {
    const existing = apps[0];
    // Check if the current app matches active config
    if (
      existing.options &&
      existing.options.apiKey === config.apiKey &&
      existing.options.authDomain === config.authDomain
    ) {
      return existing;
    }

    // Config changed: clean up stale apps
    apps.forEach(app => {
      try {
        deleteApp(app);
      } catch (e) {}
    });
  }

  return initializeApp(config);
}

/**
 * Get Firebase Auth instance
 */
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  return getAuth(app);
}

/**
 * Launch real Google Sign-In Popup window (accounts.google.com)
 */
export async function loginWithGooglePopup() {
  const auth = getFirebaseAuth();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({
    prompt: 'select_account'
  });

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Retrieve user ID token for backend validation
    const idToken = await user.getIdToken().catch(() => null);

    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0],
      photoURL: user.photoURL,
      idToken: idToken,
      emailVerified: user.emailVerified
    };
  } catch (error) {
    let friendlyMessage = error.message;

    if (error.code === 'auth/popup-closed-by-user') {
      friendlyMessage = 'Google Sign-In popup was closed before completing.';
    } else if (error.code === 'auth/cancelled-popup-request') {
      friendlyMessage = 'Another sign-in popup is already open.';
    } else if (error.code === 'auth/popup-blocked') {
      friendlyMessage = 'Popup was blocked by your browser. Please allow popups for this site.';
    } else if (error.code === 'auth/unauthorized-domain') {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
      friendlyMessage = `This domain (${hostname}) is not authorized in Firebase. Please add "${hostname}" to Firebase Console -> Authentication -> Settings -> Authorized domains.`;
    } else if (error.code === 'auth/operation-not-allowed') {
      friendlyMessage = 'Google Sign-In is not enabled in Firebase. Enable Google in Firebase Console -> Authentication -> Sign-in method.';
    } else if (error.code === 'auth/invalid-api-key') {
      friendlyMessage = 'The configured Firebase API key is invalid. Please verify your apiKey in the configuration.';
    }

    const err = new Error(friendlyMessage);
    err.code = error.code;
    err.originalError = error;
    throw err;
  }
}

/**
 * Sign out user from Firebase Auth
 */
export async function logoutFromFirebase() {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
  } catch (e) {
    // Silently continue if Firebase is not configured or already signed out
  }
}

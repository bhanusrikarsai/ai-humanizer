import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const STORAGE_KEY = 'ai_humanizer_firebase_config';

/**
 * Retrieve the active Firebase config either from localStorage or Vite environment variables.
 */
export function getFirebaseConfig() {
  try {
    const custom = localStorage.getItem(STORAGE_KEY);
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.apiKey && parsed.authDomain) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading saved Firebase config:', e);
  }

  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
}

export function hasFirebaseConfig() {
  return !!getFirebaseConfig();
}

export function saveFirebaseConfig(config) {
  if (!config || !config.apiKey || !config.authDomain) {
    throw new Error('Invalid Firebase config. apiKey and authDomain are required.');
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  // Re-initialize app if already loaded
  try {
    if (getApps().length > 0) {
      initializeApp(config, 'runtime_' + Date.now());
    }
  } catch (e) {}
}

export function clearFirebaseConfig() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Get or initialize Firebase App instance
 */
export function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config) {
    throw new Error('Firebase configuration missing. Please connect your Firebase project.');
  }

  const apps = getApps();
  if (apps.length > 0) {
    return apps[0];
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
}

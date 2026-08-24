// Firebase backend for AgriMitra.
//
// This replaces the simulated login/OTP with a REAL backend:
//   - Firebase Authentication (Phone provider) sends a genuine SMS OTP
//   - Firestore stores farmer profiles and their scan/chat history for real,
//     so data survives closing the browser — not just the current session
//
// SETUP (one-time, ~10 minutes):
//   1. Go to https://console.firebase.google.com → "Add project" (free)
//   2. Inside the project: Build > Authentication > Get started >
//      enable the "Phone" sign-in provider
//   3. Build > Firestore Database > Create database (start in test mode
//      while developing; tighten security rules before a real launch)
//   4. Project settings (gear icon) > General > "Your apps" > Web app (</>) 
//      > register an app > copy the firebaseConfig values below
//   5. Create a file named `.env` in the project root (same folder as
//      package.json) with these six lines filled in with YOUR values:
//
//        VITE_FIREBASE_API_KEY=...
//        VITE_FIREBASE_AUTH_DOMAIN=...
//        VITE_FIREBASE_PROJECT_ID=...
//        VITE_FIREBASE_STORAGE_BUCKET=...
//        VITE_FIREBASE_MESSAGING_SENDER_ID=...
//        VITE_FIREBASE_APP_ID=...
//
//   6. In the Firebase console, under Authentication > Settings >
//      Authorized domains, add your Netlify domain once you publish
//      (localhost is allowed by default for local testing)
//
// Until `.env` is filled in, calls using this file will fail gracefully —
// see how App.jsx falls back to the simulated OTP flow when Firebase isn't
// configured, so the app keeps working either way.

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseReady = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const app = firebaseReady && getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = firebaseReady ? getAuth(app) : null;
export const db = firebaseReady ? getFirestore(app) : null;

// Real phone-OTP login, backed by Firebase Authentication.
// See firebase.js for one-time setup instructions.

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, firebaseReady } from "./firebase.js";

let recaptchaVerifier = null;

// Firebase's phone auth requires an invisible reCAPTCHA bound to a real DOM
// node. Call this once, right before sending an OTP, passing the id of a
// container element that exists in the page (App.jsx renders one).
function getRecaptcha(containerId) {
  if (!recaptchaVerifier) {
    recaptchaVerifier = new RecaptchaVerifier(auth, containerId, { size: "invisible" });
  }
  return recaptchaVerifier;
}

// Converts a farmer-entered number like "98765 43210" or "9876543210" into
// the E.164 format Firebase requires ("+919876543210"). Assumes India (+91)
// when no country code is present — change the default below if needed.
export function toE164(rawNumber) {
  const digits = rawNumber.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) return digits;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

// Sends a real SMS OTP. Returns a confirmationResult — keep it in state and
// pass it to confirmOtp() below along with the code the user types in.
export async function sendRealOtp(mobile, containerId = "recaptcha-container") {
  if (!firebaseReady) throw new Error("firebase_not_configured");
  const phone = toE164(mobile);
  const verifier = getRecaptcha(containerId);
  return signInWithPhoneNumber(auth, phone, verifier);
}

export async function confirmOtp(confirmationResult, code) {
  const result = await confirmationResult.confirm(code); // throws on wrong code
  return result.user; // { uid, phoneNumber, ... }
}

// Saves/updates the farmer's profile in Firestore under their real Firebase
// uid, so it persists across sessions and devices — not just this browser tab.
export async function saveFarmerProfile(uid, profile) {
  if (!firebaseReady) return;
  await setDoc(doc(db, "farmers", uid), { ...profile, updatedAt: serverTimestamp() }, { merge: true });
}

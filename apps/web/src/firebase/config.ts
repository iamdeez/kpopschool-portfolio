import { initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";

// FR-013/research.md: this is the *client-side* Firebase config, which is
// meant to be public (protected by Firestore security rules, not secrecy).
// Still points at a demo-dedicated project via env, never the original
// motionbit-kpopschool project (research.md "기존 대비 변경 사항").
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

// Firebase Local Emulator Suite (local dev/demo runs without a real project).
if (import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true") {
  const emulatorUrl = import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_URL ?? "http://127.0.0.1:9099";
  connectAuthEmulator(auth, emulatorUrl, { disableWarnings: true });
}

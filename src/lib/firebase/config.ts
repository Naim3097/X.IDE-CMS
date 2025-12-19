import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyB4Hzpq7jr3obolu-IJyiUkwrjblvcu4M4",
  authDomain: "axtra-ii-c9ba7.firebaseapp.com",
  projectId: "axtra-ii-c9ba7",
  storageBucket: "axtra-ii-c9ba7.firebasestorage.app",
  messagingSenderId: "1046933054848",
  appId: "1:1046933054848:web:2c9aa83d11b67f1b914d65"
};

// Initialize Firebase (Singleton pattern to avoid re-initialization errors)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// src/utils/firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

// TODO: Replace with your Firebase project credentials
const firebaseConfig = {
  apiKey: "AIzaSyBgqmyc6W1l6NGhbwXmGdeCmFiO3D9nkYc",
  authDomain: "travel-assistant-f5cdc.firebaseapp.com",
  projectId: "travel-assistant-f5cdc",
  storageBucket: "travel-assistant-f5cdc.firebasestorage.app",
  messagingSenderId: "782972037880",
  appId: "1:782972037880:web:1c497892a7a3e4fe16a90d",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const provider = new GoogleAuthProvider();

export {
  auth,
  db,
  provider,
  deleteDoc,
  updateDoc,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  onSnapshot
};

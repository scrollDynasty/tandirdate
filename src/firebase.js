// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import firebase from "firebase/compat/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
import { createContext } from "react";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQOgmr4-hiT2PEHyNvoC99t5lmB4pYp9A",
  authDomain: "fir-demos-ef3c5.firebaseapp.com",
  projectId: "fir-demos-ef3c5",
  storageBucket: "fir-demos-ef3c5.firebasestorage.app",
  messagingSenderId: "636692595214",
  appId: "1:636692595214:web:e58da6ec6ac3383614b25f"
};

// Initialize Firebase
initializeApp(firebaseConfig);  



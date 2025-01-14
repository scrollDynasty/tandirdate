import { createContext } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { NextUIProvider } from "@nextui-org/react";
import './styles/global.css'
import firebase from 'firebase/compat/app';


// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from "firebase/auth";
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
const app = initializeApp(firebaseConfig);  


export const Context = createContext(null)
const firestore = getStorage(app)
const auth = getAuth()

createRoot(document.getElementById('root')).render(

  <NextUIProvider>
    <Context.Provider value={{
      firebase,
      auth,
      firestore
    }}>
      <App />
    </Context.Provider>
  </NextUIProvider>,

)

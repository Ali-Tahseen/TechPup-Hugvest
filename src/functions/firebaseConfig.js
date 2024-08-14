// src/functions/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
    apiKey: "AIzaSyA7ancePCBT7k3nCS8Ntk_R5_Ol_QvNb80",
    authDomain: "techpub-8c620.firebaseapp.com",
    projectId: "techpub-8c620",
    storageBucket: "techpub-8c620.appspot.com",
    messagingSenderId: "943169701552",
    appId: "1:943169701552:web:0e462e9e1cc65a82b75d75",
    measurementId: "G-JNSZ5XRDL0"
  };


// Initialize Firebase app
let app;
if (!global.firebaseApp) {
  app = initializeApp(firebaseConfig);
  global.firebaseApp = app;
} else {
  app = global.firebaseApp;
}

// Initialize Firebase Auth
let auth;
if (!global.firebaseAuth) {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  global.firebaseAuth = auth;
} else {
  auth = global.firebaseAuth;
}

const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
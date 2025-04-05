// src/firebase.js
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA9dph3ctzhtT1QUzoCwXp7G6ElD9Oya6Q",
  authDomain: "smart-coach-41850.firebaseapp.com",
  projectId: "smart-coach-41850",
  storageBucket: "smart-coach-41850.firebasestorage.app",
  messagingSenderId: "643154595272",
  appId: "1:643154595272:web:2e4bfc3b0a9ad2a04904fd"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
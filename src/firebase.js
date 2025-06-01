// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase 구성 - 환경 변수가 로드되지 않을 경우를 대비한 직접 설정
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyA9dph3ctzhtT1QUzoCwXp7G6ElD9Oya6Q",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "smart-coach-41850.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "smart-coach-41850",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "smart-coach-41850.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "643154595272",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:643154595272:web:2e4bfc3b0a9ad2a04904fd"
};

// 설정 값 확인
console.log('Firebase Config:', firebaseConfig);

// Firebase 초기화
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('Firebase 초기화 성공');
} catch (error) {
  console.error('Firebase 초기화 오류:', error);
}

// Firebase 서비스 내보내기
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
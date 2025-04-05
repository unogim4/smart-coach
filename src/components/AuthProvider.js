import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';

// 인증 컨텍스트 생성
const AuthContext = createContext();

// 인증 컨텍스트 사용을 위한 훅
export const useAuth = () => useContext(AuthContext);

// 인증 제공자 컴포넌트
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Firebase 인증 상태 변경 감지
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });
    
    // 컴포넌트 언마운트 시 구독 해제
    return unsubscribe;
  }, []);
  
  // 제공할 값들
  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
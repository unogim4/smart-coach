import React from 'react';
import AuthForms from '../components/AuthForms';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';

function Login() {
  const { isAuthenticated } = useAuth();
  
  // 이미 인증된 경우 프로필 페이지로 리디렉션
  if (isAuthenticated) {
    return <Navigate to="/profile" />;
  }
  
  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6">로그인</h2>
      <AuthForms />
    </div>
  );
}

export default Login;
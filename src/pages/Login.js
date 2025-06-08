import React from 'react';
import AuthForms from '../components/AuthForms';
import { useAuth } from '../components/AuthProvider';
import { Navigate } from 'react-router-dom';

function Login() {
  const { isAuthenticated } = useAuth();
  
  // 이미 인증된 경우 대시보드로 리디렉션
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4">
            <i className="fas fa-running text-3xl text-blue-600"></i>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">스마트 러닝 & 바이크 코치</h1>
          <p className="text-blue-100">AI 기반 맞춤형 운동 가이드</p>
        </div>
        
        {/* 인증 폼 */}
        <AuthForms />
        
        {/* 앱 소개 */}
        <div className="mt-8 text-center text-blue-100">
          <p className="text-sm mb-4">
            날씨와 대기질을 고려한 맞춤형 운동 코스 추천과<br/>
            실시간 운동 모니터링을 경험해보세요
          </p>
          <div className="flex justify-center space-x-6 text-xs">
            <div className="flex items-center">
              <i className="fas fa-route mr-1"></i>
              <span>맞춤 코스</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-cloud-sun mr-1"></i>
              <span>날씨 연동</span>
            </div>
            <div className="flex items-center">
              <i className="fas fa-heartbeat mr-1"></i>
              <span>실시간 모니터링</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
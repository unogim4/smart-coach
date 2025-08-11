import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import './App.css';

// Google Maps API 로더
import { loadGoogleMapsAPI } from './utils/googleMapsLoader';

// 컴포넌트 imports
import Header from './components/Header';
import { AuthProvider, useAuth } from './components/AuthProvider';

// 페이지 imports
import Dashboard from './pages/Dashboard';
import CourseRecommendation from './pages/CourseRecommendation';
import RealTimeMonitoring from './pages/RealTimeMonitoring';
import WeatherInfo from './pages/WeatherInfo';
import Profile from './pages/Profile';
import Login from './pages/Login';

// 인증이 필요한 라우트를 위한 래퍼 컴포넌트
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// 메인 앱 컴포넌트
function AppContent() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [userLocation, setUserLocation] = useState(null);
  const [weatherData, setWeatherData] = useState(null);

  // URL 경로에 따라 현재 화면 설정
  useEffect(() => {
    const path = location.pathname.slice(1) || 'dashboard';
    setCurrentScreen(path);
  }, [location.pathname]);

  // 사용자 위치 정보 가져오기
  useEffect(() => {
    if (navigator.geolocation && isAuthenticated) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('위치 정보를 가져올 수 없습니다:', error);
          // 서울의 기본 좌표 설정
          setUserLocation({
            lat: 37.5665,
            lng: 126.9780
          });
        }
      );
    }
  }, [isAuthenticated]);

  const changeScreen = (screen) => {
    setCurrentScreen(screen);
    navigate(`/${screen}`);
  };

  // 로그인하지 않은 경우 로그인 페이지만 표시
  if (!isAuthenticated) {
    return (
      <div className="App min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="App min-h-screen bg-gray-50">
      {/* 헤더 - 로그인한 경우에만 표시 */}
      <Header 
        currentScreen={currentScreen} 
        changeScreen={changeScreen}
      />

      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                userLocation={userLocation}
                weatherData={weatherData}
                setWeatherData={setWeatherData}
                changeScreen={changeScreen}
              />
            } 
          />
          <Route 
            path="/courses" 
            element={
              <CourseRecommendation 
                userLocation={userLocation}
                weatherData={weatherData}
              />
            } 
          />
          <Route 
            path="/monitoring" 
            element={<RealTimeMonitoring userLocation={userLocation} />} 
          />
          <Route 
            path="/weather" 
            element={
              <WeatherInfo 
                userLocation={userLocation}
                weatherData={weatherData}
                setWeatherData={setWeatherData}
              />
            } 
          />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </div>
  );
}

// 최상위 App 컴포넌트
function App() {
  const [mapsLoading, setMapsLoading] = useState(true);
  const [mapsError, setMapsError] = useState(null);

  // Google Maps API 로드
  useEffect(() => {
    loadGoogleMapsAPI()
      .then(() => {
        console.log('✅ Google Maps API 로드 성공');
        setMapsLoading(false);
      })
      .catch((error) => {
        console.error('❌ Google Maps API 로드 실패:', error);
        setMapsError(error.message);
        setMapsLoading(false);
      });
  }, []);

  // Google Maps 로딩 중일 때 로딩 화면 표시
  if (mapsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">스마트 코치 준비 중...</h2>
          <p className="text-gray-500">Google Maps를 로드하고 있습니다</p>
        </div>
      </div>
    );
  }

  // Google Maps 로드 실패 시 에러 화면 표시 (하지만 앱은 계속 작동)
  if (mapsError) {
    console.warn('⚠️ Google Maps 없이 앱을 시작합니다:', mapsError);
  }

  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
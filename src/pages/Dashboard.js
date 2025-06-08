import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';

function Dashboard({ userLocation, weatherData, setWeatherData, changeScreen }) {
  const { currentUser } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // 실시간 시계 업데이트
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 날씨 데이터 기본값 설정
  useEffect(() => {
    if (userLocation && !weatherData) {
      // 기본 날씨 데이터 (실제 API 연동 전)
      const defaultWeatherData = {
        temperature: 22,
        condition: '맑음',
        humidity: 65,
        windSpeed: 3.2,
        airQuality: '좋음',
        pm25: 12,
        recommendation: '러닝'
      };
      setWeatherData(defaultWeatherData);
    }
  }, [userLocation, weatherData, setWeatherData]);

  return (
    <div className="space-y-6">
      {/* 환영 메시지 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              안녕하세요! {currentUser?.email?.split('@')[0] || 'User'}님 👋
            </h2>
            <p className="text-blue-100">
              건강한 하루를 시작해보세요. 
              현재 시간: {currentTime.toLocaleTimeString('ko-KR')}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">0km</div>
            <div className="text-blue-200">오늘 운동 거리</div>
          </div>
        </div>
      </div>

      {/* 날씨 및 상태 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 현재 날씨 */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">현재 날씨</h3>
            <i className="fas fa-sun text-yellow-500 text-2xl"></i>
          </div>
          <div className="text-3xl font-bold text-gray-800 mb-2">
            {weatherData?.temperature || '--'}°C
          </div>
          <div className="text-gray-600 mb-4">{weatherData?.condition || '정보 없음'}</div>
          <div className="space-y-1 text-sm text-gray-500">
            <div className="flex justify-between">
              <span>습도:</span>
              <span>{weatherData?.humidity || '--'}%</span>
            </div>
            <div className="flex justify-between">
              <span>바람:</span>
              <span>{weatherData?.windSpeed || '--'} m/s</span>
            </div>
          </div>
        </div>

        {/* 대기질 */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">대기질</h3>
            <i className="fas fa-leaf text-green-500 text-2xl"></i>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            {weatherData?.airQuality || '정보 없음'}
          </div>
          <div className="text-gray-600 mb-4">
            PM2.5: {weatherData?.pm25 || '--'} μg/m³
          </div>
          <div className="flex items-center text-sm text-green-600">
            <i className="fas fa-check-circle mr-2"></i>
            운동하기 좋은 환경입니다!
          </div>
        </div>

        {/* 추천 운동 */}
        <div className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">추천 운동</h3>
            <i className="fas fa-running text-blue-500 text-2xl"></i>
          </div>
          <div className="text-xl font-bold text-blue-600 mb-2">
            {weatherData?.recommendation || '러닝'}
          </div>
          <div className="text-gray-600 mb-4">
            오늘은 {weatherData?.recommendation || '러닝'}하기 완벽한 날씨입니다!
          </div>
          <button 
            onClick={() => changeScreen && changeScreen('courses')}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
          >
            코스 보기
          </button>
        </div>
      </div>

      {/* 운동 시작 카드 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">운동 시작하기</h3>
        
        <div className="text-center py-8">
          <div className="mb-4">
            <i className="fas fa-play-circle text-6xl text-blue-500"></i>
          </div>
          <h4 className="text-xl font-semibold text-gray-800 mb-2">첫 운동을 시작해보세요!</h4>
          <p className="text-gray-600 mb-6">
            운동을 시작하면 실시간으로 기록을 추적하고<br/>
            맞춤형 피드백을 받을 수 있습니다.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-md mx-auto">
            <button 
              onClick={() => changeScreen && changeScreen('monitoring')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <i className="fas fa-running mr-2"></i>
              러닝 시작
            </button>
            <button 
              onClick={() => changeScreen && changeScreen('monitoring')}
              className="bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors flex items-center justify-center"
            >
              <i className="fas fa-bicycle mr-2"></i>
              자전거 시작
            </button>
          </div>
        </div>
      </div>

      {/* 목표 설정 카드 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">목표 설정</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <i className="fas fa-target text-2xl text-blue-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800">주간 목표</h4>
            <p className="text-gray-600 text-sm">주당 운동 횟수를 설정하세요</p>
            <button 
              onClick={() => changeScreen && changeScreen('profile')}
              className="mt-2 text-blue-500 hover:text-blue-700 text-sm"
            >
              설정하기
            </button>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <i className="fas fa-route text-2xl text-green-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800">거리 목표</h4>
            <p className="text-gray-600 text-sm">일일 운동 거리를 설정하세요</p>
            <button 
              onClick={() => changeScreen && changeScreen('profile')}
              className="mt-2 text-green-500 hover:text-green-700 text-sm"
            >
              설정하기
            </button>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <i className="fas fa-fire text-2xl text-orange-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800">칼로리 목표</h4>
            <p className="text-gray-600 text-sm">일일 칼로리 소모 목표를 설정하세요</p>
            <button 
              onClick={() => changeScreen && changeScreen('profile')}
              className="mt-2 text-orange-500 hover:text-orange-700 text-sm"
            >
              설정하기
            </button>
          </div>
        </div>
      </div>

      {/* 빠른 실행 버튼들 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <button 
          onClick={() => changeScreen && changeScreen('courses')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <i className="fas fa-route mr-2"></i>
          코스 찾기
        </button>
        <button 
          onClick={() => changeScreen && changeScreen('monitoring')}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <i className="fas fa-heartbeat mr-2"></i>
          실시간 모니터링
        </button>
        <button 
          onClick={() => changeScreen && changeScreen('weather')}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <i className="fas fa-cloud-sun mr-2"></i>
          날씨 정보
        </button>
        <button 
          onClick={() => changeScreen && changeScreen('profile')}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors flex items-center justify-center"
        >
          <i className="fas fa-user mr-2"></i>
          프로필 설정
        </button>
      </div>

      {/* 앱 소개 */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          스마트 러닝 & 바이크 코치 주요 기능
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <i className="fas fa-map-marked-alt text-3xl text-blue-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm">맞춤 코스 추천</h4>
            <p className="text-gray-600 text-xs">난이도와 날씨를 고려한 최적의 운동 코스</p>
          </div>
          <div className="text-center">
            <i className="fas fa-robot text-3xl text-green-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm">AI 운동 코치</h4>
            <p className="text-gray-600 text-xs">실시간 피드백과 맞춤형 운동 가이드</p>
          </div>
          <div className="text-center">
            <i className="fas fa-cloud-sun text-3xl text-yellow-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm">날씨 연동</h4>
            <p className="text-gray-600 text-xs">실시간 날씨와 대기질 기반 운동 추천</p>
          </div>
          <div className="text-center">
            <i className="fas fa-chart-line text-3xl text-purple-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm">운동 기록 분석</h4>
            <p className="text-gray-600 text-xs">상세한 운동 데이터 분석과 통계</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
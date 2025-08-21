import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/AuthProvider';
import { getUserStats, getWeeklyStats } from '../services/workoutService';
import { saveWeeklyWorkoutsToLocal, getWeeklyWorkouts, calculateWeeklyStats } from '../services/dummyDataService';

function Dashboard({ userLocation, weatherData, setWeatherData, changeScreen }) {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [userStats, setUserStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);

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

  // 통계 데이터 로드
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [stats, weekly] = await Promise.all([
        getUserStats(),
        getWeeklyStats()
      ]);
      setUserStats(stats);
      setWeeklyStats(weekly);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    }
  };

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
            <div className="text-3xl font-bold">
              {((userStats?.totalDistance || 0) / 1000).toFixed(1)}km
            </div>
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

      {/* 빠른 운동 시작 카드 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🚀 빠른 운동 시작</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* 자유 러닝 */}
          <div className="border-2 border-blue-200 rounded-lg p-4 hover:border-blue-500 transition-colors">
            <div className="text-center">
              <div className="text-4xl mb-2">🏃‍♂️</div>
              <h4 className="font-semibold text-gray-800 mb-2">자유 러닝</h4>
              <p className="text-gray-600 text-sm mb-4">
                GPS로 경로를 추적하며<br/>자유롭게 달리기
              </p>
              <button 
                onClick={() => navigate('/exercise-tracking', {
                  state: { exerciseType: 'running', route: null }
                })}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>

          {/* 자유 사이클링 */}
          <div className="border-2 border-green-200 rounded-lg p-4 hover:border-green-500 transition-colors">
            <div className="text-center">
              <div className="text-4xl mb-2">🚴‍♀️</div>
              <h4 className="font-semibold text-gray-800 mb-2">자유 사이클링</h4>
              <p className="text-gray-600 text-sm mb-4">
                GPS로 경로를 추적하며<br/>자유롭게 자전거 타기
              </p>
              <button 
                onClick={() => navigate('/exercise-tracking', {
                  state: { exerciseType: 'cycling', route: null }
                })}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
              >
                시작하기
              </button>
            </div>
          </div>

          {/* 코스 선택 */}
          <div className="border-2 border-purple-200 rounded-lg p-4 hover:border-purple-500 transition-colors">
            <div className="text-center">
              <div className="text-4xl mb-2">🗺️</div>
              <h4 className="font-semibold text-gray-800 mb-2">코스 운동</h4>
              <p className="text-gray-600 text-sm mb-4">
                추천 코스를 선택하고<br/>네비게이션 받기
              </p>
              <button 
                onClick={() => changeScreen && changeScreen('courses')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg transition-colors"
              >
                코스 선택
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 운동 통계 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">📊 이번 주 운동 통계</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-3xl font-bold text-blue-600">
              {weeklyStats?.weeklyTotal?.workouts || 0}
            </div>
            <div className="text-gray-600 text-sm">운동 횟수</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-3xl font-bold text-green-600">
              {((weeklyStats?.weeklyTotal?.distance || 0) / 1000).toFixed(1)}km
            </div>
            <div className="text-gray-600 text-sm">총 거리</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-3xl font-bold text-orange-600">
              {weeklyStats?.weeklyTotal?.calories || 0}
            </div>
            <div className="text-gray-600 text-sm">칼로리</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round((weeklyStats?.weeklyTotal?.time || 0) / 60)}분
            </div>
            <div className="text-gray-600 text-sm">운동 시간</div>
          </div>
        </div>

        <div className="mt-4 text-center">
          {weeklyStats?.weeklyTotal?.workouts > 0 ? (
            <>
              <p className="text-gray-600 text-sm mb-2">
                이번 주 {weeklyStats.weeklyTotal.workouts}회 운동하셨습니다!
              </p>
              <button 
                onClick={() => window.location.href = '/stats'}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                자세한 통계 보기 →
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-600 text-sm mb-2">아직 이번 주 운동 기록이 없습니다</p>
              <button 
                onClick={() => navigate('/exercise-tracking', {
                  state: { exerciseType: 'running', route: null }
                })}
                className="text-blue-500 hover:text-blue-700 text-sm font-medium"
              >
                첫 운동 시작하기 →
              </button>
            </>
          )}
        </div>
      </div>

      {/* 목표 설정 카드 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">🎯 목표 설정</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <i className="fas fa-calendar-check text-3xl text-blue-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800">주간 목표</h4>
            <p className="text-gray-600 text-sm">주 3회 운동</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-xs text-gray-500">0/3 완료</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <i className="fas fa-route text-3xl text-green-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800">거리 목표</h4>
            <p className="text-gray-600 text-sm">일 5km</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-xs text-gray-500">0/5 km</span>
            </div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <i className="fas fa-fire text-3xl text-orange-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800">칼로리 목표</h4>
            <p className="text-gray-600 text-sm">일 500kcal</p>
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '0%' }}></div>
              </div>
              <span className="text-xs text-gray-500">0/500 kcal</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => changeScreen && changeScreen('profile')}
          className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg transition-colors"
        >
          목표 수정하기
        </button>
      </div>

      {/* 빠른 실행 버튼들 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button 
          onClick={() => changeScreen && changeScreen('courses')}
          className="bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg transition-colors flex flex-col items-center justify-center"
        >
          <i className="fas fa-map-marked-alt text-2xl mb-2"></i>
          <span>코스 추천</span>
        </button>
        <button 
          onClick={() => changeScreen && changeScreen('monitoring')}
          className="bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg transition-colors flex flex-col items-center justify-center"
        >
          <i className="fas fa-heartbeat text-2xl mb-2"></i>
          <span>실시간 모니터</span>
        </button>
        <button 
          onClick={() => changeScreen && changeScreen('weather')}
          className="bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg transition-colors flex flex-col items-center justify-center"
        >
          <i className="fas fa-cloud-sun text-2xl mb-2"></i>
          <span>날씨 정보</span>
        </button>
        <button 
          onClick={() => changeScreen && changeScreen('profile')}
          className="bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg transition-colors flex flex-col items-center justify-center"
        >
          <i className="fas fa-user-cog text-2xl mb-2"></i>
          <span>프로필</span>
        </button>
      </div>

      {/* 테스트 데이터 생성 섹션 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          🧪 테스트 데이터 생성
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          일주일치 운동 기록 더미 데이터를 생성하여 통계 기능을 테스트할 수 있습니다.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => {
              const workouts = saveWeeklyWorkoutsToLocal();
              alert(`✅ ${workouts.length}개의 운동 기록이 생성되었습니다!\n\n통계 페이지에서 확인해보세요.`);
              // 통계 업데이트
              const stats = calculateWeeklyStats(workouts);
              console.log('생성된 통계:', stats);
            }}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-database mr-2"></i>
            일주일 운동 기록 생성
          </button>
          <button
            onClick={async () => {
              const workouts = await getWeeklyWorkouts('local');
              navigate('/exercise-result', { 
                state: { 
                  result: workouts[0] || null,
                  weeklyWorkouts: workouts 
                } 
              });
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-chart-line mr-2"></i>
            운동 결과 보기
          </button>
          <button
            onClick={() => navigate('/stats')}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-chart-bar mr-2"></i>
            통계 페이지로 이동
          </button>
        </div>
        <div className="mt-3 text-xs text-gray-500">
          💡 Tip: 생성된 데이터는 브라우저 로컬 스토리지에 저장됩니다.
        </div>
      </div>

      {/* 앱 특징 소개 */}
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
          💡 스마트 코치 주요 기능
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 text-center">
            <i className="fas fa-location-arrow text-3xl text-blue-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">GPS 트래킹</h4>
            <p className="text-gray-600 text-xs">실시간 위치 추적과 경로 기록</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <i className="fas fa-robot text-3xl text-green-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">AI 코칭</h4>
            <p className="text-gray-600 text-xs">개인 맞춤형 운동 피드백</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <i className="fas fa-trophy text-3xl text-yellow-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">업적 시스템</h4>
            <p className="text-gray-600 text-xs">목표 달성과 동기부여</p>
          </div>
          <div className="bg-white rounded-lg p-4 text-center">
            <i className="fas fa-chart-line text-3xl text-purple-500 mb-2"></i>
            <h4 className="font-semibold text-gray-800 text-sm mb-1">상세 분석</h4>
            <p className="text-gray-600 text-xs">운동 데이터 통계와 분석</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
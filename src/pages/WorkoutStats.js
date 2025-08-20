import React, { useState, useEffect } from 'react';
import { 
  getUserStats, 
  getWeeklyStats, 
  getMonthlyStats,
  getRecentWorkouts,
  getWorkoutGoals
} from '../services/workoutService';

function WorkoutStats() {
  const [activeTab, setActiveTab] = useState('overview');
  const [userStats, setUserStats] = useState(null);
  const [weeklyStats, setWeeklyStats] = useState(null);
  const [monthlyStats, setMonthlyStats] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [goals, setGoals] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // 데이터 로드
  useEffect(() => {
    loadAllStats();
  }, []);

  // 월 변경 시 월간 통계 재로드
  useEffect(() => {
    loadMonthlyStats();
  }, [selectedMonth, selectedYear]);

  const loadAllStats = async () => {
    setIsLoading(true);
    try {
      const [stats, weekly, recent, userGoals] = await Promise.all([
        getUserStats(),
        getWeeklyStats(),
        getRecentWorkouts(5),
        getWorkoutGoals()
      ]);

      setUserStats(stats);
      setWeeklyStats(weekly);
      setRecentWorkouts(recent);
      setGoals(userGoals);
    } catch (error) {
      console.error('통계 로드 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadMonthlyStats = async () => {
    try {
      const monthly = await getMonthlyStats(selectedYear, selectedMonth);
      setMonthlyStats(monthly);
    } catch (error) {
      console.error('월간 통계 로드 실패:', error);
    }
  };

  // 시간 포맷
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분`;
    }
    return `${minutes}분`;
  };

  // 거리 포맷
  const formatDistance = (meters) => {
    return (meters / 1000).toFixed(2);
  };

  // 진행률 계산
  const calculateProgress = (current, goal) => {
    if (!goal || goal === 0) return 0;
    return Math.min(100, Math.round((current / goal) * 100));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">통계를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold mb-2">📊 운동 통계</h1>
          <p className="text-purple-100">나의 운동 기록과 성과를 확인하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-4">
        {/* 전체 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">총 운동 횟수</span>
              <i className="fas fa-dumbbell text-blue-500"></i>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {userStats?.totalWorkouts || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              연속 {userStats?.currentStreak || 0}일
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">총 거리</span>
              <i className="fas fa-route text-green-500"></i>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {formatDistance(userStats?.totalDistance || 0)}
            </div>
            <div className="text-xs text-gray-500 mt-1">킬로미터</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">총 칼로리</span>
              <i className="fas fa-fire text-orange-500"></i>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {userStats?.totalCalories || 0}
            </div>
            <div className="text-xs text-gray-500 mt-1">kcal 소모</div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-500 text-sm">평균 속도</span>
              <i className="fas fa-tachometer-alt text-purple-500"></i>
            </div>
            <div className="text-3xl font-bold text-gray-800">
              {(userStats?.averageSpeed || 0).toFixed(1)}
            </div>
            <div className="text-xs text-gray-500 mt-1">km/h</div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-lg shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'overview'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                개요
              </button>
              <button
                onClick={() => setActiveTab('weekly')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'weekly'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                주간
              </button>
              <button
                onClick={() => setActiveTab('monthly')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'monthly'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                월간
              </button>
              <button
                onClick={() => setActiveTab('records')}
                className={`px-6 py-3 text-sm font-medium ${
                  activeTab === 'records'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                기록
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* 개요 탭 */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* 목표 달성률 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">🎯 목표 달성률</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">주간 운동 목표</span>
                        <span className="text-sm font-medium">
                          {weeklyStats?.weeklyTotal?.workouts || 0} / {goals?.weeklyWorkouts || 3}회
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${calculateProgress(
                              weeklyStats?.weeklyTotal?.workouts || 0,
                              goals?.weeklyWorkouts || 3
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">주간 거리 목표</span>
                        <span className="text-sm font-medium">
                          {formatDistance(weeklyStats?.weeklyTotal?.distance || 0)} / {formatDistance((goals?.dailyDistance || 5000) * 7)}km
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${calculateProgress(
                              weeklyStats?.weeklyTotal?.distance || 0,
                              (goals?.dailyDistance || 5000) * 7
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm text-gray-600">주간 칼로리 목표</span>
                        <span className="text-sm font-medium">
                          {weeklyStats?.weeklyTotal?.calories || 0} / {(goals?.dailyCalories || 300) * 7}kcal
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-600 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${calculateProgress(
                              weeklyStats?.weeklyTotal?.calories || 0,
                              (goals?.dailyCalories || 300) * 7
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 최근 운동 */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 최근 운동 기록</h3>
                  {recentWorkouts.length > 0 ? (
                    <div className="space-y-3">
                      {recentWorkouts.map((workout) => (
                        <div key={workout.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="text-2xl mr-3">
                              {workout.exerciseType === 'cycling' ? '🚴' : '🏃'}
                            </div>
                            <div>
                              <div className="font-medium text-gray-800">
                                {formatDistance(workout.distance)}km
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(workout.createdAt).toLocaleDateString('ko-KR')}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">
                              {formatTime(workout.time)}
                            </div>
                            <div className="text-sm text-orange-500">
                              {workout.calories}kcal
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      아직 운동 기록이 없습니다
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 주간 탭 */}
            {activeTab === 'weekly' && weeklyStats && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">📅 이번 주 운동 현황</h3>
                
                {/* 요일별 차트 */}
                <div className="grid grid-cols-7 gap-2">
                  {['월', '화', '수', '목', '금', '토', '일'].map((day) => {
                    const dayData = weeklyStats.dailyStats?.[day] || { workouts: 0, distance: 0, calories: 0 };
                    const hasWorkout = dayData.workouts > 0;
                    
                    return (
                      <div key={day} className="text-center">
                        <div className="text-xs text-gray-600 mb-2">{day}</div>
                        <div className={`h-20 rounded-lg flex flex-col items-center justify-center ${
                          hasWorkout ? 'bg-blue-100 border-2 border-blue-500' : 'bg-gray-100'
                        }`}>
                          {hasWorkout ? (
                            <>
                              <i className="fas fa-check text-blue-500 text-lg mb-1"></i>
                              <span className="text-xs font-medium">{formatDistance(dayData.distance)}km</span>
                            </>
                          ) : (
                            <i className="fas fa-minus text-gray-400"></i>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 주간 총계 */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">주간 총계</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {weeklyStats.weeklyTotal?.workouts || 0}
                      </div>
                      <div className="text-xs text-gray-600">운동 횟수</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {formatDistance(weeklyStats.weeklyTotal?.distance || 0)}
                      </div>
                      <div className="text-xs text-gray-600">총 거리 (km)</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-600">
                        {weeklyStats.weeklyTotal?.calories || 0}
                      </div>
                      <div className="text-xs text-gray-600">총 칼로리</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {formatTime(weeklyStats.weeklyTotal?.time || 0)}
                      </div>
                      <div className="text-xs text-gray-600">총 시간</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 월간 탭 */}
            {activeTab === 'monthly' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">📆 월간 운동 캘린더</h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (selectedMonth === 1) {
                          setSelectedMonth(12);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <span className="font-medium">
                      {selectedYear}년 {selectedMonth}월
                    </span>
                    <button
                      onClick={() => {
                        if (selectedMonth === 12) {
                          setSelectedMonth(1);
                          setSelectedYear(selectedYear + 1);
                        } else {
                          setSelectedMonth(selectedMonth + 1);
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded"
                    >
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>

                {/* 월간 캘린더 */}
                <div className="grid grid-cols-7 gap-1">
                  {['일', '월', '화', '수', '목', '금', '토'].map(day => (
                    <div key={day} className="text-center text-xs font-medium text-gray-600 p-2">
                      {day}
                    </div>
                  ))}
                  
                  {/* 캘린더 날짜 생성 */}
                  {(() => {
                    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).getDay();
                    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
                    const days = [];
                    
                    // 빈 칸
                    for (let i = 0; i < firstDay; i++) {
                      days.push(<div key={`empty-${i}`} className="p-2"></div>);
                    }
                    
                    // 날짜
                    for (let day = 1; day <= daysInMonth; day++) {
                      const dayData = monthlyStats?.calendar?.[day];
                      const hasWorkout = dayData && dayData.workouts.length > 0;
                      
                      days.push(
                        <div
                          key={day}
                          className={`p-2 border rounded-lg ${
                            hasWorkout 
                              ? 'bg-blue-100 border-blue-500' 
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="text-sm font-medium">{day}</div>
                          {hasWorkout && (
                            <div className="text-xs mt-1">
                              <div className="text-blue-600">
                                {formatDistance(dayData.totalDistance)}km
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    }
                    
                    return days;
                  })()}
                </div>

                {/* 월간 총계 */}
                {monthlyStats && (
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">월간 총계</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {monthlyStats.totalWorkouts || 0}
                        </div>
                        <div className="text-xs text-gray-600">운동 횟수</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {formatDistance(monthlyStats.totalDistance || 0)}
                        </div>
                        <div className="text-xs text-gray-600">총 거리 (km)</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">
                          {monthlyStats.totalCalories || 0}
                        </div>
                        <div className="text-xs text-gray-600">총 칼로리</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 기록 탭 */}
            {activeTab === 'records' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">🏆 최고 기록</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">최장 거리</span>
                      <i className="fas fa-trophy text-blue-500"></i>
                    </div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatDistance(userStats?.longestDistance || 0)}km
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">최장 시간</span>
                      <i className="fas fa-trophy text-green-500"></i>
                    </div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatTime(userStats?.longestTime || 0)}
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">최장 연속</span>
                      <i className="fas fa-trophy text-orange-500"></i>
                    </div>
                    <div className="text-3xl font-bold text-orange-600">
                      {userStats?.longestStreak || 0}일
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-700 font-medium">현재 연속</span>
                      <i className="fas fa-fire text-purple-500"></i>
                    </div>
                    <div className="text-3xl font-bold text-purple-600">
                      {userStats?.currentStreak || 0}일
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutStats;
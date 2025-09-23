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
  const [aiAdvice, setAiAdvice] = useState([]);
  const [showAiModal, setShowAiModal] = useState(false);

  // 데이터 로드
  useEffect(() => {
    loadAllStats();
  }, []);

  // AI 조언 생성
  useEffect(() => {
    if (userStats && weeklyStats && goals) {
      generateAIAdvice();
    }
  }, [userStats, weeklyStats, goals]);

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

  // AI 조언 생성 함수
  const generateAIAdvice = () => {
    const advice = [];
    
    // 1. 운동 빈도 분석
    const weeklyWorkouts = weeklyStats?.weeklyTotal?.workouts || 0;
    const weeklyGoal = goals?.weeklyWorkouts || 3;
    
    if (weeklyWorkouts === 0) {
      advice.push({
        type: 'warning',
        icon: '⚠️',
        title: '운동 빈도 부족',
        message: '이번 주에 아직 운동을 하지 않으셨네요. 가볍게 10분이라도 시작해보세요!',
        action: '오늘 바로 시작하기'
      });
    } else if (weeklyWorkouts < weeklyGoal) {
      advice.push({
        type: 'info',
        icon: '💡',
        title: '목표 달성 근처',
        message: `주간 목표까지 ${weeklyGoal - weeklyWorkouts}회만 더 하면 돼요! 할 수 있어요!`,
        action: '코스 추천 받기'
      });
    } else {
      advice.push({
        type: 'success',
        icon: '🎆',
        title: '목표 달성!',
        message: '훌륙합니다! 주간 운동 목표를 달성했어요!',
        action: '다음 단계 목표 설정'
      });
    }
    
    // 2. 균형 분석
    const dailyStats = weeklyStats?.dailyStats || {};
    const activeDays = Object.values(dailyStats).filter(day => day.workouts > 0).length;
    
    if (activeDays > 0 && activeDays < 3) {
      advice.push({
        type: 'info',
        icon: '📆',
        title: '균형있는 운동 배분',
        message: '특정 날짜에만 운동이 집중되어 있네요. 주 3-4회로 분산하면 획복에 더 좋아요.',
        action: '운동 일정 조정'
      });
    }
    
    // 3. 거리 분석
    const weeklyDistance = weeklyStats?.weeklyTotal?.distance || 0;
    const avgDistance = weeklyWorkouts > 0 ? weeklyDistance / weeklyWorkouts : 0;
    
    if (avgDistance > 0 && avgDistance < 3000) {
      advice.push({
        type: 'tip',
        icon: '🏃',
        title: '점진적 거리 증가',
        message: `현재 평균 ${(avgDistance/1000).toFixed(1)}km를 달리고 계시네요. 매주 10%씩 거리를 늘려보세요.`,
        action: '경로 추천 보기'
      });
    } else if (avgDistance > 10000) {
      advice.push({
        type: 'warning',
        icon: '🔥',
        title: '과도한 운동량',
        message: `평균 ${(avgDistance/1000).toFixed(1)}km는 높은 거리예요. 충분한 휴식도 중요합니다!`,
        action: '회복 가이드'
      });
    }
    
    // 4. 레벌업 제안
    const totalWorkouts = userStats?.totalWorkouts || 0;
    if (totalWorkouts > 10 && totalWorkouts < 30) {
      advice.push({
        type: 'level',
        icon: '🏅',
        title: '레벨 업!',
        message: '초급자 단계를 벗어났어요! 이제 중급 코스에 도전해보세요.',
        action: '중급 코스 보기'
      });
    } else if (totalWorkouts >= 30) {
      advice.push({
        type: 'expert',
        icon: '🌟',
        title: '베테랑 러너',
        message: `${totalWorkouts}회의 운동을 완료하셨네요! 대회 참가를 고려해보세요.`,
        action: '대회 정보 보기'
      });
    }
    
    // 5. 연속 운동 분석
    const currentStreak = userStats?.currentStreak || 0;
    const longestStreak = userStats?.longestStreak || 0;
    
    if (currentStreak >= 7) {
      advice.push({
        type: 'achievement',
        icon: '🔥',
        title: `${currentStreak}일 연속 운동!`,
        message: '대단한 꾸준함입니다! 이 기세를 이어가세요.',
        action: '지속 가능한 플랜'
      });
    } else if (currentStreak === 0 && longestStreak > 3) {
      advice.push({
        type: 'motivation',
        icon: '💪',
        title: '다시 시작하세요!',
        message: `이전에 ${longestStreak}일 연속 운동한 기록이 있어요. 다시 도전해보세요!`,
        action: '오늘 운동하기'
      });
    }
    
    // 6. 칼로리 분석
    const weeklyCalories = weeklyStats?.weeklyTotal?.calories || 0;
    const calorieGoal = (goals?.dailyCalories || 300) * 7;
    
    if (weeklyCalories > 0 && weeklyCalories < calorieGoal * 0.5) {
      advice.push({
        type: 'tip',
        icon: '🔥',
        title: '운동 강도 증가 필요',
        message: '운동 시간을 늘리거나 강도를 높여 칼로리 소모를 증가시켜보세요.',
        action: '고강도 코스 찾기'
      });
    }
    
    setAiAdvice(advice);
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
          
          {/* AI 조언 버튼 */}
          <button
            onClick={() => setShowAiModal(true)}
            className="mt-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-lg transition-all flex items-center"
          >
            <i className="fas fa-robot mr-2"></i>
            AI 코치 조언 보기
            {aiAdvice.length > 0 && (
              <span className="ml-2 bg-white bg-opacity-90 text-purple-600 rounded-full px-2 py-0.5 text-xs font-bold">
                {aiAdvice.length}
              </span>
            )}
          </button>
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
            {/* AI 조언 카드 - 개요 탭에 표시 */}
            {activeTab === 'overview' && aiAdvice.length > 0 && (
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-purple-800">
                    <i className="fas fa-robot mr-2"></i>
                    AI 코치 조언
                  </h3>
                  <button
                    onClick={() => setShowAiModal(true)}
                    className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                  >
                    전체 보기 →
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {aiAdvice.slice(0, 2).map((advice, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded-lg"
                    >
                      <div className="flex items-start">
                        <span className="text-xl mr-2">{advice.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-800 text-sm">{advice.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{advice.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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

      {/* AI 조언 모달 */}
      {showAiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <i className="fas fa-robot text-3xl mr-3"></i>
                  <div>
                    <h2 className="text-2xl font-bold">AI 코치 분석 결과</h2>
                    <p className="text-purple-100">당신의 운동 데이터를 분석했어요!</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAiModal(false)}
                  className="text-white hover:text-purple-200 transition-colors"
                >
                  <i className="fas fa-times text-2xl"></i>
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {aiAdvice.length > 0 ? (
                <div className="space-y-4">
                  {aiAdvice.map((advice, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border-l-4 ${
                        advice.type === 'success' ? 'bg-green-50 border-green-500' :
                        advice.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                        advice.type === 'info' ? 'bg-blue-50 border-blue-500' :
                        advice.type === 'achievement' ? 'bg-purple-50 border-purple-500' :
                        advice.type === 'tip' ? 'bg-orange-50 border-orange-500' :
                        advice.type === 'level' ? 'bg-indigo-50 border-indigo-500' :
                        advice.type === 'expert' ? 'bg-pink-50 border-pink-500' :
                        advice.type === 'motivation' ? 'bg-cyan-50 border-cyan-500' :
                        'bg-gray-50 border-gray-500'
                      }`}
                    >
                      <div className="flex items-start">
                        <span className="text-2xl mr-3">{advice.icon}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{advice.title}</h3>
                          <p className="text-gray-700 mb-3">{advice.message}</p>
                          <button className="text-sm font-medium text-purple-600 hover:text-purple-800 transition-colors">
                            {advice.action} →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-spinner fa-spin text-4xl text-purple-500 mb-4"></i>
                  <p className="text-gray-600">분석 중...</p>
                </div>
              )}
              
              {/* 추가 팁 */}
              <div className="mt-6 p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-lg">
                <h4 className="font-bold text-purple-800 mb-2">
                  <i className="fas fa-lightbulb mr-2"></i>
                  오늘의 팁
                </h4>
                <p className="text-sm text-purple-700">
                  꾸준함이 가장 중요합니다! 매일 작은 목표라도 달성해보세요.
                  운동은 습관이 되면 삶의 일부가 됩니다.
                </p>
              </div>
            </div>
            
            <div className="p-6 bg-gray-50 border-t">
              <button
                onClick={() => setShowAiModal(false)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WorkoutStats;
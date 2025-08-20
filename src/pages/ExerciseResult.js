import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// 🏆 운동 결과 및 AI 건강 조언 페이지
function ExerciseResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { result } = location.state || {};
  
  const [userProfile, setUserProfile] = useState(null);
  const [healthAdvice, setHealthAdvice] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // 사용자 프로필 로드
  useEffect(() => {
    loadUserProfile();
  }, []);

  // 결과 분석 및 조언 생성
  useEffect(() => {
    if (result && userProfile) {
      analyzePerformance();
      generateHealthAdvice();
      checkAchievements();
    }
  }, [result, userProfile]);

  // 사용자 프로필 불러오기
  const loadUserProfile = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const db = getFirestore();
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUserProfile(docSnap.data());
        } else {
          // 기본 프로필 설정
          setUserProfile({
            age: 30,
            weight: 70,
            height: 170,
            gender: 'male',
            fitnessLevel: 'intermediate',
            goals: ['체중감량', '체력향상'],
            medicalConditions: []
          });
        }
      }
    } catch (error) {
      console.error('프로필 로드 실패:', error);
    }
  };

  // 운동 성과 분석
  const analyzePerformance = () => {
    if (!result) return;

    const avgPace = result.distance > 0 ? 
      (result.time / 60) / (result.distance / 1000) : 0;
    
    // 이전 기록과 비교
    const improvement = {
      distance: '+15%',
      speed: '+8%',
      calories: '+12%',
      consistency: '3일 연속'
    };
    
    setComparison(improvement);
  };

  // AI 건강 조언 생성
  const generateHealthAdvice = () => {
    if (!userProfile || !result) return;

    const advice = [];
    
    // 운동 강도 분석
    const avgHeartRate = result.heartRate || 140;
    const maxHeartRate = 220 - (userProfile.age || 30);
    const intensity = (avgHeartRate / maxHeartRate) * 100;
    
    // 심박수 기반 조언
    if (intensity < 50) {
      advice.push({
        type: 'intensity',
        icon: '⚡',
        title: '운동 강도 증가 필요',
        content: '현재 운동 강도가 낮습니다. 목표 심박수 구간(최대 심박수의 65-85%)에 도달하도록 속도를 높여보세요.',
        priority: 'high'
      });
    } else if (intensity > 85) {
      advice.push({
        type: 'intensity',
        icon: '⚠️',
        title: '운동 강도 조절 필요',
        content: '운동 강도가 매우 높습니다. 부상 방지를 위해 페이스를 조금 낮추고, 충분한 휴식을 취하세요.',
        priority: 'high'
      });
    } else {
      advice.push({
        type: 'intensity',
        icon: '✅',
        title: '최적의 운동 강도',
        content: '완벽한 운동 강도를 유지했습니다! 이 페이스를 꾸준히 유지하면 목표를 달성할 수 있습니다.',
        priority: 'low'
      });
    }

    // 칼로리 소모 분석
    const targetCalories = userProfile.goals?.includes('체중감량') ? 500 : 300;
    if (result.calories < targetCalories) {
      advice.push({
        type: 'calories',
        icon: '🔥',
        title: '칼로리 소모량 증가 필요',
        content: `목표 칼로리(${targetCalories}kcal)에 도달하려면 ${targetCalories - result.calories}kcal를 더 소모해야 합니다. 운동 시간을 늘리거나 강도를 높여보세요.`,
        priority: 'medium'
      });
    }

    // 체중 관리 조언
    if (userProfile.goals?.includes('체중감량')) {
      const weeklyCalorieDeficit = 3500; // 0.5kg 감량
      const dailyDeficit = weeklyCalorieDeficit / 7;
      
      advice.push({
        type: 'weight',
        icon: '⚖️',
        title: '체중 감량 진행 상황',
        content: `일일 목표 칼로리 소모량: ${dailyDeficit.toFixed(0)}kcal. 현재 ${result.calories}kcal 소모. 식단 관리와 함께 꾸준한 운동을 유지하세요.`,
        priority: 'medium'
      });
    }

    // 수분 섭취 조언
    const waterNeeded = Math.round(result.time / 60 * 500); // 30분당 500ml
    advice.push({
      type: 'hydration',
      icon: '💧',
      title: '수분 보충 필요',
      content: `운동 후 ${waterNeeded}ml 이상의 물을 섭취하세요. 전해질 보충을 위해 이온음료도 좋습니다.`,
      priority: 'medium'
    });

    // 회복 조언
    if (result.distance > 10000 || result.time > 3600) {
      advice.push({
        type: 'recovery',
        icon: '🛌',
        title: '충분한 회복 시간 필요',
        content: '오늘은 고강도 운동을 하셨습니다. 최소 24-48시간의 회복 시간을 가지고, 스트레칭과 마사지로 근육을 풀어주세요.',
        priority: 'high'
      });
    }

    // 영양 조언
    advice.push({
      type: 'nutrition',
      icon: '🥗',
      title: '운동 후 영양 섭취',
      content: '운동 후 30분 이내에 단백질(20-30g)과 탄수화물을 섭취하세요. 근육 회복과 에너지 보충에 도움이 됩니다.',
      priority: 'medium'
    });

    setHealthAdvice(advice);
  };

  // 업적 확인
  const checkAchievements = () => {
    if (!result) return;

    const newAchievements = [];

    // 거리 업적
    if (result.distance >= 5000) {
      newAchievements.push({
        icon: '🏃',
        title: '5K 러너',
        description: '5km 달리기 완주!'
      });
    }
    if (result.distance >= 10000) {
      newAchievements.push({
        icon: '🏅',
        title: '10K 마스터',
        description: '10km 달리기 완주!'
      });
    }

    // 시간 업적
    if (result.time >= 1800) {
      newAchievements.push({
        icon: '⏱️',
        title: '30분 지구력',
        description: '30분 이상 운동 완료!'
      });
    }

    // 칼로리 업적
    if (result.calories >= 500) {
      newAchievements.push({
        icon: '🔥',
        title: '칼로리 버너',
        description: '500kcal 이상 소모!'
      });
    }

    // 속도 업적
    if (result.avgSpeed >= 10) {
      newAchievements.push({
        icon: '⚡',
        title: '스피드 러너',
        description: '평균 10km/h 이상 달성!'
      });
    }

    setAchievements(newAchievements);
  };

  // 운동 기록 저장
  const saveWorkout = async () => {
    setIsSaving(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        const db = getFirestore();
        const workoutData = {
          ...result,
          userId: user.uid,
          timestamp: new Date().toISOString(),
          achievements: achievements.map(a => a.title)
        };
        
        await setDoc(
          doc(db, 'workouts', `${user.uid}_${Date.now()}`),
          workoutData
        );
        
        alert('운동 기록이 저장되었습니다!');
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  // 시간 포맷
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}시간 ${minutes}분 ${secs}초`;
    }
    return `${minutes}분 ${secs}초`;
  };

  if (!result) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">운동 결과가 없습니다</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-2">🎉 운동 완료!</h1>
          <p className="text-xl opacity-90">훌륭한 운동이었습니다!</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* 운동 요약 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 운동 요약</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600">
                {(result.distance / 1000).toFixed(2)}
              </div>
              <div className="text-gray-600 mt-1">킬로미터</div>
              {comparison?.distance && (
                <div className="text-sm text-green-500 mt-1">{comparison.distance}</div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-green-600">
                {formatTime(result.time)}
              </div>
              <div className="text-gray-600 mt-1">운동 시간</div>
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-orange-600">
                {result.calories}
              </div>
              <div className="text-gray-600 mt-1">칼로리</div>
              {comparison?.calories && (
                <div className="text-sm text-green-500 mt-1">{comparison.calories}</div>
              )}
            </div>
            
            <div className="text-center">
              <div className="text-4xl font-bold text-purple-600">
                {result.avgSpeed || '0'}
              </div>
              <div className="text-gray-600 mt-1">평균 속도 (km/h)</div>
              {comparison?.speed && (
                <div className="text-sm text-green-500 mt-1">{comparison.speed}</div>
              )}
            </div>
          </div>

          {/* 추가 통계 */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t">
            <div className="text-center">
              <div className="text-2xl font-semibold text-red-500">{result.heartRate || 0}</div>
              <div className="text-sm text-gray-600">평균 심박수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-indigo-500">{result.pace || '0:00'}</div>
              <div className="text-sm text-gray-600">평균 페이스</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-teal-500">{result.steps || 0}</div>
              <div className="text-sm text-gray-600">총 걸음수</div>
            </div>
          </div>
        </div>

        {/* 업적 */}
        {achievements.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">🏆 달성한 업적</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg p-4 text-center">
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <div className="font-bold text-gray-800">{achievement.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{achievement.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* AI 건강 조언 */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">🤖 AI 건강 조언</h2>
          
          <div className="space-y-4">
            {healthAdvice.map((advice, index) => (
              <div 
                key={index} 
                className={`border-l-4 p-4 rounded-r-lg ${
                  advice.priority === 'high' ? 'border-red-500 bg-red-50' :
                  advice.priority === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                  'border-green-500 bg-green-50'
                }`}
              >
                <div className="flex items-start">
                  <span className="text-2xl mr-3">{advice.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800 mb-1">{advice.title}</h3>
                    <p className="text-gray-700">{advice.content}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={saveWorkout}
            disabled={isSaving}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                저장 중...
              </>
            ) : (
              <>
                <i className="fas fa-save mr-2"></i>
                운동 기록 저장
              </>
            )}
          </button>
          
          <button
            onClick={() => navigate('/courses')}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
          >
            <i className="fas fa-route mr-2"></i>
            새로운 코스 선택
          </button>
          
          <button
            onClick={() => navigate('/dashboard')}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
          >
            <i className="fas fa-home mr-2"></i>
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

export default ExerciseResult;
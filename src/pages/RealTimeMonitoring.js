import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function RealTimeMonitoring({ userLocation }) {
  const navigate = useNavigate();
  const [isExercising, setIsExercising] = useState(false);
  const [exerciseData, setExerciseData] = useState({
    distance: 0,
    time: 0,
    speed: 0,
    heartRate: 0,
    calories: 0,
    pace: '0:00'
  });
  
  const [exerciseType, setExerciseType] = useState('running');
  const [targetHeartRate, setTargetHeartRate] = useState({ min: 120, max: 160 });
  const [aiCoachMessages, setAiCoachMessages] = useState([]);

  // 운동 시뮬레이션
  useEffect(() => {
    let interval;
    
    if (isExercising) {
      interval = setInterval(() => {
        setExerciseData(prev => {
          const timeInSeconds = prev.time + 1;
          
          // 실시간 데이터 시뮬레이션
          const newDistance = prev.distance + (Math.random() * 0.01 + 0.02); // 랜덤한 속도로 증가
          const newSpeed = exerciseType === 'running' ? 
            Math.random() * 3 + 8 : // 러닝: 8-11 km/h
            Math.random() * 5 + 15; // 자전거: 15-20 km/h
          
          const newHeartRate = Math.floor(Math.random() * 20 + 140); // 140-160 BPM
          const newCalories = prev.calories + (Math.random() * 0.5 + 0.3);
          
          // 페이스 계산 (분:초 per km)
          const paceInSeconds = newSpeed > 0 ? 3600 / newSpeed : 0;
          const paceMinutes = Math.floor(paceInSeconds / 60);
          const paceSeconds = Math.floor(paceInSeconds % 60);
          const pace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
          
          return {
            distance: newDistance,
            time: timeInSeconds,
            speed: newSpeed,
            heartRate: newHeartRate,
            calories: newCalories,
            pace: pace
          };
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isExercising, exerciseType]);

  // AI 코치 메시지 생성
  useEffect(() => {
    if (isExercising && exerciseData.time % 30 === 0 && exerciseData.time > 0) {
      let message = '';
      
      if (exerciseData.heartRate > targetHeartRate.max) {
        message = '심박수가 높습니다. 속도를 조금 줄여주세요! 💓';
      } else if (exerciseData.heartRate < targetHeartRate.min) {
        message = '조금 더 빠르게 달려보세요! 화이팅! 🔥';
      } else {
        const encouragements = [
          '좋은 페이스입니다! 계속 유지하세요! 👍',
          '훌륭합니다! 이 리듬을 유지해주세요! ✨',
          '완벽한 심박수입니다! 잘하고 있어요! 💪',
          '집중력이 좋네요! 계속 파이팅! 🎯'
        ];
        message = encouragements[Math.floor(Math.random() * encouragements.length)];
      }
      
      setAiCoachMessages(prev => [
        { message, time: exerciseData.time, id: Date.now() },
        ...prev.slice(0, 4) // 최대 5개까지만 유지
      ]);
    }
  }, [exerciseData.time, exerciseData.heartRate, targetHeartRate, isExercising]);

  const startExercise = () => {
    // 실제 운동 트래킹 페이지로 이동
    navigate('/exercise-tracking', {
      state: {
        exerciseType: exerciseType,
        targetHeartRate: targetHeartRate
      }
    });
  };

  const stopExercise = () => {
    setIsExercising(false);
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getHeartRateZone = (heartRate) => {
    if (heartRate < targetHeartRate.min) return { zone: '저강도', color: 'text-blue-500', bg: 'bg-blue-100' };
    if (heartRate > targetHeartRate.max) return { zone: '고강도', color: 'text-red-500', bg: 'bg-red-100' };
    return { zone: '적정강도', color: 'text-green-500', bg: 'bg-green-100' };
  };

  const heartRateZone = getHeartRateZone(exerciseData.heartRate);

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">실시간 운동 모니터링</h2>
        <p className="text-gray-600">
          실시간으로 운동 데이터를 추적하고 AI 코치의 피드백을 받아보세요.
        </p>
      </div>

      {/* 운동 설정 */}
      {!isExercising && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">운동 설정</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                운동 타입
              </label>
              <select
                value={exerciseType}
                onChange={(e) => setExerciseType(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="running">러닝</option>
                <option value="cycling">자전거</option>
                <option value="walking">걷기</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                목표 심박수 범위
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  value={targetHeartRate.min}
                  onChange={(e) => setTargetHeartRate(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="최소"
                />
                <input
                  type="number"
                  value={targetHeartRate.max}
                  onChange={(e) => setTargetHeartRate(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="최대"
                />
              </div>
            </div>
          </div>
          
          <button
            onClick={startExercise}
            className="mt-6 w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-lg transition-colors text-lg font-semibold"
          >
            <i className="fas fa-play mr-2"></i>
            운동 시작하기
          </button>
        </div>
      )}

      {/* 실시간 모니터링 */}
      {isExercising && (
        <>
          {/* 메인 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {exerciseData.distance.toFixed(2)}
              </div>
              <div className="text-gray-600">거리 (km)</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {formatTime(exerciseData.time)}
              </div>
              <div className="text-gray-600">시간</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {exerciseData.speed.toFixed(1)}
              </div>
              <div className="text-gray-600">속도 (km/h)</div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {Math.round(exerciseData.calories)}
              </div>
              <div className="text-gray-600">칼로리</div>
            </div>
          </div>

          {/* 심박수 모니터링 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">심박수 모니터링</h3>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="text-4xl font-bold text-red-500 mr-4">
                  {exerciseData.heartRate}
                </div>
                <div>
                  <div className="text-gray-600">BPM</div>
                  <div className={`text-sm px-2 py-1 rounded-full ${heartRateZone.bg} ${heartRateZone.color}`}>
                    {heartRateZone.zone}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">목표 범위</div>
                <div className="text-lg font-semibold text-gray-800">
                  {targetHeartRate.min} - {targetHeartRate.max} BPM
                </div>
              </div>
            </div>
            
            {/* 심박수 바 */}
            <div className="relative">
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-green-500 h-4 rounded-l-full"
                  style={{ width: `${(targetHeartRate.min / 200) * 100}%` }}
                ></div>
                <div 
                  className="bg-blue-500 h-4"
                  style={{ 
                    width: `${((targetHeartRate.max - targetHeartRate.min) / 200) * 100}%`,
                    marginLeft: `${(targetHeartRate.min / 200) * 100}%`,
                    marginTop: '-16px'
                  }}
                ></div>
              </div>
              <div 
                className="absolute top-0 w-1 h-4 bg-red-500"
                style={{ left: `${(exerciseData.heartRate / 200) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* AI 코치 피드백 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">
              <i className="fas fa-robot mr-2 text-blue-500"></i>
              AI 코치 피드백
            </h3>
            
            {aiCoachMessages.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                운동을 시작하면 AI 코치가 실시간 피드백을 제공합니다.
              </div>
            ) : (
              <div className="space-y-3">
                {aiCoachMessages.map((msg) => (
                  <div key={msg.id} className="flex items-center p-3 bg-blue-50 rounded-lg">
                    <i className="fas fa-comment-dots text-blue-500 mr-3"></i>
                    <div className="flex-1">
                      <div className="text-gray-800">{msg.message}</div>
                      <div className="text-xs text-gray-500">
                        {formatTime(msg.time)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 컨트롤 버튼 */}
          <div className="flex space-x-4">
            <button
              onClick={stopExercise}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 px-6 rounded-lg transition-colors text-lg font-semibold"
            >
              <i className="fas fa-stop mr-2"></i>
              운동 종료
            </button>
            
            <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 px-6 rounded-lg transition-colors text-lg font-semibold">
              <i className="fas fa-pause mr-2"></i>
              일시정지
            </button>
          </div>
        </>
      )}

      {/* 운동 완료 후 요약 */}
      {!isExercising && exerciseData.time > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">운동 완료! 🎉</h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{exerciseData.distance.toFixed(2)}km</div>
              <div className="text-gray-600 text-sm">총 거리</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{formatTime(exerciseData.time)}</div>
              <div className="text-gray-600 text-sm">운동 시간</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{exerciseData.pace}</div>
              <div className="text-gray-600 text-sm">평균 페이스</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">{Math.round(exerciseData.calories)}</div>
              <div className="text-gray-600 text-sm">소모 칼로리</div>
            </div>
          </div>
          
          <div className="flex space-x-4">
            <button className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg transition-colors">
              <i className="fas fa-save mr-2"></i>
              기록 저장
            </button>
            <button className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg transition-colors">
              <i className="fas fa-share mr-2"></i>
              공유하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default RealTimeMonitoring;
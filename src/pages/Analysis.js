import React, { useState, useEffect } from 'react';
import WorkoutStats from '../components/WorkoutStats';
import WorkoutFeedback from '../components/WorkoutFeedback';

function Analysis() {
  // 가상의 운동 데이터 (나중에 API로 대체)
  const [workoutData, setWorkoutData] = useState({
    stats: {
      distance: 5.2,
      avgSpeed: 12.5,
      duration: '26분',
      calories: 320,
      steps: 6542
    },
    currentHeartRate: 145,
    currentPace: 5.5,
    maxHeartRate: 178,
    targetZone: {
      min: 130,
      max: 160
    },
    progress: 62, // 퍼센트
    activityType: '러닝',
    startTime: '07:30 AM',
    elapsedTime: '00:26:15',
    route: {
      name: '한강 공원 노선',
      elevationGain: 45
    }
  });

  // 심박수 데이터 포인트 (차트 시각화용)
  const [heartRateData, setHeartRateData] = useState([
    140, 142, 145, 143, 148, 152, 155, 156, 158, 156, 153, 149, 145, 147, 145
  ]);

  // 페이스 데이터 포인트 (차트 시각화용)
  const [paceData, setPaceData] = useState([
    5.2, 5.3, 5.4, 5.5, 5.6, 5.5, 5.4, 5.3, 5.4, 5.5, 5.6, 5.7, 5.6, 5.5, 5.5
  ]);

  // 실시간 데이터 시뮬레이션
  useEffect(() => {
    const timer = setInterval(() => {
      // 심박수 랜덤 변화 (140-160 사이)
      const newHeartRate = Math.floor(Math.random() * 20) + 140;
      
      // 페이스 랜덤 변화 (5.2-5.8 사이)
      const newPace = (Math.random() * 0.6 + 5.2).toFixed(1);

      // 데이터 업데이트
      setWorkoutData(prevData => ({
        ...prevData,
        currentHeartRate: newHeartRate,
        currentPace: parseFloat(newPace),
        stats: {
          ...prevData.stats,
          distance: parseFloat((prevData.stats.distance + 0.01).toFixed(2)),
          calories: prevData.stats.calories + 1
        }
      }));

      // 차트 데이터 업데이트
      setHeartRateData(prevData => {
        const newData = [...prevData, newHeartRate];
        if (newData.length > 15) newData.shift();
        return newData;
      });

      setPaceData(prevData => {
        const newData = [...prevData, parseFloat(newPace)];
        if (newData.length > 15) newData.shift();
        return newData;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // 심박 구간 계산
  const getHeartRateZone = (heartRate) => {
    if (heartRate < workoutData.targetZone.min) {
      return {
        zone: '준비 구간',
        color: 'text-blue-500',
        bgColor: 'bg-blue-100'
      };
    } else if (heartRate <= workoutData.targetZone.max) {
      return {
        zone: '유산소 구간',
        color: 'text-green-500',
        bgColor: 'bg-green-100'
      };
    } else {
      return {
        zone: '무산소 구간',
        color: 'text-red-500',
        bgColor: 'bg-red-100'
      };
    }
  };

  const currentZone = getHeartRateZone(workoutData.currentHeartRate);

  // 심박수 차트 렌더링 (간단한 선 그래프)
  const renderHeartRateChart = () => {
    const max = Math.max(...heartRateData) + 5;
    const min = Math.min(...heartRateData) - 5;
    const range = max - min;
    
    return (
      <div className="relative h-48">
        {/* 목표 심박 구간 표시 */}
        <div 
          className="absolute bg-green-50 opacity-60 w-full h-full"
          style={{
            top: `${(1 - (workoutData.targetZone.max - min) / range) * 100}%`,
            height: `${((workoutData.targetZone.max - workoutData.targetZone.min) / range) * 100}%`
          }}
        ></div>

        {/* 심박수 선 그래프 */}
        <svg className="w-full h-full">
          <polyline
            points={heartRateData.map((hr, index) => {
              const x = (index / (heartRateData.length - 1)) * 100 + '%';
              const y = (1 - (hr - min) / range) * 100 + '%';
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 데이터 포인트 */}
          {heartRateData.map((hr, index) => {
            const x = (index / (heartRateData.length - 1)) * 100 + '%';
            const y = (1 - (hr - min) / range) * 100 + '%';
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="3"
                fill="#3b82f6"
              />
            );
          })}
        </svg>

        {/* 목표 심박 라인 레이블 */}
        <div 
          className="absolute right-0 border-t border-green-400 text-xs text-green-600"
          style={{ top: `${(1 - (workoutData.targetZone.max - min) / range) * 100}%` }}
        >
          {workoutData.targetZone.max} BPM
        </div>
        <div 
          className="absolute right-0 border-t border-green-400 text-xs text-green-600"
          style={{ top: `${(1 - (workoutData.targetZone.min - min) / range) * 100}%` }}
        >
          {workoutData.targetZone.min} BPM
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* 헤더 배경 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">운동 분석</h1>
          <p className="text-blue-100 text-lg">
            실시간 운동 데이터를 모니터링하고 맞춤형 피드백을 받아보세요.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-6">
        {/* 운동 요약 대시보드 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">현재 운동: {workoutData.activityType}</h2>
              <p className="text-gray-500">시작 시간: {workoutData.startTime} • 경과 시간: {workoutData.elapsedTime}</p>
            </div>
            <div className="mt-4 md:mt-0 flex space-x-3">
              <button className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition">
                일시 정지
              </button>
              <button className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition">
                운동 종료
              </button>
            </div>
          </div>

          {/* 진행 상태 바 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">진행률</span>
              <span className="font-semibold">{workoutData.progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${workoutData.progress}%` }}
              ></div>
            </div>
          </div>

          {/* 운동 통계 */}
          <WorkoutStats stats={workoutData.stats} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 실시간 심박수 모니터링 */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">실시간 심박수</h2>
                <p className="text-gray-500 text-sm">현재 심박 구간: <span className={currentZone.color}>{currentZone.zone}</span></p>
              </div>
              <div className="p-4">
                {renderHeartRateChart()}
              </div>
              <div className="px-4 py-3 bg-gray-50 border-t">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">현재 심박수</div>
                    <div className={`text-xl font-bold ${currentZone.color}`}>{workoutData.currentHeartRate} BPM</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">최대 심박수</div>
                    <div className="text-xl font-bold text-gray-800">{workoutData.maxHeartRate} BPM</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">목표 구간</div>
                    <div className="text-xl font-bold text-green-600">{workoutData.targetZone.min}-{workoutData.targetZone.max} BPM</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* AI 코치 피드백 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">AI 코치 피드백</h2>
              </div>
              <WorkoutFeedback 
                heartRate={workoutData.currentHeartRate} 
                pace={workoutData.currentPace}
                route={workoutData.route}
              />
            </div>
          </div>

          {/* 오른쪽 사이드 패널 */}
          <div>
            {/* 페이스 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">현재 페이스</h2>
              <div className="flex justify-center items-center mb-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">{workoutData.currentPace}</div>
                  <div className="text-gray-500">min/km</div>
                </div>
              </div>
              <div className="h-32 bg-blue-50 rounded-lg p-2">
                <svg className="w-full h-full">
                  <polyline
                    points={paceData.map((pace, index) => {
                      const x = (index / (paceData.length - 1)) * 100 + '%';
                      const y = ((pace - 5) / 1) * 100 + '%';
                      return `${x},${y}`;
                    }).join(' ')}
                    fill="none"
                    stroke="#60a5fa"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="mt-3 flex justify-between text-sm text-gray-500">
                <div>5분 전</div>
                <div>현재</div>
              </div>
            </div>

            {/* 노선 정보 */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-800 mb-3">노선 정보</h2>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <div className="font-medium text-blue-800 mb-1">{workoutData.route.name}</div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-gray-500">누적 고도</div>
                    <div className="font-semibold">{workoutData.route.elevationGain}m</div>
                  </div>
                  <div>
                    <div className="text-gray-500">남은 거리</div>
                    <div className="font-semibold">3.2km</div>
                  </div>
                </div>
              </div>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition">
                전체 노선 보기
              </button>
            </div>

            {/* 날씨 정보 */}
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-lg shadow-md p-6 text-white">
              <h2 className="text-xl font-bold mb-2">현재 날씨</h2>
              <div className="flex items-center justify-between mb-4">
                <div className="text-4xl font-bold">22°C</div>
                <div className="text-right">
                  <div>맑음</div>
                  <div className="text-blue-100">습도: 65%</div>
                </div>
              </div>
              <div className="text-sm text-blue-100">
                운동하기 좋은 날씨입니다. 충분한 수분을 섭취하세요.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
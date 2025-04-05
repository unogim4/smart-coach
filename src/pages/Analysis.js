import React, { useState } from 'react';
import WorkoutStats from '../components/WorkoutStats';
import WorkoutFeedback from '../components/WorkoutFeedback';

function Analysis() {
  // 가상의 운동 데이터 (나중에 API로 대체)
  const [workoutData, setWorkoutData] = useState({
    stats: {
      distance: 5.2,
      avgSpeed: 12.5,
      duration: '26분',
      calories: 320
    },
    currentHeartRate: 145,
    currentPace: 5.5
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">운동 분석</h2>
      <p className="mb-6">실시간 운동 데이터 모니터링 및 피드백</p>
      
      <div className="mb-6">
        <WorkoutStats stats={workoutData.stats} />
      </div>
      
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-3">실시간 피드백</h3>
        <WorkoutFeedback 
          heartRate={workoutData.currentHeartRate} 
          pace={workoutData.currentPace} 
        />
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-xl font-semibold mb-3">심박수 모니터링</h3>
        <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
          <p className="text-gray-500">심박수 그래프가 여기에 표시됩니다.</p>
        </div>
        
        <div className="mt-4 flex justify-between">
          <div>
            <div className="text-sm text-gray-500">현재 심박수</div>
            <div className="text-xl font-bold">{workoutData.currentHeartRate} BPM</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">현재 페이스</div>
            <div className="text-xl font-bold">{workoutData.currentPace} min/km</div>
          </div>
          
          <div>
            <div className="text-sm text-gray-500">목표 구간</div>
            <div className="text-xl font-bold">130-160 BPM</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Analysis;
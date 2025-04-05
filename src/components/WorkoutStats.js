import React from 'react';

function WorkoutStats({ stats }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">운동 통계</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">총 거리</div>
          <div className="text-xl font-bold">{stats.distance} km</div>
        </div>
        
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">평균 속도</div>
          <div className="text-xl font-bold">{stats.avgSpeed} km/h</div>
        </div>
        
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">총 시간</div>
          <div className="text-xl font-bold">{stats.duration}</div>
        </div>
        
        <div className="border p-3 rounded">
          <div className="text-sm text-gray-500">소모 칼로리</div>
          <div className="text-xl font-bold">{stats.calories} kcal</div>
        </div>
      </div>
    </div>
  );
}

export default WorkoutStats;
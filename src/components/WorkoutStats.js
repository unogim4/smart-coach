import React from 'react';

function WorkoutStats({ stats }) {
  // 통계 아이콘 컴포넌트
  const StatsIcon = ({ type }) => {
    switch(type) {
      case 'distance':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        );
      case 'speed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'time':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'calories':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      case 'steps':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
      {/* 총 거리 */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-blue-500 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">총 거리</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{stats.distance}</div>
              <div className="ml-1 text-sm text-gray-500">km</div>
            </div>
          </div>
          <StatsIcon type="distance" />
        </div>
      </div>
      
      {/* 평균 속도 */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-green-500 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">평균 속도</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{stats.avgSpeed}</div>
              <div className="ml-1 text-sm text-gray-500">km/h</div>
            </div>
          </div>
          <StatsIcon type="speed" />
        </div>
      </div>
      
      {/* 총 시간 */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-orange-500 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">총 시간</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{stats.duration}</div>
            </div>
          </div>
          <StatsIcon type="time" />
        </div>
      </div>
      
      {/* 소모 칼로리 */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-red-500 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">소모 칼로리</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{stats.calories}</div>
              <div className="ml-1 text-sm text-gray-500">kcal</div>
            </div>
          </div>
          <StatsIcon type="calories" />
        </div>
      </div>
      
      {/* 걸음 수 */}
      <div className="bg-white rounded-lg shadow-sm p-4 border-l-4 border-purple-500 hover:shadow-md transition duration-300">
        <div className="flex justify-between items-start">
          <div>
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">걸음 수</div>
            <div className="mt-1 flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">{stats.steps?.toLocaleString() || 0}</div>
              <div className="ml-1 text-sm text-gray-500">걸음</div>
            </div>
          </div>
          <StatsIcon type="steps" />
        </div>
      </div>
    </div>
  );
}

export default WorkoutStats;
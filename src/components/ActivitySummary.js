import React from 'react';
import { useNavigate } from 'react-router-dom';

function ActivitySummary({ activities }) {
  const navigate = useNavigate();
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">활동 요약</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-3 rounded text-center">
          <div className="text-3xl font-bold text-blue-600">{activities.totalWorkouts}</div>
          <div className="text-sm text-gray-600">총 운동 횟수</div>
        </div>
        
        <div className="bg-green-50 p-3 rounded text-center">
          <div className="text-3xl font-bold text-green-600">{activities.totalDistance} km</div>
          <div className="text-sm text-gray-600">총 거리</div>
        </div>
        
        <div className="bg-purple-50 p-3 rounded text-center">
          <div className="text-3xl font-bold text-purple-600">{activities.totalDuration}</div>
          <div className="text-sm text-gray-600">총 시간</div>
        </div>
        
        <div className="bg-orange-50 p-3 rounded text-center">
          <div className="text-3xl font-bold text-orange-600">{activities.totalCalories} kcal</div>
          <div className="text-sm text-gray-600">총 칼로리</div>
        </div>
      </div>
      
      <h4 className="font-semibold mb-2">최근 활동</h4>
      <div className="border rounded">
        {activities.recent.length > 0 ? (
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">날짜</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">유형</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">거리</th>
                <th className="py-2 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">시간</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {activities.recent.map((activity, index) => (
                <tr 
                  key={index} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => activity.id && navigate(`/workout/${activity.id}`)}
                >
                  <td className="py-2 px-4 whitespace-nowrap">{activity.date}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{activity.type}</td>
                  <td className="py-2 px-4 whitespace-nowrap">{activity.distance} km</td>
                  <td className="py-2 px-4 whitespace-nowrap">{activity.duration}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-4 text-center text-gray-500">
            아직 기록된 활동이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivitySummary;
import React from 'react';

function RecentActivitiesCard({ activities }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">최근 활동</h3>
      
      {activities.length > 0 ? (
        <div className="space-y-3">
          {activities.map((activity, index) => (
            <div key={index} className="border-b pb-3 last:border-0">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{activity.type}</div>
                  <div className="text-sm text-gray-500">{activity.date}</div>
                </div>
                <div>
                  <div className="text-right font-medium">{activity.distance} km</div>
                  <div className="text-sm text-gray-500">{activity.duration}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500">
          아직 기록된 활동이 없습니다.
        </div>
      )}
      
      <div className="mt-3 text-center">
        <button className="text-blue-500 hover:text-blue-700">
          모든 활동 보기
        </button>
      </div>
    </div>
  );
}

export default RecentActivitiesCard;
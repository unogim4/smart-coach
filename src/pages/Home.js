import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import WeatherWidget from '../components/WeatherWidget';
import QuickStartCard from '../components/QuickStartCard';
import RecentActivitiesCard from '../components/RecentActivitiesCard';
import RecommendedCourseMap from '../components/RecommendedCourseMap';

function Home() {
  // 가상의 날씨 데이터 (나중에 API로 대체)
  const [weatherData, setWeatherData] = useState({
    condition: 'sunny',
    temperature: 23,
    location: '서울, 대한민국',
    airQuality: {
      level: 'good',
      value: 45,
      description: '좋음'
    },
    recommendation: '오늘은 야외 운동하기 좋은 날씨입니다. 자외선 차단제를 바르고 충분한 수분 섭취를 하세요.'
  });
  
  // 가상의 활동 데이터 (나중에 API로 대체)
  const [recentActivities, setRecentActivities] = useState([
    { type: '러닝', date: '2025-04-03', distance: 5.2, duration: '30분' },
    { type: '사이클링', date: '2025-04-01', distance: 15.7, duration: '50분' },
    { type: '러닝', date: '2025-03-30', distance: 8.3, duration: '45분' }
  ]);

  // 사용자 운동 선호도 (나중에 실제 사용자 설정으로 대체)
  const initialPreferences = {
    type: 'running',
    maxDistance: 10,
    maxStartDistance: 5,
    difficulty: 'beginner'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">스마트 러닝 & 바이크 코치</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <WeatherWidget weather={weatherData} />
          
          {/* 추천 코스 지도 추가 */}
          <div className="mt-6">
            <RecommendedCourseMap initialPreferences={initialPreferences} />
          </div>
          
          {/* 운동 목표 카드 */}
          <div className="mt-6 bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">운동 목표</h3>
            <p className="text-sm">이번 주 목표: 30km 달성 중 23.2km 완료 (77%)</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: '77%' }}></div>
            </div>
          </div>
        </div>
        
        <div>
          <QuickStartCard />
          
          <div className="mt-6">
            <RecentActivitiesCard activities={recentActivities} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
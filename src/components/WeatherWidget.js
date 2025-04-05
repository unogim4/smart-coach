import React from 'react';

function WeatherWidget({ weather }) {
  // 날씨 아이콘 선택 함수
  const getWeatherIcon = (condition) => {
    switch(condition) {
      case 'sunny':
        return (
          <svg className="h-10 w-10 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'cloudy':
        return (
          <svg className="h-10 w-10 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'rainy':
        return (
          <svg className="h-10 w-10 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8zm9.53-7.376a.75.75 0 00-1.06-1.06l-2.505 2.505-1.5-1.5a.75.75 0 00-1.06 1.06l1.97 1.97a.75.75 0 001.06 0l2.975-2.975z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="h-10 w-10 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm0 14a6 6 0 110-12 6 6 0 010 12z" clipRule="evenodd" />
          </svg>
        );
    }
  };
  
  // 대기질 수준에 따른 색상 설정
  const getAirQualityColor = (level) => {
    switch(level) {
      case 'good':
        return 'text-green-500';
      case 'moderate':
        return 'text-yellow-500';
      case 'unhealthy':
        return 'text-orange-500';
      case 'very-unhealthy':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };
  
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">오늘의 날씨</h3>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getWeatherIcon(weather.condition)}
          <div className="ml-3">
            <div className="text-3xl font-bold">{weather.temperature}°C</div>
            <div className="text-gray-500">{weather.location}</div>
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm">대기질</div>
          <div className={`font-semibold ${getAirQualityColor(weather.airQuality.level)}`}>
            {weather.airQuality.value} ({weather.airQuality.description})
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t text-sm text-gray-500">
        {weather.recommendation}
      </div>
    </div>
  );
}

export default WeatherWidget;
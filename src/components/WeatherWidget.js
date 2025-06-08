import React, { useState, useEffect } from 'react';
import { getWeatherInfo } from '../services/realWeatherService';

function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      if (location) {
        try {
          const weatherData = await getWeatherInfo(location.lat, location.lng);
          setWeather(weatherData);
        } catch (error) {
          console.error('날씨 정보 로드 실패:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchWeather();
    // 5분마다 날씨 정보 업데이트
    const interval = setInterval(fetchWeather, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-6 animate-pulse">
        <div className="h-20 bg-blue-400 rounded"></div>
      </div>
    );
  }

  const getWeatherIcon = (sky) => {
    const icons = {
      '맑음': '☀️',
      '구름조금': '🌤️',
      '구름많음': '⛅',
      '흐림': '☁️',
      '비': '🌧️',
      '눈': '❄️',
      '소나기': '🌦️'
    };
    return icons[sky] || '☀️';
  };

  const getAirQualityColor = (grade) => {
    const colors = {
      '좋음': 'text-green-400',
      '보통': 'text-yellow-400',
      '나쁨': 'text-orange-400',
      '매우나쁨': 'text-red-400'
    };
    return colors[grade] || 'text-gray-400';
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg mb-1">오늘의 날씨</h3>
          <p className="text-blue-100">현재 위치</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end">
            <span className="text-4xl mr-2">{getWeatherIcon(weather?.sky)}</span>
            <div className="text-3xl font-bold">{weather?.temperature}°C</div>
          </div>
          <div className="text-blue-100">{weather?.sky}</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-4 gap-2">
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs">습도</div>
          <div className="font-bold">{weather?.humidity}%</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs">바람</div>
          <div className="font-bold">{weather?.windSpeed} m/s</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs">미세먼지</div>
          <div className="font-bold">{weather?.pm10 || '-'}</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-xs">대기질</div>
          <div className={`font-bold ${getAirQualityColor(weather?.airQuality)}`}>
            {weather?.airQuality}
          </div>
        </div>
      </div>

      {/* 운동 추천 */}
      {weather?.recommendation && (
        <div className={`mt-4 p-3 rounded-lg ${
          weather.recommendation.status === 'good' ? 'bg-green-500 bg-opacity-20' :
          weather.recommendation.status === 'caution' ? 'bg-yellow-500 bg-opacity-20' :
          'bg-red-500 bg-opacity-20'
        }`}>
          <div className="font-medium text-sm">
            {weather.recommendation.status === 'good' ? '🏃‍♂️' : 
             weather.recommendation.status === 'caution' ? '⚠️' : '🏠'} 
            {weather.recommendation.message}
          </div>
          {weather.recommendation.warnings.length > 0 && (
            <ul className="text-xs mt-1 space-y-1">
              {weather.recommendation.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;

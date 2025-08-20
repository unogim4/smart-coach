import React, { useState, useEffect } from 'react';
import { 
  getCurrentWeather, 
  getAirQuality, 
  getExerciseRecommendation,
  getWeatherIconUrl,
  checkWeatherAPIStatus 
} from '../services/weatherService';

function WeatherWidget({ location }) {
  const [weather, setWeather] = useState(null);
  const [airQuality, setAirQuality] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRealData, setIsRealData] = useState(false);

  useEffect(() => {
    const fetchWeatherData = async () => {
      if (!location) return;
      
      try {
        setLoading(true);
        console.log('📍 날씨 위젯: 위치 정보', location);
        
        // API 상태 확인
        const apiStatus = await checkWeatherAPIStatus();
        console.log('🔍 API 상태:', apiStatus ? '✅ 연결됨' : '⚠️ 더미 모드');
        
        // 병렬로 날씨와 대기질 정보 가져오기
        const [weatherData, airQualityData] = await Promise.all([
          getCurrentWeather(location.lat, location.lng),
          getAirQuality(location.lat, location.lng)
        ]);
        
        console.log('🌤️ 날씨 데이터:', weatherData);
        console.log('🌫️ 대기질 데이터:', airQualityData);
        
        // 운동 추천 생성
        const exerciseRec = getExerciseRecommendation(weatherData, airQualityData);
        
        setWeather(weatherData);
        setAirQuality(airQualityData);
        setRecommendation(exerciseRec);
        setIsRealData(weatherData.isRealData || false);
        
      } catch (error) {
        console.error('❌ 날씨 정보 로드 실패:', error);
        // 에러 시 기본값 설정
        setWeather({
          temperature: '--',
          description: '날씨 정보 없음',
          humidity: '--',
          windSpeed: '--',
          icon: '01d'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
    
    // 5분마다 날씨 정보 업데이트 (실제 API 사용 시)
    const interval = setInterval(fetchWeatherData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [location]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-8 bg-blue-400 rounded w-32 mb-2"></div>
          <div className="h-12 bg-blue-400 rounded w-24"></div>
          <div className="mt-4 grid grid-cols-4 gap-2">
            <div className="h-16 bg-blue-400 rounded"></div>
            <div className="h-16 bg-blue-400 rounded"></div>
            <div className="h-16 bg-blue-400 rounded"></div>
            <div className="h-16 bg-blue-400 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg p-6 mb-6">
        <div className="text-center">
          <i className="fas fa-exclamation-triangle text-3xl mb-2"></i>
          <p>날씨 정보를 불러올 수 없습니다</p>
        </div>
      </div>
    );
  }

  // 대기질 색상 결정
  const getAirQualityColor = () => {
    if (!airQuality) return 'text-gray-300';
    
    switch(airQuality.level) {
      case '매우 좋음': return 'text-blue-300';
      case '좋음': return 'text-green-300';
      case '보통': return 'text-yellow-300';
      case '나쁨': return 'text-orange-300';
      case '매우 나쁨': return 'text-red-300';
      default: return 'text-gray-300';
    }
  };

  // 추천 배경색 결정
  const getRecommendationBg = () => {
    if (!recommendation) return 'bg-gray-500 bg-opacity-20';
    
    switch(recommendation.color) {
      case 'green': return 'bg-green-500 bg-opacity-20';
      case 'blue': return 'bg-blue-500 bg-opacity-20';
      case 'yellow': return 'bg-yellow-500 bg-opacity-20';
      case 'orange': return 'bg-orange-500 bg-opacity-20';
      case 'red': return 'bg-red-500 bg-opacity-20';
      case 'purple': return 'bg-purple-500 bg-opacity-20';
      default: return 'bg-gray-500 bg-opacity-20';
    }
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-6 relative">
      {/* 실제/더미 데이터 표시 */}
      {!isRealData && (
        <div className="absolute top-2 right-2">
          <span className="bg-yellow-500 bg-opacity-75 text-xs px-2 py-1 rounded">
            더미 데이터
          </span>
        </div>
      )}
      
      {/* 상단 정보 */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-bold text-xl mb-1">
            {weather.cityName || '현재 위치'}
          </h3>
          <p className="text-blue-100 text-sm">
            {new Date().toLocaleString('ko-KR', { 
              month: 'long', 
              day: 'numeric', 
              weekday: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        
        <div className="text-right">
          <div className="flex items-center justify-end">
            {weather.icon && (
              <img 
                src={getWeatherIconUrl(weather.icon)} 
                alt={weather.description}
                className="w-16 h-16 -mr-2"
              />
            )}
            <div>
              <div className="text-4xl font-bold">
                {weather.temperature}°C
              </div>
              <div className="text-sm text-blue-100">
                체감 {weather.feelsLike || weather.temperature}°C
              </div>
            </div>
          </div>
          <div className="text-blue-100 mt-1">
            {weather.description}
          </div>
        </div>
      </div>
      
      {/* 세부 정보 그리드 */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <i className="fas fa-tint text-lg mb-1"></i>
          <div className="text-xs text-blue-100">습도</div>
          <div className="font-bold text-sm">{weather.humidity}%</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <i className="fas fa-wind text-lg mb-1"></i>
          <div className="text-xs text-blue-100">바람</div>
          <div className="font-bold text-sm">{weather.windSpeed} m/s</div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <i className="fas fa-smog text-lg mb-1"></i>
          <div className="text-xs text-blue-100">PM2.5</div>
          <div className="font-bold text-sm">
            {airQuality?.pm25 || '--'} 
            <span className="text-xs">μg/m³</span>
          </div>
        </div>
        
        <div className="bg-white bg-opacity-20 rounded-lg p-3 text-center">
          <i className="fas fa-lungs text-lg mb-1"></i>
          <div className="text-xs text-blue-100">대기질</div>
          <div className={`font-bold text-sm ${getAirQualityColor()}`}>
            {airQuality?.level || '측정중'}
          </div>
        </div>
      </div>

      {/* 추가 정보 (실제 데이터일 때만) */}
      {isRealData && (
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white bg-opacity-10 rounded p-2 text-center">
            <i className="fas fa-eye text-sm"></i>
            <span className="text-xs ml-1">가시거리</span>
            <div className="text-sm font-semibold">{weather.visibility}km</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded p-2 text-center">
            <i className="fas fa-cloud text-sm"></i>
            <span className="text-xs ml-1">구름</span>
            <div className="text-sm font-semibold">{weather.clouds}%</div>
          </div>
          <div className="bg-white bg-opacity-10 rounded p-2 text-center">
            <i className="fas fa-compress-alt text-sm"></i>
            <span className="text-xs ml-1">기압</span>
            <div className="text-sm font-semibold">{weather.pressure}hPa</div>
          </div>
        </div>
      )}

      {/* 운동 추천 */}
      {recommendation && (
        <div className={`rounded-lg p-4 ${getRecommendationBg()}`}>
          <div className="flex items-center mb-2">
            <i className={`${recommendation.icon} text-2xl mr-3`}></i>
            <div>
              <div className="font-bold">{recommendation.recommendation}</div>
              <div className="text-sm text-blue-100">{recommendation.reason}</div>
            </div>
          </div>
          
          {recommendation.tips && recommendation.tips.length > 0 && (
            <div className="mt-3 pt-3 border-t border-white border-opacity-20">
              <div className="text-xs font-semibold mb-1">💡 운동 팁</div>
              <ul className="text-xs space-y-1 text-blue-100">
                {recommendation.tips.map((tip, index) => (
                  <li key={index}>• {tip}</li>
                ))}
              </ul>
            </div>
          )}
          
          {recommendation.alternativeOptions && recommendation.alternativeOptions.length > 0 && (
            <div className="mt-2">
              <div className="text-xs font-semibold mb-1">🏃 추천 옵션</div>
              <div className="flex flex-wrap gap-1">
                {recommendation.alternativeOptions.map((option, index) => (
                  <span key={index} className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs">
                    {option}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* API 키 설정 안내 (더미 데이터일 때) */}
      {!isRealData && (
        <div className="mt-4 p-3 bg-yellow-500 bg-opacity-20 rounded-lg">
          <div className="text-xs">
            <i className="fas fa-info-circle mr-1"></i>
            실제 날씨를 보려면 OpenWeather API 키를 설정하세요
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherWidget;
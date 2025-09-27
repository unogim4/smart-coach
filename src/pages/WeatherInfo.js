import React, { useState, useEffect } from 'react';
import { getCurrentWeather, getWeatherForecast, getAirQuality, getLocationInfo } from '../services/weatherService';
import { getAIExerciseRecommendation } from '../services/aiWeatherRecommendation';

function WeatherInfo({ userLocation, weatherData, setWeatherData }) {
  const [forecast, setForecast] = useState([]);
  const [airQuality, setAirQuality] = useState(null);
  const [locationInfo, setLocationInfo] = useState(null);
  const [exerciseRecommendation, setExerciseRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  // 날씨 아이콘 매핑
  const getWeatherIcon = (iconCode) => {
    const iconMap = {
      '01d': 'fas fa-sun text-yellow-500',
      '01n': 'fas fa-moon text-gray-400',
      '02d': 'fas fa-cloud-sun text-yellow-400',
      '02n': 'fas fa-cloud-moon text-gray-400',
      '03d': 'fas fa-cloud text-gray-500',
      '03n': 'fas fa-cloud text-gray-500',
      '04d': 'fas fa-cloud text-gray-600',
      '04n': 'fas fa-cloud text-gray-600',
      '09d': 'fas fa-cloud-rain text-blue-500',
      '09n': 'fas fa-cloud-rain text-blue-500',
      '10d': 'fas fa-cloud-sun-rain text-blue-400',
      '10n': 'fas fa-cloud-moon-rain text-blue-400',
      '11d': 'fas fa-bolt text-purple-500',
      '11n': 'fas fa-bolt text-purple-500',
      '13d': 'fas fa-snowflake text-blue-200',
      '13n': 'fas fa-snowflake text-blue-200',
      '50d': 'fas fa-smog text-gray-400',
      '50n': 'fas fa-smog text-gray-400'
    };
    return iconMap[iconCode] || 'fas fa-sun text-yellow-500';
  };

  // 대기질 색상 매핑
  const getAQIColor = (aqi) => {
    switch(aqi) {
      case 1: return 'text-blue-500 bg-blue-100';
      case 2: return 'text-green-500 bg-green-100';
      case 3: return 'text-yellow-500 bg-yellow-100';
      case 4: return 'text-orange-500 bg-orange-100';
      case 5: return 'text-red-500 bg-red-100';
      default: return 'text-gray-500 bg-gray-100';
    }
  };

  // 날씨 데이터 새로고침
  const refreshWeatherData = async () => {
    if (!userLocation) return;
    
    setLoading(true);
    try {
      const [currentWeather, weatherForecast, airQualityData, location] = await Promise.all([
        getCurrentWeather(userLocation.lat, userLocation.lng),
        getWeatherForecast(userLocation.lat, userLocation.lng),
        getAirQuality(userLocation.lat, userLocation.lng),
        getLocationInfo(userLocation.lat, userLocation.lng)
      ]);

      setWeatherData(currentWeather);
      setForecast(weatherForecast);
      setAirQuality(airQualityData);
      setLocationInfo(location);
      
      // AI 운동 추천 생성
      const recommendation = getAIExerciseRecommendation(currentWeather, airQualityData);
      setExerciseRecommendation(recommendation);
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('날씨 데이터 가져오기 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (userLocation) {
      refreshWeatherData();
    }
  }, [userLocation]); // refreshWeatherData는 내부 함수이므로 dependency에 포함하지 않음

  // 자동 새로고침 (10분마다)
  useEffect(() => {
    const interval = setInterval(() => {
      if (userLocation) {
        refreshWeatherData();
      }
    }, 600000); // 10분

    return () => clearInterval(interval);
  }, [userLocation]); // refreshWeatherData는 내부 함수이므로 dependency에 포함하지 않음

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">날씨 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">날씨 정보</h2>
            <p className="text-gray-600">
              {locationInfo?.address || '위치 정보 없음'}
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-1">
                마지막 업데이트: {lastUpdated.toLocaleString('ko-KR')}
              </p>
            )}
          </div>
          <button
            onClick={refreshWeatherData}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <i className="fas fa-sync-alt mr-2"></i>
            새로고침
          </button>
        </div>
      </div>

      {/* 현재 날씨 */}
      {weatherData && (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">현재 날씨</h3>
              <div className="flex items-center mb-4">
                <i className={`${getWeatherIcon(weatherData.icon)} text-4xl mr-4`}></i>
                <div>
                  <div className="text-5xl font-bold">{weatherData.temperature}°C</div>
                  <div className="text-blue-100">체감 {weatherData.feelsLike}°C</div>
                </div>
              </div>
              <div className="text-lg capitalize">{weatherData.description}</div>
            </div>
            
            <div className="text-right">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-blue-100">습도</div>
                  <div className="text-xl font-bold">{weatherData.humidity}%</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-blue-100">바람</div>
                  <div className="text-xl font-bold">{weatherData.windSpeed}m/s</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-blue-100">가시거리</div>
                  <div className="text-xl font-bold">{weatherData.visibility}km</div>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-3">
                  <div className="text-blue-100">기압</div>
                  <div className="text-xl font-bold">{weatherData.pressure}hPa</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 대기질 정보 */}
      {airQuality && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">대기질 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center mb-4">
                <div className={`text-3xl font-bold mr-4 px-4 py-2 rounded-lg ${getAQIColor(airQuality.aqi)}`}>
                  {airQuality.level}
                </div>
                <div>
                  <div className="text-gray-600">AQI 지수</div>
                  <div className="text-2xl font-bold text-gray-800">{airQuality.aqi}/5</div>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">PM2.5:</span>
                  <span className="font-semibold">{airQuality.pm25} μg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">PM10:</span>
                  <span className="font-semibold">{airQuality.pm10} μg/m³</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">오존(O3):</span>
                  <span className="font-semibold">{airQuality.o3} μg/m³</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="text-center">
                <i className={`fas fa-leaf text-6xl mb-4 ${
                  airQuality.aqi <= 2 ? 'text-green-500' :
                  airQuality.aqi <= 3 ? 'text-yellow-500' :
                  airQuality.aqi <= 4 ? 'text-orange-500' : 'text-red-500'
                }`}></i>
                <div className="text-gray-600">
                  {airQuality.aqi <= 2 ? '운동하기 좋은 환경입니다' :
                   airQuality.aqi <= 3 ? '보통 수준의 대기질입니다' :
                   '실외 운동을 자제해주세요'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI 운동 추천 */}
      {exerciseRecommendation && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg shadow-lg p-6 border border-purple-200">
          <div className="flex items-center mb-4">
            <i className="fas fa-robot text-3xl text-purple-600 mr-3"></i>
            <h3 className="text-xl font-semibold text-gray-800">AI 코치 날씨 분석</h3>
          </div>
          
          <div className={`bg-white rounded-lg p-6 border-l-4 border-${exerciseRecommendation.color}-500`}>
            <div className="flex items-start mb-4">
              <i className={`${exerciseRecommendation.icon} text-3xl text-${exerciseRecommendation.color}-500 mr-4`}></i>
              <div className="flex-1">
                <div className="text-xl font-bold text-gray-800 mb-2">
                  {exerciseRecommendation.recommendation}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium bg-${exerciseRecommendation.color}-100 text-${exerciseRecommendation.color}-800`}>
                  {exerciseRecommendation.type}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-start">
                <i className="fas fa-info-circle text-blue-500 mr-2 mt-1"></i>
                <div>
                  <div className="font-medium text-gray-800">날씨 분석</div>
                  <div className="text-gray-700">{exerciseRecommendation.reason}</div>
                </div>
              </div>
              
              {exerciseRecommendation.tips && exerciseRecommendation.tips.length > 0 && (
                <div className="flex items-start">
                  <i className="fas fa-lightbulb text-yellow-500 mr-2 mt-1"></i>
                  <div>
                    <div className="font-medium text-gray-800">AI 코치 팁</div>
                    <ul className="text-gray-700 space-y-1">
                      {exerciseRecommendation.tips.map((tip, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-purple-500 mr-2">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
              
              {exerciseRecommendation.warning && (
                <div className="flex items-start bg-yellow-50 rounded-lg p-3">
                  <i className="fas fa-exclamation-triangle text-yellow-600 mr-2 mt-1"></i>
                  <div>
                    <div className="font-medium text-yellow-800">주의사항</div>
                    <div className="text-yellow-700">{exerciseRecommendation.warning}</div>
                  </div>
                </div>
              )}
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-gray-600">추천 운동 시간:</span>
                    <span className="ml-2 font-medium text-gray-800">
                      {exerciseRecommendation.bestTime || '오전 6-8시, 오후 6-8시'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-600">운동 가능도:</span>
                    <span className="ml-2">
                      {[...Array(5)].map((_, i) => (
                        <i 
                          key={i}
                          className={`fas fa-star text-sm ${
                            i < (exerciseRecommendation.rating || 3) 
                              ? 'text-yellow-500' 
                              : 'text-gray-300'
                          }`}
                        ></i>
                      ))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5일 날씨 예보 */}
      {forecast.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">5일 날씨 예보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {forecast.map((day, index) => (
              <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">
                  {index === 0 ? '내일' : 
                   index === 1 ? '모레' : 
                   day.date.toLocaleDateString('ko-KR', { weekday: 'short' })}
                </div>
                <div className="mb-3">
                  <i className={`${getWeatherIcon(day.icon)} text-2xl`}></i>
                </div>
                <div className="text-sm text-gray-800 mb-2 capitalize">{day.description}</div>
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-red-500">{day.temperature.max}°</span>
                  <span className="text-gray-500">{day.temperature.min}°</span>
                </div>
                <div className="mt-2 text-xs text-gray-500">
                  <div>습도: {day.humidity}%</div>
                  <div>바람: {day.windSpeed}m/s</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 일출/일몰 정보 */}
      {weatherData && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">일출/일몰 정보</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center p-4 bg-orange-50 rounded-lg">
              <i className="fas fa-sun text-3xl text-orange-500 mr-4"></i>
              <div>
                <div className="text-gray-600">일출</div>
                <div className="text-xl font-bold text-gray-800">
                  {weatherData.sunrise?.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) || '--:--'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center p-4 bg-purple-50 rounded-lg">
              <i className="fas fa-moon text-3xl text-purple-500 mr-4"></i>
              <div>
                <div className="text-gray-600">일몰</div>
                <div className="text-xl font-bold text-gray-800">
                  {weatherData.sunset?.toLocaleTimeString('ko-KR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }) || '--:--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WeatherInfo;
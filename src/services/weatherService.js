// Google Maps API를 활용한 날씨 서비스 (더미 데이터 활용)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// Google Maps Geocoding API를 사용하여 위치 정보 가져오기
export const getLocationInfo = async (lat, lng) => {
  try {
    if (!window.google) {
      console.warn('Google Maps API가 로드되지 않음');
      return getDefaultLocationInfo();
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=ko`
    );
    
    if (!response.ok) {
      throw new Error('위치 정보를 가져올 수 없습니다.');
    }
    
    const data = await response.json();
    
    if (data.results && data.results.length > 0) {
      return {
        address: data.results[0].formatted_address,
        city: data.results[0].address_components.find(
          component => component.types.includes('locality')
        )?.long_name || '서울',
        district: data.results[0].address_components.find(
          component => component.types.includes('sublocality_level_1')
        )?.long_name || ''
      };
    }
    
    return getDefaultLocationInfo();
  } catch (error) {
    console.error('위치 정보 가져오기 실패:', error);
    return getDefaultLocationInfo();
  }
};

// 기본 위치 정보
const getDefaultLocationInfo = () => ({
  address: '서울특별시',
  city: '서울',
  district: '강남구'
});

// 실제 날씨 API 대신 시뮬레이션된 날씨 데이터 사용
export const getCurrentWeather = async (lat, lng) => {
  try {
    // 위치 정보 가져오기
    const locationInfo = await getLocationInfo(lat, lng);
    
    // 현재 시간 기반으로 동적 날씨 데이터 생성
    const now = new Date();
    const hour = now.getHours();
    const season = getSeason(now.getMonth());
    
    // 시간대와 계절에 따른 온도 계산
    let baseTemp = getSeasonalTemp(season);
    let timeAdjustment = getTimeAdjustment(hour);
    
    const weatherData = {
      temperature: Math.round(baseTemp + timeAdjustment + (Math.random() - 0.5) * 4),
      feelsLike: Math.round(baseTemp + timeAdjustment + (Math.random() - 0.5) * 3),
      humidity: Math.round(50 + Math.random() * 30),
      description: getWeatherDescription(hour, season),
      icon: generateWeatherIcon(hour, season),
      windSpeed: Math.round((Math.random() * 5 + 1) * 10) / 10,
      windDirection: Math.round(Math.random() * 360),
      clouds: Math.round(Math.random() * 60),
      visibility: Math.round((8 + Math.random() * 4) * 10) / 10,
      pressure: Math.round(1010 + Math.random() * 20),
      sunrise: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 6, 30),
      sunset: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 18, 30),
      cityName: locationInfo.city,
      uvIndex: getUVIndex(hour)
    };

    return weatherData;
  } catch (error) {
    console.error('날씨 정보 가져오기 실패:', error);
    return getDummyWeatherData();
  }
};

// 계절 판단 함수
const getSeason = (month) => {
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
};

// 계절별 기본 온도
const getSeasonalTemp = (season) => {
  switch(season) {
    case 'spring': return 18;
    case 'summer': return 28;
    case 'autumn': return 20;
    case 'winter': return 5;
    default: return 15;
  }
};

// 시간대별 온도 조정
const getTimeAdjustment = (hour) => {
  if (hour >= 6 && hour <= 8) return -3; // 새벽
  if (hour >= 9 && hour <= 11) return 0;  // 오전
  if (hour >= 12 && hour <= 16) return 3; // 낮
  if (hour >= 17 && hour <= 19) return 1; // 저녁
  return -2; // 밤
};

// 날씨 설명 생성
const getWeatherDescription = (hour, season) => {
  const descriptions = {
    spring: ['맑음', '구름 조금', '흐림', '봄비'],
    summer: ['맑음', '더움', '소나기', '구름 많음'],
    autumn: ['맑음', '선선함', '흐림', '구름 조금'],
    winter: ['맑음', '춥음', '흐림', '눈']
  };
  
  const seasonDescriptions = descriptions[season] || descriptions.spring;
  return seasonDescriptions[Math.floor(Math.random() * seasonDescriptions.length)];
};

// 날씨 아이콘 생성 (내부 함수)
const generateWeatherIcon = (hour, season) => {
  const isDay = hour >= 6 && hour <= 18;
  const icons = {
    day: ['01d', '02d', '03d', '04d'],
    night: ['01n', '02n', '03n', '04n']
  };
  
  const timeIcons = isDay ? icons.day : icons.night;
  return timeIcons[Math.floor(Math.random() * timeIcons.length)];
};

// UV 지수 계산
const getUVIndex = (hour) => {
  if (hour >= 10 && hour <= 14) return Math.round(6 + Math.random() * 4);
  if (hour >= 8 && hour <= 16) return Math.round(3 + Math.random() * 3);
  return Math.round(Math.random() * 2);
};

// 5일 날씨 예보 생성
export const getWeatherForecast = async (lat, lng) => {
  try {
    const dailyForecast = [];
    const today = new Date();
    
    for (let i = 1; i <= 5; i++) {
      const futureDate = new Date(today.getTime() + (i * 24 * 60 * 60 * 1000));
      const season = getSeason(futureDate.getMonth());
      const baseTemp = getSeasonalTemp(season);
      
      dailyForecast.push({
        date: futureDate,
        temperature: {
          min: Math.round(baseTemp - 5 + Math.random() * 3),
          max: Math.round(baseTemp + 3 + Math.random() * 4)
        },
        description: getWeatherDescription(12, season),
        icon: generateWeatherIcon(12, season),
        humidity: Math.round(50 + Math.random() * 30),
        windSpeed: Math.round((Math.random() * 5 + 1) * 10) / 10,
        clouds: Math.round(Math.random() * 70)
      });
    }
    
    return dailyForecast;
  } catch (error) {
    console.error('날씨 예보 가져오기 실패:', error);
    return getDummyForecastData();
  }
};

// 대기질 정보 시뮬레이션
export const getAirQuality = async (lat, lng) => {
  try {
    // 현재 시간과 계절을 고려한 대기질 시뮬레이션
    const now = new Date();
    const hour = now.getHours();
    
    // 출퇴근 시간대에는 대기질이 나빠지는 경향
    let aqiBase = 2; // 기본적으로 좋음
    if ((hour >= 7 && hour <= 9) || (hour >= 17 && hour <= 19)) {
      aqiBase = 3; // 보통
    }
    
    const aqi = Math.min(5, aqiBase + Math.floor(Math.random() * 2));
    
    const getAQILevel = (aqi) => {
      switch(aqi) {
        case 1: return '매우 좋음';
        case 2: return '좋음';
        case 3: return '보통';
        case 4: return '나쁨';
        case 5: return '매우 나쁨';
        default: return '좋음';
      }
    };
    
    return {
      aqi: aqi,
      level: getAQILevel(aqi),
      pm25: Math.round(5 + aqi * 8 + Math.random() * 10),
      pm10: Math.round(15 + aqi * 12 + Math.random() * 15),
      o3: Math.round(40 + Math.random() * 40),
      no2: Math.round(10 + aqi * 5 + Math.random() * 10),
      so2: Math.round(3 + Math.random() * 5),
      co: Math.round(150 + aqi * 50 + Math.random() * 100)
    };
  } catch (error) {
    console.error('대기질 정보 가져오기 실패:', error);
    return {
      aqi: 2,
      level: '좋음',
      pm25: 12,
      pm10: 25,
      o3: 60,
      no2: 15,
      so2: 5,
      co: 200
    };
  }
};

// 운동 추천 로직
export const getExerciseRecommendation = (weatherData, airQualityData) => {
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.windSpeed;
  const description = weatherData.description.toLowerCase();
  const aqi = airQualityData.aqi;
  
  // 날씨 조건 확인
  const isRaining = description.includes('비') || description.includes('rain');
  const isSnowing = description.includes('눈') || description.includes('snow');
  const isExtremeCold = temp < -5;
  const isExtremeHot = temp > 35;
  const isHighWind = windSpeed > 10;
  const isPoorAirQuality = aqi >= 4;
  
  if (isRaining || isSnowing) {
    return {
      type: '실내 운동',
      recommendation: '홈트레이닝',
      reason: '우천으로 인한 실내 운동 권장',
      icon: 'fas fa-home',
      color: 'blue'
    };
  }
  
  if (isPoorAirQuality) {
    return {
      type: '실내 운동',
      recommendation: '실내 체육관',
      reason: '대기질 불량으로 실내 운동 권장',
      icon: 'fas fa-dumbbell',
      color: 'red'
    };
  }
  
  if (isExtremeCold) {
    return {
      type: '실내 운동',
      recommendation: '실내 러닝머신',
      reason: '극한 추위로 인한 실내 운동 권장',
      icon: 'fas fa-running',
      color: 'blue'
    };
  }
  
  if (isExtremeHot) {
    return {
      type: '이른 아침/늦은 저녁 운동',
      recommendation: '새벽/저녁 러닝',
      reason: '폭염으로 인한 시간대 조정 권장',
      icon: 'fas fa-moon',
      color: 'orange'
    };
  }
  
  if (isHighWind) {
    return {
      type: '실내 운동',
      recommendation: '요가/필라테스',
      reason: '강풍으로 인한 실내 운동 권장',
      icon: 'fas fa-spa',
      color: 'purple'
    };
  }
  
  // 좋은 날씨 조건
  if (temp >= 15 && temp <= 25 && humidity < 70 && aqi <= 3) {
    return {
      type: '야외 운동',
      recommendation: '러닝/사이클링',
      reason: '운동하기 완벽한 날씨입니다!',
      icon: 'fas fa-running',
      color: 'green'
    };
  }
  
  // 일반적인 경우
  return {
    type: '가벼운 야외 운동',
    recommendation: '걷기/조깅',
    reason: '적당한 야외 활동이 가능합니다',
    icon: 'fas fa-walking',
    color: 'blue'
  };
};

// 더미 데이터 (백업용)
const getDummyWeatherData = () => ({
  temperature: 22,
  feelsLike: 24,
  humidity: 65,
  description: '맑음',
  icon: '01d',
  windSpeed: 3.2,
  windDirection: 180,
  clouds: 20,
  visibility: 10,
  pressure: 1013,
  sunrise: new Date(),
  sunset: new Date(),
  cityName: '서울',
  uvIndex: 5
});

const getDummyForecastData = () => {
  const forecast = [];
  const today = new Date();
  
  for (let i = 1; i <= 5; i++) {
    forecast.push({
      date: new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)),
      temperature: { 
        min: Math.round(15 + Math.random() * 5), 
        max: Math.round(20 + Math.random() * 8) 
      },
      description: ['맑음', '구름 조금', '흐림', '소나기'][Math.floor(Math.random() * 4)],
      icon: '01d',
      humidity: Math.round(50 + Math.random() * 30),
      windSpeed: Math.round((Math.random() * 5 + 1) * 10) / 10,
      clouds: Math.round(Math.random() * 60)
    });
  }
  
  return forecast;
};

// 아이콘 매핑 함수 (export)
export const getWeatherIconClass = (iconCode) => {
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

// 호환성을 위한 기존 함수들
export const getWeatherData = getCurrentWeather;
export const getWeatherIcon = getWeatherIconClass;

export const isGoodWeatherForRunning = (weather) => {
  return weather.temperature >= 15 && weather.temperature <= 25 && weather.humidity < 70;
};

export const getWeatherRecommendation = (weather) => {
  const good = isGoodWeatherForRunning(weather);
  return {
    status: good ? 'excellent' : 'caution',
    message: good ? '운동하기 좋은 날씨입니다!' : '운동 시 주의하세요',
    tips: good ? ['충분한 수분 섭취'] : ['날씨를 확인하세요']
  };
};

// Google Maps 관련 함수들 (호환성 유지)
export const initializeWeatherLayer = () => {
  console.log('Weather layer initialized (simulated)');
};

export const toggleWeatherLayer = () => {
  console.log('Weather layer toggled (simulated)');
};
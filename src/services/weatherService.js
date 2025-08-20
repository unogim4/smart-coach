// 🌤️ OpenWeather API를 활용한 실제 날씨 서비스

const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// API 키 확인
const checkAPIKey = () => {
  if (!OPENWEATHER_API_KEY || OPENWEATHER_API_KEY === 'YOUR_API_KEY_HERE') {
    console.warn('⚠️ OpenWeather API 키가 설정되지 않았습니다!');
    console.log('📝 설정 방법:');
    console.log('1. https://openweathermap.org/api 에서 무료 API 키 발급');
    console.log('2. .env.local 파일에 REACT_APP_OPENWEATHER_API_KEY=발급받은키 추가');
    console.log('3. npm start로 앱 재시작');
    return false;
  }
  return true;
};

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

// 🌟 실제 날씨 API 호출 (OpenWeather)
export const getCurrentWeather = async (lat, lng) => {
  try {
    // API 키 체크
    if (!checkAPIKey()) {
      console.log('🎭 더미 데이터 모드로 전환...');
      return getDummyWeatherData();
    }

    console.log('🌤️ OpenWeather API 호출 중...');
    
    // OpenWeather Current Weather API
    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ API 키가 유효하지 않습니다!');
      } else if (response.status === 429) {
        console.error('❌ API 호출 한도 초과!');
      } else {
        console.error(`❌ API 오류: ${response.status}`);
      }
      return getDummyWeatherData();
    }
    
    const data = await response.json();
    console.log('✅ 실제 날씨 데이터 수신:', data);
    
    // 위치 정보 가져오기
    const locationInfo = await getLocationInfo(lat, lng);
    
    // OpenWeather 데이터를 우리 형식으로 변환
    const weatherData = {
      temperature: Math.round(data.main.temp),
      feelsLike: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      description: data.weather[0].description,
      icon: data.weather[0].icon,
      windSpeed: data.wind.speed,
      windDirection: data.wind.deg || 0,
      clouds: data.clouds.all,
      visibility: (data.visibility / 1000).toFixed(1), // 미터를 킬로미터로
      pressure: data.main.pressure,
      sunrise: new Date(data.sys.sunrise * 1000),
      sunset: new Date(data.sys.sunset * 1000),
      cityName: data.name || locationInfo.city,
      uvIndex: 0, // UV는 별도 API 필요
      
      // 추가 정보
      tempMin: Math.round(data.main.temp_min),
      tempMax: Math.round(data.main.temp_max),
      weatherMain: data.weather[0].main,
      country: data.sys.country,
      timezone: data.timezone,
      
      // 실제 데이터 플래그
      isRealData: true
    };

    return weatherData;
    
  } catch (error) {
    console.error('날씨 정보 가져오기 실패:', error);
    return getDummyWeatherData();
  }
};

// 🌟 5일 날씨 예보 (OpenWeather Forecast API)
export const getWeatherForecast = async (lat, lng) => {
  try {
    if (!checkAPIKey()) {
      return getDummyForecastData();
    }

    console.log('📅 5일 예보 API 호출 중...');
    
    // OpenWeather 5 Day Forecast API
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=kr`;
    
    const response = await fetch(forecastUrl);
    
    if (!response.ok) {
      console.error('예보 API 오류:', response.status);
      return getDummyForecastData();
    }
    
    const data = await response.json();
    console.log('✅ 실제 예보 데이터 수신');
    
    // 5일간 일별 데이터로 변환 (3시간 간격 데이터를 일별로 그룹화)
    const dailyData = {};
    
    data.list.forEach(item => {
      const date = new Date(item.dt * 1000).toDateString();
      
      if (!dailyData[date]) {
        dailyData[date] = {
          temps: [],
          humidity: [],
          description: item.weather[0].description,
          icon: item.weather[0].icon,
          windSpeed: [],
          clouds: [],
          rain: 0,
          snow: 0
        };
      }
      
      dailyData[date].temps.push(item.main.temp);
      dailyData[date].humidity.push(item.main.humidity);
      dailyData[date].windSpeed.push(item.wind.speed);
      dailyData[date].clouds.push(item.clouds.all);
      
      if (item.rain && item.rain['3h']) {
        dailyData[date].rain += item.rain['3h'];
      }
      if (item.snow && item.snow['3h']) {
        dailyData[date].snow += item.snow['3h'];
      }
    });
    
    // 일별 데이터 정리
    const dailyForecast = Object.keys(dailyData).slice(1, 6).map((dateKey, index) => {
      const dayData = dailyData[dateKey];
      const temps = dayData.temps;
      
      return {
        date: new Date(dateKey),
        temperature: {
          min: Math.round(Math.min(...temps)),
          max: Math.round(Math.max(...temps)),
          avg: Math.round(temps.reduce((a, b) => a + b, 0) / temps.length)
        },
        description: dayData.description,
        icon: dayData.icon,
        humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
        windSpeed: (dayData.windSpeed.reduce((a, b) => a + b, 0) / dayData.windSpeed.length).toFixed(1),
        clouds: Math.round(dayData.clouds.reduce((a, b) => a + b, 0) / dayData.clouds.length),
        precipitation: dayData.rain + dayData.snow,
        isRealData: true
      };
    });
    
    return dailyForecast;
    
  } catch (error) {
    console.error('날씨 예보 가져오기 실패:', error);
    return getDummyForecastData();
  }
};

// 🌟 대기질 정보 (OpenWeather Air Pollution API)
export const getAirQuality = async (lat, lng) => {
  try {
    if (!checkAPIKey()) {
      return getDummyAirQuality();
    }

    console.log('🌫️ 대기질 API 호출 중...');
    
    // OpenWeather Air Pollution API
    const airUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}`;
    
    const response = await fetch(airUrl);
    
    if (!response.ok) {
      console.error('대기질 API 오류:', response.status);
      return getDummyAirQuality();
    }
    
    const data = await response.json();
    console.log('✅ 실제 대기질 데이터 수신:', data);
    
    const components = data.list[0].components;
    const aqi = data.list[0].main.aqi;
    
    const getAQILevel = (aqi) => {
      switch(aqi) {
        case 1: return '매우 좋음';
        case 2: return '좋음';
        case 3: return '보통';
        case 4: return '나쁨';
        case 5: return '매우 나쁨';
        default: return '알 수 없음';
      }
    };
    
    return {
      aqi: aqi,
      level: getAQILevel(aqi),
      pm25: Math.round(components.pm2_5),
      pm10: Math.round(components.pm10),
      o3: Math.round(components.o3),
      no2: Math.round(components.no2),
      so2: Math.round(components.so2),
      co: Math.round(components.co / 100), // μg/m³를 mg/m³로
      nh3: Math.round(components.nh3),
      no: Math.round(components.no),
      isRealData: true
    };
    
  } catch (error) {
    console.error('대기질 정보 가져오기 실패:', error);
    return getDummyAirQuality();
  }
};

// 🌟 UV 지수 (OpenWeather UV API) - 별도 구독 필요
export const getUVIndex = async (lat, lng) => {
  try {
    if (!checkAPIKey()) {
      return getDummyUVIndex();
    }

    // UV API는 유료 플랜이 필요하므로 현재 날씨 기반으로 추정
    const weather = await getCurrentWeather(lat, lng);
    const hour = new Date().getHours();
    
    // 날씨와 시간대 기반 UV 추정
    let uvIndex = 0;
    
    if (hour >= 10 && hour <= 16) {
      if (weather.clouds < 30) {
        uvIndex = 6 + Math.random() * 4; // 맑은 날 낮
      } else if (weather.clouds < 70) {
        uvIndex = 3 + Math.random() * 3; // 구름 조금
      } else {
        uvIndex = 1 + Math.random() * 2; // 흐림
      }
    } else if (hour >= 8 && hour <= 18) {
      uvIndex = Math.random() * 3;
    }
    
    return {
      value: Math.round(uvIndex),
      level: uvIndex < 3 ? '낮음' : uvIndex < 6 ? '보통' : uvIndex < 8 ? '높음' : '매우 높음'
    };
    
  } catch (error) {
    console.error('UV 지수 가져오기 실패:', error);
    return getDummyUVIndex();
  }
};

// 운동 추천 로직 (실제 데이터 기반)
export const getExerciseRecommendation = (weatherData, airQualityData) => {
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.windSpeed;
  const description = weatherData.description.toLowerCase();
  const weatherMain = weatherData.weatherMain?.toLowerCase() || '';
  const aqi = airQualityData.aqi;
  
  // 날씨 조건 확인
  const isRaining = weatherMain.includes('rain') || description.includes('비');
  const isSnowing = weatherMain.includes('snow') || description.includes('눈');
  const isCloudy = weatherMain.includes('cloud') || description.includes('구름');
  const isThunderstorm = weatherMain.includes('thunderstorm') || description.includes('천둥');
  const isExtremeCold = temp < -5;
  const isExtremeHot = temp > 35;
  const isHighWind = windSpeed > 10;
  const isPoorAirQuality = aqi >= 4;
  
  // 세부 추천 생성
  let recommendation = {
    type: '',
    recommendation: '',
    reason: '',
    icon: '',
    color: '',
    tips: [],
    alternativeOptions: []
  };
  
  if (isThunderstorm) {
    recommendation = {
      type: '실내 운동',
      recommendation: '홈트레이닝',
      reason: '천둥번개로 인한 안전 문제',
      icon: 'fas fa-bolt',
      color: 'purple',
      tips: ['절대 야외 운동 금지', '실내 운동으로 대체'],
      alternativeOptions: ['홈트레이닝', '실내 체육관', '요가']
    };
  } else if (isRaining) {
    recommendation = {
      type: '실내 운동',
      recommendation: '실내 러닝머신',
      reason: `비가 오고 있습니다 (${weatherData.description})`,
      icon: 'fas fa-cloud-rain',
      color: 'blue',
      tips: ['미끄러운 노면 주의', '실내 운동 권장'],
      alternativeOptions: ['러닝머신', '실내 자전거', '근력 운동']
    };
  } else if (isSnowing) {
    recommendation = {
      type: '실내 운동',
      recommendation: '실내 체육관',
      reason: `눈이 오고 있습니다 (${weatherData.description})`,
      icon: 'fas fa-snowflake',
      color: 'lightblue',
      tips: ['빙판길 주의', '보온 장비 필수'],
      alternativeOptions: ['실내 체육관', '수영장', '홈트레이닝']
    };
  } else if (isPoorAirQuality) {
    recommendation = {
      type: '실내 운동',
      recommendation: '실내 체육관',
      reason: `대기질 ${airQualityData.level} (PM2.5: ${airQualityData.pm25})`,
      icon: 'fas fa-smog',
      color: 'gray',
      tips: ['마스크 착용 필수', '실내 운동 강력 권장'],
      alternativeOptions: ['필터 있는 실내 체육관', '홈트레이닝']
    };
  } else if (isExtremeCold) {
    recommendation = {
      type: '실내 운동',
      recommendation: '실내 러닝머신',
      reason: `극한 추위 (${temp}°C)`,
      icon: 'fas fa-temperature-low',
      color: 'blue',
      tips: ['체온 유지 중요', '충분한 준비운동'],
      alternativeOptions: ['실내 러닝', '홈트레이닝', '온수 수영장']
    };
  } else if (isExtremeHot) {
    recommendation = {
      type: '이른 아침/늦은 저녁',
      recommendation: '새벽/저녁 러닝',
      reason: `폭염 주의 (${temp}°C)`,
      icon: 'fas fa-temperature-high',
      color: 'red',
      tips: ['충분한 수분 섭취', '그늘진 코스 선택', '10-15분마다 휴식'],
      alternativeOptions: ['새벽 5-7시', '저녁 7-9시', '실내 운동']
    };
  } else if (isHighWind) {
    recommendation = {
      type: '실내 운동',
      recommendation: '실내 운동',
      reason: `강풍 주의 (${windSpeed}m/s)`,
      icon: 'fas fa-wind',
      color: 'teal',
      tips: ['균형 유지 어려움', '날림 물체 주의'],
      alternativeOptions: ['실내 트랙', '홈트레이닝']
    };
  } else if (temp >= 15 && temp <= 25 && humidity < 70 && aqi <= 2) {
    recommendation = {
      type: '야외 운동',
      recommendation: '러닝/사이클링',
      reason: '완벽한 운동 날씨입니다! 🌟',
      icon: 'fas fa-sun',
      color: 'green',
      tips: ['최적의 컨디션', '장거리 운동 추천', '야외 활동 적극 권장'],
      alternativeOptions: ['러닝', '사이클링', '등산', '야외 운동']
    };
  } else if (temp >= 10 && temp < 15) {
    recommendation = {
      type: '야외 운동',
      recommendation: '가벼운 러닝',
      reason: '선선한 운동하기 좋은 날씨',
      icon: 'fas fa-cloud-sun',
      color: 'lightgreen',
      tips: ['얇은 겉옷 준비', '준비운동 충분히'],
      alternativeOptions: ['조깅', '빠른 걷기', '자전거']
    };
  } else if (isCloudy && !isRaining) {
    recommendation = {
      type: '야외 운동',
      recommendation: '러닝/걷기',
      reason: '흐리지만 운동하기 적합',
      icon: 'fas fa-cloud',
      color: 'gray',
      tips: ['자외선 차단', '시원한 날씨 활용'],
      alternativeOptions: ['러닝', '하이킹', '야외 운동']
    };
  } else {
    recommendation = {
      type: '가벼운 야외 운동',
      recommendation: '걷기/조깅',
      reason: '적당한 야외 활동 가능',
      icon: 'fas fa-walking',
      color: 'blue',
      tips: ['날씨 변화 주의', '적절한 운동 강도 유지'],
      alternativeOptions: ['걷기', '가벼운 조깅', '스트레칭']
    };
  }
  
  // 실제 데이터 플래그 추가
  recommendation.isRealData = weatherData.isRealData || false;
  
  return recommendation;
};

// 더미 데이터 (API 실패 시 백업)
const getDummyWeatherData = () => ({
  temperature: 22,
  feelsLike: 24,
  humidity: 65,
  description: '맑음 (더미 데이터)',
  icon: '01d',
  windSpeed: 3.2,
  windDirection: 180,
  clouds: 20,
  visibility: 10,
  pressure: 1013,
  sunrise: new Date(),
  sunset: new Date(),
  cityName: '서울',
  uvIndex: 5,
  weatherMain: 'Clear',
  isRealData: false
});

const getDummyForecastData = () => {
  const forecast = [];
  const today = new Date();
  
  for (let i = 1; i <= 5; i++) {
    forecast.push({
      date: new Date(today.getTime() + (i * 24 * 60 * 60 * 1000)),
      temperature: { 
        min: Math.round(15 + Math.random() * 5), 
        max: Math.round(20 + Math.random() * 8),
        avg: Math.round(17 + Math.random() * 6)
      },
      description: '더미 데이터',
      icon: '01d',
      humidity: Math.round(50 + Math.random() * 30),
      windSpeed: Math.round((Math.random() * 5 + 1) * 10) / 10,
      clouds: Math.round(Math.random() * 60),
      precipitation: 0,
      isRealData: false
    });
  }
  
  return forecast;
};

const getDummyAirQuality = () => ({
  aqi: 2,
  level: '좋음 (더미)',
  pm25: 12,
  pm10: 25,
  o3: 60,
  no2: 15,
  so2: 5,
  co: 2,
  isRealData: false
});

const getDummyUVIndex = () => ({
  value: 5,
  level: '보통 (추정치)',
  isRealData: false
});

// 아이콘 매핑 함수
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

// OpenWeather 아이콘 URL 생성
export const getWeatherIconUrl = (iconCode) => {
  return `https://openweathermap.org/img/wn/${iconCode}@2x.png`;
};

// 호환성을 위한 기존 함수들
export const getWeatherData = getCurrentWeather;
export const getWeatherIcon = getWeatherIconClass;

export const isGoodWeatherForRunning = (weather) => {
  return weather.temperature >= 15 && 
         weather.temperature <= 25 && 
         weather.humidity < 70 &&
         !weather.description.includes('비') &&
         !weather.description.includes('눈');
};

export const getWeatherRecommendation = (weather) => {
  const good = isGoodWeatherForRunning(weather);
  return {
    status: good ? 'excellent' : 'caution',
    message: good ? '운동하기 좋은 날씨입니다!' : '운동 시 주의하세요',
    tips: good ? ['충분한 수분 섭취'] : ['날씨를 확인하세요'],
    isRealData: weather.isRealData || false
  };
};

// 날씨 데이터 초기화 (앱 시작 시)
export const initializeWeatherService = () => {
  if (checkAPIKey()) {
    console.log('✅ OpenWeather API 준비 완료!');
    return true;
  } else {
    console.log('⚠️ OpenWeather API 키 설정 필요');
    return false;
  }
};

// 디버그용 - API 상태 확인
export const checkWeatherAPIStatus = async () => {
  console.log('🔍 Weather API 상태 확인...');
  console.log('API Key 설정:', checkAPIKey() ? '✅' : '❌');
  
  if (checkAPIKey()) {
    try {
      // 서울 좌표로 테스트
      const testLat = 37.5665;
      const testLng = 126.9780;
      const weather = await getCurrentWeather(testLat, testLng);
      
      if (weather.isRealData) {
        console.log('✅ API 연결 성공!');
        console.log('현재 서울 날씨:', weather.description, weather.temperature + '°C');
        return true;
      } else {
        console.log('⚠️ 더미 데이터 사용 중');
        return false;
      }
    } catch (error) {
      console.error('❌ API 테스트 실패:', error);
      return false;
    }
  }
  
  return false;
};
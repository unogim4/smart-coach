// 날씨 및 대기질 데이터를 가져오는 서비스

// 단일 위치에 대한 날씨 정보 가져오기
export const getWeatherByLocation = async (lat, lng) => {
  try {
    // OpenWeatherMap API 사용
    const apiKey = '6a73ea1a0f3c57bad18de4ca75c33c4b'; // 예시 키입니다. 실제 사용시 환경변수로 관리하세요.
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric&lang=kr`
    );
    
    if (!response.ok) {
      throw new Error('날씨 데이터를 가져오는데 실패했습니다');
    }
    
    const data = await response.json();
    
    return {
      temperature: data.main.temp,
      feelsLike: data.main.feels_like,
      humidity: data.main.humidity,
      windSpeed: data.wind.speed,
      weather: {
        main: data.weather[0].main,
        description: data.weather[0].description,
        icon: data.weather[0].icon
      },
      location: {
        name: data.name,
        country: data.sys.country
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('날씨 데이터 가져오기 오류:', error);
    
    // 오류 발생 시 기본 날씨 데이터 반환 (테스트용)
    return {
      temperature: 22,
      feelsLike: 23,
      humidity: 65,
      windSpeed: 3.5,
      weather: {
        main: 'Clear',
        description: '맑음',
        icon: '01d'
      },
      location: {
        name: '서울',
        country: 'KR'
      },
      timestamp: new Date().toISOString(),
      isDefaultData: true // 이 데이터가 기본값임을 표시
    };
  }
};

// 대기질 정보 가져오기
export const getAirQualityByLocation = async (lat, lng) => {
  try {
    // OpenWeatherMap API의 Air Pollution 데이터 사용
    const apiKey = '6a73ea1a0f3c57bad18de4ca75c33c4b'; // 예시 키입니다
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error('대기질 데이터를 가져오는데 실패했습니다');
    }
    
    const data = await response.json();
    
    // AQI(Air Quality Index) 값에 따른 상태 매핑
    const aqiStatus = ['', '좋음', '보통', '나쁨', '상당히 나쁨', '위험'];
    
    return {
      aqi: data.list[0].main.aqi, // 1(좋음)~5(위험)
      status: aqiStatus[data.list[0].main.aqi],
      components: {
        co: data.list[0].components.co, // 일산화탄소 (μg/m3)
        no: data.list[0].components.no, // 일산화질소 (μg/m3)
        no2: data.list[0].components.no2, // 이산화질소 (μg/m3)
        o3: data.list[0].components.o3, // 오존 (μg/m3)
        so2: data.list[0].components.so2, // 이산화황 (μg/m3)
        pm2_5: data.list[0].components.pm2_5, // 미세먼지 PM2.5 (μg/m3)
        pm10: data.list[0].components.pm10, // 미세먼지 PM10 (μg/m3)
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('대기질 데이터 가져오기 오류:', error);
    
    // 오류 발생 시 기본 대기질 데이터 반환 (테스트용)
    return {
      aqi: 2,
      status: '보통',
      components: {
        co: 400.5,
        no: 0.5,
        no2: 30.2,
        o3: 55.3,
        so2: 10.1,
        pm2_5: 15.2,
        pm10: 28.7,
      },
      timestamp: new Date().toISOString(),
      isDefaultData: true // 이 데이터가 기본값임을 표시
    };
  }
};

// 날씨 상태에 따른 운동 추천 생성
export const getExerciseRecommendation = (weatherData, airQualityData) => {
  // 미세먼지 상태 점수화 (0:좋음 ~ 5:매우 나쁨)
  const airQualityScore = airQualityData.aqi;
  
  // 날씨 상태 점수화 (0:좋음 ~ 5:매우 나쁨)
  let weatherScore = 0;
  const weatherMain = weatherData.weather.main.toLowerCase();
  
  if (weatherMain.includes('clear') || weatherMain.includes('sun')) {
    weatherScore = 0; // 맑음: 매우 좋음
  } else if (weatherMain.includes('cloud') || weatherMain.includes('cloudy')) {
    weatherScore = 1; // 구름: 좋음
  } else if (weatherMain.includes('mist') || weatherMain.includes('fog')) {
    weatherScore = 2; // 안개: 보통
  } else if (weatherMain.includes('rain') || weatherMain.includes('drizzle')) {
    weatherScore = 3; // 비: 나쁨
  } else if (weatherMain.includes('thunder') || weatherMain.includes('storm')) {
    weatherScore = 4; // 폭풍: 매우 나쁨
  } else if (weatherMain.includes('snow')) {
    weatherScore = 4; // 눈: 매우 나쁨
  }
  
  // 온도 점수화 (0:좋음 ~ 5:매우 나쁨)
  let temperatureScore = 0;
  const temp = weatherData.temperature;
  
  if (temp >= 15 && temp <= 25) {
    temperatureScore = 0; // 15~25도: 매우 좋음
  } else if (temp >= 10 && temp < 15) {
    temperatureScore = 1; // 10~15도: 좋음
  } else if (temp >= 25 && temp <= 30) {
    temperatureScore = 1; // 25~30도: 좋음
  } else if (temp >= 5 && temp < 10) {
    temperatureScore = 2; // 5~10도: 보통
  } else if (temp > 30 && temp <= 33) {
    temperatureScore = 2; // 30~33도: 보통
  } else if (temp >= 0 && temp < 5) {
    temperatureScore = 3; // 0~5도: 나쁨
  } else if (temp > 33 && temp <= 35) {
    temperatureScore = 3; // 33~35도: 나쁨
  } else if (temp < 0) {
    temperatureScore = 4; // 0도 미만: 매우 나쁨
  } else if (temp > 35) {
    temperatureScore = 4; // 35도 초과: 매우 나쁨
  }
  
  // 종합 점수 (날씨, 미세먼지, 온도 중 가장 안 좋은 점수 채택)
  const overallScore = Math.max(weatherScore, airQualityScore, temperatureScore);
  
  // 종합 점수에 따른 추천 정보
  const recommendations = {
    exerciseType: '',
    recommendation: '',
    intensity: '',
    preparations: []
  };
  
  if (overallScore <= 1) {
    // 좋음
    recommendations.exerciseType = '야외 운동 권장';
    recommendations.recommendation = 
      '날씨가 좋고 대기질도 양호하니 야외에서 충분히 운동하세요.';
    recommendations.intensity = '보통~높음';
    recommendations.preparations = ['물 충분히 준비', '자외선 차단제'];
    
  } else if (overallScore === 2) {
    // 보통
    recommendations.exerciseType = '가벼운 야외 운동 가능';
    recommendations.recommendation = 
      '적당한 날씨와 대기 상태입니다. 무리하지 않는 선에서 야외 운동을 즐기세요.';
    recommendations.intensity = '낮음~보통';
    recommendations.preparations = ['물 충분히 준비', '마스크 착용 고려'];
    
  } else if (overallScore === 3) {
    // 나쁨
    recommendations.exerciseType = '실내 운동 권장';
    recommendations.recommendation = 
      '날씨나 대기 상태가 좋지 않습니다. 실내 운동을 고려하세요.';
    recommendations.intensity = '낮음';
    recommendations.preparations = ['야외 운동시 마스크 필수', '가능하면 실내 운동 선택'];
    
  } else {
    // 매우 나쁨
    recommendations.exerciseType = '실내 운동만 권장';
    recommendations.recommendation = 
      '날씨나 대기 상태가 매우 좋지 않습니다. 실내에서만 운동하세요.';
    recommendations.intensity = '매우 낮음';
    recommendations.preparations = ['야외 활동 자제', '실내 운동 선택'];
  }
  
  // 특수 상황 처리
  if (weatherMain.includes('rain') || weatherMain.includes('storm')) {
    recommendations.preparations.push('우천 대비 장비', '미끄럼 주의');
  }
  
  if (temp >= 30) {
    recommendations.preparations.push('열사병 주의', '충분한 수분 섭취');
  }
  
  if (temp <= 5) {
    recommendations.preparations.push('보온 장비 필수', '워밍업 충분히');
  }
  
  return recommendations;
};
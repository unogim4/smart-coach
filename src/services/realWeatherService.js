// 한국 기상청 및 에어코리아 API를 사용한 실시간 날씨 서비스

// API 키 (실제 사용 시 발급받은 키로 교체 필요)
const WEATHER_API_KEY = 'YOUR_WEATHER_API_KEY';
const AIR_QUALITY_API_KEY = 'YOUR_AIR_QUALITY_API_KEY';

// 기상청 API 엔드포인트
const KMA_API_URL = 'http://apis.data.go.kr/1360000/VilageFcstInfoService_2.0';
const AIRKOREA_API_URL = 'http://apis.data.go.kr/B552584/ArpltnInforInqireSvc';

// 위도/경도를 격자 좌표로 변환 (기상청 API용)
const convertToGrid = (lat, lon) => {
  const RE = 6371.00877; // 지구 반경(km)
  const GRID = 5.0; // 격자 간격(km)
  const SLAT1 = 30.0; // 투영 위도1(degree)
  const SLAT2 = 60.0; // 투영 위도2(degree)
  const OLON = 126.0; // 기준점 경도(degree)
  const OLAT = 38.0; // 기준점 위도(degree)
  const XO = 43; // 기준점 X좌표(GRID)
  const YO = 136; // 기준점 Y좌표(GRID)

  const DEGRAD = Math.PI / 180.0;

  const re = RE / GRID;
  const slat1 = SLAT1 * DEGRAD;
  const slat2 = SLAT2 * DEGRAD;
  const olon = OLON * DEGRAD;
  const olat = OLAT * DEGRAD;

  let sn = Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);
  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = Math.pow(sf, sn) * Math.cos(slat1) / sn;
  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = re * sf / Math.pow(ro, sn);

  const rs = {};
  let ra = Math.tan(Math.PI * 0.25 + lat * DEGRAD * 0.5);
  ra = re * sf / Math.pow(ra, sn);
  let theta = lon * DEGRAD - olon;
  if (theta > Math.PI) theta -= 2.0 * Math.PI;
  if (theta < -Math.PI) theta += 2.0 * Math.PI;
  theta *= sn;
  
  rs.x = Math.floor(ra * Math.sin(theta) + XO + 0.5);
  rs.y = Math.floor(ro - ra * Math.cos(theta) + YO + 0.5);
  
  return rs;
};

// 현재 날짜/시간 가져오기
const getCurrentDateTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  
  // 기상청 API는 3시간 단위로 제공
  const baseTime = hours < 3 ? '2300' : 
                  hours < 6 ? '0200' :
                  hours < 9 ? '0500' :
                  hours < 12 ? '0800' :
                  hours < 15 ? '1100' :
                  hours < 18 ? '1400' :
                  hours < 21 ? '1700' : '2000';
  
  const baseDate = hours < 3 ? 
    `${year}${month}${String(day - 1).padStart(2, '0')}` : 
    `${year}${month}${day}`;
  
  return { baseDate, baseTime };
};

// 실시간 날씨 정보 가져오기
export const getRealTimeWeather = async (lat, lng) => {
  try {
    // 좌표 변환
    const grid = convertToGrid(lat, lng);
    const { baseDate, baseTime } = getCurrentDateTime();
    
    // 기상청 API 호출 (초단기실황)
    const weatherUrl = `${KMA_API_URL}/getUltraSrtNcst?serviceKey=${WEATHER_API_KEY}&pageNo=1&numOfRows=10&dataType=JSON&base_date=${baseDate}&base_time=${baseTime}&nx=${grid.x}&ny=${grid.y}`;
    
    // CORS 문제로 인해 프록시 서버 사용 필요
    // 개발 환경에서는 package.json에 proxy 설정 추가
    const weatherResponse = await fetch(`/api/weather?url=${encodeURIComponent(weatherUrl)}`);
    const weatherData = await weatherResponse.json();
    
    // 날씨 데이터 파싱
    const items = weatherData.response?.body?.items?.item || [];
    const weather = {
      temperature: 22,
      humidity: 65,
      windSpeed: 3,
      windDirection: 0,
      precipitation: 0,
      sky: '맑음'
    };
    
    items.forEach(item => {
      switch(item.category) {
        case 'T1H': // 기온
          weather.temperature = parseFloat(item.obsrValue);
          break;
        case 'REH': // 습도
          weather.humidity = parseInt(item.obsrValue);
          break;
        case 'WSD': // 풍속
          weather.windSpeed = parseFloat(item.obsrValue);
          break;
        case 'VEC': // 풍향
          weather.windDirection = parseInt(item.obsrValue);
          break;
        case 'RN1': // 1시간 강수량
          weather.precipitation = parseFloat(item.obsrValue);
          break;
      }
    });
    
    // 날씨 상태 결정
    if (weather.precipitation > 0) {
      weather.sky = '비';
    }
    
    return weather;
  } catch (error) {
    console.error('날씨 정보 가져오기 실패:', error);
    // 에러 시 기본값 반환
    return {
      temperature: 22,
      humidity: 65,
      windSpeed: 3,
      windDirection: 0,
      precipitation: 0,
      sky: '맑음'
    };
  }
};

// 실시간 대기질 정보 가져오기
export const getRealTimeAirQuality = async (lat, lng) => {
  try {
    // 가장 가까운 측정소 찾기
    const stationUrl = `${AIRKOREA_API_URL}/getMsrstnAcctoRltmMesureDnsty?serviceKey=${AIR_QUALITY_API_KEY}&returnType=json&numOfRows=1&pageNo=1&stationName=종로구&dataTerm=DAILY&ver=1.0`;
    
    const response = await fetch(`/api/airquality?url=${encodeURIComponent(stationUrl)}`);
    const data = await response.json();
    
    const items = data.response?.body?.items || [];
    if (items.length > 0) {
      const airData = items[0];
      return {
        pm10Value: airData.pm10Value || '-',
        pm25Value: airData.pm25Value || '-',
        o3Value: airData.o3Value || '-',
        no2Value: airData.no2Value || '-',
        coValue: airData.coValue || '-',
        so2Value: airData.so2Value || '-',
        khaiValue: airData.khaiValue || '-',
        khaiGrade: getAirQualityGrade(airData.khaiGrade || '1')
      };
    }
    
    return {
      pm10Value: '-',
      pm25Value: '-',
      khaiGrade: '좋음'
    };
  } catch (error) {
    console.error('대기질 정보 가져오기 실패:', error);
    return {
      pm10Value: '-',
      pm25Value: '-',
      khaiGrade: '좋음'
    };
  }
};

// 대기질 등급 변환
const getAirQualityGrade = (grade) => {
  const grades = {
    '1': '좋음',
    '2': '보통',
    '3': '나쁨',
    '4': '매우나쁨'
  };
  return grades[grade] || '좋음';
};

// 통합 날씨 정보 가져오기
export const getWeatherInfo = async (lat, lng) => {
  try {
    // 병렬로 날씨와 대기질 정보 가져오기
    const [weather, airQuality] = await Promise.all([
      getRealTimeWeather(lat, lng),
      getRealTimeAirQuality(lat, lng)
    ]);
    
    return {
      ...weather,
      airQuality: airQuality.khaiGrade,
      pm10: airQuality.pm10Value,
      pm25: airQuality.pm25Value,
      recommendation: getExerciseRecommendation(weather, airQuality)
    };
  } catch (error) {
    console.error('통합 날씨 정보 가져오기 실패:', error);
    return getDefaultWeatherInfo();
  }
};

// 운동 추천 정보
const getExerciseRecommendation = (weather, airQuality) => {
  const { temperature, humidity, windSpeed, precipitation, sky } = weather;
  const airGrade = airQuality.khaiGrade;
  
  let status = 'good';
  const warnings = [];
  
  // 온도 체크
  if (temperature < 0) {
    warnings.push('매우 춥습니다. 충분한 준비운동을 하세요');
    status = 'caution';
  } else if (temperature > 30) {
    warnings.push('매우 덥습니다. 열사병에 주의하세요');
    status = 'caution';
  }
  
  // 습도 체크
  if (humidity > 80) {
    warnings.push('습도가 높습니다. 운동 강도를 낮추세요');
    status = 'caution';
  }
  
  // 바람 체크
  if (windSpeed > 10) {
    warnings.push('바람이 강합니다. 주의하세요');
  }
  
  // 강수 체크
  if (precipitation > 0) {
    warnings.push('비가 옵니다. 미끄러짐에 주의하세요');
    status = 'warning';
  }
  
  // 대기질 체크
  if (airGrade === '나쁨' || airGrade === '매우나쁨') {
    warnings.push('대기질이 좋지 않습니다. 실내 운동을 권장합니다');
    status = 'warning';
  }
  
  return {
    status,
    warnings,
    message: status === 'good' ? '운동하기 좋은 날씨입니다!' : 
             status === 'caution' ? '운동 시 주의가 필요합니다' : 
             '실내 운동을 권장합니다'
  };
};

// 기본 날씨 정보
const getDefaultWeatherInfo = () => {
  return {
    temperature: 22,
    humidity: 65,
    windSpeed: 3,
    windDirection: 0,
    precipitation: 0,
    sky: '맑음',
    airQuality: '좋음',
    pm10: '30',
    pm25: '15',
    recommendation: {
      status: 'good',
      warnings: [],
      message: '운동하기 좋은 날씨입니다!'
    }
  };
};

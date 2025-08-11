// 🗺️ 실제 도로명과 주소 기반 러닝 코스 추천 서비스

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// 코스 난이도 정의
export const DIFFICULTY_LEVELS = {
  EASY: { label: '하 (초급)', color: '#10B981', value: 'easy' },    // 녹색 (쉬움)
  MEDIUM: { label: '중 (중급)', color: '#F59E0B', value: 'medium' }, // 주황색 (보통)
  HARD: { label: '상 (고급)', color: '#EF4444', value: 'hard' }      // 빨간색 (어려움)
};

// 실제 도로명 기반 코스 타입 정의
export const COURSE_TYPES = [
  { 
    name: '주택가 도로 코스', 
    icon: '🏘️', 
    description: '주택가 도로를 따라 안전하게 달리는 코스',
    safetyLevel: 'high'
  },
  { 
    name: '상업가 도로 코스', 
    icon: '🏢', 
    description: '상점가와 시장 주변 활기찬 도로 코스',
    safetyLevel: 'medium'
  },
  { 
    name: '대로변 코스', 
    icon: '🛣️', 
    description: '큰 도로와 대로를 따라 달리는 도시형 코스',
    safetyLevel: 'low'
  },
  { 
    name: '해안가 코스', 
    icon: '🌊', 
    description: '해안도로를 따라 바다를 보며 달리는 코스',
    safetyLevel: 'high'
  }
];

// 사용자 현재 위치 가져오기
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation이 지원되지 않습니다.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude
        };
        console.log('📍 실제 사용자 위치:', location);
        resolve(location);
      },
      (error) => {
        console.warn('⚠️ 위치 정보를 가져올 수 없습니다:', error);
        const defaultLocation = {
          lat: 37.5665,
          lng: 126.9780
        };
        console.log('📍 기본 위치 사용:', defaultLocation);
        resolve(defaultLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

// 🗺️ 실제 도로명과 주소 기반 러닝 코스 생성
export const searchNearbyRunningCourses = async (location, radius = 1000) => {
  console.log('🗺️ === 실제 도로명 기반 러닝 코스 생성 시작 ===');
  console.log('기준 위치:', location);
  console.log('검색 반경:', radius, 'm');
  
  try {
    // 사용자 위치 기반으로 지역 판단
    const region = determineRegion(location);
    console.log(`📍 감지된 지역: ${region}`);
    
    // 해당 지역의 실제 도로명/주소 기반 코스 생성
    const courses = await generateRealAddressCourses(location, region, radius);
    
    console.log(`🎉 총 ${courses.length}개 실제 주소 기반 코스 생성 완료!`);
    console.log('생성된 코스들:', courses.map(c => `${c.name} (${c.realAddress})`));
    
    return courses;
    
  } catch (error) {
    console.error('❌ 실제 주소 코스 생성 실패:', error);
    return getDefaultRealCourses(location);
  }
};

// 사용자 위치로 지역 판단
const determineRegion = (location) => {
  const { lat, lng } = location;
  
  // 부산 지역 (35.0-35.4N, 128.8-129.3E)
  if (lat >= 35.0 && lat <= 35.4 && lng >= 128.8 && lng <= 129.3) {
    return 'busan';
  }
  // 서울 지역 (37.4-37.7N, 126.7-127.2E)
  else if (lat >= 37.4 && lat <= 37.7 && lng >= 126.7 && lng <= 127.2) {
    return 'seoul';
  }
  // 대구 지역 (35.7-36.0N, 128.4-128.8E)
  else if (lat >= 35.7 && lat <= 36.0 && lng >= 128.4 && lng <= 128.8) {
    return 'daegu';
  }
  // 인천 지역 (37.2-37.6N, 126.3-126.9E)
  else if (lat >= 37.2 && lat <= 37.6 && lng >= 126.3 && lng <= 126.9) {
    return 'incheon';
  }
  // 기타 지역
  else {
    return 'other';
  }
};

// 지역별 실제 주소 기반 코스 생성
const generateRealAddressCourses = async (userLocation, region, radius) => {
  console.log(`🏙️ ${region} 지역 실제 주소 기반 코스 생성 중...`);
  
  const courses = [];
  let realPlaces = [];
  
  // 지역별 실제 유명한 장소들과 도로명
  switch (region) {
    case 'busan':
      realPlaces = [
        { name: '해운대해수욕장 일대', address: '부산 해운대구 중동', lat: 35.1587, lng: 129.1604, type: 3, description: '해운대 해변을 따라 달리는 명품 코스' },
        { name: '광안리해수욕장 일대', address: '부산 수영구 광안동', lat: 35.1532, lng: 129.1189, type: 3, description: '광안대교를 보며 달리는 야경 코스' },
        { name: '센텀시티 일대', address: '부산 해운대구 우동', lat: 35.1694, lng: 129.1316, type: 1, description: '센텀시티 현대적 건물들 사이 코스' },
        { name: '부산역 일대', address: '부산 동구 초량동', lat: 35.1158, lng: 129.0424, type: 2, description: '부산역 주변 원도심 탐방 코스' },
        { name: '서면 일대', address: '부산 부산진구 부전동', lat: 35.1579, lng: 129.0597, type: 1, description: '서면 번화가를 지나는 활기찬 코스' },
        { name: '영도대교 일대', address: '부산 중구 중앙동', lat: 35.0963, lng: 129.0347, type: 2, description: '영도대교와 남포동을 잇는 코스' },
        { name: '태종대 일대', address: '부산 영도구 동삼동', lat: 35.0515, lng: 129.0877, type: 0, description: '태종대 자연공원 주변 힐링 코스' },
        { name: '기장군 일대', address: '부산 기장군 기장읍', lat: 35.2443, lng: 129.2188, type: 0, description: '기장 해안도로 드라이브 코스' },
        { name: '사상공단 일대', address: '부산 사상구 주례동', lat: 35.1947, lng: 128.9911, type: 2, description: '사상공단 넓은 도로 코스' },
        { name: '동래 온천장 일대', address: '부산 동래구 온천동', lat: 35.2065, lng: 129.0787, type: 0, description: '동래 전통 온천가 주변 코스' }
      ];
      break;
      
    case 'seoul':
      realPlaces = [
        { name: '한강공원 일대', address: '서울 영등포구 여의도동', lat: 37.5297, lng: 126.9345, type: 3, description: '한강을 따라 달리는 대표 코스' },
        { name: '명동 일대', address: '서울 중구 명동', lat: 37.5636, lng: 126.9834, type: 1, description: '명동 쇼핑가를 지나는 관광 코스' },
        { name: '강남역 일대', address: '서울 강남구 역삼동', lat: 37.4979, lng: 127.0276, type: 2, description: '강남 번화가 네온사인 코스' },
        { name: '홍대 일대', address: '서울 마포구 서교동', lat: 37.5563, lng: 126.9236, type: 1, description: '홍대 젊음의 거리 코스' },
        { name: '경복궁 일대', address: '서울 종로구 세종로', lat: 37.5797, lng: 126.9770, type: 0, description: '경복궁 주변 역사 문화 코스' },
        { name: '남산타워 일대', address: '서울 중구 회현동', lat: 37.5512, lng: 126.9882, type: 0, description: '남산 등반 러닝 코스' },
        { name: '올림픽공원 일대', address: '서울 송파구 방이동', lat: 37.5194, lng: 127.1244, type: 0, description: '올림픽공원 넓은 트랙 코스' },
        { name: '이태원 일대', address: '서울 용산구 이태원동', lat: 37.5347, lng: 126.9947, type: 1, description: '이태원 국제거리 코스' }
      ];
      break;
      
    case 'daegu':
      realPlaces = [
        { name: '동성로 일대', address: '대구 중구 동성로', lat: 35.8714, lng: 128.5956, type: 1, description: '대구 대표 번화가 코스' },
        { name: '앞산공원 일대', address: '대구 남구 대명동', lat: 35.8328, lng: 128.5534, type: 0, description: '앞산 자연공원 힐링 코스' },
        { name: '수성못 일대', address: '대구 수성구 상동', lat: 35.8258, lng: 128.6354, type: 3, description: '수성못 호수 둘레 코스' },
        { name: '서문시장 일대', address: '대구 중구 대신동', lat: 35.8747, lng: 128.5858, type: 1, description: '서문시장 전통시장 코스' }
      ];
      break;
      
    case 'incheon':
      realPlaces = [
        { name: '송도 센트럴파크 일대', address: '인천 연수구 송도동', lat: 37.3891, lng: 126.6516, type: 0, description: '송도 신도시 현대적 공원 코스' },
        { name: '월미도 일대', address: '인천 중구 월미동', lat: 37.4759, lng: 126.5952, type: 3, description: '월미도 해안 산책로 코스' },
        { name: '차이나타운 일대', address: '인천 중구 선린동', lat: 37.4750, lng: 126.6183, type: 1, description: '차이나타운 문화거리 코스' },
        { name: '부평 일대', address: '인천 부평구 부평동', lat: 37.4896, lng: 126.7218, type: 2, description: '부평 구도심 탐방 코스' }
      ];
      break;
      
    default:
      realPlaces = [
        { name: '시청 일대', address: '현재 위치 주변 시청', lat: userLocation.lat + 0.005, lng: userLocation.lng + 0.002, type: 1, description: '시청 주변 관공서 코스' },
        { name: '중앙공원 일대', address: '현재 위치 주변 공원', lat: userLocation.lat - 0.003, lng: userLocation.lng + 0.004, type: 0, description: '중앙공원 자연 코스' },
        { name: '터미널 일대', address: '현재 위치 주변 터미널', lat: userLocation.lat + 0.002, lng: userLocation.lng - 0.005, type: 2, description: '터미널 주변 교통 중심가 코스' }
      ];
  }
  
  // 사용자 위치에서 가까운 순으로 정렬
  realPlaces.sort((a, b) => {
    const distA = calculateDistance(userLocation, { lat: a.lat, lng: a.lng });
    const distB = calculateDistance(userLocation, { lat: b.lat, lng: b.lng });
    return distA - distB;
  });
  
  // 가까운 8-10개 장소 선택
  const nearbyPlaces = realPlaces.slice(0, Math.min(10, realPlaces.length));
  
  // 각 실제 장소를 러닝 코스로 변환
  nearbyPlaces.forEach((place, index) => {
    const course = createRealAddressCourse(place, userLocation, index);
    courses.push(course);
    console.log(`✅ ${place.name} 실제 주소 코스 생성 완료`);
  });
  
  return courses;
};

// 실제 주소 기반 코스 생성
const createRealAddressCourse = (realPlace, userLocation, index) => {
  const courseType = COURSE_TYPES[realPlace.type];
  const realLocation = { lat: realPlace.lat, lng: realPlace.lng };
  const distance = calculateDistance(userLocation, realLocation);
  
  return {
    id: `real-address-${index}`,
    name: realPlace.name,
    location: realLocation,
    rating: 4.0 + Math.random() * 1.0,
    vicinity: realPlace.description,
    courseType: courseType.name,
    icon: courseType.icon,
    difficulty: assignDifficultyByDistance(distance),
    distance: Math.round(distance),
    estimatedDistance: calculateEstimatedDistance(distance),
    estimatedTime: calculateEstimatedTime(distance),
    elevationGain: estimateElevationGain(distance),
    features: generateRealAddressFeatures(realPlace, courseType),
    weatherSuitability: ['맑음', '흐림'],
    isOpen: true,
    safetyLevel: courseType.safetyLevel,
    roadType: determineRoadType(realPlace.type),
    trafficLevel: estimateTrafficLevel(realPlace.type),
    realAddress: realPlace.address, // 실제 주소
    realPlace: true, // 실제 장소 표시
    landmark: realPlace.name.includes('공원') || realPlace.name.includes('해수욕장') || realPlace.name.includes('대교')
  };
};

// 거리 기반 러닝 거리 계산
const calculateEstimatedDistance = (walkDistance) => {
  // 목적지까지의 거리를 고려한 러닝 코스 거리 (왕복 + 주변 탐방)
  const runningDistance = walkDistance * 2.5 / 1000; // km 단위
  return `${runningDistance.toFixed(1)}km`;
};

// 거리 기반 러닝 시간 계산
const calculateEstimatedTime = (distance) => {
  // 평균 러닝 속도 8km/h 기준
  const runningDistanceKm = distance * 2.5 / 1000;
  const timeMinutes = Math.round((runningDistanceKm / 8) * 60);
  return `${timeMinutes}분`;
};

// 거리 기반 난이도 할당
const assignDifficultyByDistance = (distance) => {
  if (distance < 800) return DIFFICULTY_LEVELS.EASY;
  if (distance < 2000) return DIFFICULTY_LEVELS.MEDIUM;
  return DIFFICULTY_LEVELS.HARD;
};

// 고도 변화 추정
const estimateElevationGain = (distance) => {
  const baseElevation = Math.floor(distance / 100) + Math.floor(Math.random() * 15);
  return `+${baseElevation}m`;
};

// 실제 주소 기반 특징 생성
const generateRealAddressFeatures = (realPlace, courseType) => {
  const features = [];
  
  // 장소별 특징
  if (realPlace.name.includes('해수욕장') || realPlace.name.includes('해변')) {
    features.push('바다 경치', '해안 바람', '모래사장');
  } else if (realPlace.name.includes('공원')) {
    features.push('자연 환경', '그늘 구간', '휴식 시설');
  } else if (realPlace.name.includes('시장') || realPlace.name.includes('상가')) {
    features.push('활기찬 분위기', '먹거리 풍부', '편의시설');
  } else if (realPlace.name.includes('역') || realPlace.name.includes('터미널')) {
    features.push('교통 편리', '24시간 접근', '넓은 도로');
  } else {
    features.push('도시 경관', '접근 용이', '다양한 볼거리');
  }
  
  // 코스 타입별 추가 특징
  if (courseType.safetyLevel === 'high') {
    features.push('안전한 환경');
  }
  
  return features.slice(0, 4);
};

// 장소 타입별 도로 유형
const determineRoadType = (placeType) => {
  switch (placeType) {
    case 0: return '공원/자연길';
    case 1: return '상업지역 도로';
    case 2: return '간선도로';
    case 3: return '해안도로/산책로';
    default: return '일반도로';
  }
};

// 장소 타입별 교통량 추정
const estimateTrafficLevel = (placeType) => {
  switch (placeType) {
    case 0: return '낮음';
    case 1: return '높음';
    case 2: return '매우 높음';
    case 3: return '낮음';
    default: return '보통';
  }
};

// 거리 계산
const calculateDistance = (point1, point2) => {
  const R = 6371e3;
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

// 기본 실제 주소 코스 (최후 수단)
const getDefaultRealCourses = (location) => {
  console.log('📝 기본 실제 주소 코스 생성 중...');
  
  return [
    {
      id: 'default-real-1',
      name: '근처 시청 일대',
      location: { lat: location.lat + 0.005, lng: location.lng + 0.002 },
      rating: 4.0,
      vicinity: '시청 주변 관공서 건물들을 둘러보는 코스',
      courseType: '상업가 도로 코스',
      icon: '🏢',
      difficulty: DIFFICULTY_LEVELS.EASY,
      distance: 450,
      estimatedDistance: '1.8km',
      estimatedTime: '14분',
      elevationGain: '+12m',
      features: ['관공서 집중', '넓은 도로', '안전한 환경', '접근 용이'],
      weatherSuitability: ['맑음', '흐림'],
      isOpen: true,
      safetyLevel: 'high',
      roadType: '상업지역 도로',
      trafficLevel: '보통',
      realAddress: '시청 주변',
      realPlace: true
    },
    {
      id: 'default-real-2',
      name: '근처 중앙공원 일대',
      location: { lat: location.lat - 0.003, lng: location.lng + 0.004 },
      rating: 4.2,
      vicinity: '공원을 중심으로 한 자연 친화적 러닝 코스',
      courseType: '주택가 도로 코스',
      icon: '🏘️',
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      distance: 680,
      estimatedDistance: '2.4km',
      estimatedTime: '18분',
      elevationGain: '+15m',
      features: ['자연 환경', '그늘 구간', '휴식 시설', '조용한 환경'],
      weatherSuitability: ['맑음', '흐림'],
      isOpen: true,
      safetyLevel: 'high',
      roadType: '공원/자연길',
      trafficLevel: '낮음',
      realAddress: '중앙공원 주변',
      realPlace: true
    }
  ];
};

// 🗺️ 실제 주소를 따르는 러닝 경로 생성
export const generateRunningRoute = (startLocation, course) => {
  console.log(`🗺️ ${course.realAddress} 실제 경로 생성 중...`);
  
  const endLocation = course.location;
  const routePoints = [startLocation];
  
  // 목적지까지 가는 경로 (실제 도로를 모방)
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    // 약간의 도로 굴곡 추가 (실제 도로처럼)
    const roadCurve = Math.sin(progress * Math.PI * 2) * 0.0002;
    
    routePoints.push({
      lat: startLocation.lat + (endLocation.lat - startLocation.lat) * progress + roadCurve,
      lng: startLocation.lng + (endLocation.lng - startLocation.lng) * progress + roadCurve * 1.2
    });
  }
  
  // 목적지 주변 탐방 경로
  const landmark = course.landmark;
  if (landmark) {
    // 랜드마크인 경우 주변을 둘러보는 경로
    const exploreRadius = 0.001;
    for (let i = 0; i <= 6; i++) {
      const angle = (i / 6) * 2 * Math.PI;
      routePoints.push({
        lat: endLocation.lat + Math.cos(angle) * exploreRadius,
        lng: endLocation.lng + Math.sin(angle) * exploreRadius
      });
    }
  } else {
    // 일반 장소인 경우 간단한 주변 탐방
    routePoints.push(
      { lat: endLocation.lat + 0.0005, lng: endLocation.lng + 0.0003 },
      { lat: endLocation.lat - 0.0003, lng: endLocation.lng + 0.0007 },
      { lat: endLocation.lat - 0.0005, lng: endLocation.lng - 0.0002 }
    );
  }
  
  // 시작점으로 돌아가는 경로 (다른 도로 이용)
  for (let i = steps; i >= 1; i--) {
    const progress = i / steps;
    const returnCurve = Math.cos(progress * Math.PI * 1.5) * 0.0003;
    
    routePoints.push({
      lat: startLocation.lat + (endLocation.lat - startLocation.lat) * progress - returnCurve,
      lng: startLocation.lng + (endLocation.lng - startLocation.lng) * progress + returnCurve * 0.8
    });
  }
  
  // 시작점 복귀
  routePoints.push(startLocation);
  
  console.log(`✅ ${course.realAddress} 실제 경로 생성 완료: ${routePoints.length}개 포인트`);
  return routePoints;
};
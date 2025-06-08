// 실제 위치 기반 러닝 코스 추천 서비스 (기본 코스 중심)
const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// 코스 난이도 정의
export const DIFFICULTY_LEVELS = {
  EASY: { label: '하 (초급)', color: '#EF4444', value: 'easy' },  // 빨간색
  MEDIUM: { label: '중 (중급)', color: '#F59E0B', value: 'medium' }, // 주황색
  HARD: { label: '상 (고급)', color: '#DC2626', value: 'hard' }      // 진한 빨간색
};

// 러닝 코스 타입 정의
export const COURSE_TYPES = [
  { name: '공원 코스', icon: '🌳', searchKeyword: 'park' },
  { name: '강변 코스', icon: '🌊', searchKeyword: 'river' },
  { name: '산책로', icon: '🚶', searchKeyword: 'trail' },
  { name: '운동장', icon: '🏃', searchKeyword: 'stadium' },
  { name: '학교 트랙', icon: '🏫', searchKeyword: 'school track' }
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
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        // 에러 시 서울 기본 좌표 반환
        console.warn('위치 정보를 가져올 수 없습니다:', error);
        resolve({
          lat: 37.5665,
          lng: 126.9780
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );
  });
};

// 주변 러닝 코스 검색 (Places API 없이 기본 코스만 사용)
export const searchNearbyRunningCourses = async (location, radius = 1000) => {
  try {
    console.log('위치 기반 코스 생성 중...', location);
    
    // Places API 대신 풍부한 기본 코스 데이터 사용
    const courses = generateDiverseCourses(location, radius);
    
    console.log('생성된 코스 수:', courses.length);
    return courses;
  } catch (error) {
    console.error('코스 검색 실패:', error);
    return getDefaultCourses(location);
  }
};

// 다양한 코스 생성 함수
const generateDiverseCourses = (location, radius) => {
  const courses = [];
  const baseDistance = radius / 1000; // km로 변환
  
  // 각 방향으로 다양한 코스 생성
  const directions = [
    { name: '북쪽', lat: 0.005, lng: 0.002, type: '공원 코스', icon: '🌳' },
    { name: '남쪽', lat: -0.004, lng: 0.003, type: '강변 코스', icon: '🌊' },
    { name: '동쪽', lat: 0.002, lng: 0.006, type: '산책로', icon: '🚶' },
    { name: '서쪽', lat: 0.003, lng: -0.005, type: '운동장', icon: '🏃' },
    { name: '북동쪽', lat: 0.007, lng: 0.004, type: '학교 트랙', icon: '🏫' },
    { name: '남서쪽', lat: -0.006, lng: -0.003, type: '공원 코스', icon: '🌳' }
  ];
  
  directions.forEach((dir, index) => {
    const courseLocation = {
      lat: location.lat + dir.lat,
      lng: location.lng + dir.lng
    };
    
    const distance = calculateDistance(location, courseLocation);
    const difficulty = assignDifficultyByDistance(distance);
    
    courses.push({
      id: `generated-${index}`,
      name: `${dir.name} ${dir.type}`,
      location: courseLocation,
      rating: 3.8 + Math.random() * 1.4, // 3.8 ~ 5.2
      vicinity: `현재 위치에서 ${dir.name} 방향`,
      courseType: dir.type,
      icon: dir.icon,
      difficulty,
      distance: Math.round(distance),
      estimatedDistance: `${(1.5 + Math.random() * 3).toFixed(1)}km`,
      estimatedTime: `${Math.floor(Math.random() * 30 + 20)}분`,
      elevationGain: `+${Math.floor(Math.random() * 100 + 20)}m`,
      features: generateCourseFeatures({ courseType: dir.type }, difficulty),
      weatherSuitability: getWeatherSuitability({ courseType: dir.type }, difficulty),
      isOpen: Math.random() > 0.2 // 80% 확률로 이용 가능
    });
  });
  
  return courses;
};

// 거리별 난이도 할당
const assignDifficultyByDistance = (distance) => {
  if (distance < 400) return DIFFICULTY_LEVELS.EASY;
  if (distance < 800) return DIFFICULTY_LEVELS.MEDIUM;
  return DIFFICULTY_LEVELS.HARD;
};

// 두 지점 간 거리 계산 (미터)
const calculateDistance = (point1, point2) => {
  const R = 6371e3; // 지구 반지름 (미터)
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

// 코스 특징 생성
const generateCourseFeatures = (course, difficulty) => {
  const baseFeatures = [];
  
  if (course.courseType.includes('공원')) {
    baseFeatures.push('자연 경관', '그늘 구간');
  }
  if (course.courseType.includes('강변')) {
    baseFeatures.push('강변 경치', '평지 코스');
  }
  if (course.courseType.includes('산책로')) {
    baseFeatures.push('산책로', '보행자 전용');
  }
  if (course.courseType.includes('운동장')) {
    baseFeatures.push('트랙', '측정 가능');
  }
  if (course.courseType.includes('학교')) {
    baseFeatures.push('안전한 환경', '체계적 관리');
  }

  // 난이도별 추가 특징
  if (difficulty.value === 'easy') {
    baseFeatures.push('초보자 적합', '평지');
  } else if (difficulty.value === 'medium') {
    baseFeatures.push('적당한 경사', '중급자 적합');
  } else {
    baseFeatures.push('도전적', '체력 향상');
  }

  return baseFeatures.slice(0, 4); // 최대 4개
};

// 날씨 적합성 판단
const getWeatherSuitability = (course, difficulty) => {
  const suitability = ['맑음'];
  
  if (course.courseType.includes('공원') || course.courseType.includes('산책로')) {
    suitability.push('흐림');
  }
  
  if (difficulty.value === 'easy') {
    suitability.push('소나기');
  }
  
  if (course.courseType.includes('운동장') || course.courseType.includes('학교')) {
    suitability.push('안전함');
  }
  
  return suitability;
};

// 기본 코스 데이터 (백업용)
const getDefaultCourses = (location) => {
  return [
    {
      id: 'default-1',
      name: '근처 공원 러닝코스',
      location: {
        lat: location.lat + 0.003,
        lng: location.lng + 0.002
      },
      rating: 4.2,
      vicinity: '현재 위치 근처',
      courseType: '공원 코스',
      icon: '🌳',
      difficulty: DIFFICULTY_LEVELS.EASY,
      distance: 250,
      estimatedDistance: '2.0km',
      estimatedTime: '20분',
      elevationGain: '+15m',
      features: ['자연 경관', '그늘 구간', '초보자 적합', '평지'],
      weatherSuitability: ['맑음', '흐림'],
      isOpen: true
    },
    {
      id: 'default-2',
      name: '동네 러닝 코스',
      location: {
        lat: location.lat - 0.004,
        lng: location.lng + 0.003
      },
      rating: 4.0,
      vicinity: '현재 위치 근처',
      courseType: '산책로',
      icon: '🚶',
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      distance: 550,
      estimatedDistance: '3.5km',
      estimatedTime: '30분',
      elevationGain: '+45m',
      features: ['산책로', '보행자 전용', '적당한 경사', '중급자 적합'],
      weatherSuitability: ['맑음'],
      isOpen: true
    },
    {
      id: 'default-3',
      name: '도전 러닝 코스',
      location: {
        lat: location.lat + 0.002,
        lng: location.lng - 0.005
      },
      rating: 4.5,
      vicinity: '현재 위치 근처',
      courseType: '강변 코스',
      icon: '🌊',
      difficulty: DIFFICULTY_LEVELS.HARD,
      distance: 850,
      estimatedDistance: '5.2km',
      estimatedTime: '45분',
      elevationGain: '+120m',
      features: ['강변 경치', '도전적', '체력 향상', '고급자 적합'],
      weatherSuitability: ['맑음'],
      isOpen: true
    }
  ];
};

// 코스 경로 생성 (러닝 경로 시뮬레이션)
export const generateRunningRoute = (startLocation, course) => {
  const routePoints = [];
  const center = course.location;
  const radius = 0.003; // 약 300m 반경
  const numPoints = 20; // 경로 포인트 수

  // 시작점
  routePoints.push(startLocation);

  // 목적지까지의 경로
  const steps = 5;
  for (let i = 1; i <= steps; i++) {
    const progress = i / steps;
    routePoints.push({
      lat: startLocation.lat + (center.lat - startLocation.lat) * progress,
      lng: startLocation.lng + (center.lng - startLocation.lng) * progress
    });
  }

  // 코스 주변 순환 경로 생성
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    const lat = center.lat + Math.cos(angle) * radius * (0.7 + Math.random() * 0.6);
    const lng = center.lng + Math.sin(angle) * radius * (0.7 + Math.random() * 0.6);
    routePoints.push({ lat, lng });
  }

  // 시작점으로 돌아오는 경로
  for (let i = steps; i >= 1; i--) {
    const progress = i / steps;
    routePoints.push({
      lat: startLocation.lat + (center.lat - startLocation.lat) * progress,
      lng: startLocation.lng + (center.lng - startLocation.lng) * progress
    });
  }

  return routePoints;
};
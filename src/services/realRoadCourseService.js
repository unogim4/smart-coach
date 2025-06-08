// 실제 도로 기반 코스 추천 서비스

/**
 * Google Directions API를 활용한 실제 도로 기반 코스 생성
 */

// 코스 타입 정의
export const COURSE_TYPES = {
  RUNNING: 'running',
  CYCLING: 'cycling'
};

// 난이도 정의
export const DIFFICULTY_LEVELS = {
  BEGINNER: 'beginner',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced'
};

/**
 * 실제 도로를 따라가는 코스 생성
 * @param {Object} userLocation - 사용자 현재 위치 {lat, lng}
 * @param {Object} preferences - 사용자 선호도
 * @returns {Promise<Array>} 추천 코스 배열
 */
export const generateRealRoadCourses = async (userLocation, preferences = {}) => {
  if (!userLocation || !userLocation.lat || !userLocation.lng) {
    console.error('사용자 위치 정보가 필요합니다');
    return [];
  }

  const {
    type = COURSE_TYPES.RUNNING,
    distances = [3, 5, 8] // km
  } = preferences;

  console.log('실제 도로 기반 코스 생성 중:', { userLocation, preferences });

  const courses = [];
  
  // 각 거리별로 코스 생성
  for (let i = 0; i < distances.length; i++) {
    const distance = distances[i];
    const difficulty = i === 0 ? DIFFICULTY_LEVELS.BEGINNER :
                     i === 1 ? DIFFICULTY_LEVELS.INTERMEDIATE :
                     DIFFICULTY_LEVELS.ADVANCED;
    
    try {
      const course = await generateSingleRoadCourse(
        userLocation,
        distance,
        difficulty,
        type,
        i
      );
      
      if (course) {
        courses.push(course);
      }
    } catch (error) {
      console.error(`코스 ${i + 1} 생성 실패:`, error);
    }
  }

  return courses;
};

/**
 * 단일 실제 도로 코스 생성
 */
const generateSingleRoadCourse = async (startLocation, targetDistance, difficulty, type, index) => {
  // 목적지 후보들 생성 (시작점에서 다양한 방향으로)
  const destinations = generateDestinationCandidates(startLocation, targetDistance, index);
  
  let bestRoute = null;
  let bestScore = -1;

  // 각 목적지에 대해 경로 요청
  for (const destination of destinations) {
    try {
      const route = await requestDirectionsRoute(startLocation, destination, type);
      
      if (route) {
        const score = evaluateRoute(route, targetDistance, difficulty);
        
        if (score > bestScore) {
          bestScore = score;
          bestRoute = route;
        }
      }
    } catch (error) {
      console.warn('경로 요청 실패:', error);
    }
  }

  if (!bestRoute) {
    console.warn('적절한 경로를 찾을 수 없습니다');
    return null;
  }

  // 코스 정보 생성
  return createCourseFromRoute(bestRoute, targetDistance, difficulty, type, index);
};

/**
 * 목적지 후보 생성
 */
const generateDestinationCandidates = (startLocation, targetDistance, directionIndex) => {
  const destinations = [];
  
  // 기본 방향들 (북, 동북, 동, 동남, 남, 남서, 서, 북서)
  const baseAngles = [0, 45, 90, 135, 180, 225, 270, 315];
  
  // 각 방향마다 목적지 생성
  baseAngles.forEach((baseAngle, i) => {
    // 인덱스에 따라 다른 방향을 우선시
    const angle = (baseAngle + (directionIndex * 120)) % 360;
    
    // 목표 거리의 80-120% 범위에서 목적지 생성
    const minDistance = targetDistance * 0.4; // 절반 거리 (왕복을 고려)
    const maxDistance = targetDistance * 0.6;
    
    for (let dist = minDistance; dist <= maxDistance; dist += 0.5) {
      const destination = calculateDestination(startLocation, dist, angle);
      destinations.push(destination);
    }
  });

  return destinations;
};

/**
 * 방향과 거리로 목적지 계산
 */
const calculateDestination = (start, distance, angle) => {
  const earthRadius = 6371; // km
  const angularDistance = distance / earthRadius;
  const bearing = (angle * Math.PI) / 180;
  
  const lat1 = (start.lat * Math.PI) / 180;
  const lng1 = (start.lng * Math.PI) / 180;
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(angularDistance) +
    Math.cos(lat1) * Math.sin(angularDistance) * Math.cos(bearing)
  );
  
  const lng2 = lng1 + Math.atan2(
    Math.sin(bearing) * Math.sin(angularDistance) * Math.cos(lat1),
    Math.cos(angularDistance) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: (lat2 * 180) / Math.PI,
    lng: (lng2 * 180) / Math.PI
  };
};

/**
 * Google Directions API 요청
 */
const requestDirectionsRoute = async (origin, destination, type) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps API가 로드되지 않았습니다'));
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    
    // 운동 타입에 따른 이동 수단 설정
    const travelMode = type === COURSE_TYPES.CYCLING ? 
      window.google.maps.TravelMode.BICYCLING : 
      window.google.maps.TravelMode.WALKING;

    const request = {
      origin: origin,
      destination: destination,
      travelMode: travelMode,
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: type === COURSE_TYPES.RUNNING, // 러닝일 때는 고속도로 피하기
      avoidTolls: true
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result.routes && result.routes.length > 0) {
        resolve(result.routes[0]);
      } else {
        reject(new Error(`경로 요청 실패: ${status}`));
      }
    });
  });
};

/**
 * 경로 평가 (거리, 난이도에 맞는지 점수 계산)
 */
const evaluateRoute = (route, targetDistance, difficulty) => {
  if (!route || !route.legs || route.legs.length === 0) {
    return 0;
  }

  const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000; // km로 변환
  const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0); // 초
  
  // 거리 점수 (목표 거리와 얼마나 가까운가)
  const distanceScore = Math.max(0, 100 - Math.abs(targetDistance - totalDistance) * 20);
  
  // 지속시간 점수 (너무 짧거나 길지 않은가)
  const expectedDuration = (targetDistance / 6) * 3600; // 시속 6km 기준 예상 시간
  const durationScore = Math.max(0, 100 - Math.abs(expectedDuration - totalDuration) / 60);
  
  // 경로 복잡도 점수 (난이도에 맞는가)
  const stepsCount = route.legs.reduce((sum, leg) => sum + leg.steps.length, 0);
  const complexityScore = difficulty === DIFFICULTY_LEVELS.BEGINNER ? 
    Math.max(0, 100 - stepsCount) : // 초급자는 단순한 경로
    Math.min(100, stepsCount * 2); // 중급자 이상은 복잡한 경로 선호

  return (distanceScore * 0.5) + (durationScore * 0.3) + (complexityScore * 0.2);
};

/**
 * 경로에서 코스 정보 생성
 */
const createCourseFromRoute = (route, targetDistance, difficulty, type, index) => {
  if (!route || !route.legs || route.legs.length === 0) {
    return null;
  }

  const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0) / 1000; // km
  const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0); // 초

  // 경로 좌표 추출
  const coordinates = [];
  route.legs.forEach(leg => {
    leg.steps.forEach(step => {
      coordinates.push({
        lat: step.start_location.lat(),
        lng: step.start_location.lng()
      });
    });
  });
  
  // 마지막 점 추가
  const lastLeg = route.legs[route.legs.length - 1];
  const lastStep = lastLeg.steps[lastLeg.steps.length - 1];
  coordinates.push({
    lat: lastStep.end_location.lat(),
    lng: lastStep.end_location.lng()
  });

  // 고도 변화 추정 (실제로는 Elevation API를 사용할 수 있음)
  const elevationGain = difficulty === DIFFICULTY_LEVELS.BEGINNER ? 
    Math.random() * 30 : 
    difficulty === DIFFICULTY_LEVELS.INTERMEDIATE ? 
    30 + Math.random() * 80 : 
    80 + Math.random() * 150;

  // 코스 이름 생성
  const directionNames = ['북쪽', '동쪽', '남쪽', '서쪽'];
  const courseName = `${directionNames[index % 4]} ${Math.round(totalDistance)}km 코스`;

  return {
    id: `real_course_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    name: courseName,
    description: `실제 도로를 따라가는 ${difficulty} 수준의 ${Math.round(totalDistance)}km 코스입니다.`,
    type,
    difficulty,
    distance: totalDistance,
    estimatedTime: `${Math.round(totalDuration / 60)}분`,
    elevationGain: Math.round(elevationGain),
    coordinates,
    startLocation: coordinates[0],
    endLocation: coordinates[coordinates.length - 1],
    color: getDifficultyColor(difficulty),
    features: generateCourseFeatures(difficulty, type, totalDistance),
    isRealRoad: true, // 실제 도로 여부 표시
    googleRoute: route // Google 경로 정보 저장
  };
};

/**
 * 난이도별 색상 반환
 */
const getDifficultyColor = (difficulty) => {
  switch (difficulty) {
    case DIFFICULTY_LEVELS.BEGINNER:
      return '#22c55e'; // 녹색
    case DIFFICULTY_LEVELS.INTERMEDIATE:
      return '#f59e0b'; // 노란색
    case DIFFICULTY_LEVELS.ADVANCED:
      return '#ef4444'; // 빨간색
    default:
      return '#3b82f6'; // 파란색
  }
};

/**
 * 코스 특징 생성
 */
const generateCourseFeatures = (difficulty, type, distance) => {
  const features = ['실제 도로', '안전한 경로'];
  
  if (difficulty === DIFFICULTY_LEVELS.BEGINNER) {
    features.push('평탄한 지형', '초보자 친화적');
  } else if (difficulty === DIFFICULTY_LEVELS.INTERMEDIATE) {
    features.push('적당한 거리', '중급자 추천');
  } else {
    features.push('도전적인 코스', '고급자용');
  }
  
  if (type === COURSE_TYPES.CYCLING) {
    features.push('자전거 도로', '사이클링 최적화');
  } else {
    features.push('보행자 도로', '러닝 최적화');
  }
  
  return features;
};

/**
 * 두 점 사이의 직선 거리 계산 (km)
 */
export const getDistanceBetweenPoints = (point1, point2) => {
  const earthRadius = 6371;
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
    Math.cos((point2.lat * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadius * c;
};
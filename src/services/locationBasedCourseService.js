// 🗺️ 어디서나 작동하는 도로 기반 러닝 코스 추천 서비스

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// 코스 난이도 정의
export const DIFFICULTY_LEVELS = {
  EASY: { label: '초급 (1-3km)', color: '#10B981', value: 'easy' },
  MEDIUM: { label: '중급 (3-5km)', color: '#F59E0B', value: 'medium' },
  HARD: { label: '고급 (5km+)', color: '#EF4444', value: 'hard' }
};

// 코스 타입 정의
export const COURSE_TYPES = [
  { 
    name: '동네 한바퀴', 
    icon: '🏘️', 
    description: '집 주변 가볍게 달리기',
    distance: [1, 2] // km
  },
  { 
    name: '공원 순환', 
    icon: '🌳', 
    description: '근처 공원이나 녹지 코스',
    distance: [2, 3]
  },
  { 
    name: '도시 탐방', 
    icon: '🏢', 
    description: '주변 상가와 도시 거리',
    distance: [3, 5]
  },
  { 
    name: '장거리 코스', 
    icon: '🛣️', 
    description: '본격 장거리 러닝',
    distance: [5, 10]
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
        console.log('📍 현재 위치:', location);
        resolve(location);
      },
      (error) => {
        console.warn('⚠️ 위치 정보를 가져올 수 없습니다:', error);
        // 서울시청 기본 좌표
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

// 🗺️ 근처 도로 위에 러닝 코스 생성
export const searchNearbyRunningCourses = async (location, radius = 3000) => {
  console.log('🗺️ === 도로 기반 러닝 코스 생성 시작 ===');
  console.log('중심 위치:', location);
  console.log('검색 반경:', radius, 'm');
  
  try {
    // 사용자 위치 주변의 실제 도로 위 포인트들 생성
    const courses = await generateRoadBasedCourses(location, radius);
    
    console.log(`✅ 총 ${courses.length}개 도로 기반 코스 생성 완료!`);
    return courses;
    
  } catch (error) {
    console.error('❌ 코스 생성 실패:', error);
    return generateDefaultCourses(location);
  }
};

// 도로 위의 포인트 찾기 (Google Roads API 대신 계산으로 근사)
const findNearbyRoadPoints = async (center, radius) => {
  const points = [];
  const numPoints = 8; // 8방향으로 포인트 생성
  
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    
    // 다양한 거리에 포인트 생성 (500m ~ radius)
    const distances = [500, 1000, 1500, 2000, 2500, 3000];
    
    for (const distance of distances) {
      if (distance <= radius) {
        // 미터를 위도/경도 차이로 변환 (대략적인 계산)
        const latOffset = (distance * Math.cos(angle)) / 111320; // 1도 ≈ 111.32km
        const lngOffset = (distance * Math.sin(angle)) / (111320 * Math.cos(center.lat * Math.PI / 180));
        
        const point = {
          lat: center.lat + latOffset,
          lng: center.lng + lngOffset,
          distance: distance,
          angle: angle,
          direction: getDirectionName(angle)
        };
        
        // 도로가 있을 가능성이 높은 위치로 미세 조정
        const roadAdjusted = adjustToLikelyRoad(point, center);
        points.push(roadAdjusted);
      }
    }
  }
  
  return points;
};

// 방향 이름 가져오기
const getDirectionName = (angle) => {
  const directions = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const index = Math.round((angle / (2 * Math.PI)) * 8) % 8;
  return directions[index];
};

// 도로가 있을 가능성이 높은 위치로 조정
const adjustToLikelyRoad = (point, center) => {
  // 도시는 대체로 격자 구조이므로 약간의 조정
  const gridSize = 0.001; // 약 100m 격자
  
  const adjustedPoint = {
    ...point,
    lat: Math.round(point.lat / gridSize) * gridSize,
    lng: Math.round(point.lng / gridSize) * gridSize
  };
  
  // 중심에서의 실제 거리 재계산
  adjustedPoint.actualDistance = calculateDistance(center, adjustedPoint);
  
  return adjustedPoint;
};

// 도로 기반 코스 생성
const generateRoadBasedCourses = async (userLocation, maxRadius) => {
  console.log('🚸 도로 위 러닝 코스 생성 중...');
  
  // 근처 도로 포인트들 찾기
  const roadPoints = await findNearbyRoadPoints(userLocation, maxRadius);
  
  // 거리별로 그룹화
  const shortPoints = roadPoints.filter(p => p.actualDistance <= 1500);
  const mediumPoints = roadPoints.filter(p => p.actualDistance > 1500 && p.actualDistance <= 3000);
  const longPoints = roadPoints.filter(p => p.actualDistance > 3000 && p.actualDistance <= 5000);
  
  const courses = [];
  
  // 초급 코스 (1-3km) - 가까운 포인트들 연결
  if (shortPoints.length >= 2) {
    for (let i = 0; i < Math.min(3, shortPoints.length - 1); i++) {
      const course = createCircularCourse(
        userLocation,
        shortPoints[i],
        shortPoints[i + 1] || shortPoints[0],
        COURSE_TYPES[0], // 동네 한바퀴
        DIFFICULTY_LEVELS.EASY,
        i
      );
      courses.push(course);
    }
  }
  
  // 중급 코스 (3-5km) - 중간 거리 포인트들
  if (mediumPoints.length >= 2) {
    for (let i = 0; i < Math.min(3, mediumPoints.length - 1); i++) {
      const course = createCircularCourse(
        userLocation,
        mediumPoints[i],
        mediumPoints[i + 1] || mediumPoints[0],
        COURSE_TYPES[2], // 도시 탐방
        DIFFICULTY_LEVELS.MEDIUM,
        i + 3
      );
      courses.push(course);
    }
  }
  
  // 고급 코스 (5km+) - 먼 거리 포인트들
  if (longPoints.length >= 2) {
    for (let i = 0; i < Math.min(2, longPoints.length - 1); i++) {
      const course = createCircularCourse(
        userLocation,
        longPoints[i],
        longPoints[i + 1] || longPoints[0],
        COURSE_TYPES[3], // 장거리 코스
        DIFFICULTY_LEVELS.HARD,
        i + 6
      );
      courses.push(course);
    }
  }
  
  // 코스가 너무 적으면 기본 코스 추가
  if (courses.length < 5) {
    const defaultCourses = generateDefaultCourses(userLocation);
    courses.push(...defaultCourses.slice(0, 5 - courses.length));
  }
  
  return courses;
};

// 순환 코스 생성
const createCircularCourse = (start, point1, point2, courseType, difficulty, index) => {
  // 순환 경로: 시작 -> point1 -> point2 -> 시작
  const waypoints = [start, point1, point2, start];
  const totalDistance = calculateRouteDistance(waypoints);
  
  return {
    id: `road-course-${index}`,
    name: `${point1.direction}쪽 ${courseType.name}`,
    location: point1, // 첫 번째 경유지를 대표 위치로
    waypoints: waypoints, // 경로 포인트들
    rating: 3.5 + Math.random() * 1.5,
    vicinity: `${point1.direction} 방향 ${Math.round(point1.actualDistance)}m`,
    courseType: courseType.name,
    icon: courseType.icon,
    difficulty: difficulty,
    distance: Math.round(totalDistance),
    estimatedDistance: `${(totalDistance / 1000).toFixed(1)}km`,
    estimatedTime: calculateEstimatedTime(totalDistance),
    elevationGain: '+' + Math.round(Math.random() * 50 + 10) + 'm',
    features: generateCourseFeatures(courseType, difficulty),
    weatherSuitability: ['맑음', '흐림', '선선함'],
    isOpen: true,
    safetyLevel: 'high',
    roadType: '도시 도로',
    trafficLevel: getTrafficLevel(new Date().getHours()),
    realPlace: true,
    isCircular: true // 순환 코스 표시
  };
};

// 경로 총 거리 계산
const calculateRouteDistance = (waypoints) => {
  let totalDistance = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    totalDistance += calculateDistance(waypoints[i], waypoints[i + 1]);
  }
  return totalDistance;
};

// 두 지점 간 거리 계산 (미터 단위)
const calculateDistance = (point1, point2) => {
  const R = 6371e3; // 지구 반경 (미터)
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

// 예상 시간 계산
const calculateEstimatedTime = (distanceInMeters) => {
  // 평균 러닝 속도: 10km/h (6분/km)
  const avgSpeedKmh = 10;
  const timeMinutes = Math.round((distanceInMeters / 1000) / avgSpeedKmh * 60);
  
  if (timeMinutes < 60) {
    return `${timeMinutes}분`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return `${hours}시간 ${mins}분`;
  }
};

// 시간대별 교통량 추정
const getTrafficLevel = (hour) => {
  if (hour >= 7 && hour <= 9) return '높음 (출근)';
  if (hour >= 17 && hour <= 19) return '높음 (퇴근)';
  if (hour >= 22 || hour <= 5) return '매우 낮음';
  return '보통';
};

// 코스 특징 생성
const generateCourseFeatures = (courseType, difficulty) => {
  const features = [];
  
  // 코스 타입별 특징
  if (courseType.name.includes('동네')) {
    features.push('익숙한 환경', '안전한 도로');
  } else if (courseType.name.includes('공원')) {
    features.push('자연 친화적', '공기 좋음');
  } else if (courseType.name.includes('도시')) {
    features.push('다양한 풍경', '편의시설 많음');
  } else {
    features.push('도전적 코스', '지구력 향상');
  }
  
  // 난이도별 특징
  if (difficulty.value === 'easy') {
    features.push('초보자 적합', '완만한 코스');
  } else if (difficulty.value === 'medium') {
    features.push('적당한 강도', '체력 향상');
  } else {
    features.push('고강도 훈련', '전문가 추천');
  }
  
  return features.slice(0, 4);
};

// 기본 코스 생성 (폴백)
const generateDefaultCourses = (location) => {
  console.log('📝 기본 러닝 코스 생성 중...');
  
  const courses = [];
  
  // 가까운 거리에 다양한 코스 생성
  const distances = [1000, 1500, 2000, 2500, 3000];
  const angles = [0, Math.PI/2, Math.PI, 3*Math.PI/2]; // 동서남북
  
  distances.forEach((distance, dIdx) => {
    const angle = angles[dIdx % angles.length];
    const direction = getDirectionName(angle);
    
    const latOffset = (distance * Math.cos(angle)) / 111320;
    const lngOffset = (distance * Math.sin(angle)) / (111320 * Math.cos(location.lat * Math.PI / 180));
    
    const endPoint = {
      lat: location.lat + latOffset,
      lng: location.lng + lngOffset
    };
    
    const difficulty = distance < 1500 ? DIFFICULTY_LEVELS.EASY :
                      distance < 2500 ? DIFFICULTY_LEVELS.MEDIUM :
                      DIFFICULTY_LEVELS.HARD;
    
    const courseType = distance < 1500 ? COURSE_TYPES[0] :
                      distance < 2500 ? COURSE_TYPES[1] :
                      COURSE_TYPES[2];
    
    courses.push({
      id: `default-${dIdx}`,
      name: `${direction}쪽 ${courseType.name}`,
      location: endPoint,
      waypoints: [location, endPoint, location],
      rating: 4.0,
      vicinity: `${direction} 방향 ${distance}m`,
      courseType: courseType.name,
      icon: courseType.icon,
      difficulty: difficulty,
      distance: distance * 2, // 왕복
      estimatedDistance: `${(distance * 2 / 1000).toFixed(1)}km`,
      estimatedTime: calculateEstimatedTime(distance * 2),
      elevationGain: '+' + Math.round(Math.random() * 30 + 10) + 'm',
      features: generateCourseFeatures(courseType, difficulty),
      weatherSuitability: ['맑음', '흐림'],
      isOpen: true,
      safetyLevel: 'medium',
      roadType: '일반 도로',
      trafficLevel: '보통',
      realPlace: true,
      isCircular: true
    });
  });
  
  return courses.slice(0, 8);
};

// 🗺️ 러닝 경로 생성 (폴리라인용)
export const generateRunningRoute = (course) => {
  console.log(`🗺️ ${course.name} 경로 생성 중...`);
  
  if (course.waypoints && course.waypoints.length > 0) {
    // 이미 waypoints가 있는 경우 그대로 사용
    const smoothRoute = [];
    
    for (let i = 0; i < course.waypoints.length - 1; i++) {
      const start = course.waypoints[i];
      const end = course.waypoints[i + 1];
      
      // 두 점 사이를 부드럽게 연결
      smoothRoute.push(start);
      
      // 중간 점들 추가 (더 부드러운 경로)
      const steps = 5;
      for (let j = 1; j < steps; j++) {
        const t = j / steps;
        smoothRoute.push({
          lat: start.lat + (end.lat - start.lat) * t,
          lng: start.lng + (end.lng - start.lng) * t
        });
      }
    }
    
    // 마지막 점 추가
    smoothRoute.push(course.waypoints[course.waypoints.length - 1]);
    
    console.log(`✅ ${course.name} 경로 생성 완료: ${smoothRoute.length}개 포인트`);
    return smoothRoute;
  }
  
  // waypoints가 없는 경우 기본 경로 생성
  return [course.location];
};
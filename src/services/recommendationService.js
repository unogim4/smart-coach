// 두 좌표 사이의 거리 계산 (하버사인 공식 사용)
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // 지구 반경 (킬로미터)
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance;
}

function toRad(value) {
  return value * Math.PI / 180;
}

// 가상의 코스 데이터 (실제로는 DB나 API에서 가져올 것)
const sampleCourses = [
  {
    id: 1,
    name: '한강공원 러닝 코스',
    type: 'running',
    startLocation: { lat: 37.5278, lng: 126.9348 }, // 여의도 한강공원
    distance: 5.2,
    difficulty: 'beginner',
    description: '평평한 지형의 한강변을 따라 달리는 초보자 코스',
    pointsOfInterest: [
      { lat: 37.5278, lng: 126.9348 },
      { lat: 37.5285, lng: 126.9375 },
      { lat: 37.5300, lng: 126.9410 },
      { lat: 37.5315, lng: 126.9440 },
      { lat: 37.5330, lng: 126.9470 }
    ]
  },
  {
    id: 2,
    name: '남산 순환 트레일',
    type: 'running',
    startLocation: { lat: 37.5514, lng: 126.9881 }, // 남산 케이블카 승강장
    distance: 7.8,
    difficulty: 'intermediate',
    description: '남산을 한 바퀴 도는 중급자 코스, 경사가 있음',
    pointsOfInterest: [
      { lat: 37.5514, lng: 126.9881 },
      { lat: 37.5530, lng: 126.9890 },
      { lat: 37.5546, lng: 126.9900 },
      { lat: 37.5560, lng: 126.9910 },
      { lat: 37.5550, lng: 126.9930 }
    ]
  },
  {
    id: 3,
    name: '청계천 따라 달리기',
    type: 'running',
    startLocation: { lat: 37.5696, lng: 126.9789 }, // 청계광장
    distance: 10.5,
    difficulty: 'intermediate',
    description: '청계천을 따라 이어지는 도심 속 쾌적한 러닝 코스',
    pointsOfInterest: [
      { lat: 37.5696, lng: 126.9789 },
      { lat: 37.5701, lng: 126.9825 },
      { lat: 37.5705, lng: 126.9866 },
      { lat: 37.5714, lng: 126.9910 },
      { lat: 37.5730, lng: 126.9950 }
    ]
  },
  {
    id: 4,
    name: '북한산 트레일',
    type: 'running',
    startLocation: { lat: 37.6635, lng: 126.9668 }, // 북한산국립공원
    distance: 12.3,
    difficulty: 'advanced',
    description: '경사가 가파른 산악 트레일, 숙련자용 코스',
    pointsOfInterest: [
      { lat: 37.6635, lng: 126.9668 },
      { lat: 37.6650, lng: 126.9680 },
      { lat: 37.6670, lng: 126.9690 },
      { lat: 37.6690, lng: 126.9700 },
      { lat: 37.6710, lng: 126.9710 }
    ]
  },
  {
    id: 5,
    name: '올림픽공원 자전거길',
    type: 'biking',
    startLocation: { lat: 37.5169, lng: 127.1242 }, // 올림픽공원
    distance: 8.2,
    difficulty: 'beginner',
    description: '올림픽공원 내부를 순환하는 평탄한 자전거 코스',
    pointsOfInterest: [
      { lat: 37.5169, lng: 127.1242 },
      { lat: 37.5180, lng: 127.1260 },
      { lat: 37.5200, lng: 127.1280 },
      { lat: 37.5220, lng: 127.1300 },
      { lat: 37.5240, lng: 127.1290 }
    ]
  },
  {
    id: 6,
    name: '한강변 사이클링',
    type: 'biking',
    startLocation: { lat: 37.5350, lng: 126.9300 }, // 여의도 부근
    distance: 15.7,
    difficulty: 'intermediate',
    description: '한강변을 따라 이어지는 인기 자전거 코스',
    pointsOfInterest: [
      { lat: 37.5350, lng: 126.9300 },
      { lat: 37.5370, lng: 126.9350 },
      { lat: 37.5390, lng: 126.9400 },
      { lat: 37.5410, lng: 126.9450 },
      { lat: 37.5430, lng: 126.9500 }
    ]
  }
];

// 사용자 위치 기반 코스 추천
export function recommendCourses(userLocation, preferences = {}) {
  // 기본 필터링 조건
  const defaultPrefs = {
    type: 'running', // 'running' 또는 'biking'
    maxDistance: 20, // 최대 코스 길이(km)
    maxStartDistance: 5, // 시작점까지의 최대 거리(km)
    difficulty: 'any' // 'beginner', 'intermediate', 'advanced', 'any'
  };
  
  // 사용자 설정과 기본 설정 병합
  const prefs = { ...defaultPrefs, ...preferences };
  
  // 코스 필터링 및 정렬
  return sampleCourses
    .filter(course => {
      // 코스 유형 필터링
      if (prefs.type !== 'any' && course.type !== prefs.type) return false;
      
      // 난이도 필터링
      if (prefs.difficulty !== 'any' && course.difficulty !== prefs.difficulty) return false;
      
      // 코스 길이 필터링
      if (course.distance > prefs.maxDistance) return false;
      
      // 시작점까지의 거리 계산
      const distanceToStart = calculateDistance(
        userLocation.lat, userLocation.lng,
        course.startLocation.lat, course.startLocation.lng
      );
      
      // 시작점까지의 거리 필터링
      if (distanceToStart > prefs.maxStartDistance) return false;
      
      return true;
    })
    .map(course => {
      // 시작점까지의 거리 계산하여 추가
      const distanceToStart = calculateDistance(
        userLocation.lat, userLocation.lng,
        course.startLocation.lat, course.startLocation.lng
      );
      
      return { ...course, distanceToStart };
    })
    .sort((a, b) => a.distanceToStart - b.distanceToStart); // 가까운 순으로 정렬
}
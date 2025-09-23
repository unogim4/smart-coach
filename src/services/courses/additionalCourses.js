// 🏃‍♂️ 부산 지역 추가 러닝 코스 데이터
// 실제 GPS 좌표 기반 코스

// 코스 1: 서동 시장 편도 코스
export const COURSE_1 = {
  id: 'custom-course-1',
  name: '부산 서동 시장 러닝 코스',
  description: '서동 시장 인근 편도 2.8km 러닝 코스',
  type: 'oneway', // 편도
  totalDistance: 2800, // 약 2.8km
  estimatedTime: '17분',
  difficulty: 'medium',
  location: '부산 금정구 서동',
  
  // 제공된 실제 경로 좌표
  path: [
    // 출발점: 35.214154, 129.108309
    { lat: 35.214154, lng: 129.108309, label: '출발', distance: 0 },
    
    // 출발점에서 경유지까지 보간점들 (직선 경로로 계산)
    { lat: 35.214254, lng: 129.107809, distance: 150 },
    { lat: 35.214354, lng: 129.107309, distance: 300 },
    { lat: 35.214454, lng: 129.106809, distance: 450 },
    { lat: 35.214554, lng: 129.106309, distance: 600 },
    { lat: 35.214654, lng: 129.105809, distance: 750 },
    { lat: 35.214754, lng: 129.105309, distance: 900 },
    { lat: 35.214854, lng: 129.104809, distance: 1050 },
    { lat: 35.214878, lng: 129.103751, distance: 1200 },
    
    // 경유지: 35.214978, 129.102751
    { lat: 35.214978, lng: 129.102751, label: '경유지', distance: 1400 },
    
    // 경유지에서 도착지까지 보간점들
    { lat: 35.215178, lng: 129.102151, distance: 1550 },
    { lat: 35.215378, lng: 129.101551, distance: 1700 },
    { lat: 35.215578, lng: 129.100951, distance: 1850 },
    { lat: 35.215778, lng: 129.100351, distance: 2000 },
    { lat: 35.215978, lng: 129.099751, distance: 2150 },
    { lat: 35.216178, lng: 129.099351, distance: 2300 },
    { lat: 35.216315, lng: 129.099182, distance: 2450 },
    { lat: 35.216365, lng: 129.099132, distance: 2600 },
    
    // 도착점: 35.216415, 129.099082
    { lat: 35.216415, lng: 129.099082, label: '도착', distance: 2800 }
  ],
  
  // 구간별 페이스
  segments: [
    { start: 0, end: 700, pace: 6.0, description: '워밍업' },
    { start: 700, end: 1400, pace: 5.5, description: '본격 러닝' },
    { start: 1400, end: 2100, pace: 5.3, description: '중강도 구간' },
    { start: 2100, end: 2800, pace: 5.8, description: '마무리' }
  ],
  
  features: ['편도 코스', '시장 근처', '활기찬 분위기', '다양한 볼거리']
};

// 코스 2: 동래구 편도 장거리 코스
export const COURSE_2 = {
  id: 'custom-course-2',
  name: '부산 장거리 러닝 코스 2',
  description: '동래구-해운대구 연결 편도 4.5km 장거리 코스',
  type: 'oneway', // 편도
  totalDistance: 4500, // 약 4.5km
  estimatedTime: '28분',
  difficulty: 'hard',
  location: '부산 동래구-해운대구',
  
  // 제공된 실제 경로 좌표
  path: [
    // 출발점: 35.218211, 129.100694
    { lat: 35.218211, lng: 129.100694, label: '출발', distance: 0 },
    
    // 출발점에서 경유지1까지
    { lat: 35.217911, lng: 129.101194, distance: 200 },
    { lat: 35.217611, lng: 129.101694, distance: 400 },
    { lat: 35.217311, lng: 129.102194, distance: 600 },
    { lat: 35.217011, lng: 129.102694, distance: 800 },
    { lat: 35.216711, lng: 129.103194, distance: 1000 },
    { lat: 35.216411, lng: 129.103694, distance: 1200 },
    { lat: 35.216111, lng: 129.104194, distance: 1400 },
    { lat: 35.215811, lng: 129.104494, distance: 1600 },
    { lat: 35.215311, lng: 129.104794, distance: 1800 },
    
    // 경유지1: 35.214617, 129.105082
    { lat: 35.214617, lng: 129.105082, label: '경유지1', distance: 2000 },
    
    // 경유지1에서 경유지2까지
    { lat: 35.214597, lng: 129.105282, distance: 2100 },
    { lat: 35.214587, lng: 129.105382, distance: 2200 },
    { lat: 35.214577, lng: 129.105482, distance: 2300 },
    { lat: 35.214575, lng: 129.105582, distance: 2400 },
    
    // 경유지2: 35.214574, 129.105726
    { lat: 35.214574, lng: 129.105726, label: '경유지2', distance: 2500 },
    
    // 경유지2에서 도착지까지 (긴 구간)
    { lat: 35.214774, lng: 129.108726, distance: 2700 },
    { lat: 35.214974, lng: 129.111726, distance: 2900 },
    { lat: 35.215174, lng: 129.114726, distance: 3100 },
    { lat: 35.215374, lng: 129.117726, distance: 3300 },
    { lat: 35.215574, lng: 129.120726, distance: 3500 },
    { lat: 35.215774, lng: 129.123726, distance: 3700 },
    { lat: 35.215974, lng: 129.126726, distance: 3900 },
    { lat: 35.216374, lng: 129.129726, distance: 4100 },
    { lat: 35.216774, lng: 129.131726, distance: 4300 },
    
    // 도착점: 35.217063, 129.133719
    { lat: 35.217063, lng: 129.133719, label: '도착', distance: 4500 }
  ],
  
  // 구간별 페이스
  segments: [
    { start: 0, end: 1000, pace: 6.2, description: '워밍업' },
    { start: 1000, end: 2500, pace: 5.4, description: '중강도 러닝' },
    { start: 2500, end: 3800, pace: 5.0, description: '고강도 구간' },
    { start: 3800, end: 4500, pace: 5.8, description: '쿨다운' }
  ],
  
  features: ['편도 코스', '장거리', '도전적', '2개 경유지', '다양한 지형']
};

// 기존 코스들 (온천장 주변)
export const GEUMJEONG_COURSE = {
  id: 'geumjeong-course',
  name: '금정구 러닝 코스',
  description: '금정구 지역의 중거리 3.2km 코스',
  type: 'loop',
  totalDistance: 3200,
  estimatedTime: '20분',
  difficulty: 'medium',
  location: '부산 금정구',
  
  path: [
    { lat: 35.242154, lng: 129.088309, label: '출발', distance: 0 },
    { lat: 35.242454, lng: 129.087809, distance: 200 },
    { lat: 35.242754, lng: 129.087309, distance: 400 },
    { lat: 35.243054, lng: 129.086809, distance: 600 },
    { lat: 35.243354, lng: 129.086309, distance: 800 },
    { lat: 35.243654, lng: 129.085809, distance: 1000 },
    { lat: 35.243954, lng: 129.085309, distance: 1200 },
    { lat: 35.244254, lng: 129.084809, distance: 1400 },
    { lat: 35.244554, lng: 129.084309, distance: 1600 },
    { lat: 35.244854, lng: 129.083809, distance: 1800 },
    { lat: 35.245154, lng: 129.083309, distance: 2000 },
    { lat: 35.245454, lng: 129.082809, distance: 2200 },
    { lat: 35.245754, lng: 129.082309, distance: 2400 },
    { lat: 35.246054, lng: 129.081809, distance: 2600 },
    { lat: 35.246354, lng: 129.081309, distance: 2800 },
    { lat: 35.246654, lng: 129.080809, distance: 3000 },
    { lat: 35.246954, lng: 129.080309, label: '도착', distance: 3200 }
  ],
  
  segments: [
    { start: 0, end: 800, pace: 6.0, description: '워밍업' },
    { start: 800, end: 1800, pace: 5.5, description: '본격 러닝' },
    { start: 1800, end: 2800, pace: 5.3, description: '고강도 구간' },
    { start: 2800, end: 3200, pace: 5.8, description: '마무리' }
  ],
  
  features: ['순환 코스', '적당한 난이도', '도심 러닝']
};

export const DONGNAE_COURSE = {
  id: 'dongnae-course',
  name: '동래구 역사길 러닝 코스',
  description: '동래구 역사 문화 지역 5.5km 코스',
  type: 'loop',
  totalDistance: 5500,
  estimatedTime: '35분',
  difficulty: 'hard',
  location: '부산 동래구',
  
  path: [
    { lat: 35.198211, lng: 129.080694, label: '출발', distance: 0 },
    { lat: 35.197911, lng: 129.081194, distance: 200 },
    { lat: 35.197611, lng: 129.081694, distance: 400 },
    { lat: 35.197311, lng: 129.082194, distance: 600 },
    { lat: 35.197011, lng: 129.082694, distance: 800 },
    { lat: 35.196711, lng: 129.083194, distance: 1000 },
    { lat: 35.196411, lng: 129.083694, distance: 1200 },
    { lat: 35.196111, lng: 129.084194, distance: 1400 },
    { lat: 35.195811, lng: 129.084494, distance: 1600 },
    { lat: 35.195311, lng: 129.084794, distance: 1800 },
    { lat: 35.194617, lng: 129.085082, label: '경유지1', distance: 2000 },
    { lat: 35.194597, lng: 129.085282, distance: 2200 },
    { lat: 35.194587, lng: 129.085482, distance: 2400 },
    { lat: 35.194574, lng: 129.085726, label: '경유지2', distance: 2600 },
    { lat: 35.194774, lng: 129.087726, distance: 2800 },
    { lat: 35.194974, lng: 129.089726, distance: 3200 },
    { lat: 35.195174, lng: 129.091726, distance: 3600 },
    { lat: 35.195374, lng: 129.093726, distance: 4000 },
    { lat: 35.195574, lng: 129.095726, distance: 4400 },
    { lat: 35.195774, lng: 129.097726, distance: 4800 },
    { lat: 35.195974, lng: 129.099726, distance: 5000 },
    { lat: 35.196374, lng: 129.103726, distance: 5200 },
    { lat: 35.196774, lng: 129.107726, distance: 5400 },
    { lat: 35.197063, lng: 129.113719, label: '도착', distance: 5500 }
  ],
  
  segments: [
    { start: 0, end: 1000, pace: 6.2, description: '워밍업' },
    { start: 1000, end: 2600, pace: 5.4, description: '중강도 러닝' },
    { start: 2600, end: 4500, pace: 5.0, description: '고강도 구간' },
    { start: 4500, end: 5500, pace: 5.8, description: '쿨다운' }
  ],
  
  features: ['순환 코스', '장거리', '다양한 지형', '2개 경유지']
};

// 시뮬레이션 데이터 생성 함수 (코스 1)
export function generateCourse1SimulationData() {
  const course = COURSE_1;
  return {
    course: course,
    currentIndex: 0,
    startTime: Date.now(),
    totalDistance: 0,
    currentSpeed: 0,
    avgSpeed: 0,
    currentHeartRate: 95,
    calories: 0,
    steps: 0,
    pace: '0:00'
  };
}

// 시뮬레이션 데이터 생성 함수 (코스 2)
export function generateCourse2SimulationData() {
  const course = COURSE_2;
  return {
    course: course,
    currentIndex: 0,
    startTime: Date.now(),
    totalDistance: 0,
    currentSpeed: 0,
    avgSpeed: 0,
    currentHeartRate: 95,
    calories: 0,
    steps: 0,
    pace: '0:00'
  };
}

// 실시간 업데이트 함수 (공통)
export function updateCourseSimulationData(data, elapsedSeconds) {
  const course = data.course;
  const totalDistance = course.totalDistance;
  
  // 예상 시간에 맞춰 완주
  let targetDuration;
  if (course.id === 'custom-course-1') {
    targetDuration = 1020; // 17분 = 1020초
  } else if (course.id === 'custom-course-2') {
    targetDuration = 1680; // 28분 = 1680초
  } else if (course.id === 'geumjeong-course') {
    targetDuration = 1200; // 20분
  } else if (course.id === 'dongnae-course') {
    targetDuration = 2100; // 35분
  } else {
    targetDuration = totalDistance / 2.5; // 기본값
  }
  
  // 완료 체크
  if (elapsedSeconds >= targetDuration) {
    return {
      ...data,
      currentPosition: null,
      completed: true,
      totalDistance: totalDistance,
      currentSpeed: '10.0',
      avgSpeed: ((totalDistance / 1000) / (targetDuration / 3600)).toFixed(1),
      currentHeartRate: 135,
      calories: Math.round(totalDistance * 0.05),
      steps: Math.round(totalDistance * 1.3),
      pace: '6:00',
      elapsedTime: targetDuration,
      progress: 100
    };
  }
  
  // 진행률 계산
  const progressPercent = (elapsedSeconds / targetDuration) * 100;
  const distanceCovered = (progressPercent / 100) * totalDistance;
  
  // 현재 위치 보간
  const currentPoint = interpolateCoursePosition(course.path, progressPercent);
  
  // 현재 구간 찾기
  const currentSegment = course.segments.find(
    seg => distanceCovered >= seg.start && distanceCovered < seg.end
  ) || course.segments[course.segments.length - 1];
  
  // 속도 계산
  const baseSpeed = 60 / currentSegment.pace;
  const speedVariation = Math.sin(elapsedSeconds * 0.1) * 0.3;
  const currentSpeed = Math.max(baseSpeed + speedVariation, 8);
  
  // 페이스 계산
  const paceValue = 60 / currentSpeed;
  const paceMinutes = Math.floor(paceValue);
  const paceSeconds = Math.round((paceValue - paceMinutes) * 60);
  const pace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
  
  // 심박수 계산
  let targetHeartRate;
  const warmupDuration = targetDuration * 0.15;
  const cooldownStart = targetDuration * 0.85;
  
  if (elapsedSeconds < warmupDuration) {
    targetHeartRate = 95 + (elapsedSeconds / warmupDuration) * 40;
  } else if (elapsedSeconds < cooldownStart) {
    const intensity = currentSpeed / 12;
    targetHeartRate = 135 + intensity * 30;
  } else {
    targetHeartRate = 155 - ((elapsedSeconds - cooldownStart) / (targetDuration - cooldownStart)) * 25;
  }
  
  const heartRateVariation = Math.sin(elapsedSeconds * 0.2) * 5;
  const currentHeartRate = Math.round(Math.min(Math.max(targetHeartRate + heartRateVariation, 60), 185));
  
  // 칼로리 및 걸음수 계산
  const met = currentSpeed < 8 ? 7 : currentSpeed < 10 ? 9.8 : 11.5;
  const caloriesPerSecond = (met * 70) / 3600;
  const calories = Math.round(caloriesPerSecond * elapsedSeconds);
  const steps = Math.round(distanceCovered * 1.3);
  
  // 평균 속도
  const avgSpeed = elapsedSeconds > 0 ? (distanceCovered / 1000) / (elapsedSeconds / 3600) : 0;
  
  return {
    ...data,
    currentPosition: currentPoint,
    totalDistance: distanceCovered,
    currentSpeed: currentSpeed.toFixed(1),
    avgSpeed: avgSpeed.toFixed(1),
    currentHeartRate: currentHeartRate,
    calories: calories,
    steps: steps,
    pace: pace,
    elapsedTime: elapsedSeconds,
    progress: progressPercent
  };
}

// 위치 보간 함수
function interpolateCoursePosition(path, progressPercent) {
  const totalPoints = path.length;
  const exactPosition = (progressPercent / 100) * (totalPoints - 1);
  const index = Math.floor(exactPosition);
  const fraction = exactPosition - index;
  
  if (index >= totalPoints - 1) {
    return path[totalPoints - 1];
  }
  
  const point1 = path[index];
  const point2 = path[index + 1];
  
  return {
    lat: point1.lat + (point2.lat - point1.lat) * fraction,
    lng: point1.lng + (point2.lng - point1.lng) * fraction,
    distance: point1.distance + (point2.distance - point1.distance) * fraction,
    label: point1.label || null
  };
}

// 🏃‍♂️ 온천장 러닝 코스 데이터
// 부산 동래구 온천장 지역의 실제 러닝 코스

export const ONCHEONJANG_RUNNING_COURSE = {
  name: '온천장 러닝 코스',
  totalDistance: 1500, // 약 1.5km (편도)
  description: '온천장 직선 편도 코스',
  
  // 직선 경로로 단순화
  path: [
    // 시작점: 35.220462, 129.086192
    { lat: 35.220462, lng: 129.086192, label: '시작', distance: 0 },
    
    // 시작점에서 경유지까지 직선 (10개 포인트로 보간)
    { lat: 35.221462, lng: 129.086792, distance: 75 },
    { lat: 35.222462, lng: 129.087392, distance: 150 },
    { lat: 35.223462, lng: 129.087992, distance: 225 },
    { lat: 35.224462, lng: 129.088592, distance: 300 },
    { lat: 35.225462, lng: 129.089192, distance: 375 },
    { lat: 35.226462, lng: 129.089792, distance: 450 },
    { lat: 35.227462, lng: 129.090192, distance: 525 },
    { lat: 35.228462, lng: 129.090592, distance: 600 },
    { lat: 35.229162, lng: 129.090992, distance: 675 },
    
    // 경유지점: 35.229843, 129.091357
    { lat: 35.229843, lng: 129.091357, label: '경유지', distance: 750 },
    
    // 경유지에서 도착지까지 직선 (10개 포인트로 보간)
    { lat: 35.230243, lng: 129.091407, distance: 800 },
    { lat: 35.230643, lng: 129.091457, distance: 850 },
    { lat: 35.231043, lng: 129.091507, distance: 900 },
    { lat: 35.231443, lng: 129.091557, distance: 950 },
    { lat: 35.231843, lng: 129.091607, distance: 1000 },
    { lat: 35.232243, lng: 129.091657, distance: 1050 },
    { lat: 35.232643, lng: 129.091707, distance: 1100 },
    { lat: 35.233043, lng: 129.091737, distance: 1150 },
    { lat: 35.233443, lng: 129.091757, distance: 1200 },
    { lat: 35.233643, lng: 129.091767, distance: 1250 },
    { lat: 35.233843, lng: 129.091772, distance: 1300 },
    
    // 도착지점: 35.234004, 129.091775
    { lat: 35.234004, lng: 129.091775, label: '도착', distance: 1500 }
  ],
  
  // 구간별 페이스 설정 (9분 완주용)
  segments: [
    { start: 0, end: 200, pace: 6.5, description: '워밍업' },
    { start: 200, end: 750, pace: 5.5, description: '본격 러닝' },
    { start: 750, end: 1300, pace: 5.8, description: '안정적 페이스' },
    { start: 1300, end: 1500, pace: 6.2, description: '마무리' }
  ],
  
  // 심박수 패턴
  heartRatePattern: {
    warmup: { min: 90, max: 120 },
    moderate: { min: 130, max: 150 },
    intense: { min: 150, max: 170 },
    cooldown: { min: 100, max: 130 }
  }
};

// 시뮬레이션 데이터 생성 함수
export function generateSimulationData() {
  const course = ONCHEONJANG_RUNNING_COURSE;
  const simulationData = {
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
  
  return simulationData;
}

// 실시간 데이터 업데이트 함수 (부드러운 움직임)
export function updateSimulationData(data, elapsedSeconds) {
  const course = data.course;
  const totalDistance = 1500; // 1.5km
  const targetDuration = 540; // 9분 = 540초
  
  // 9분 후 완료
  if (elapsedSeconds >= targetDuration) {
    // 최종 데이터 반환
    return {
      ...data,
      currentPosition: null, // 완료 신호
      completed: true,
      totalDistance: 1500,
      currentSpeed: '10.0',
      avgSpeed: '10.0',
      currentHeartRate: 145,
      calories: 75,
      steps: 1950,
      pace: '6:00',
      elapsedTime: targetDuration,
      progress: 100
    };
  }
  
  // 부드러운 위치 계산 (1% 단위 정밀도)
  const progressPercent = (elapsedSeconds / targetDuration) * 100;
  const distanceCovered = (progressPercent / 100) * totalDistance;
  
  // 경로 상의 위치 계산 (보간)
  const currentPoint = interpolatePosition(course.path, progressPercent);
  
  // 현재 구간 찾기
  const currentSegment = course.segments.find(
    seg => distanceCovered >= seg.start && distanceCovered < seg.end
  ) || course.segments[course.segments.length - 1];
  
  // 속도 계산 (페이스를 속도로 변환)
  const baseSpeed = 60 / currentSegment.pace; // 페이스(분/km)를 속도(km/h)로 변환
  const speedVariation = Math.sin(elapsedSeconds * 0.1) * 0.3; // 부드러운 변동
  const currentSpeed = Math.max(baseSpeed + speedVariation, 8); // 최소 8km/h
  
  // 페이스 계산
  const paceValue = 60 / currentSpeed;
  const paceMinutes = Math.floor(paceValue);
  const paceSeconds = Math.round((paceValue - paceMinutes) * 60);
  const pace = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
  
  // 심박수 계산 (부드러운 변화)
  let targetHeartRate;
  if (elapsedSeconds < 120) { // 첫 2분: 워밍업
    targetHeartRate = 95 + (elapsedSeconds / 120) * 35;
  } else if (elapsedSeconds < 480) { // 2-8분: 본격 운동
    const intensity = currentSpeed / 12;
    targetHeartRate = 130 + intensity * 30;
  } else { // 8-9분: 쿨다운
    targetHeartRate = 150 - ((elapsedSeconds - 480) / 60) * 20;
  }
  
  // 심박수에 자연스러운 변동 추가
  const heartRateVariation = Math.sin(elapsedSeconds * 0.2) * 5;
  const currentHeartRate = Math.round(Math.min(Math.max(targetHeartRate + heartRateVariation, 60), 185));
  
  // 칼로리 계산 (MET 방식)
  const met = currentSpeed < 8 ? 7 : currentSpeed < 10 ? 9.8 : 11.5;
  const caloriesPerSecond = (met * 70) / 3600; // 70kg 기준
  const calories = Math.round(caloriesPerSecond * elapsedSeconds);
  
  // 걸음수 계산
  const stepsPerMeter = 1.3;
  const steps = Math.round(distanceCovered * stepsPerMeter);
  
  // 평균 속도 계산
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

// 위치 보간 함수 (부드러운 움직임을 위해)
function interpolatePosition(path, progressPercent) {
  const totalPoints = path.length;
  const exactPosition = (progressPercent / 100) * (totalPoints - 1);
  const index = Math.floor(exactPosition);
  const fraction = exactPosition - index;
  
  if (index >= totalPoints - 1) {
    return path[totalPoints - 1];
  }
  
  const point1 = path[index];
  const point2 = path[index + 1];
  
  // 선형 보간
  return {
    lat: point1.lat + (point2.lat - point1.lat) * fraction,
    lng: point1.lng + (point2.lng - point1.lng) * fraction,
    distance: point1.distance + (point2.distance - point1.distance) * fraction
  };
}

// 시뮬레이션 완료 데이터 생성
export function generateCompletionData(data) {
  return {
    date: new Date().toISOString(),
    course: data.course.name,
    distance: (data.totalDistance / 1000).toFixed(2),
    time: data.elapsedTime,
    avgSpeed: data.avgSpeed,
    avgHeartRate: data.currentHeartRate,
    calories: data.calories,
    steps: data.steps,
    pace: data.pace,
    maxSpeed: 11.5,
    route: data.course.path
  };
}
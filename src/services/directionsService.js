// 🗺️ Google Directions API를 활용한 실제 도로 경로 생성 서비스

/**
 * Google Directions Service를 사용해서 실제 도로를 따라가는 경로 생성
 * @param {Object} start - 시작 위치 {lat, lng}
 * @param {Object} end - 종료 위치 {lat, lng}
 * @param {Array} waypoints - 경유지 배열 (선택)
 * @returns {Promise<Array>} 도로를 따라가는 경로 포인트 배열
 */
export const getDirectionsRoute = async (start, end, waypoints = []) => {
  return new Promise((resolve, reject) => {
    // Google Maps API가 로드되었는지 확인
    if (!window.google || !window.google.maps) {
      console.error('Google Maps API가 로드되지 않았습니다');
      resolve(getSimpleRoute(start, end, waypoints));
      return;
    }

    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // 경유지 설정
      const waypointsList = waypoints.map(point => ({
        location: new window.google.maps.LatLng(point.lat, point.lng),
        stopover: false // 경유지에서 멈추지 않음
      }));

      // Directions 요청 옵션
      const request = {
        origin: new window.google.maps.LatLng(start.lat, start.lng),
        destination: new window.google.maps.LatLng(end.lat, end.lng),
        waypoints: waypointsList,
        optimizeWaypoints: true, // 경유지 최적화
        travelMode: window.google.maps.TravelMode.WALKING, // 도보 경로
        unitSystem: window.google.maps.UnitSystem.METRIC,
        avoidHighways: true, // 고속도로 회피
        avoidTolls: true, // 유료도로 회피
        region: 'kr' // 한국 지역 우선
      };

      // Directions API 호출
      directionsService.route(request, (result, status) => {
        if (status === 'OK' && result) {
          console.log('✅ Directions API 성공:', result);
          
          // 경로에서 모든 포인트 추출
          const route = result.routes[0];
          const pathPoints = [];
          
          route.legs.forEach(leg => {
            leg.steps.forEach(step => {
              // 각 스텝의 경로 포인트들을 추가
              step.path.forEach(point => {
                pathPoints.push({
                  lat: point.lat(),
                  lng: point.lng()
                });
              });
            });
          });
          
          console.log(`✅ 실제 도로 경로: ${pathPoints.length}개 포인트`);
          
          // 거리와 시간 정보 추가
          const totalDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
          const totalDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
          
          // 경로 정보와 함께 반환
          resolve({
            path: pathPoints,
            distance: totalDistance, // 미터
            duration: totalDuration, // 초
            distanceText: `${(totalDistance / 1000).toFixed(1)}km`,
            durationText: `${Math.round(totalDuration / 60)}분`
          });
        } else {
          console.warn('Directions API 실패:', status);
          // 실패 시 간단한 경로로 대체
          resolve(getSimpleRoute(start, end, waypoints));
        }
      });
    } catch (error) {
      console.error('Directions Service 오류:', error);
      resolve(getSimpleRoute(start, end, waypoints));
    }
  });
};

/**
 * 여러 경유지를 통과하는 순환 경로 생성
 * @param {Object} start - 시작 위치
 * @param {Array} waypoints - 경유지 배열
 * @returns {Promise<Object>} 순환 경로 정보
 */
export const getCircularRoute = async (start, waypoints) => {
  // 시작점 -> 경유지들 -> 시작점으로 돌아오는 순환 경로
  const fullWaypoints = [...waypoints];
  const endPoint = start; // 시작점으로 돌아옴
  
  return await getDirectionsRoute(start, endPoint, fullWaypoints);
};

/**
 * 간단한 직선 경로 생성 (Directions API 실패 시 대체)
 * @param {Object} start - 시작 위치
 * @param {Object} end - 종료 위치
 * @param {Array} waypoints - 경유지 배열
 * @returns {Object} 간단한 경로 정보
 */
const getSimpleRoute = (start, end, waypoints = []) => {
  const path = [start];
  
  // 경유지들 추가
  waypoints.forEach(waypoint => {
    // 이전 점에서 현재 경유지까지 보간
    const prevPoint = path[path.length - 1];
    const steps = 10;
    
    for (let i = 1; i <= steps; i++) {
      const t = i / steps;
      path.push({
        lat: prevPoint.lat + (waypoint.lat - prevPoint.lat) * t,
        lng: prevPoint.lng + (waypoint.lng - prevPoint.lng) * t
      });
    }
  });
  
  // 마지막 경유지에서 종점까지
  const lastPoint = path[path.length - 1];
  const steps = 10;
  
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    path.push({
      lat: lastPoint.lat + (end.lat - lastPoint.lat) * t,
      lng: lastPoint.lng + (end.lng - lastPoint.lng) * t
    });
  }
  
  // 거리 계산
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateDistanceBetween(path[i], path[i + 1]);
  }
  
  return {
    path: path,
    distance: totalDistance,
    duration: totalDistance / 1.4, // 도보 속도 5km/h 가정
    distanceText: `${(totalDistance / 1000).toFixed(1)}km`,
    durationText: `${Math.round(totalDistance / 1.4 / 60)}분`
  };
};

/**
 * 두 점 사이의 거리 계산
 */
const calculateDistanceBetween = (point1, point2) => {
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

/**
 * 주변의 도로에 스냅된 러닝 코스 생성
 * @param {Object} center - 중심 위치
 * @param {Number} radius - 반경 (미터)
 * @returns {Promise<Array>} 도로 기반 러닝 코스 배열
 */
export const generateRoadBasedCourses = async (center, radius) => {
  const courses = [];
  
  // 8방향으로 코스 생성
  const directions = [
    { angle: 0, name: '북' },
    { angle: Math.PI/4, name: '북동' },
    { angle: Math.PI/2, name: '동' },
    { angle: 3*Math.PI/4, name: '남동' },
    { angle: Math.PI, name: '남' },
    { angle: 5*Math.PI/4, name: '남서' },
    { angle: 3*Math.PI/2, name: '서' },
    { angle: 7*Math.PI/4, name: '북서' }
  ];
  
  // 각 방향으로 코스 생성
  for (let i = 0; i < Math.min(5, directions.length); i++) {
    const direction = directions[i];
    const distance = 1000 + i * 500; // 1km, 1.5km, 2km...
    
    // 방향에 따른 경유지 계산
    const waypoint1 = {
      lat: center.lat + (distance / 111320) * Math.cos(direction.angle),
      lng: center.lng + (distance / 111320) * Math.sin(direction.angle) / Math.cos(center.lat * Math.PI / 180)
    };
    
    // 옆으로 이동한 두 번째 경유지
    const sideAngle = direction.angle + Math.PI / 2;
    const waypoint2 = {
      lat: waypoint1.lat + (distance * 0.5 / 111320) * Math.cos(sideAngle),
      lng: waypoint1.lng + (distance * 0.5 / 111320) * Math.sin(sideAngle) / Math.cos(center.lat * Math.PI / 180)
    };
    
    // Directions API로 실제 도로 경로 가져오기
    const routeInfo = await getCircularRoute(center, [waypoint1, waypoint2]);
    
    courses.push({
      id: `road-course-${i}`,
      name: `${direction.name}쪽 러닝 코스`,
      direction: direction.name,
      waypoints: [center, waypoint1, waypoint2, center],
      routeInfo: routeInfo,
      estimatedDistance: routeInfo.distanceText,
      estimatedTime: routeInfo.durationText,
      difficulty: distance < 1500 ? 'easy' : distance < 2500 ? 'medium' : 'hard'
    });
  }
  
  return courses;
};
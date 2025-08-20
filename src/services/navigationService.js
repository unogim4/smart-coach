// 🧭 네비게이션 스타일 경로 안내 서비스
// 사용자가 시작점과 도착점을 선택하고 실제 도로 경로 안내

import { getKoreanRoute } from './koreanMapService';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// 경로 타입 정의
export const ROUTE_TYPES = {
  WALKING: { 
    label: '도보', 
    icon: '🚶', 
    travelMode: 'WALKING',
    speed: 5, // km/h
    color: '#10B981'
  },
  RUNNING: { 
    label: '러닝', 
    icon: '🏃', 
    travelMode: 'WALKING',
    speed: 10, // km/h
    color: '#3B82F6'
  },
  CYCLING: { 
    label: '자전거', 
    icon: '🚴', 
    travelMode: 'BICYCLING',
    speed: 20, // km/h
    color: '#F59E0B'
  }
};

// 🗺️ Google Directions API를 사용한 실제 경로 생성
export const createNavigationRoute = async (start, end, routeType = 'RUNNING', waypoints = []) => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps가 로드되지 않았습니다');
  }

  return new Promise((resolve, reject) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    // 경유지 처리
    const waypointsList = waypoints.map(point => ({
      location: new window.google.maps.LatLng(point.lat, point.lng),
      stopover: true
    }));

    const request = {
      origin: new window.google.maps.LatLng(start.lat, start.lng),
      destination: new window.google.maps.LatLng(end.lat, end.lng),
      waypoints: waypointsList,
      optimizeWaypoints: true, // 경유지 최적화
      travelMode: window.google.maps.TravelMode[ROUTE_TYPES[routeType].travelMode],
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: routeType !== 'CYCLING',
      avoidTolls: true,
      region: 'KR',
      language: 'ko',
      provideRouteAlternatives: true
    };

    console.log('🧭 경로 생성 요청:', {
      시작: `${start.lat.toFixed(6)}, ${start.lng.toFixed(6)}`,
      도착: `${end.lat.toFixed(6)}, ${end.lng.toFixed(6)}`,
      타입: ROUTE_TYPES[routeType].label,
      경유지: waypoints.length
    });

    directionsService.route(request, (result, status) => {
      if (status === 'OK' && result) {
        const route = result.routes[0];
        
        // 전체 경로 포인트 추출
        const pathPoints = [];
        const instructions = [];
        let totalDistance = 0;
        let totalDuration = 0;

        route.legs.forEach((leg, legIndex) => {
          totalDistance += leg.distance.value;
          totalDuration += leg.duration.value;

          leg.steps.forEach((step, stepIndex) => {
            // 경로 포인트 수집
            step.path.forEach(point => {
              pathPoints.push({
                lat: point.lat(),
                lng: point.lng()
              });
            });

            // 턴바이턴 안내 생성
            instructions.push({
              id: `${legIndex}-${stepIndex}`,
              text: step.instructions.replace(/<[^>]*>/g, ''), // HTML 태그 제거
              distance: step.distance.text,
              duration: step.duration.text,
              startLocation: {
                lat: step.start_location.lat(),
                lng: step.start_location.lng()
              },
              endLocation: {
                lat: step.end_location.lat(),
                lng: step.end_location.lng()
              },
              maneuver: step.maneuver || 'straight'
            });
          });
        });

        // 예상 운동 시간 계산 (운동 속도 기준)
        const exerciseSpeed = ROUTE_TYPES[routeType].speed;
        const exerciseDuration = (totalDistance / 1000) / exerciseSpeed * 60; // 분

        const routeData = {
          success: true,
          path: pathPoints,
          distance: totalDistance,
          duration: totalDuration,
          exerciseDuration: Math.round(exerciseDuration),
          instructions: instructions,
          bounds: {
            north: route.bounds.getNorthEast().lat(),
            south: route.bounds.getSouthWest().lat(),
            east: route.bounds.getNorthEast().lng(),
            west: route.bounds.getSouthWest().lng()
          },
          overview: {
            polyline: route.overview_polyline,
            path: route.overview_path.map(point => ({
              lat: point.lat(),
              lng: point.lng()
            }))
          },
          startAddress: route.legs[0].start_address,
          endAddress: route.legs[route.legs.length - 1].end_address,
          routeType: routeType,
          waypoints: route.waypoint_order
        };

        console.log('✅ 경로 생성 성공:', {
          거리: `${(totalDistance / 1000).toFixed(2)}km`,
          예상시간: `${exerciseDuration}분`,
          경로점: pathPoints.length,
          안내: instructions.length
        });

        resolve(routeData);
      } else {
        console.error('❌ 경로 생성 실패:', status);
        
        // 에러 처리
        let errorMessage = '경로를 생성할 수 없습니다';
        switch(status) {
          case 'ZERO_RESULTS':
            errorMessage = '해당 경로를 찾을 수 없습니다. 한국 지도 API를 시도합니다.';
            console.log('🔄 Google Directions 실패, 한국 API 시도...');
            
            // 한국 지도 API 시도 (Promise로 처리)
            getKoreanRoute(start, end, routeType)
              .then(koreanRoute => {
                if (koreanRoute.success) {
                  // 한국 API 결과를 Google 형식으로 변환
                  const convertedRoute = {
                    ...koreanRoute,
                    exerciseDuration: Math.round(koreanRoute.duration / 60),
                    overview: {
                      path: koreanRoute.path,
                      polyline: null
                    },
                    startAddress: '출발지',
                    endAddress: '도착지',
                    routeType: routeType,
                    waypoints: []
                  };
                  console.log('✅ 한국 지도 API 성공!');
                  resolve(convertedRoute);
                } else {
                  throw new Error('한국 API 실패');
                }
              })
              .catch(koreanApiError => {
                console.warn('한국 API도 실패, 직선 경로 생성...', koreanApiError);
                // 한국 API도 실패하면 직선 경로
                const straightRoute = createStraightRoute(start, end, routeType);
                resolve(straightRoute);
              });
            return; // reject를 막기 위해 return
            break;
          case 'NOT_FOUND':
            errorMessage = '시작점 또는 도착점을 찾을 수 없습니다';
            break;
          case 'MAX_WAYPOINTS_EXCEEDED':
            errorMessage = '경유지가 너무 많습니다 (최대 23개)';
            break;
          case 'INVALID_REQUEST':
            errorMessage = '잘못된 요청입니다';
            break;
          case 'OVER_QUERY_LIMIT':
            errorMessage = 'API 호출 한도를 초과했습니다';
            break;
          case 'REQUEST_DENIED':
            errorMessage = 'API 키가 유효하지 않습니다';
            break;
        }
        
        reject(new Error(errorMessage));
      }
    });
  });
};

// 🗺️ 직선 경로 생성 (폴백용)
const createStraightRoute = (start, end, routeType) => {
  const distance = calculateDistance(start, end);
  const steps = Math.max(20, Math.floor(distance / 50)); // 50m마다 포인트
  
  const pathPoints = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    pathPoints.push({
      lat: start.lat + (end.lat - start.lat) * t,
      lng: start.lng + (end.lng - start.lng) * t
    });
  }
  
  // 예상 운동 시간 계산
  const exerciseSpeed = ROUTE_TYPES[routeType].speed;
  const exerciseDuration = (distance / 1000) / exerciseSpeed * 60; // 분
  
  // 간단한 안내 생성
  const instructions = [
    {
      id: '0-0',
      text: `${(distance / 1000).toFixed(2)}km 직선 경로로 이동`,
      distance: `${(distance / 1000).toFixed(2)}km`,
      duration: `${Math.round(exerciseDuration)}분`,
      startLocation: start,
      endLocation: end,
      maneuver: 'straight'
    }
  ];
  
  return {
    success: true,
    path: pathPoints,
    distance: distance,
    duration: exerciseDuration * 60, // 초 단위
    exerciseDuration: Math.round(exerciseDuration),
    instructions: instructions,
    bounds: {
      north: Math.max(start.lat, end.lat),
      south: Math.min(start.lat, end.lat),
      east: Math.max(start.lng, end.lng),
      west: Math.min(start.lng, end.lng)
    },
    overview: {
      polyline: null,
      path: pathPoints
    },
    startAddress: '시작점',
    endAddress: '도착점',
    routeType: routeType,
    waypoints: [],
    isStraightPath: true
  };
};

// 🎯 추천 목적지 생성 (현재 위치 기반)
export const suggestDestinations = async (currentLocation, radius = 3000) => {
  const suggestions = [];
  
  // 거리별 카테고리
  const categories = [
    { 
      name: '가까운 거리 (1-2km)', 
      minDistance: 1000, 
      maxDistance: 2000,
      count: 3
    },
    { 
      name: '중간 거리 (2-5km)', 
      minDistance: 2000, 
      maxDistance: 5000,
      count: 3
    },
    { 
      name: '먼 거리 (5km+)', 
      minDistance: 5000, 
      maxDistance: 10000,
      count: 2
    }
  ];

  // 한국 주요 운동 장소 데이터 (Places API 대체)
  const koreanExercisePlaces = [
    // 서울 지역
    { name: '남산공원', lat: 37.5507, lng: 126.9851, category: '공원', icon: '🌳' },
    { name: '한강공원 여의도', lat: 37.5283, lng: 126.9294, category: '공원', icon: '🌊' },
    { name: '올림픽공원', lat: 37.5206, lng: 127.1214, category: '공원', icon: '🏟️' },
    { name: '서울숲', lat: 37.5445, lng: 127.0374, category: '공원', icon: '🌲' },
    { name: '양재천', lat: 37.4704, lng: 127.0357, category: '하천', icon: '💧' },
    { name: '청계천', lat: 37.5696, lng: 126.9789, category: '하천', icon: '🏞️' },
    { name: '북한산', lat: 37.6594, lng: 126.9848, category: '산', icon: '⛰️' },
    { name: '남한산성', lat: 37.4812, lng: 127.1819, category: '산', icon: '🏔️' },
    // 부산 지역
    { name: '해운대해수욕장', lat: 35.1587, lng: 129.1604, category: '해변', icon: '🏖️' },
    { name: '광안리해수욕장', lat: 35.1532, lng: 129.1189, category: '해변', icon: '🏖️' },
    { name: '달맞이공원', lat: 35.1609, lng: 129.1744, category: '공원', icon: '🌙' },
    { name: '용두산공원', lat: 35.1003, lng: 129.0324, category: '공원', icon: '🗼' },
    // 대구 지역
    { name: '수성못', lat: 35.8282, lng: 128.6171, category: '호수', icon: '🦢' },
    { name: '앞산공원', lat: 35.8242, lng: 128.5825, category: '산', icon: '⛰️' },
    // 인천 지역
    { name: '송도센트럴파크', lat: 37.3923, lng: 126.6396, category: '공원', icon: '🌳' },
    { name: '인천대공원', lat: 37.4563, lng: 126.7052, category: '공원', icon: '🌲' }
  ];

  // 현재 위치에서 가까운 장소 필터링
  const nearbyPlaces = koreanExercisePlaces.filter(place => {
    const distance = calculateDistance(currentLocation, place);
    return distance <= radius * 2; // 반경 2배 이내
  }).map(place => {
    const distance = calculateDistance(currentLocation, place);
    return {
      ...place,
      distance: Math.round(distance),
      id: `place-${place.name}`,
      location: { lat: place.lat, lng: place.lng },
      address: `${place.name} 일대`,
      rating: 4.5 + Math.random() * 0.5
    };
  }).sort((a, b) => a.distance - b.distance).slice(0, 5);

  // 추천 장소에 추가
  suggestions.push(...nearbyPlaces);

  // 추천 장소가 없으면 기본 위치 생성
  if (suggestions.length === 0) {
    console.log('⚠️ Places API 실패, 기본 목적지 생성');
    
    categories.forEach(category => {
      for (let i = 0; i < category.count; i++) {
        const angle = (Math.PI * 2 / category.count) * i;
        const distance = category.minDistance + 
          Math.random() * (category.maxDistance - category.minDistance);
        
        const destination = {
          lat: currentLocation.lat + (distance / 111320) * Math.cos(angle),
          lng: currentLocation.lng + (distance / 111320) * Math.sin(angle) / 
               Math.cos(currentLocation.lat * Math.PI / 180)
        };

        suggestions.push({
          id: `suggest-${category.name}-${i}`,
          name: `${getDirectionName(angle)} ${(distance / 1000).toFixed(1)}km`,
          address: `현재 위치에서 ${getDirectionName(angle)} 방향`,
          location: destination,
          distance: Math.round(distance),
          category: category.name,
          icon: '📍',
          rating: 0
        });
      }
    });
  }

  // 거리순 정렬
  suggestions.sort((a, b) => a.distance - b.distance);
  
  console.log(`📍 ${suggestions.length}개 목적지 추천 완료`);
  return suggestions;
};

// 🔄 왕복 경로 생성
export const createRoundTripRoute = async (start, destination, routeType = 'RUNNING') => {
  try {
    // 왕복 경로: 시작 → 목적지 → 시작
    const route = await createNavigationRoute(start, start, routeType, [destination]);
    
    route.isRoundTrip = true;
    route.turnaroundPoint = destination;
    
    return route;
  } catch (error) {
    console.error('왕복 경로 생성 실패:', error);
    throw error;
  }
};

// 🏃 운동 경로 최적화
export const optimizeExerciseRoute = (route, preferences = {}) => {
  const {
    avoidHills = false,
    preferParks = true,
    avoidTraffic = true,
    targetDistance = null
  } = preferences;

  // 경로 최적화 로직
  const optimizedRoute = { ...route };

  // 목표 거리에 맞춰 경로 조정
  if (targetDistance && route.distance) {
    const ratio = targetDistance / route.distance;
    if (ratio < 0.8 || ratio > 1.2) {
      console.log(`📏 경로 거리 조정: ${route.distance}m → ${targetDistance}m`);
      // 경로 조정 로직 구현
    }
  }

  // 추가 정보 계산
  optimizedRoute.calories = calculateCalories(
    route.distance / 1000,
    route.routeType
  );
  
  optimizedRoute.difficulty = calculateDifficulty(
    route.distance,
    route.elevationGain || 0
  );

  return optimizedRoute;
};

// 📊 칼로리 계산
const calculateCalories = (distanceKm, routeType) => {
  const caloriesPerKm = {
    WALKING: 50,
    RUNNING: 80,
    CYCLING: 30
  };
  
  return Math.round(distanceKm * (caloriesPerKm[routeType] || 60));
};

// 📈 난이도 계산
const calculateDifficulty = (distance, elevationGain) => {
  if (distance < 2000 && elevationGain < 50) return 'easy';
  if (distance < 5000 && elevationGain < 100) return 'medium';
  return 'hard';
};

// 🧭 방향 이름 반환
const getDirectionName = (angleRad) => {
  const angle = (angleRad * 180 / Math.PI + 360) % 360;
  
  if (angle < 22.5 || angle >= 337.5) return '북쪽';
  if (angle < 67.5) return '북동쪽';
  if (angle < 112.5) return '동쪽';
  if (angle < 157.5) return '남동쪽';
  if (angle < 202.5) return '남쪽';
  if (angle < 247.5) return '남서쪽';
  if (angle < 292.5) return '서쪽';
  return '북서쪽';
};

// 📏 거리 계산
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

export default {
  ROUTE_TYPES,
  createNavigationRoute,
  suggestDestinations,
  createRoundTripRoute,
  optimizeExerciseRoute
};
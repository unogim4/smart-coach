// 🗺️ 실제 도로 위 왕복 러닝 코스 (다중 API 통합 버전)

import { findNearestRoad, createSmartRoute } from './roadsApiService';
import { generateOSMCourses } from './openStreetMapService';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

// 코스 난이도 정의
export const DIFFICULTY_LEVELS = {
  EASY: { label: '초급 (1-2km)', color: '#10B981', value: 'easy' },
  MEDIUM: { label: '중급 (2-4km)', color: '#F59E0B', value: 'medium' },
  HARD: { label: '고급 (4km+)', color: '#EF4444', value: 'hard' }
};

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
        console.log('📍 Google Maps에서 확인:', `https://www.google.com/maps/@${location.lat},${location.lng},17z`);
        resolve(location);
      },
      (error) => {
        console.warn('⚠️ 위치 정보를 가져올 수 없습니다:', error);
        // 강남역 기본 좌표 (확실히 도로가 많은 위치)
        const defaultLocation = {
          lat: 37.4979,
          lng: 127.0276
        };
        console.log('📍 기본 위치 사용 (강남역):', defaultLocation);
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

// 🏫 김해 인제대학교 지역 확인
const isInjeUniversityArea = (location) => {
  // 인제대학교 김해캠퍼스 중심 좌표: 35.245, 128.903
  const injeLat = 35.245;
  const injeLng = 128.903;
  const radius = 0.015; // 약 1.5km 반경
  
  return Math.abs(location.lat - injeLat) < radius && 
         Math.abs(location.lng - injeLng) < radius;
};

// 🏃 김해 인제대학교 전용 러닝 코스
const getInjeUniversityCourses = () => {
  console.log('🎓 인제대학교 전용 코스 생성 중...');
  
  const courses = [
    {
      id: 'inje-course-1',
      name: '🌳 활천로 트레킹 코스',
      description: '인제대 주변 활천로를 따라가는 편도 코스',
      type: 'oneway',
      difficulty: DIFFICULTY_LEVELS.MEDIUM,
      distance: 2850,
      estimatedDistance: '2.8km',
      estimatedTime: '18분',
      elevationGain: '+25m',
      startPoint: {
        lat: 35.242496,
        lng: 128.898978,
        address: '김해시 활천로 시작점'
      },
      endPoint: {
        lat: 35.244144,
        lng: 128.914770,
        address: '김해시 활천로 도착점'
      },
      waypoints: [
        { lat: 35.242496, lng: 128.898978, label: '출발' },
        { lat: 35.242461, lng: 128.905844, label: '중간점' },
        { lat: 35.244144, lng: 128.914770, label: '도착' }
      ],
      features: ['편도 코스', '트레킹 적합', '자연 경관', '활천로'],
      icon: '🌲',
      rating: 4.8,
      vicinity: '김해시 활천로',
      courseType: '트레킹',
      weatherSuitability: ['맑음', '흐림'],
      isOpen: true,
      safetyLevel: 'high',
      roadType: '산책로',
      trafficLevel: '낮음',
      realPlace: true,
      isCircular: false,
      isRoadBased: true
    },
    {
      id: 'inje-course-2',
      name: '🏘️ 삼안로 순환 코스',
      description: '삼안로를 따라 도는 순환형 러닝 코스',
      type: 'circular',
      difficulty: DIFFICULTY_LEVELS.EASY,
      distance: 1650,
      estimatedDistance: '1.7km',
      estimatedTime: '10분',
      elevationGain: '+10m',
      startPoint: {
        lat: 35.251977,
        lng: 128.904782,
        address: '김해시 삼안로 시작점'
      },
      endPoint: {
        lat: 35.251320,
        lng: 128.912078,
        address: '김해시 삼안로 도착점'
      },
      waypoints: [
        { lat: 35.251977, lng: 128.904782, label: '출발' },
        { lat: 35.252099, lng: 128.908376, label: '경유1' },
        { lat: 35.250347, lng: 128.908473, label: '경유2' },
        { lat: 35.251320, lng: 128.912078, label: '도착' }
      ],
      features: ['순환 코스', '주택가', '평지', '초보자 적합'],
      icon: '🏘️',
      rating: 4.6,
      vicinity: '김해시 삼안로',
      courseType: '도로',
      weatherSuitability: ['맑음', '흐림', '구름조금'],
      isOpen: true,
      safetyLevel: 'very_high',
      roadType: '일반도로',
      trafficLevel: '보통',
      realPlace: true,
      isCircular: true,
      isRoadBased: true
    },
    {
      id: 'inje-course-3',
      name: '🎓 캠퍼스 둘레길',
      description: '인제대학교 캠퍼스를 한 바퀴 도는 코스',
      type: 'circular',
      difficulty: DIFFICULTY_LEVELS.EASY,
      distance: 2200,
      estimatedDistance: '2.2km',
      estimatedTime: '13분',
      elevationGain: '+15m',
      startPoint: {
        lat: 35.245000,
        lng: 128.903000,
        address: '인제대학교 정문'
      },
      waypoints: [
        { lat: 35.245000, lng: 128.903000, label: '정문' },
        { lat: 35.246500, lng: 128.904500, label: '동쪽' },
        { lat: 35.245000, lng: 128.906000, label: '북쪽' },
        { lat: 35.243500, lng: 128.904500, label: '서쪽' },
        { lat: 35.245000, lng: 128.903000, label: '정문' }
      ],
      features: ['캠퍼스 내', '안전한 코스', '평지', '야간 조명'],
      icon: '🏫',
      rating: 4.9,
      vicinity: '인제대학교 김해캠퍼스',
      courseType: '캠퍼스',
      weatherSuitability: ['맑음', '흐림', '구름조금', '비조금'],
      isOpen: true,
      safetyLevel: 'very_high',
      roadType: '캠퍼스 도로',
      trafficLevel: '매우 낮음',
      realPlace: true,
      isCircular: true,
      isRoadBased: true
    }
  ];
  
  console.log(`✅ 인제대학교 전용 ${courses.length}개 코스 생성 완료`);
  return courses;
};

// 🚸 가장 가까운 도로로 위치 조정 (Geocoding)
const snapToNearestRoad = async (location) => {
  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?` +
      `latlng=${location.lat},${location.lng}` +
      `&key=${GOOGLE_MAPS_API_KEY}` +
      `&language=ko`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        // 첫 번째 결과의 위치 사용 (보통 가장 가까운 주소)
        const result = data.results[0];
        const snappedLocation = result.geometry.location;
        
        console.log('📍 도로 위치로 조정됨:', result.formatted_address);
        
        return {
          lat: snappedLocation.lat,
          lng: snappedLocation.lng,
          address: result.formatted_address
        };
      }
    }
  } catch (error) {
    console.error('Geocoding 실패:', error);
  }
  
  return location;
};

// 🗺️ Directions API 테스트 (짧은 거리부터)
const testDirectionsAPI = async (start) => {
  if (!window.google || !window.google.maps) {
    console.error('Google Maps가 로드되지 않았습니다');
    return null;
  }
  
  // 매우 가까운 거리로 테스트 (50m)
  const testEnd = {
    lat: start.lat + 0.0005, // 약 50m 북쪽
    lng: start.lng
  };
  
  return new Promise((resolve) => {
    const directionsService = new window.google.maps.DirectionsService();
    
    const request = {
      origin: new window.google.maps.LatLng(start.lat, start.lng),
      destination: new window.google.maps.LatLng(testEnd.lat, testEnd.lng),
      travelMode: window.google.maps.TravelMode.WALKING,
      unitSystem: window.google.maps.UnitSystem.METRIC
    };
    
    console.log('🧪 Directions API 테스트 (50m)...');
    
    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        console.log('✅ Directions API 작동 확인!');
        resolve(true);
      } else {
        console.warn('❌ Directions API 테스트 실패:', status);
        resolve(false);
      }
    });
  });
};

// 🗺️ 실제 도로 경로 생성 (개선된 버전)
const getWalkingRoute = async (start, end, routeName = '') => {
  if (!window.google || !window.google.maps) {
    return null;
  }
  
  return new Promise((resolve) => {
    try {
      const directionsService = new window.google.maps.DirectionsService();
      
      // 다양한 옵션 시도
      const requests = [
        // 1차 시도: 기본 설정
        {
          origin: new window.google.maps.LatLng(start.lat, start.lng),
          destination: new window.google.maps.LatLng(end.lat, end.lng),
          travelMode: window.google.maps.TravelMode.WALKING,
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        // 2차 시도: 자동차 모드 (도로 확실히 있음)
        {
          origin: new window.google.maps.LatLng(start.lat, start.lng),
          destination: new window.google.maps.LatLng(end.lat, end.lng),
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC
        }
      ];
      
      let attemptCount = 0;
      
      const tryNextRequest = () => {
        if (attemptCount >= requests.length) {
          console.warn(`❌ ${routeName} 모든 시도 실패`);
          resolve(null);
          return;
        }
        
        const request = requests[attemptCount];
        const mode = attemptCount === 0 ? 'WALKING' : 'DRIVING';
        
        console.log(`📍 ${routeName} 시도 ${attemptCount + 1} (${mode}):`, {
          시작: `${start.lat.toFixed(6)}, ${start.lng.toFixed(6)}`,
          목적지: `${end.lat.toFixed(6)}, ${end.lng.toFixed(6)}`,
          거리: `약 ${calculateDistance(start, end).toFixed(0)}m`
        });
        
        directionsService.route(request, (result, status) => {
          if (status === 'OK' && result && result.routes && result.routes.length > 0) {
            console.log(`✅ ${routeName} 성공! (${mode} 모드)`);
            
            const route = result.routes[0];
            const pathPoints = [];
            
            route.legs.forEach(leg => {
              leg.steps.forEach(step => {
                step.path.forEach(point => {
                  pathPoints.push({
                    lat: point.lat(),
                    lng: point.lng()
                  });
                });
              });
            });
            
            // 왕복 경로
            const returnPath = [...pathPoints].reverse();
            const fullPath = [...pathPoints, ...returnPath];
            
            const oneWayDistance = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
            const oneWayDuration = route.legs.reduce((sum, leg) => sum + leg.duration.value, 0);
            
            resolve({
              path: fullPath,
              distance: oneWayDistance * 2,
              duration: oneWayDuration * 2,
              success: true,
              mode: mode
            });
          } else {
            console.warn(`⚠️ ${routeName} ${mode} 실패:`, status);
            attemptCount++;
            tryNextRequest();
          }
        });
      };
      
      tryNextRequest();
      
    } catch (error) {
      console.error('Directions Service 오류:', error);
      resolve(null);
    }
  });
};

// 🗺️ 러닝 코스 생성 메인 함수 (Roads API 우선)
export const searchNearbyRunningCourses = async (location, radius = 2000) => {
  console.log('🗺️ === 러닝 코스 생성 시작 (Roads API) ===');
  console.log('원본 위치:', location);
  
  try {
    // 1. Roads API로 도로 위치 찾기
    const roadLocation = await findNearestRoad(location);
    console.log('🛣️ Roads API 도로 위치:', roadLocation);
    
    // 2. Roads API로 스마트 경로 생성 시도
    const smartCourses = await generateSmartRouteCourses(roadLocation, radius);
    if (smartCourses && smartCourses.length > 0) {
      console.log('✅ Roads API로 코스 생성 성공');
      return smartCourses;
    }
    
    // 3. Roads API 실패 시 OpenStreetMap 시도
    console.log('🔄 Roads API 실패, OpenStreetMap 시도...');
    const osmCourses = await generateOSMCourses(location, radius);
    if (osmCourses && osmCourses.length > 0) {
      console.log('✅ OpenStreetMap으로 코스 생성 성공');
      // OSM 코스를 기존 포맷으로 변환
      return osmCourses.map((course, index) => ({
        ...course,
        id: course.id,
        name: course.name,
        location: course.end || location,
        waypoints: course.path,
        rating: 4.2,
        vicinity: course.vicinity || course.description,
        courseType: 'OSM 도로',
        icon: '🗺️',
        difficulty: course.difficulty === '초급' ? DIFFICULTY_LEVELS.EASY :
                   course.difficulty === '중급' ? DIFFICULTY_LEVELS.MEDIUM :
                   DIFFICULTY_LEVELS.HARD,
        estimatedDistance: `${(course.distance / 1000).toFixed(1)}km`,
        estimatedTime: `${Math.round(course.distance / 83)}분`,
        elevationGain: '+10m',
        features: course.features,
        weatherSuitability: ['맑음', '흐림'],
        isOpen: true,
        safetyLevel: 'high',
        roadType: 'OSM 도로',
        trafficLevel: getTrafficLevel(new Date().getHours()),
        realPlace: true,
        isCircular: false,
        isRoadBased: true,
        apiType: 'OpenStreetMap'
      }));
    }
    
    // 4. 모든 API 실패 시 Directions API 테스트
    const apiWorks = await testDirectionsAPI(roadLocation);
    
    if (!apiWorks) {
      console.warn('⚠️ Directions API도 사용 불가');
      console.log('💡 대체 방법: 기본 경로 사용');
      return generateStraightPathCourses(roadLocation);
    }
    
    const courses = [];
    
    // 3. 매우 짧은 거리부터 시작 (100m부터)
    const destinations = [
      // 초단거리 (성공 확률 매우 높음)
      { name: '북쪽 100m', distance: 100, angle: 0 },
      { name: '동쪽 150m', distance: 150, angle: Math.PI / 2 },
      { name: '남쪽 200m', distance: 200, angle: Math.PI },
      { name: '서쪽 250m', distance: 250, angle: 3 * Math.PI / 2 },
      
      // 단거리
      { name: '북동 300m', distance: 300, angle: Math.PI / 4 },
      { name: '남동 400m', distance: 400, angle: 3 * Math.PI / 4 },
      { name: '남서 500m', distance: 500, angle: 5 * Math.PI / 4 },
      
      // 중거리
      { name: '북쪽 750m', distance: 750, angle: 0 },
      { name: '동쪽 1km', distance: 1000, angle: Math.PI / 2 }
    ];
    
    let successCount = 0;
    
    for (let i = 0; i < destinations.length && courses.length < 5; i++) {
      const dest = destinations[i];
      
      // 목적지 좌표
      const endpoint = {
        lat: roadLocation.lat + (dest.distance / 111320) * Math.cos(dest.angle),
        lng: roadLocation.lng + (dest.distance / 111320) * Math.sin(dest.angle) / Math.cos(roadLocation.lat * Math.PI / 180)
      };
      
      // Directions API 시도
      const routeData = await getWalkingRoute(roadLocation, endpoint, dest.name);
      
      if (routeData && routeData.success) {
        successCount++;
        
        const difficulty = routeData.distance < 1000 ? DIFFICULTY_LEVELS.EASY :
                          routeData.distance < 3000 ? DIFFICULTY_LEVELS.MEDIUM :
                          DIFFICULTY_LEVELS.HARD;
        
        courses.push({
          id: `route-${i}`,
          name: `${dest.name} 왕복`,
          location: endpoint,
          waypoints: routeData.path,
          rating: 4.5,
          vicinity: roadLocation.address || `${dest.name} 방향`,
          courseType: routeData.mode === 'WALKING' ? '도보 왕복' : '도로 왕복',
          icon: '🛣️',
          difficulty: difficulty,
          distance: Math.round(routeData.distance),
          estimatedDistance: `${(routeData.distance / 1000).toFixed(1)}km`,
          estimatedTime: `${Math.round(routeData.duration / 60)}분`,
          elevationGain: '+' + Math.round(Math.random() * 10 + 5) + 'm',
          features: ['실제 도로', '왕복 코스', `${routeData.mode} 경로`],
          weatherSuitability: ['맑음', '흐림'],
          isOpen: true,
          safetyLevel: 'high',
          roadType: routeData.mode === 'WALKING' ? '보행자 도로' : '일반 도로',
          trafficLevel: getTrafficLevel(new Date().getHours()),
          realPlace: true,
          isCircular: false,
          isRoadBased: true
        });
        
        console.log(`✅ ${successCount}. "${dest.name}" 도로 경로 생성`);
      }
      
      // API 호출 간격
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 성공한 코스가 없으면 직선 경로 추가
    if (courses.length === 0) {
      console.warn('⚠️ 도로 경로 생성 실패, 직선 경로 사용');
      return generateStraightPathCourses(roadLocation);
    }
    
    console.log(`✅ 총 ${courses.length}개 코스 생성 완료`);
    return courses;
    
  } catch (error) {
    console.error('❌ 코스 생성 오류:', error);
    return generateStraightPathCourses(location);
  }
};

// 🏃 Roads API를 활용한 스마트 코스 생성
const generateSmartRouteCourses = async (center, radius = 1500) => {
  console.log('🚀 Roads API로 스마트 코스 생성 중...');
  
  const courses = [];
  const destinations = [
    { name: '북쪽', distance: radius * 0.3, angle: 0 },
    { name: '동쪽', distance: radius * 0.4, angle: Math.PI / 2 },
    { name: '남쪽', distance: radius * 0.5, angle: Math.PI },
    { name: '서쪽', distance: radius * 0.6, angle: 3 * Math.PI / 2 },
    { name: '북동쪽', distance: radius * 0.35, angle: Math.PI / 4 }
  ];
  
  for (let i = 0; i < destinations.length && courses.length < 5; i++) {
    const dest = destinations[i];
    
    // 목적지 계산
    const endpoint = {
      lat: center.lat + (dest.distance / 111320) * Math.cos(dest.angle),
      lng: center.lng + (dest.distance / 111320) * Math.sin(dest.angle) / Math.cos(center.lat * Math.PI / 180)
    };
    
    try {
      // Roads API로 스마트 경로 생성
      const route = await createSmartRoute(center, endpoint, 30);
      
      if (route.isSnapped) {
        const difficulty = route.distance < 1500 ? DIFFICULTY_LEVELS.EASY :
                          route.distance < 3000 ? DIFFICULTY_LEVELS.MEDIUM :
                          DIFFICULTY_LEVELS.HARD;
        
        courses.push({
          id: `smart-${i}`,
          name: `${dest.name} 도로 코스`,
          location: route.end,
          waypoints: route.path,
          rating: 4.7,
          vicinity: `${dest.name} 방향 도로`,
          courseType: '도로 스냅',
          icon: '🛣️',
          difficulty: difficulty,
          distance: Math.round(route.distance),
          estimatedDistance: `${(route.distance / 1000).toFixed(1)}km`,
          estimatedTime: `${Math.round(route.distance / 83)}분`,
          elevationGain: '+' + Math.round(Math.random() * 15 + 5) + 'm',
          features: ['실제 도로', 'Roads API', '안전한 경로'],
          weatherSuitability: ['맑음', '흐림'],
          isOpen: true,
          safetyLevel: 'very_high',
          roadType: '도로 스냅',
          trafficLevel: getTrafficLevel(new Date().getHours()),
          realPlace: true,
          isCircular: false,
          isRoadBased: true,
          apiType: 'Roads API'
        });
        
        console.log(`✅ ${dest.name} Roads API 코스 생성 (${route.distance.toFixed(0)}m)`);
      }
    } catch (error) {
      console.warn(`⚠️ ${dest.name} Roads API 실패:`, error);
    }
    
    // API 호출 간격
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  return courses;
};

// 직선 경로 코스 생성
const generateStraightPathCourses = (center) => {
  console.log('📝 직선 왕복 코스 생성 중...');
  
  const courses = [];
  const destinations = [
    { name: '북쪽 200m', distance: 200, angle: 0 },
    { name: '동쪽 300m', distance: 300, angle: Math.PI / 2 },
    { name: '남쪽 400m', distance: 400, angle: Math.PI },
    { name: '서쪽 500m', distance: 500, angle: 3 * Math.PI / 2 },
    { name: '북동 350m', distance: 350, angle: Math.PI / 4 }
  ];
  
  destinations.forEach((dest, i) => {
    const endpoint = {
      lat: center.lat + (dest.distance / 111320) * Math.cos(dest.angle),
      lng: center.lng + (dest.distance / 111320) * Math.sin(dest.angle) / Math.cos(center.lat * Math.PI / 180)
    };
    
    // 직선 왕복 경로 생성
    const path = [];
    const steps = 20;
    
    // 갈 때
    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      path.push({
        lat: center.lat + (endpoint.lat - center.lat) * t,
        lng: center.lng + (endpoint.lng - center.lng) * t
      });
    }
    
    // 올 때
    for (let j = steps - 1; j >= 0; j--) {
      const t = j / steps;
      path.push({
        lat: center.lat + (endpoint.lat - center.lat) * t,
        lng: center.lng + (endpoint.lng - center.lng) * t
      });
    }
    
    const totalDistance = dest.distance * 2;
    
    courses.push({
      id: `straight-${i}`,
      name: `${dest.name} 직선 왕복`,
      location: endpoint,
      waypoints: path,
      rating: 3.5,
      vicinity: `${dest.name} 방향`,
      courseType: '직선 왕복',
      icon: '➡️',
      difficulty: totalDistance < 1000 ? DIFFICULTY_LEVELS.EASY : DIFFICULTY_LEVELS.MEDIUM,
      distance: totalDistance,
      estimatedDistance: `${(totalDistance / 1000).toFixed(1)}km`,
      estimatedTime: `${Math.round(totalDistance / 83)}분`,
      elevationGain: '+5m',
      features: ['직선 경로', '단순 왕복'],
      weatherSuitability: ['맑음'],
      isOpen: true,
      safetyLevel: 'medium',
      roadType: '일반 경로',
      trafficLevel: '보통',
      realPlace: false,
      isCircular: false,
      isRoadBased: false
    });
  });
  
  console.log(`✅ ${courses.length}개 직선 코스 생성 완료`);
  return courses;
};

// 시간대별 교통량
const getTrafficLevel = (hour) => {
  if (hour >= 7 && hour <= 9) return '높음 (출근)';
  if (hour >= 17 && hour <= 19) return '높음 (퇴근)';
  if (hour >= 22 || hour <= 5) return '매우 낮음';
  return '보통';
};

// 거리 계산
export const calculateDistance = (point1, point2) => {
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

// 러닝 경로 반환
export const generateRunningRoute = (course) => {
  return course.waypoints || [course.location];
};
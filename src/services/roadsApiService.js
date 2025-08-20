// 🗺️ Google Roads API를 활용한 도로 스냅 서비스

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

/**
 * Roads API를 사용하여 경로를 도로에 스냅
 * @param {Array} path - 좌표 배열 [{lat, lng}, ...]
 * @returns {Promise<Array>} 도로에 스냅된 경로
 */
export const snapToRoads = async (path) => {
  try {
    // Roads API는 최대 100개 포인트만 처리 가능
    const maxPoints = 100;
    const pathPoints = path.slice(0, maxPoints);
    
    // 좌표를 문자열로 변환
    const pathString = pathPoints
      .map(point => `${point.lat},${point.lng}`)
      .join('|');
    
    const response = await fetch(
      `https://roads.googleapis.com/v1/snapToRoads?` +
      `path=${encodeURIComponent(pathString)}` +
      `&interpolate=true` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn('Roads API 응답 실패:', response.status);
      return path; // 원본 경로 반환
    }
    
    const data = await response.json();
    
    if (data.snappedPoints && data.snappedPoints.length > 0) {
      console.log(`✅ Roads API: ${data.snappedPoints.length}개 포인트 도로 스냅 완료`);
      
      return data.snappedPoints.map(point => ({
        lat: point.location.latitude,
        lng: point.location.longitude,
        placeId: point.placeId
      }));
    }
    
    console.log('⚠️ Roads API: 스냅된 포인트 없음');
    return path;
    
  } catch (error) {
    console.error('Roads API 오류:', error);
    return path; // 에러 시 원본 경로 반환
  }
};

/**
 * 가장 가까운 도로 찾기
 * @param {Object} location - {lat, lng}
 * @returns {Promise<Object>} 가장 가까운 도로 위치
 */
export const findNearestRoad = async (location) => {
  try {
    const response = await fetch(
      `https://roads.googleapis.com/v1/nearestRoads?` +
      `points=${location.lat},${location.lng}` +
      `&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      console.warn('Nearest Roads API 실패:', response.status);
      return location;
    }
    
    const data = await response.json();
    
    if (data.snappedPoints && data.snappedPoints.length > 0) {
      const nearest = data.snappedPoints[0];
      console.log('✅ 가장 가까운 도로 찾음:', nearest.placeId);
      
      return {
        lat: nearest.location.latitude,
        lng: nearest.location.longitude,
        placeId: nearest.placeId,
        originalDistance: nearest.originalIndex !== undefined ? 
          calculateDistance(location, {
            lat: nearest.location.latitude,
            lng: nearest.location.longitude
          }) : 0
      };
    }
    
    return location;
    
  } catch (error) {
    console.error('Nearest Roads API 오류:', error);
    return location;
  }
};

/**
 * 스마트 경로 생성 (도로 따라가기)
 * @param {Object} start - 시작점 {lat, lng}
 * @param {Object} end - 끝점 {lat, lng}
 * @param {Number} steps - 중간 포인트 개수
 * @returns {Promise<Array>} 도로를 따라가는 경로
 */
export const createSmartRoute = async (start, end, steps = 20) => {
  // 1. 시작점과 끝점을 도로에 스냅
  const [snappedStart, snappedEnd] = await Promise.all([
    findNearestRoad(start),
    findNearestRoad(end)
  ]);
  
  // 2. 중간 포인트 생성
  const interpolatedPath = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    interpolatedPath.push({
      lat: snappedStart.lat + (snappedEnd.lat - snappedStart.lat) * t,
      lng: snappedStart.lng + (snappedEnd.lng - snappedStart.lng) * t
    });
  }
  
  // 3. 전체 경로를 도로에 스냅
  const snappedPath = await snapToRoads(interpolatedPath);
  
  // 4. 왕복 경로 생성
  const returnPath = [...snappedPath].reverse();
  const fullPath = [...snappedPath, ...returnPath];
  
  return {
    path: fullPath,
    start: snappedStart,
    end: snappedEnd,
    distance: calculateDistance(snappedStart, snappedEnd) * 2,
    isSnapped: snappedPath !== interpolatedPath
  };
};

/**
 * 여러 방향으로 스마트 코스 생성
 * @param {Object} center - 중심점 {lat, lng}
 * @param {Number} radius - 반경 (미터)
 * @returns {Promise<Array>} 코스 배열
 */
export const generateSmartCourses = async (center, radius = 1000) => {
  console.log('🚀 스마트 코스 생성 시작...');
  
  const courses = [];
  const angles = [0, 45, 90, 135, 180, 225, 270, 315]; // 8방향
  
  // 중심점을 도로에 스냅
  const roadCenter = await findNearestRoad(center);
  console.log(`📍 도로 중심점: ${roadCenter.originalDistance?.toFixed(0)}m 이동`);
  
  for (let i = 0; i < angles.length && courses.length < 5; i++) {
    const angle = angles[i] * Math.PI / 180;
    const distance = radius * (0.5 + Math.random() * 0.5); // 반경의 50-100%
    
    // 목적지 계산
    const destination = {
      lat: roadCenter.lat + (distance / 111320) * Math.cos(angle),
      lng: roadCenter.lng + (distance / 111320) * Math.sin(angle) / Math.cos(roadCenter.lat * Math.PI / 180)
    };
    
    // 스마트 경로 생성
    const route = await createSmartRoute(roadCenter, destination, 30);
    
    if (route.isSnapped) {
      const directionName = getDirectionName(angle);
      const difficulty = route.distance < 1500 ? '초급' :
                        route.distance < 3000 ? '중급' : '고급';
      
      courses.push({
        id: `smart-${i}`,
        name: `${directionName} 스마트 코스`,
        path: route.path,
        distance: Math.round(route.distance),
        difficulty: difficulty,
        description: `도로를 따라가는 ${(route.distance / 1000).toFixed(1)}km 왕복 코스`,
        features: ['도로 스냅', '안전한 경로', '왕복 코스'],
        start: route.start,
        end: route.end
      });
      
      console.log(`✅ ${directionName} 코스 생성 (${route.distance.toFixed(0)}m)`);
    }
    
    // API 호출 제한 방지
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  console.log(`🎯 총 ${courses.length}개 스마트 코스 생성 완료`);
  return courses;
};

// 방향 이름 반환
const getDirectionName = (angleRad) => {
  const angle = angleRad * 180 / Math.PI;
  if (angle < 22.5 || angle >= 337.5) return '북쪽';
  if (angle < 67.5) return '북동쪽';
  if (angle < 112.5) return '동쪽';
  if (angle < 157.5) return '남동쪽';
  if (angle < 202.5) return '남쪽';
  if (angle < 247.5) return '남서쪽';
  if (angle < 292.5) return '서쪽';
  return '북서쪽';
};

// 거리 계산 함수
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
  snapToRoads,
  findNearestRoad,
  createSmartRoute,
  generateSmartCourses
};
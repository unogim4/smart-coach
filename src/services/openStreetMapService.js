// 🗺️ OpenStreetMap 기반 도로 데이터 서비스
// Google API 대체용

/**
 * OpenStreetMap Nominatim API를 사용한 역지오코딩
 */
export const reverseGeocode = async (lat, lng) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'SmartCoach/1.0'
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Nominatim API 실패');
    }
    
    const data = await response.json();
    
    return {
      address: data.display_name,
      road: data.address?.road || data.address?.pedestrian || '',
      suburb: data.address?.suburb || data.address?.neighbourhood || '',
      city: data.address?.city || data.address?.town || '',
      country: data.address?.country || '',
      lat: parseFloat(data.lat),
      lng: parseFloat(data.lon)
    };
  } catch (error) {
    console.error('OSM Reverse Geocode 실패:', error);
    return null;
  }
};

// API 요청 제한을 위한 대기 시간
let lastOverpassCall = 0;
const OVERPASS_MIN_INTERVAL = 2000; // 2초 간격

/**
 * Overpass API를 사용한 주변 도로 검색
 */
export const findNearbyRoads = async (lat, lng, radius = 100) => {
  try {
    // Rate limiting - 최소 2초 간격 유지
    const now = Date.now();
    const timeSinceLastCall = now - lastOverpassCall;
    if (timeSinceLastCall < OVERPASS_MIN_INTERVAL) {
      await new Promise(resolve => 
        setTimeout(resolve, OVERPASS_MIN_INTERVAL - timeSinceLastCall)
      );
    }
    lastOverpassCall = Date.now();
    
    // Overpass QL 쿼리
    const query = `
      [out:json][timeout:25];
      (
        way["highway"](around:${radius},${lat},${lng});
      );
      out body;
      >;
      out skel qt;
    `;
    
    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    if (!response.ok) {
      // 429 에러나 504 에러의 경우 빈 배열 반환
      if (response.status === 429 || response.status === 504) {
        console.warn(`⚠️ Overpass API ${response.status} 에러 - 기본 경로 사용`);
        return [];
      }
      throw new Error(`Overpass API 실패: ${response.status}`);
    }
    
    const data = await response.json();
    
    // 도로 정보 파싱
    const roads = [];
    const nodes = new Map();
    
    // 노드 정보 저장
    data.elements.forEach(element => {
      if (element.type === 'node') {
        nodes.set(element.id, {
          lat: element.lat,
          lng: element.lon
        });
      }
    });
    
    // 도로 정보 처리
    data.elements.forEach(element => {
      if (element.type === 'way' && element.tags?.highway) {
        const roadNodes = element.nodes.map(nodeId => nodes.get(nodeId)).filter(Boolean);
        
        if (roadNodes.length > 0) {
          roads.push({
            id: element.id,
            type: element.tags.highway,
            name: element.tags.name || `도로 ${element.id}`,
            nodes: roadNodes,
            tags: element.tags
          });
        }
      }
    });
    
    console.log(`📍 OSM: ${roads.length}개 도로 발견`);
    return roads;
    
  } catch (error) {
    console.error('Overpass API 오류:', error);
    return [];
  }
};

/**
 * 가장 가까운 도로 포인트 찾기
 */
export const findNearestRoadPoint = async (lat, lng) => {
  try {
    const roads = await findNearbyRoads(lat, lng, 200);
    
    if (roads.length === 0) {
      return { lat, lng };
    }
  
  let nearestPoint = null;
  let minDistance = Infinity;
  
  roads.forEach(road => {
    road.nodes.forEach(node => {
      const distance = calculateDistance(
        { lat, lng },
        { lat: node.lat, lng: node.lng }
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestPoint = node;
      }
    });
  });
  
  if (nearestPoint) {
    console.log(`✅ OSM: 가장 가까운 도로 지점 (${minDistance.toFixed(0)}m)`);
    return {
      lat: nearestPoint.lat,
      lng: nearestPoint.lng,
      distance: minDistance
    };
  }
    
    return { lat, lng };
  } catch (error) {
    console.warn('도로 검색 실패, 원본 좌표 사용:', error);
    return { lat, lng };
  }
};

/**
 * OSM 기반 스마트 경로 생성
 */
export const createOSMRoute = async (start, end, steps = 20) => {
  try {
    // 시작점과 끝점을 도로에 스냅 (실패 시 원본 좌표 사용)
    const [snappedStart, snappedEnd] = await Promise.all([
      findNearestRoadPoint(start.lat, start.lng),
      findNearestRoadPoint(end.lat, end.lng)
    ]).catch(() => [start, end]);
  
  // 중간 포인트 생성
  const path = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    path.push({
      lat: snappedStart.lat + (snappedEnd.lat - snappedStart.lat) * t,
      lng: snappedStart.lng + (snappedEnd.lng - snappedStart.lng) * t
    });
  }
  
  // 왕복 경로
  const returnPath = [...path].reverse();
  const fullPath = [...path, ...returnPath];
    
    return {
      path: fullPath,
      distance: calculateDistance(snappedStart, snappedEnd) * 2,
      start: snappedStart,
      end: snappedEnd
    };
  } catch (error) {
    console.warn('OSM 경로 생성 실패, 기본 경로 사용:', error);
    // 실패 시 기본 경로 반환
    const path = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      path.push({
        lat: start.lat + (end.lat - start.lat) * t,
        lng: start.lng + (end.lng - start.lng) * t
      });
    }
    const returnPath = [...path].reverse();
    const fullPath = [...path, ...returnPath];
    
    return {
      path: fullPath,
      distance: calculateDistance(start, end) * 2,
      start: start,
      end: end
    };
  }
};

/**
 * OSM 데이터로 러닝 코스 생성
 */
export const generateOSMCourses = async (center, radius = 1000) => {
  console.log('🗺️ OpenStreetMap으로 코스 생성 시작...');
  
  // 현재 위치 주소 정보 가져오기
  const locationInfo = await reverseGeocode(center.lat, center.lng);
  console.log('📍 현재 위치:', locationInfo?.address);
  
  // 주변 도로 검색
  const roads = await findNearbyRoads(center.lat, center.lng, radius);
  console.log(`🛣️ 주변 ${roads.length}개 도로 발견`);
  
  const courses = [];
  const angles = [0, 90, 180, 270]; // 4방향
  
  for (let i = 0; i < angles.length && courses.length < 5; i++) {
    const angle = angles[i] * Math.PI / 180;
    const distance = radius * (0.3 + Math.random() * 0.4);
    
    const destination = {
      lat: center.lat + (distance / 111320) * Math.cos(angle),
      lng: center.lng + (distance / 111320) * Math.sin(angle) / Math.cos(center.lat * Math.PI / 180)
    };
    
    const route = await createOSMRoute(center, destination, 25);
    
    const directionName = getDirectionName(angle);
    const totalDistance = route.distance;
    
    courses.push({
      id: `osm-${i}`,
      name: `${directionName} OSM 코스`,
      path: route.path,
      distance: Math.round(totalDistance),
      difficulty: totalDistance < 1500 ? '초급' : totalDistance < 3000 ? '중급' : '고급',
      description: `OpenStreetMap 기반 ${(totalDistance / 1000).toFixed(1)}km 왕복`,
      features: ['OSM 데이터', '무료 API', '왕복 코스'],
      vicinity: locationInfo?.road || `${directionName} 방향`,
      start: route.start,
      end: route.end
    });
    
    console.log(`✅ ${directionName} OSM 코스 생성 (${totalDistance.toFixed(0)}m)`);
    
    // API 제한 방지 (OSM Rate Limit 대응)
    await new Promise(resolve => setTimeout(resolve, 500)); // 500ms로 증가
  }
  
  console.log(`🎯 총 ${courses.length}개 OSM 코스 생성 완료`);
  return courses;
};

// 거리 계산
const calculateDistance = (point1, point2) => {
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

// 방향 이름
const getDirectionName = (angleRad) => {
  const angle = angleRad * 180 / Math.PI;
  if (angle < 45 || angle >= 315) return '북쪽';
  if (angle < 135) return '동쪽';
  if (angle < 225) return '남쪽';
  return '서쪽';
};

export default {
  reverseGeocode,
  findNearbyRoads,
  findNearestRoadPoint,
  createOSMRoute,
  generateOSMCourses
};
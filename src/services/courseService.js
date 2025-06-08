import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { getWeatherInfo } from './realWeatherService';

// Google Directions Service 초기화
let directionsService = null;

// Google Maps가 로드되었을 때 DirectionsService 초기화
if (window.google && window.google.maps) {
  directionsService = new window.google.maps.DirectionsService();
}

// 실제 도로를 따라가는 경로 계산 함수
const calculateRealRoute = async (startPoint, endPoint, waypoints = []) => {
  return new Promise((resolve, reject) => {
    if (!directionsService) {
      reject(new Error('Directions Service가 초기화되지 않았습니다.'));
      return;
    }

    const request = {
      origin: startPoint,
      destination: endPoint,
      waypoints: waypoints.map(point => ({
        location: point,
        stopover: false
      })),
      travelMode: window.google.maps.TravelMode.WALKING, // 러닝용
      unitSystem: window.google.maps.UnitSystem.METRIC,
      avoidHighways: true,
      avoidTolls: true
    };

    directionsService.route(request, (result, status) => {
      if (status === 'OK') {
        resolve(result);
      } else {
        reject(new Error(`경로 계산 실패: ${status}`));
      }
    });
  });
};

// DirectionsService 초기화 함수 (Google Maps 로드 후 호출)
export const initializeDirectionsService = () => {
  if (window.google && window.google.maps && !directionsService) {
    directionsService = new window.google.maps.DirectionsService();
  }
};

// 예시 데이터
const exampleCourses = [
  {
    id: '1',
    name: '한강 러닝 코스',
    difficulty: 'beginner',
    distance: 5,
    description: '한강을 따라 달리는 평평한 초보자용 코스입니다. 아름다운 강 전망과 함께 달리세요.',
    elevation: 10,
    estimatedTime: '30-40분',
    roadType: '포장도로',
    terrain: '평지',
    imageUrl: 'https://via.placeholder.com/400x200?text=한강+러닝',
    weather: {
      status: '맑음',
      temperature: '22°C',
      airQuality: '좋음'
    }
  },
  {
    id: '2',
    name: '남산 순환 코스',
    difficulty: 'intermediate',
    distance: 8,
    description: '남산 주변을 순환하는 중급자용 코스로, 적당한 경사와 아름다운 도시 전망이 있습니다.',
    elevation: 120,
    estimatedTime: '50-60분',
    roadType: '산책로/포장도로',
    terrain: '언덕',
    imageUrl: 'https://via.placeholder.com/400x200?text=남산+코스',
    weather: {
      status: '구름 조금',
      temperature: '20°C',
      airQuality: '보통'
    }
  },
  {
    id: '3',
    name: '북한산 트레일',
    difficulty: 'advanced',
    distance: 12,
    description: '북한산의 트레일을 따라 달리는 고급자용 코스입니다. 가파른 오르막과 기술적인 구간이 있습니다.',
    elevation: 350,
    estimatedTime: '1시간 30분',
    roadType: '비포장/등산로',
    terrain: '산악',
    imageUrl: 'https://via.placeholder.com/400x200?text=북한산+트레일',
    weather: {
      status: '흐림',
      temperature: '18°C',
      airQuality: '보통'
    }
  },
  {
    id: '4',
    name: '올림픽공원 순환 코스',
    difficulty: 'beginner',
    distance: 4,
    description: '올림픽공원 내부를 순환하는 아름다운 코스로, 나무와 조각상이 있는 평탄한 길입니다.',
    elevation: 5,
    estimatedTime: '25-30분',
    roadType: '포장도로',
    terrain: '평지',
    imageUrl: 'https://via.placeholder.com/400x200?text=올림픽공원',
    weather: {
      status: '맑음',
      temperature: '23°C',
      airQuality: '좋음'
    }
  },
  {
    id: '5',
    name: '청계천 러닝 코스',
    difficulty: 'beginner',
    distance: 6,
    description: '서울 도심 속 청계천을 따라 달리는 평평하고 시원한 코스입니다.',
    elevation: 15,
    estimatedTime: '35-45분',
    roadType: '포장도로',
    terrain: '평지',
    imageUrl: 'https://via.placeholder.com/400x200?text=청계천+러닝',
    weather: {
      status: '맑음',
      temperature: '21°C',
      airQuality: '좋음'
    }
  }
];

// 코스 저장
export const saveCourse = async (courseData) => {
  try {
    const courseRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: new Date()
    });
    return courseRef.id;
  } catch (error) {
    console.error('코스 저장 오류:', error);
    throw error;
  }
};

// 코스 목록 가져오기 (필터링 가능)
export const getCourses = async (filters = {}) => {
  try {
    // 실제 Firebase 연결 대신 예시 데이터 사용
    console.log('필터 적용:', filters);
    
    // 필터링 로직 구현 (프론트엔드에서 필터링)
    let filteredCourses = [...exampleCourses];
    
    if (filters.difficulty) {
      filteredCourses = filteredCourses.filter(course => 
        course.difficulty === filters.difficulty
      );
    }
    
    if (filters.minDistance && filters.maxDistance) {
      filteredCourses = filteredCourses.filter(course =>
        course.distance >= filters.minDistance && 
        course.distance <= filters.maxDistance
      );
    }
    
    if (filters.terrain) {
      const terrainMapping = {
        'flat': '평지',
        'hilly': '언덕',
        'mixed': '혼합'
      };
      
      filteredCourses = filteredCourses.filter(course =>
        course.terrain === terrainMapping[filters.terrain] || 
        course.terrain.includes(terrainMapping[filters.terrain])
      );
    }
    
    // Firebase 대신 예시 데이터 반환
    return filteredCourses;
  } catch (error) {
    console.error('코스 가져오기 오류:', error);
    throw error;
  }
};

// 실제 도로 기반 러닝 코스 생성
export const generateRunningCourse = async (startLocation, distance, difficulty = 'beginner') => {
  try {
    // 난이도별 설정
    const difficultySettings = {
      beginner: {
        maxElevation: 50,
        preferredTerrain: ['평지', '공원'],
        avoidHills: true
      },
      intermediate: {
        maxElevation: 150,
        preferredTerrain: ['언덕', '공원', '강변'],
        avoidHills: false
      },
      advanced: {
        maxElevation: 300,
        preferredTerrain: ['산', '언덕', '트레일'],
        avoidHills: false
      }
    };

    const settings = difficultySettings[difficulty];

    // 목적지 계산 (반경 내에서 랜덤하게 선택)
    const endLocation = calculateEndPoint(startLocation, distance / 2); // 왕복 거리 고려

    // 실제 도로를 따라가는 경로 계산
    const routeResult = await calculateRealRoute(startLocation, endLocation);
    
    if (routeResult && routeResult.routes && routeResult.routes.length > 0) {
      const route = routeResult.routes[0];
      const routePath = [];
      
      // 경로의 모든 포인트 추출
      route.legs.forEach(leg => {
        leg.steps.forEach(step => {
          step.path.forEach(point => {
            routePath.push({
              lat: point.lat(),
              lng: point.lng()
            });
          });
        });
      });

      // 코스 정보 생성
      const courseInfo = {
        name: `${difficulty === 'beginner' ? '초급' : difficulty === 'intermediate' ? '중급' : '고급'} 러닝 코스`,
        difficulty: difficulty,
        distance: route.legs[0].distance.value / 1000, // km로 변환
        duration: route.legs[0].duration.text,
        elevation: calculateElevation(routePath),
        path: routePath,
        startAddress: route.legs[0].start_address,
        endAddress: route.legs[0].end_address,
        polyline: route.overview_polyline,
        bounds: route.bounds
      };

      return courseInfo;
    }
  } catch (error) {
    console.error('러닝 코스 생성 오류:', error);
    throw error;
  }
};

// 종점 계산 함수 (시작점에서 일정 거리 떨어진 랜덤 포인트)
const calculateEndPoint = (start, distanceKm) => {
  const R = 6371; // 지구 반경 (km)
  const bearing = Math.random() * 2 * Math.PI; // 랜덤 방향
  
  const lat1 = start.lat * Math.PI / 180;
  const lon1 = start.lng * Math.PI / 180;
  
  const lat2 = Math.asin(
    Math.sin(lat1) * Math.cos(distanceKm / R) +
    Math.cos(lat1) * Math.sin(distanceKm / R) * Math.cos(bearing)
  );
  
  const lon2 = lon1 + Math.atan2(
    Math.sin(bearing) * Math.sin(distanceKm / R) * Math.cos(lat1),
    Math.cos(distanceKm / R) - Math.sin(lat1) * Math.sin(lat2)
  );
  
  return {
    lat: lat2 * 180 / Math.PI,
    lng: lon2 * 180 / Math.PI
  };
};

// 고도 변화 계산 (실제로는 Elevation API를 사용해야 하지만, 여기서는 간단히 추정)
const calculateElevation = (path) => {
  // 실제 구현시에는 Google Elevation API 사용
  // 여기서는 예시값 반환
  return Math.floor(Math.random() * 100) + 10;
};

// 저장된 경로를 지도에 표시하기 위한 디코딩 함수
export const decodePath = (encodedPath) => {
  if (window.google && window.google.maps && window.google.maps.geometry) {
    return window.google.maps.geometry.encoding.decodePath(encodedPath);
  }
  return [];
};

// 근처의 달리기 좋은 장소 찾기 (공원, 강변, 호수 등)
export const findNearbyRunningSpots = async (userLocation, radius = 1000) => {
  return new Promise((resolve, reject) => {
    if (!window.google || !window.google.maps) {
      reject(new Error('Google Maps가 로드되지 않았습니다.'));
      return;
    }

    const service = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );

    const request = {
      location: userLocation,
      radius: radius,
      type: ['park'],
      keyword: '공원 OR 강변 OR 호수 OR 산책로 OR 둘레길'
    };

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        // 달리기에 적합한 장소 필터링
        const runningSpots = results.filter(place => {
          const name = place.name.toLowerCase();
          return name.includes('공원') || 
                 name.includes('강') || 
                 name.includes('호수') || 
                 name.includes('산책') ||
                 name.includes('둘레길') ||
                 place.types.includes('park');
        });
        resolve(runningSpots);
      } else {
        reject(new Error(`장소 검색 실패: ${status}`));
      }
    });
  });
};

// 사용자 위치 기반 실제 러닝 코스 생성
export const generateRealCourses = async (userLocation) => {
  try {
    // 근처 달리기 좋은 장소 찾기
    const nearbySpots = await findNearbyRunningSpots(userLocation, 1000);
    
    if (nearbySpots.length === 0) {
      // 달리기 좋은 장소가 없으면 현재 위치에서 시작
      nearbySpots.push({
        name: '현재 위치',
        geometry: { location: userLocation }
      });
    }

    // 3개의 서로 다른 코스 생성
    const courses = [];
    const difficulties = ['beginner', 'intermediate', 'advanced'];
    const distances = [3, 5, 8];
    const courseNames = [
      { name: '가벼운 조깅 코스', desc: '짧고 평탄한 초보자용 코스' },
      { name: '활력 러닝 코스', desc: '적당한 거리의 중급자용 코스' },
      { name: '체력 단련 코스', desc: '도전적인 거리의 상급자용 코스' }
    ];

    for (let i = 0; i < 3; i++) {
      // 시작 지점 선택 (다양한 장소에서 시작)
      const startSpot = nearbySpots[i % nearbySpots.length];
      const startLocation = {
        lat: startSpot.geometry.location.lat(),
        lng: startSpot.geometry.location.lng()
      };

      try {
        const course = await generateRunningCourse(
          startLocation,
          distances[i],
          difficulties[i]
        );

        if (course) {
          courses.push({
            ...course,
            id: `real-${i + 1}`,
            name: courseNames[i].name,
            description: `${startSpot.name} 근처에서 시작하는 ${courseNames[i].desc}`,
            startingPoint: startSpot.name,
            imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(courseNames[i].name)}`,
            weather: {
              status: '맑음',
              temperature: '22°C',
              airQuality: '좋음'
            }
          });
        }
      } catch (error) {
        console.error(`코스 ${i + 1} 생성 실패:`, error);
      }
    }

    return courses;
  } catch (error) {
    console.error('실제 코스 생성 실패:', error);
    // 실패 시 기존 예시 데이터 반환
    return exampleCourses;
  }
};
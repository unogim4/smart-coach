import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

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
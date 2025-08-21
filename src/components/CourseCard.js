import React from 'react';
import { useNavigate } from 'react-router-dom';

function CourseCard({ course }) {
  const navigate = useNavigate();
  
  // 난이도에 따른 배지 색상 설정
  const difficultyColors = {
    '초급자': 'bg-green-100 text-green-800',
    '중급자': 'bg-blue-100 text-blue-800',
    '고급자': 'bg-red-100 text-red-800',
    'beginner': 'bg-green-100 text-green-800',
    'intermediate': 'bg-blue-100 text-blue-800',
    'advanced': 'bg-red-100 text-red-800'
  };

  // 난이도 한글화
  const difficultyText = {
    'beginner': '초급자',
    'intermediate': '중급자',
    'advanced': '고급자'
  };

  // 현재 날씨 상태 (실제로는 API에서 가져옴)
  const weather = course.weather || {
    status: '맑음',
    temperature: '22°C',
    airQuality: '좋음'
  };

  // 코스 경로 생성 함수
  const generateCoursePath = (course) => {
    // 이미 path가 있으면 그대로 사용
    if (course.path && course.path.length > 0) {
      return course.path;
    }

    // location이 있으면 이를 기반으로 경로 생성
    if (course.location) {
      const baseLat = course.location.lat;
      const baseLng = course.location.lng;
      
      // 거리에 따라 경로 포인트 수 결정
      const distance = course.distance || 1; // km
      const numPoints = Math.max(10, Math.floor(distance * 5)); // 최소 10개 포인트
      
      // 코스 타입에 따른 경로 패턴 생성
      const path = [];
      for (let i = 0; i < numPoints; i++) {
        const progress = i / (numPoints - 1);
        let lat, lng;
        
        // 코스 타입에 따라 다른 경로 패턴 생성
        if (course.name?.includes('해안') || course.name?.includes('강변')) {
          // 해안/강변: 일직선에 가까운 경로
          lat = baseLat + (distance * 0.005 * progress);
          lng = baseLng + (distance * 0.002 * Math.sin(progress * Math.PI));
        } else if (course.name?.includes('공원')) {
          // 공원: 원형 경로
          const angle = progress * Math.PI * 2;
          lat = baseLat + (distance * 0.003 * Math.cos(angle));
          lng = baseLng + (distance * 0.003 * Math.sin(angle));
        } else {
          // 일반 도로: 지그재그 경로
          lat = baseLat + (distance * 0.005 * progress);
          lng = baseLng + (distance * 0.003 * Math.sin(progress * Math.PI * 2));
        }
        
        path.push({ lat, lng });
      }
      
      return path;
    }

    // location도 없으면 기본 위치 사용 (서울시청 기준)
    const defaultLat = 37.5665;
    const defaultLng = 126.9780;
    const distance = course.distance || 1;
    const numPoints = Math.max(10, Math.floor(distance * 5));
    
    const path = [];
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      path.push({
        lat: defaultLat + (distance * 0.005 * progress),
        lng: defaultLng + (distance * 0.003 * Math.sin(progress * Math.PI * 2))
      });
    }
    
    return path;
  };

  // 코스 시작 핸들러
  const handleStartCourse = () => {
    console.log('코스 시작:', course.name);
    
    // 경로 생성
    const coursePath = generateCoursePath(course);
    
    // route 객체 생성
    const route = {
      path: coursePath,
      distance: (course.distance || 1) * 1000, // km를 m로 변환
      name: course.name || '기본 코스',
      difficulty: course.difficulty || 'beginner',
      description: course.description || '러닝 코스',
      estimatedTime: course.estimatedTime || '30분',
      elevation: course.elevation || 10,
      type: course.type || 'running'
    };
    
    console.log('생성된 경로:', {
      name: route.name,
      pathLength: route.path.length,
      distance: route.distance
    });
    
    // ExerciseTracking 페이지로 이동
    navigate('/exercise-tracking', { 
      state: { 
        route: route, 
        exerciseType: 'running',
        courseInfo: course 
      } 
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6 border border-gray-100 hover:shadow-lg transition duration-300">
      {/* 코스 이미지 */}
      <div 
        className="h-48 bg-cover bg-center" 
        style={{ 
          backgroundImage: `url(${course.imageUrl || 'https://via.placeholder.com/400x200?text=러닝코스'})`,
        }}
      >
        <div className="h-full w-full bg-black bg-opacity-20 p-4 flex items-end">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[course.difficulty]}`}>
            {difficultyText[course.difficulty] || course.difficulty}
          </span>
        </div>
      </div>
      
      {/* 코스 내용 */}
      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-800 mb-2">{course.name}</h3>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" />
              <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
            </svg>
            <span>{course.distance}km</span>
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{course.estimatedTime}</span>
          </div>
          
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            <span>고도 {course.elevation}m</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4">{course.description}</p>
        
        {/* 날씨 정보 */}
        <div className="bg-blue-50 p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between">
            <div className="font-medium text-blue-800">현재 날씨 정보</div>
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
              </svg>
              <span className="text-sm text-blue-600">추천 시간대: 오전 8-10시</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-3 mt-2">
            <div className="bg-white px-2 py-1 rounded text-sm">{weather.status}</div>
            <div className="bg-white px-2 py-1 rounded text-sm">{weather.temperature}</div>
            <div className="bg-white px-2 py-1 rounded text-sm">공기질: {weather.airQuality}</div>
          </div>
        </div>
        
        {/* 도로 정보 */}
        <div className="flex mb-4">
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm mr-2">
            {course.roadType || '포장도로'}
          </div>
          <div className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {course.terrain || '평지 위주'}
          </div>
        </div>
        
        {/* 액션 버튼 */}
        <div className="flex justify-between">
          <button className="bg-white border border-blue-500 text-blue-500 px-4 py-2 rounded-md hover:bg-blue-50 transition duration-300">
            상세 정보
          </button>
          <button 
            onClick={handleStartCourse}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition duration-300">
            코스 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default CourseCard;
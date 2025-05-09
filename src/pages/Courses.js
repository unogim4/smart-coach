import React, { useState, useEffect } from 'react';
import CourseSelector from '../components/CourseSelector';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../services/courseService';

// 네이버 지도 컴포넌트
function NaverMap() {
  const mapRef = React.useRef(null);
  
  useEffect(() => {
    // 네이버 지도 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=f3clw1exyg`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 지도 생성
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
        zoom: 14
      };
      
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      
      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(37.5666805, 126.9784147),
        map: map
      });
    };
    
    document.head.appendChild(script);
    
    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px', borderRadius: '8px' }}></div>
  );
}

// 날씨 컴포넌트
function WeatherWidget() {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-4 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-lg mb-1">오늘의 날씨</h3>
          <p className="text-blue-100">서울, 대한민국</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold">22°C</div>
          <div className="text-blue-100">맑음</div>
        </div>
      </div>
      
      <div className="mt-4 grid grid-cols-3 gap-2">
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-sm">습도</div>
          <div className="font-bold">65%</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-sm">바람</div>
          <div className="font-bold">3 m/s</div>
        </div>
        <div className="bg-white bg-opacity-20 rounded p-2 text-center">
          <div className="text-sm">대기질</div>
          <div className="font-bold">좋음</div>
        </div>
      </div>
    </div>
  );
}

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    distance: ''
  });
  
  // 코스 데이터 로드
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // 필터링된 코스 가져오기
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('코스 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
  // 필터 변경 시 코스 다시 로드
  const handleFilterChange = async (newFilters) => {
    setLoading(true);
    setFilters(newFilters);
    
    try {
      const filteredCourses = await getCourses(newFilters);
      setCourses(filteredCourses);
    } catch (error) {
      console.error('필터링 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 데이터가 없을 경우 예시 데이터
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
      imageUrl: 'https://via.placeholder.com/400x200?text=한강+러닝'
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
      imageUrl: 'https://via.placeholder.com/400x200?text=남산+코스'
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
      imageUrl: 'https://via.placeholder.com/400x200?text=북한산+트레일'
    }
  ];

  // 실제 데이터가 없을 경우 예시 데이터 사용
  useEffect(() => {
    if (courses.length === 0 && !loading) {
      setCourses(exampleCourses);
    }
  }, [courses, loading]);

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* 헤더 배경 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">코스 추천</h1>
          <p className="text-blue-100 text-lg">
            자신의 운동 목표와 선호도에 맞는 완벽한 코스를 찾아보세요.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 -mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 왼쪽: 필터 및 날씨 */}
          <div>
            {/* 날씨 위젯 */}
            <WeatherWidget />
            
            {/* 필터 */}
            <CourseSelector onFilter={handleFilterChange} />
          </div>
          
          {/* 오른쪽: 지도 및 코스 */}
          <div className="md:col-span-2">
            {/* 지도 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="p-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">코스 지도</h2>
                <p className="text-gray-500 text-sm">현재 선택된 위치 주변의 추천 코스</p>
              </div>
              <div className="p-4">
                <NaverMap />
              </div>
            </div>
            
            {/* 추천 코스 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-800">추천 코스</h2>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">인기순</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">거리순</button>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">난이도순</button>
                </div>
              </div>
              
              {loading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
              ) : courses.length > 0 ? (
                <div>
                  {courses.map(course => (
                    <CourseCard key={course.id} course={course} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="text-gray-400 mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">조건에 맞는 코스를 찾을 수 없습니다.</p>
                  <p className="text-gray-500 text-sm mt-1">검색 조건을 변경해보세요.</p>
                </div>
              )}
            </div>
            
            {/* 코스 만들기 배너 */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">나만의 코스가 필요한가요?</h3>
                  <p className="text-purple-100">맞춤형 코스를 직접 만들고 커뮤니티와 공유하세요!</p>
                </div>
                <button className="px-6 py-3 bg-white text-purple-600 rounded-md font-medium hover:bg-gray-100 transition duration-300">
                  코스 만들기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
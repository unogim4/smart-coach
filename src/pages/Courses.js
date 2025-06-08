import React, { useState, useEffect } from 'react';
import CourseSelector from '../components/CourseSelector';
import CourseCard from '../components/CourseCard';
import LocationBasedCourseMap from '../components/LocationBasedCourseMap';
import CourseGenerator from '../components/CourseGenerator/CourseGenerator';
import { getCourses, generateRealCourses, initializeDirectionsService } from '../services/courseService';

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
  const [userLocation, setUserLocation] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    distance: ''
  });
  
  // 사용자 위치 가져오기 및 실제 코스 생성
  useEffect(() => {
    // Google Maps 초기화
    const initializeServices = () => {
      if (window.google && window.google.maps) {
        initializeDirectionsService();
      }
    };

    // 사용자 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);

          // Google Maps가 로드된 후 실제 코스 생성
          const checkGoogleMaps = setInterval(async () => {
            if (window.google && window.google.maps) {
              clearInterval(checkGoogleMaps);
              initializeServices();
              
              try {
                // 실제 도로 기반 코스 생성
                const realCourses = await generateRealCourses(location);
                setCourses(realCourses);
              } catch (error) {
                console.error('실제 코스 생성 실패:', error);
                // 실패 시 기본 코스 로드
                const defaultCourses = await getCourses();
                setCourses(defaultCourses);
              } finally {
                setLoading(false);
              }
            }
          }, 100);
        },
        async (error) => {
          console.error('위치 가져오기 실패:', error);
          // 위치 정보 없이 기본 코스 로드
          const defaultCourses = await getCourses();
          setCourses(defaultCourses);
          setLoading(false);
        }
      );
    } else {
      // Geolocation을 지원하지 않는 경우
      const loadDefaultCourses = async () => {
        const defaultCourses = await getCourses();
        setCourses(defaultCourses);
        setLoading(false);
      };
      loadDefaultCourses();
    }
  }, []);
  
  // 필터 변경 시 코스 다시 로드
  const handleFilterChange = async (newFilters) => {
    setLoading(true);
    setFilters(newFilters);
    
    try {
      // 실제 코스가 있으면 필터링, 없으면 기본 코스 필터링
      if (userLocation && courses.some(course => course.id && course.id.startsWith('real-'))) {
        // 실제 코스 필터링 (프론트엔드에서 처리)
        let filteredCourses = [...courses];
        
        if (newFilters.difficulty) {
          filteredCourses = filteredCourses.filter(course => 
            course.difficulty === newFilters.difficulty
          );
        }
        
        if (newFilters.minDistance && newFilters.maxDistance) {
          filteredCourses = filteredCourses.filter(course =>
            course.distance >= newFilters.minDistance && 
            course.distance <= newFilters.maxDistance
          );
        }
        
        setCourses(filteredCourses);
      } else {
        // 기본 코스 필터링
        const filteredCourses = await getCourses(newFilters);
        setCourses(filteredCourses);
      }
    } catch (error) {
      console.error('필터링 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 코스 생성 이벤트 핸들러
  const handleCourseGenerated = (course) => {
    console.log('생성된 코스:', course);
    // 생성된 코스를 목록에 추가
    setCourses(prevCourses => [...prevCourses, {
      ...course,
      id: `generated-${Date.now()}`,
      imageUrl: `https://via.placeholder.com/400x200?text=${encodeURIComponent(course.name)}`,
      weather: {
        status: '맑음',
        temperature: '22°C',
        airQuality: '좋음'
      }
    }]);
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-10">
      {/* 헤더 배경 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">AI 코스 추천</h1>
          <p className="text-blue-100 text-lg">
            실제 위치를 기반으로 맞춤형 러닝 코스를 추천받고 바로 시작하세요
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* 실시간 위치 기반 코스 추천 지도 */}
        <div className="mb-8">
          <LocationBasedCourseMap />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 왼쪽: 필터 및 날씨 */}
          <div>
            {/* 날씨 위젯 */}
            <WeatherWidget />
            
            {/* 필터 */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">코스 필터</h3>
              <CourseSelector onFilter={handleFilterChange} />
              
              {/* 추가 필터 옵션 */}
              <div className="mt-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    운동 타입
                  </label>
                  <div className="flex space-x-2">
                    <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                      러닝
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                      사이클링
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    목표 거리
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                    <option>3km (초급자)</option>
                    <option>5km (중급자)</option>
                    <option>8km (고급자)</option>
                    <option>10km+ (장거리)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          
          {/* 오른쪽: 코스 목록 */}
          <div className="md:col-span-2">
            {/* 추천 코스 */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              {userLocation ? '현재 위치 기반 맞춤 코스' : '커뮤니티 코스'}
            </h2>
            <div className="flex space-x-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm">인기순</button>
              <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">거리순</button>
                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm">난이도순</button>
                </div>
              </div>
              
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>💡 팁:</strong> 위의 지도에서 실시간으로 생성된 맞춤 코스를 먼저 확인해보세요! 
                      현재 위치에서 바로 시작할 수 있는 최적의 경로를 제공합니다.
                    </p>
                  </div>
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
            
            {/* 코스 생성기 추가 */}
            <div className="mb-6">
              <CourseGenerator 
                onCourseGenerated={handleCourseGenerated} 
              />
            </div>
            
            {/* 코스 만들기 배너 */}
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg shadow-md p-6 text-white">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <div className="mb-4 md:mb-0">
                  <h3 className="text-xl font-bold mb-2">나만의 코스를 만들어보세요!</h3>
                  <p className="text-purple-100">
                    AI가 생성한 코스 외에도 직접 경로를 그려서 나만의 특별한 코스를 만들 수 있습니다.
                  </p>
                </div>
                <button className="px-6 py-3 bg-white text-purple-600 rounded-md font-medium hover:bg-gray-100 transition duration-300">
                  코스 만들기
                </button>
              </div>
            </div>
            
            {/* 사용법 안내 */}
            <div className="mt-6 bg-blue-50 rounded-lg p-4">
              <h4 className="font-bold text-blue-800 mb-2">🚀 스마트 코스 추천 사용법</h4>
              <div className="text-sm text-blue-700 space-y-1">
                <div>1. 📍 브라우저에서 위치 권한을 허용하세요</div>
                <div>2. 🗺️ 지도에서 자동 생성된 3가지 코스를 확인하세요</div>
                <div>3. 🎯 원하는 코스를 클릭하여 선택하세요</div>
                <div>4. 🏃‍♂️ "코스 시작하기" 버튼으로 운동을 시작하세요</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Courses;
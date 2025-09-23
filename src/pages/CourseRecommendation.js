import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LocationBasedCourseMap from '../components/LocationBasedCourseMap';
import NavigationMap from '../components/NavigationMap';
import { 
  getCurrentLocation, 
  searchNearbyRunningCourses, 
  DIFFICULTY_LEVELS 
} from '../services/locationBasedCourseService';

function CourseRecommendation({ userLocation, weatherData }) {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('classic'); // 'classic' or 'navigation'
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLocation, setCurrentLocation] = useState(userLocation);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    maxDistance: 1000,
    courseType: 'all'
  });
  const [showRoute, setShowRoute] = useState(false);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [locationHistory, setLocationHistory] = useState([]);
  const [watchId, setWatchId] = useState(null);

  // 위치 변화 감지 및 자동 업데이트
  useEffect(() => {
    const loadCourses = async () => {
      if (viewMode !== 'classic') return; // 클래식 모드일 때만 실행
      
      setLoading(true);
      try {
        // 현재 위치 가져오기
        const location = userLocation || await getCurrentLocation();
        setCurrentLocation(location);

        // 위치 히스토리에 추가
        setLocationHistory(prev => {
          const newHistory = [...prev, { ...location, timestamp: Date.now() }];
          return newHistory.slice(-10); // 최근 10개 위치만 유지
        });

        // 주변 러닝 코스 검색
        let nearbyCourses = await searchNearbyRunningCourses(location, filters.maxDistance);
        
        // 🌟 온천장 코스 추가 (부산 지역일 때)
        if (location.lat >= 35.0 && location.lat <= 35.4 && 
            location.lng >= 128.8 && location.lng <= 129.3) {
          // 부산 지역이면 온천장 코스 추가
          const oncheonCourse = {
            id: 'oncheon-special',
            name: '🌟 온천장 러닝 코스',
            distance: 1500,
            difficulty: DIFFICULTY_LEVELS.EASY,
            elevation: 15,
            description: '부드러운 9분 코스, GPS 기반 실시간 트래킹',
            estimatedTime: '9분',
            type: 'special',
            location: {
              lat: 35.220462,
              lng: 129.086192
            },
            address: '부산 동래구 온천장로',
            features: ['실시간 GPS 트래킹', '자동 페이스 조절', 'AI 코치 피드백'],
            isSpecialCourse: true,
            waypoints: [
              { lat: 35.220462, lng: 129.086192, label: '시작점' },
              { lat: 35.229843, lng: 129.091357, label: '경유지' },
              { lat: 35.234004, lng: 129.091775, label: '도착지' }
            ]
          };
          
          // 코스 배열 맨 앞에 추가
          nearbyCourses = [oncheonCourse, ...nearbyCourses];
        }
        
        setCourses(nearbyCourses);
      } catch (error) {
        console.error('코스 로딩 실패:', error);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [userLocation, filters.maxDistance, viewMode]);

  // 실시간 위치 추적 시작/중지
  const toggleLocationTracking = () => {
    if (isTrackingLocation) {
      // 위치 추적 중지
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
      }
      setIsTrackingLocation(false);
    } else {
      // 위치 추적 시작
      if (navigator.geolocation) {
        const id = navigator.geolocation.watchPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            
            // 이전 위치와 비교해서 유의미한 변화가 있을 때만 업데이트
            if (currentLocation) {
              const distance = calculateDistance(currentLocation, newLocation);
              if (distance > 50) { // 50m 이상 이동했을 때만 업데이트
                console.log(`위치 변경 감지: ${distance.toFixed(0)}m 이동`);
                setCurrentLocation(newLocation);
                
                // 새 위치 기반으로 코스 재검색
                if (viewMode === 'classic') {
                  refreshCoursesForLocation(newLocation);
                }
              }
            } else {
              setCurrentLocation(newLocation);
              if (viewMode === 'classic') {
                refreshCoursesForLocation(newLocation);
              }
            }
          },
          (error) => {
            console.warn('위치 추적 에러:', error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 30000
          }
        );
        
        setWatchId(id);
        setIsTrackingLocation(true);
      }
    }
  };

  // 새 위치에서 코스 재검색
  const refreshCoursesForLocation = async (location) => {
    if (viewMode !== 'classic') return;
    
    try {
      setLoading(true);
      const nearbyCourses = await searchNearbyRunningCourses(location, filters.maxDistance);
      setCourses(nearbyCourses);
      setSelectedCourse(null); // 선택된 코스 초기화
      
      // 위치 히스토리 업데이트
      setLocationHistory(prev => {
        const newHistory = [...prev, { ...location, timestamp: Date.now() }];
        return newHistory.slice(-10);
      });
      
      console.log(`새 위치에서 ${nearbyCourses.length}개 코스 발견`);
    } catch (error) {
      console.error('코스 재검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  // 거리 계산 함수
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

  // 수동 위치 새로고침
  const refreshLocation = async () => {
    try {
      setLoading(true);
      const newLocation = await getCurrentLocation();
      setCurrentLocation(newLocation);
      
      if (viewMode === 'classic') {
        await refreshCoursesForLocation(newLocation);
      }
    } catch (error) {
      console.error('위치 새로고침 실패:', error);
      alert('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
    }
  };

  // 컴포넌트 언마운트 시 위치 추적 정리
  useEffect(() => {
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  // 필터 적용
  const filteredCourses = courses.filter(course => {
    if (filters.difficulty !== 'all' && course.difficulty.value !== filters.difficulty) {
      return false;
    }
    if (filters.courseType !== 'all' && !course.courseType.includes(filters.courseType)) {
      return false;
    }
    return true;
  });

  // 코스 선택 핸들러
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    setShowRoute(true);
  };
  
  // 코스 시작 함수 추가
  const handleStartCourse = (course) => {
    // 🌟 온천장 코스인 경우 특별 처리
    if (course.id === 'oncheon-special') {
      console.log('🏃 온천장 코스 시작!');
      navigate('/exercise-tracking', {
        state: {
          exerciseType: 'running',
          simulationMode: true,
          simulationType: 'oncheonCourse'
        }
      });
      return;
    }
    
    // 일반 코스의 경우
    const routeData = {
      name: course.name,
      distance: parseFloat(course.estimatedDistance) * 1000, // km를 미터로 변환
      path: generateCoursePath(course), // 코스 경로 생성
      instructions: generateInstructions(course),
      difficulty: course.difficulty,
      vicinity: course.vicinity
    };
    
    // ExerciseTracking 페이지로 이동
    navigate('/exercise-tracking', {
      state: {
        route: routeData,
        exerciseType: 'running', // 기본값: 러닝
        targetHeartRate: { min: 120, max: 160 }
      }
    });
  };
  
  // 코스 경로 생성 함수
  const generateCoursePath = (course) => {
    // 코스 중심점 기준으로 원형 경로 생성
    const centerLat = course.geometry.location.lat;
    const centerLng = course.geometry.location.lng;
    const distance = parseFloat(course.estimatedDistance);
    const points = [];
    
    // 거리에 따라 반지름 계산 (대략적)
    const radius = distance * 0.0003; // km를 도 단위로 변환
    
    // 원형 경로 생성 (36개 포인트)
    for (let i = 0; i <= 36; i++) {
      const angle = (i * 10) * Math.PI / 180; // 10도씩 회전
      const lat = centerLat + radius * Math.cos(angle);
      const lng = centerLng + radius * Math.sin(angle) * 1.2; // 경도는 보정
      points.push({ lat, lng });
    }
    
    return points;
  };
  
  // 네비게이션 안내 생성
  const generateInstructions = (course) => {
    const distance = parseFloat(course.estimatedDistance);
    const quarterDistance = distance / 4;
    
    return [
      { text: `${course.name}에서 출발` },
      { text: `${(quarterDistance * 1000).toFixed(0)}m 후 우회전` },
      { text: `${(quarterDistance * 1000).toFixed(0)}m 직진` },
      { text: `${(quarterDistance * 1000).toFixed(0)}m 후 우회전` },
      { text: `${(quarterDistance * 1000).toFixed(0)}m 후 도착` }
    ];
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {viewMode === 'navigation' ? '🧭 네비게이션 경로 설정' : '📍 내 위치 기반 러닝 코스 추천'}
            </h2>
            <p className="text-gray-600">
              {viewMode === 'navigation' 
                ? '시작점과 도착점을 선택하여 나만의 운동 경로를 만들어보세요.'
                : '현재 위치에서 가까운 러닝 코스를 추천해드립니다.'}
            </p>
          </div>
        </div>

        {/* 모드 선택 버튼 */}
        <div className="flex items-center justify-between border-t pt-4">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('classic')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                viewMode === 'classic'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <i className="fas fa-th mr-2"></i>
              클래식 모드
            </button>
            <button
              onClick={() => setViewMode('navigation')}
              className={`px-4 py-2 rounded-lg transition-all flex items-center ${
                viewMode === 'navigation'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              <i className="fas fa-route mr-2"></i>
              네비게이션 모드
            </button>
          </div>

          {/* 클래식 모드일 때만 위치 추적 버튼 표시 */}
          {viewMode === 'classic' && (
            <div className="flex space-x-2">
              <button
                onClick={refreshLocation}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                <i className="fas fa-sync-alt mr-2"></i>
                {loading ? '새로고침 중...' : '위치 새로고침'}
              </button>
              
              <button
                onClick={toggleLocationTracking}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isTrackingLocation 
                    ? 'bg-red-500 hover:bg-red-600 text-white' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                <i className={`fas ${isTrackingLocation ? 'fa-stop' : 'fa-location-arrow'} mr-2`}></i>
                {isTrackingLocation ? '추적 중지' : '실시간 추적'}
              </button>
            </div>
          )}
        </div>

        {/* 모드 설명 */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <i className={`fas ${viewMode === 'navigation' ? 'fa-info-circle' : 'fa-lightbulb'} text-blue-500 mt-1 mr-2`}></i>
            <div className="text-sm text-blue-700">
              {viewMode === 'navigation' ? (
                <>
                  <strong>네비게이션 모드:</strong> 지도를 클릭하거나 추천 장소를 선택하여 시작점과 도착점을 설정하세요. 
                  실제 도로를 따라가는 최적 경로를 생성해드립니다.
                </>
              ) : (
                <>
                  <strong>클래식 모드:</strong> 현재 위치를 기준으로 주변의 러닝 코스를 자동으로 추천받습니다. 
                  실시간 추적을 켜면 이동할 때마다 새로운 코스를 발견할 수 있습니다.
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 모드에 따른 화면 표시 */}
      {viewMode === 'navigation' ? (
        // 네비게이션 모드
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '800px' }}>
          <NavigationMap userLocation={currentLocation} />
        </div>
      ) : (
        // 클래식 모드
        <>
          {/* 위치 정보 표시 */}
          {currentLocation && (
            <div className="bg-white rounded-lg shadow-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <i className="fas fa-map-marker-alt mr-2 text-blue-500"></i>
                  <span>위도: {currentLocation.lat.toFixed(4)}, 경도: {currentLocation.lng.toFixed(4)}</span>
                </div>
                
                {isTrackingLocation && (
                  <div className="flex items-center text-sm text-green-600">
                    <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    <span>실시간 위치 추적 중</span>
                  </div>
                )}
              </div>
              
              {/* 위치 히스토리 */}
              {locationHistory.length > 1 && (
                <div className="mt-2 text-xs text-gray-400">
                  <span>이동 기록: {locationHistory.length}개 위치 • </span>
                  <span>마지막 업데이트: {new Date(locationHistory[locationHistory.length - 1]?.timestamp).toLocaleTimeString('ko-KR')}</span>
                </div>
              )}
            </div>
          )}

          {/* 필터 섹션 */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">검색 필터</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 난이도 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">난이도</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="easy">하 (초급)</option>
                  <option value="medium">중 (중급)</option>
                  <option value="hard">상 (고급)</option>
                </select>
              </div>

              {/* 거리 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  검색 범위: {filters.maxDistance}m
                </label>
                <input
                  type="range"
                  min="500"
                  max="2000"
                  step="100"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxDistance: parseInt(e.target.value) }))}
                  className="w-full"
                />
              </div>

              {/* 코스 타입 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">코스 타입</label>
                <select
                  value={filters.courseType}
                  onChange={(e) => setFilters(prev => ({ ...prev, courseType: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="공원">공원 코스</option>
                  <option value="강변">강변 코스</option>
                  <option value="산책로">산책로</option>
                  <option value="운동장">운동장</option>
                </select>
              </div>
            </div>
          </div>

          {/* 지도 섹션 */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">
                  주변 러닝 코스 지도 ({filteredCourses.length}개)
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={showRoute}
                      onChange={(e) => setShowRoute(e.target.checked)}
                      className="mr-2"
                    />
                    경로 표시
                  </label>
                  
                  {isTrackingLocation && (
                    <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                      <div className="animate-pulse w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span>실시간 추적</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {currentLocation && (
              <LocationBasedCourseMap
                userLocation={currentLocation}
                courses={filteredCourses}
                selectedCourse={selectedCourse}
                onCourseSelect={handleCourseSelect}
                showRoute={showRoute}
              />
            )}
          </div>

          {/* 코스 목록 */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">
              추천 코스 목록 ({filteredCourses.length}개)
            </h3>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
            ) : filteredCourses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                <i className="fas fa-map-marked-alt text-gray-400 text-4xl mb-4"></i>
                <p className="text-gray-500 text-lg mb-2">주변에서 코스를 찾을 수 없습니다</p>
                <p className="text-gray-400 text-sm">검색 범위를 늘리거나 다른 위치에서 시도해보세요.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredCourses.map((course, index) => (
                  <div
                    key={course.id}
                    className={`${
                      course.isSpecialCourse 
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-300' 
                        : 'bg-white'
                    } rounded-lg shadow-lg overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-xl ${
                      selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => handleCourseSelect(course)}
                  >
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {course.isSpecialCourse ? '🌟' : course.icon}
                          </span>
                          <div>
                            <h4 className="text-xl font-semibold text-gray-800">
                              {course.name}
                              {course.isSpecialCourse && (
                                <span className="ml-2 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-1 rounded-full">
                                  추천
                                </span>
                              )}
                            </h4>
                            <p className="text-gray-500 text-sm">
                              {course.isSpecialCourse ? course.address : course.vicinity}
                            </p>
                          </div>
                        </div>
                        <span
                          className="px-3 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: course.difficulty.color }}
                        >
                          {course.difficulty.label}
                        </span>
                      </div>
                      
                      {/* 특별 코스 기능 표시 */}
                      {course.isSpecialCourse && course.features && (
                        <div className="mb-4 p-3 bg-white bg-opacity-70 rounded-lg">
                          <div className="flex flex-wrap gap-2">
                            {course.features.map((feature, idx) => (
                              <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                ✓ {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* 코스 정보 */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-blue-600">
                            {course.estimatedDistance || (course.distance ? `${(course.distance/1000).toFixed(1)}km` : '0km')}
                          </div>
                          <div className="text-xs text-gray-500">거리</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-green-600">{course.estimatedTime}</div>
                          <div className="text-xs text-gray-500">예상시간</div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-bold text-orange-600">
                            {course.elevationGain || `${course.elevation || 0}m`}
                          </div>
                          <div className="text-xs text-gray-500">고도변화</div>
                        </div>
                      </div>
                      
                      {/* 액션 버튼 */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartCourse(course);
                        }}
                        className={`w-full ${
                          course.isSpecialCourse 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                            : 'bg-green-500 hover:bg-green-600'
                        } text-white py-2 px-4 rounded-lg transition-colors`}
                      >
                        <i className="fas fa-play mr-2"></i>
                        {course.isSpecialCourse ? '코스 시작하기' : '코스 시작'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default CourseRecommendation;
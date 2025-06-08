import React, { useState, useEffect } from 'react';
import LocationBasedCourseMap from '../components/LocationBasedCourseMap';
import { 
  getCurrentLocation, 
  searchNearbyRunningCourses, 
  DIFFICULTY_LEVELS 
} from '../services/locationBasedCourseService';

function CourseRecommendation({ userLocation, weatherData }) {
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

  // 위치 정보 및 코스 검색
  useEffect(() => {
    const loadCourses = async () => {
      setLoading(true);
      try {
        // 현재 위치 가져오기
        const location = userLocation || await getCurrentLocation();
        setCurrentLocation(location);

        // 주변 러닝 코스 검색
        const nearbyCourses = await searchNearbyRunningCourses(location, filters.maxDistance);
        setCourses(nearbyCourses);
      } catch (error) {
        console.error('코스 로딩 실패:', error);
        // 에러 시 빈 배열 설정
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [userLocation, filters.maxDistance]);

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

  // 코스 시작 핸들러
  const handleStartCourse = (course) => {
    alert(`${course.name} 코스를 시작합니다! 실시간 모니터링 페이지로 이동합니다.`);
    // 실제로는 운동 시작 페이지로 라우팅
  };

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">내 위치 기반 러닝 코스 추천</h2>
        <p className="text-gray-600">
          현재 위치에서 1km 이내의 러닝 코스를 추천해드립니다.
        </p>
        
        {/* 위치 정보 표시 */}
        {currentLocation && (
          <div className="mt-4 flex items-center text-sm text-gray-500">
            <i className="fas fa-map-marker-alt mr-2"></i>
            <span>위도: {currentLocation.lat.toFixed(4)}, 경도: {currentLocation.lng.toFixed(4)}</span>
          </div>
        )}
      </div>

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
            <div className="flex items-center space-x-2">
              <label className="flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={showRoute}
                  onChange={(e) => setShowRoute(e.target.checked)}
                  className="mr-2"
                />
                경로 표시
              </label>
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
            <p className="text-gray-400 text-sm">
              검색 범위를 늘리거나 다른 위치에서 시도해보세요.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCourses.map((course, index) => (
              <div
                key={course.id}
                className={`bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-xl ${
                  selectedCourse?.id === course.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">{course.icon}</span>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">{course.name}</h4>
                        <p className="text-gray-500 text-sm">{course.vicinity}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: course.difficulty.color }}
                      >
                        {course.difficulty.label}
                      </span>
                      <span className="text-lg font-bold text-blue-600">
                        #{index + 1}
                      </span>
                    </div>
                  </div>
                  
                  {/* 코스 정보 */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-blue-600">{course.estimatedDistance}</div>
                      <div className="text-xs text-gray-500">거리</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-green-600">{course.estimatedTime}</div>
                      <div className="text-xs text-gray-500">예상시간</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-lg font-bold text-orange-600">{course.elevationGain}</div>
                      <div className="text-xs text-gray-500">고도변화</div>
                    </div>
                  </div>
                  
                  {/* 평점 및 거리 */}
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="text-yellow-500 mr-1">
                        {'★'.repeat(Math.floor(course.rating))}
                        {'☆'.repeat(5 - Math.floor(course.rating))}
                      </div>
                      <span className="text-gray-600 text-sm">({course.rating})</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      <i className="fas fa-map-marker-alt mr-1"></i>
                      {Math.round(course.distance)}m 거리
                    </div>
                  </div>
                  
                  {/* 특징 태그 */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {course.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                  
                  {/* 날씨 적합성 */}
                  <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-1">날씨 적합성:</div>
                    <div className="flex space-x-1">
                      {course.weatherSuitability.map((weather, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded"
                        >
                          {weather}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  {/* 액션 버튼 */}
                  <div className="flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCourseSelect(course);
                      }}
                      className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
                        selectedCourse?.id === course.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                      }`}
                    >
                      <i className="fas fa-map mr-2"></i>
                      {selectedCourse?.id === course.id ? '선택됨' : '지도에서 보기'}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleStartCourse(course);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors"
                    >
                      <i className="fas fa-play mr-2"></i>
                      코스 시작
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 선택된 코스 상세 정보 */}
      {selectedCourse && (
        <div className="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">
            <i className="fas fa-info-circle mr-2 text-blue-500"></i>
            선택된 코스: {selectedCourse.name}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">코스 상세 정보</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li><strong>타입:</strong> {selectedCourse.courseType}</li>
                <li><strong>난이도:</strong> {selectedCourse.difficulty.label}</li>
                <li><strong>예상 거리:</strong> {selectedCourse.estimatedDistance}</li>
                <li><strong>예상 시간:</strong> {selectedCourse.estimatedTime}</li>
                <li><strong>고도 변화:</strong> {selectedCourse.elevationGain}</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-700 mb-2">운동 준비사항</h4>
              <ul className="space-y-1 text-sm text-gray-600">
                <li>• 충분한 수분 준비</li>
                <li>• 적절한 운동화 착용</li>
                <li>• 스마트폰 충전 확인</li>
                <li>• 날씨에 맞는 복장</li>
                <li>• 안전장비 (필요시)</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleStartCourse(selectedCourse)}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-6 rounded-lg transition-colors text-lg font-semibold"
            >
              <i className="fas fa-play mr-2"></i>
              {selectedCourse.name} 운동 시작하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseRecommendation;
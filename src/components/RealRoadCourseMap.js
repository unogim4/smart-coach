import React, { useEffect, useRef, useState } from 'react';
import { generateRealRoadCourses, DIFFICULTY_LEVELS, COURSE_TYPES } from '../services/realRoadCourseService';

function RealRoadCourseMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const directionsRendererRef = useRef([]);
  const watchIdRef = useRef(null);
  
  const [mapStatus, setMapStatus] = useState('loading');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);
  const [recommendedCourses, setRecommendedCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isGeneratingCourses, setIsGeneratingCourses] = useState(false);
  const [coursePreferences, setCoursePreferences] = useState({
    type: COURSE_TYPES.RUNNING,
    distances: [3, 5, 8]
  });

  useEffect(() => {
    console.log('=== 실제 도로 기반 코스 추천 지도 시작 ===');
    
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API 키가 환경변수에 설정되지 않았습니다');
      setMapStatus('error');
      return;
    }

    requestUserLocation();

    if (window.google && window.google.maps) {
      console.log('Google Maps API가 이미 로드되어 있습니다');
      setScriptLoaded(true);
      initializeMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps API 스크립트 로드 완료');
      setScriptLoaded(true);
      setTimeout(initializeMap, 1000);
    };

    script.onerror = () => {
      console.error('Google Maps API 스크립트 로드 실패');
      setMapStatus('error');
    };

    document.head.appendChild(script);

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다');
      return;
    }

    setIsTrackingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        console.log('현재 위치:', newLocation);
        setUserLocation(newLocation);
        setLocationError(null);
        
        // 지도가 준비되면 코스 생성
        if (mapInstanceRef.current) {
          await generateCourses(newLocation);
          updateMapLocation(newLocation);
        }
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        setIsTrackingLocation(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('위치 정보 접근이 거부되었습니다');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('위치 정보를 사용할 수 없습니다');
            break;
          case error.TIMEOUT:
            setLocationError('위치 정보 요청 시간이 초과되었습니다');
            break;
          default:
            setLocationError('알 수 없는 위치 오류가 발생했습니다');
            break;
        }
        
        // 기본 위치 사용 (서울 시청)
        const defaultLocation = { lat: 37.5665, lng: 126.9780 };
        setUserLocation(defaultLocation);
        if (mapInstanceRef.current) {
          generateCourses(defaultLocation);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  const generateCourses = async (location) => {
    if (!location) return;
    
    console.log('실제 도로 기반 코스 생성 시작...', location);
    setIsGeneratingCourses(true);
    
    try {
      const courses = await generateRealRoadCourses(location, coursePreferences);
      
      console.log('생성된 실제 도로 코스:', courses);
      setRecommendedCourses(courses);
      
      if (courses.length > 0) {
        setSelectedCourse(courses[0]);
      }
    } catch (error) {
      console.error('코스 생성 오류:', error);
      setLocationError('코스 생성 중 오류가 발생했습니다');
    } finally {
      setIsGeneratingCourses(false);
    }
  };

  const updateMapLocation = (location) => {
    if (!mapInstanceRef.current || !window.google) return;

    mapInstanceRef.current.setCenter(location);

    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    userMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: '현재 위치 (시작점)',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      animation: window.google.maps.Animation.DROP
    });

    // 실제 도로 경로 표시
    displayRealRoadRoutes();
  };

  const displayRealRoadRoutes = () => {
    if (!mapInstanceRef.current || !window.google) return;

    // 기존 경로 제거
    directionsRendererRef.current.forEach(renderer => {
      renderer.setMap(null);
    });
    directionsRendererRef.current = [];

    // 새 경로 표시
    recommendedCourses.forEach((course, index) => {
      if (!course.googleRoute) return;

      const isSelected = selectedCourse && selectedCourse.id === course.id;
      
      const directionsRenderer = new window.google.maps.DirectionsRenderer({
        suppressMarkers: true, // 기본 마커 숨기기
        polylineOptions: {
          strokeColor: isSelected ? '#dc2626' : course.color, // 선택된 코스는 빨간색
          strokeOpacity: isSelected ? 1.0 : 0.7,
          strokeWeight: isSelected ? 6 : 3
        }
      });

      directionsRenderer.setMap(mapInstanceRef.current);
      directionsRenderer.setDirections({
        routes: [course.googleRoute],
        request: null
      });

      directionsRendererRef.current.push(directionsRenderer);

      // 시작점과 끝점 마커 추가
      new window.google.maps.Marker({
        position: course.startLocation,
        map: mapInstanceRef.current,
        title: `${course.name} 시작점`,
        icon: {
          url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
          scaledSize: new window.google.maps.Size(24, 24)
        }
      });

      if (course.endLocation && 
          (course.endLocation.lat !== course.startLocation.lat || 
           course.endLocation.lng !== course.startLocation.lng)) {
        new window.google.maps.Marker({
          position: course.endLocation,
          map: mapInstanceRef.current,
          title: `${course.name} 끝점`,
          icon: {
            url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
            scaledSize: new window.google.maps.Size(24, 24)
          }
        });
      }
    });
  };

  const initializeMap = async () => {
    if (!mapRef.current) return;

    if (window.google && window.google.maps) {
      try {
        const initialLocation = userLocation || { lat: 37.5665, lng: 126.9780 };

        const map = new window.google.maps.Map(mapRef.current, {
          center: initialLocation,
          zoom: 15,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: false,
          mapTypeId: 'roadmap'
        });
        
        mapInstanceRef.current = map;
        setMapStatus('success');

        if (userLocation) {
          await generateCourses(userLocation);
          updateMapLocation(userLocation);
        }
        
      } catch (error) {
        console.error('지도 생성 에러:', error);
        setMapStatus('error');
      }
    } else {
      setTimeout(initializeMap, 1000);
    }
  };

  useEffect(() => {
    if (userLocation && mapInstanceRef.current && !isGeneratingCourses) {
      updateMapLocation(userLocation);
    }
  }, [userLocation, recommendedCourses, isGeneratingCourses]);

  const handleLocationRefresh = () => {
    setLocationError(null);
    setIsTrackingLocation(true);
    setRecommendedCourses([]);
    setSelectedCourse(null);
    requestUserLocation();
  };

  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    displayRealRoadRoutes();
    
    if (mapInstanceRef.current && window.google && course.googleRoute) {
      const bounds = new window.google.maps.LatLngBounds();
      
      // 경로의 모든 점을 포함하도록 bounds 설정
      course.coordinates.forEach(coord => {
        bounds.extend(coord);
      });
      
      mapInstanceRef.current.fitBounds(bounds);
      
      // 적절한 줌 레벨로 조정
      setTimeout(() => {
        const currentZoom = mapInstanceRef.current.getZoom();
        if (currentZoom > 16) {
          mapInstanceRef.current.setZoom(16);
        }
      }, 100);
    }
  };

  const handleStartCourse = () => {
    if (selectedCourse) {
      alert(`🏃‍♂️ "${selectedCourse.name}" 시작!\n\n📍 거리: ${selectedCourse.distance.toFixed(1)}km\n⏱️ 예상 시간: ${selectedCourse.estimatedTime}\n🗺️ 실제 도로를 따라가는 안전한 경로입니다\n\n행운을 빕니다! 💪`);
      // 실제 운동 추적 기능을 여기에 구현할 수 있습니다
    }
  };

  const handleRegenerateCourses = async () => {
    if (userLocation) {
      setRecommendedCourses([]);
      setSelectedCourse(null);
      await generateCourses(userLocation);
    }
  };

  return (
    <div className="w-full border-2 border-blue-500 rounded-lg overflow-hidden bg-white">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-bold text-lg">🛣️ 실제 도로 기반 스마트 코스 추천</h3>
        <p className="text-sm text-gray-600">
          Google Maps의 실제 도로 데이터를 기반으로 안전하고 정확한 러닝 코스를 생성합니다
        </p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex space-x-2 text-xs">
            <span className="px-2 py-1 bg-green-100 text-green-700 rounded">● 3km 초급 (실제도로)</span>
            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded">● 5km 중급 (실제도로)</span>
            <span className="px-2 py-1 bg-red-100 text-red-700 rounded">● 8km 고급 (실제도로)</span>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={handleRegenerateCourses}
              disabled={isGeneratingCourses}
              className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600 disabled:opacity-50"
            >
              {isGeneratingCourses ? '생성중...' : '코스 재생성'}
            </button>
            <button 
              onClick={handleLocationRefresh}
              className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
            >
              위치 새로고침
            </button>
          </div>
        </div>
      </div>
      
      {/* 지도 컨테이너 */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full"
          style={{ 
            height: '450px',
            backgroundColor: '#f3f4f6'
          }}
        />
        
        {/* 로딩 오버레이 */}
        {(mapStatus === 'loading' || isGeneratingCourses) && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-3"></div>
              <div className="text-gray-600 text-sm font-medium">
                {isGeneratingCourses ? '🛣️ 실제 도로 기반 코스 생성 중...' : '지도 로딩 중...'}
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {isGeneratingCourses ? 'Google Directions API로 최적 경로를 찾고 있습니다' : '잠시만 기다려주세요'}
              </div>
            </div>
          </div>
        )}
        
        {/* 성공 표시 */}
        {mapStatus === 'success' && recommendedCourses.length > 0 && !isGeneratingCourses && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-10">
            🛣️ {recommendedCourses.length}개 실제 도로 코스 생성 완료
          </div>
        )}

        {/* 위치 오류 표시 */}
        {locationError && (
          <div className="absolute bottom-2 left-2 right-2 bg-yellow-100 border border-yellow-400 rounded p-2 text-xs">
            <div className="font-medium text-yellow-800">⚠️ 알림:</div>
            <div className="text-yellow-700">{locationError}</div>
          </div>
        )}
      </div>
      
      {/* 코스 선택 패널 */}
      {recommendedCourses.length > 0 && (
        <div className="p-4 bg-white border-t">
          <h4 className="font-bold text-md mb-3">🏃‍♂️ 실제 도로 추천 코스 ({recommendedCourses.length}개)</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendedCourses.map((course, index) => (
              <div 
                key={course.id}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedCourse && selectedCourse.id === course.id
                    ? 'border-red-500 bg-red-50'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
                onClick={() => handleCourseSelect(course)}
              >
                <div className="flex justify-between items-center mb-2">
                  <h5 className="font-medium text-sm">{course.name}</h5>
                  <div className="flex items-center space-x-1">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: course.color }}
                    ></span>
                    {course.isRealRoad && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">실제도로</span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>📍 거리: {course.distance.toFixed(1)}km</div>
                  <div>⏱️ 예상 시간: {course.estimatedTime}</div>
                  <div>📈 고도 변화: +{course.elevationGain}m</div>
                  <div>🎯 난이도: {course.difficulty}</div>
                </div>
                {course.features && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {course.features.slice(0, 3).map((feature, idx) => (
                      <span key={idx} className="px-1 py-0.5 bg-gray-100 text-xs rounded">
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {selectedCourse && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="font-medium flex items-center">
                    🏆 선택된 코스: {selectedCourse.name}
                    {selectedCourse.isRealRoad && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        ✅ 실제 도로 검증됨
                      </span>
                    )}
                  </h5>
                  <p className="text-sm text-gray-600 mt-1">{selectedCourse.description}</p>
                  <div className="text-xs text-gray-500 mt-1">
                    시작점에서 끝점까지 실제 도로를 따라 안전하게 이동하는 경로입니다
                  </div>
                </div>
                <button 
                  onClick={handleStartCourse}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium transition-colors"
                >
                  🚀 코스 시작하기
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* 위치 정보 패널 */}
      <div className="p-2 bg-blue-100 text-xs border-t">
        <div className="grid grid-cols-4 gap-2">
          <div>
            <div className="font-medium">📍 현재 위치:</div>
            <div>
              {userLocation ? 
                `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
                '위치 정보 없음'
              }
            </div>
          </div>
          <div>
            <div className="font-medium">🛣️ 추천 코스:</div>
            <div>{recommendedCourses.length}개 (실제 도로)</div>
          </div>
          <div>
            <div className="font-medium">🎯 선택된 코스:</div>
            <div>{selectedCourse ? selectedCourse.name : '없음'}</div>
          </div>
          <div>
            <div className="font-medium">⚡ 상태:</div>
            <div className={isGeneratingCourses ? 'text-orange-600' : 'text-green-600'}>
              {isGeneratingCourses ? '생성 중' : '준비 완료'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealRoadCourseMap;
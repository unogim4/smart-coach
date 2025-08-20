import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  createNavigationRoute, 
  suggestDestinations, 
  createRoundTripRoute,
  ROUTE_TYPES 
} from '../services/navigationService';

function NavigationMap({ userLocation }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const markersRef = useRef([]);
  const routePolylineRef = useRef(null);
  const instructionMarkersRef = useRef([]);
  
  const [startPoint, setStartPoint] = useState(null);
  const [endPoint, setEndPoint] = useState(null);
  const [routeType, setRouteType] = useState('RUNNING');
  const [currentRoute, setCurrentRoute] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isSelectingStart, setIsSelectingStart] = useState(false);
  const [isSelectingEnd, setIsSelectingEnd] = useState(false);

  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation || { lat: 37.5665, lng: 126.9780 },
      zoom: 14,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // DirectionsRenderer 초기화
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: ROUTE_TYPES[routeType].color,
        strokeWeight: 5,
        strokeOpacity: 0.8
      }
    });

    // 지도 클릭 이벤트
    map.addListener('click', (event) => {
      const clickedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };

      if (isSelectingStart) {
        setStartPoint(clickedLocation);
        setIsSelectingStart(false);
        addMarker(clickedLocation, 'start');
      } else if (isSelectingEnd) {
        setEndPoint(clickedLocation);
        setIsSelectingEnd(false);
        addMarker(clickedLocation, 'end');
      }
    });

    // 현재 위치를 시작점으로 설정
    if (userLocation) {
      setStartPoint(userLocation);
      addMarker(userLocation, 'start');
    }

    return () => {
      clearMarkers();
    };
  }, [userLocation, routeType]);

  // 마커 추가
  const addMarker = (location, type) => {
    if (!mapInstanceRef.current) return;

    // 기존 같은 타입 마커 제거
    markersRef.current = markersRef.current.filter(marker => {
      if (marker.type === type) {
        marker.marker.setMap(null);
        return false;
      }
      return true;
    });

    const marker = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: type === 'start' ? '시작점' : '도착점',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: type === 'start' ? '#10B981' : '#EF4444',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 2
      },
      draggable: true
    });

    marker.addListener('dragend', (event) => {
      const newLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      
      if (type === 'start') {
        setStartPoint(newLocation);
      } else {
        setEndPoint(newLocation);
      }
    });

    markersRef.current.push({ marker, type });
  };

  // 모든 마커 제거
  const clearMarkers = () => {
    markersRef.current.forEach(({ marker }) => marker.setMap(null));
    markersRef.current = [];
  };

  // 추천 목적지 로드
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!startPoint) return;
      
      try {
        const places = await suggestDestinations(startPoint, 5000);
        setSuggestions(places);
      } catch (error) {
        console.error('추천 목적지 로드 실패:', error);
      }
    };

    loadSuggestions();
  }, [startPoint]);

  // 경로 생성
  const generateRoute = async () => {
    if (!startPoint || !endPoint) {
      setError('시작점과 도착점을 모두 선택해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const route = await createNavigationRoute(
        startPoint,
        endPoint,
        routeType
      );

      setCurrentRoute(route);
      
      // 경로 표시 처리
      if (mapInstanceRef.current) {
        // 기존 경로 지우기
        if (directionsRendererRef.current) {
          directionsRendererRef.current.setMap(null);
        }
        if (routePolylineRef.current) {
          routePolylineRef.current.setMap(null);
        }
        // 기존 안내 마커 지우기
        instructionMarkersRef.current.forEach(marker => marker.setMap(null));
        instructionMarkersRef.current = [];
        
        // Polyline으로 경로 그리기 (카카오 API나 직선 경로 모두)
        const routePath = new window.google.maps.Polyline({
          path: route.path,
          geodesic: true,
          strokeColor: ROUTE_TYPES[routeType].color,
          strokeOpacity: 0.8,
          strokeWeight: 5
        });
        routePath.setMap(mapInstanceRef.current);
        routePolylineRef.current = routePath;
        
        // 안내 정보가 있으면 마커로 표시
        if (route.instructions && route.instructions.length > 0) {
          route.instructions.forEach((instruction, index) => {
            if (instruction.location) {
              const infoMarker = new window.google.maps.Marker({
                position: instruction.location,
                map: mapInstanceRef.current,
                icon: {
                  path: window.google.maps.SymbolPath.CIRCLE,
                  scale: 3,
                  fillColor: '#3B82F6',
                  fillOpacity: 0.8,
                  strokeColor: '#ffffff',
                  strokeWeight: 1
                },
                title: instruction.text
              });
              instructionMarkersRef.current.push(infoMarker);
            }
          });
        }
      }

      // 지도 범위 조정
      if (mapInstanceRef.current && route.bounds) {
        const bounds = new window.google.maps.LatLngBounds(
          { lat: route.bounds.south, lng: route.bounds.west },
          { lat: route.bounds.north, lng: route.bounds.east }
        );
        mapInstanceRef.current.fitBounds(bounds);
      }

    } catch (error) {
      console.error('경로 생성 실패:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 왕복 경로 생성
  const generateRoundTrip = async () => {
    if (!startPoint || !endPoint) {
      setError('시작점과 도착점을 모두 선택해주세요');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const route = await createRoundTripRoute(
        startPoint,
        endPoint,
        routeType
      );

      setCurrentRoute(route);
      
      // 경로 표시 로직...
      
    } catch (error) {
      console.error('왕복 경로 생성 실패:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 현재 위치 사용
  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setStartPoint(location);
          addMarker(location, 'start');
          
          if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(location);
            mapInstanceRef.current.setZoom(15);
          }
        },
        (error) => {
          console.error('위치 정보 획득 실패:', error);
          setError('현재 위치를 가져올 수 없습니다');
        }
      );
    }
  };

  return (
    <div className="h-full flex">
      {/* 왼쪽 패널: 컨트롤 */}
      <div className="w-96 bg-white shadow-lg overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* 헤더 */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              🧭 네비게이션 경로 설정
            </h2>
            <p className="text-gray-600 text-sm">
              시작점과 도착점을 선택하여 운동 경로를 만들어보세요
            </p>
          </div>

          {/* 운동 타입 선택 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              운동 타입
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(ROUTE_TYPES).map(([key, type]) => (
                <button
                  key={key}
                  onClick={() => setRouteType(key)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    routeType === key
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-2xl mb-1">{type.icon}</div>
                  <div className="text-sm font-medium">{type.label}</div>
                  <div className="text-xs text-gray-500">{type.speed}km/h</div>
                </button>
              ))}
            </div>
          </div>

          {/* 시작점 설정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              시작점
            </label>
            <div className="space-y-2">
              <button
                onClick={useCurrentLocation}
                className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
              >
                <i className="fas fa-location-arrow mr-2"></i>
                현재 위치 사용
              </button>
              <button
                onClick={() => {
                  setIsSelectingStart(true);
                  setIsSelectingEnd(false);
                }}
                className={`w-full p-3 border-2 rounded-lg transition-all ${
                  isSelectingStart
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <i className="fas fa-map-marker-alt mr-2"></i>
                지도에서 선택 {isSelectingStart && '(클릭하세요)'}
              </button>
              {startPoint && (
                <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                  📍 {startPoint.lat.toFixed(6)}, {startPoint.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* 도착점 설정 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              도착점
            </label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsSelectingEnd(true);
                  setIsSelectingStart(false);
                }}
                className={`w-full p-3 border-2 rounded-lg transition-all ${
                  isSelectingEnd
                    ? 'border-red-500 bg-red-50 text-red-700'
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <i className="fas fa-flag-checkered mr-2"></i>
                지도에서 선택 {isSelectingEnd && '(클릭하세요)'}
              </button>
              {endPoint && (
                <div className="p-2 bg-gray-50 rounded text-sm text-gray-600">
                  🏁 {endPoint.lat.toFixed(6)}, {endPoint.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>

          {/* 추천 목적지 */}
          {suggestions.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                추천 목적지
              </label>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {suggestions.slice(0, 5).map((place) => (
                  <button
                    key={place.id}
                    onClick={() => {
                      setEndPoint(place.location);
                      addMarker(place.location, 'end');
                    }}
                    className="w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-xl mr-2">{place.icon}</span>
                          <span className="font-medium text-gray-800">{place.name}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {place.address} • {(place.distance / 1000).toFixed(1)}km
                        </div>
                      </div>
                      {place.rating > 0 && (
                        <div className="text-sm text-yellow-500">
                          ⭐ {place.rating}
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 경로 생성 버튼 */}
          <div className="space-y-2">
            <button
              onClick={generateRoute}
              disabled={!startPoint || !endPoint || isLoading}
              className={`w-full p-4 rounded-lg font-medium transition-all ${
                !startPoint || !endPoint || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
              }`}
            >
              {isLoading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  경로 생성 중...
                </>
              ) : (
                <>
                  <i className="fas fa-route mr-2"></i>
                  편도 경로 생성
                </>
              )}
            </button>
            
            <button
              onClick={generateRoundTrip}
              disabled={!startPoint || !endPoint || isLoading}
              className={`w-full p-4 rounded-lg font-medium transition-all ${
                !startPoint || !endPoint || isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              <i className="fas fa-exchange-alt mr-2"></i>
              왕복 경로 생성
            </button>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center text-red-700">
                <i className="fas fa-exclamation-circle mr-2"></i>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}

          {/* 경로 정보 */}
          {currentRoute && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">
                📊 경로 정보
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">총 거리:</span>
                  <span className="font-medium">
                    {(currentRoute.distance / 1000).toFixed(2)}km
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예상 시간:</span>
                  <span className="font-medium">
                    {currentRoute.exerciseDuration}분
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">예상 칼로리:</span>
                  <span className="font-medium">
                    {Math.round(currentRoute.distance / 1000 * 80)}kcal
                  </span>
                </div>
                {currentRoute.isRoundTrip && (
                  <div className="pt-2 mt-2 border-t border-blue-200">
                    <span className="text-blue-700">
                      <i className="fas fa-info-circle mr-1"></i>
                      왕복 경로
                    </span>
                  </div>
                )}
              </div>
              
              {/* 운동 시작 버튼 */}
              <button 
                onClick={() => navigate('/exercise-tracking', { 
                  state: { 
                    route: currentRoute, 
                    exerciseType: routeType.toLowerCase() 
                  } 
                })}
                className="w-full mt-4 p-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                <i className="fas fa-play mr-2"></i>
                운동 시작하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 오른쪽: 지도 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* 지도 위 인포 박스 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
          <div className="text-sm space-y-1">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>시작점</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
              <span>도착점</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NavigationMap;
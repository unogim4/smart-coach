import React, { useEffect, useRef, useState } from 'react';

function LocationBasedCourseMap({ 
  userLocation, 
  courses, 
  selectedCourse, 
  onCourseSelect,
  showRoute = false 
}) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [routePath, setRoutePath] = useState(null);
  const [userMarker, setUserMarker] = useState(null);

  // Google Maps 초기화
  useEffect(() => {
    if (!userLocation || !window.google) return;

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: userLocation,
      zoom: 14,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      zoomControl: true,
      scaleControl: true
    });

    setMap(mapInstance);

    // 사용자 위치 마커 추가 (기존 방식 유지)
    const userMarkerInstance = new window.google.maps.Marker({
      position: userLocation,
      map: mapInstance,
      title: '내 위치',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 3
      },
      zIndex: 1000
    });

    setUserMarker(userMarkerInstance);

    return () => {
      if (userMarkerInstance) userMarkerInstance.setMap(null);
    };
  }, [userLocation]);

  // 코스 마커 업데이트 (기존 Marker 사용)
  useEffect(() => {
    if (!map || !courses) return;

    // 기존 마커 제거
    markers.forEach(marker => marker.setMap(null));

    // 새 마커 생성 (빨간색 계열로 난이도 표시)
    const newMarkers = courses.map((course, index) => {
      const isSelected = selectedCourse?.id === course.id;
      
      const marker = new window.google.maps.Marker({
        position: course.location,
        map: map,
        title: course.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isSelected ? 15 : 12,
          fillColor: course.difficulty.color, // 빨간색 계열
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        },
        label: {
          text: (index + 1).toString(),
          color: '#FFFFFF',
          fontWeight: 'bold',
          fontSize: '14px'
        },
        animation: isSelected ? window.google.maps.Animation.BOUNCE : null,
        zIndex: isSelected ? 999 : 500
      });

      // 마커 클릭 이벤트
      marker.addListener('click', () => {
        if (onCourseSelect) {
          onCourseSelect(course);
        }
      });

      // 정보창 생성
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 12px; max-width: 280px; font-family: Arial, sans-serif;">
            <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: bold;">
              ${course.icon} ${course.name}
            </h3>
            <div style="margin-bottom: 8px;">
              <span style="background: ${course.difficulty.color}; color: white; padding: 4px 8px; border-radius: 12px; font-size: 12px; font-weight: bold;">
                ${course.difficulty.label}
              </span>
            </div>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
              📍 ${course.vicinity}
            </p>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 8px 0;">
              <div style="text-align: center; background: #f3f4f6; padding: 8px; border-radius: 6px;">
                <div style="font-weight: bold; color: #059669;">${course.estimatedDistance}</div>
                <div style="font-size: 12px; color: #6b7280;">거리</div>
              </div>
              <div style="text-align: center; background: #f3f4f6; padding: 8px; border-radius: 6px;">
                <div style="font-weight: bold; color: #d97706;">${course.estimatedTime}</div>
                <div style="font-size: 12px; color: #6b7280;">시간</div>
              </div>
            </div>
            <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
              ⭐ ${course.rating}/5.0 • 📏 ${Math.round(course.distance)}m 거리
            </p>
            <div style="margin-top: 12px;">
              <button onclick="window.selectCourse('${course.id}')" 
                      style="background: ${course.difficulty.color}; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: bold; width: 100%;">
                코스 선택하기
              </button>
            </div>
          </div>
        `
      });

      // 마커 호버 이벤트
      marker.addListener('mouseover', () => {
        infoWindow.open(map, marker);
      });

      marker.addListener('mouseout', () => {
        if (!isSelected) {
          infoWindow.close();
        }
      });

      // 선택된 코스는 정보창을 계속 표시
      if (isSelected) {
        infoWindow.open(map, marker);
      }

      return marker;
    });

    setMarkers(newMarkers);

    // 전역 함수로 코스 선택 함수 등록
    window.selectCourse = (courseId) => {
      const course = courses.find(c => c.id === courseId);
      if (course && onCourseSelect) {
        onCourseSelect(course);
      }
    };

    // 모든 마커가 보이도록 지도 범위 조정
    if (courses.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      bounds.extend(userLocation);
      courses.forEach(course => bounds.extend(course.location));
      map.fitBounds(bounds);
      
      // 최대 줌 레벨 제한
      const listener = window.google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom() > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    }

    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, courses, selectedCourse, onCourseSelect, userLocation]);

  // 선택된 코스의 경로 표시 (빨간색)
  useEffect(() => {
    if (!map || !selectedCourse || !showRoute || !userLocation) return;

    // 기존 경로 제거
    if (routePath) {
      routePath.setMap(null);
    }

    // 러닝 경로 생성
    const center = selectedCourse.location;
    const radius = 0.002; // 약 200m 반경
    const routeCoordinates = [];

    // 시작점 (사용자 위치)
    routeCoordinates.push(userLocation);

    // 코스 중심점까지의 직선
    const steps = 8;
    for (let i = 1; i <= steps; i++) {
      const progress = i / steps;
      routeCoordinates.push({
        lat: userLocation.lat + (center.lat - userLocation.lat) * progress,
        lng: userLocation.lng + (center.lng - userLocation.lng) * progress
      });
    }

    // 코스 중심점 주변 원형 경로 (러닝 트랙 시뮬레이션)
    const circlePoints = 24;
    for (let i = 0; i <= circlePoints; i++) {
      const angle = (i / circlePoints) * 2 * Math.PI;
      const variationFactor = 0.8 + Math.sin(angle * 3) * 0.3; // 자연스러운 변화
      const lat = center.lat + Math.cos(angle) * radius * variationFactor;
      const lng = center.lng + Math.sin(angle) * radius * variationFactor;
      routeCoordinates.push({ lat, lng });
    }

    // 시작점으로 돌아가는 경로
    for (let i = steps; i >= 1; i--) {
      const progress = i / steps;
      routeCoordinates.push({
        lat: userLocation.lat + (center.lat - userLocation.lat) * progress,
        lng: userLocation.lng + (center.lng - userLocation.lng) * progress
      });
    }

    // 경로 그리기 (빨간색)
    const newRoutePath = new window.google.maps.Polyline({
      path: routeCoordinates,
      geodesic: true,
      strokeColor: selectedCourse.difficulty.color,
      strokeOpacity: 0.8,
      strokeWeight: 4,
      icons: [{
        icon: {
          path: window.google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
          scale: 4,
          strokeColor: selectedCourse.difficulty.color,
          fillColor: selectedCourse.difficulty.color,
          fillOpacity: 1
        },
        repeat: '80px'
      }]
    });

    newRoutePath.setMap(map);
    setRoutePath(newRoutePath);

    // 경로가 모두 보이도록 지도 범위 조정
    const bounds = new window.google.maps.LatLngBounds();
    routeCoordinates.forEach(coord => bounds.extend(coord));
    map.fitBounds(bounds);

    return () => {
      if (newRoutePath) newRoutePath.setMap(null);
    };
  }, [map, selectedCourse, showRoute, userLocation]);

  return (
    <div className="relative w-full">
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-lg border border-gray-300 shadow-lg"
        style={{ minHeight: '400px' }}
      />
      
      {/* 지도 범례 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">범례</h4>
        <div className="flex flex-col space-y-2 text-xs">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
            <span>내 위치</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: '#EF4444'}}></div>
            <span>하 (초급)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: '#F59E0B'}}></div>
            <span>중 (중급)</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 rounded-full mr-2" style={{backgroundColor: '#DC2626'}}></div>
            <span>상 (고급)</span>
          </div>
        </div>
      </div>

      {/* 지도 컨트롤 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2">
        <div className="text-xs text-gray-600">
          📍 1km 반경 내 러닝 코스
        </div>
      </div>

      {/* 로딩 상태 표시 */}
      {(!userLocation || courses?.length === 0) && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-500">
              {!userLocation ? '위치 정보를 가져오는 중...' : '주변 코스를 검색하는 중...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LocationBasedCourseMap;
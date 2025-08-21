import React, { useEffect, useState } from 'react';
import GoogleMap from './GoogleMap';
import { generateRunningRoute } from '../services/locationBasedCourseService';

function LocationBasedCourseMap({ 
  userLocation, 
  courses, 
  selectedCourse, 
  onCourseSelect,
  showRoute = false 
}) {
  const [mapMarkers, setMapMarkers] = useState([]);
  const [polylines, setPolylines] = useState([]);

  useEffect(() => {
    if (courses && courses.length > 0) {
      // 코스 마커들 생성 - waypoints의 중간 지점들도 마커로 표시
      const markers = [];
      
      courses.forEach(course => {
        // 메인 마커 (코스 대표 위치)
        markers.push({
          lat: course.location.lat,
          lng: course.location.lng,
          title: course.name,
          info: `${course.estimatedDistance} • ${course.estimatedTime}`,
          distance: course.estimatedDistance,
          difficulty: course.difficulty,
          onClick: () => onCourseSelect && onCourseSelect(course)
        });
        
        // waypoints가 있으면 추가 마커 표시 (도로 위 지점 확인용)
        if (course.waypoints && course.isSnappedToRoad) {
          // 시작점과 중간 지점에 작은 마커 추가
          course.waypoints.forEach((wp, idx) => {
            if (idx === 0) {
              // 시작점은 이미 사용자 위치로 표시됨
              return;
            }
            if (idx % Math.floor(course.waypoints.length / 3) === 0) {
              // 주요 경유지만 표시
              markers.push({
                lat: wp.lat,
                lng: wp.lng,
                title: `경유지 ${idx}`,
                info: course.name,
                difficulty: { value: 'waypoint', color: '#808080' }, // 회색
                onClick: null
              });
            }
          });
        }
      });

      setMapMarkers(markers);
    }
  }, [courses, onCourseSelect]);

  useEffect(() => {
    // 선택된 코스의 경로 표시
    if (selectedCourse && showRoute) {
      // 이미 waypoints가 도로에 스냅되어 있으므로 그대로 사용
      let routePath;
      
      if (selectedCourse.waypoints && selectedCourse.waypoints.length > 2) {
        // waypoints가 있으면 그대로 사용 (이미 도로에 스냅됨)
        routePath = selectedCourse.waypoints;
        console.log(`📍 도로 스냅된 경로 사용: ${routePath.length}개 포인트`);
      } else {
        // waypoints가 없으면 기본 경로 생성
        routePath = generateRunningRoute(selectedCourse);
      }
      
      // 경로 폴리라인 생성
      const polyline = {
        path: routePath,
        color: selectedCourse.difficulty.color || '#4285F4',
        opacity: 0.8,
        weight: 4
      };
      
      setPolylines([polyline]);
    } else {
      setPolylines([]);
    }
  }, [selectedCourse, showRoute]);

  return (
    <div className="w-full">
      <GoogleMap
        center={userLocation}
        zoom={14}
        height="500px"
        markers={mapMarkers}
        polylines={polylines}
        showUserLocation={true}
      />
      
      {/* 범례 및 정보 */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">지도 범례</h4>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span>현재 위치</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
            <span>초급 코스</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded mr-2"></div>
            <span>중급 코스</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
            <span>고급 코스</span>
          </div>
          {selectedCourse?.isSnappedToRoad && (
            <div className="flex items-center">
              <div className="w-3 h-3 bg-gray-500 rounded mr-2"></div>
              <span>경유지</span>
            </div>
          )}
          {showRoute && selectedCourse && (
            <div className="flex items-center">
              <div className="w-8 h-0.5 mr-2" style={{ backgroundColor: selectedCourse.difficulty.color }}></div>
              <span>러닝 경로</span>
            </div>
          )}
        </div>
        
        {selectedCourse && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>선택된 코스:</strong> {selectedCourse.name}
            </p>
            <div className="mt-2 text-sm text-gray-600">
              <span className="ml-2">거리: {selectedCourse.estimatedDistance}</span>
              <span className="ml-4">예상 시간: {selectedCourse.estimatedTime}</span>
              {selectedCourse.isSnappedToRoad && (
                <span className="ml-4 text-green-600">
                  <i className="fas fa-check-circle"></i> 도로 스냅 적용
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* 사용 안내 */}
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <h5 className="text-xs font-semibold text-blue-800 mb-1">
            <i className="fas fa-info-circle mr-1"></i>
            실제 도로 기반 러닝 코스
          </h5>
          <p className="text-xs text-blue-700">
            모든 경로는 Google Maps의 실제 도로 데이터를 기반으로 생성됩니다.
            경유지는 도로 위의 실제 위치이며, 안전한 보행자 도로를 우선으로 합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LocationBasedCourseMap;
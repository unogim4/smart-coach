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
      // 코스 마커들 생성
      const markers = courses.map(course => ({
        lat: course.location.lat,
        lng: course.location.lng,
        title: course.name,
        info: `${course.estimatedDistance} • ${course.estimatedTime}`,
        distance: course.estimatedDistance,
        difficulty: course.difficulty,
        onClick: () => onCourseSelect && onCourseSelect(course)
      }));

      setMapMarkers(markers);
    }
  }, [courses, onCourseSelect]);

  useEffect(() => {
    // 선택된 코스의 경로 표시
    if (selectedCourse && showRoute) {
      const route = generateRunningRoute(selectedCourse);
      
      // 폴리라인 생성
      const polyline = {
        path: route,
        color: selectedCourse.difficulty.color,
        opacity: 0.7,
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
      
      {/* 범례 */}
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
          {showRoute && selectedCourse && (
            <div className="flex items-center">
              <div className="w-8 h-0.5 bg-blue-500 mr-2"></div>
              <span>러닝 경로</span>
            </div>
          )}
        </div>
        
        {selectedCourse && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              <strong>선택된 코스:</strong> {selectedCourse.name} • 
              <span className="ml-2">거리: {selectedCourse.estimatedDistance}</span> • 
              <span className="ml-2">예상 시간: {selectedCourse.estimatedTime}</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LocationBasedCourseMap;
import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Button, 
  Divider,
  Paper, 
  CircularProgress
} from '@mui/material';
import { recommendCourses } from '../services/recommendationService';
import CourseFilterOptions from './CourseFilterOptions';

function RecommendedCourseMap({ initialPreferences = {} }) {
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [preferences, setPreferences] = useState(initialPreferences);
  
  // 사용자 현재 위치 가져오기
  useEffect(() => {
    // 위치 정보 가져오기 성공 시
    const handleSuccess = (position) => {
      const { latitude, longitude } = position.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setLoading(false);
    };
    
    // 위치 정보 가져오기 실패 시
    const handleError = (error) => {
      setError(`현재 위치를 가져올 수 없습니다: ${error.message}`);
      // 기본 위치로 서울 설정 (실패 시 대체 위치)
      setUserLocation({ lat: 37.5666805, lng: 126.9784147 });
      setLoading(false);
    };
    
    // 브라우저의 geolocation API 사용
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      });
    } else {
      setError("브라우저가 위치 정보를 지원하지 않습니다.");
      setUserLocation({ lat: 37.5666805, lng: 126.9784147 }); // 기본 위치 (서울)
      setLoading(false);
    }
  }, []);

  // 코스 추천 가져오기
  useEffect(() => {
    if (!userLocation) return;
    
    // 사용자 위치 기반으로 코스 추천
    const recommendedCourses = recommendCourses(userLocation, preferences);
    setCourses(recommendedCourses);
    
    // 가장 첫 번째 코스 선택 (가장 가까운 코스)
    if (recommendedCourses.length > 0) {
      setSelectedCourse(recommendedCourses[0]);
    } else {
      setSelectedCourse(null);
    }
  }, [userLocation, preferences]);

  // 네이버 지도 로드 및 초기화
  useEffect(() => {
    if (!userLocation) return;
    
    // 네이버 지도 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=f3clw1exyg`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 지도 생성
      const mapOptions = {
        center: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
        zoom: 14,
        mapTypeControl: true
      };
      
      const newMap = new window.naver.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);
      
      // 현재 위치 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
        map: newMap,
        title: '현재 위치',
        icon: {
          content: '<div style="background-color: rgba(0, 123, 255, 0.8); width: 16px; height: 16px; border-radius: 50%; border: 2px solid white;"></div>',
          anchor: new window.naver.maps.Point(8, 8)
        }
      });
    };
    
    document.head.appendChild(script);
    
    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [userLocation]);

  // 지도에 코스 표시
  useEffect(() => {
    if (!map || !selectedCourse) return;
    
    // 경로 포인트 생성
    const path = selectedCourse.pointsOfInterest.map(
      point => new window.naver.maps.LatLng(point.lat, point.lng)
    );
    
    // 경로 그리기
    const polyline = new window.naver.maps.Polyline({
      map: map,
      path: path,
      strokeColor: '#5347AA',
      strokeWeight: 5,
      strokeOpacity: 0.8
    });
    
    // 코스 시작점 마커
    const startMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(
        selectedCourse.startLocation.lat, 
        selectedCourse.startLocation.lng
      ),
      map: map,
      title: `${selectedCourse.name} 시작점`,
      icon: {
        content: '<div style="padding: 5px; background-color: green; color: white; border-radius: 3px;">시작</div>',
        anchor: new window.naver.maps.Point(20, 10)
      }
    });
    
    // 코스 끝점 마커 (마지막 포인트)
    const lastPoint = selectedCourse.pointsOfInterest[selectedCourse.pointsOfInterest.length - 1];
    const endMarker = new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lastPoint.lat, lastPoint.lng),
      map: map,
      title: `${selectedCourse.name} 종료점`,
      icon: {
        content: '<div style="padding: 5px; background-color: red; color: white; border-radius: 3px;">도착</div>',
        anchor: new window.naver.maps.Point(20, 10)
      }
    });
    
    // 모든 경로가 보이도록 지도 경계 조정
    const bounds = new window.naver.maps.LatLngBounds();
    path.forEach(point => bounds.extend(point));
    map.fitBounds(bounds);
    
    // 컴포넌트 언마운트 또는 선택 코스 변경 시 정리
    return () => {
      polyline.setMap(null);
      startMarker.setMap(null);
      endMarker.setMap(null);
    };
  }, [map, selectedCourse]);

  // 필터 변경 핸들러
  const handleFilterChange = (newPreferences) => {
    setPreferences(newPreferences);
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight="medium" gutterBottom>
          추천 코스 찾기
        </Typography>
        
        {loading ? (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography color="error">{error}</Typography>
          </Box>
        ) : (
          <>
            {/* 필터링 옵션 */}
            <CourseFilterOptions 
              initialPreferences={preferences}
              onFilterChange={handleFilterChange}
            />
            
            <Box sx={{ height: 300, mb: 2, borderRadius: 1, overflow: 'hidden' }} ref={mapRef} />
            
            {courses.length > 0 ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="medium">{selectedCourse?.name}</Typography>
                    <Typography variant="body2" color="textSecondary">{selectedCourse?.description}</Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography variant="body2">거리: {selectedCourse?.distance} km</Typography>
                    <Typography variant="body2">난이도: {selectedCourse?.difficulty}</Typography>
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
                  <Button 
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => window.open(`https://map.naver.com/v5/directions/-/${selectedCourse?.startLocation.lng},${selectedCourse?.startLocation.lat}`, '_blank')}
                    sx={{ flex: 1 }}
                  >
                    길 안내 받기
                  </Button>
                  <Button 
                    variant="contained"
                    color="secondary"
                    size="small"
                    sx={{ flex: 1 }}
                  >
                    코스 저장하기
                  </Button>
                </Box>
                
                {courses.length > 1 && (
                  <Box>
                    <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
                      다른 추천 코스
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {courses.slice(1, 3).map(course => (
                        <Paper 
                          key={course.id} 
                          sx={{ 
                            p: 1.5, 
                            mb: 1, 
                            cursor: 'pointer',
                            '&:hover': { bgcolor: '#f5f5f5' }
                          }}
                          onClick={() => setSelectedCourse(course)}
                          elevation={0}
                          variant="outlined"
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">{course.name}</Typography>
                              <Typography variant="caption" color="textSecondary">난이도: {course.difficulty}</Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="body2">{course.distance} km</Typography>
                              <Typography variant="caption" color="textSecondary">시작점까지 {course.distanceToStart.toFixed(1)} km</Typography>
                            </Box>
                          </Box>
                        </Paper>
                      ))}
                    </Box>
                  </Box>
                )}
              </Box>
            ) : (
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <Typography color="textSecondary">근처에 추천할 코스가 없습니다.</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  필터 옵션을 변경해보세요.
                </Typography>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default RecommendedCourseMap;
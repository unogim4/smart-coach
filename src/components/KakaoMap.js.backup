import React, { useEffect, useRef, useState } from 'react';
import { Typography, Box } from '@mui/material';
import { recommendCourses } from '../services/recommendationService';

function KakaoMap() {
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState({ lat: 37.5666805, lng: 126.9784147 });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    // 카카오맵 스크립트 동적 로드
    const script = document.createElement('script');
    script.async = true;
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_API_KEY&autoload=false`;
    document.head.appendChild(script);

    script.onload = () => {
      window.kakao.maps.load(() => {
        try {
          const container = mapRef.current;
          const options = {
            center: new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng),
            level: 3
          };

          const map = new window.kakao.maps.Map(container, options);

          // 현재 위치 마커
          const markerPosition = new window.kakao.maps.LatLng(userLocation.lat, userLocation.lng);
          const marker = new window.kakao.maps.Marker({
            position: markerPosition
          });
          marker.setMap(map);

          setMapError(false);
        } catch (error) {
          console.error('카카오맵 초기화 오류:', error);
          setMapError(true);
        }
      });
    };

    script.onerror = () => {
      console.error('카카오맵 스크립트 로드 실패');
      setMapError(true);
    };

    // 사용자 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error("위치 가져오기 실패:", error);
        }
      );
    }

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  if (mapError) {
    return (
      <div style={{ 
        width: '100%', 
        height: '300px', 
        borderRadius: '8px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          지도를 로드할 수 없습니다.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          잠시 후 다시 시도해주세요.
        </Typography>
      </div>
    );
  }

  return (
    <div ref={mapRef} style={{ width: '100%', height: '300px', borderRadius: '8px' }} />
  );
}

export default KakaoMap;
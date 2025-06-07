import React, { useEffect, useRef } from 'react';

function NaverMap() {
  const mapRef = useRef(null);
  
  useEffect(() => {
    try {
      console.log('네이버 지도 초기화 시도...');
      // 이미 index.html에 로드된 네이버 지도 API 사용
      if (window.naver && window.naver.maps) {
        // 지도 생성
        const mapOptions = {
          center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
          zoom: 14
        };
        
        const map = new window.naver.maps.Map(mapRef.current, mapOptions);
        
        // 마커 생성
        const marker = new window.naver.maps.Marker({
          position: new window.naver.maps.LatLng(37.5666805, 126.9784147),
          map: map
        });
        
        console.log('네이버 지도 생성 성공');
      } else {
        console.error('네이버 지도 API가 로드되지 않았습니다');
      }
    } catch (error) {
      console.error('네이버 지도 초기화 오류:', error);
    }
  }, []);
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
  );
}

export default NaverMap;
import React, { useEffect, useRef } from 'react';

function NaverMap() {
  const mapRef = useRef(null);
  
  useEffect(() => {
    // 네이버 지도 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${process.env.REACT_APP_NAVER_CLIENT_ID}`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 지도 생성
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
    };
    
    document.head.appendChild(script);
    
    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
  );
}

export default NaverMap;
import React, { useEffect, useRef, useState } from 'react';

function GoogleMap({ 
  center = { lat: 37.5666805, lng: 126.9784147 }, 
  zoom = 14, 
  height = '400px',
  markers = [],
  onMapClick 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  useEffect(() => {
    console.log('GoogleMap 컴포넌트 마운트됨');
    console.log('mapRef.current 초기 상태:', mapRef.current);
    
    // 3초 후에 지도 초기화 (DOM 완전 로딩 대기)
    const timer = setTimeout(() => {
      console.log('3초 후 mapRef.current:', mapRef.current);
      checkAndInitializeMap();
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const checkAndInitializeMap = () => {
    console.log('Google Maps API 확인 시작...');
    
    if (window.google && window.google.maps && mapRef.current) {
      console.log('모든 조건 만족, 지도 초기화 시작');
      initializeMap();
    } else {
      console.log('조건 확인:');
      console.log('- window.google:', !!window.google);
      console.log('- window.google.maps:', !!(window.google && window.google.maps));
      console.log('- mapRef.current:', !!mapRef.current);
      
      if (!mapRef.current) {
        console.error('지도 컨테이너를 찾을 수 없습니다');
        setMapError(true);
        return;
      }
      
      // API가 아직 로드되지 않았다면 재시도
      setTimeout(checkAndInitializeMap, 1000);
    }
  };

  const initializeMap = () => {
    try {
      console.log('지도 초기화 시작...');
      
      // 지도 옵션 설정
      const mapOptions = {
        center: center,
        zoom: zoom,
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP
      };
      console.log('지도 생성 중...', mapOptions);

      // 지도 생성
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      console.log('지도 생성 완료');

      // 지도 로드 완료 이벤트
      map.addListener('idle', () => {
        console.log('지도 로딩 완료');
        setMapLoaded(true);
        setMapError(false);
      });

      // 지도 클릭 이벤트 추가
      if (onMapClick) {
        map.addListener('click', (event) => {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          });
        });
      }

      // 기본 마커 생성 (중심점)
      const defaultMarker = new window.google.maps.Marker({
        position: center,
        map: map,
        title: '현재 위치'
      });

      console.log('기본 마커 생성 완료');

      // 추가 마커들 생성
      updateMarkers(map);

    } catch (error) {
      console.error('지도 초기화 오류:', error);
      setMapError(true);
    }
  };

  const updateMarkers = (map = mapInstanceRef.current) => {
    if (!map) return;

    try {
      // 기존 마커들 제거
      markersRef.current.forEach(marker => {
        marker.setMap(null);
      });
      markersRef.current = [];

      // 새 마커들 생성
      markers.forEach((markerData, index) => {
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: map,
          title: markerData.title || `마커 ${index + 1}`
        });

        // 마커 클릭 이벤트
        if (markerData.onClick) {
          marker.addListener('click', () => markerData.onClick(markerData));
        }

        markersRef.current.push(marker);
      });

      console.log(`${markers.length}개 마커 생성 완료`);
    } catch (error) {
      console.error('마커 업데이트 오류:', error);
    }
  };

  // center나 zoom이 변경될 때 지도 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
    }
  }, [center, zoom, mapLoaded]);

  // 마커가 변경될 때 마커 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && mapLoaded) {
      updateMarkers();
    }
  }, [markers, mapLoaded]);

  if (mapError) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-100 border border-gray-300 rounded-lg"
        style={{ height }}
      >
        <div className="text-center p-4">
          <div className="text-gray-600 mb-2">🗺️</div>
          <div className="text-gray-600 text-sm mb-2">지도를 로드할 수 없습니다</div>
          <div className="text-gray-500 text-xs mb-3">
            Console을 확인해주세요
          </div>
          <button 
            onClick={() => {
              setMapError(false);
              setMapLoaded(false);
              setTimeout(checkAndInitializeMap, 1000);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  if (!mapLoaded) {
    return (
      <div 
        className="flex items-center justify-center bg-gray-50 border border-gray-200 rounded-lg"
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <div className="text-gray-600 text-sm">지도 로딩 중...</div>
          <div className="text-gray-500 text-xs mt-1">Google Maps를 불러오는 중입니다</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm">
      <div 
        ref={mapRef} 
        className="w-full"
        style={{ height }}
      />
    </div>
  );
}

export default GoogleMap;
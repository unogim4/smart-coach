import React, { useEffect, useRef, useState, useCallback } from 'react';
import { isGoogleMapsAPILoaded } from '../utils/googleMapsLoader';

function GoogleMap({ 
  center = { lat: 37.5666805, lng: 126.9784147 }, 
  zoom = 14, 
  height = '400px',
  markers = [],
  polylines = [],
  onMapClick,
  showUserLocation = true 
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const polylinesRef = useRef([]);
  const userMarkerRef = useRef(null);
  const retryCountRef = useRef(0);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [mapError, setMapError] = useState(false);
  const maxRetries = 10;

  const initializeMap = useCallback(() => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.log('지도 초기화 조건 미충족');
      return false;
    }

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
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        styles: [
          {
            featureType: "road",
            elementType: "geometry",
            stylers: [{ visibility: "simplified" }]
          },
          {
            featureType: "road",
            elementType: "labels",
            stylers: [{ visibility: "on" }]
          }
        ]
      };

      // 지도 생성
      const map = new window.google.maps.Map(mapRef.current, mapOptions);
      mapInstanceRef.current = map;

      console.log('✅ 지도 생성 완료');

      // 지도 로드 완료 이벤트
      map.addListener('idle', () => {
        console.log('✅ 지도 완전히 로드됨');
        setMapInitialized(true);
      });

      // 지도 클릭 이벤트
      if (onMapClick) {
        map.addListener('click', (event) => {
          onMapClick({
            lat: event.latLng.lat(),
            lng: event.latLng.lng()
          });
        });
      }

      // 사용자 위치 마커 생성
      if (showUserLocation) {
        createUserLocationMarker(map);
      }

      // 마커들 생성
      updateMarkers(map);
      
      // 폴리라인 생성
      updatePolylines(map);

      return true;
    } catch (error) {
      console.error('❌ 지도 초기화 오류:', error);
      setMapError(true);
      return false;
    }
  }, [center, zoom, onMapClick, showUserLocation]);

  const checkAndInitialize = useCallback(() => {
    retryCountRef.current += 1;
    console.log(`지도 초기화 시도 ${retryCountRef.current}/${maxRetries}`);
    console.log('- Google Maps 로드:', !!window.google?.maps);
    console.log('- mapRef.current:', !!mapRef.current);

    if (retryCountRef.current > maxRetries) {
      console.error('❌ 최대 재시도 횟수 초과');
      setMapError(true);
      return;
    }

    if (!isGoogleMapsAPILoaded()) {
      console.log('⏳ Google Maps API 대기 중...');
      setTimeout(checkAndInitialize, 1000);
      return;
    }

    if (!mapRef.current) {
      console.log('⏳ DOM 요소 대기 중...');
      setTimeout(checkAndInitialize, 500);
      return;
    }

    // 모든 조건 충족 시 지도 초기화
    const success = initializeMap();
    if (!success) {
      console.log('⏳ 초기화 실패, 재시도...');
      setTimeout(checkAndInitialize, 1000);
    }
  }, [initializeMap]);

  // 컴포넌트 마운트 시 초기화 시작
  useEffect(() => {
    console.log('GoogleMap 컴포넌트 마운트');
    retryCountRef.current = 0;
    
    // DOM이 렌더링된 후 초기화 시작
    const timer = setTimeout(() => {
      checkAndInitialize();
    }, 100);

    return () => {
      clearTimeout(timer);
      retryCountRef.current = 0;
    };
  }, [checkAndInitialize]);

  const createUserLocationMarker = (map) => {
    if (!center) return;
    
    // 기존 사용자 마커 제거
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }
    
    // 사용자 위치 마커 (특별한 스타일)
    userMarkerRef.current = new window.google.maps.Marker({
      position: center,
      map: map,
      title: '현재 위치',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#4285F4',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      zIndex: 1000
    });
    
    // 사용자 위치에 파란 원 추가 (반경 표시)
    new window.google.maps.Circle({
      strokeColor: '#4285F4',
      strokeOpacity: 0.3,
      strokeWeight: 1,
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      map: map,
      center: center,
      radius: 100 // 100미터 반경
    });
  };

  const updateMarkers = (map = mapInstanceRef.current) => {
    if (!map) return;

    try {
      // 기존 마커들 제거
      markersRef.current.forEach(marker => {
        if (marker.setMap) marker.setMap(null);
      });
      markersRef.current = [];

      // 새 마커들 생성
      markers.forEach((markerData, index) => {
        // 난이도별 색상 설정
        let markerColor = '#FF0000'; // 기본 빨강
        if (markerData.difficulty) {
          switch(markerData.difficulty.value) {
            case 'easy':
              markerColor = '#10B981'; // 초록
              break;
            case 'medium':
              markerColor = '#F59E0B'; // 주황
              break;
            case 'hard':
              markerColor = '#EF4444'; // 빨강
              break;
            default:
              markerColor = '#FF0000';
          }
        }
        
        // 커스텀 마커 아이콘
        const markerIcon = {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 6,
          fillColor: markerColor,
          fillOpacity: 0.8,
          strokeColor: '#ffffff',
          strokeWeight: 2,
          rotation: 0
        };
        
        const marker = new window.google.maps.Marker({
          position: { lat: markerData.lat, lng: markerData.lng },
          map: map,
          title: markerData.title || `코스 ${index + 1}`,
          icon: markerIcon,
          animation: window.google.maps.Animation.DROP
        });

        // 정보창 생성
        if (markerData.info) {
          const infoWindow = new window.google.maps.InfoWindow({
            content: `
              <div style="padding: 10px; min-width: 200px;">
                <h4 style="margin: 0 0 5px 0; color: #333;">${markerData.title}</h4>
                <p style="margin: 0; color: #666; font-size: 14px;">${markerData.info}</p>
                ${markerData.distance ? `<p style="margin: 5px 0 0 0; color: #888; font-size: 12px;">거리: ${markerData.distance}</p>` : ''}
              </div>
            `
          });
          
          marker.addListener('click', () => {
            // 다른 정보창 닫기
            markersRef.current.forEach(m => {
              if (m.infoWindow) m.infoWindow.close();
            });
            
            infoWindow.open(map, marker);
            
            // 마커 클릭 콜백
            if (markerData.onClick) {
              markerData.onClick(markerData);
            }
          });
          
          marker.infoWindow = infoWindow;
        }

        markersRef.current.push(marker);
      });

      console.log(`✅ ${markers.length}개 마커 생성 완료`);
      
      // 모든 마커가 보이도록 지도 범위 조정
      if (markers.length > 0 && userMarkerRef.current) {
        const bounds = new window.google.maps.LatLngBounds();
        
        // 사용자 위치 포함
        bounds.extend(userMarkerRef.current.getPosition());
        
        // 모든 마커 위치 포함
        markersRef.current.forEach(marker => {
          bounds.extend(marker.getPosition());
        });
        
        // 지도 범위 조정
        map.fitBounds(bounds);
        
        // 너무 확대되지 않도록 제한
        const listener = window.google.maps.event.addListener(map, 'idle', () => {
          if (map.getZoom() > 16) map.setZoom(16);
          window.google.maps.event.removeListener(listener);
        });
      }
      
    } catch (error) {
      console.error('마커 업데이트 오류:', error);
    }
  };

  const updatePolylines = (map = mapInstanceRef.current) => {
    if (!map || !polylines) return;
    
    try {
      // 기존 폴리라인 제거
      polylinesRef.current.forEach(polyline => {
        if (polyline.setMap) polyline.setMap(null);
      });
      polylinesRef.current = [];
      
      // 새 폴리라인 생성
      polylines.forEach((polylineData) => {
        const polyline = new window.google.maps.Polyline({
          path: polylineData.path,
          geodesic: true,
          strokeColor: polylineData.color || '#4285F4',
          strokeOpacity: polylineData.opacity || 0.8,
          strokeWeight: polylineData.weight || 3,
          map: map
        });
        
        polylinesRef.current.push(polyline);
      });
      
      console.log(`✅ ${polylines.length}개 경로 생성 완료`);
    } catch (error) {
      console.error('폴리라인 업데이트 오류:', error);
    }
  };

  // center나 zoom이 변경될 때 지도 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && mapInitialized) {
      mapInstanceRef.current.setCenter(center);
      mapInstanceRef.current.setZoom(zoom);
      
      // 사용자 위치 마커도 업데이트
      if (showUserLocation && userMarkerRef.current) {
        userMarkerRef.current.setPosition(center);
      }
    }
  }, [center, zoom, mapInitialized, showUserLocation]);

  // 마커가 변경될 때 마커 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && mapInitialized) {
      updateMarkers();
    }
  }, [markers, mapInitialized]);
  
  // 폴리라인이 변경될 때 업데이트
  useEffect(() => {
    if (mapInstanceRef.current && mapInitialized) {
      updatePolylines();
    }
  }, [polylines, mapInitialized]);

  // 에러 상태
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
            Google Maps API 로드에 실패했습니다
          </div>
          <button 
            onClick={() => {
              setMapError(false);
              setMapInitialized(false);
              retryCountRef.current = 0;
              setTimeout(checkAndInitialize, 100);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  // 항상 지도 div를 렌더링하되, 초기화 전에는 로딩 오버레이 표시
  return (
    <div className="w-full border border-gray-200 rounded-lg overflow-hidden shadow-sm relative">
      {/* 지도 컨테이너 - 항상 렌더링 */}
      <div 
        ref={mapRef} 
        className="w-full"
        style={{ height }}
      />
      
      {/* 로딩 오버레이 - 초기화 전에만 표시 */}
      {!mapInitialized && !mapError && (
        <div 
          className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90"
          style={{ height }}
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <div className="text-gray-600 text-sm">지도 로딩 중...</div>
            <div className="text-gray-500 text-xs mt-1">
              {retryCountRef.current > 0 && `시도 ${retryCountRef.current}/${maxRetries}`}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GoogleMap;
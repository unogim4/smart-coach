import React, { useEffect, useRef, useState } from 'react';

function SimpleGoogleMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const watchIdRef = useRef(null);
  
  const [mapStatus, setMapStatus] = useState('loading');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [isTrackingLocation, setIsTrackingLocation] = useState(false);

  useEffect(() => {
    console.log('=== 위치 추적 지도 시작 ===');
    
    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API 키가 환경변수에 설정되지 않았습니다');
      setMapStatus('error');
      return;
    }

    // 사용자 위치 요청
    requestUserLocation();

    // 이미 스크립트가 로드되었는지 확인
    if (window.google && window.google.maps) {
      console.log('Google Maps API가 이미 로드되어 있습니다');
      setScriptLoaded(true);
      initializeMap();
      return;
    }

    // 구글 맵 스크립트 동적 로드
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      console.log('Google Maps API 스크립트 로드 완료');
      setScriptLoaded(true);
      setTimeout(initializeMap, 1000);
    };

    script.onerror = () => {
      console.error('Google Maps API 스크립트 로드 실패');
      setMapStatus('error');
    };

    document.head.appendChild(script);

    // 클린업 함수
    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('이 브라우저는 위치 정보를 지원하지 않습니다');
      console.error('Geolocation이 지원되지 않습니다');
      return;
    }

    console.log('사용자 위치 정보 요청 중...');
    setIsTrackingLocation(true);

    // 현재 위치 한 번 가져오기
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        console.log('현재 위치:', newLocation);
        setUserLocation(newLocation);
        setLocationError(null);
        
        // 지도가 이미 초기화되어 있다면 위치 업데이트
        if (mapInstanceRef.current) {
          updateMapLocation(newLocation);
        }
      },
      (error) => {
        console.error('위치 정보 가져오기 실패:', error);
        setIsTrackingLocation(false);
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('위치 정보 접근이 거부되었습니다');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('위치 정보를 사용할 수 없습니다');
            break;
          case error.TIMEOUT:
            setLocationError('위치 정보 요청 시간이 초과되었습니다');
            break;
          default:
            setLocationError('알 수 없는 위치 오류가 발생했습니다');
            break;
        }
        
        // 기본 위치 사용 (서울)
        const defaultLocation = { lat: 37.5665, lng: 126.9780 };
        setUserLocation(defaultLocation);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5분
      }
    );

    // 위치 변경 감지 (실시간 추적)
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newLocation = { lat: latitude, lng: longitude };
        
        console.log('위치 업데이트:', newLocation);
        setUserLocation(newLocation);
        
        if (mapInstanceRef.current) {
          updateMapLocation(newLocation);
        }
      },
      (error) => {
        console.error('위치 추적 오류:', error);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 60000 // 1분
      }
    );
  };

  const updateMapLocation = (location) => {
    if (!mapInstanceRef.current || !window.google) return;

    // 지도 중심 이동
    mapInstanceRef.current.setCenter(location);

    // 기존 사용자 마커 제거
    if (userMarkerRef.current) {
      userMarkerRef.current.setMap(null);
    }

    // 새 사용자 마커 생성
    userMarkerRef.current = new window.google.maps.Marker({
      position: location,
      map: mapInstanceRef.current,
      title: '현재 위치',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        scaledSize: new window.google.maps.Size(32, 32)
      },
      animation: window.google.maps.Animation.DROP
    });

    console.log('지도 위치 업데이트 완료');
  };

  const initializeMap = () => {
    if (!mapRef.current) {
      console.log('mapRef.current가 없습니다');
      return;
    }

    if (window.google && window.google.maps) {
      console.log('Google Maps 초기화 시작');
      
      try {
        // 기본 위치 (사용자 위치가 있으면 사용, 없으면 서울)
        const initialLocation = userLocation || { lat: 37.5665, lng: 126.9780 };

        const map = new window.google.maps.Map(mapRef.current, {
          center: initialLocation,
          zoom: 15,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });
        
        mapInstanceRef.current = map;
        console.log('지도 생성 성공!');
        setMapStatus('success');

        // 사용자 위치가 있으면 마커 생성
        if (userLocation) {
          updateMapLocation(userLocation);
        }

        // 예시 코스 마커들 (한국 주요 도시들)
        const exampleLocations = [
          { lat: 37.5326, lng: 126.9906, title: '한강공원 러닝 코스', type: 'beginner' },
          { lat: 37.5505, lng: 126.9908, title: '남산 순환 코스', type: 'intermediate' },
          { lat: 37.6358, lng: 126.9782, title: '북한산 트레일', type: 'advanced' }
        ];

        exampleLocations.forEach((location) => {
          const color = location.type === 'beginner' ? 'green' : 
                       location.type === 'intermediate' ? 'yellow' : 'red';
          
          new window.google.maps.Marker({
            position: { lat: location.lat, lng: location.lng },
            map: map,
            title: location.title,
            icon: `https://maps.google.com/mapfiles/ms/icons/${color}-dot.png`
          });
        });
        
      } catch (error) {
        console.error('지도 생성 에러:', error);
        setMapStatus('error');
      }
    } else {
      console.log('Google Maps API 아직 로드되지 않음');
      setTimeout(initializeMap, 1000);
    }
  };

  // 사용자 위치가 변경되면 지도 업데이트
  useEffect(() => {
    if (userLocation && mapInstanceRef.current) {
      updateMapLocation(userLocation);
    }
  }, [userLocation]);

  const handleLocationRefresh = () => {
    setLocationError(null);
    setIsTrackingLocation(true);
    requestUserLocation();
  };

  return (
    <div className="w-full border-2 border-blue-500 rounded-lg overflow-hidden bg-white">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-bold text-lg">실시간 위치 추적 지도</h3>
        <p className="text-sm text-gray-600">
          사용자의 실제 위치를 추적하고 주변 코스를 표시합니다
        </p>
        <div className="mt-2 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            상태: {mapStatus === 'loading' ? '로딩 중...' : mapStatus === 'success' ? '성공!' : '에러 발생'}
          </p>
          <button 
            onClick={handleLocationRefresh}
            className="px-3 py-1 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
          >
            위치 새로고침
          </button>
        </div>
      </div>
      
      {/* 지도 컨테이너 */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full"
          style={{ 
            height: '400px',
            backgroundColor: '#f3f4f6'
          }}
        />
        
        {/* 로딩 오버레이 */}
        {mapStatus === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <div className="text-gray-600 text-sm">
                {isTrackingLocation ? '위치 추적 중...' : '지도 로딩 중...'}
              </div>
            </div>
          </div>
        )}
        
        {/* 에러 오버레이 */}
        {mapStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">❌</div>
              <div className="font-medium">지도 로드 실패</div>
              <div className="text-sm mt-1">환경변수 또는 API 키를 확인해주세요</div>
            </div>
          </div>
        )}
        
        {/* 성공 표시 */}
        {mapStatus === 'success' && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-10">
            📍 실시간 위치 추적 활성
          </div>
        )}

        {/* 위치 오류 표시 */}
        {locationError && (
          <div className="absolute bottom-2 left-2 right-2 bg-yellow-100 border border-yellow-400 rounded p-2 text-xs">
            <div className="font-medium text-yellow-800">위치 정보:</div>
            <div className="text-yellow-700">{locationError}</div>
          </div>
        )}
      </div>
      
      {/* 위치 정보 패널 */}
      <div className="p-2 bg-blue-100 text-xs border-t">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="font-medium">📍 현재 위치:</div>
            <div>
              {userLocation ? 
                `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 
                '위치 정보 없음'
              }
            </div>
          </div>
          <div>
            <div className="font-medium">🎯 추적 상태:</div>
            <div className={isTrackingLocation ? 'text-green-600' : 'text-gray-500'}>
              {isTrackingLocation ? '활성' : '비활성'}
            </div>
          </div>
        </div>
        <div className="mt-1 text-gray-600">
          💡 위치 권한을 허용하면 더 정확한 코스를 추천받을 수 있습니다
        </div>
      </div>
    </div>
  );
}

export default SimpleGoogleMap;
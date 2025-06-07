import React, { useEffect, useRef, useState } from 'react';

function SimpleGoogleMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => {
    console.log('=== 구글 맵 테스트 시작 ===');
    
    // 환경변수에서 API 키 가져오기
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API 키가 환경변수에 설정되지 않았습니다');
      setMapStatus('error');
      return;
    }

    console.log('API 키 확인 완료 (보안상 키는 표시하지 않음)');

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
      // 3초 후 지도 초기화 (DOM 완전 로딩 대기)
      setTimeout(initializeMap, 3000);
    };

    script.onerror = () => {
      console.error('Google Maps API 스크립트 로드 실패');
      setMapStatus('error');
    };

    document.head.appendChild(script);

    // 클린업 함수
    return () => {
      // 스크립트는 유지 (다른 컴포넌트에서도 사용할 수 있도록)
    };
  }, []);

  const initializeMap = () => {
    if (!mapRef.current) {
      console.log('mapRef.current가 없습니다');
      return;
    }

    console.log('mapRef.current:', mapRef.current);
    
    if (window.google && window.google.maps) {
      console.log('Google Maps API 로드 완료, 지도 생성 시작');
      
      try {
        // 기존 지도가 있다면 재사용
        if (mapInstanceRef.current) {
          console.log('기존 지도 인스턴스 재사용');
          setMapStatus('success');
          return;
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: 37.5665, lng: 126.9780 },
          zoom: 14,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true
        });
        
        mapInstanceRef.current = map;
        console.log('지도 생성 성공!');
        setMapStatus('success');
        
        // 마커 생성
        new window.google.maps.Marker({
          position: { lat: 37.5665, lng: 126.9780 },
          map: map,
          title: '테스트 마커'
        });
        
        console.log('마커 생성 성공!');
        
      } catch (error) {
        console.error('지도 생성 에러:', error);
        setMapStatus('error');
      }
    } else {
      console.log('Google Maps API 아직 로드되지 않음');
      // 1초 후 재시도
      setTimeout(initializeMap, 1000);
    }
  };

  return (
    <div className="w-full border-2 border-blue-500 rounded-lg overflow-hidden bg-white">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-bold text-lg">구글 맵 (보안 강화 버전)</h3>
        <p className="text-sm text-gray-600">API 키가 환경변수에서 안전하게 로드됩니다</p>
        <p className="text-xs text-gray-500 mt-1">
          상태: {mapStatus === 'loading' ? '로딩 중...' : mapStatus === 'success' ? '성공!' : '에러 발생'}
        </p>
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
                {scriptLoaded ? '지도 초기화 중...' : 'Google Maps API 로드 중...'}
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
            ✅ 보안 로드 완료
          </div>
        )}
      </div>
      
      {/* 보안 정보 */}
      <div className="p-2 bg-green-100 text-xs border-t">
        <div>🔒 API 키: 환경변수에서 안전하게 로드</div>
        <div>🚫 GitHub 노출: 방지됨</div>
        <div>✅ 보안 상태: 안전</div>
      </div>
    </div>
  );
}

export default SimpleGoogleMap;
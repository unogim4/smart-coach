import React, { useEffect, useRef, useState } from 'react';

function SimpleGoogleMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mapStatus, setMapStatus] = useState('loading');

  useEffect(() => {
    console.log('=== 구글 맵 테스트 시작 ===');
    
    // 지도 초기화 함수
    const initializeMap = () => {
      if (!mapRef.current) {
        console.log('mapRef.current가 없습니다');
        return;
      }

      console.log('mapRef.current:', mapRef.current);
      console.log('window.google 존재 여부:', !!window.google);
      
      if (window.google && window.google.maps) {
        console.log('Google Maps API 로드 완료, 지도 생성 시작');
        
        try {
          // 기존 지도가 있다면 제거하지 않고 재사용
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

    // 3초 후에 지도 초기화 시작
    const timer = setTimeout(initializeMap, 3000);

    // 클린업 함수 - DOM 요소는 건드리지 않음
    return () => {
      clearTimeout(timer);
      // mapInstanceRef는 유지 (React가 DOM을 관리하도록 함)
    };
  }, []); // 빈 의존성 배열로 한 번만 실행

  return (
    <div className="w-full border-2 border-blue-500 rounded-lg overflow-hidden bg-white">
      <div className="p-4 bg-gray-100 border-b">
        <h3 className="font-bold text-lg">구글 맵 테스트</h3>
        <p className="text-sm text-gray-600">F12를 눌러 Console을 확인하세요</p>
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
              <div className="text-gray-600 text-sm">지도 준비 중...</div>
            </div>
          </div>
        )}
        
        {/* 에러 오버레이 */}
        {mapStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 bg-opacity-90">
            <div className="text-center text-red-600">
              <div className="text-4xl mb-2">❌</div>
              <div className="font-medium">지도 로드 실패</div>
              <div className="text-sm mt-1">Console을 확인해주세요</div>
            </div>
          </div>
        )}
        
        {/* 성공 표시 */}
        {mapStatus === 'success' && (
          <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs z-10">
            ✅ 지도 로드 완료
          </div>
        )}
      </div>
      
      {/* 디버깅 정보 */}
      <div className="p-2 bg-yellow-100 text-xs border-t">
        <div>지도 상태: {mapStatus}</div>
        <div>API 로드: {window.google ? '완료' : '대기 중'}</div>
        <div>컨테이너: {mapRef.current ? '준비됨' : '대기 중'}</div>
      </div>
    </div>
  );
}

export default SimpleGoogleMap;
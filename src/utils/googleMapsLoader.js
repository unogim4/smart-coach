// Google Maps API 동적 로딩 유틸리티

let isGoogleMapsLoaded = false;
let isLoading = false;
let loadPromise = null;

export const loadGoogleMapsAPI = () => {
  // 이미 로드되었다면 즉시 resolve
  if (isGoogleMapsLoaded) {
    return Promise.resolve();
  }

  // 이미 로딩 중이라면 기존 Promise 반환
  if (isLoading && loadPromise) {
    return loadPromise;
  }

  isLoading = true;
  
  loadPromise = new Promise((resolve, reject) => {
    // API 키 확인
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    
    if (!apiKey) {
      console.error('Google Maps API 키가 설정되지 않았습니다.');
      reject(new Error('Google Maps API 키가 필요합니다'));
      return;
    }

    // 이미 window.google가 있다면 로드된 것으로 간주
    if (window.google && window.google.maps) {
      console.log('Google Maps API가 이미 로드되어 있습니다');
      isGoogleMapsLoaded = true;
      isLoading = false;
      resolve();
      return;
    }

    // 콜백 함수 이름을 유니크하게 생성
    const callbackName = `initGoogleMaps_${Date.now()}`;
    
    // 글로벌 콜백 함수 설정
    window[callbackName] = () => {
      console.log('Google Maps API 로드 완료');
      isGoogleMapsLoaded = true;
      isLoading = false;
      
      // 콜백 함수 정리
      delete window[callbackName];
      
      resolve();
    };

    // 스크립트 태그 생성
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    
    // 에러 처리
    script.onerror = () => {
      console.error('Google Maps API 로드 실패');
      isLoading = false;
      delete window[callbackName];
      reject(new Error('Google Maps API 로드에 실패했습니다'));
    };

    // 스크립트를 head에 추가
    document.head.appendChild(script);
    
    console.log('Google Maps API 로딩 시작...');
  });

  return loadPromise;
};

// Google Maps API 로드 상태 확인
export const isGoogleMapsAPILoaded = () => {
  return isGoogleMapsLoaded && window.google && window.google.maps;
};

// Google Maps API 강제 재로드 (개발용)
export const reloadGoogleMapsAPI = () => {
  isGoogleMapsLoaded = false;
  isLoading = false;
  loadPromise = null;
  
  // 기존 스크립트 태그 제거
  const existingScripts = document.querySelectorAll('script[src*="maps.googleapis.com"]');
  existingScripts.forEach(script => script.remove());
  
  return loadGoogleMapsAPI();
};
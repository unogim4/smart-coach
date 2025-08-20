// 🗺️ 카카오 지도 SDK 동적 로더
// JavaScript API를 통한 지도 서비스

let isKakaoLoaded = false;
let isKakaoLoading = false;
let kakaoLoadPromise = null;

/**
 * 카카오 지도 SDK 로드
 */
export const loadKakaoMapAPI = () => {
  // 이미 로드됨
  if (isKakaoLoaded) {
    return Promise.resolve();
  }

  // 로딩 중
  if (isKakaoLoading && kakaoLoadPromise) {
    return kakaoLoadPromise;
  }

  // 새로 로드
  isKakaoLoading = true;

  kakaoLoadPromise = new Promise((resolve, reject) => {
    const KAKAO_JS_KEY = process.env.REACT_APP_KAKAO_JAVASCRIPT_KEY;
    
    if (!KAKAO_JS_KEY) {
      console.error('❌ 카카오 JavaScript API 키가 설정되지 않았습니다');
      reject(new Error('Kakao API key not found'));
      return;
    }

    // 이미 로드된 경우 체크
    if (window.kakao && window.kakao.maps) {
      console.log('✅ 카카오 지도 SDK 이미 로드됨');
      isKakaoLoaded = true;
      isKakaoLoading = false;
      resolve();
      return;
    }

    // script 태그 생성
    const script = document.createElement('script');
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_JS_KEY}&libraries=services,clusterer,drawing&autoload=false`;
    script.async = true;

    script.onload = () => {
      // kakao.maps.load를 호출해야 실제로 로드됨
      window.kakao.maps.load(() => {
        console.log('✅ 카카오 지도 SDK 로드 완료!');
        isKakaoLoaded = true;
        isKakaoLoading = false;
        resolve();
      });
    };

    script.onerror = (error) => {
      console.error('❌ 카카오 지도 SDK 로드 실패:', error);
      isKakaoLoading = false;
      reject(error);
    };

    document.head.appendChild(script);
  });

  return kakaoLoadPromise;
};

/**
 * 카카오 지도 SDK 로드 상태 확인
 */
export const isKakaoMapLoaded = () => {
  return isKakaoLoaded && window.kakao && window.kakao.maps;
};

/**
 * 카카오 REST API 호출 헬퍼
 * CORS 문제 회피를 위한 프록시 사용
 */
export const callKakaoAPI = async (endpoint, params = {}) => {
  const KAKAO_REST_KEY = process.env.REACT_APP_KAKAO_REST_API_KEY;
  
  if (!KAKAO_REST_KEY) {
    throw new Error('카카오 REST API 키가 설정되지 않았습니다');
  }

  try {
    const response = await fetch(endpoint, {
      method: params.method || 'GET',
      headers: {
        'Authorization': `KakaoAK ${KAKAO_REST_KEY}`,
        ...params.headers
      },
      body: params.body
    });

    if (!response.ok) {
      throw new Error(`카카오 API 오류: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('카카오 API 호출 실패:', error);
    throw error;
  }
};

/**
 * 카카오 로컬 API - 주소 검색
 */
export const searchAddress = async (query) => {
  try {
    const data = await callKakaoAPI(
      `https://dapi.kakao.com/v2/local/search/address.json?query=${encodeURIComponent(query)}`
    );
    return data.documents || [];
  } catch (error) {
    console.error('주소 검색 실패:', error);
    return [];
  }
};

/**
 * 카카오 로컬 API - 키워드 검색
 */
export const searchKeyword = async (query, x, y, radius = 5000) => {
  try {
    let url = `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(query)}`;
    
    if (x && y) {
      url += `&x=${x}&y=${y}&radius=${radius}`;
    }
    
    const data = await callKakaoAPI(url);
    return data.documents || [];
  } catch (error) {
    console.error('키워드 검색 실패:', error);
    return [];
  }
};

/**
 * 카카오 로컬 API - 좌표를 주소로 변환
 */
export const coordToAddress = async (x, y) => {
  try {
    const data = await callKakaoAPI(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${x}&y=${y}`
    );
    return data.documents?.[0] || null;
  } catch (error) {
    console.error('좌표->주소 변환 실패:', error);
    return null;
  }
};

export default loadKakaoMapAPI;
# 🗺️ 한국 지도 API 설정 가이드

실제 도로를 따라가는 네비게이션을 위해 한국 지도 API가 필요합니다.
아래 중 **하나만 선택**하여 설정하면 됩니다.

## 1. 카카오맵 API (추천) ⭐

### 발급 방법:
1. [Kakao Developers](https://developers.kakao.com) 접속
2. 로그인 → 내 애플리케이션 → 애플리케이션 추가하기
3. 앱 이름: "스마트코치" (원하는 이름)
4. 사업자명: 개인 개발자

### API 키 설정:
1. 생성된 앱 클릭 → 앱 키
2. "REST API 키" 복사
3. `.env.local` 파일에 추가:
```
REACT_APP_KAKAO_API_KEY=발급받은_REST_API_키
```

### 플랫폼 설정:
1. 앱 설정 → 플랫폼 → Web 플랫폼 등록
2. 사이트 도메인: `http://localhost:3000` 추가

### API 활성화:
1. 제품 설정 → 카카오모빌리티 → 활성화

---

## 2. T맵 API

### 발급 방법:
1. [SK Open API](https://openapi.sk.com) 접속
2. 회원가입 → 로그인
3. 마이페이지 → 앱 등록
4. T map APIs 선택

### API 키 설정:
1. 발급받은 앱 키 복사
2. `.env.local` 파일에 추가:
```
REACT_APP_TMAP_API_KEY=발급받은_앱키
```

### 사용 제한:
- 일일 10,000건
- 보행자/자전거 경로 지원

---

## 3. 네이버 지도 API

### 발급 방법:
1. [네이버 클라우드 플랫폼](https://www.ncloud.com) 접속
2. 콘솔 → Application → Maps
3. Application 등록

### API 키 설정:
```
REACT_APP_NAVER_CLIENT_ID=발급받은_Client_ID
REACT_APP_NAVER_CLIENT_SECRET=발급받은_Client_Secret
```

---

## ⚠️ 중요 사항

1. **하나만 설정해도 작동합니다** - 모든 API를 설정할 필요 없음
2. **카카오 API 추천** - 한국에 최적화, 무료 할당량 충분
3. **localhost 등록 필수** - 개발 환경에서 테스트 가능하도록

## 🚀 설정 완료 후

1. `.env.local` 파일 저장
2. 서버 재시작:
```bash
npm start
```

3. 네비게이션 모드에서 경로 생성 시 실제 도로 경로 표시

## 📝 테스트

콘솔에서 확인할 메시지:
- "🗺️ 카카오 길찾기 요청"
- "✅ 카카오 경로 생성 성공"
- 실제 도로를 따라가는 경로 표시

---

문의사항이 있으면 언제든 물어보세요!
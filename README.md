# 스마트 러닝 & 바이크 코치

공공 데이터를 활용한 러닝 및 바이크 코스 추천 웹 애플리케이션

## 🔒 보안 설정 (중요!)

### API 키 보안 관리
이 프로젝트는 API 키를 안전하게 관리하기 위해 환경변수를 사용합니다.

1. **절대 API 키를 코드에 직접 입력하지 마세요!**
2. **`.env.local` 파일만 사용하세요** (`.gitignore`에 포함됨)
3. **GitHub에 API 키가 노출되지 않도록 주의하세요**

### 환경변수 설정 방법
```bash
# 1. .env.example을 복사해서 .env.local 생성
cp .env.example .env.local

# 2. .env.local 파일을 열고 실제 API 키 입력
# REACT_APP_GOOGLE_MAPS_API_KEY=여기에_실제_API_키_입력
```

## 주요 기능

### 🗺️ 지도 기능
- **구글 맵 API 연동** - 환경변수를 통한 안전한 API 키 관리
- 동적 스크립트 로딩으로 보안 강화
- 실시간 위치 기반 코스 표시
- 난이도별 마커 표시 (초급자: 녹색, 중급자: 노란색, 고급자: 빨간색)

### 🏃‍♂️ 코스 추천 시스템
- 사용자의 운동 목표와 체력 수준에 맞는 코스 추천
- 날씨 및 대기질 정보 반영
- 거리, 난이도, 지형별 필터링

### 📊 운동 분석
- 실시간 운동 강도 모니터링
- 심박수, 칼로리 소모량, 속도 분석
- AI 기반 운동 피드백

### 🎯 차별화 기능
- **커뮤니티 & 게임화**: 만보기 레이스, 친구와의 경쟁
- **감각적 웰빙**: 음악과 연동된 러닝 경험
- **적응형 난이도**: 실시간 컨디션 기반 코스 조정
- **국토 종단 가이드**: 장거리 여행 지원 시스템

## 기술 스택

### Frontend
- **React 18** - 컴포넌트 기반 UI 개발
- **Tailwind CSS** - 유틸리티 기반 스타일링
- **Material-UI** - UI 컴포넌트 라이브러리

### 지도 & 위치 서비스
- **Google Maps JavaScript API** - 보안 강화된 지도 표시
- **Geolocation API** - 사용자 현재 위치 감지

### 백엔드 & 데이터베이스
- **Firebase** - 사용자 인증 및 실시간 데이터베이스
- **Firestore** - NoSQL 데이터베이스

### 외부 API
- **OpenWeatherMap API** - 날씨 및 대기질 정보
- **공공 데이터 포털** - 자전거 도로 및 시설 정보

## 설치 및 실행

### 1. 프로젝트 클론
```bash
git clone https://github.com/unogim4/smart-coach.git
cd smart-coach
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경변수 설정 (중요!)
```bash
# .env.example을 복사해서 .env.local 생성
cp .env.example .env.local

# .env.local 파일을 열고 실제 API 키 입력
```

`.env.local` 파일 예시:
```env
REACT_APP_FIREBASE_API_KEY=실제_파이어베이스_키
REACT_APP_FIREBASE_AUTH_DOMAIN=프로젝트.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=프로젝트_아이디
REACT_APP_FIREBASE_STORAGE_BUCKET=프로젝트.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=발신자_아이디
REACT_APP_FIREBASE_APP_ID=앱_아이디
REACT_APP_GOOGLE_MAPS_API_KEY=실제_구글맵_키
```

### 4. 개발 서버 실행
```bash
npm start
```

브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 🔑 API 키 발급 방법

### Google Maps API
1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성
3. "Maps JavaScript API" 활성화
4. API 키 생성
5. **HTTP 리퍼러 제한 설정** (보안을 위해 필수):
   - `localhost:3000/*`
   - `*.yourdomainname.com/*` (배포 시)

### Firebase
1. [Firebase Console](https://console.firebase.google.com/) 접속
2. 새 프로젝트 생성
3. 웹 앱 등록
4. 구성 정보 복사

## 보안 체크리스트

- [ ] `.env.local` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] API 키가 코드에 직접 하드코딩되어 있지 않은가?
- [ ] Google Cloud Console에서 API 키에 적절한 제한사항이 설정되어 있는가?
- [ ] 환경변수 파일(`.env.local`)이 GitHub에 업로드되지 않았는가?

## 프로젝트 구조

```
smart-coach/
├── public/
│   ├── index.html          # API 키 제거됨 (보안 강화)
│   └── ...
├── src/
│   ├── components/
│   │   ├── SimpleGoogleMap.js  # 보안 강화된 지도 컴포넌트
│   │   ├── GoogleMap.js    # 고급 지도 컴포넌트
│   │   ├── Header.js       # 헤더 컴포넌트
│   │   └── ...
│   ├── pages/
│   │   ├── Home.js         # 홈페이지
│   │   ├── Courses.js      # 코스 추천 페이지
│   │   ├── Analysis.js     # 운동 분석 페이지
│   │   └── ...
│   ├── services/
│   │   ├── courseService.js    # 코스 관련 서비스
│   │   ├── weatherService.js   # 날씨 서비스
│   │   └── ...
│   └── ...
├── .env.local              # 환경변수 (Git에서 제외, 보안)
├── .env.example            # 환경변수 템플릿
└── ...
```

## 주요 업데이트

### v2.1.0 - 보안 강화 (2025.06.07)
- **중요**: API 키 노출 문제 완전 해결
- 환경변수를 통한 안전한 API 키 관리
- 동적 스크립트 로딩으로 보안 강화
- .env.example 템플릿 제공
- 보안 가이드라인 추가

### v2.0.0 - 구글 맵 전환 (2025.06.07)
- 네이버 지도에서 구글 맵 API로 완전 전환
- 지도 성능 및 안정성 개선
- React와 Google Maps API 호환성 문제 해결
- 마커 시스템 개선 (난이도별 색상 구분)

## ⚠️ 중요 보안 주의사항

1. **절대 API 키를 GitHub에 업로드하지 마세요**
2. **`.env.local` 파일만 사용하세요** (`.env` 파일은 사용하지 마세요)
3. **Google Cloud Console에서 API 키 제한사항을 설정하세요**
4. **정기적으로 API 키를 교체하세요**

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 기여하기

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸쉬하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 생성하세요

## 문의

프로젝트에 대한 문의사항이 있으시면 이슈를 생성해주세요.

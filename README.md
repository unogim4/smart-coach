# 🏃‍♂️ 스마트 러닝 코치

AI 기반 맞춤형 러닝 코스 추천 및 실시간 모니터링 웹 애플리케이션

## 🚀 주요 기능

- 🗺️ **실시간 위치 기반 코스 추천**: Google Maps API 연동
- 🌤️ **실시간 날씨 정보**: OpenWeather API 연동
- 🏃 **운동 모니터링**: 실시간 거리, 속도, 칼로리 추적
- 🤖 **AI 코치 피드백**: 운동 중 실시간 피드백 제공
- 📊 **운동 기록 관리**: Firebase를 통한 데이터 저장

## 🛠️ 기술 스택

- **Frontend**: React 19.1.0
- **Backend**: Firebase 11.6.0
- **Maps**: Google Maps API
- **Weather**: OpenWeather API
- **Styling**: Tailwind CSS
- **Routing**: React Router DOM 7.4.1

## 📋 설치 방법

### 1. 저장소 클론
```bash
git clone https://github.com/unogim4/smart-coach.git
cd smart-coach
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env.local` 파일 생성:

```bash
cp .env.example .env.local
```

`.env.local` 파일을 열고 다음 API 키들을 설정:

```env
# Firebase (필수)
REACT_APP_FIREBASE_API_KEY=your_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN=your_domain_here
REACT_APP_FIREBASE_PROJECT_ID=your_project_id_here
REACT_APP_FIREBASE_STORAGE_BUCKET=your_bucket_here
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
REACT_APP_FIREBASE_APP_ID=your_app_id_here

# Google Maps (필수)
REACT_APP_GOOGLE_MAPS_API_KEY=your_key_here

# OpenWeather (선택 - 없으면 더미 데이터 사용)
REACT_APP_OPENWEATHER_API_KEY=your_key_here
```

### 4. 개발 서버 실행
```bash
npm start
```

브라우저에서 http://localhost:3000 접속

## 🔑 API 키 발급 가이드

### OpenWeather API
1. https://openweathermap.org/api 접속
2. 무료 계정 생성
3. API Keys 메뉴에서 키 복사
4. `.env.local`의 `REACT_APP_OPENWEATHER_API_KEY`에 추가

### Google Maps API
1. https://console.cloud.google.com/ 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. APIs & Services → Library
4. 다음 API 활성화:
   - Maps JavaScript API
   - Places API
   - Geocoding API
   - Roads API (선택)
5. Credentials에서 API 키 생성
6. `.env.local`의 `REACT_APP_GOOGLE_MAPS_API_KEY`에 추가

### Firebase
1. https://console.firebase.google.com/ 접속
2. 프로젝트 생성
3. Project Settings → General
4. Web 앱 추가
5. Firebase SDK 설정 값 복사
6. `.env.local`에 해당 값들 추가

## 🔒 보안 주의사항

⚠️ **중요**: 
- `.env.local` 파일은 절대 GitHub에 커밋하지 마세요
- API 키가 노출되면 즉시 재발급하세요
- 프로덕션 배포 시 환경 변수를 서버에서 관리하세요

## 📱 주요 화면

- **대시보드**: 날씨, 러닝 추천, 목표 설정
- **코스 추천**: 위치 기반 맞춤 러닝 코스
- **실시간 모니터링**: 러닝 중 데이터 추적
- **프로필**: 개인 정보 및 목표 관리

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License

## 👨‍💻 개발자

- GitHub: [@unogim4](https://github.com/unogim4)

## 🆘 문제 해결

### API 키 관련 에러
- 콘솔에서 에러 메시지 확인
- `.env.local` 파일의 키 확인
- 서버 재시작 (`npm start`)

### 지도가 표시되지 않을 때
- Google Maps API 키 확인
- Google Cloud Console에서 API 활성화 확인
- 결제 계정 활성화 확인

### 날씨 정보가 표시되지 않을 때
- OpenWeather API 키 확인
- 콘솔에서 "더미 데이터" 메시지 확인
- API 호출 한도 확인 (무료: 1000회/일)

---

## 🆕 최신 업데이트 (2025년 1월 20일)

### v2.0.0 - 운동 결과 상세 분석 & 더미 데이터
- ✨ **운동 결과 상세 분석**: 4개 탭 (요약, 경로, 구간별, 심박수)
- 📊 **일주일 더미 데이터**: 테스트용 운동 기록 자동 생성
- 🗺️ **실제 서울 코스**: 한강, 남산, 경복궁 등 7개 실제 러닝 코스
- 📈 **구간별 분석**: 500m 단위 속도/심박수/고도 분석
- ❤️ **심박수 Zone**: 5개 구간별 운동 강도 분석
- 💾 **로컬 스토리지**: 브라우저에 데이터 저장

### v1.5.0 - GPS 트래킹 & 네비게이션 (2025년 1월)
- 🏃 **실시간 GPS 트래킹**: 거리, 속도, 칼로리 실시간 측정
- 🗺️ **네비게이션 모드**: 시작점-도착점 경로 생성
- 📊 **통계 대시보드**: 주간/월간 운동 통계
- 🤖 **AI 건강 조언**: 운동 후 맞춤형 피드백

### v1.0.0 - 초기 버전 (2024년 8월)
- 위치 기반 코스 추천
- Google Maps 연동
- Firebase 인증
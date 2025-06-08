# 🏃‍♂️ 스마트 러닝 & 바이크 코치

공공 데이터를 활용한 AI 기반 맞춤형 운동 가이드 웹 애플리케이션

## ✨ 최신 업데이트 (2025.06.08)

### 🗺️ 실제 위치 기반 러닝 코스 추천 시스템
- 사용자의 현재 위치를 기반으로 1km 반경 내 러닝 코스 자동 검색
- Google Maps API를 활용한 실시간 지도 렌더링
- 빨간색 계열 마커로 난이도별 구분 (하/중/상)

### 🎯 주요 기능

#### 1. 위치 기반 코스 추천
- **실시간 위치 감지**: HTML5 Geolocation API 활용
- **다양한 코스 타입**: 공원, 강변, 산책로, 운동장, 학교 트랙
- **난이도별 분류**: 거리 기반 자동 난이도 할당
- **상세 정보 제공**: 예상 거리, 소요 시간, 고도 변화, 평점

#### 2. 인터랙티브 지도
- **Google Maps 연동**: 실시간 지도 표시
- **마커 시스템**: 빨간색 계열로 난이도 구분
- **정보창**: 마커 클릭/호버 시 상세 정보 표시
- **경로 표시**: 선택된 코스의 러닝 경로 시각화

#### 3. 필터링 시스템
- **난이도 필터**: 하(초급)/중(중급)/상(고급)
- **거리 필터**: 500m ~ 2km 반경 조절
- **코스 타입 필터**: 공원, 강변, 산책로 등

#### 4. 안전한 데이터 관리
- **환경변수 보호**: API 키 안전 관리
- **GitHub 보안**: .env.local 파일 자동 제외
- **Fallback 시스템**: API 실패 시 기본 코스 제공

### 🛠️ 기술 스택

- **Frontend**: React 18, Tailwind CSS
- **Maps**: Google Maps JavaScript API
- **Authentication**: Firebase Auth
- **State Management**: React Hooks
- **Build**: Create React App
- **Version Control**: Git & GitHub

### 🗂️ 프로젝트 구조

```
smart-coach/
├── public/
│   ├── index.html              # Google Maps API 로드
│   └── ...
├── src/
│   ├── components/
│   │   ├── LocationBasedCourseMap.js    # 지도 컴포넌트
│   │   ├── Header.js                    # 네비게이션
│   │   └── AuthProvider.js              # 인증 관리
│   ├── pages/
│   │   ├── Dashboard.js                 # 대시보드
│   │   ├── CourseRecommendation.js      # 코스 추천 페이지
│   │   └── ...
│   ├── services/
│   │   ├── locationBasedCourseService.js # 코스 검색 로직
│   │   ├── weatherService.js            # 날씨 시뮬레이션
│   │   └── firebase.js                  # Firebase 설정
│   └── App.js                          # 메인 앱
├── .env.local                          # 환경변수 (보안)
├── .gitignore                          # Git 제외 파일
└── README.md
```

### 🚀 설치 및 실행

1. **저장소 클론**
```bash
git clone https://github.com/yourusername/smart-coach.git
cd smart-coach
```

2. **의존성 설치**
```bash
npm install
```

3. **환경변수 설정**
```bash
# .env.local 파일 생성 후 API 키 설정
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
# ... 기타 Firebase 설정
```

4. **개발 서버 실행**
```bash
npm start
```

5. **브라우저에서 확인**
- http://localhost:3000 접속
- 위치 권한 허용
- 계정 생성/로그인 후 이용

### 📍 사용 방법

1. **로그인**: Firebase 인증으로 계정 생성/로그인
2. **위치 허용**: 브라우저에서 위치 정보 접근 허용
3. **코스 찾기**: Dashboard에서 "코스 찾기" 버튼 클릭
4. **코스 선택**: 지도의 빨간색 마커 클릭으로 코스 선택
5. **경로 확인**: "경로 표시" 체크박스로 러닝 경로 확인
6. **운동 시작**: "코스 시작" 버튼으로 운동 시작

### 🎨 UI/UX 특징

- **반응형 디자인**: 모바일, 태블릿, 데스크톱 최적화
- **직관적 인터페이스**: 쉬운 네비게이션과 명확한 시각적 피드백
- **색상 시스템**: 빨간색 계열로 난이도 구분
- **실시간 피드백**: 로딩 상태 및 에러 처리

### 🔒 보안 및 개인정보

- **API 키 보호**: 환경변수를 통한 안전한 키 관리
- **위치 정보**: 사용자 동의 후에만 접근
- **Firebase 인증**: 안전한 사용자 계정 관리
- **HTTPS**: 모든 API 통신 암호화

### 🐛 문제 해결

#### Google Maps API 관련
- **Marker deprecated 경고**: 정상 작동하며 추후 AdvancedMarkerElement로 업그레이드 예정
- **Places API 제한**: 자체 코스 생성 시스템으로 대체 구현

#### 위치 정보 관련
- **위치 접근 거부**: 서울 기본 좌표로 대체
- **정확도 문제**: enableHighAccuracy 옵션 활성화

### 🚧 개발 예정 기능

- [ ] 실시간 운동 모니터링
- [ ] 심박수 연동 (Apple HealthKit, Google Fit)
- [ ] AI 기반 운동 코치
- [ ] 소셜 기능 (친구 초대, 리더보드)
- [ ] 날씨 API 연동
- [ ] 운동 기록 분석

### 📄 라이선스

MIT License

### 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📞 문의

프로젝트에 대한 문의사항이나 제안사항이 있으시면 Issues를 통해 연락해주세요.

---

**🎉 현재 버전**: v1.0.0 - 위치 기반 코스 추천 시스템  
**🔄 마지막 업데이트**: 2025년 6월 8일
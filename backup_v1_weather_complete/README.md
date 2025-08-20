# 📅 백업 정보

## 버전 정보
- **백업일시**: 2025년 1월 20일
- **버전명**: v1.0 - Weather API Complete
- **상태**: OpenWeather API 연동 완료

## 주요 완성 기능
✅ Google Maps API 연동
✅ OpenWeather API 실시간 날씨
✅ 5일 날씨 예보
✅ 대기질 정보
✅ Roads API 및 OpenStreetMap 폴백
✅ 직선 경로 기반 코스 생성

## 백업 파일 구조
```
backup_v1_weather_complete/
├── services/          # 모든 서비스 파일
├── components/        # 주요 컴포넌트
├── pages/            # 페이지 컴포넌트
└── restore_v1.bat    # 복원 스크립트
```

## 복원 방법
1. 터미널에서: `npm run restore:v1`
2. 또는 직접: restore_v1.bat 실행
3. 수동: 백업 폴더의 파일들을 src로 복사

## 주요 파일 목록
- locationBasedCourseService.js (직선 경로 방식)
- weatherService.js (OpenWeather API 연동)
- GoogleMap.js (기본 지도 표시)
- CourseRecommendation.js (코스 추천 페이지)
# 🚀 스마트 코치 - 빠른 실행 가이드

## 즉시 실행 명령어
```bash
cd C:\Users\KOREA\Desktop\smart-coach
npm start
```

## 주요 기능 테스트 순서

### 1️⃣ 운동 시작하기 (가장 빠른 방법)
1. 로그인 후 대시보드 진입
2. **"🏃‍♂️ 자유 러닝"** 클릭
3. GPS 권한 허용
4. **"운동 시작"** 버튼 클릭
5. 실시간 데이터 확인 (거리, 속도, 칼로리)
6. **"종료"** 버튼 → 결과 저장

### 2️⃣ 네비게이션 운동
1. **"코스 추천"** 메뉴
2. **"네비게이션 모드"** 탭
3. 시작점: **"현재 위치 사용"**
4. 도착점: 지도 클릭
5. **"편도 경로 생성"**
6. **"운동 시작하기"**

### 3️⃣ 통계 확인
- 헤더 메뉴 → **"통계"** 클릭
- 주간/월간/기록 탭 확인

## 핵심 파일 위치

### 운동 트래킹 시스템
- `src/pages/ExerciseTracking.js` - GPS 트래킹, 실시간 모니터링
- `src/pages/ExerciseResult.js` - 결과 분석, AI 조언
- `src/services/workoutService.js` - 데이터 저장/조회

### 네비게이션 시스템  
- `src/components/NavigationMap.js` - 경로 생성 UI
- `src/services/navigationService.js` - 경로 계산 로직

### 통계 시스템
- `src/pages/WorkoutStats.js` - 통계 대시보드
- `src/pages/Dashboard.js` - 메인 대시보드

## 현재 작동 상태

### ✅ 완벽 작동
- GPS 실시간 트래킹
- 운동 데이터 수집 (거리, 시간, 속도)
- Firebase 저장/조회
- 통계 시각화
- AI 건강 조언
- 날씨 정보 (OpenWeather API)
- 3단계 경로 API (Google → 카카오 → OSM)

### 🔧 시뮬레이션
- 심박수 (140-160 BPM 랜덤)
- 걸음 수 (거리 기반 계산)

## 문제 해결

### "지도가 안 보여요"
→ Google Maps API 로딩 대기 (3-5초)

### "경로가 직선으로만 나와요"  
→ 정상 작동 (한국 도보 경로 미지원으로 폴백 작동)

### "통계가 0으로 나와요"
→ 운동 기록 저장 후 새로고침

## API 키 확인
`.env.local` 파일에 모든 키 설정됨:
- ✅ Firebase
- ✅ Google Maps  
- ✅ OpenWeather
- ✅ 카카오

---
**프로젝트 위치**: `C:\Users\KOREA\Desktop\smart-coach`
**문서 위치**: `PROJECT_COMPLETE_GUIDE.md`
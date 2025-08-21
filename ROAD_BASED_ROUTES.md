# 🗺️ 실제 도로 기반 러닝 코스 시스템

## 📍 새로운 기능: Google Directions API 활용

### ✅ 구현 완료
1. **실제 도로를 따라가는 경로**
   - Google Directions API를 사용하여 보행자 도로 우선 경로 생성
   - 도로에 자동으로 스냅되는 마커와 경로

2. **스마트 경로 생성**
   - Geocoding API로 가장 가까운 도로 주소 찾기
   - 사각형 패턴의 순환 코스 자동 생성
   - 각 경유지가 실제 도로 위에 위치

3. **Directions Service 통합**
   - `directionsService.js` - 실제 도로 경로 계산
   - 도보 모드로 안전한 보행자 경로 선택
   - 고속도로 및 유료도로 자동 회피

## 🚀 사용 방법

```bash
cd C:\Users\KOREA\Desktop\smart-coach
npm start
```

### 테스트 순서
1. 코스 추천 페이지로 이동
2. 위치 권한 허용
3. 코스 선택 후 "경로 표시" 체크
4. 실제 도로를 따라가는 파란색 경로 확인

## 📝 주요 파일 변경사항

### 1. `src/services/directionsService.js` (새 파일)
- Google Directions API 통합
- 실제 도로 경로 계산
- 순환 코스 생성 로직

### 2. `src/services/locationBasedCourseService.js`
- Geocoding으로 도로 스냅
- 사각형 패턴 경유지 생성
- 스마트 도로 기반 코스

### 3. `src/components/LocationBasedCourseMap.js`
- Directions API 결과 표시
- 실제 거리/시간 정보
- 도로 스냅 상태 표시

## 🎯 특징

### 도로 스냅 시스템
- 모든 마커가 실제 도로 위에 생성
- Geocoding으로 가장 가까운 도로 주소 찾기
- 보행자 우선 경로 자동 선택

### 순환 코스 패턴
```
시작점 → 첫 번째 경유지 (직진)
      → 두 번째 경유지 (우회전)
      → 세 번째 경유지 (다시 우회전)
      → 시작점으로 복귀
```

## ⚠️ 주의사항

1. **API 할당량**
   - Directions API는 무료 할당량 제한이 있음
   - 월 $200 무료 크레딧 내에서 사용

2. **실패 시 폴백**
   - Directions API 실패 시 자동으로 간단한 경로로 대체
   - 네트워크 오류 시에도 기본 경로 제공

## 🔄 다음 개선 사항

1. **경로 최적화**
   - 다중 경유지 최적화
   - 사용자 선호 경로 학습

2. **실시간 네비게이션**
   - Turn-by-turn 안내
   - 음성 안내 기능

3. **오프라인 지원**
   - 경로 캐싱
   - 오프라인 지도 다운로드
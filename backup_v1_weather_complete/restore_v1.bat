@echo off
echo ========================================
echo  스마트 코치 v1.0 복원 스크립트
echo  (Weather API Complete 버전)
echo ========================================
echo.
echo 복원할 항목:
echo - locationBasedCourseService.js (직선 경로 방식)
echo - 기타 백업된 서비스 파일들
echo.
echo 주의: 현재 작업 내용이 덮어씌워집니다!
echo.
pause

REM 서비스 파일 복원
copy /Y "services\*.backup" "..\src\services\*.js"

echo.
echo ✅ 복원 완료!
echo npm start로 앱을 재시작하세요.
pause
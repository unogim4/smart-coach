import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Box, 
  Card, 
  CardContent, 
  Container, 
  Grid, 
  Typography, 
  Button, 
  Paper,
  LinearProgress,
  Divider
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import DirectionsBikeIcon from '@mui/icons-material/DirectionsBike';
import BarChartIcon from '@mui/icons-material/BarChart';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import AirIcon from '@mui/icons-material/Air';
import { recommendCourses } from '../services/recommendationService';

// 네이버 지도 컴포넌트
function NaverMap() {
  const mapRef = React.useRef(null);
  const [userLocation, setUserLocation] = useState({ lat: 37.5666805, lng: 126.9784147 }); // 기본값: 서울
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courses, setCourses] = useState([]);
  
  useEffect(() => {
    // 사용자 현재 위치 가져오기
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          
          // 위치를 기반으로 코스 추천
          const userPreferences = {
            type: 'running',
            maxDistance: 10,
            maxStartDistance: 5,
            difficulty: 'beginner'
          };
          
          // recommendCourses 함수 호출
          try {
            const recommendedCourses = recommendCourses(location, userPreferences);
            setCourses(recommendedCourses);
            if (recommendedCourses.length > 0) {
              setSelectedCourse(recommendedCourses[0]);
            }
          } catch (error) {
            console.error("코스 추천 중 오류:", error);
          }
        },
        (error) => {
          console.error("현재 위치를 가져올 수 없습니다:", error);
        }
      );
    }
    
    // 네이버 지도 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=f3clw1exyg`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 지도 생성
      const mapOptions = {
        center: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
        zoom: 15
      };
      
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      
      // 현재 위치 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(userLocation.lat, userLocation.lng),
        map: map,
        title: '현재 위치'
      });
      
      // 추천 코스가 있으면 지도에 표시
      if (selectedCourse) {
        try {
          // 경로 포인트 생성
          const path = selectedCourse.pointsOfInterest.map(
            point => new window.naver.maps.LatLng(point.lat, point.lng)
          );
          
          // 경로 그리기
          const polyline = new window.naver.maps.Polyline({
            map: map,
            path: path,
            strokeColor: '#5347AA',
            strokeWeight: 5,
            strokeOpacity: 0.8
          });
          
          // 코스 시작점 마커
          const startMarker = new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(
              selectedCourse.startLocation.lat, 
              selectedCourse.startLocation.lng
            ),
            map: map,
            title: `${selectedCourse.name} 시작점`,
            icon: {
              content: '<div style="padding: 5px; background-color: green; color: white; border-radius: 3px;">시작</div>',
              anchor: new window.naver.maps.Point(20, 10)
            }
          });
          
          // 모든 경로가 보이도록 지도 경계 조정
          const bounds = new window.naver.maps.LatLngBounds();
          path.forEach(point => bounds.extend(point));
          bounds.extend(new window.naver.maps.LatLng(userLocation.lat, userLocation.lng));
          map.fitBounds(bounds);
        } catch (error) {
          console.error("코스 표시 중 오류:", error);
        }
      }
    };
    
    document.head.appendChild(script);
    
    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, [userLocation, selectedCourse]);
  
  return (
    <div>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '300px', 
          borderRadius: '8px'
        }}
      ></div>
      
      {selectedCourse && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            추천 코스: {selectedCourse.name}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {selectedCourse.description}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
            <Typography variant="body2">거리: {selectedCourse.distance}km</Typography>
            <Typography variant="body2">난이도: {selectedCourse.difficulty}</Typography>
          </Box>
          <Button 
            variant="contained" 
            size="small" 
            sx={{ mt: 1 }}
            onClick={() => window.open(`https://map.naver.com/v5/directions/-/${selectedCourse.startLocation.lng},${selectedCourse.startLocation.lat}`, '_blank')}
          >
            길 안내 받기
          </Button>
        </Box>
      )}
    </div>
  );
}

function Home() {
  // 날씨 데이터 (가상)
  const weatherData = {
    temperature: 23,
    condition: 'sunny',
    location: '서울, 대한민국',
    airQuality: '좋음 (45)',
    recommendation: '오늘은 야외 운동하기 좋은 날씨입니다. 자외선 차단제를 바르고 충분한 수분 섭취를 하세요.'
  };

  // 최근 활동 데이터 (가상)
  const recentActivities = [
    { type: '러닝', date: '2025.04.03', distance: 5.2, duration: '30분' },
    { type: '사이클링', date: '2025.04.01', distance: 15.7, duration: '50분' },
    { type: '러닝', date: '2025.03.30', distance: 8.3, duration: '45분' }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* 히어로 섹션 */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          background: 'linear-gradient(to right, #3b82f6, #10b981)',
          color: 'white',
          borderRadius: 2,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          당신만의 스마트 러닝 & 바이크 코치
        </Typography>
        <Typography variant="body1" paragraph sx={{ maxWidth: 600, mx: 'auto', mb: 3 }}>
          개인화된 코스 추천과 실시간 운동 피드백으로 더 효과적인 운동을 경험하세요.
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="secondary"
            component={Link}
            to="/courses"
            sx={{ fontWeight: 'bold' }}
          >
            코스 찾아보기
          </Button>
          <Button
            variant="outlined"
            component={Link}
            to="/analysis"
            sx={{ color: 'white', borderColor: 'white' }}
          >
            내 운동 분석하기
          </Button>
        </Box>
      </Paper>

      <Grid container spacing={4}>
        {/* 왼쪽 컬럼 */}
        <Grid item xs={12} md={8}>
          {/* 날씨 카드 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                오늘의 날씨
              </Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item>
                  <WbSunnyIcon sx={{ fontSize: 40, color: '#f59e0b' }} />
                </Grid>
                <Grid item xs>
                  <Typography variant="h5" fontWeight="bold">
                    {weatherData.temperature}°C
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {weatherData.location}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AirIcon sx={{ mr: 1, color: '#10b981' }} />
                    <Typography variant="body2">
                      대기질: <Box component="span" fontWeight="medium">{weatherData.airQuality}</Box>
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="textSecondary">
                {weatherData.recommendation}
              </Typography>
            </CardContent>
          </Card>

          {/* 네이버 지도 추가 - 개선된 추천 코스 기능으로 수정 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                내 주변 추천 코스
              </Typography>
              <NaverMap />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
                현재 위치를 기반으로 주변 러닝/바이크 코스를 자동으로 추천합니다.
              </Typography>
            </CardContent>
          </Card>

          {/* 추천 & 목표 카드 그리드 */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', bgcolor: '#eff6ff', borderLeft: '4px solid #3b82f6' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight="medium" gutterBottom>
                    오늘의 추천 코스
                  </Typography>
                  <Typography variant="body2" paragraph>
                    한강공원 5km 코스: 날씨가 좋고 대기질이 양호하여 추천합니다.
                  </Typography>
                  <Button size="small" variant="contained" color="primary" component={Link} to="/courses">
                    코스 보기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Card sx={{ height: '100%', bgcolor: '#f0fdf4', borderLeft: '4px solid #10b981' }}>
                <CardContent>
                  <Typography variant="h6" color="secondary" fontWeight="medium" gutterBottom>
                    운동 목표
                  </Typography>
                  <Typography variant="body2" gutterBottom>
                    이번 주 목표: 30km 달성 중 23.2km 완료 (77%)
                  </Typography>
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <LinearProgress 
                      variant="determinate" 
                      value={77} 
                      color="secondary"
                      sx={{ height: 8, borderRadius: 4 }}
                    />
                  </Box>
                  <Button size="small" variant="contained" color="secondary" component={Link} to="/analysis">
                    자세히 보기
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* 주요 기능 소개 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                스마트 러닝 & 바이크 코치의 주요 기능
              </Typography>
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                    <Box
                      sx={{
                        bgcolor: 'primary.light',
                        color: 'primary.main',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <DirectionsRunIcon />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      맞춤 코스 추천
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      운동 목표와 선호도에 맞는 최적의 코스를 추천합니다.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                    <Box
                      sx={{
                        bgcolor: 'secondary.light',
                        color: 'secondary.main',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <BarChartIcon />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      실시간 분석
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      운동 중 실시간으로 페이스와 심박수를 분석하고 피드백을 제공합니다.
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 3, textAlign: 'center', border: '1px solid #e0e0e0' }}>
                    <Box
                      sx={{
                        bgcolor: '#f3e8ff',
                        color: '#9333ea',
                        width: 48,
                        height: 48,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2
                      }}
                    >
                      <DirectionsBikeIcon />
                    </Box>
                    <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                      AI 코치
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      개인의 운동 패턴을 분석하여 맞춤형 트레이닝 플랜을 제공합니다.
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 오른쪽 컬럼 */}
        <Grid item xs={12} md={4}>
          {/* 빠른 시작 카드 */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                빠른 시작
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DirectionsRunIcon />}
                  component={Link}
                  to="/courses"
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                >
                  러닝 코스 찾기
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<DirectionsBikeIcon />}
                  component={Link}
                  to="/courses"
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(to right, #10b981, #34d399)',
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                >
                  바이크 코스 찾기
                </Button>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<BarChartIcon />}
                  component={Link}
                  to="/analysis"
                  sx={{
                    py: 1.5,
                    background: 'linear-gradient(to right, #8b5cf6, #a78bfa)',
                    color: 'white',
                    fontWeight: 'medium'
                  }}
                >
                  운동 분석 보기
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* 최근 활동 카드 */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom fontWeight="medium">
                최근 활동
              </Typography>
              {recentActivities.length > 0 ? (
                <Box>
                  {recentActivities.map((activity, index) => (
                    <React.Fragment key={index}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 2 }}>
                        <Box>
                          <Typography variant="subtitle2">{activity.type}</Typography>
                          <Typography variant="body2" color="textSecondary">{activity.date}</Typography>
                        </Box>
                        <Box textAlign="right">
                          <Typography variant="subtitle2">{activity.distance} km</Typography>
                          <Typography variant="body2" color="textSecondary">{activity.duration}</Typography>
                        </Box>
                      </Box>
                      {index < recentActivities.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </Box>
              ) : (
                <Box sx={{ py: 4, textAlign: 'center' }}>
                  <Typography color="textSecondary">아직 기록된 활동이 없습니다.</Typography>
                </Box>
              )}
              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button color="primary" component={Link} to="/analysis">
                  모든 활동 보기
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Home;
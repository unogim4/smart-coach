import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../components/AuthProvider';
import {
  Container,
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Button,
  Divider,
  Paper
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import AirIcon from '@mui/icons-material/Air';
import SpeedIcon from '@mui/icons-material/Speed';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

function WorkoutDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [workout, setWorkout] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!currentUser || !id) return;
      
      try {
        const docRef = doc(db, 'activities', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setWorkout({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        console.error('운동 데이터 불러오기 오류:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkout();
  }, [currentUser, id]);

  // 심박수 차트 렌더링
  const renderHeartRateChart = () => {
    if (!workout?.heartRateData) return null;
    
    const data = workout.heartRateData;
    const max = Math.max(...data) + 10;
    const min = Math.min(...data) - 10;
    const range = max - min;
    
    return (
      <div className="relative h-64">
        <svg className="w-full h-full">
          {/* 배경 그리드 */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* 심박수 라인 */}
          <polyline
            points={data.map((hr, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((max - hr) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 데이터 포인트 */}
          {data.map((hr, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((max - hr) / range) * 100;
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#ef4444"
                />
                <text
                  x={`${x}%`}
                  y={`${y - 2}%`}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {hr}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 -ml-10 h-full flex flex-col justify-between text-xs text-gray-600">
          <span>{max}</span>
          <span>{Math.round((max + min) / 2)}</span>
          <span>{min}</span>
        </div>
        
        {/* X축 레이블 */}
        <div className="absolute bottom-0 left-0 -mb-6 w-full flex justify-between text-xs text-gray-600">
          <span>0분</span>
          <span>{Math.round(data.length / 2)}분</span>
          <span>{data.length}분</span>
        </div>
      </div>
    );
  };

  // 호흡수 차트 렌더링
  const renderRespiratoryChart = () => {
    if (!workout?.respiratoryRateData) return null;
    
    const data = workout.respiratoryRateData;
    const max = Math.max(...data) + 5;
    const min = Math.min(...data) - 5;
    const range = max - min;
    
    return (
      <div className="relative h-64">
        <svg className="w-full h-full">
          {/* 배경 그리드 */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={`${percent}%`}
              x2="100%"
              y2={`${percent}%`}
              stroke="#e0e0e0"
              strokeWidth="1"
            />
          ))}
          
          {/* 호흡수 라인 */}
          <polyline
            points={data.map((rr, index) => {
              const x = (index / (data.length - 1)) * 100;
              const y = ((max - rr) / range) * 100;
              return `${x}%,${y}%`;
            }).join(' ')}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* 데이터 포인트 */}
          {data.map((rr, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = ((max - rr) / range) * 100;
            return (
              <g key={index}>
                <circle
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#3b82f6"
                />
                <text
                  x={`${x}%`}
                  y={`${y - 2}%`}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#666"
                >
                  {rr}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Y축 레이블 */}
        <div className="absolute left-0 top-0 -ml-10 h-full flex flex-col justify-between text-xs text-gray-600">
          <span>{max}</span>
          <span>{Math.round((max + min) / 2)}</span>
          <span>{min}</span>
        </div>
        
        {/* X축 레이블 */}
        <div className="absolute bottom-0 left-0 -mb-6 w-full flex justify-between text-xs text-gray-600">
          <span>0분</span>
          <span>{Math.round(data.length / 2)}분</span>
          <span>{data.length}분</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>로딩 중...</Typography>
      </Container>
    );
  }

  if (!workout) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>운동 데이터를 찾을 수 없습니다.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/profile')}
        sx={{ mb: 2 }}
      >
        프로필로 돌아가기
      </Button>

      <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {workout.type} 운동 상세 기록
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          {workout.startTime?.toDate ? workout.startTime.toDate().toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          }) : '날짜 정보 없음'}
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* 운동 요약 통계 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                운동 요약
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#fee2e2' }}>
                    <FavoriteIcon sx={{ color: '#ef4444', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ mt: 1, color: '#ef4444' }}>
                      {workout.avgHeartRate} BPM
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      평균 심박수
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#dbeafe' }}>
                    <AirIcon sx={{ color: '#3b82f6', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ mt: 1, color: '#3b82f6' }}>
                      {workout.avgRespiratoryRate} 회/분
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      평균 호흡수
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#d1fae5' }}>
                    <SpeedIcon sx={{ color: '#10b981', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ mt: 1, color: '#10b981' }}>
                      {workout.distance} km
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      총 거리
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Paper elevation={0} sx={{ p: 2, textAlign: 'center', bgcolor: '#fef3c7' }}>
                    <LocalFireDepartmentIcon sx={{ color: '#f59e0b', fontSize: 32 }} />
                    <Typography variant="h5" sx={{ mt: 1, color: '#f59e0b' }}>
                      {workout.calories} kcal
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      소모 칼로리
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* 심박수 차트 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                심박수 변화
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      최저 심박수
                    </Typography>
                    <Typography variant="h6">
                      {workout.minHeartRate} BPM
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      평균 심박수
                    </Typography>
                    <Typography variant="h6">
                      {workout.avgHeartRate} BPM
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      최고 심박수
                    </Typography>
                    <Typography variant="h6">
                      {workout.maxHeartRate} BPM
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 4, mb: 8 }}>
                {renderHeartRateChart()}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 호흡수 차트 */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                호흡수 변화
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      평균 호흡수
                    </Typography>
                    <Typography variant="h6">
                      {workout.avgRespiratoryRate} 회/분
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      운동 시간
                    </Typography>
                    <Typography variant="h6">
                      {workout.duration}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mt: 4, mb: 8 }}>
                {renderRespiratoryChart()}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 추가 정보 */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                추가 정보
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    운동 경로
                  </Typography>
                  <Typography variant="body1">
                    {workout.route || '경로 정보 없음'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    평균 속도
                  </Typography>
                  <Typography variant="body1">
                    {workout.avgSpeed} km/h
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    걸음 수
                  </Typography>
                  <Typography variant="body1">
                    {workout.steps} 보
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    운동 시작 시간
                  </Typography>
                  <Typography variant="body1">
                    {workout.startTime?.toDate ? workout.startTime.toDate().toLocaleTimeString('ko-KR') : '시간 정보 없음'}
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default WorkoutDetail;
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileForm';
import ActivitySummary from '../components/ActivitySummary';
import { useAuth } from '../components/AuthProvider';
import { getUserProfile, saveUserProfile, getUserActivities } from '../services/userService';
import { 
  Container, 
  Grid, 
  Paper, 
  Typography, 
  Box,
  LinearProgress,
  Chip
} from '@mui/material';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import TimerIcon from '@mui/icons-material/Timer';
import FavoriteIcon from '@mui/icons-material/Favorite';

function Profile() {
  const { currentUser, isAuthenticated } = useAuth();
  const [userData, setUserData] = useState(null);
  const [activities, setActivities] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // 프로필 데이터 로드
  useEffect(() => {
    const loadUserData = async () => {
      if (currentUser) {
        try {
          const profile = await getUserProfile(currentUser.uid);
          setUserData(profile);
          
          // 활동 내역 불러오기
          const userActivities = await getUserActivities(currentUser.uid);
          
          // 활동이 있을 경우만 데이터 처리
          if (userActivities && userActivities.length > 0) {
            const totalDistance = userActivities.reduce((sum, act) => sum + (act.distance || 0), 0);
            const totalDuration = '계산 필요'; // 복잡한 계산이 필요함
            const totalCalories = userActivities.reduce((sum, act) => sum + (act.calories || 0), 0);
            
            setActivities({
              totalWorkouts: userActivities.length,
              totalDistance: totalDistance.toFixed(1),
              totalDuration,
              totalCalories: Math.round(totalCalories),
              recent: userActivities.map(act => ({
                id: act.id,  // ID 추가
                date: act.createdAt?.toDate ? act.createdAt.toDate().toLocaleDateString() : '날짜 없음',
                type: act.type || '알 수 없음',
                distance: act.distance || 0,
                duration: act.duration || '0분'
              }))
            });
          } else {
            // 활동 내역이 없을 경우 기본값 설정
            setActivities({
              totalWorkouts: 0,
              totalDistance: '0',
              totalDuration: '0분',
              totalCalories: 0,
              recent: []
            });
          }
        } catch (error) {
          console.error('데이터 로드 오류:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    
    loadUserData();
  }, [currentUser]);
  
  // 프로필 저장
  const handleProfileSave = async (formData) => {
    try {
      await saveUserProfile(currentUser.uid, formData);
      setUserData(formData);
      alert('프로필이 저장되었습니다!');
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    }
  };

  // 미인증 시 로그인 페이지로 리디렉션
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div>로딩 중...</div>;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        내 프로필
      </Typography>
      
      {/* 운동 통계 개요 */}
      {activities && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#fee2e2' }}>
              <DirectionsRunIcon sx={{ fontSize: 40, color: '#ef4444', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#ef4444', fontWeight: 'bold' }}>
                {activities.totalWorkouts}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 운동 횟수
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#d1fae5' }}>
              <DirectionsRunIcon sx={{ fontSize: 40, color: '#10b981', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#10b981', fontWeight: 'bold' }}>
                {activities.totalDistance} km
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 거리
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#e0e7ff' }}>
              <TimerIcon sx={{ fontSize: 40, color: '#6366f1', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#6366f1', fontWeight: 'bold' }}>
                {activities.totalDuration}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 시간
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Paper elevation={2} sx={{ p: 3, textAlign: 'center', bgcolor: '#fef3c7' }}>
              <LocalFireDepartmentIcon sx={{ fontSize: 40, color: '#f59e0b', mb: 1 }} />
              <Typography variant="h4" sx={{ color: '#f59e0b', fontWeight: 'bold' }}>
                {activities.totalCalories} kcal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                총 칼로리
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <ProfileForm 
            initialData={userData} 
            onSave={handleProfileSave} 
          />
        </Grid>
        
        <Grid item xs={12} md={6}>
          {activities && (
            <ActivitySummary activities={activities} />
          )}
        </Grid>
      </Grid>
    </Container>
  );
}

export default Profile;
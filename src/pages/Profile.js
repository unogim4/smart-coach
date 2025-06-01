import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import ProfileForm from '../components/ProfileForm';
import ActivitySummary from '../components/ActivitySummary';
import { useAuth } from '../components/AuthProvider';
import { getUserProfile, saveUserProfile, getUserActivities } from '../services/userService';

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
    <div>
      <h2 className="text-2xl font-bold mb-6">프로필</h2>
      
      <div className="grid grid-cols-1 gap-6">
        <ProfileForm 
          initialData={userData} 
          onSave={handleProfileSave} 
        />
        
        {activities && (
          <ActivitySummary activities={activities} />
        )}
      </div>
    </div>
  );
}

export default Profile;
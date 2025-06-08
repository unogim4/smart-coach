import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/AuthProvider';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

function Profile() {
  const { currentUser } = useAuth();
  const [userProfile, setUserProfile] = useState({
    name: '',
    email: '',
    age: '',
    height: '',
    weight: '',
    fitnessLevel: 'beginner',
    goals: [],
    weeklyTarget: 5
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ ...userProfile });
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);

  // 사용자 프로필 데이터 로드
  useEffect(() => {
    const loadUserProfile = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserProfile({
              name: userData.displayName || '',
              email: userData.email || currentUser.email,
              age: userData.age || '',
              height: userData.height || '',
              weight: userData.weight || '',
              fitnessLevel: userData.fitnessLevel || 'beginner',
              goals: userData.goals || [],
              weeklyTarget: userData.weeklyTarget || 5
            });
            setEditForm({
              name: userData.displayName || '',
              email: userData.email || currentUser.email,
              age: userData.age || '',
              height: userData.height || '',
              weight: userData.weight || '',
              fitnessLevel: userData.fitnessLevel || 'beginner',
              goals: userData.goals || [],
              weeklyTarget: userData.weeklyTarget || 5
            });
          }
        } catch (error) {
          console.error('프로필 로드 오류:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [currentUser]);

  const handleSaveProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, 'users', currentUser.uid), {
        displayName: editForm.name,
        age: editForm.age,
        height: editForm.height,
        weight: editForm.weight,
        fitnessLevel: editForm.fitnessLevel,
        goals: editForm.goals,
        weeklyTarget: editForm.weeklyTarget,
        updatedAt: new Date().toISOString()
      });
      
      setUserProfile({ ...editForm });
      setIsEditing(false);
      alert('프로필이 성공적으로 업데이트되었습니다!');
    } catch (error) {
      console.error('프로필 저장 오류:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditForm({ ...userProfile });
    setIsEditing(false);
  };

  // BMI 계산
  const calculateBMI = () => {
    if (!userProfile.height || !userProfile.weight) return 0;
    const heightInM = userProfile.height / 100;
    const bmi = userProfile.weight / (heightInM * heightInM);
    return bmi.toFixed(1);
  };

  // BMI 상태 판정
  const getBMIStatus = (bmi) => {
    if (bmi < 18.5) return { status: '저체중', color: 'text-blue-500' };
    if (bmi < 25) return { status: '정상', color: 'text-green-500' };
    if (bmi < 30) return { status: '과체중', color: 'text-yellow-500' };
    return { status: '비만', color: 'text-red-500' };
  };

  const bmi = calculateBMI();
  const bmiStatus = getBMIStatus(parseFloat(bmi));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-blue-500 mb-4"></i>
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">프로필</h2>
        <p className="text-gray-600">개인 정보와 운동 설정을 관리하세요.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'profile'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-user mr-2"></i>
              개인정보
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'settings'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <i className="fas fa-cog mr-2"></i>
              설정
            </button>
          </nav>
        </div>

        {/* 개인정보 탭 */}
        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 기본 정보 */}
              <div className="lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-800">기본 정보</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <i className="fas fa-edit mr-2"></i>
                      수정
                    </button>
                  ) : (
                    <div className="space-x-2">
                      <button
                        onClick={handleSaveProfile}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                        disabled={loading}
                      >
                        <i className="fas fa-save mr-2"></i>
                        {loading ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        취소
                      </button>
                    </div>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="이름을 입력하세요"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                        <input
                          type="email"
                          value={editForm.email}
                          className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">이메일은 변경할 수 없습니다</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">나이</label>
                        <input
                          type="number"
                          value={editForm.age}
                          onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="나이"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">신장 (cm)</label>
                        <input
                          type="number"
                          value={editForm.height}
                          onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="신장 (cm)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">체중 (kg)</label>
                        <input
                          type="number"
                          value={editForm.weight}
                          onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="체중 (kg)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">운동 수준</label>
                        <select
                          value={editForm.fitnessLevel}
                          onChange={(e) => setEditForm({ ...editForm, fitnessLevel: e.target.value })}
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="beginner">초급자</option>
                          <option value="intermediate">중급자</option>
                          <option value="advanced">고급자</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">이름:</span>
                          <span className="font-semibold">{userProfile.name || '미설정'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">이메일:</span>
                          <span className="font-semibold">{userProfile.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">나이:</span>
                          <span className="font-semibold">{userProfile.age ? `${userProfile.age}세` : '미설정'}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-4">
                        <div className="flex justify-between">
                          <span className="text-gray-600">신장:</span>
                          <span className="font-semibold">{userProfile.height ? `${userProfile.height}cm` : '미설정'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">체중:</span>
                          <span className="font-semibold">{userProfile.weight ? `${userProfile.weight}kg` : '미설정'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">운동 수준:</span>
                          <span className="font-semibold">
                            {userProfile.fitnessLevel === 'beginner' ? '초급자' :
                             userProfile.fitnessLevel === 'intermediate' ? '중급자' : '고급자'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 건강 지표 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-6">건강 지표</h3>
                <div className="space-y-4">
                  {userProfile.height && userProfile.weight ? (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">{bmi}</div>
                        <div className="text-gray-600 text-sm">BMI</div>
                        <div className={`text-sm font-medium mt-1 ${bmiStatus.color}`}>
                          {bmiStatus.status}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <div className="text-gray-500">
                        <i className="fas fa-info-circle text-2xl mb-2"></i>
                        <p className="text-sm">신장과 체중을 입력하면<br/>BMI를 확인할 수 있습니다</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-semibold text-gray-800 mb-3">계정 정보</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">가입일:</span>
                        <span className="font-semibold">
                          {currentUser?.metadata?.creationTime ? 
                            new Date(currentUser.metadata.creationTime).toLocaleDateString('ko-KR') : 
                            '정보 없음'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">마지막 로그인:</span>
                        <span className="font-semibold">
                          {currentUser?.metadata?.lastSignInTime ? 
                            new Date(currentUser.metadata.lastSignInTime).toLocaleDateString('ko-KR') : 
                            '정보 없음'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 설정 탭 */}
        {activeTab === 'settings' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">설정</h3>
            
            <div className="space-y-6">
              {/* 알림 설정 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-4">알림 설정</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">운동 리마인더</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">목표 달성 알림</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">날씨 알림</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
              
              {/* 단위 설정 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-4">단위 설정</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">거리 단위</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="km">킬로미터 (km)</option>
                      <option value="mile">마일 (mile)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">체중 단위</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                      <option value="kg">킬로그램 (kg)</option>
                      <option value="lb">파운드 (lb)</option>
                    </select>
                  </div>
                </div>
              </div>
              
              {/* 개인정보 보호 */}
              <div>
                <h4 className="font-medium text-gray-800 mb-4">개인정보 보호</h4>
                <div className="space-y-3">
                  <button className="w-full text-left p-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors">
                    <i className="fas fa-download mr-2"></i>
                    내 데이터 다운로드
                  </button>
                  <button className="w-full text-left p-3 bg-yellow-50 hover:bg-yellow-100 text-yellow-700 rounded-lg transition-colors">
                    <i className="fas fa-key mr-2"></i>
                    비밀번호 변경
                  </button>
                  <button className="w-full text-left p-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors">
                    <i className="fas fa-user-times mr-2"></i>
                    계정 삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
import React from 'react';
import { useAuth } from './AuthProvider';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

function Header({ currentScreen, changeScreen }) {
  const { currentUser } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: '대시보드', icon: 'fas fa-home', path: '/dashboard' },
    { id: 'courses', label: '코스 추천', icon: 'fas fa-route', path: '/courses' },
    { id: 'monitoring', label: '실시간 모니터링', icon: 'fas fa-heartbeat', path: '/monitoring' },
    { id: 'weather', label: '날씨 정보', icon: 'fas fa-cloud-sun', path: '/weather' },
    { id: 'profile', label: '프로필', icon: 'fas fa-user', path: '/profile' }
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };

  const handleMenuClick = (itemId) => {
    changeScreen(itemId);
    // React Router를 사용하는 경우 history.push를 사용할 수 있지만
    // 현재는 state로 화면을 관리하므로 changeScreen만 사용
  };

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* 로고 */}
          <div className="flex items-center">
            <i className="fas fa-running text-2xl mr-3"></i>
            <h1 className="text-2xl font-bold">스마트 러닝 & 바이크 코치</h1>
          </div>

          {/* 네비게이션 메뉴 */}
          <nav className="hidden md:flex space-x-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`px-4 py-2 rounded-lg transition-all duration-200 flex items-center ${
                  currentScreen === item.id
                    ? 'bg-blue-800 text-white shadow-lg'
                    : 'hover:bg-blue-500 text-blue-100'
                }`}
              >
                <i className={`${item.icon} mr-2`}></i>
                <span className="hidden lg:inline">{item.label}</span>
              </button>
            ))}
          </nav>

          {/* 사용자 정보 및 로그아웃 */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center text-sm">
              <i className="fas fa-user-circle mr-2"></i>
              <span>{currentUser?.email || 'User'}</span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg transition-colors text-sm"
            >
              <i className="fas fa-sign-out-alt mr-1"></i>
              <span className="hidden sm:inline">로그아웃</span>
            </button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <button className="md:hidden text-white">
            <i className="fas fa-bars text-xl"></i>
          </button>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden bg-blue-700 px-4 py-2">
        <div className="flex overflow-x-auto space-x-2 scrollbar-hide">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMenuClick(item.id)}
              className={`px-3 py-2 rounded-lg whitespace-nowrap flex items-center ${
                currentScreen === item.id
                  ? 'bg-blue-800 text-white'
                  : 'hover:bg-blue-600 text-blue-200'
              }`}
            >
              <i className={`${item.icon} mr-1 text-sm`}></i>
              <span className="text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
}

export default Header;
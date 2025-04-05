import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthProvider';

function Header() {
  const { currentUser, isAuthenticated } = useAuth();
  
  return (
    <header className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">스마트 러닝 & 바이크 코치</Link>
        
        <div>
          {isAuthenticated ? (
            <div className="flex items-center">
              <span className="mr-2">{currentUser.email}</span>
              <Link to="/profile" className="bg-white text-blue-600 px-4 py-2 rounded">
                프로필
              </Link>
            </div>
          ) : (
            <Link to="/login" className="bg-white text-blue-600 px-4 py-2 rounded">
              로그인
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
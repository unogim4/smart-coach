import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';

function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    try {
      if (isLogin) {
        // 로그인
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 회원가입
        await createUserWithEmailAndPassword(auth, email, password);
      }
      
      // 폼 초기화
      setEmail('');
      setPassword('');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">
        {isLogin ? '로그인' : '회원가입'}
      </h3>
      
      <form onSubmit={handleAuth}>
        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">이메일</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-2 rounded" 
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">비밀번호</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-2 rounded" 
            required
          />
        </div>
        
        <button 
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button 
          className="text-blue-500 hover:text-blue-700"
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? '계정이 없으신가요? 회원가입' : '이미 계정이 있으신가요? 로그인'}
        </button>
      </div>
      
      {auth.currentUser && (
        <div className="mt-4">
          <p className="text-sm text-gray-600 mb-2">
            로그인됨: {auth.currentUser.email}
          </p>
          <button 
            onClick={handleLogout}
            className="text-red-500 hover:text-red-700 text-sm"
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export default AuthForms;
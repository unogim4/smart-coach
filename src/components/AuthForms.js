import React, { useState } from 'react';
import { auth, db } from '../firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut 
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

function AuthForms() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const handleAuth = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    
    // 회원가입 시 비밀번호 확인
    if (!isLogin && password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      setLoading(false);
      return;
    }
    
    try {
      if (isLogin) {
        // 로그인
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        // 회원가입
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        
        // 회원가입 성공 시 사용자 프로필 생성
        const user = userCredential.user;
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          displayName: '',
          age: '',
          height: '',
          weight: '',
          fitnessLevel: 'beginner',
          goals: [],
          weeklyTarget: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        
        console.log('사용자 프로필이 생성되었습니다!');
      }
      
      // 폼 초기화
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Firebase 에러 메시지를 한국어로 변환
      let errorMessage = error.message;
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = '등록되지 않은 이메일입니다.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = '비밀번호가 올바르지 않습니다.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = '이미 사용 중인 이메일입니다.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = '비밀번호는 6자 이상이어야 합니다.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = '올바르지 않은 이메일 형식입니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white/95 backdrop-blur-sm p-8 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {isLogin ? '로그인' : '회원가입'}
        </h3>
        <p className="text-gray-600 text-sm">
          {isLogin ? '계정에 로그인하여 시작하세요' : '새 계정을 만들어 시작하세요'}
        </p>
      </div>
      
      <form onSubmit={handleAuth} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <i className="fas fa-envelope mr-2"></i>
            이메일
          </label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            placeholder="이메일을 입력하세요"
            required
          />
        </div>
        
        <div>
          <label className="block text-gray-700 text-sm font-medium mb-2">
            <i className="fas fa-lock mr-2"></i>
            비밀번호
          </label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
            placeholder="비밀번호를 입력하세요"
            required
          />
        </div>
        
        {!isLogin && (
          <div>
            <label className="block text-gray-700 text-sm font-medium mb-2">
              <i className="fas fa-lock mr-2"></i>
              비밀번호 확인
            </label>
            <input 
              type="password" 
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
              placeholder="비밀번호를 다시 입력하세요"
              required
            />
          </div>
        )}
        
        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 font-medium flex items-center justify-center"
          disabled={loading}
        >
          {loading ? (
            <>
              <i className="fas fa-spinner fa-spin mr-2"></i>
              처리 중...
            </>
          ) : (
            <>
              <i className={`fas ${isLogin ? 'fa-sign-in-alt' : 'fa-user-plus'} mr-2`}></i>
              {isLogin ? '로그인' : '회원가입'}
            </>
          )}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <button 
          className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors duration-200"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
            setEmail('');
            setPassword('');
            setConfirmPassword('');
          }}
        >
          {isLogin ? (
            <>
              <i className="fas fa-user-plus mr-1"></i>
              계정이 없으신가요? 회원가입
            </>
          ) : (
            <>
              <i className="fas fa-sign-in-alt mr-1"></i>
              이미 계정이 있으신가요? 로그인
            </>
          )}
        </button>
      </div>
      
      {/* 테스트 계정 안내 (개발용) */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-800 text-sm font-medium mb-2">
          <i className="fas fa-info-circle mr-1"></i>
          테스트 계정
        </p>
        <p className="text-blue-700 text-xs">
          이메일: test@smartcoach.com<br/>
          비밀번호: test123
        </p>
      </div>
    </div>
  );
}

export default AuthForms;
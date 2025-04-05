import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './components/AuthProvider';
import Header from './components/Header';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Analysis from './pages/Analysis';
import Profile from './pages/Profile';
import Login from './pages/Login'; // 새로 만들 페이지

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          
          <nav className="bg-gray-100 p-4">
            <ul className="flex space-x-4 justify-center">
              <li><Link to="/" className="text-blue-500 hover:text-blue-700">홈</Link></li>
              <li><Link to="/courses" className="text-blue-500 hover:text-blue-700">코스 추천</Link></li>
              <li><Link to="/analysis" className="text-blue-500 hover:text-blue-700">운동 분석</Link></li>
              <li><Link to="/profile" className="text-blue-500 hover:text-blue-700">프로필</Link></li>
              <li><Link to="/login" className="text-blue-500 hover:text-blue-700">로그인</Link></li>
            </ul>
          </nav>
          
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/courses" element={<Courses />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
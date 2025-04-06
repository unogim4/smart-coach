import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import { AuthProvider } from './components/AuthProvider';
import Header from './components/Header';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Analysis from './pages/Analysis';
import Profile from './pages/Profile';
import Login from './pages/Login';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// 커스텀 테마 생성
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // 파란색 계열
    },
    secondary: {
      main: '#10b981', // 녹색 계열
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Header />
            
            <main style={{ padding: '20px' }}>
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
    </ThemeProvider>
  );
}

export default App;
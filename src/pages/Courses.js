import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent } from '@mui/material';
import CourseSelector from '../components/CourseSelector';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../services/courseService';

// 네이버 지도 컴포넌트
function NaverMap() {
  const mapRef = React.useRef(null);
  
  useEffect(() => {
    // 네이버 지도 스크립트 로드
    const script = document.createElement('script');
    script.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=f3clw1exyg`;
    script.async = true;
    
    script.onload = () => {
      // 스크립트 로드 완료 후 지도 생성
      const mapOptions = {
        center: new window.naver.maps.LatLng(37.5666805, 126.9784147),
        zoom: 14
      };
      
      const map = new window.naver.maps.Map(mapRef.current, mapOptions);
      
      // 마커 생성
      const marker = new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(37.5666805, 126.9784147),
        map: map
      });
    };
    
    document.head.appendChild(script);
    
    // 컴포넌트 언마운트 시 스크립트 제거
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return (
    <div ref={mapRef} style={{ width: '100%', height: '400px' }}></div>
  );
}

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: '',
    distance: ''
  });
  
  // 코스 데이터 로드
  useEffect(() => {
    const loadCourses = async () => {
      try {
        // 필터링된 코스 가져오기
        const coursesData = await getCourses();
        setCourses(coursesData);
      } catch (error) {
        console.error('코스 로드 오류:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadCourses();
  }, []);
  
  // 필터 변경 시 코스 다시 로드
  const handleFilterChange = async (newFilters) => {
    setLoading(true);
    setFilters(newFilters);
    
    try {
      const filteredCourses = await getCourses(newFilters);
      setCourses(filteredCourses);
    } catch (error) {
      console.error('필터링 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">코스 추천</h2>
      <p className="mb-6">자신의 운동 목표와 선호도에 맞는 코스를 찾아보세요.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <CourseSelector onFilter={handleFilterChange} />
        </div>
        
        <div className="md:col-span-2">
          {/* 네이버 지도 추가 */}
          <Card style={{ marginBottom: '20px' }}>
            <CardContent>
              <Typography variant="h6" style={{ marginBottom: '10px' }}>
                코스 지도
              </Typography>
              <NaverMap />
            </CardContent>
          </Card>
          
          <h3 className="text-xl font-semibold mb-4">추천 코스</h3>
          
          {loading ? (
            <div>코스 로딩 중...</div>
          ) : courses.length > 0 ? (
            courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))
          ) : (
            <div>조건에 맞는 코스가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Courses;
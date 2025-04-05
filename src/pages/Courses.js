import React, { useState, useEffect } from 'react';
import CourseSelector from '../components/CourseSelector';
import CourseCard from '../components/CourseCard';
import { getCourses } from '../services/courseService';

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
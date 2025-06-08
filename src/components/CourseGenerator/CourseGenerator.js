import React, { useState, useEffect } from 'react';
import { generateRunningCourse, initializeDirectionsService } from '../../services/courseService';
import './CourseGenerator.css';

function CourseGenerator({ onCourseGenerated }) {
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(5);
  const [difficulty, setDifficulty] = useState('beginner');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // 컴포넌트 마운트 시 사용자 위치 가져오기
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.error('위치 가져오기 실패:', error);
          setError('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요.');
        }
      );
    }

    // Google Maps 로드 후 DirectionsService 초기화
    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        initializeDirectionsService();
        clearInterval(checkGoogleMaps);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  const handleGenerateCourse = async () => {
    if (!userLocation) {
      setError('위치 정보가 필요합니다.');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const course = await generateRunningCourse(userLocation, distance, difficulty);
      
      if (course) {
        // 생성된 코스를 부모 컴포넌트로 전달
        if (onCourseGenerated) {
          onCourseGenerated(course);
        }
        
        // 성공 메시지
        alert(`${course.name}이 생성되었습니다!\n거리: ${course.distance.toFixed(1)}km\n예상 시간: ${course.duration}`);
      }
    } catch (error) {
      console.error('코스 생성 실패:', error);
      setError('코스 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="course-generator">
      <h3>나만의 러닝 코스 만들기</h3>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="form-group">
        <label>목표 거리 (km)</label>
        <input
          type="range"
          min="1"
          max="20"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="distance-slider"
        />
        <span className="distance-value">{distance}km</span>
      </div>

      <div className="form-group">
        <label>난이도</label>
        <div className="difficulty-buttons">
          <button
            className={`difficulty-btn ${difficulty === 'beginner' ? 'active' : ''}`}
            onClick={() => setDifficulty('beginner')}
          >
            초급
          </button>
          <button
            className={`difficulty-btn ${difficulty === 'intermediate' ? 'active' : ''}`}
            onClick={() => setDifficulty('intermediate')}
          >
            중급
          </button>
          <button
            className={`difficulty-btn ${difficulty === 'advanced' ? 'active' : ''}`}
            onClick={() => setDifficulty('advanced')}
          >
            고급
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>현재 위치</label>
        <div className="location-status">
          {userLocation ? (
            <span className="location-found">✓ 위치 확인됨</span>
          ) : (
            <span className="location-loading">위치 확인 중...</span>
          )}
        </div>
      </div>

      <button
        className="generate-btn"
        onClick={handleGenerateCourse}
        disabled={!userLocation || isGenerating}
      >
        {isGenerating ? '코스 생성 중...' : '코스 생성하기'}
      </button>

      <div className="info-text">
        <p>• 현재 위치를 기준으로 실제 도로를 따라가는 러닝 코스를 생성합니다.</p>
        <p>• 난이도에 따라 평지, 언덕, 경사로가 포함될 수 있습니다.</p>
      </div>
    </div>
  );
}

export default CourseGenerator;

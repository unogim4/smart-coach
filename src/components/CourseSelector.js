import React, { useState } from 'react';

function CourseSelector({ onFilter }) {
  const [level, setLevel] = useState('beginner');
  const [distance, setDistance] = useState('5');
  const [terrain, setTerrain] = useState('flat');
  
  // 코스 필터링 함수
  const filterCourses = () => {
    // 필터 객체 생성
    const filters = {
      difficulty: level,
      minDistance: parseInt(distance) - 2, // 범위 설정
      maxDistance: parseInt(distance) + 2,
      terrain: terrain
    };
    
    // 부모 컴포넌트로 필터 전달
    if (onFilter) {
      onFilter(filters);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">맞춤 코스 찾기</h3>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">난이도</label>
        <select 
          value={level} 
          onChange={(e) => setLevel(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="beginner">초급자</option>
          <option value="intermediate">중급자</option>
          <option value="advanced">고급자</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">거리</label>
        <select 
          value={distance} 
          onChange={(e) => setDistance(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="5">5km</option>
          <option value="10">10km</option>
          <option value="20">20km</option>
          <option value="30">30km</option>
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">지형 선호도</label>
        <select 
          value={terrain} 
          onChange={(e) => setTerrain(e.target.value)}
          className="w-full border p-2 rounded"
        >
          <option value="flat">평지</option>
          <option value="hilly">언덕</option>
          <option value="mixed">혼합</option>
        </select>
      </div>
      
      <button 
        onClick={filterCourses}
        className="bg-blue-500 text-white px-4 py-2 rounded w-full hover:bg-blue-600"
      >
        코스 찾기
      </button>
    </div>
  );
}

export default CourseSelector;
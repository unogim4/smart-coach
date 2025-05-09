import React, { useState } from 'react';

function CourseSelector({ onFilter }) {
  const [level, setLevel] = useState('beginner');
  const [distance, setDistance] = useState('5');
  const [terrain, setTerrain] = useState('flat');
  const [activity, setActivity] = useState('running'); // 'running' 또는 'cycling'
  
  // 코스 필터링 함수
  const filterCourses = () => {
    // 필터 객체 생성
    const filters = {
      difficulty: level,
      minDistance: parseInt(distance) - 2, // 범위 설정
      maxDistance: parseInt(distance) + 2,
      terrain: terrain,
      activityType: activity
    };
    
    // 부모 컴포넌트로 필터 전달
    if (onFilter) {
      onFilter(filters);
    }
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800 mb-5">맞춤 코스 찾기</h3>
      
      {/* 활동 선택 토글 */}
      <div className="mb-5">
        <div className="flex rounded-md overflow-hidden">
          <button 
            className={`flex-1 py-3 px-4 flex justify-center items-center ${activity === 'running' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActivity('running')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3.5a.5.5 0 01.5.5v.5h3a.5.5 0 010 1h-3v.5a.5.5 0 01-1 0v-.5h-3a.5.5 0 010-1h3v-.5a.5.5 0 01.5-.5zM8 6a2 2 0 11-4 0 2 2 0 014 0zm-2 9a4 4 0 00-4 4v1h8v-1a4 4 0 00-4-4zm8-10v1h4v1h-4v1h3v1h-3v1h4v1h-4v3a4 4 0 01-4 4H8a4 4 0 01-4-4V8h4V7H4V6h4V2h2v4h4z" clipRule="evenodd" />
            </svg>
            러닝
          </button>
          <button 
            className={`flex-1 py-3 px-4 flex justify-center items-center ${activity === 'cycling' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setActivity('cycling')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd" />
            </svg>
            사이클링
          </button>
        </div>
      </div>
      
      <div className="mb-5">
        <label className="block text-gray-700 font-medium mb-2">난이도</label>
        <div className="grid grid-cols-3 gap-2">
          <button 
            className={`py-2 px-3 rounded ${level === 'beginner' ? 'bg-green-100 text-green-800 border-2 border-green-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setLevel('beginner')}
          >
            초급자
          </button>
          <button 
            className={`py-2 px-3 rounded ${level === 'intermediate' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setLevel('intermediate')}
          >
            중급자
          </button>
          <button 
            className={`py-2 px-3 rounded ${level === 'advanced' ? 'bg-red-100 text-red-800 border-2 border-red-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setLevel('advanced')}
          >
            고급자
          </button>
        </div>
      </div>
      
      <div className="mb-5">
        <label className="block text-gray-700 font-medium mb-2">거리</label>
        <div className="flex items-center">
          <input 
            type="range" 
            min="5" 
            max="30" 
            step="5"
            value={distance} 
            onChange={(e) => setDistance(e.target.value)}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>5km</span>
          <span>10km</span>
          <span>15km</span>
          <span>20km</span>
          <span>25km</span>
          <span>30km</span>
        </div>
        <div className="text-center mt-2 font-medium text-blue-600">
          선택: {distance}km
        </div>
      </div>
      
      <div className="mb-5">
        <label className="block text-gray-700 font-medium mb-2">지형 선호도</label>
        <div className="grid grid-cols-3 gap-2">
          <button 
            className={`py-2 px-3 rounded flex flex-col items-center ${terrain === 'flat' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTerrain('flat')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414 0zm0-6a1 1 0 010-1.414l5-5a1 1 0 011.414 0l5 5a1 1 0 01-1.414 1.414L10 5.414 5.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
            평지
          </button>
          <button 
            className={`py-2 px-3 rounded flex flex-col items-center ${terrain === 'hilly' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTerrain('hilly')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M6.625 2.655A9 9 0 0119 11a1 1 0 11-2 0 7 7 0 00-9.625-6.492 1 1 0 11-.75-1.853zM4.662 4.959A1 1 0 014.75 6.37 6.97 6.97 0 003 11a1 1 0 11-2 0 8.97 8.97 0 012.25-5.953 1 1 0 011.412-.088z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M5 11a5 5 0 1110 0 1 1 0 11-2 0 3 3 0 10-6 0c0 1.677-.345 3.276-.968 4.729a1 1 0 11-1.838-.789A9.964 9.964 0 005 11zm8.921 2.012a1 1 0 01.831 1.145 19.86 19.86 0 01-.545 2.436 1 1 0 11-1.92-.558c.207-.713.371-1.445.49-2.192a1 1 0 011.144-.83z" clipRule="evenodd" />
            </svg>
            언덕
          </button>
          <button 
            className={`py-2 px-3 rounded flex flex-col items-center ${terrain === 'mixed' ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' : 'bg-gray-100 text-gray-700'}`}
            onClick={() => setTerrain('mixed')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
            </svg>
            혼합
          </button>
        </div>
      </div>
      
      <div className="mb-2">
        <label className="block text-gray-700 font-medium mb-2">추가 옵션</label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
            <span className="ml-2 text-gray-700">현재 날씨 고려</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
            <span className="ml-2 text-gray-700">인기 코스 우선</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" className="form-checkbox h-5 w-5 text-blue-500" />
            <span className="ml-2 text-gray-700">경치 좋은 코스</span>
          </label>
        </div>
      </div>
      
      <button 
        onClick={filterCourses}
        className="mt-6 bg-blue-500 text-white px-4 py-3 rounded-md w-full hover:bg-blue-600 transition duration-300 flex items-center justify-center font-medium"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 9a2 2 0 114 0 2 2 0 01-4 0z" />
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a4 4 0 00-3.446 6.032l-2.261 2.26a1 1 0 101.414 1.415l2.261-2.261A4 4 0 1011 5z" clipRule="evenodd" />
        </svg>
        맞춤 코스 찾기
      </button>
    </div>
  );
}

export default CourseSelector;
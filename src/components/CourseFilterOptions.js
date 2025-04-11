import React, { useState } from 'react';

function CourseFilterOptions({ onFilterChange, initialPreferences }) {
  const [preferences, setPreferences] = useState(initialPreferences || {
    type: 'running',
    maxDistance: 10,
    maxStartDistance: 5,
    difficulty: 'any'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newValue = name === 'maxDistance' || name === 'maxStartDistance' 
      ? parseInt(value) 
      : value;
    
    const updatedPreferences = {
      ...preferences,
      [name]: newValue
    };
    
    setPreferences(updatedPreferences);
    onFilterChange(updatedPreferences);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-3">코스 필터</h3>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-gray-600 mb-1">코스 유형</label>
          <select 
            name="type"
            value={preferences.type}
            onChange={handleChange}
            className="w-full border p-2 rounded text-sm"
          >
            <option value="any">모든 유형</option>
            <option value="running">러닝</option>
            <option value="biking">자전거</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">난이도</label>
          <select 
            name="difficulty"
            value={preferences.difficulty}
            onChange={handleChange}
            className="w-full border p-2 rounded text-sm"
          >
            <option value="any">모든 난이도</option>
            <option value="beginner">초급</option>
            <option value="intermediate">중급</option>
            <option value="advanced">고급</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">최대 코스 거리 ({preferences.maxDistance}km)</label>
          <input 
            type="range" 
            name="maxDistance"
            min="5" 
            max="30" 
            step="5"
            value={preferences.maxDistance}
            onChange={handleChange}
            className="w-full"
          />
        </div>
        
        <div>
          <label className="block text-sm text-gray-600 mb-1">시작점까지 거리 ({preferences.maxStartDistance}km)</label>
          <input 
            type="range" 
            name="maxStartDistance"
            min="1" 
            max="10" 
            step="1"
            value={preferences.maxStartDistance}
            onChange={handleChange}
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}

export default CourseFilterOptions;
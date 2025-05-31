import React, { useState } from 'react';

function ProfileForm({ initialData, onSave }) {
  const [formData, setFormData] = useState({
    displayName: initialData?.displayName || '',
    email: initialData?.email || '',
    height: initialData?.height || '',
    weight: initialData?.weight || '',
    age: initialData?.age || '',
    gender: initialData?.gender || 'male',
    fitnessLevel: initialData?.fitnessLevel || 'beginner',
    goals: initialData?.goals || []
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">개인 정보</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-gray-500 text-sm mb-1">이름</label>
          <input 
            type="text" 
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            className="w-full border p-2 rounded" 
            placeholder="이름을 입력하세요" 
          />
        </div>
        
        <div>
          <label className="block text-gray-500 text-sm mb-1">이메일</label>
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border p-2 rounded" 
            placeholder="이메일을 입력하세요" 
          />
        </div>
        
        <div>
          <label className="block text-gray-500 text-sm mb-1">키 (cm)</label>
          <input 
            type="number" 
            name="height"
            value={formData.height}
            onChange={handleChange}
            className="w-full border p-2 rounded" 
            placeholder="키를 입력하세요" 
          />
        </div>
        
        <div>
          <label className="block text-gray-500 text-sm mb-1">몸무게 (kg)</label>
          <input 
            type="number" 
            name="weight"
            value={formData.weight}
            onChange={handleChange}
            className="w-full border p-2 rounded" 
            placeholder="몸무게를 입력하세요" 
          />
        </div>
        
        <div>
          <label className="block text-gray-500 text-sm mb-1">나이</label>
          <input 
            type="number" 
            name="age"
            value={formData.age}
            onChange={handleChange}
            className="w-full border p-2 rounded" 
            placeholder="나이를 입력하세요" 
          />
        </div>
        
        <div>
          <label className="block text-gray-500 text-sm mb-1">성별</label>
          <select 
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="male">남성</option>
            <option value="female">여성</option>
            <option value="other">기타</option>
          </select>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-gray-500 text-sm mb-1">운동 수준</label>
        <select 
          name="fitnessLevel"
          value={formData.fitnessLevel}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="beginner">초급자</option>
          <option value="intermediate">중급자</option>
          <option value="advanced">고급자</option>
        </select>
      </div>
      
      <button 
        type="submit"
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        저장하기
      </button>
    </form>
  );
}

export default ProfileForm;
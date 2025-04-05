import React from 'react';
import { Link } from 'react-router-dom';

function QuickStartCard() {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-3">빠른 시작</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Link to="/courses" className="block bg-blue-500 text-white p-3 rounded text-center hover:bg-blue-600">
          러닝 코스 찾기
        </Link>
        
        <Link to="/courses" className="block bg-green-500 text-white p-3 rounded text-center hover:bg-green-600">
          바이크 코스 찾기
        </Link>
        
        <Link to="/analysis" className="block bg-purple-500 text-white p-3 rounded text-center hover:bg-purple-600">
          운동 분석 보기
        </Link>
        
        <Link to="/profile" className="block bg-gray-500 text-white p-3 rounded text-center hover:bg-gray-600">
          프로필 설정
        </Link>
      </div>
    </div>
  );
}

export default QuickStartCard;
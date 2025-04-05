import React from 'react';

function CourseCard({ course }) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <h3 className="text-lg font-semibold mb-2">{course.name}</h3>
      
      <div className="flex justify-between mb-3">
        <span>거리: {course.distance}km</span>
        <span>난이도: {course.difficulty}</span>
      </div>
      
      <div className="text-gray-600 mb-3">{course.description}</div>
      
      <div className="bg-gray-100 p-3 rounded mb-3">
        <div className="font-semibold mb-1">코스 정보:</div>
        <div>경사도: {course.elevation}m</div>
        <div>예상 시간: {course.estimatedTime}</div>
        <div>도로 유형: {course.roadType}</div>
      </div>
      
      <div className="flex justify-between">
        <button className="bg-blue-500 text-white px-3 py-1 rounded">
          상세 보기
        </button>
        <button className="bg-green-500 text-white px-3 py-1 rounded">
          시작하기
        </button>
      </div>
    </div>
  );
}

export default CourseCard;
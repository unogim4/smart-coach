import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SimpleGoogleMap from '../components/SimpleGoogleMap';

function Home() {
  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 헤더 배경 */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">스마트 러닝 & 바이크 코치</h1>
          <p className="text-blue-100 text-lg">
            개인화된 코스 추천과 실시간 운동 피드백으로 더 효과적인 운동을 경험하세요.
          </p>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* 구글 맵 테스트 섹션 */}
        <div className="mb-8">
          <SimpleGoogleMap />
        </div>
        
        {/* 빠른 시작 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link to="/courses" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-blue-600 text-4xl mb-4">🏃‍♂️</div>
            <h3 className="text-xl font-bold mb-2">러닝 코스 찾기</h3>
            <p className="text-gray-600">운동 목표와 선호도에 맞는 최적의 러닝 코스를 찾아보세요.</p>
          </Link>
          
          <Link to="/courses" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-green-600 text-4xl mb-4">🚴‍♂️</div>
            <h3 className="text-xl font-bold mb-2">바이크 코스 찾기</h3>
            <p className="text-gray-600">자전거로 달릴 수 있는 아름다운 코스들을 추천받으세요.</p>
          </Link>
          
          <Link to="/analysis" className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="text-purple-600 text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold mb-2">운동 분석 보기</h3>
            <p className="text-gray-600">운동 데이터를 분석하고 개인화된 피드백을 받아보세요.</p>
          </Link>
        </div>
        
        {/* 주요 기능 소개 */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-600 text-2xl">🎯</span>
              </div>
              <h3 className="text-lg font-bold mb-2">맞춤 코스 추천</h3>
              <p className="text-gray-600">운동 목표와 선호도에 맞는 최적의 코스를 추천합니다.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl">📈</span>
              </div>
              <h3 className="text-lg font-bold mb-2">실시간 분석</h3>
              <p className="text-gray-600">운동 중 실시간으로 페이스와 심박수를 분석하고 피드백을 제공합니다.</p>
            </div>
            
            <div className="text-center">
              <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <span className="text-purple-600 text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-bold mb-2">AI 코치</h3>
              <p className="text-gray-600">개인의 운동 패턴을 분석하여 맞춤형 트레이닝 플랜을 제공합니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
import React, { useState, useEffect } from 'react';

function StepCounter() {
  // 상태 정의: [상태값, 상태 변경 함수]
  const [steps, setSteps] = useState(0);
  
  // 컴포넌트가 마운트될 때 실행되는 효과
  useEffect(() => {
    console.log('StepCounter 컴포넌트가 마운트되었습니다');
    
    // 1초마다 걸음 수 증가 (예시용)
    const interval = setInterval(() => {
      setSteps(prevSteps => prevSteps + 1);
    }, 1000);
    
    // 클린업 함수: 컴포넌트가 언마운트될 때 실행
    return () => {
      console.log('StepCounter 컴포넌트가 언마운트됩니다');
      clearInterval(interval);
    };
  }, []); // 빈 배열은 이 효과가 마운트 시에만 실행됨을 의미
  
  return (
    <div>
      <h3>현재 걸음 수: {steps}</h3>
      <button onClick={() => setSteps(0)}>리셋</button>
    </div>
  );
}

export default StepCounter;
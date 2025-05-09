import React from 'react';

function WorkoutFeedback({ heartRate, pace, route }) {
  // 심박수와 페이스에 따른 피드백 생성 로직
  const getFeedback = () => {
    if (heartRate > 160) {
      return {
        message: "심박수가 목표 구간보다 높습니다. 속도를 조금 줄이고 심호흡을 하세요.",
        detailedAdvice: "현재 무산소 구간에서 운동 중입니다. 몸이 피로를 느낄 수 있으니 페이스를 약간 늦추는 것이 좋습니다. 호흡에 집중하세요.",
        level: "warning",
        icon: "heart"
      };
    } else if (heartRate < 120 && pace < 5) {
      return {
        message: "심박수가 목표 구간보다 낮습니다. 조금 더 빠르게 달려보세요!",
        detailedAdvice: "효과적인 유산소 운동을 위해 페이스를 조금 더 높여 심박수를 목표 구간으로 올리세요. 팔 스윙을 더 적극적으로 활용해보세요.",
        level: "info",
        icon: "speed"
      };
    } else if (heartRate >= 130 && heartRate <= 150) {
      return {
        message: "최적의 심박 구간에서 운동 중입니다. 좋은 페이스입니다!",
        detailedAdvice: "지금의 페이스가 효과적인 지방 연소와 심폐 기능 향상에 이상적입니다. 이 페이스를 유지하세요.",
        level: "success",
        icon: "checkmark"
      };
    } else {
      return {
        message: "적정 운동 구간을 유지하고 있습니다. 좋습니다!",
        detailedAdvice: "지금의 페이스는 유산소 운동으로 적합합니다. 정기적으로 수분을 섭취하세요.",
        level: "info",
        icon: "info"
      };
    }
  };
  
  const feedback = getFeedback();
  
  // 피드백 레벨에 따른 색상 설정
  const getStyleClasses = () => {
    switch(feedback.level) {
      case 'warning':
        return {
          card: 'border-l-4 border-yellow-500 bg-yellow-50',
          icon: 'bg-yellow-100 text-yellow-600',
          title: 'text-yellow-800'
        };
      case 'info':
        return {
          card: 'border-l-4 border-blue-500 bg-blue-50',
          icon: 'bg-blue-100 text-blue-600',
          title: 'text-blue-800'
        };
      case 'success':
        return {
          card: 'border-l-4 border-green-500 bg-green-50',
          icon: 'bg-green-100 text-green-600',
          title: 'text-green-800'
        };
      default:
        return {
          card: 'border-l-4 border-gray-400 bg-gray-50',
          icon: 'bg-gray-100 text-gray-600',
          title: 'text-gray-800'
        };
    }
  };
  
  const styles = getStyleClasses();
  
  // 아이콘 컴포넌트
  const FeedbackIcon = () => {
    switch(feedback.icon) {
      case 'heart':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'speed':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      case 'checkmark':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'info':
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // 경로 기반 팁
  const getRouteTip = () => {
    if (!route) return null;
    
    let tip = "";
    
    if (route.name.includes("한강")) {
      tip = "한강 코스는 평지가 많아 일정한 페이스를 유지하기 좋습니다. 호흡 패턴에 집중해보세요.";
    } else if (route.name.includes("남산")) {
      tip = "남산 코스는 중간에 오르막이 있습니다. 1km 후 오르막길에서 심박수가 상승할 수 있으니 페이스 조절을 준비하세요.";
    } else if (route.name.includes("북한산")) {
      tip = "북한산 코스는 경사가 심합니다. 무리하지 마시고 필요하면 걷기와 달리기를 번갈아 하세요.";
    } else {
      tip = `현재 코스의 누적 고도는 ${route.elevationGain}m입니다. 페이스를 유지하며 효율적인 운동을 하세요.`;
    }
    
    return tip;
  };

  const routeTip = getRouteTip();
  
  return (
    <div className={`rounded-lg overflow-hidden transition-all duration-300 ${styles.card}`}>
      <div className="p-5">
        <div className="flex items-start">
          <div className={`rounded-full ${styles.icon} p-3 mr-4`}>
            <FeedbackIcon />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${styles.title} mb-2`}>{feedback.message}</h3>
            <p className="text-gray-600 mb-4">{feedback.detailedAdvice}</p>
            
            {/* 현재 데이터 */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm text-gray-500">심박수</div>
                <div className="text-xl font-bold">{heartRate} BPM</div>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <div className="text-sm text-gray-500">페이스</div>
                <div className="text-xl font-bold">{pace} min/km</div>
              </div>
            </div>
            
            {/* 경로 기반 팁 */}
            {routeTip && (
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-400">
                <div className="flex">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-500 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <div className="text-sm text-gray-700">{routeTip}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* 액션 버튼 */}
      <div className="bg-white px-5 py-3 flex justify-end border-t">
        <button className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors">
          더 많은 팁 보기
        </button>
      </div>
    </div>
  );
}

export default WorkoutFeedback;
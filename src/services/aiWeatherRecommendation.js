// 🤖 AI 기반 날씨 운동 추천 서비스

export const getAIExerciseRecommendation = (weatherData, airQuality) => {
  if (!weatherData) return null;
  
  const temp = weatherData.temperature;
  const humidity = weatherData.humidity;
  const windSpeed = weatherData.windSpeed;
  const description = weatherData.description?.toLowerCase() || '';
  const aqi = airQuality?.aqi || 2;
  const pm25 = airQuality?.pm25 || 15;
  
  // 날씨 상태 판단
  const isRaining = description.includes('비') || description.includes('rain');
  const isSnowing = description.includes('눈') || description.includes('snow');
  const isCloudy = description.includes('흐림') || description.includes('cloud');
  const isClear = description.includes('맑음') || description.includes('clear');
  const isStormy = description.includes('천둥') || description.includes('storm');
  
  let recommendation = {};
  
  // 극한 날씨 조건
  if (temp >= 35) {
    recommendation = {
      type: '위험',
      recommendation: '⚠️ 러닝을 추천하지 않습니다',
      reason: `현재 기온이 ${temp}°C로 매우 높습니다. 열사병 위험이 있으며, 실외 운동은 건강에 위험할 수 있습니다.`,
      icon: 'fas fa-temperature-high',
      color: 'red',
      rating: 1,
      tips: [
        '충분한 수분 섭취가 필수입니다',
        '실내 운동을 고려해보세요',
        '아침 일찍이나 저녁 늦게 운동하세요'
      ],
      warning: '고온 경보! 오늘은 실내 운동을 강력히 권장합니다. 열사병 예방을 위해 충분한 휴식과 수분 섭취가 필수입니다.',
      bestTime: '새벽 5-6시 (최저 기온 시간)'
    };
  } else if (temp <= -10) {
    recommendation = {
      type: '위험',
      recommendation: '❄️ 실외 러닝 금지',
      reason: `기온이 ${temp}°C로 매우 낮아 동상 위험이 있습니다. 미끄러짐 위험도 높습니다.`,
      icon: 'fas fa-snowflake',
      color: 'blue',
      rating: 1,
      tips: [
        '실내 트레드밀 사용 권장',
        '충분한 준비운동 필수',
        '보온에 신경 쓰세요'
      ],
      warning: '한파 경보! 동상 위험이 높으니 실내 운동을 하세요.',
      bestTime: '실내 운동만 권장'
    };
  } else if (isStormy) {
    recommendation = {
      type: '위험',
      recommendation: '⛈️ 실외 운동 금지',
      reason: '천둥번개가 치고 있어 매우 위험합니다. 낙뢰 위험이 있습니다.',
      icon: 'fas fa-bolt',
      color: 'purple',
      rating: 1,
      tips: [
        '실내에서 안전하게 운동하세요',
        '실외 활동을 피하세요',
        '날씨가 개기를 기다리세요'
      ],
      warning: '낙뢰 위험! 절대 실외 운동을 하지 마세요.',
      bestTime: '실내 운동만 가능'
    };
  } else if (aqi >= 4 || pm25 > 50) {
    recommendation = {
      type: '주의',
      recommendation: '😷 대기질 나쁨 - 실내 운동 권장',
      reason: `미세먼지 농도(PM2.5: ${pm25}μg/m³)가 높아 호흡기 건강에 해로울 수 있습니다.`,
      icon: 'fas fa-smog',
      color: 'gray',
      rating: 2,
      tips: [
        '마스크 착용 필수',
        '가급적 실내 운동 권장',
        '짧은 시간만 실외 활동'
      ],
      warning: '대기질이 나쁘니 가급적 실내에서 운동하세요. 실외 운동 시 마스크를 착용하세요.',
      bestTime: '실내 운동 권장'
    };
  } else if (temp >= 28 && humidity >= 80) {
    recommendation = {
      type: '주의',
      recommendation: '💦 높은 습도 - 가볍게 운동하세요',
      reason: `기온 ${temp}°C, 습도 ${humidity}%로 무덥고 끈적합니다. 탈수 위험이 높습니다.`,
      icon: 'fas fa-tint',
      color: 'orange',
      rating: 2,
      tips: [
        '수분 섭취를 자주 하세요',
        '운동 강도를 낮춰주세요',
        '통풍이 잘 되는 옷을 입으세요',
        '10분마다 휴식을 취하세요'
      ],
      warning: '높은 습도로 체온 조절이 어려울 수 있습니다. 충분한 수분 섭취와 휴식을 취하세요.',
      bestTime: '일출 전 (5-7시) 또는 일몰 후 (19-21시)'
    };
  } else if (isRaining && windSpeed > 10) {
    recommendation = {
      type: '경고',
      recommendation: '🌧️ 강한 비바람 - 실내 운동 권장',
      reason: `비가 오고 바람이 강해(${windSpeed}m/s) 실외 운동이 어렵습니다.`,
      icon: 'fas fa-cloud-showers-heavy',
      color: 'indigo',
      rating: 1,
      tips: [
        '실내 트레드밀 사용',
        '실내 체조 추천',
        '요가나 스트레칭'
      ],
      warning: '미끄러짐 위험이 높고 시야가 확보되지 않습니다.',
      bestTime: '실내 운동 권장'
    };
  }
  // 좋은 날씨 조건
  else if (temp >= 15 && temp <= 25 && humidity < 70 && isClear && aqi <= 2) {
    recommendation = {
      type: '최적',
      recommendation: '🌟 완벽한 러닝 날씨!',
      reason: `기온 ${temp}°C, 습도 ${humidity}%, 대기질 좋음. 모든 조건이 러닝에 완벽합니다!`,
      icon: 'fas fa-running',
      color: 'green',
      rating: 5,
      tips: [
        '오늘은 장거리 러닝에 도전해보세요',
        '새로운 코스를 탐험해보세요',
        '개인 기록 경신에 도전해보세요'
      ],
      bestTime: '언제든지 좋습니다!'
    };
  } else if (temp >= 10 && temp < 15) {
    recommendation = {
      type: '좋음',
      recommendation: '🍃 선선한 러닝 날씨',
      reason: `기온 ${temp}°C로 선선합니다. 가볍게 체온을 유지할 수 있는 옷을 입으세요.`,
      icon: 'fas fa-leaf',
      color: 'teal',
      rating: 4,
      tips: [
        '얇은 겉옷 준비',
        '충분한 준비운동 필수',
        '운동 후 체온 유지'
      ],
      bestTime: '오전 9-11시, 오후 3-5시'
    };
  } else if (temp >= 5 && temp < 10) {
    recommendation = {
      type: '보통',
      recommendation: '🧥 추운 날씨 - 준비운동 철저히',
      reason: `기온이 ${temp}°C로 낮습니다. 충분히 몸을 데우고 보온에 신경 쓰세요.`,
      icon: 'fas fa-temperature-low',
      color: 'blue',
      rating: 3,
      tips: [
        '충분한 준비운동 (10분 이상)',
        '여러 겹 입기',
        '손목과 목 보호',
        '운동 후 빠른 실내 복귀'
      ],
      warning: '근육이 경직될 수 있으니 충분한 준비운동을 하세요.',
      bestTime: '오후 1-3시 (가장 따뜻한 시간)'
    };
  } else if (isRaining) {
    recommendation = {
      type: '주의',
      recommendation: '☔ 비 오는 날 - 조심해서 운동',
      reason: '비가 와서 미끄러질 위험이 있습니다. 방수 장비를 착용하세요.',
      icon: 'fas fa-umbrella',
      color: 'blue',
      rating: 2,
      tips: [
        '미끄럼 방지 신발 착용',
        '방수 재킷 필수',
        '시야 확보에 주의',
        '평소보다 천천히 달리기'
      ],
      warning: '노면이 미끄러우니 주의하세요.',
      bestTime: '비가 약한 시간대'
    };
  } else if (temp >= 25 && temp < 28) {
    recommendation = {
      type: '보통',
      recommendation: '☀️ 따뜻한 날씨 - 수분 섭취 주의',
      reason: `기온이 ${temp}°C로 따뜻합니다. 충분한 수분 섭취가 필요합니다.`,
      icon: 'fas fa-sun',
      color: 'yellow',
      rating: 3,
      tips: [
        '운동 전후 물 마시기',
        '가벼운 옷차림',
        '그늘진 코스 선택',
        '페이스 조절 필수'
      ],
      bestTime: '오전 6-8시, 오후 6-8시'
    };
  } else {
    recommendation = {
      type: '보통',
      recommendation: '🏃 적당한 러닝 날씨',
      reason: `현재 날씨에서 가볍게 운동하기 좋습니다.`,
      icon: 'fas fa-walking',
      color: 'blue',
      rating: 3,
      tips: [
        '적절한 페이스 유지',
        '날씨 변화 주의',
        '기본 운동 복장'
      ],
      bestTime: '오전 또는 오후'
    };
  }
  
  // 실제 데이터 플래그 추가
  recommendation.isRealData = weatherData.isRealData || false;
  
  return recommendation;
};

export default getAIExerciseRecommendation;
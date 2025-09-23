import React, { useState, useEffect, useRef nextInstruction}</div>
          )}
        </div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* GPS 상태 표시 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              gpsStatus === '연결됨' ? 'bg-green-500' : 
              gpsStatus === '연결중...' ? 'bg-yellow-500 animate-pulse' : 
              gpsStatus === '시뮬레이션' ? 'bg-purple-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {simulationMode ? '시뮬레이션' : `GPS: ${gpsStatus}`}
            </span>
            {gpsAccuracy > 0 && !simulationMode && (
              <span className="text-xs text-gray-500">(±{gpsAccuracy}m)</span>
            )}
          </div>
        </div>

        {/* 시뮬레이션 모드 표시 */}
        {simulationMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">🎬</div>
              <span className="text-sm font-bold">온천장 코스 시뮬레이션 모드</span>
            </div>
          </div>
        )}

        {/* 진행률 바 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 w-48">
          <div className="text-sm font-medium mb-1">진행률</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${routeProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{routeProgress.toFixed(0)}% 완료</div>
        </div>

        {/* AI 코치 메시지 */}
        <div className="absolute bottom-32 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤖</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">AI 코치</div>
              <div className="text-base font-semibold">{coachMessage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 상세 정보 및 컨트롤 */}
      <div className="bg-gray-800 text-white p-4">
        {/* 상세 데이터 */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div>
            <div className="text-xl font-bold text-orange-400">{exerciseData.heartRate}</div>
            <div className="text-xs text-gray-400">BPM</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{exerciseData.pace}</div>
            <div className="text-xs text-gray-400">페이스</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-400">{exerciseData.calories}</div>
            <div className="text-xs text-gray-400">칼로리</div>
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-400">{exerciseData.steps}</div>
            <div className="text-xs text-gray-400">걸음</div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex space-x-2">
          {!isExercising ? (
            <button
              onClick={startExercise}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <i className="fas fa-play mr-2"></i>
              운동 시작
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeExercise}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  계속
                </button>
              ) : (
                <button
                  onClick={pauseExercise}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-pause mr-2"></i>
                  일시정지
                </button>
              )}
              <button
                onClick={stopExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <i className="fas fa-stop mr-2"></i>
                종료
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracking; from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// 🏃‍♂️ 실시간 운동 트래킹 페이지
function ExerciseTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { route, exerciseType = 'running' } = location.state || {};
  
  // 지도 관련
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const userMarkerRef = useRef(null);
  const routePolylineRef = useRef(null);
  const passedPolylineRef = useRef(null);
  
  // 운동 상태
  const [isExercising, setIsExercising] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [exerciseData, setExerciseData] = useState({
    distance: 0,
    time: 0,
    speed: 0,
    avgSpeed: 0,
    maxSpeed: 0,
    heartRate: 0,
    calories: 0,
    pace: '0:00',
    altitude: 0,
    steps: 0
  });
  
  // 경로 안내
  const [currentInstruction, setCurrentInstruction] = useState('');
  const [nextInstruction, setNextInstruction] = useState('');
  const [distanceToNext, setDistanceToNext] = useState(0);
  const [routeProgress, setRouteProgress] = useState(0);
  
  // GPS 트래킹
  const [gpsAccuracy, setGpsAccuracy] = useState(0);
  const [gpsStatus, setGpsStatus] = useState('대기중');
  const watchIdRef = useRef(null);
  const pathHistoryRef = useRef([]);
  const startTimeRef = useRef(null);
  const distanceAccumulator = useRef(0);
  
  // AI 코치 메시지
  const [coachMessage, setCoachMessage] = useState('운동을 시작하세요!');
  const [alerts, setAlerts] = useState([]);

  // 컴포넌트 마운트 시 자동으로 GPS 시작
  useEffect(() => {
    // 페이지 로드 시 자동으로 운동 시작
    console.log('🏃 ExerciseTracking 페이지 로드됨');
    
    // 1초 후 자동으로 운동 시작 (사용자가 준비할 시간)
    const autoStartTimer = setTimeout(() => {
      console.log('⏱️ 자동으로 운동을 시작합니다!');
      startExercise();
    }, 1000);
    
    return () => {
      clearTimeout(autoStartTimer);
      // 페이지 벗어날 때 GPS 정리
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []); // 최초 한 번만 실행
  
  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.google) return;

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 17,
      center: route?.path?.[0] || { lat: 37.5665, lng: 126.9780 },
      mapTypeId: 'roadmap',
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    mapInstanceRef.current = map;

    // 경로 표시
    if (route?.path) {
      const routePath = new window.google.maps.Polyline({
        path: route.path,
        geodesic: true,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.5,
        strokeWeight: 6
      });
      routePath.setMap(map);
      routePolylineRef.current = routePath;

      // 시작점과 끝점 마커 (기존 Marker 유지 - AdvancedMarkerElement는 추가 설정 필요)
      // TODO: 추후 AdvancedMarkerElement로 마이그레이션
      new window.google.maps.Marker({
        position: route.path[0],
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: '시작점'
      });

      new window.google.maps.Marker({
        position: route.path[route.path.length - 1],
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 8,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        },
        title: '도착점'
      });
    }

    // 사용자 위치 마커
    const userMarker = new window.google.maps.Marker({
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: '#F59E0B',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3
      },
      title: '현재 위치'
    });
    userMarkerRef.current = userMarker;

    // 지나온 경로 표시용
    const passedPath = new window.google.maps.Polyline({
      geodesic: true,
      strokeColor: '#10B981',
      strokeOpacity: 0.8,
      strokeWeight: 6
    });
    passedPath.setMap(map);
    passedPolylineRef.current = passedPath;

  }, [route]);

  // GPS 위치가 없을 때를 위한 시뮬레이션 모드
  const startSimulationMode = () => {
    console.log('🎮 시뮬레이션 모드로 실행');
    setGpsStatus('시뮬레이션');
    
    // 초기 위치 설정 (부산 연산동)
    let simLat = route?.path?.[0]?.lat || 35.1796;
    let simLng = route?.path?.[0]?.lng || 129.0756;
    let pathIndex = 0;
    
    // 시뮬레이션 interval
    const simInterval = setInterval(() => {
      if (!isExercising || isPaused) return;
      
      // 경로를 따라 이동
      if (route?.path && pathIndex < route.path.length) {
        const targetPoint = route.path[pathIndex];
        simLat += (targetPoint.lat - simLat) * 0.1;
        simLng += (targetPoint.lng - simLng) * 0.1;
        
        if (Math.abs(targetPoint.lat - simLat) < 0.0001) {
          pathIndex++;
        }
      } else {
        // 경로가 없으면 랜덤 이동
        simLat += (Math.random() - 0.5) * 0.0001;
        simLng += (Math.random() - 0.5) * 0.0001;
      }
      
      const simPosition = {
        lat: simLat,
        lng: simLng,
        altitude: 10 + Math.random() * 5,
        accuracy: 10,
        speed: 2 + Math.random(), // 2-3 m/s (러닝 속도)
        timestamp: Date.now()
      };
      
      setCurrentPosition(simPosition);
      setGpsAccuracy(10);
      
      // 지도 업데이트
      if (userMarkerRef.current && mapInstanceRef.current) {
        const latLng = new window.google.maps.LatLng(simPosition.lat, simPosition.lng);
        userMarkerRef.current.setPosition(latLng);
        mapInstanceRef.current.panTo(latLng);
      }
      
      // 운동 데이터 업데이트
      updateExerciseData(simPosition);
      updateRouteProgress(simPosition);
      pathHistoryRef.current.push(simPosition);
      
      // 지나온 경로 업데이트
      if (passedPolylineRef.current) {
        passedPolylineRef.current.setPath(
          pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
        );
      }
    }, 1000); // 1초마다 업데이트
    
    window.simulationInterval = simInterval;
  };
  
  // GPS 위치 추적 시작
  const startGPSTracking = () => {
    if (!navigator.geolocation) {
      alert('GPS를 사용할 수 없습니다');
      return;
    }

    console.log('📍 GPS 추적 시작...');
    setGpsStatus('연결중...');
    
    const options = {
      enableHighAccuracy: true,
      timeout: 10000,  // 타임아웃 늘림
      maximumAge: 0
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        console.log('📍 GPS 위치 업데이트:', position.coords);
        const newPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          altitude: position.coords.altitude || 0,
          accuracy: position.coords.accuracy,
          speed: position.coords.speed || 0,
          timestamp: position.timestamp
        };

        setCurrentPosition(newPosition);
        setGpsAccuracy(Math.round(position.coords.accuracy));
        setGpsStatus('연결됨');

        // 지도 업데이트
        if (userMarkerRef.current && mapInstanceRef.current) {
          const latLng = new window.google.maps.LatLng(newPosition.lat, newPosition.lng);
          userMarkerRef.current.setPosition(latLng);
          
          // 지도 중심을 사용자 위치로 이동
          if (!isPaused) {
            mapInstanceRef.current.panTo(latLng);
          }
        }

        // 운동 중일 때만 데이터 업데이트
        if (isExercising && !isPaused) {
          updateExerciseData(newPosition);
          updateRouteProgress(newPosition);
          pathHistoryRef.current.push(newPosition);
          
          // 지나온 경로 업데이트
          if (passedPolylineRef.current) {
            passedPolylineRef.current.setPath(
              pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
            );
          }
        }
      },
      (error) => {
        console.error('GPS 에러:', error);
        setGpsStatus('오류');
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            alert('위치 권한을 허용해주세요. 시뮬레이션 모드로 전환합니다.');
            startSimulationMode(); // GPS 실패 시 시뮬레이션 모드
            break;
          case error.POSITION_UNAVAILABLE:
            alert('위치 정보를 사용할 수 없습니다. 시뮬레이션 모드로 전환합니다.');
            startSimulationMode();
            break;
          case error.TIMEOUT:
            setGpsStatus('시간초과 - 시뮬레이션 모드로 전환');
            startSimulationMode();
            break;
        }
      },
      options
    );
  };

  // GPS 추적 중지
  const stopGPSTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setGpsStatus('중지됨');
    }
    
    // 시뮬레이션 모드도 정리
    if (window.simulationInterval) {
      clearInterval(window.simulationInterval);
      window.simulationInterval = null;
    }
  };

  // 운동 데이터 업데이트
  const updateExerciseData = (position) => {
    const currentTime = Date.now();
    
    if (!startTimeRef.current) {
      startTimeRef.current = currentTime;
      console.log('⏱️ 운동 시작 시간 설정');
    }

    const elapsedTime = Math.floor((currentTime - startTimeRef.current) / 1000);
    console.log(`⏱️ 경과 시간: ${elapsedTime}초`);
    
    // 이전 위치가 있으면 거리 계산
    if (pathHistoryRef.current.length > 0) {
      const lastPosition = pathHistoryRef.current[pathHistoryRef.current.length - 1];
      const distance = calculateDistance(lastPosition, position);
      
      // 비정상적인 거리는 무시 (GPS 점프)
      if (distance < 100) {
        distanceAccumulator.current += distance;
      }
    }

    // 속도 계산 (km/h)
    const speed = position.speed ? position.speed * 3.6 : 
                 (distanceAccumulator.current / elapsedTime) * 3.6;
    
    // 페이스 계산 (분:초/km)
    const paceSeconds = speed > 0 ? 3600 / speed : 0;
    const paceMinutes = Math.floor(paceSeconds / 60);
    const paceSecondsRemainder = Math.floor(paceSeconds % 60);
    
    // 칼로리 계산 (MET 기반)
    const met = exerciseType === 'running' ? 9.8 : 
                exerciseType === 'cycling' ? 7.5 : 3.5;
    const calories = (met * 70 * (elapsedTime / 3600));
    
    // 심박수 시뮬레이션 (실제로는 웨어러블 디바이스 연동 필요)
    const baseHR = 60;
    const exerciseHR = Math.min(180, baseHR + speed * 5 + Math.random() * 10);
    
    // 걸음수 계산 (러닝/걷기만)
    const steps = exerciseType !== 'cycling' ? 
                 Math.floor(distanceAccumulator.current * 1.3) : 0;

    setExerciseData(prev => ({
      distance: distanceAccumulator.current,
      time: elapsedTime,
      speed: speed.toFixed(1),
      avgSpeed: (distanceAccumulator.current / elapsedTime * 3.6).toFixed(1),
      maxSpeed: Math.max(prev.maxSpeed, speed).toFixed(1),
      heartRate: Math.round(exerciseHR),
      calories: Math.round(calories),
      pace: `${paceMinutes}:${paceSecondsRemainder.toString().padStart(2, '0')}`,
      altitude: position.altitude || 0,
      steps: steps
    }));

    // AI 코치 피드백
    generateCoachFeedback(speed, exerciseHR, elapsedTime);
  };

  // 경로 진행 상황 업데이트
  const updateRouteProgress = (position) => {
    if (!route?.path) return;

    // 현재 위치에서 가장 가까운 경로 포인트 찾기
    let minDistance = Infinity;
    let closestIndex = 0;
    
    route.path.forEach((point, index) => {
      const distance = calculateDistance(position, point);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // 진행률 계산
    const progress = (closestIndex / route.path.length) * 100;
    setRouteProgress(progress);

    // 다음 안내 지점까지 거리
    if (route.instructions && closestIndex < route.path.length - 1) {
      const nextPoint = route.path[closestIndex + 1];
      const distanceToNext = calculateDistance(position, nextPoint);
      setDistanceToNext(Math.round(distanceToNext));
      
      // 안내 메시지 업데이트
      updateNavigationInstructions(closestIndex, distanceToNext);
    }

    // 도착 확인
    if (progress > 95) {
      handleArrival();
    }
  };

  // 네비게이션 안내 업데이트
  const updateNavigationInstructions = (currentIndex, distance) => {
    if (!route?.instructions) return;

    const currentStep = Math.floor(currentIndex / (route.path.length / route.instructions.length));
    const instruction = route.instructions[currentStep];
    const nextInstruction = route.instructions[currentStep + 1];

    if (instruction) {
      if (distance < 50) {
        setCurrentInstruction(`🔔 ${distance}m 후 ${instruction.text}`);
        
        // 음성 안내 (Web Speech API)
        if ('speechSynthesis' in window && distance < 30) {
          const utterance = new SpeechSynthesisUtterance(instruction.text);
          utterance.lang = 'ko-KR';
          window.speechSynthesis.speak(utterance);
        }
      } else {
        setCurrentInstruction(`📍 ${distance}m 직진`);
      }
    }

    if (nextInstruction) {
      setNextInstruction(`다음: ${nextInstruction.text}`);
    }
  };

  // AI 코치 피드백 생성
  const generateCoachFeedback = (speed, heartRate, elapsedTime) => {
    const messages = [];
    
    // 속도 피드백
    if (exerciseType === 'running') {
      if (speed < 6) {
        messages.push('💪 속도를 조금 더 올려보세요!');
      } else if (speed > 12) {
        messages.push('⚡ 너무 빠릅니다! 페이스를 조절하세요');
      } else {
        messages.push('👍 완벽한 페이스입니다!');
      }
    }

    // 심박수 피드백
    const maxHR = 220 - 30; // 나이 30세 가정
    const targetZone = { min: maxHR * 0.5, max: maxHR * 0.85 };
    
    if (heartRate < targetZone.min) {
      messages.push('❤️ 운동 강도를 높여보세요');
    } else if (heartRate > targetZone.max) {
      messages.push('⚠️ 심박수가 높습니다. 속도를 줄이세요');
    } else {
      messages.push('💚 최적의 심박 구간입니다');
    }

    // 시간별 격려
    if (elapsedTime % 300 === 0) { // 5분마다
      messages.push('🎯 5분 더 달성! 계속 화이팅!');
    }

    if (messages.length > 0) {
      setCoachMessage(messages[Math.floor(Math.random() * messages.length)]);
    }
  };

  // 거리 계산 (미터)
  const calculateDistance = (pos1, pos2) => {
    const R = 6371e3;
    const φ1 = pos1.lat * Math.PI / 180;
    const φ2 = pos2.lat * Math.PI / 180;
    const Δφ = (pos2.lat - pos1.lat) * Math.PI / 180;
    const Δλ = (pos2.lng - pos1.lng) * Math.PI / 180;

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) *
      Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  // 운동 시작
  const startExercise = () => {
    console.log('🏃 운동 시작!');
    setIsExercising(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pathHistoryRef.current = [];
    distanceAccumulator.current = 0;
    startGPSTracking();
    setCoachMessage('운동을 시작합니다! 화이팅! 💪');
    
    // 시간 업데이트를 위한 interval 설정 (이게 빠져있었네요!)
    const timeInterval = setInterval(() => {
      if (!isPaused) {
        setExerciseData(prev => ({
          ...prev,
          time: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }
    }, 1000); // 1초마다 업데이트
    
    // interval ID 저장 (나중에 정리하기 위해)
    window.exerciseTimeInterval = timeInterval;
  };

  // 운동 일시정지
  const pauseExercise = () => {
    setIsPaused(true);
    setCoachMessage('일시정지 - 준비되면 계속하세요');
  };

  // 운동 재개
  const resumeExercise = () => {
    setIsPaused(false);
    setCoachMessage('운동을 재개합니다!');
  };

  // 운동 종료
  const stopExercise = () => {
    console.log('🎯 운동 종료');
    setIsExercising(false);
    setIsPaused(false);
    stopGPSTracking();
    
    // 시간 interval 정리
    if (window.exerciseTimeInterval) {
      clearInterval(window.exerciseTimeInterval);
      window.exerciseTimeInterval = null;
    }
    
    // 운동 결과 저장
    const result = {
      ...exerciseData,
      route: pathHistoryRef.current,
      date: new Date().toISOString()
    };
    
    // 결과 페이지로 이동
    navigate('/exercise-result', { state: { result } });
  };

  // 도착 처리
  const handleArrival = () => {
    setCoachMessage('🎉 목적지에 도착했습니다! 수고하셨습니다!');
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: '운동을 완료했습니다!'
    }]);
    
    // 3초 후 자동 종료
    setTimeout(() => {
      stopExercise();
    }, 3000);
  };

  // 시간 포맷
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* 상단 정보 바 */}
      <div className="bg-gray-800 text-white p-4 shadow-lg">
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400">
              {(exerciseData.distance / 1000).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">km/h</div>
          </div>
        </div>
      </div>

      {/* 네비게이션 안내 */}
      {currentInstruction && (
        <div className="bg-blue-600 text-white p-3">
          <div className="text-lg font-bold">{currentInstruction}</div>
          {nextInstruction && (
            <div className="text-sm opacity-75 mt-1">{nextInstruction}</div>
          )}
        </div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* GPS 상태 표시 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              gpsStatus === '연결됨' ? 'bg-green-500' : 
              gpsStatus === '연결중...' ? 'bg-yellow-500 animate-pulse' : 
              gpsStatus === '시뮬레이션' ? 'bg-purple-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {simulationMode ? '시뮬레이션' : `GPS: ${gpsStatus}`}
            </span>
            {gpsAccuracy > 0 && !simulationMode && (
              <span className="text-xs text-gray-500">(±{gpsAccuracy}m)</span>
            )}
          </div>
        </div>

        {/* 시뮬레이션 모드 표시 */}
        {simulationMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">🎬</div>
              <span className="text-sm font-bold">온천장 코스 시뮬레이션 모드</span>
            </div>
          </div>
        )}

        {/* 진행률 바 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 w-48">
          <div className="text-sm font-medium mb-1">진행률</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${routeProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{routeProgress.toFixed(0)}% 완료</div>
        </div>

        {/* AI 코치 메시지 */}
        <div className="absolute bottom-32 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤖</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">AI 코치</div>
              <div className="text-base font-semibold">{coachMessage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 상세 정보 및 컨트롤 */}
      <div className="bg-gray-800 text-white p-4">
        {/* 상세 데이터 */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div>
            <div className="text-xl font-bold text-orange-400">{exerciseData.heartRate}</div>
            <div className="text-xs text-gray-400">BPM</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{exerciseData.pace}</div>
            <div className="text-xs text-gray-400">페이스</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-400">{exerciseData.calories}</div>
            <div className="text-xs text-gray-400">칼로리</div>
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-400">{exerciseData.steps}</div>
            <div className="text-xs text-gray-400">걸음</div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex space-x-2">
          {!isExercising ? (
            <button
              onClick={startExercise}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <i className="fas fa-play mr-2"></i>
              운동 시작
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeExercise}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  계속
                </button>
              ) : (
                <button
                  onClick={pauseExercise}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-pause mr-2"></i>
                  일시정지
                </button>
              )}
              <button
                onClick={stopExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <i className="fas fa-stop mr-2"></i>
                종료
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracking;h</div>
          </div>
        </div>
      </div>

      {/* 네비게이션 안내 */}
      {currentInstruction && (
        <div className="bg-blue-600 text-white p-3">
          <div className="text-lg font-bold">{currentInstruction}</div>
          {nextInstruction && (
            <div className="text-sm opacity-75 mt-1">{nextInstruction}</div>
          )}
        </div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* GPS 상태 표시 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              gpsStatus === '연결됨' ? 'bg-green-500' : 
              gpsStatus === '연결중...' ? 'bg-yellow-500 animate-pulse' : 
              gpsStatus === '시뮬레이션' ? 'bg-purple-500 animate-pulse' :
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {simulationMode ? '시뮬레이션' : `GPS: ${gpsStatus}`}
            </span>
            {gpsAccuracy > 0 && !simulationMode && (
              <span className="text-xs text-gray-500">(±{gpsAccuracy}m)</span>
            )}
          </div>
        </div>

        {/* 시뮬레이션 모드 표시 */}
        {simulationMode && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-purple-600 text-white rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-pulse">🎬</div>
              <span className="text-sm font-bold">온천장 코스 시뮬레이션 모드</span>
            </div>
          </div>
        )}

        {/* 진행률 바 */}
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 w-48">
          <div className="text-sm font-medium mb-1">진행률</div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${routeProgress}%` }}
            ></div>
          </div>
          <div className="text-xs text-gray-500 mt-1">{routeProgress.toFixed(0)}% 완료</div>
        </div>

        {/* AI 코치 메시지 */}
        <div className="absolute bottom-32 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤖</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">AI 코치</div>
              <div className="text-base font-semibold">{coachMessage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 상세 정보 및 컨트롤 */}
      <div className="bg-gray-800 text-white p-4">
        {/* 상세 데이터 */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div>
            <div className="text-xl font-bold text-orange-400">{exerciseData.heartRate}</div>
            <div className="text-xs text-gray-400">BPM</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{exerciseData.pace}</div>
            <div className="text-xs text-gray-400">페이스</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-400">{exerciseData.calories}</div>
            <div className="text-xs text-gray-400">칼로리</div>
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-400">{exerciseData.steps}</div>
            <div className="text-xs text-gray-400">걸음</div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex space-x-2">
          {!isExercising ? (
            <button
              onClick={startExercise}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <i className="fas fa-play mr-2"></i>
              운동 시작
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeExercise}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  계속
                </button>
              ) : (
                <button
                  onClick={pauseExercise}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-pause mr-2"></i>
                  일시정지
                </button>
              )}
              <button
                onClick={stopExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <i className="fas fa-stop mr-2"></i>
                종료
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracking;text-xs text-gray-400">킬로미터</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400">
              {formatTime(exerciseData.time)}
            </div>
            <div className="text-xs text-gray-400">시간</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400">
              {exerciseData.speed}
            </div>
            <div className="text-xs text-gray-400">km/h</div>
          </div>
        </div>
      </div>

      {/* 네비게이션 안내 */}
      {currentInstruction && (
        <div className="bg-blue-600 text-white p-3">
          <div className="text-lg font-bold">{currentInstruction}</div>
          {nextInstruction && (
            <div className="text-sm opacity-75 mt-1">{nextInstruction}</div>
          )}
        </div>
      )}

      {/* 지도 영역 */}
      <div className="flex-1 relative">
        <div ref={mapRef} className="w-full h-full"></div>
        
        {/* GPS 상태 표시 */}
        <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${
              gpsStatus === '연결됨' ? 'bg-green-500' : 
              gpsStatus === '연결중...' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">GPS: {gpsStatus}</span>
            {gpsAccuracy > 0 && (
              <span className="text-xs text-gray-500">(±{gpsAccuracy}m)</span>
            )}
          </div>
        </div>

        {/* 진행률 바 */}
        {route && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 w-48">
            <div className="text-sm font-medium mb-1">진행률</div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{ width: `${routeProgress}%` }}
              ></div>
            </div>
            <div className="text-xs text-gray-500 mt-1">{routeProgress.toFixed(0)}% 완료</div>
          </div>
        )}

        {/* AI 코치 메시지 */}
        <div className="absolute bottom-32 left-4 right-4 bg-white/90 backdrop-blur rounded-lg shadow-lg p-3">
          <div className="flex items-center">
            <div className="text-2xl mr-3">🤖</div>
            <div className="flex-1">
              <div className="text-sm font-medium text-gray-700">AI 코치</div>
              <div className="text-base font-semibold">{coachMessage}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 상세 정보 및 컨트롤 */}
      <div className="bg-gray-800 text-white p-4">
        {/* 상세 데이터 */}
        <div className="grid grid-cols-4 gap-2 mb-4 text-center">
          <div>
            <div className="text-xl font-bold text-orange-400">{exerciseData.heartRate}</div>
            <div className="text-xs text-gray-400">BPM</div>
          </div>
          <div>
            <div className="text-xl font-bold text-purple-400">{exerciseData.pace}</div>
            <div className="text-xs text-gray-400">페이스</div>
          </div>
          <div>
            <div className="text-xl font-bold text-pink-400">{exerciseData.calories}</div>
            <div className="text-xs text-gray-400">칼로리</div>
          </div>
          <div>
            <div className="text-xl font-bold text-cyan-400">{exerciseData.steps}</div>
            <div className="text-xs text-gray-400">걸음</div>
          </div>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex space-x-2">
          {!isExercising ? (
            <button
              onClick={startExercise}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
            >
              <i className="fas fa-play mr-2"></i>
              운동 시작
            </button>
          ) : (
            <>
              {isPaused ? (
                <button
                  onClick={resumeExercise}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-play mr-2"></i>
                  계속
                </button>
              ) : (
                <button
                  onClick={pauseExercise}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
                >
                  <i className="fas fa-pause mr-2"></i>
                  일시정지
                </button>
              )}
              <button
                onClick={stopExercise}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-4 rounded-lg font-bold text-lg transition-colors"
              >
                <i className="fas fa-stop mr-2"></i>
                종료
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExerciseTracking;
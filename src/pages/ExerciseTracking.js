import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ONCHEONJANG_RUNNING_COURSE, generateSimulationData, updateSimulationData } from '../services/simulation/oncheonCourseSimulation';
import { COURSE_1, COURSE_2, GEUMJEONG_COURSE, DONGNAE_COURSE, generateCourse1SimulationData, generateCourse2SimulationData, updateCourseSimulationData } from '../services/courses/additionalCourses';

// 🏃‍♂️ 실시간 운동 트래킹 페이지
function ExerciseTracking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { route, exerciseType = 'running', simulationMode = false, simulationType = null } = location.state || {};
  
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
  
  // 시뮬레이션 관련
  const simulationDataRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const isExercisingRef = useRef(false); // 🔥 중요: useRef로 추가

  // 컴포넌트 마운트 시 자동으로 GPS 시작
  useEffect(() => {
    console.log('🏃 ExerciseTracking 페이지 로드됨');
    console.log('운동 타입:', exerciseType);
    
    // 1초 후 자동으로 운동 시작
    const autoStartTimer = setTimeout(() => {
      console.log('⏱️ 자동으로 운동을 시작합니다!');
      startExercise();
    }, 1000);
    
    return () => {
      clearTimeout(autoStartTimer);
      // 페이지 벗어날 때 정리
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
      }
    };
  }, []);

  // 🔥 isExercising 상태가 변경될 때마다 ref도 업데이트
  useEffect(() => {
    isExercisingRef.current = isExercising;
  }, [isExercising]);
  
  // 지도 초기화
  useEffect(() => {
    if (!mapRef.current || !window.google) return;
    
    // 시뮬레이션 코스에 따라 중심 설정
    let centerPoint;
    let course;
    
    if (simulationMode) {
      if (simulationType === 'oncheonCourse') {
        course = ONCHEONJANG_RUNNING_COURSE;
        centerPoint = course.path[0];
      } else if (simulationType === 'customCourse1') {
        course = COURSE_1;
        centerPoint = course.path[0];
      } else if (simulationType === 'customCourse2') {
        course = COURSE_2;
        centerPoint = course.path[0];
      } else if (simulationType === 'geumjeongCourse') {
        course = GEUMJEONG_COURSE;
        centerPoint = course.path[0];
      } else if (simulationType === 'dongnaeCourse') {
        course = DONGNAE_COURSE;
        centerPoint = course.path[0];
      }
    }
    
    if (!centerPoint) {
      centerPoint = route?.path?.[0] || { lat: 37.5665, lng: 126.9780 };
    }

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: simulationMode ? 15 : 17,
      center: centerPoint,
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

    // 시뮬레이션 코스 표시
    if (simulationMode && course) {
      const fullPath = course.path.map(p => ({ lat: p.lat, lng: p.lng }));
      
      // 전체 경로 그리기
      const routePath = new window.google.maps.Polyline({
        path: fullPath,
        geodesic: true,
        strokeColor: '#3B82F6',
        strokeOpacity: 0.5,
        strokeWeight: 6
      });
      routePath.setMap(map);
      routePolylineRef.current = routePath;
      
      // 시작점 마커
      new window.google.maps.Marker({
        position: course.path[0],
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        title: '시작점'
      });
      
      // 경유지 마커들
      course.path.forEach(point => {
        if (point.label && point.label !== '시작' && point.label !== '도착') {
          new window.google.maps.Marker({
            position: { lat: point.lat, lng: point.lng },
            map: map,
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
              scale: 8,
              fillColor: '#3B82F6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2
            },
            title: point.label
          });
        }
      });
      
      // 도착지 마커
      const arrivalPoint = course.path[course.path.length - 1];
      new window.google.maps.Marker({
        position: arrivalPoint,
        map: map,
        icon: {
          path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
          scale: 10,
          fillColor: '#EF4444',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 3
        },
        title: '도착지'
      });
    }

    // 사용자 위치 마커
    const userMarker = new window.google.maps.Marker({
      map: map,
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        scale: 12,
        fillColor: '#EF4444',
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

  }, [route, simulationMode, simulationType]);

  // 온천장 코스 시뮬레이션 - 🔥 부드러운 움직임 버전
  const startOncheonCourseSimulation = () => {
    console.log('📍 온천장 코스 시작!');
    
    // 시뮬레이션 데이터 초기화
    simulationDataRef.current = generateSimulationData();
    
    let elapsedSeconds = 0;
    const updateInterval = 100; // 0.1초마다 업데이트 (더 부드러운 움직임)
    
    // 시뮬레이션 인터벌 (0.1초마다 업데이트)
    simulationIntervalRef.current = setInterval(() => {
      // 🔥 중요: isExercisingRef.current 사용
      if (!isExercisingRef.current || isPaused) {
        return;
      }
      
      elapsedSeconds += updateInterval / 1000; // 초 단위로 변환
      
      // 1% 단위로 진행 (540초 = 9분)
      const progress = Math.min((elapsedSeconds / 540) * 100, 100);
      
      // 시뮬레이션 데이터 업데이트
      const updatedData = updateSimulationData(simulationDataRef.current, elapsedSeconds);
      simulationDataRef.current = updatedData;
      
      // 현재 위치
      const currentPoint = updatedData.currentPosition;
      
      if (!currentPoint) {
        // 시뮬레이션 완료
        console.log('🎯 코스 완료!');
        handleSimulationComplete();
        return;
      }
      
      // 위치 업데이트
      setCurrentPosition({
        lat: currentPoint.lat,
        lng: currentPoint.lng
      });
      
      // 지도 업데이트 (부드러운 이동)
      if (userMarkerRef.current && mapInstanceRef.current) {
        const latLng = new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng);
        userMarkerRef.current.setPosition(latLng);
        
        // 0.5초마다 지도 중심 이동 (너무 자주 움직이면 어지러움)
        if (Math.floor(elapsedSeconds * 2) % 1 === 0 && !isPaused) {
          mapInstanceRef.current.panTo(latLng);
        }
      }
      
      // 🔥 운동 데이터 업데이트 - 1초마다만 업데이트
      if (Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        const newExerciseData = {
          distance: updatedData.totalDistance,
          time: Math.floor(elapsedSeconds),
          speed: updatedData.currentSpeed,
          avgSpeed: updatedData.avgSpeed,
          maxSpeed: Math.max(exerciseData.maxSpeed || 0, parseFloat(updatedData.currentSpeed)),
          heartRate: updatedData.currentHeartRate,
          calories: updatedData.calories,
          pace: updatedData.pace,
          altitude: 10 + Math.random() * 5,
          steps: updatedData.steps
        };
        
        setExerciseData(newExerciseData);
      }
      
      // 진행률 업데이트 (부드럽게)
      setRouteProgress(progress);
      
      // 지나온 경로 업데이트 (0.5초마다)
      if (elapsedSeconds % 0.5 < updateInterval / 1000) {
        pathHistoryRef.current.push(currentPoint);
        if (passedPolylineRef.current) {
          passedPolylineRef.current.setPath(
            pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
          );
        }
      }
      
      // AI 코치 메시지 (10초마다)
      if (Math.floor(elapsedSeconds) % 10 === 0 && Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        generateCoachFeedback(
          parseFloat(updatedData.currentSpeed),
          updatedData.currentHeartRate,
          elapsedSeconds
        );
      }
      
      // 9분(540초) 후 자동 종료
      if (elapsedSeconds >= 540 || updatedData.completed) {
        handleSimulationComplete();
      }
    }, updateInterval); // 0.1초마다 업데이트
  };
  
  // 커스텀 코스 1 (서동 시장) 시뮬레이션
  const startCustomCourse1Simulation = () => {
    console.log('📍 서동 시장 코스 시작!');
    
    simulationDataRef.current = generateCourse1SimulationData();
    
    let elapsedSeconds = 0;
    const updateInterval = 100;
    const targetDuration = 1020; // 17분 = 1020초
    
    simulationIntervalRef.current = setInterval(() => {
      if (!isExercisingRef.current || isPaused) return;
      
      elapsedSeconds += updateInterval / 1000;
      const progress = Math.min((elapsedSeconds / targetDuration) * 100, 100);
      
      const updatedData = updateCourseSimulationData(simulationDataRef.current, elapsedSeconds);
      simulationDataRef.current = updatedData;
      
      const currentPoint = updatedData.currentPosition;
      if (!currentPoint || updatedData.completed) {
        console.log('🎯 코스 완료!');
        handleSimulationComplete();
        return;
      }
      
      setCurrentPosition({ lat: currentPoint.lat, lng: currentPoint.lng });
      
      if (userMarkerRef.current && mapInstanceRef.current) {
        const latLng = new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng);
        userMarkerRef.current.setPosition(latLng);
        if (Math.floor(elapsedSeconds * 2) % 1 === 0 && !isPaused) {
          mapInstanceRef.current.panTo(latLng);
        }
      }
      
      if (Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        setExerciseData({
          distance: updatedData.totalDistance,
          time: Math.floor(elapsedSeconds),
          speed: updatedData.currentSpeed,
          avgSpeed: updatedData.avgSpeed,
          maxSpeed: Math.max(exerciseData.maxSpeed || 0, parseFloat(updatedData.currentSpeed)),
          heartRate: updatedData.currentHeartRate,
          calories: updatedData.calories,
          pace: updatedData.pace,
          altitude: 10 + Math.random() * 5,
          steps: updatedData.steps
        });
      }
      
      setRouteProgress(progress);
      
      if (elapsedSeconds % 0.5 < updateInterval / 1000) {
        pathHistoryRef.current.push(currentPoint);
        if (passedPolylineRef.current) {
          passedPolylineRef.current.setPath(
            pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
          );
        }
      }
      
      if (Math.floor(elapsedSeconds) % 10 === 0 && Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        generateCoachFeedback(
          parseFloat(updatedData.currentSpeed),
          updatedData.currentHeartRate,
          elapsedSeconds
        );
      }
      
      if (elapsedSeconds >= targetDuration || updatedData.completed) {
        handleSimulationComplete();
      }
    }, updateInterval);
  };
  
  // 커스텀 코스 2 (장거리) 시뮬레이션
  const startCustomCourse2Simulation = () => {
    console.log('📍 부산 장거리 코스 시작!');
    
    simulationDataRef.current = generateCourse2SimulationData();
    
    let elapsedSeconds = 0;
    const updateInterval = 100;
    const targetDuration = 1680; // 28분 = 1680초
    
    simulationIntervalRef.current = setInterval(() => {
      if (!isExercisingRef.current || isPaused) return;
      
      elapsedSeconds += updateInterval / 1000;
      const progress = Math.min((elapsedSeconds / targetDuration) * 100, 100);
      
      const updatedData = updateCourseSimulationData(simulationDataRef.current, elapsedSeconds);
      simulationDataRef.current = updatedData;
      
      const currentPoint = updatedData.currentPosition;
      if (!currentPoint || updatedData.completed) {
        console.log('🎯 코스 완료!');
        handleSimulationComplete();
        return;
      }
      
      setCurrentPosition({ lat: currentPoint.lat, lng: currentPoint.lng });
      
      if (userMarkerRef.current && mapInstanceRef.current) {
        const latLng = new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng);
        userMarkerRef.current.setPosition(latLng);
        if (Math.floor(elapsedSeconds * 2) % 1 === 0 && !isPaused) {
          mapInstanceRef.current.panTo(latLng);
        }
      }
      
      if (Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        setExerciseData({
          distance: updatedData.totalDistance,
          time: Math.floor(elapsedSeconds),
          speed: updatedData.currentSpeed,
          avgSpeed: updatedData.avgSpeed,
          maxSpeed: Math.max(exerciseData.maxSpeed || 0, parseFloat(updatedData.currentSpeed)),
          heartRate: updatedData.currentHeartRate,
          calories: updatedData.calories,
          pace: updatedData.pace,
          altitude: 10 + Math.random() * 5,
          steps: updatedData.steps
        });
      }
      
      setRouteProgress(progress);
      
      if (elapsedSeconds % 0.5 < updateInterval / 1000) {
        pathHistoryRef.current.push(currentPoint);
        if (passedPolylineRef.current) {
          passedPolylineRef.current.setPath(
            pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
          );
        }
      }
      
      if (Math.floor(elapsedSeconds) % 15 === 0 && Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        generateCoachFeedback(
          parseFloat(updatedData.currentSpeed),
          updatedData.currentHeartRate,
          elapsedSeconds
        );
      }
      
      if (elapsedSeconds >= targetDuration || updatedData.completed) {
        handleSimulationComplete();
      }
    }, updateInterval);
  };
  
  // 금정구 코스 시뮬레이션
  const startGeumjeongCourseSimulation = () => {
    console.log('📍 금정구 코스 시작!');
    
    // 시뮬레이션 데이터 초기화
    simulationDataRef.current = generateCourse1SimulationData();
    
    let elapsedSeconds = 0;
    const updateInterval = 100; // 0.1초마다 업데이트
    const targetDuration = 1200; // 20분 = 1200초
    
    simulationIntervalRef.current = setInterval(() => {
      if (!isExercisingRef.current || isPaused) {
        return;
      }
      
      elapsedSeconds += updateInterval / 1000;
      const progress = Math.min((elapsedSeconds / targetDuration) * 100, 100);
      
      // 시뮬레이션 데이터 업데이트
      const updatedData = updateCourseSimulationData(simulationDataRef.current, elapsedSeconds);
      simulationDataRef.current = updatedData;
      
      const currentPoint = updatedData.currentPosition;
      
      if (!currentPoint || updatedData.completed) {
        console.log('🎯 코스 완료!');
        handleSimulationComplete();
        return;
      }
      
      // 위치 업데이트
      setCurrentPosition({
        lat: currentPoint.lat,
        lng: currentPoint.lng
      });
      
      // 지도 업데이트 (부드러운 이동)
      if (userMarkerRef.current && mapInstanceRef.current) {
        const latLng = new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng);
        userMarkerRef.current.setPosition(latLng);
        
        if (Math.floor(elapsedSeconds * 2) % 1 === 0 && !isPaused) {
          mapInstanceRef.current.panTo(latLng);
        }
      }
      
      // 운동 데이터 업데이트 (1초마다)
      if (Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        setExerciseData({
          distance: updatedData.totalDistance,
          time: Math.floor(elapsedSeconds),
          speed: updatedData.currentSpeed,
          avgSpeed: updatedData.avgSpeed,
          maxSpeed: Math.max(exerciseData.maxSpeed || 0, parseFloat(updatedData.currentSpeed)),
          heartRate: updatedData.currentHeartRate,
          calories: updatedData.calories,
          pace: updatedData.pace,
          altitude: 10 + Math.random() * 5,
          steps: updatedData.steps
        });
      }
      
      setRouteProgress(progress);
      
      // 지나온 경로 업데이트
      if (elapsedSeconds % 0.5 < updateInterval / 1000) {
        pathHistoryRef.current.push(currentPoint);
        if (passedPolylineRef.current) {
          passedPolylineRef.current.setPath(
            pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
          );
        }
      }
      
      // AI 코치 메시지 (10초마다)
      if (Math.floor(elapsedSeconds) % 10 === 0 && Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        generateCoachFeedback(
          parseFloat(updatedData.currentSpeed),
          updatedData.currentHeartRate,
          elapsedSeconds
        );
      }
      
      if (elapsedSeconds >= targetDuration || updatedData.completed) {
        handleSimulationComplete();
      }
    }, updateInterval);
  };
  
  // 동래구 코스 시뮬레이션
  const startDongnaeCourseSimulation = () => {
    console.log('📍 동래구 코스 시작!');
    
    // 시믌레이션 데이터 초기화
    simulationDataRef.current = generateCourse2SimulationData();
    
    let elapsedSeconds = 0;
    const updateInterval = 100; // 0.1초마다 업데이트
    const targetDuration = 2100; // 35분 = 2100초
    
    simulationIntervalRef.current = setInterval(() => {
      if (!isExercisingRef.current || isPaused) {
        return;
      }
      
      elapsedSeconds += updateInterval / 1000;
      const progress = Math.min((elapsedSeconds / targetDuration) * 100, 100);
      
      // 시뮬레이션 데이터 업데이트
      const updatedData = updateCourseSimulationData(simulationDataRef.current, elapsedSeconds);
      simulationDataRef.current = updatedData;
      
      const currentPoint = updatedData.currentPosition;
      
      if (!currentPoint || updatedData.completed) {
        console.log('🎯 코스 완료!');
        handleSimulationComplete();
        return;
      }
      
      // 위치 업데이트
      setCurrentPosition({
        lat: currentPoint.lat,
        lng: currentPoint.lng
      });
      
      // 지도 업데이트 (부드러운 이동)
      if (userMarkerRef.current && mapInstanceRef.current) {
        const latLng = new window.google.maps.LatLng(currentPoint.lat, currentPoint.lng);
        userMarkerRef.current.setPosition(latLng);
        
        if (Math.floor(elapsedSeconds * 2) % 1 === 0 && !isPaused) {
          mapInstanceRef.current.panTo(latLng);
        }
      }
      
      // 운동 데이터 업데이트 (1초마다)
      if (Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        setExerciseData({
          distance: updatedData.totalDistance,
          time: Math.floor(elapsedSeconds),
          speed: updatedData.currentSpeed,
          avgSpeed: updatedData.avgSpeed,
          maxSpeed: Math.max(exerciseData.maxSpeed || 0, parseFloat(updatedData.currentSpeed)),
          heartRate: updatedData.currentHeartRate,
          calories: updatedData.calories,
          pace: updatedData.pace,
          altitude: 10 + Math.random() * 5,
          steps: updatedData.steps
        });
      }
      
      setRouteProgress(progress);
      
      // 지나온 경로 업데이트
      if (elapsedSeconds % 0.5 < updateInterval / 1000) {
        pathHistoryRef.current.push(currentPoint);
        if (passedPolylineRef.current) {
          passedPolylineRef.current.setPath(
            pathHistoryRef.current.map(p => ({ lat: p.lat, lng: p.lng }))
          );
        }
      }
      
      // AI 코치 메시지 (15초마다 - 장거리 코스)
      if (Math.floor(elapsedSeconds) % 15 === 0 && Math.floor(elapsedSeconds) !== Math.floor(elapsedSeconds - updateInterval / 1000)) {
        generateCoachFeedback(
          parseFloat(updatedData.currentSpeed),
          updatedData.currentHeartRate,
          elapsedSeconds
        );
      }
      
      if (elapsedSeconds >= targetDuration || updatedData.completed) {
        handleSimulationComplete();
      }
    }, updateInterval);
  };
  const handleSimulationComplete = () => {
    clearInterval(simulationIntervalRef.current);
    simulationIntervalRef.current = null;
    
    // 최종 데이터 확인
    if (simulationDataRef.current) {
      const finalData = simulationDataRef.current;
      console.log('시뮬레이션 완료 데이터:', finalData);
      
      // 최종 데이터로 운동 데이터 업데이트
      setExerciseData({
        distance: finalData.totalDistance || 1500,
        time: finalData.elapsedTime || 540,
        speed: parseFloat(finalData.currentSpeed) || 10,
        avgSpeed: parseFloat(finalData.avgSpeed) || 10,
        maxSpeed: 11.5,
        heartRate: finalData.currentHeartRate || 145,
        calories: finalData.calories || 75,
        pace: finalData.pace || '6:00',
        altitude: 10,
        steps: finalData.steps || 1950
      });
    }
    
    setCoachMessage('🎉 목표를 달성했습니다! 수고하셨습니다!');
    setAlerts(prev => [...prev, {
      id: Date.now(),
      type: 'success',
      message: '온천장 코스를 완주했습니다!'
    }]);
    
    // 3초 후 자동 종료
    setTimeout(() => {
      stopExercise();
    }, 3000);
  };

  // GPS 위치가 없을 때를 위한 시뮬레이션 모드
  const startSimulationMode = () => {
    console.log('🎮 시뮬레이션 모드로 실행');
    setGpsStatus('연결됨');
    
    // 코스별 시뮬레이션
    if (simulationType === 'oncheonCourse') {
      console.log('🏃 온천장 코스 시작!');
      startOncheonCourseSimulation();
    } else if (simulationType === 'customCourse1') {
      console.log('🏃 서동 시장 코스 시작!');
      startCustomCourse1Simulation();
    } else if (simulationType === 'customCourse2') {
      console.log('🏃 부산 장거리 코스 시작!');
      startCustomCourse2Simulation();
    } else if (simulationType === 'geumjeongCourse') {
      console.log('🏃 금정구 코스 시작!');
      startGeumjeongCourseSimulation();
    } else if (simulationType === 'dongnaeCourse') {
      console.log('🏃 동래구 코스 시작!');
      startDongnaeCourseSimulation();
    }
  };
  
  // GPS 위치 추적 시작
  const startGPSTracking = () => {
    // GPS 모드 시작
    if (simulationMode) {
      console.log('📱 GPS 트래킹 시작');
      startSimulationMode();
      return;
    }
  };

  // GPS 추적 중지
  const stopGPSTracking = () => {
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
      setGpsStatus('중지됨');
    }
    
    if (window.simulationInterval) {
      clearInterval(window.simulationInterval);
      window.simulationInterval = null;
    }
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }
  };

  // AI 코치 피드백 생성
  const generateCoachFeedback = (speed, heartRate, elapsedTime) => {
    const messages = [];
    
    if (exerciseType === 'running') {
      if (speed < 6) {
        messages.push('💪 속도를 조금 더 올려보세요!');
      } else if (speed > 12) {
        messages.push('⚡ 너무 빠릅니다! 페이스를 조절하세요');
      } else {
        messages.push('👍 완벽한 페이스입니다!');
      }
    }

    const maxHR = 220 - 30;
    const targetZone = { min: maxHR * 0.5, max: maxHR * 0.85 };
    
    if (heartRate < targetZone.min) {
      messages.push('❤️ 운동 강도를 높여보세요');
    } else if (heartRate > targetZone.max) {
      messages.push('⚠️ 심박수가 높습니다. 속도를 줄이세요');
    } else {
      messages.push('💚 최적의 심박 구간입니다');
    }

    if (elapsedTime % 300 === 0) {
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

  // 🔥 운동 시작 - 수정된 버전
  const startExercise = () => {
    console.log('🏃 운동 시작!');
    setIsExercising(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    pathHistoryRef.current = [];
    distanceAccumulator.current = 0;
    setCoachMessage('운동을 시작합니다! 화이팅! 💪');
    
    // 🔥 중요: GPS 추적을 먼저 시작
    startGPSTracking();
    
    // 시간 업데이트 인터벌
    const timeInterval = setInterval(() => {
      if (!isPaused && isExercisingRef.current) {
        setExerciseData(prev => ({
          ...prev,
          time: Math.floor((Date.now() - startTimeRef.current) / 1000)
        }));
      }
    }, 1000);
    
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
    console.log('최종 운동 데이터:', exerciseData);
    
    setIsExercising(false);
    setIsPaused(false);
    stopGPSTracking();
    
    if (window.exerciseTimeInterval) {
      clearInterval(window.exerciseTimeInterval);
      window.exerciseTimeInterval = null;
    }
    
    // 시뮬레이션 데이터 확인 및 보정
    const finalData = simulationType === 'oncheonCourse' && simulationDataRef.current ? {
      distance: simulationDataRef.current.totalDistance || exerciseData.distance,
      time: exerciseData.time || 540, // 기본 9분
      speed: simulationDataRef.current.currentSpeed || exerciseData.speed,
      avgSpeed: simulationDataRef.current.avgSpeed || exerciseData.avgSpeed,
      maxSpeed: exerciseData.maxSpeed || 11.5,
      heartRate: simulationDataRef.current.currentHeartRate || exerciseData.heartRate || 145,
      calories: simulationDataRef.current.calories || exerciseData.calories,
      pace: simulationDataRef.current.pace || exerciseData.pace,
      altitude: exerciseData.altitude || 10,
      steps: simulationDataRef.current.steps || exerciseData.steps
    } : exerciseData;
    
    const result = {
      ...finalData,
      route: pathHistoryRef.current,
      date: new Date().toISOString(),
      courseName: simulationType === 'oncheonCourse' ? '온천장 러닝 코스' : '자유 러닝',
      exerciseType: exerciseType
    };
    
    console.log('전달할 결과 데이터:', result);
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
            <div className="text-xs text-gray-400">킬로미터</div>
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
              gpsStatus === '연결됨' || simulationMode ? 'bg-green-500' : 
              gpsStatus === '연결중...' ? 'bg-yellow-500 animate-pulse' : 
              'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              GPS: {simulationMode ? '연결됨' : gpsStatus}
            </span>
            {(gpsAccuracy > 0 || simulationMode) && (
              <span className="text-xs text-gray-500">(±{simulationMode ? '5' : gpsAccuracy}m)</span>
            )}
          </div>
        </div>

        {/* 코스 이름 표시 (시뮬레이션 언급 제거) */}
        {simulationType && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white rounded-lg shadow-lg px-4 py-2">
            <div className="flex items-center space-x-2">
              <div>📍</div>
              <span className="text-sm font-bold">
                {simulationType === 'oncheonCourse' && '온천장 러닝 코스'}
                {simulationType === 'customCourse1' && '서동 시장 러닝 코스'}
                {simulationType === 'customCourse2' && '부산 장거리 러닝 코스'}
                {simulationType === 'geumjeongCourse' && '금정구 편도 코스'}
                {simulationType === 'dongnaeCourse' && '동래구 순환 코스'}
              </span>
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

export default ExerciseTracking;
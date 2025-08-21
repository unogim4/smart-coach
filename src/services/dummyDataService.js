// 📊 일주일 운동 기록 더미 데이터 생성 서비스

import { getFirestore, doc, setDoc, collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// 서울 주요 러닝 코스 데이터
const SEOUL_RUNNING_COURSES = [
  {
    name: '한강 러닝 (여의도-반포)',
    startAddress: '서울시 영등포구 여의도 한강공원',
    endAddress: '서울시 서초구 반포 한강공원',
    waypoints: ['마포대교', '한강대교', '동작대교', '반포대교'],
    distance: 8500,
    elevation: 15
  },
  {
    name: '남산 둘레길',
    startAddress: '서울시 중구 남산공원 북측순환로',
    endAddress: '서울시 중구 남산공원 북측순환로',
    waypoints: ['국립극장', '남산도서관', '백범광장', 'N서울타워'],
    distance: 7400,
    elevation: 125
  },
  {
    name: '경복궁-창덕궁 코스',
    startAddress: '서울시 종로구 경복궁',
    endAddress: '서울시 종로구 창덕궁',
    waypoints: ['광화문', '삼청동', '북촌한옥마을', '창덕궁'],
    distance: 4200,
    elevation: 45
  },
  {
    name: '올림픽공원 러닝',
    startAddress: '서울시 송파구 올림픽공원 평화의문',
    endAddress: '서울시 송파구 올림픽공원 평화의문',
    waypoints: ['몽촌토성', '88호수', '장미광장', '올림픽홀'],
    distance: 5000,
    elevation: 20
  },
  {
    name: '청계천 러닝',
    startAddress: '서울시 중구 청계광장',
    endAddress: '서울시 성동구 고산자교',
    waypoints: ['광통교', '삼일교', '오간수교', '고산자교'],
    distance: 6000,
    elevation: 10
  },
  {
    name: '양재천 러닝',
    startAddress: '서울시 서초구 양재시민의숲',
    endAddress: '서울시 강남구 대치동',
    waypoints: ['영동1교', '영동2교', '영동3교', '탄천합류부'],
    distance: 4800,
    elevation: 8
  },
  {
    name: '서울숲 러닝',
    startAddress: '서울시 성동구 서울숲 정문',
    endAddress: '서울시 성동구 서울숲 정문',
    waypoints: ['생태숲', '문화예술공원', '한강전망대', '곤충식물원'],
    distance: 3500,
    elevation: 12
  }
];

// 날씨 데이터
const WEATHER_CONDITIONS = [
  { condition: '맑음', temp: 18, humidity: 55, wind: 2.3 },
  { condition: '구름조금', temp: 20, humidity: 60, wind: 3.1 },
  { condition: '흐림', temp: 16, humidity: 70, wind: 4.2 },
  { condition: '맑음', temp: 22, humidity: 45, wind: 1.8 },
  { condition: '구름많음', temp: 19, humidity: 65, wind: 2.7 },
  { condition: '맑음', temp: 21, humidity: 50, wind: 2.1 },
  { condition: '구름조금', temp: 17, humidity: 58, wind: 3.5 }
];

// 일주일 운동 기록 생성 함수
export function generateWeeklyWorkoutData(userId = 'demo_user') {
  const workouts = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    // 날짜 설정
    const workoutDate = new Date(today);
    workoutDate.setDate(today.getDate() - i);
    
    // 주말은 50% 확률로 쉬기
    if ((workoutDate.getDay() === 0 || workoutDate.getDay() === 6) && Math.random() > 0.5) {
      continue;
    }
    
    // 운동 시간 설정 (오전/오후/저녁)
    const timeSlot = Math.floor(Math.random() * 3);
    const hour = timeSlot === 0 ? 6 + Math.floor(Math.random() * 2) : // 오전 6-8시
                 timeSlot === 1 ? 12 + Math.floor(Math.random() * 2) : // 점심 12-2시
                 18 + Math.floor(Math.random() * 2); // 저녁 6-8시
    
    workoutDate.setHours(hour, Math.floor(Math.random() * 60), 0, 0);
    
    // 코스 선택
    const course = SEOUL_RUNNING_COURSES[Math.floor(Math.random() * SEOUL_RUNNING_COURSES.length)];
    
    // 거리 (코스의 80-120% 랜덤)
    const distanceMultiplier = 0.8 + Math.random() * 0.4;
    const distance = Math.round(course.distance * distanceMultiplier);
    
    // 페이스 및 속도
    const pace = 5.5 + Math.random() * 1.5; // 5:30 ~ 7:00 per km
    const paceMinutes = Math.floor(pace);
    const paceSeconds = Math.round((pace - paceMinutes) * 60);
    const paceString = `${paceMinutes}:${paceSeconds.toString().padStart(2, '0')}`;
    const avgSpeed = Number((60 / pace).toFixed(1));
    
    // 운동 시간 (초)
    const duration = Math.round((distance / 1000) * pace * 60);
    
    // 심박수
    const avgHeartRate = 135 + Math.round(Math.random() * 25);
    const maxHeartRate = avgHeartRate + 20 + Math.round(Math.random() * 15);
    const minHeartRate = 90 + Math.round(Math.random() * 10);
    
    // 칼로리 및 걸음수
    const calories = Math.round((distance / 1000) * 65 * (1 + Math.random() * 0.2));
    const steps = Math.round(distance * 1.3 + Math.random() * 200);
    
    // 날씨
    const weather = WEATHER_CONDITIONS[i % WEATHER_CONDITIONS.length];
    
    // 구간별 속도 생성
    const segmentSpeeds = [];
    const segmentCount = Math.ceil(distance / 500);
    for (let s = 0; s < segmentCount; s++) {
      segmentSpeeds.push({
        distance: Math.min((s + 1) * 500, distance),
        speed: avgSpeed + (Math.random() - 0.5) * 2,
        time: Math.round(180 + Math.random() * 60),
        heartRate: avgHeartRate + Math.round((Math.random() - 0.5) * 20),
        elevation: Math.round((Math.random() - 0.5) * 10)
      });
    }
    
    // 심박수 히스토리 생성
    const heartRateHistory = [];
    const historyPoints = Math.ceil(duration / 120); // 2분 간격
    for (let h = 0; h <= historyPoints; h++) {
      heartRateHistory.push({
        time: h * 120,
        heartRate: h === 0 ? 75 : 
                   h === historyPoints ? 95 :
                   avgHeartRate + Math.round((Math.random() - 0.5) * 20)
      });
    }
    
    // 운동 데이터 생성
    const workout = {
      id: `workout_${workoutDate.getTime()}`,
      userId: userId,
      timestamp: workoutDate.toISOString(),
      date: workoutDate.toLocaleDateString('ko-KR'),
      time: workoutDate.toLocaleTimeString('ko-KR'),
      
      // 운동 데이터
      exerciseType: 'running',
      distance: distance,
      duration: duration,
      calories: calories,
      avgSpeed: avgSpeed,
      maxSpeed: avgSpeed + 1.5 + Math.random() * 2,
      pace: paceString,
      steps: steps,
      elevation: course.elevation,
      
      // 심박수 데이터
      avgHeartRate: avgHeartRate,
      maxHeartRate: maxHeartRate,
      minHeartRate: minHeartRate,
      heartRate: avgHeartRate, // 호환성
      heartRateHistory: heartRateHistory,
      
      // 경로 정보
      routeInfo: {
        name: course.name,
        startLocation: {
          address: course.startAddress,
          lat: 37.5665 + (Math.random() - 0.5) * 0.1,
          lng: 126.9780 + (Math.random() - 0.5) * 0.1
        },
        endLocation: {
          address: course.endAddress,
          lat: 37.5665 + (Math.random() - 0.5) * 0.1,
          lng: 126.9780 + (Math.random() - 0.5) * 0.1
        },
        waypoints: course.waypoints.map((wp, idx) => ({
          name: wp,
          distance: Math.round((distance / course.waypoints.length) * (idx + 1))
        }))
      },
      
      // 구간별 속도
      segmentSpeeds: segmentSpeeds,
      
      // 날씨 정보
      weather: {
        condition: weather.condition,
        temperature: weather.temp,
        humidity: weather.humidity,
        windSpeed: weather.wind
      },
      
      // 심박수 Zone (간단한 버전)
      heartRateZones: {
        zone1: { name: '회복', percentage: 5, time: Math.round(duration * 0.05) },
        zone2: { name: '지방연소', percentage: 25, time: Math.round(duration * 0.25) },
        zone3: { name: '유산소', percentage: 50, time: Math.round(duration * 0.50) },
        zone4: { name: '무산소', percentage: 18, time: Math.round(duration * 0.18) },
        zone5: { name: '최대', percentage: 2, time: Math.round(duration * 0.02) }
      },
      
      // 신체 정보
      bodyMetrics: {
        weight: 70,
        height: 175,
        age: 30,
        gender: 'male',
        bmi: 22.9,
        vo2max: 42 + Math.round(Math.random() * 8),
        fitnessLevel: avgSpeed > 10 ? 'good' : 'average'
      }
    };
    
    workouts.push(workout);
  }
  
  return workouts;
}

// Firebase에 저장
export async function saveWeeklyWorkoutsToFirebase() {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.error('로그인이 필요합니다.');
      return false;
    }
    
    const db = getFirestore();
    const workouts = generateWeeklyWorkoutData(user.uid);
    
    console.log(`📊 ${workouts.length}개의 운동 기록을 생성합니다...`);
    
    for (const workout of workouts) {
      const docId = `${user.uid}_${new Date(workout.timestamp).getTime()}`;
      await setDoc(doc(db, 'workouts', docId), workout);
      console.log(`✅ ${workout.date} 운동 기록 저장 완료`);
    }
    
    console.log('🎉 모든 운동 기록이 성공적으로 저장되었습니다!');
    return true;
  } catch (error) {
    console.error('❌ 운동 기록 저장 실패:', error);
    return false;
  }
}

// 로컬 스토리지에 저장 (테스트용)
export function saveWeeklyWorkoutsToLocal() {
  const workouts = generateWeeklyWorkoutData('local_user');
  localStorage.setItem('weeklyWorkouts', JSON.stringify(workouts));
  console.log('📊 일주일 운동 기록이 로컬 스토리지에 저장되었습니다!');
  console.log(`총 ${workouts.length}개의 운동 기록:`, workouts);
  return workouts;
}

// 저장된 운동 기록 불러오기
export async function getWeeklyWorkouts(source = 'local') {
  if (source === 'local') {
    const data = localStorage.getItem('weeklyWorkouts');
    if (data) {
      return JSON.parse(data);
    } else {
      // 로컬에 데이터가 없으면 생성
      return saveWeeklyWorkoutsToLocal();
    }
  }
  
  // Firebase에서 불러오기
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      console.log('로그인이 필요합니다. 로컬 데이터를 사용합니다.');
      return getWeeklyWorkouts('local');
    }
    
    const db = getFirestore();
    const workoutsRef = collection(db, 'workouts');
    const q = query(
      workoutsRef,
      where('userId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const workouts = [];
    
    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });
    
    return workouts;
  } catch (error) {
    console.error('운동 기록 불러오기 실패:', error);
    return getWeeklyWorkouts('local');
  }
}

// 통계 계산 함수
export function calculateWeeklyStats(workouts) {
  if (!workouts || workouts.length === 0) return null;
  
  const stats = {
    totalWorkouts: workouts.length,
    totalDistance: 0,
    totalDuration: 0,
    totalCalories: 0,
    avgSpeed: 0,
    avgHeartRate: 0,
    bestDistance: 0,
    bestSpeed: 0,
    totalSteps: 0
  };
  
  workouts.forEach(workout => {
    stats.totalDistance += workout.distance;
    stats.totalDuration += workout.duration;
    stats.totalCalories += workout.calories;
    stats.totalSteps += workout.steps;
    
    if (workout.distance > stats.bestDistance) {
      stats.bestDistance = workout.distance;
    }
    if (workout.avgSpeed > stats.bestSpeed) {
      stats.bestSpeed = workout.avgSpeed;
    }
  });
  
  stats.avgSpeed = (workouts.reduce((sum, w) => sum + w.avgSpeed, 0) / workouts.length).toFixed(1);
  stats.avgHeartRate = Math.round(workouts.reduce((sum, w) => sum + w.avgHeartRate, 0) / workouts.length);
  
  return stats;
}

export default {
  generateWeeklyWorkoutData,
  saveWeeklyWorkoutsToFirebase,
  saveWeeklyWorkoutsToLocal,
  getWeeklyWorkouts,
  calculateWeeklyStats
};
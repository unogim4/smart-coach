// 🏃‍♂️ 운동 기록 관리 서비스 - 로컬 스토리지 지원 버전
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

/**
 * 로컬 스토리지에서 운동 데이터 가져오기
 */
const getLocalWorkouts = () => {
  try {
    const data = localStorage.getItem('weeklyWorkouts');
    if (data) {
      console.log('📊 로컬 스토리지에서 운동 데이터 로드:', JSON.parse(data).length, '개');
      return JSON.parse(data);
    }
    console.log('📊 로컬 스토리지에 운동 데이터 없음');
    return [];
  } catch (error) {
    console.error('로컬 스토리지 읽기 실패:', error);
    return [];
  }
};

/**
 * 운동 기록 저장
 */
export const saveWorkout = async (workoutData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      // 로그인하지 않은 경우 로컬 스토리지에 저장
      const localWorkouts = getLocalWorkouts();
      const workoutId = `local_${Date.now()}`;
      const workout = {
        ...workoutData,
        userId: 'local_user',
        id: workoutId,
        createdAt: new Date().toISOString(),
        date: new Date().toDateString()
      };
      localWorkouts.push(workout);
      localStorage.setItem('weeklyWorkouts', JSON.stringify(localWorkouts));
      return workoutId;
    }

    const workoutId = `${user.uid}_${Date.now()}`;
    const workout = {
      ...workoutData,
      userId: user.uid,
      id: workoutId,
      createdAt: new Date().toISOString(),
      date: new Date().toDateString()
    };

    await setDoc(doc(db, 'workouts', workoutId), workout);
    await updateUserStats(user.uid, workoutData);
    
    return workoutId;
  } catch (error) {
    console.error('운동 기록 저장 실패:', error);
    throw error;
  }
};

/**
 * 사용자 통계 업데이트
 */
const updateUserStats = async (userId, workoutData) => {
  try {
    const statsRef = doc(db, 'userStats', userId);
    const statsSnap = await getDoc(statsRef);
    
    let currentStats = {
      totalWorkouts: 0,
      totalDistance: 0,
      totalTime: 0,
      totalCalories: 0,
      longestDistance: 0,
      longestTime: 0,
      averageSpeed: 0,
      weeklyGoal: 5,
      currentStreak: 0,
      longestStreak: 0,
      lastWorkoutDate: null
    };

    if (statsSnap.exists()) {
      currentStats = statsSnap.data();
    }

    // 통계 업데이트
    const newStats = {
      ...currentStats,
      totalWorkouts: (currentStats.totalWorkouts || 0) + 1,
      totalDistance: (currentStats.totalDistance || 0) + (workoutData.distance || 0),
      totalTime: (currentStats.totalTime || 0) + (workoutData.time || 0),
      totalCalories: (currentStats.totalCalories || 0) + (workoutData.calories || 0),
      longestDistance: Math.max(currentStats.longestDistance || 0, workoutData.distance || 0),
      longestTime: Math.max(currentStats.longestTime || 0, workoutData.time || 0),
      lastWorkoutDate: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // 평균 속도 재계산
    if (newStats.totalTime > 0) {
      newStats.averageSpeed = (newStats.totalDistance / 1000) / (newStats.totalTime / 3600);
    }

    // 연속 운동 일수 계산
    const today = new Date().toDateString();
    const lastWorkout = currentStats.lastWorkoutDate ? new Date(currentStats.lastWorkoutDate).toDateString() : null;
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    
    if (lastWorkout === yesterday) {
      newStats.currentStreak = (currentStats.currentStreak || 0) + 1;
    } else if (lastWorkout !== today) {
      newStats.currentStreak = 1;
    }
    
    newStats.longestStreak = Math.max(newStats.longestStreak || 0, newStats.currentStreak);

    await setDoc(statsRef, newStats);
    return newStats;
  } catch (error) {
    console.error('통계 업데이트 실패:', error);
    throw error;
  }
};

/**
 * 운동 기록에서 통계 계산
 */
const calculateStatsFromWorkouts = (workouts) => {
  if (!workouts || workouts.length === 0) {
    return {
      totalWorkouts: 0,
      totalDistance: 0,
      totalTime: 0,
      totalCalories: 0,
      longestDistance: 0,
      longestTime: 0,
      averageSpeed: 0,
      currentStreak: 0,
      longestStreak: 0
    };
  }

  const stats = {
    totalWorkouts: workouts.length,
    totalDistance: 0,
    totalTime: 0,
    totalCalories: 0,
    longestDistance: 0,
    longestTime: 0,
    averageSpeed: 0,
    currentStreak: 0,
    longestStreak: 0
  };

  workouts.forEach(workout => {
    stats.totalDistance += workout.distance || 0;
    stats.totalTime += workout.time || workout.duration || 0;
    stats.totalCalories += workout.calories || 0;
    stats.longestDistance = Math.max(stats.longestDistance, workout.distance || 0);
    stats.longestTime = Math.max(stats.longestTime, workout.time || workout.duration || 0);
  });

  // 평균 속도 계산
  if (stats.totalTime > 0) {
    stats.averageSpeed = (stats.totalDistance / 1000) / (stats.totalTime / 3600);
  }

  return stats;
};

/**
 * 최근 운동 기록 조회
 */
export const getRecentWorkouts = async (limitCount = 10) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    // 로그인 여부와 관계없이 로컬 스토리지 우선 확인
    const localWorkouts = getLocalWorkouts();
    if (localWorkouts && localWorkouts.length > 0) {
      return localWorkouts
        .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
        .slice(0, limitCount);
    }

    if (!user) {
      return [];
    }

    const workoutsRef = collection(db, 'workouts');
    const q = query(
      workoutsRef,
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const workouts = [];

    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });

    return workouts;
  } catch (error) {
    console.error('운동 기록 조회 실패:', error);
    return getLocalWorkouts()
      .sort((a, b) => new Date(b.timestamp || b.createdAt) - new Date(a.timestamp || a.createdAt))
      .slice(0, limitCount);
  }
};

/**
 * 날짜 범위별 운동 기록 조회
 */
export const getWorkoutsByDateRange = async (startDate, endDate) => {
  try {
    const localWorkouts = getLocalWorkouts();
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (localWorkouts && localWorkouts.length > 0) {
      return localWorkouts.filter(workout => {
        const workoutDate = new Date(workout.timestamp || workout.createdAt);
        return workoutDate >= start && workoutDate <= end;
      });
    }

    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return [];
    }

    const workoutsRef = collection(db, 'workouts');
    const q = query(
      workoutsRef,
      where('userId', '==', user.uid),
      where('createdAt', '>=', startDate.toISOString()),
      where('createdAt', '<=', endDate.toISOString()),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    const workouts = [];

    querySnapshot.forEach((doc) => {
      workouts.push({ id: doc.id, ...doc.data() });
    });

    return workouts;
  } catch (error) {
    console.error('날짜별 운동 기록 조회 실패:', error);
    return [];
  }
};

/**
 * 사용자 통계 조회
 */
export const getUserStats = async () => {
  try {
    // 로컬 스토리지 우선 확인
    const localWorkouts = getLocalWorkouts();
    if (localWorkouts && localWorkouts.length > 0) {
      return calculateStatsFromWorkouts(localWorkouts);
    }

    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return calculateStatsFromWorkouts([]);
    }

    const statsRef = doc(db, 'userStats', user.uid);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      return statsSnap.data();
    }
    
    // 통계가 없으면 계산
    const workouts = await getRecentWorkouts(100);
    return calculateStatsFromWorkouts(workouts);
  } catch (error) {
    console.error('통계 조회 실패:', error);
    return calculateStatsFromWorkouts(getLocalWorkouts());
  }
};

/**
 * 주간 통계 조회
 */
export const getWeeklyStats = async () => {
  try {
    // 로컬 스토리지에서 데이터 가져오기
    const localWorkouts = getLocalWorkouts();
    console.log('📊 주간 통계 계산, 전체 운동 수:', localWorkouts.length);
    
    const today = new Date();
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay()); // 일요일
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6); // 토요일
    weekEnd.setHours(23, 59, 59, 999);

    // 이번 주 운동 필터링
    const weekWorkouts = localWorkouts.filter(workout => {
      const workoutDate = new Date(workout.timestamp || workout.createdAt);
      return workoutDate >= weekStart && workoutDate <= weekEnd;
    });
    
    console.log('📊 이번 주 운동 수:', weekWorkouts.length);

    // 요일별 통계
    const dailyStats = {};
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    
    dayNames.forEach(day => {
      dailyStats[day] = { workouts: 0, distance: 0, calories: 0, time: 0 };
    });

    weekWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.timestamp || workout.createdAt);
      const dayName = dayNames[workoutDate.getDay()];
      
      if (dailyStats[dayName]) {
        dailyStats[dayName].workouts++;
        dailyStats[dayName].distance += workout.distance || 0;
        dailyStats[dayName].calories += workout.calories || 0;
        dailyStats[dayName].time += workout.time || workout.duration || 0;
      }
    });

    // 주간 총계
    const weeklyTotal = {
      workouts: weekWorkouts.length,
      distance: weekWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      calories: weekWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      time: weekWorkouts.reduce((sum, w) => sum + (w.time || w.duration || 0), 0)
    };

    console.log('📊 주간 총계:', weeklyTotal);

    return {
      dailyStats,
      weeklyTotal,
      weekWorkouts
    };
  } catch (error) {
    console.error('주간 통계 조회 실패:', error);
    return {
      dailyStats: {},
      weeklyTotal: { workouts: 0, distance: 0, calories: 0, time: 0 },
      weekWorkouts: []
    };
  }
};

/**
 * 월간 통계 조회
 */
export const getMonthlyStats = async (year, month) => {
  try {
    // 로컬 스토리지에서 데이터 가져오기
    const localWorkouts = getLocalWorkouts();
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    // 해당 월 운동 필터링
    const monthWorkouts = localWorkouts.filter(workout => {
      const workoutDate = new Date(workout.timestamp || workout.createdAt);
      return workoutDate >= startDate && workoutDate <= endDate;
    });

    // 날짜별 그룹핑
    const calendar = {};
    monthWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.timestamp || workout.createdAt);
      const day = workoutDate.getDate();
      
      if (!calendar[day]) {
        calendar[day] = {
          workouts: [],
          totalDistance: 0,
          totalCalories: 0
        };
      }
      
      calendar[day].workouts.push(workout);
      calendar[day].totalDistance += workout.distance || 0;
      calendar[day].totalCalories += workout.calories || 0;
    });

    return {
      totalWorkouts: monthWorkouts.length,
      totalDistance: monthWorkouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      totalCalories: monthWorkouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      totalTime: monthWorkouts.reduce((sum, w) => sum + (w.time || w.duration || 0), 0),
      calendar,
      monthWorkouts
    };
  } catch (error) {
    console.error('월간 통계 조회 실패:', error);
    return {
      totalWorkouts: 0,
      totalDistance: 0,
      totalCalories: 0,
      totalTime: 0,
      calendar: {},
      monthWorkouts: []
    };
  }
};

/**
 * 운동 목표 설정
 */
export const setWorkoutGoals = async (goalsData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      // 로컬 스토리지에 저장
      localStorage.setItem('workoutGoals', JSON.stringify(goalsData));
      return goalsData;
    }

    const goalsRef = doc(db, 'userGoals', user.uid);
    await setDoc(goalsRef, {
      ...goalsData,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    });
    
    return goalsData;
  } catch (error) {
    console.error('목표 설정 실패:', error);
    throw error;
  }
};

/**
 * 운동 목표 조회
 */
export const getWorkoutGoals = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      // 로컬 스토리지에서 가져오기
      const localGoals = localStorage.getItem('workoutGoals');
      if (localGoals) {
        return JSON.parse(localGoals);
      }
    } else {
      const goalsRef = doc(db, 'userGoals', user.uid);
      const goalsSnap = await getDoc(goalsRef);
      
      if (goalsSnap.exists()) {
        return goalsSnap.data();
      }
    }
    
    // 기본 목표
    return {
      weeklyWorkouts: 3,
      dailyDistance: 5000, // 미터
      dailyCalories: 300,
      monthlyDistance: 100000 // 100km
    };
  } catch (error) {
    console.error('목표 조회 실패:', error);
    return {
      weeklyWorkouts: 3,
      dailyDistance: 5000,
      dailyCalories: 300,
      monthlyDistance: 100000
    };
  }
};

/**
 * 업적 확인 및 업데이트
 */
export const checkAndUpdateAchievements = async (workoutData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    const achievementsKey = user ? `achievements_${user.uid}` : 'achievements_local';
    const currentAchievements = JSON.parse(localStorage.getItem(achievementsKey) || '[]');
    const newAchievements = [];

    // 거리 업적
    if (workoutData.distance >= 5000 && !currentAchievements.includes('5K_RUNNER')) {
      newAchievements.push({
        id: '5K_RUNNER',
        title: '5K 러너',
        description: '5km 달리기 완주',
        icon: '🏃',
        unlockedAt: new Date().toISOString()
      });
    }

    if (workoutData.distance >= 10000 && !currentAchievements.includes('10K_MASTER')) {
      newAchievements.push({
        id: '10K_MASTER',
        title: '10K 마스터',
        description: '10km 달리기 완주',
        icon: '🏅',
        unlockedAt: new Date().toISOString()
      });
    }

    if (workoutData.distance >= 21097 && !currentAchievements.includes('HALF_MARATHON')) {
      newAchievements.push({
        id: 'HALF_MARATHON',
        title: '하프 마라톤',
        description: '21.097km 완주',
        icon: '🥇',
        unlockedAt: new Date().toISOString()
      });
    }

    // 칼로리 업적
    if (workoutData.calories >= 500 && !currentAchievements.includes('CALORIE_BURNER')) {
      newAchievements.push({
        id: 'CALORIE_BURNER',
        title: '칼로리 버너',
        description: '500kcal 이상 소모',
        icon: '🔥',
        unlockedAt: new Date().toISOString()
      });
    }

    // 시간 업적
    if (workoutData.time >= 3600 && !currentAchievements.includes('HOUR_WARRIOR')) {
      newAchievements.push({
        id: 'HOUR_WARRIOR',
        title: '1시간 전사',
        description: '1시간 이상 운동',
        icon: '⏱️',
        unlockedAt: new Date().toISOString()
      });
    }

    // 속도 업적
    if (workoutData.avgSpeed >= 12 && !currentAchievements.includes('SPEED_DEMON')) {
      newAchievements.push({
        id: 'SPEED_DEMON',
        title: '스피드 데몬',
        description: '평균 12km/h 이상',
        icon: '⚡',
        unlockedAt: new Date().toISOString()
      });
    }

    // 새로운 업적이 있으면 저장
    if (newAchievements.length > 0) {
      const allAchievementIds = [...currentAchievements, ...newAchievements.map(a => a.id)];
      localStorage.setItem(achievementsKey, JSON.stringify(allAchievementIds));
    }

    return newAchievements;
  } catch (error) {
    console.error('업적 확인 실패:', error);
    return [];
  }
};

export default {
  saveWorkout,
  getRecentWorkouts,
  getWorkoutsByDateRange,
  getUserStats,
  getWeeklyStats,
  getMonthlyStats,
  setWorkoutGoals,
  getWorkoutGoals,
  checkAndUpdateAchievements
};
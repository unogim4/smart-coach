// 🏃‍♂️ 운동 기록 관리 서비스
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();

/**
 * 운동 기록 저장
 */
export const saveWorkout = async (workoutData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('로그인이 필요합니다');
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
    
    // 사용자 통계 업데이트
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
  }
};

/**
 * 운동 기록 조회 (최근 N개)
 */
export const getRecentWorkouts = async (limitCount = 10) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return [];
    }

    const q = query(
      collection(db, 'workouts'),
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
    return [];
  }
};

/**
 * 특정 기간 운동 기록 조회
 */
export const getWorkoutsByDateRange = async (startDate, endDate) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return [];
    }

    const q = query(
      collection(db, 'workouts'),
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
    console.error('기간별 운동 기록 조회 실패:', error);
    return [];
  }
};

/**
 * 사용자 통계 조회
 */
export const getUserStats = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    const statsRef = doc(db, 'userStats', user.uid);
    const statsSnap = await getDoc(statsRef);
    
    if (statsSnap.exists()) {
      return statsSnap.data();
    }
    
    return {
      totalWorkouts: 0,
      totalDistance: 0,
      totalTime: 0,
      totalCalories: 0,
      longestDistance: 0,
      longestTime: 0,
      averageSpeed: 0,
      weeklyGoal: 5,
      currentStreak: 0,
      longestStreak: 0
    };
  } catch (error) {
    console.error('통계 조회 실패:', error);
    return null;
  }
};

/**
 * 주간 운동 통계 조회
 */
export const getWeeklyStats = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    // 이번 주 시작일 (월요일)
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    monday.setHours(0, 0, 0, 0);

    // 이번 주 끝일 (일요일)
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    const workouts = await getWorkoutsByDateRange(monday, sunday);
    
    // 요일별 통계 생성
    const dailyStats = {
      월: { workouts: 0, distance: 0, calories: 0 },
      화: { workouts: 0, distance: 0, calories: 0 },
      수: { workouts: 0, distance: 0, calories: 0 },
      목: { workouts: 0, distance: 0, calories: 0 },
      금: { workouts: 0, distance: 0, calories: 0 },
      토: { workouts: 0, distance: 0, calories: 0 },
      일: { workouts: 0, distance: 0, calories: 0 }
    };

    const daysKorean = ['일', '월', '화', '수', '목', '금', '토'];
    
    workouts.forEach(workout => {
      const date = new Date(workout.createdAt);
      const dayName = daysKorean[date.getDay()];
      
      dailyStats[dayName].workouts += 1;
      dailyStats[dayName].distance += workout.distance || 0;
      dailyStats[dayName].calories += workout.calories || 0;
    });

    // 주간 총계
    const weeklyTotal = {
      workouts: workouts.length,
      distance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      time: workouts.reduce((sum, w) => sum + (w.time || 0), 0),
      calories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0)
    };

    return {
      dailyStats,
      weeklyTotal,
      workouts
    };
  } catch (error) {
    console.error('주간 통계 조회 실패:', error);
    return null;
  }
};

/**
 * 월간 운동 통계 조회
 */
export const getMonthlyStats = async (year, month) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return null;
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const workouts = await getWorkoutsByDateRange(startDate, endDate);
    
    // 일별 운동 여부 표시 (캘린더용)
    const calendar = {};
    workouts.forEach(workout => {
      const date = new Date(workout.createdAt).getDate();
      if (!calendar[date]) {
        calendar[date] = {
          workouts: [],
          totalDistance: 0,
          totalCalories: 0
        };
      }
      calendar[date].workouts.push(workout);
      calendar[date].totalDistance += workout.distance || 0;
      calendar[date].totalCalories += workout.calories || 0;
    });

    return {
      year,
      month,
      totalWorkouts: workouts.length,
      totalDistance: workouts.reduce((sum, w) => sum + (w.distance || 0), 0),
      totalCalories: workouts.reduce((sum, w) => sum + (w.calories || 0), 0),
      calendar,
      workouts
    };
  } catch (error) {
    console.error('월간 통계 조회 실패:', error);
    return null;
  }
};

/**
 * 운동 목표 설정
 */
export const setWorkoutGoals = async (goals) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      throw new Error('로그인이 필요합니다');
    }

    const goalsRef = doc(db, 'userGoals', user.uid);
    const goalsData = {
      ...goals,
      userId: user.uid,
      updatedAt: new Date().toISOString()
    };

    await setDoc(goalsRef, goalsData);
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
      return null;
    }

    const goalsRef = doc(db, 'userGoals', user.uid);
    const goalsSnap = await getDoc(goalsRef);
    
    if (goalsSnap.exists()) {
      return goalsSnap.data();
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
    return null;
  }
};

/**
 * 업적 확인 및 업데이트
 */
export const checkAndUpdateAchievements = async (workoutData) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;
    
    if (!user) {
      return [];
    }

    const achievementsRef = doc(db, 'userAchievements', user.uid);
    const achievementsSnap = await getDoc(achievementsRef);
    
    let currentAchievements = achievementsSnap.exists() ? achievementsSnap.data().achievements || [] : [];
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
      await setDoc(achievementsRef, {
        userId: user.uid,
        achievements: allAchievementIds,
        totalAchievements: allAchievementIds.length,
        lastUpdated: new Date().toISOString()
      });
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
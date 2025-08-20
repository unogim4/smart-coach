import { db } from '../firebase';
import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// 사용자 프로필 저장
export const saveUserProfile = async (userId, profileData) => {
  try {
    await setDoc(doc(db, 'users', userId), {
      ...profileData,
      updatedAt: new Date()
    }, { merge: true });
    return true;
  } catch (error) {
    console.error('프로필 저장 오류:', error);
    throw error;
  }
};

// 사용자 프로필 가져오기
export const getUserProfile = async (userId) => {
  try {
    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      // 프로필이 없으면 빈 객체 반환
      return {};
    }
  } catch (error) {
    console.error('프로필 가져오기 오류:', error);
    throw error;
  }
};

// 활동 기록 저장
export const saveActivity = async (userId, activityData) => {
  try {
    const activityRef = await addDoc(collection(db, 'activities'), {
      userId,
      ...activityData,
      createdAt: new Date()
    });
    return activityRef.id;
  } catch (error) {
    console.error('활동 저장 오류:', error);
    throw error;
  }
};

// 사용자의 활동 기록 가져오기
export const getUserActivities = async (userId, limit = 10) => {
  try {
    const q = query(
      collection(db, 'activities'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit)
    );
    
    const querySnapshot = await getDocs(q);
    const activities = [];
    
    querySnapshot.forEach((doc) => {
      activities.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return activities;
  } catch (error) {
    console.error('활동 가져오기 오류:', error);
    throw error;
  }
};
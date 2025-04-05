import { db } from '../firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';

// 코스 저장
export const saveCourse = async (courseData) => {
  try {
    const courseRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      createdAt: new Date()
    });
    return courseRef.id;
  } catch (error) {
    console.error('코스 저장 오류:', error);
    throw error;
  }
};

// 코스 목록 가져오기 (필터링 가능)
export const getCourses = async (filters = {}) => {
  try {
    let q = collection(db, 'courses');
    
    // 필터 적용
    if (filters.difficulty) {
      q = query(q, where('difficulty', '==', filters.difficulty));
    }
    
    if (filters.minDistance && filters.maxDistance) {
      q = query(
        q, 
        where('distance', '>=', filters.minDistance),
        where('distance', '<=', filters.maxDistance)
      );
    }
    
    // 기본 정렬: 생성일 기준 내림차순
    q = query(q, orderBy('createdAt', 'desc'));
    
    const querySnapshot = await getDocs(q);
    const courses = [];
    
    querySnapshot.forEach((doc) => {
      courses.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return courses;
  } catch (error) {
    console.error('코스 가져오기 오류:', error);
    throw error;
  }
};
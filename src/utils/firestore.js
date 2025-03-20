
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';



export const getAllQuestions = async () => {
  const snapshot = await getDocs(collection(db, 'preguntas'));
  const preguntas = [];
  snapshot.forEach((doc) => {
    preguntas.push({ id: doc.id, ...doc.data() });
  });
  return preguntas;
};


export const saveScore = async (userId, score) => {
  
  await setDoc(doc(db, 'ranking', userId), {
    userId,
    score,
  });
};


export const getRanking = async () => {
  const q = query(collection(db, 'ranking'), orderBy('score', 'desc'));
  const snapshot = await getDocs(q);
  const ranking = [];
  snapshot.forEach((doc) => {
    ranking.push(doc.data());
  });
  return ranking;
};

// src/utils/firestore.js
import { db } from '../firebaseConfig';
import { collection, getDocs, doc, setDoc, addDoc, query, where, orderBy } from 'firebase/firestore';

/**
 * Obtener todas las preguntas (ejemplo simple).
 * Puedes filtrar por categoría si agregas un campo "categoriaId".
 */
export const getAllQuestions = async () => {
  const snapshot = await getDocs(collection(db, 'preguntas'));
  const preguntas = [];
  snapshot.forEach((doc) => {
    preguntas.push({ id: doc.id, ...doc.data() });
  });
  return preguntas;
};

/**
 * Guardar la puntuación del usuario en el ranking
 */
export const saveScore = async (userId, score) => {
  // Crea un doc en la colección "ranking" con la clave userId
  await setDoc(doc(db, 'ranking', userId), {
    userId,
    score,
  });
};

/**
 * Obtener Ranking (ordenado desc por score)
 */
export const getRanking = async () => {
  const q = query(collection(db, 'ranking'), orderBy('score', 'desc'));
  const snapshot = await getDocs(q);
  const ranking = [];
  snapshot.forEach((doc) => {
    ranking.push(doc.data());
  });
  return ranking;
};

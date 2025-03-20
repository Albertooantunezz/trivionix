import React, { useEffect, useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

const RankingDialog = ({ categoriaId, onClose }) => {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        // Obtener el documento de la categoría
        const categoriaDoc = await getDoc(doc(db, 'categorias', categoriaId));
        if (categoriaDoc.exists()) {
          const rankingData = categoriaDoc.data().ranking || {};

          // Convertir el objeto de ranking a un array y ordenarlo
          const rankingList = Object.entries(rankingData)
            .sort((a, b) => b[1] - a[1]) // Ordenar de mayor a menor puntaje
            .map(([userId, puntaje]) => ({ userId, puntaje }));

          // Obtener los nombres de usuario
          const usersData = await Promise.all(
            rankingList.map(async ({ userId }) => {
              const userDoc = await getDoc(doc(db, 'users', userId));
              return userDoc.exists() ? userDoc.data().username : `Usuario ${userId}`;
            })
          );

          // Combinar los datos
          const rankingFinal = rankingList.map((item, index) => ({
            ...item,
            username: usersData[index],
          }));

          setRanking(rankingFinal);
        } else {
          console.error("No se encontró la categoría");
        }
      } catch (error) {
        console.error("Error al cargar el ranking:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [categoriaId]);

  return (
    <dialog open style={{ padding: '20px', borderRadius: '10px', border: '1px solid #ccc' }}>
      <h2>Ranking de la categoría</h2>
      {loading ? (
        <p>Cargando ranking...</p>
      ) : ranking.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {ranking.map(({ userId, username, puntaje }, index) => (
            <li key={userId} style={{ margin: '10px 0' }}>
              {index + 1}. {username}: {puntaje} puntos
            </li>
          ))}
        </ul>
      ) : (
        <p>No hay datos de ranking disponibles.</p>
      )}
      <button onClick={onClose} style={{ marginTop: '20px' }}>
        Cerrar
      </button>
    </dialog>
  );
};

export default RankingDialog;
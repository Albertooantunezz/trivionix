// src/hooks/useVotacion.js
import { useState } from 'react';
import { db } from '../firebaseConfig';
import { doc, updateDoc, increment } from 'firebase/firestore';

export const useVotacion = (categoriaId, currentUser) => {
  const [votado, setVotado] = useState(false);
  const [voto, setVoto] = useState("");

  const handleVotacion = async (tipoVoto) => {
    if (!currentUser) {
      alert("Debes estar logueado para votar");
      return;
    }

    if (votado) {
      alert("Ya has votado en esta categoría.");
      return;
    }

    const categoriaDoc = doc(db, 'categorias', categoriaId);
    const campoVotos = tipoVoto === 'like' ? 'likes' : 'dislikes';

    await updateDoc(categoriaDoc, {
      [campoVotos]: increment(1), // Usar increment para evitar condiciones de carrera
    });

    setVotado(true);
    setVoto(tipoVoto);
  };

  return { votado, voto, handleVotacion };
};
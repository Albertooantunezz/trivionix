// Categoria.js
import React, { useState, useEffect } from 'react';
import { db } from './firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './context/AuthContext';  // Suponiendo que tienes un contexto de autenticación

const Categoria = ({ categoriaId }) => {
  const [categoria, setCategoria] = useState(null);
  const { currentUser } = useAuth();  // Obtener el usuario actual (si es necesario)
  const [votado, setVotado] = useState(false);  // Si el usuario ya ha votado
  const [voto, setVoto] = useState("");  // "like" o "dislike"

  useEffect(() => {
    const fetchCategoria = async () => {
      const categoriaDoc = doc(db, 'categorias', categoriaId);
      const docSnap = await getDoc(categoriaDoc);
      if (docSnap.exists()) {
        setCategoria(docSnap.data());
      }
    };
    
    fetchCategoria();
  }, [categoriaId]);

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

    // Actualizamos los votos en la categoría
    const campoVotos = tipoVoto === 'like' ? 'likes' : 'dislikes';
    await updateDoc(categoriaDoc, {
      [campoVotos]: categoria[campoVotos] + 1,  // Incrementamos el contador
    });

    setVotado(true);
    setVoto(tipoVoto);
  };

  if (!categoria) return <p>Cargando categoría...</p>;

  return (
    <div>
      <h2>{categoria.nombre}</h2>
      <p>{categoria.descripcion}</p>
      <button onClick={() => handleVotacion('like')} disabled={votado}>
        👍 Me gusta {voto === 'like' && "(Votado)"}
      </button>
      <button onClick={() => handleVotacion('dislike')} disabled={votado}>
        👎 No me gusta {voto === 'dislike' && "(Votado)"}
      </button>
      <p>Likes: {categoria.likes} - Dislikes: {categoria.dislikes}</p>
    </div>
  );
};

export default Categoria;

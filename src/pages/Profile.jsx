import React, { useEffect, useState, useContext } from "react"; // Añade useContext aquí
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { signOut } from 'firebase/auth';
import { IdiomaContext } from '../context/IdiomaContext'; // Importar el contexto de idioma

const Profile = () => {
  const { currentUser } = useAuth();
  const [username, setUsername] = useState("");
  const [categoriasJugadas, setCategoriasJugadas] = useState([]);
  const navigate = useNavigate();
  const { idioma } = useContext(IdiomaContext); // Obtener el idioma actual

  // Función para cerrar sesión
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().username);

          // Obtener las categorías jugadas y el número de veces
          const categoriasJugadasData = userDoc.data().categoriasJugadas || {};

          // Obtener los nombres de las categorías
          const categoriasCollection = collection(db, 'categorias');
          const categoriasSnapshot = await getDocs(categoriasCollection);
          const categoriasData = {};
          categoriasSnapshot.forEach((doc) => {
            categoriasData[doc.id] = doc.data().nombre; // Asegúrate de que nombre es un objeto { es: "...", en: "..." }
          });

          // Combinar los datos
          const categoriasConNombre = Object.entries(categoriasJugadasData).map(
            ([categoriaId, vecesJugada]) => ({
              categoriaId,
              nombre: categoriasData[categoriaId] || `Categoría ${categoriaId}`,
              vecesJugada,
            })
          );

          setCategoriasJugadas(categoriasConNombre);
        }
      }
    };

    fetchUserData();
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div>
        <h1>No estás autenticado</h1>
        <p>Por favor, <Link to="/login">inicia sesión</Link> para ver tu perfil.</p>
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>Perfil de Usuario</h1>
      <p>Nombre de usuario: {username}</p>
      <h2>Categorías jugadas</h2>
      {categoriasJugadas.length > 0 ? (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {categoriasJugadas.map(({ categoriaId, nombre, vecesJugada }) => (
            <li key={categoriaId} style={{ margin: '10px 0' }}>
              {nombre[idioma]}: {vecesJugada} veces jugada
            </li>
          ))}
        </ul>
      ) : (
        <p>No has jugado ninguna categoría aún.</p>
      )}
      <button onClick={handleLogout} style={{ marginTop: '20px' }}>
        Cerrar sesión
      </button>
      <Link to="/">
        <button style={{ marginTop: '10px' }}>Volver al inicio</button>
      </Link>
    </div>
  );
};

export default Profile;
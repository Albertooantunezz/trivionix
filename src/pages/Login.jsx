// src/pages/Login.jsx
import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Login = () => {
  const [username, setUsername] = useState(""); // Campo para el username
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isRegistering) {
        // Verificar si el username ya existe
        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (usernameDoc.exists()) {
          alert("El nombre de usuario ya está en uso.");
          return;
        }

        // Registrar usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Guardar el username en Firestore
        await setDoc(doc(db, 'usernames', username), {
          userId: user.uid,
        });

        // Crear un documento en Firestore para el nuevo usuario
        await setDoc(doc(db, 'users', user.uid), {
          username: username, // Guardar el username
          email: user.email,
          categoriasJugadas: [], // Inicializar array de categorías jugadas
          puntajeTotal: 0, // Inicializar puntaje total
        });

        alert("Usuario registrado con éxito");
      } else {
        // Obtener el correo electrónico asociado al username
        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (!usernameDoc.exists()) {
          alert("Nombre de usuario no encontrado.");
          return;
        }

        const userId = usernameDoc.data().userId;
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) {
          alert("Usuario no encontrado.");
          return;
        }

        const userEmail = userDoc.data().email;

        // Iniciar sesión con el correo electrónico y la contraseña
        await signInWithEmailAndPassword(auth, userEmail, password);
        alert("Inicio de sesión exitoso");
      }
      navigate("/categorias"); // Redirige al usuario después de iniciar sesión
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  return (
    <div>
      <h2>{isRegistering ? "Registro" : "Iniciar sesión"}</h2>
      <form onSubmit={handleAuth}>
        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        {isRegistering && (
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        )}
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegistering ? "Registrarse" : "Iniciar sesión"}</button>
      </form>
      <p onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
      </p>
    </div>
  );
};

export default Login;

import React, { useState } from "react";
import { auth } from "../firebaseConfig";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Login = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (e) => {
    e.preventDefault();

    try {
      if (isRegistering) {

        const usernameDoc = await getDoc(doc(db, 'usernames', username));
        if (usernameDoc.exists()) {
          alert("El nombre de usuario ya está en uso.");
          return;
        }


        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;


        await setDoc(doc(db, 'usernames', username), {
          userId: user.uid,
        });


        await setDoc(doc(db, 'users', user.uid), {
          username: username, 
          email: user.email,
          categoriasJugadas: [],
          puntajeTotal: 0,
        });

        alert("Usuario registrado con éxito");
      } else {

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


        await signInWithEmailAndPassword(auth, userEmail, password);
        alert("Inicio de sesión exitoso");
      }
      navigate("/categorias");
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
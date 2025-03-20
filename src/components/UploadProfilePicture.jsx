// src/components/UploadProfilePicture.jsx
import React, { useState } from 'react';
import { storage } from '../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';

const UploadProfilePicture = () => {
  const { currentUser } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !currentUser) {
      setError("No se ha seleccionado un archivo o no estás autenticado.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Subir la imagen a Firebase Storage
      const storageRef = ref(storage, `users/${currentUser.uid}/profile-picture`);
      const snapshot = await uploadBytes(storageRef, file);

      // Obtener la URL de la imagen subida
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Guardar la URL en Firestore
      const userDoc = doc(db, 'users', currentUser.uid);
      await updateDoc(userDoc, {
        profilePicture: downloadURL,
      });

      alert("Foto de perfil actualizada correctamente.");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      setError("Error al subir la imagen. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h3>Cambiar foto de perfil</h3>
      <input type="file" onChange={handleFileChange} accept="image/*" />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Subiendo..." : "Subir foto"}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default UploadProfilePicture;
import React from "react";
import { subirPreguntasHistoria, borrarTodasLasPreguntas } from "../utils/agregarPreguntas"; 
import { db } from "../firebaseConfig";
import { collection, getDocs, query, where } from "firebase/firestore";

const AdminPanel = () => {
  const categoriaID = "categoria_entretenimiento"; 

  // Función para contar las preguntas en la categoría
  const contarPreguntasEnCategoria = async () => {
    try {
      const preguntasRef = collection(db, "preguntas");
      const q = query(preguntasRef, where("categoriaID", "==", categoriaID));
      const querySnapshot = await getDocs(q);

      const cantidadPreguntas = querySnapshot.size;
      alert(`Hay ${cantidadPreguntas} preguntas en la categoría con ID: ${categoriaID}`);
    } catch (error) {
      console.error("Error al contar las preguntas:", error);
      alert("Hubo un error al contar las preguntas.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Panel de Administración</h1>


      <button
        onClick={contarPreguntasEnCategoria}
        style={{
          backgroundColor: "#007bff",
          color: "white",
          padding: "10px 20px",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          marginRight: "10px", 
        }}
      >
        Contar Preguntas en Categoría
      </button>


      <button
        onClick={subirPreguntasHistoria}
        style={{
          backgroundColor: "#28a745",
          color: "white",
          padding: "10px 20px",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
          marginRight: "10px", 
        }}
      >
        Agregar Preguntas a Firebase
      </button>


      <button
        onClick={borrarTodasLasPreguntas}
        style={{
          backgroundColor: "#dc3545",
          color: "white",
          padding: "10px 20px",
          fontSize: "16px",
          border: "none",
          cursor: "pointer",
          borderRadius: "5px",
        }}
      >
        Borrar Todas las Preguntas
      </button>
    </div>
  );
};

export default AdminPanel;
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { IdiomaContext } from "../context/IdiomaContext"; // Importar el contexto de idioma

const Home = () => {
  const { currentUser } = useAuth();
  const { idioma, cambiarIdioma } = useContext(IdiomaContext); // Usar el contexto de idioma

  return (
    <div className="menuInicio" style={{ textAlign: "center" }}>
      <h1>
        {idioma === "es" ? "Bienvenido a Trivionix" : "Welcome to Trivionix"}
      </h1>
      <p>
        {idioma === "es"
          ? "¡Pon a prueba tus conocimientos!"
          : "Test your knowledge!"}
      </p>

      {/* Selector de idioma */}
      <div style={{ marginTop: "1rem", marginBottom: "1rem" }}>
        <select
          style={{
            fontSize: "1rem",
            padding: "0.5rem",
            width: "200px",
            textAlign: "center",
            borderRadius: "8px",
          }}
          onChange={(e) => cambiarIdioma(e.target.value)}
          value={idioma}
        >
          <option value="es">Español</option>
          <option value="en">English</option>
        </select>
      </div>

      {/* Botón de "Jugar" que redirige a /categorias */}
      <div style={{ marginTop: "1rem", width: "100%" }}>
        <Link to="/categorias">
          <button
            style={{
              marginTop: "1rem",
              width: "30%",
              fontSize: "1.5rem",
              color: "white",
            }}
          >
            {idioma === "es" ? "Jugar" : "Play"}
          </button>
        </Link>
      </div>

      <div style={{ marginTop: "1rem" }}>
        <Link to="/ranking">
          <button>{idioma === "es" ? "Ver Ranking" : "View Ranking"}</button>
        </Link>
      </div>

      {!currentUser && (
        <div style={{ marginTop: "1rem" }}>
          <Link to="/login">
            <button>
              {idioma === "es"
                ? "Iniciar Sesión / Registrarse"
                : "Login / Register"}
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;

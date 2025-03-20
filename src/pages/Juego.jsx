import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  updateDoc,
  increment,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFire } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import { IdiomaContext } from '../context/IdiomaContext';

const Juego = () => {
  const { categoriaID } = useParams();
  const navigate = useNavigate();
  const [preguntas, setPreguntas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [preguntaActual, setPreguntaActual] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState(null);
  const [puntaje, setPuntaje] = useState(0);
  const [puntosSumados, setPuntosSumados] = useState(0);
  const [multiplicador, setMultiplicador] = useState(1);
  const [rachaCorrectas, setRachaCorrectas] = useState(0);
  const [tiempoRestante, setTiempoRestante] = useState(10);
  const [intervalo, setIntervalo] = useState(null);
  const [mostrarRespuestas, setMostrarRespuestas] = useState(false);
  const { currentUser } = useAuth();
  const { idioma } = useContext(IdiomaContext);


  const seleccionarPreguntasAleatorias = (preguntas, cantidad) => {
    const preguntasAleatorias = [];
    const copiaPreguntas = [...preguntas];

    while (preguntasAleatorias.length < cantidad && copiaPreguntas.length > 0) {
      const indiceAleatorio = Math.floor(Math.random() * copiaPreguntas.length);
      preguntasAleatorias.push(copiaPreguntas.splice(indiceAleatorio, 1)[0]);
    }

    return preguntasAleatorias;
  };


  useEffect(() => {
    const fetchPreguntas = async () => {
      if (!categoriaID) {
        console.error("No se encuentra categoriaID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const preguntasCollection = collection(db, "preguntas");
        const q = query(
          preguntasCollection,
          where("categoriaID", "==", categoriaID)
        );
        const preguntasSnapshot = await getDocs(q);

        if (preguntasSnapshot.empty) {
          console.log("No hay preguntas para esta categoría");
          setPreguntas([]);
        } else {
          const preguntasList = preguntasSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          const preguntasAleatorias = seleccionarPreguntasAleatorias(
            preguntasList,
            7
          );
          setPreguntas(preguntasAleatorias);
        }
      } catch (error) {
        console.error("Error al cargar las preguntas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPreguntas();
  }, [categoriaID]);


  useEffect(() => {
    if (preguntaActual < preguntas.length) {
      setMostrarRespuestas(false);
      setTiempoRestante(10);


      const timeout = setTimeout(() => {
        setMostrarRespuestas(true);


        const timer = setInterval(() => {
          setTiempoRestante((prev) => {
            if (prev === 1) {
              clearInterval(timer); 
              mostrarRespuestaCorrecta(); 
              setTimeout(() => {
                handleSiguientePregunta(false); 
              }, 1000);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

        setIntervalo(timer);
      }, 2000);

      return () => {
        clearTimeout(timeout);
        clearInterval(intervalo);
      };
    }
  }, [preguntaActual, preguntas]);


  const mostrarRespuestaCorrecta = () => {
    setRespuestaSeleccionada(preguntas[preguntaActual].respuestaCorrecta[idioma]);
  };

  useEffect(() => {
    if (preguntaActual >= preguntas.length && currentUser) {
      if (puntaje > 0) {
        guardarEstadisticas(currentUser.uid, categoriaID, puntaje);
      }
    }
  }, [preguntaActual, currentUser]);


  const calcularPuntaje = (tiempo) => {
    if (tiempo >= 8) return 10;
    if (tiempo >= 7) return 9;
    if (tiempo >= 6) return 8;
    if (tiempo >= 5) return 7;
    if (tiempo >= 4) return 6;
    if (tiempo >= 3) return 5;
    if (tiempo >= 2) return 4;
    if (tiempo >= 1) return 3;
    return 2;
  };


  const handleRespuestaSeleccionada = (respuesta) => {
    setRespuestaSeleccionada(respuesta);
    clearInterval(intervalo);

    if (respuesta === preguntas[preguntaActual].respuestaCorrecta[idioma]) {
      const puntosGanados = calcularPuntaje(tiempoRestante) * multiplicador;
      setPuntosSumados(puntosGanados);
      setPuntaje((prev) => prev + puntosGanados);

      setRachaCorrectas((prev) => {
        const nuevaRacha = prev + 1;
        if (nuevaRacha === 2) {
          setMultiplicador(2);
        } else if (nuevaRacha > 2) {
          setMultiplicador((prevMult) => prevMult + 1);
        }
        return nuevaRacha;
      });
    } else {
      setMultiplicador(1);
      setRachaCorrectas(0);
      setPuntosSumados(0);
    }

    setTimeout(() => {
      handleSiguientePregunta(true);
    }, 1000);
  };


  const handleSiguientePregunta = (respondio) => {
    if (!respondio) {
      setRespuestaSeleccionada(null);
      setMultiplicador(1);
      setRachaCorrectas(0);
      setPuntosSumados(0);
    }

    if (preguntaActual < preguntas.length) {
      setPreguntaActual(preguntaActual + 1);
      setRespuestaSeleccionada(null);
      setPuntosSumados(0);
    }
  };


  const guardarEstadisticas = async (userId, categoriaId, puntaje) => {
    try {
      const userDoc = doc(db, "users", userId);
      await updateDoc(userDoc, {
        [`categoriasJugadas.${categoriaId}`]: increment(1),
        puntajeTotal: increment(puntaje),
      });

      const categoriaDoc = doc(db, "categorias", categoriaId);
      await updateDoc(categoriaDoc, {
        [`ranking.${userId}`]: increment(puntaje),
      });

      console.log("Estadísticas y ranking guardados correctamente.");
    } catch (error) {
      console.error("Error al guardar estadísticas o ranking:", error);
    }
  };

  return (
    <div className="pregunta">
      {loading ? (
        <p>
          {idioma === "es" ? "Cargando preguntas..." : "Loading questions..."}
        </p>
      ) : preguntas.length === 0 ? (
        <p>
          {idioma === "es"
            ? "No hay preguntas asociadas a esta categoría."
            : "No questions available for this category."}
        </p>
      ) : (
        <div style={{ width: "100%" }}>
          {preguntaActual < preguntas.length ? (
            <>
              <h1 style={{}}>
                {idioma === "es" ? "Pregunta" : "Question"} {preguntaActual + 1}
                /{preguntas.length}
              </h1>
              <div
  className={`recuadroPregunta ${mostrarRespuestas ? "mostrarRespuestas" : ""}`}
  style={{
    border: "2px solid black",
    borderRadius: "20px",
    margin: "auto",
    marginTop: "50px",
    backgroundColor: "rgb(48, 48, 48)",
    width: "80%",
    display: "flex",
    flexDirection: "column",
    justifyContent: mostrarRespuestas ? "space-around" : "",
    alignItems: "center",
    position: "relative",
  }}
>

  <h3 style={{ marginBottom: "20px", marginTop: "50px" }}>
    {idioma === "es" ? "Puntuación" : "Score"}: {puntaje}{" "}
    {puntosSumados > 0 && `(+${puntosSumados})`}
  </h3>
  <h2 style={{ marginTop: "50px", fontSize: "2rem", marginLeft: "20px", marginRight: "20px" }}>
    {preguntas[preguntaActual].pregunta[idioma]}
  </h2>
  <h3
    className="multiplicadorLogo"
    style={{
      position: "absolute",
      top: "5%",
      left: "85%",
      fontSize: "1.5rem",
      color: "red",
    }}
  >
    <FontAwesomeIcon icon={faFire} /> x{multiplicador}
  </h3>

  {preguntas[preguntaActual].imagen && (
    <img src={preguntas[preguntaActual].imagen} alt="Pregunta" />
  )}

  {mostrarRespuestas && (
    <div style={{ marginBottom: "50px", width: "100%" }}>
      {preguntas[preguntaActual].opciones[idioma].map((opcion, index) => (
        <button
          className="respuesta"
          key={index}
          style={{
            backgroundColor:
              respuestaSeleccionada !== null &&
              opcion === preguntas[preguntaActual].respuestaCorrecta[idioma]
                ? "green"
                : respuestaSeleccionada === opcion
                ? "red"
                : "",
            color: "white",
            margin: "10px",
            padding: "10px",
            cursor: "pointer",
            width: "80%",
            height: "80px",
          }}
          onClick={() => handleRespuestaSeleccionada(opcion)}
          disabled={respuestaSeleccionada !== null}
        >
          {opcion}
        </button>
      ))}
    </div>
  )}

  {mostrarRespuestas && (
    <div
      style={{
        position: "relative",
        width: "90%",
        height: "30px",
        backgroundColor: "#ddd",
        borderRadius: "5px",
        marginTop: "0px",
      }}
    >
      <div
        style={{
          width: `${(tiempoRestante / 10) * 100}%`,
          height: "100%",
          backgroundColor: tiempoRestante > 3 ? "green" : "red",
          borderRadius: "5px",
          transition: "width 1s linear",
        }}
      ></div>
    </div>
  )}
  {mostrarRespuestas && (
    <h2>
      {idioma === "es" ? "Tiempo restante" : "Time remaining"}: {tiempoRestante}{" "}
      {idioma === "es" ? "segundos" : "seconds"}
    </h2>
  )}
</div>
            </>
          ) : (
            <div>
              <h1>{idioma === "es" ? "¡Juego terminado!" : "Game Over!"}</h1>
              <h2>
                {idioma === "es" ? "Puntaje final" : "Final Score"}: {puntaje}{" "}
                {idioma === "es" ? "puntos" : "points"}
              </h2>
              <button onClick={() => navigate("/categorias")}>
                {idioma === "es" ? "Volver a categorías" : "Back to Categories"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Juego;
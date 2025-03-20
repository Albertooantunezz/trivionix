import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  increment,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faThumbsUp,
  faThumbsDown,
  faRankingStar,
} from "@fortawesome/free-solid-svg-icons";
import { useAuth } from "../context/AuthContext";
import RankingDialog from "../components/RankingDialog";
import { IdiomaContext } from '../context/IdiomaContext'; 

const Categorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const [selectedCategoriaId, setSelectedCategoriaId] = useState(null);
  const { idioma } = useContext(IdiomaContext); 

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const categoriasCollection = collection(db, "categorias");
        const categoriaSnapshot = await getDocs(categoriasCollection);

        if (categoriaSnapshot.empty) {
          console.log("No se encontraron categorías.");
        }

        const categoriaList = categoriaSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          votado: null,
        }));

        if (currentUser) {
          for (let categoria of categoriaList) {
            const votoDoc = await getDoc(
              doc(db, "votos", `${currentUser.uid}_${categoria.id}`)
            );
            if (votoDoc.exists()) {
              categoria.votado = votoDoc.data().voto;
            }
          }
        }

        setCategorias(categoriaList);
      } catch (error) {
        console.error("Error al cargar las categorías:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, [currentUser]);

  const handleVotacion = async (categoriaId, tipoVoto) => {
    if (!currentUser) {
      alert(idioma === 'es' ? "Debes estar logueado para votar" : "You must be logged in to vote");
      return;
    }

    const votoDocRef = doc(db, "votos", `${currentUser.uid}_${categoriaId}`);
    const votoDoc = await getDoc(votoDocRef);

    const categoriaDoc = doc(db, "categorias", categoriaId);
    const categoria = categorias.find((cat) => cat.id === categoriaId);

    let nuevosLikes = categoria.likes;
    let nuevosDislikes = categoria.dislikes;

    if (votoDoc.exists()) {
      const votoAnterior = votoDoc.data().voto;

      if (votoAnterior === "like") {
        nuevosLikes -= 1;
      } else if (votoAnterior === "dislike") {
        nuevosDislikes -= 1;
      }
    }

    if (tipoVoto === "like") {
      nuevosLikes += 1;
    } else if (tipoVoto === "dislike") {
      nuevosDislikes += 1;
    }

    await setDoc(votoDocRef, {
      userId: currentUser.uid,
      categoriaId: categoriaId,
      voto: tipoVoto,
    });

    await updateDoc(categoriaDoc, {
      likes: nuevosLikes,
      dislikes: nuevosDislikes,
    });

    setCategorias((prevCategorias) =>
      prevCategorias.map((cat) =>
        cat.id === categoriaId
          ? {
              ...cat,
              likes: nuevosLikes,
              dislikes: nuevosDislikes,
              votado: tipoVoto,
            }
          : cat
      )
    );
  };

  return (
    <div className="pregunta">
      <div className="categoriasContainer">
        <h1 style={{ fontSize: "40px" }}>
          {idioma === 'es' ? 'Selecciona una Categoría para Jugar' : 'Select a Category to Play'}
        </h1>

        {loading ? (
          <p>{idioma === 'es' ? 'Cargando Categorías...' : 'Loading Categories...'}</p>
        ) : (
          <div className="divCategorias" style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {categorias.length === 0 ? (
              <p>{idioma === 'es' ? 'No hay categorías disponibles.' : 'No categories available.'}</p>
            ) : (
              categorias.map((categoria) => (
                <div className="tipoCategoria" key={categoria.id} style={cardStyle}>
                  <h3 style={{ fontSize: "25px", marginBottom: "0px" }}>
                    {categoria.nombre[idioma]} 
                  </h3>
                  {categoria.imagen && (
                    <img
                      src={categoria.imagen}
                      alt={categoria.nombre[idioma]}
                      style={{ width: "100%", height: "auto" }}
                    />
                  )}
                  <div style={{ display: "flex", justifyContent: "center", fontSize: "20px", gap: "50px" }}>
                    <p>
                      <button
                        onClick={() => handleVotacion(categoria.id, "like")}
                        style={{
                          fontSize: "17px",
                          marginLeft: "10px",
                          backgroundColor: categoria.votado === "like" ? "green" : "",
                        }}
                      >
                        <FontAwesomeIcon icon={faThumbsUp} /> {categoria.likes}
                      </button>
                    </p>
                    <p>
                      <button
                        onClick={() => handleVotacion(categoria.id, "dislike")}
                        style={{
                          fontSize: "17px",
                          marginLeft: "10px",
                          backgroundColor: categoria.votado === "dislike" ? "red" : "",
                        }}
                      >
                        <FontAwesomeIcon icon={faThumbsDown} /> {categoria.dislikes}
                      </button>
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: "20px" }}>
                    <button
                      onClick={() => setSelectedCategoriaId(categoria.id)}
                      style={{ marginTop: "10px", width: "20%" }}
                    >
                      <FontAwesomeIcon icon={faRankingStar} />
                    </button>

                    <Link to={`/juego/${categoria.id}`}>
                      <button style={{ width: "300px" }}>{idioma === 'es' ? 'Jugar' : 'Play'}</button>
                    </Link>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedCategoriaId && (
        <RankingDialog
          categoriaId={selectedCategoriaId}
          onClose={() => setSelectedCategoriaId(null)}
        />
      )}
    </div>
  );
};

const cardStyle = {
  backgroundColor: "rgba(128, 128, 128, 0.09)",
  border: "2px solid rgb(50, 50, 50)",
  margin: "10px",
  padding: "20px",
  borderRadius: "10px",
  width: "300px",
  textAlign: "center",
  color: "azure",
};

export default Categorias;
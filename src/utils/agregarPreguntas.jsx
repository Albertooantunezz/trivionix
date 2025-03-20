import { db } from "../firebaseConfig";
import { collection, doc, writeBatch, getDocs, deleteDoc } from "firebase/firestore";
import preguntasHistoria from "../data/preguntasEntretenimiento.json";


const stopwords = new Set([
  "de", "la", "el", "en", "y", "a", "es", "qué", "cuál", "cómo", "dónde", "cuándo", "quién",
  "para", "por", "con", "sin", "sobre", "bajo", "entre", "hacia", "desde", "hasta", "se", "son",
  "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "un", "una",
  "unos", "unas", "al", "del", "lo", "las", "los", "nos", "les", "me", "te", "le", "nosotros", "vosotros", "ellos", "Qué"
]);


const extraerPalabrasClave = (texto) => {
  return texto
    .toLowerCase() 
    .replace(/[^\w\s]/gi, "") 
    .split(/\s+/)
    .filter((palabra) => !stopwords.has(palabra));
};


const compararPalabrasClave = (palabras1, palabras2) => {
  const coincidencias = palabras1.filter((palabra) => palabras2.includes(palabra));
  return coincidencias.length / Math.max(palabras1.length, palabras2.length);
};


const evitarPreguntasSimilares = async (nuevaPregunta, preguntasProcesadas) => {
  const palabrasClaveNueva = extraerPalabrasClave(nuevaPregunta);


  for (const preguntaProcesada of preguntasProcesadas) {
    const palabrasClaveExistente = extraerPalabrasClave(preguntaProcesada);
    const similitud = compararPalabrasClave(palabrasClaveNueva, palabrasClaveExistente);
    if (similitud > 0.7) { 
      return false; 
    }
  }


  const preguntasRef = collection(db, "preguntas");
  const querySnapshot = await getDocs(preguntasRef);

  for (const doc of querySnapshot.docs) {
    const preguntaExistente = doc.data();

    if (preguntaExistente && preguntaExistente.pregunta && preguntaExistente.pregunta.es) {
      const palabrasClaveExistente = extraerPalabrasClave(preguntaExistente.pregunta.es);
      const similitud = compararPalabrasClave(palabrasClaveNueva, palabrasClaveExistente);
      if (similitud > 0.7) {
        return false; 
      }
    } else {
      console.warn("Pregunta existente no tiene la estructura esperada:", preguntaExistente);
    }
  }

  return true; 
};


export const subirPreguntasHistoria = async () => {
  const batch = writeBatch(db);
  const coleccionRef = collection(db, "preguntas");
  const preguntasProcesadas = [];

  for (const pregunta of preguntasHistoria) {

    if (await evitarPreguntasSimilares(pregunta.pregunta.es, preguntasProcesadas)) {
      const nuevoDocRef = doc(coleccionRef);
      batch.set(nuevoDocRef, {
        ...pregunta,
        opciones: pregunta.opciones, 
      });
      preguntasProcesadas.push(pregunta.pregunta.es); 
    } else {
      console.log(`❌ Pregunta omitida (similar a una existente): ${pregunta.pregunta.es}`);
    }
  }

  try {
    await batch.commit();
    console.log("✅ Preguntas subidas exitosamente.");
    alert("Preguntas subidas exitosamente.");
  } catch (error) {
    console.error("❌ Error al subir preguntas:", error);
  }
};


export const borrarTodasLasPreguntas = async () => {
  const preguntasRef = collection(db, "preguntas");
  const querySnapshot = await getDocs(preguntasRef);

  const batch = writeBatch(db);
  querySnapshot.forEach((doc) => {
    batch.delete(doc.ref);
  });

  try {
    await batch.commit();
    console.log("✅ Todas las preguntas borradas exitosamente.");
    alert("Todas las preguntas borradas exitosamente.");
  } catch (error) {
    console.error("❌ Error al borrar preguntas:", error);
  }
};
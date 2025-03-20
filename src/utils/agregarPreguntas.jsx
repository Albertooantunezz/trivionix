import { db } from "../firebaseConfig";
import { collection, doc, writeBatch, getDocs, deleteDoc } from "firebase/firestore";
import preguntasHistoria from "../data/preguntasEntretenimiento.json";

// Lista de stopwords en español (palabras que no aportan significado)
const stopwords = new Set([
  "de", "la", "el", "en", "y", "a", "es", "qué", "cuál", "cómo", "dónde", "cuándo", "quién",
  "para", "por", "con", "sin", "sobre", "bajo", "entre", "hacia", "desde", "hasta", "se", "son",
  "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve", "diez", "un", "una",
  "unos", "unas", "al", "del", "lo", "las", "los", "nos", "les", "me", "te", "le", "nosotros", "vosotros", "ellos", "Qué"
]);

// Función para extraer palabras clave
const extraerPalabrasClave = (texto) => {
  return texto
    .toLowerCase() // Convertir a minúsculas
    .replace(/[^\w\s]/gi, "") // Eliminar caracteres especiales
    .split(/\s+/) // Dividir en palabras
    .filter((palabra) => !stopwords.has(palabra)); // Filtrar stopwords
};

// Función para comparar palabras clave
const compararPalabrasClave = (palabras1, palabras2) => {
  const coincidencias = palabras1.filter((palabra) => palabras2.includes(palabra));
  return coincidencias.length / Math.max(palabras1.length, palabras2.length); // Índice de similitud
};

// Función para verificar si una pregunta es similar a las existentes
const evitarPreguntasSimilares = async (nuevaPregunta, preguntasProcesadas) => {
  const palabrasClaveNueva = extraerPalabrasClave(nuevaPregunta);

  // Comparar con las preguntas ya procesadas en este lote
  for (const preguntaProcesada of preguntasProcesadas) {
    const palabrasClaveExistente = extraerPalabrasClave(preguntaProcesada);
    const similitud = compararPalabrasClave(palabrasClaveNueva, palabrasClaveExistente);
    if (similitud > 0.7) { // Umbral de similitud (ajusta según sea necesario)
      return false; // Pregunta similar encontrada
    }
  }

  // Comparar con las preguntas ya existentes en la base de datos
  const preguntasRef = collection(db, "preguntas");
  const querySnapshot = await getDocs(preguntasRef);

  for (const doc of querySnapshot.docs) {
    const preguntaExistente = doc.data();

    // Verificar si preguntaExistente y preguntaExistente.pregunta están definidos
    if (preguntaExistente && preguntaExistente.pregunta && preguntaExistente.pregunta.es) {
      const palabrasClaveExistente = extraerPalabrasClave(preguntaExistente.pregunta.es);
      const similitud = compararPalabrasClave(palabrasClaveNueva, palabrasClaveExistente);
      if (similitud > 0.7) { // Umbral de similitud (ajusta según sea necesario)
        return false; // Pregunta similar encontrada
      }
    } else {
      console.warn("Pregunta existente no tiene la estructura esperada:", preguntaExistente);
    }
  }

  return true; // No se encontraron preguntas similares
};

// Función principal para subir preguntas
export const subirPreguntasHistoria = async () => {
  const batch = writeBatch(db);
  const coleccionRef = collection(db, "preguntas");
  const preguntasProcesadas = []; // Almacena las preguntas ya procesadas en este lote

  for (const pregunta of preguntasHistoria) {
    // Verificar si la pregunta es similar a una ya existente o ya procesada
    if (await evitarPreguntasSimilares(pregunta.pregunta.es, preguntasProcesadas)) {
      const nuevoDocRef = doc(coleccionRef);
      batch.set(nuevoDocRef, {
        ...pregunta,
        opciones: pregunta.opciones, // Subir el objeto directamente
      });
      preguntasProcesadas.push(pregunta.pregunta.es); // Añadir la pregunta al listado de procesadas
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

// Función para borrar todas las preguntas
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
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: 'AIzaSyBJh4LilbtxQzTKmf1gqOt-GsKk1r99Y0A',
  authDomain: 'trivionix-c6041.firebaseapp.com',
  projectId: 'trivionix-c6041',
  storageBucket: 'trivionix-c6041.firebasestorage.app',
  messagingSenderId: '864260871489',
  appId: '1:864260871489:web:a4b5a0c87804ae8b17bdc0',
};


const app = initializeApp(firebaseConfig);


const auth = getAuth(app);


const db = getFirestore(app);


export { auth, db };

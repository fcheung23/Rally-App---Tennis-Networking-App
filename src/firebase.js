import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage"; 

const firebaseConfig = {
    apiKey: "AIzaSyAlabTxuL1MAVeYhtEO9m_qe5moLouT1tY",
    authDomain: "tennis-1a8a4.firebaseapp.com",
    projectId: "tennis-1a8a4",
    storageBucket: "tennis-1a8a4.appspot.com", 
    messagingSenderId: "920321692360",
    appId: "1:920321692360:web:b520a024adab5499594bfd"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage }; 

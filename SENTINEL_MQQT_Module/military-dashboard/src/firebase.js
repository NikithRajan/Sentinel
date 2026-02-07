import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyAza_1bRNNJrGn2OToNrmEC02RQqzHs6U0",
    authDomain: "sentinel-core-2467e.firebaseapp.com",
    projectId: "sentinel-core-2467e",
    storageBucket: "sentinel-core-2467e.firebasestorage.app",
    messagingSenderId: "306470747760",
    appId: "1:306470747760:web:308aa14756b0e7f687beb5"
  };

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);


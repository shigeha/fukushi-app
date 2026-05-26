import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBmddseHBdkeimXnYdS8EZeARXiX4Fv4-s",
    authDomain: "fukushi-app.firebaseapp.com",
    projectId: "fukushi-app",
    storageBucket: "fukushi-app.firebasestorage.app",
    messagingSenderId: "798988791578",
    appId: "1:798988791578:web:a4a7f259b5a6fbbc6c06a3"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
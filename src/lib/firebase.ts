import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

export const app = initializeApp({
    apiKey: "AIzaSyCi8mCw5ICLJZYN-VMftWQTMYCJ669rqf0",
    authDomain: "encryptid-2-c0c54.firebaseapp.com",
    projectId: "encryptid-2-c0c54",
    storageBucket: "encryptid-2-c0c54.appspot.com",
    messagingSenderId: "399101831807",
    appId: "1:399101831807:web:39df7986ab54b7b3382d4a",
    measurementId: "G-9DBDWJZZ1T"
  });

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

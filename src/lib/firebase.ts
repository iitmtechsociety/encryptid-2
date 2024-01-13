import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";
export const app = initializeApp({
  });

export const firestore = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);


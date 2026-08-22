// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAQS8Wm9nqxWGWMOhJkd1eiMTtBqOQSAlk",
  authDomain: "campus-guide-7a2c5.firebaseapp.com",
  projectId: "campus-guide-7a2c5",
  storageBucket: "campus-guide-7a2c5.firebasestorage.app",
  messagingSenderId: "799269198472",
  appId: "1:799269198472:web:567f6ab5ec0104c60cdd3d",
  measurementId: "G-JXFBDSHH9Z",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);


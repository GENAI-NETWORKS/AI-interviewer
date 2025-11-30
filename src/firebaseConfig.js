// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBAhF8651AeSiZTJscWxG45GXEIGkDw1ws",
  authDomain: "inter-7beb7.firebaseapp.com",
  projectId: "inter-7beb7",
  storageBucket: "inter-7beb7.firebasestorage.app",
  messagingSenderId: "918925166514",
  appId: "1:918925166514:web:fe6655f6b188bb98ff06ab",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

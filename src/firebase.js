import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBcPRBsSTKKLJ7SXt_IPTo12JW6V2dXgMI",
  authDomain: "student-test-ab704.firebaseapp.com",
  projectId: "student-test-ab704",
  storageBucket: "student-test-ab704.firebasestorage.app",
  messagingSenderId: "648670281054",
  appId: "1:648670281054:web:b7dd4c08915177acc463cf",
  measurementId: "G-58HV4NMPET"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, analytics, auth, googleProvider };

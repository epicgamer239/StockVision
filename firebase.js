// firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC5rYCI6f8u_rsB3fqzdWE7Z_VuV7sHNho",
  authDomain: "hackathon-7d855.firebaseapp.com",
  projectId: "hackathon-7d855",
  storageBucket: "hackathon-7d855.appspot.com", // Fixed typo here
  messagingSenderId: "1030734954379",
  appId: "1:1030734954379:web:0f59b4a930df637e7eb98e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
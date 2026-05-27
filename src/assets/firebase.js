// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAi4Uo4Eq0-9hOTmQHyULs33gJH0KbVXMQ",
  authDomain: "syncspace-ee96a.firebaseapp.com",
  projectId: "syncspace-ee96a",
  storageBucket: "syncspace-ee96a.firebasestorage.app",
  messagingSenderId: "790494022576",
  appId: "1:790494022576:web:3dbe5715e2bc53be20e475",
  measurementId: "G-8Q9TZ28RTR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
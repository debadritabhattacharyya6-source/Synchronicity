// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDRKKhIO8m-3ikgfd8Xjj9J13P8GVl3VgA",
  authDomain: "sync-space-fb0fb.firebaseapp.com",
  projectId: "sync-space-fb0fb",
  storageBucket: "sync-space-fb0fb.firebasestorage.app",
  messagingSenderId: "26340060828",
  appId: "1:26340060828:web:4602b9658c35c11315c759",
  measurementId: "G-LBRWJ4QMDF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);

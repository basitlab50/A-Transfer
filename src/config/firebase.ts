import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBYg1GsXrzZQR_svR74aPXollfTvYt26Mw",
  authDomain: "a-transfer-6baba.firebaseapp.com",
  projectId: "a-transfer-6baba",
  storageBucket: "a-transfer-6baba.firebasestorage.app",
  messagingSenderId: "824020505446",
  appId: "1:824020505446:web:bdf648f449a769ff15eea7",
  measurementId: "G-7FGJ3S8YML"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;


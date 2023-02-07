// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore/lite";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDO0g2OtQ75_X2BJjgzRhXd5msmVX9KVao",
  authDomain: "flex-office-x-planner.firebaseapp.com",
  projectId: "flex-office-x-planner",
  storageBucket: "flex-office-x-planner.appspot.com",
  messagingSenderId: "566620612276",
  appId: "1:566620612276:web:537a2c1b1a83f5a54599e1",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

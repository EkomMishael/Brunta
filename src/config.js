// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth,GoogleAuthProvider } from "firebase/auth";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import {  getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDafcA8SxTPmHU5CiRwD6VMOxrIbw6pp54",
    authDomain: "basicblog-14d29.firebaseapp.com",
    databaseURL: "https://basicblog-14d29-default-rtdb.firebaseio.com",
    projectId: "basicblog-14d29",
    storageBucket: "basicblog-14d29.appspot.com",
    messagingSenderId: "452128741043",
    appId: "1:452128741043:web:ba865832b21d5a118b82c6",
    measurementId: "G-LV41EV31X4"
  };
  
  // Initialize Firebase
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const firestore = getFirestore(app);
  const database = getDatabase(app);
  const storage=getStorage(app, "gs://basicblog-14d29.appspot.com")
  const provider = new GoogleAuthProvider();
  
  export { auth, firestore, storage ,provider, database};
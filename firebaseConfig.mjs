import { initializeApp } from "firebase/app"
import {getAuth, GoogleAuthProvider, signInWithPopup, signOut} from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyAe8sUJCUQvLxyBlKCqNLZyycFqwg93Jg0",
    authDomain: "bioblitz-367b6.firebaseapp.com",
    databaseURL: "https://bioblitz-367b6-default-rtdb.firebaseio.com",
    projectId: "bioblitz-367b6",
    storageBucket: "bioblitz-367b6.firebasestorage.app",
    messagingSenderId: "821109453859",
    appId: "1:821109453859:web:f60724742956f22548ed96",
    measurementId: "G-731TXJB1N2"
  };

  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const googleProvider = new GoogleAuthProvider();

  export {auth, googleProvider, signInWithPopup, signOut};
export default firebase;
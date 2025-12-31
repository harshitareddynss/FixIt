
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyA6Ciq1MNtWsazsy9VN9SVXGsrOE5JSyW",
  authDomain: "studio-5885690582-6a8e0.firebaseapp.com",
  projectId: "studio-5885690582-6a8e0",
  storageBucket: "studio-5885690582-6a8e0.appspot.com",
  messagingSenderId: "1002224161716",
  appId: "1:1002224161716:web:82db32740b1794c7fcd8e1"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);
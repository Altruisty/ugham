import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

const firebaseConfig = {
  apiKey: "AIzaSyB6nytgpLFDXHfmb7JilFGH1PwOMYJHeEU",
  authDomain: "ugham-18f9f.firebaseapp.com",
  projectId: "ugham-18f9f",
  storageBucket: "ugham-18f9f.firebasestorage.app",
  messagingSenderId: "827132052788",
  appId: "1:827132052788:web:3f74c017f58e1785595161",
  measurementId: "G-PS7VJJ7P24"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

console.log("Firebase Analytics Active: Ugham Venture Platform");

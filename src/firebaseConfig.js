// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyApKe61HTJLwev2j0Byi-vZl0UiffICzQs",
    authDomain: "rajini-de453.firebaseapp.com",
    projectId: "rajini-de453",
    storageBucket: "rajini-de453.firebasestorage.app",
    messagingSenderId: "386685930668",
    appId: "1:386685930668:web:df04012779fd2c6b35e309",
    measurementId: "G-S9BP6QWCNC"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;
const db = getFirestore(app);

export { app, analytics, db };
export default firebaseConfig;


import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js";

// Check if keys are placeholders or if user has forced mock mode
const isConfigValid = (config: any) => {
  const forceMock = localStorage.getItem('koro_force_mock') === 'true';
  if (forceMock) return false;
  
  return config.apiKey && config.apiKey !== "YOUR_FIREBASE_API_KEY" && !config.apiKey.includes("YOUR_");
};

const firebaseConfig = {
  apiKey: "AIzaSyAFYD2OlSBX4pi52wokqyICEygDirYP7Pc",
  authDomain: "flutter-ai-playground-d5bd6.firebaseapp.com",
  projectId: "flutter-ai-playground-d5bd6",
  storageBucket: "flutter-ai-playground-d5bd6.firebasestorage.app",
  messagingSenderId: "14110942128",
  appId: "1:14110942128:web:9df5c5222d409c5f842c75"
};

let app;
let auth: any;
let googleProvider: any;
let isMock = true;

try {
  if (isConfigValid(firebaseConfig)) {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    isMock = false;
    console.log("Neural Grid: Firebase Link Established");
  } else {
    console.warn("Neural Bypass: Running in Autonomous (Local) mode.");
  }
} catch (error) {
  console.error("Neural Conflict: Firebase initialization failed", error);
}

export { 
  auth, 
  googleProvider, 
  isMock,
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
};

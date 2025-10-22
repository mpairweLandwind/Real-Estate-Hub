import { initializeApp, getApps, getApp } from "firebase/app"
import { getStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: "mernapp-6e488.firebaseapp.com",
  projectId: "mernapp-6e488",
  storageBucket: "mernapp-6e488.appspot.com",
  messagingSenderId: "536088247858",
  appId: "1:536088247858:web:361e7040eb5130f75e462b",
}

// Initialize Firebase (avoid re-initialization)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()

// Initialize Firebase Storage
const storage = getStorage(app)

export { app, storage }

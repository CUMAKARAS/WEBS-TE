// Firebase yapılandırması
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAnalytics } from 'firebase/analytics';

// Firebase yapılandırma bilgileri - gerçek Firebase projesinin bilgileri
const firebaseConfig = {
  apiKey: "AIzaSyA_IUJC5Xza6-uSMicvwXvgBBKyneIpfqs",
  authDomain: "morkan-c73ff.firebaseapp.com",
  projectId: "morkan-c73ff",
  storageBucket: "morkan-c73ff.appspot.com",
  messagingSenderId: "203114635036",
  appId: "1:203114635036:web:965daf8bbe8575c6c9a4d9",
  measurementId: "G-JM7BK32GHC"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

// Firebase servislerini başlat
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

// Test modu (doğrudan Firebase kullanılacağı için MongoDB gerekmiyor)
const TEST_MODE = true;

export { auth, db, storage, analytics, TEST_MODE };
export default app; 
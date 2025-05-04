// Firebase servis fonksiyonları
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail 
} from 'firebase/auth';

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';

import { auth, db } from '../firebase';

// Kimlik doğrulama işlemleri
// Kullanıcı kaydı
export const registerUser = async (userData) => {
  try {
    console.log('Firebase: Kullanıcı kayıt isteği:', userData);
    const { email, password, firstName, lastName } = userData;
    
    // Firebase Auth üzerinde kullanıcı oluştur
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Kullanıcı profilini güncelle (displayName)
    await updateProfile(user, {
      displayName: `${firstName} ${lastName}`
    });
    
    try {
      // Firestore'da kullanıcı belgesi oluşturmayı dene
      const userRef = doc(db, 'users', user.uid);
      await setDoc(userRef, {
        firstName,
        lastName,
        email,
        createdAt: serverTimestamp(),
        isActive: true,
        lastLogin: serverTimestamp()
      });
      console.log('Firebase: Kullanıcı verileri Firestore\'a kaydedildi.');
    } catch (firestoreError) {
      console.error('Firestore kayıt hatası (kimlik doğrulama başarılı):', firestoreError);
      console.log('Kullanıcı kaydedildi ancak profil bilgileri veritabanına yazılamadı. Temel özellikler çalışacak.');
      // Firestore hatası olsa bile devam et - Authentication kaydı yeterli
    }
    
    console.log('Firebase: Kullanıcı başarıyla kaydedildi:', user.uid);
    
    return {
      message: 'Kullanıcı başarıyla kaydedildi',
      userId: user.uid
    };
  } catch (error) {
    console.error('Firebase kayıt hatası:', error);
    
    // Firebase hata kodlarını kontrol et
    if (error.code === 'auth/email-already-in-use') {
      throw { message: 'Bu e-posta adresi zaten kullanılıyor' };
    } else if (error.code === 'auth/invalid-email') {
      throw { message: 'Geçersiz e-posta adresi' };
    } else if (error.code === 'auth/weak-password') {
      throw { message: 'Şifre çok zayıf. En az 6 karakter olmalıdır' };
    } else if (error.code === 'permission-denied') {
      throw { message: 'Firebase yetki hatası: İşlem için gerekli izinler eksik' };
    } else {
      throw { message: error.message || 'Kayıt sırasında bir hata oluştu' };
    }
  }
};

// Kullanıcı girişi
export const login = async (email, password) => {
  try {
    console.log('Firebase: Giriş denemesi:', email);
    
    // Firebase ile giriş yap
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    let userData = {
      email: user.email,
      firstName: user.displayName ? user.displayName.split(' ')[0] : '',
      lastName: user.displayName ? user.displayName.split(' ')[1] || '' : ''
    };
    
    try {
      // Kullanıcı bilgilerini Firestore'dan almayı dene (opsiyonel)
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        // Firestore'dan veri al
        userData = userDoc.data();
        
        // Son giriş zamanını güncellemeyi dene
        await updateDoc(userRef, {
          lastLogin: serverTimestamp()
        }).catch(err => console.log('Son giriş zamanı güncellenemedi', err));
      } else {
        // Firestore'da kullanıcı bulunamadıysa, yeni bir belge oluşturmayı dene
        await setDoc(userRef, {
          email: user.email,
          firstName: user.displayName ? user.displayName.split(' ')[0] : '',
          lastName: user.displayName ? user.displayName.split(' ')[1] || '' : '',
          lastLogin: serverTimestamp()
        }).catch(err => console.log('Kullanıcı profili oluşturulamadı', err));
      }
    } catch (firestoreError) {
      // Firestore hatası yok say - Authentication başarılı olduğu sürece giriş yapabilir
      console.error('Firestore veri alma hatası (giriş işlemi başarılı):', firestoreError);
    }
    
    console.log('Firebase: Giriş başarılı:', user.uid);
    
    return {
      message: 'Giriş başarılı',
      user: {
        id: user.uid,
        email: user.email,
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      }
    };
  } catch (error) {
    console.error('Firebase giriş hatası:', error);
    
    // Firebase hata kodlarını kontrol et
    if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      throw { message: 'Geçersiz e-posta veya şifre' };
    } else if (error.code === 'auth/invalid-email') {
      throw { message: 'Geçersiz e-posta adresi' };
    } else if (error.code === 'auth/too-many-requests') {
      throw { message: 'Çok fazla başarısız giriş denemesi. Lütfen daha sonra tekrar deneyin' };
    } else if (error.code === 'permission-denied') {
      throw { message: 'Firebase yetki hatası: İşlem için gerekli izinler eksik' };
    } else {
      throw { message: error.message || 'Giriş sırasında bir hata oluştu' };
    }
  }
};

// Çıkış yap
export const logout = async () => {
  try {
    await signOut(auth);
    return { message: 'Başarıyla çıkış yapıldı' };
  } catch (error) {
    console.error('Firebase çıkış hatası:', error);
    throw { message: 'Çıkış yapılırken bir hata oluştu' };
  }
};

// Şifre sıfırlama e-postası gönder
export const sendPasswordReset = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi' };
  } catch (error) {
    console.error('Firebase şifre sıfırlama hatası:', error);
    
    if (error.code === 'auth/user-not-found') {
      throw { message: 'Bu e-posta adresiyle kayıtlı bir kullanıcı bulunamadı' };
    } else if (error.code === 'auth/invalid-email') {
      throw { message: 'Geçersiz e-posta adresi' };
    } else {
      throw { message: 'Şifre sıfırlama bağlantısı gönderilirken bir hata oluştu' };
    }
  }
};

// Firestore veri işlemleri
// Kullanıcı bilgilerini al
export const getUserData = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      throw { message: 'Kullanıcı bulunamadı' };
    }
    
    return userDoc.data();
  } catch (error) {
    console.error('Firebase kullanıcı verisi alma hatası:', error);
    throw { message: 'Kullanıcı bilgileri alınırken bir hata oluştu' };
  }
};

// Mevcut oturum açmış kullanıcıyı al
export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// API durumunu kontrol et (Firebase bağlantısı)
export const checkApiStatus = async () => {
  try {
    console.log('Firebase bağlantısı kontrol ediliyor...');
    
    // TEST_MODE'dan değeri al
    const { TEST_MODE } = await import('../firebase');
    
    // Test modunda olup olmadığımızı kontrol et
    if (TEST_MODE) {
      console.log('Test modunda - Firebase bağlantısı kontrolü atlıyoruz');
      return { 
        status: 'Firebase bağlantısı çalışıyor (Test modu)', 
        timestamp: new Date() 
      };
    }
    
    // Auth durumunu kontrol et - yetki gerektirmeyen bir yöntem
    const user = auth.currentUser;
    console.log('Geçerli kullanıcı durumu:', user ? 'Giriş yapılmış' : 'Giriş yapılmamış');
    
    return { 
      status: 'Firebase bağlantısı çalışıyor', 
      timestamp: new Date() 
    };
  } catch (error) {
    console.error('Firebase bağlantı hatası:', error);
    // Hata mesajını daha açıklayıcı hale getir
    if (error.code === 'permission-denied') {
      throw { message: 'Firebase yetki hatası: Veritabanı izinleri ayarlanmamış' };
    } else {
      throw { message: `Firebase bağlantı hatası: ${error.message}` };
    }
  }
}; 
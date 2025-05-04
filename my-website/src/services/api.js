import axios from 'axios';

// API temel URL'i
const API_URL = 'http://localhost:3001/api';

// Test modu - sunucu yerine sahte yanıtlar kullan
const TEST_MODE = false;

// Axios örneği oluştur
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: false, // CORS sorunlarını önlemek için false yapıldı
  timeout: 30000 // Zaman aşımını 30 saniyeye çıkaralım
});

// Axios istek interceptor'ı - tüm istekleri loglar
api.interceptors.request.use(
  config => {
    console.log('API isteği gönderiliyor:', config.url);
    
    // Test modunda ve gerçek istek başarısız olursa sahte yanıt döndür
    if (TEST_MODE) {
      return config;
    }
    
    return config;
  },
  error => {
    console.error('API istek hatası:', error);
    return Promise.reject(error);
  }
);

// Axios yanıt interceptor'ı - tüm yanıtları loglar
api.interceptors.response.use(
  response => {
    console.log('API yanıtı alındı:', response.status);
    return response;
  },
  error => {
    if (error.response) {
      // Sunucudan yanıt geldi ama hata kodu
      console.error('API hata yanıtı:', error.response.status, error.response.data);
    } else if (error.request) {
      // İstek yapıldı ama yanıt gelmedi
      console.error('API yanıt vermedi:', error.request);
      
      // Eğer test modundaysak ve bağlantı hatası varsa, sahte veri döndür
      if (TEST_MODE) {
        console.log('TEST MODU: Sahte yanıt üretiliyor');
        
        // Hangi endpoint için istek yapıldığını tespit et
        const url = error.config.url;
        
        if (url.includes('/status')) {
          return Promise.resolve({
            data: { status: 'API çalışıyor (sahte)', timestamp: new Date() }
          });
        }
        
        if (url.includes('/auth/login')) {
          return Promise.resolve({
            data: {
              message: 'Giriş başarılı (test modu)',
              user: {
                id: 'test123',
                email: error.config.data ? JSON.parse(error.config.data).email : 'test@example.com',
                firstName: 'Test',
                lastName: 'Kullanıcı'
              }
            }
          });
        }
        
        if (url.includes('/auth/register')) {
          return Promise.resolve({
            data: {
              message: 'Kullanıcı başarıyla kaydedildi (test modu)',
              userId: 'test123'
            }
          });
        }
        
        if (url.includes('/auth/user')) {
          return Promise.resolve({
            data: {
              user: {
                id: 'test123',
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'Kullanıcı'
              }
            }
          });
        }
        
        // Diğer tüm istekler için genel bir başarı yanıtı
        return Promise.resolve({
          data: { success: true, message: 'İşlem başarılı (test modu)' }
        });
      }
    } else {
      // İstek oluşturulurken hata oluştu
      console.error('API istek hatası:', error.message);
    }
    return Promise.reject(error);
  }
);

// Sunucu bağlantısını test et
const testConnection = async () => {
  try {
    await api.get('/status', { timeout: 5000 });
    return true;
  } catch (error) {
    console.error('Sunucu bağlantı hatası:', error.message);
    
    // Test modundaysak yine de bağlantı var gibi davran
    if (TEST_MODE) {
      console.log('TEST MODU: Sahte bağlantı başarılı kabul edildi');
      return true;
    }
    
    return false;
  }
};

// API durumunu kontrol et
export const checkApiStatus = async () => {
  try {
    console.log('API durumu kontrol ediliyor...');
    const response = await api.get('/status');
    console.log('API durumu:', response.data);
    return response.data;
  } catch (error) {
    console.error('API bağlantı hatası:', error);
    
    // Test modundaysak API çalışıyor gibi davran
    if (TEST_MODE) {
      console.log('TEST MODU: API çalışıyor kabul edildi');
      return { status: 'API çalışıyor (sahte)', timestamp: new Date() };
    }
    
    // Hata mesajını daha açıklayıcı hale getirelim
    let errorMessage = 'API sunucusuna bağlanılamıyor.';
    
    if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Sunucu çalışmıyor veya bağlantı reddedildi. Lütfen sunucunun çalıştığından emin olun.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Sunucu yanıt verme zaman aşımına uğradı. Lütfen internet bağlantınızı kontrol edin.';
    }
    
    throw { message: errorMessage };
  }
};

// Kullanıcı kayıt servisi
export const registerUser = async (userData) => {
  try {
    // Sunucu bağlantısını test et
    const isConnected = await testConnection();
    if (!isConnected && !TEST_MODE) {
      throw { message: 'Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.' };
    }
    
    // Kayıt isteği gönder
    console.log('Kullanıcı kayıt isteği:', userData);
    const response = await api.post('/auth/register', userData);
    console.log('Kayıt başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Kayıt hatası:', error);
    
    // Test modunda başarılı kabul et
    if (TEST_MODE && !error.response) {
      return {
        message: 'Kullanıcı başarıyla kaydedildi (test modu)',
        userId: 'test123'
      };
    }
    
    if (error.response) {
      // Sunucu hata mesajını döndür
      throw error.response.data;
    } else if (error.message) {
      // Bağlantı hatası mesajını döndür
      throw error;
    } else {
      // Genel hata mesajı
      throw { message: 'Bilinmeyen bir hata oluştu' };
    }
  }
};

// Kullanıcı giriş servisi
export const loginUser = async (email, password) => {
  try {
    // Sunucu bağlantısını test et
    const isConnected = await testConnection();
    if (!isConnected && !TEST_MODE) {
      throw { message: 'Sunucu bağlantısı kurulamadı. Lütfen sunucunun çalıştığından emin olun.' };
    }
    
    console.log('Giriş isteği gönderiliyor...');
    const response = await api.post('/auth/login', { email, password });
    console.log('Giriş başarılı:', response.data);
    return response.data;
  } catch (error) {
    console.error('Giriş hatası:', error);
    
    // Test modunda başarılı kabul et
    if (TEST_MODE && !error.response) {
      return {
        message: 'Giriş başarılı (test modu)',
        user: {
          id: 'test123',
          email: email,
          firstName: 'Test',
          lastName: 'Kullanıcı'
        }
      };
    }
    
    if (error.response) {
      // Sunucu hata mesajını döndür
      return Promise.reject(error.response.data);
    } else if (error.request) {
      // İstek gönderildi ama yanıt gelmedi
      return Promise.reject({ 
        message: 'Sunucu yanıt vermiyor. Lütfen internet bağlantınızı ve sunucu durumunu kontrol edin.' 
      });
    } else {
      // İstek oluşturulamadı
      return Promise.reject({ 
        message: error.message || 'Giriş isteği gönderilirken bir hata oluştu.' 
      });
    }
  }
};

// Mevcut oturum bilgisini getir
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/user');
    return response.data.user;
  } catch (error) {
    console.error('Kullanıcı bilgisi alınamadı:', error);
    
    // Test modunda sahte kullanıcı döndür
    if (TEST_MODE) {
      return {
        id: 'test123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'Kullanıcı'
      };
    }
    
    return null;
  }
};

export default api;
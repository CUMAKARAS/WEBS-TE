const mongoose = require('mongoose');

// Test modu aktif (MongoDB gerektirmeden çalışabilir)
const TEST_MODE = false;

// MongoDB bağlantı fonksiyonu
const connectDB = async () => {
  try {
    const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/morkan-db';
    console.log('MongoDB URI:', MONGO_URI);
    
    // Bağlantı seçenekleri
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // Sunucu seçim zaman aşımı
      socketTimeoutMS: 45000, // Soket zaman aşımı
    };
    
    // Bağlantıyı kur
    await mongoose.connect(MONGO_URI, options);
    console.log('MongoDB\'ye başarıyla bağlandı');
    
    return MONGO_URI;
  } catch (error) {
    console.error('MongoDB bağlantı hatası:', error);
    
    // Hata nedeniyle test moduna geç
    global.TEST_MODE = true;
    return null;
  }
};

// Bağlantıyı kapat
const disconnectDB = async () => {
  if (TEST_MODE) return;
  
  try {
    await mongoose.disconnect();
    console.log('MongoDB bağlantısı kapatıldı');
  } catch (err) {
    console.error('MongoDB bağlantısı kapatılırken hata:', err);
  }
};

module.exports = {
  connectDB,
  disconnectDB
}; 
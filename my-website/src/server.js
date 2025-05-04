const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const session = require('express-session');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const { connectDB } = require('./utils/db');
const User = require('./models/User');
const { hashPassword, comparePassword } = require('./utils/passwordUtils');

// Debug modu
const DEBUG = true;

// Express uygulaması oluştur
const app = express();

// Test modu yapılandırması - MongoDB bağlantısını test modunda kullanmak için true yapıyoruz
const TEST_MODE = true;
console.log('Test modu aktif:', TEST_MODE ? 'MongoDB bağlantısı atlanıyor' : 'Gerçek veritabanı kullanılıyor');

// MongoDB bağlantısı
const MONGO_URI = TEST_MODE ? 'memory://test-db' : (process.env.MONGO_URI || 'mongodb://localhost:27017/morkan-db');
console.log('MongoDB URI:', MONGO_URI);

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Express session yapılandırması
app.use(session({
  secret: 'morkan-secret-key',
  resave: false,
  saveUninitialized: false
}));

// Test modunda Sahte kullanıcı veritabanı
const testUsers = [
  {
    _id: 'test123',
    email: 'test@example.com',
    password: '$2a$10$TEST_HASH', // bcrypt hash
    firstName: 'Test',
    lastName: 'Kullanıcı',
    createdAt: new Date(),
    isActive: true
  },
  {
    _id: 'user456',
    email: 'boramorkan@hotmail.com',
    password: '$2a$10$TEST_HASH', // bcrypt hash
    firstName: 'Bora',
    lastName: 'Morkan',
    createdAt: new Date(),
    isActive: true
  }
];

// MongoDB bağlantısı
if (!TEST_MODE) {
  console.log('MongoDB bağlantısı kuruluyor...');
  mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // Sunucu seçim zaman aşımı
    socketTimeoutMS: 45000, // Soket zaman aşımı
  })
    .then(() => console.log('MongoDB\'ye başarıyla bağlandı'))
    .catch(err => {
      console.error('MongoDB bağlantı hatası:', err);
      console.log('Uygulama test modunda devam ediyor...');
      // Bağlantı hatası durumunda test moduna geç
      global.TEST_MODE = true;
    });
}

// MongoDB şema ve model tanımlamaları
if (!TEST_MODE) {
  // User model şeması zaten models/User.js içinde tanımlanmış durumda
  console.log('MongoDB modelleri hazırlanıyor...');
  
  // Eğer User modeli yoksa oluştur
  if (!mongoose.models.User) {
    const userSchema = new mongoose.Schema({
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
      isActive: { type: Boolean, default: true }
    });
    
    mongoose.model('User', userSchema);
    console.log('User modeli oluşturuldu');
  }
}

// Test modu middleware - MongoDB modellerini öykün
app.use((req, res, next) => {
  // Global test modu değişkenini kontrol et
  const isTestMode = TEST_MODE || global.TEST_MODE;
  
  if (isTestMode) {
    console.log('Test modu middleware çalışıyor');
    // Kullanıcı modeli öykünmesi
    req.db = {
      users: {
        findOne: async (query) => {
          console.log('TEST: findOne çağrıldı', query);
          try {
            if (query.email) {
              const user = testUsers.find(user => user.email === query.email);
              console.log('TEST: Email ile kullanıcı bulundu:', user ? user.email : 'bulunamadı');
              return user;
            }
            if (query._id) {
              const user = testUsers.find(user => user._id === query._id);
              console.log('TEST: ID ile kullanıcı bulundu:', user ? user._id : 'bulunamadı');
              return user;
            }
            return null;
          } catch (error) {
            console.error('TEST: findOne hatası:', error);
            return null;
          }
        },
        create: async (userData) => {
          console.log('TEST: create çağrıldı', userData);
          try {
            const newUser = {
              ...userData,
              _id: `test_${Date.now()}`,
              createdAt: new Date(),
              isActive: true
            };
            testUsers.push(newUser);
            console.log('TEST: Yeni kullanıcı oluşturuldu:', newUser.email);
            console.log('TEST: Güncel kullanıcı listesi:', testUsers.map(u => u.email));
            return newUser;
          } catch (error) {
            console.error('TEST: create hatası:', error);
            throw error;
          }
        },
        // Tüm kullanıcıları listele
        find: async () => {
          console.log('TEST: find çağrıldı - tüm kullanıcılar');
          try {
            return testUsers;
          } catch (error) {
            console.error('TEST: find hatası:', error);
            return [];
          }
        }
      }
    };
  } else {
    // Gerçek veritabanı durumunda db modelleri
    req.db = {
      users: mongoose.model('User')
    };
  }
  
  next();
});

// Tüm kullanıcıları listeleme endpoint (test için)
app.get('/api/users', async (req, res) => {
  try {
    console.log('Tüm kullanıcılar endpoint çağrıldı');
    const users = TEST_MODE || global.TEST_MODE
      ? await req.db.users.find()
      : await User.find().select('-password');
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt
      }))
    });
  } catch (error) {
    console.error('Kullanıcıları listeleme hatası:', error);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
});

// Sunucu durumunu kontrol için endpoint
app.get('/api/status', (req, res) => {
  console.log('Status endpoint çağrıldı');
  res.json({
    status: 'API çalışıyor',
    mode: TEST_MODE || global.TEST_MODE ? 'test' : 'production',
    timestamp: new Date()
  });
});

// Kayıt ol endpoint
app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (DEBUG) {
      console.log('Register isteği:', { firstName, lastName, email });
    }

    // Test modu kontrolü
    const isTestMode = TEST_MODE || global.TEST_MODE;
    
    if (isTestMode) {
      console.log('TEST MODU: Kayıt işlemi test modunda yapılıyor');
      
      // Email kontrolü
      const existingUser = testUsers.find(user => user.email === email);
      if (existingUser) {
        console.log('TEST MODU: E-posta adresi zaten kullanılıyor:', email);
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }
      
      // Şifre hash'leme
      const hashedPassword = await hashPassword(password);
      
      // Test veritabanına kullanıcı ekle
      const newUser = {
        _id: `test_${Date.now()}`,
        firstName,
        lastName,
        email,
        password: hashedPassword,
        createdAt: new Date(),
        isActive: true
      };
      
      testUsers.push(newUser);
      console.log('TEST MODU: Yeni kullanıcı oluşturuldu:', email);
      console.log('TEST MODU: Güncel kullanıcı listesi:', testUsers.map(u => u.email));
      
      return res.status(201).json({ 
        message: 'Kullanıcı başarıyla kaydedildi',
        userId: newUser._id
      });
    } else {
      // Gerçek MongoDB kullanımı
      // Email kontrolü
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
      }

      // Şifre hash'leme
      const hashedPassword = await hashPassword(password);

      // Yeni kullanıcı oluştur
      const newUser = new User({
        firstName,
        lastName,
        email,
        password: hashedPassword
      });
      await newUser.save();
      console.log('Yeni gerçek kullanıcı oluşturuldu:', email);
      
      return res.status(201).json({ 
        message: 'Kullanıcı başarıyla kaydedildi',
        userId: newUser._id
      });
    }
  } catch (error) {
    console.error('Kayıt hatası:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
});

// Giriş yap endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (DEBUG) {
      console.log('Login isteği:', { email });
    }
    
    // Test modu kontrolü
    const isTestMode = TEST_MODE || global.TEST_MODE;
    
    if (isTestMode) {
      console.log('TEST MODU: Giriş işlemi test modunda yapılıyor');
      
      // Test veritabanında kullanıcıyı ara
      const user = testUsers.find(user => user.email === email);
      if (!user) {
        console.log('TEST MODU: Kullanıcı bulunamadı:', email);
        return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
      }
      
      // Test modunda şifre doğrulama (test kullanıcılar için her zaman başarılı)
      // Gerçek şifre doğrulaması için aşağıdaki satırı kullanın:
      // const isMatch = await comparePassword(password, user.password);
      const isMatch = email === 'test@example.com' || email === 'boramorkan@hotmail.com' || await comparePassword(password, user.password);
      
      if (!isMatch) {
        console.log('TEST MODU: Şifre eşleşmiyor:', email);
        return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
      }
      
      console.log('TEST MODU: Giriş başarılı:', email);
      return res.json({ 
        message: 'Giriş başarılı',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    } else {
      // Gerçek MongoDB kullanımı
      // Kullanıcıyı e-posta ile bul
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
      }
      
      // Şifre doğrulama
      const isMatch = await comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Geçersiz e-posta veya şifre' });
      }
      
      // Başarılı giriş
      return res.json({ 
        message: 'Giriş başarılı',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        }
      });
    }
  } catch (error) {
    console.error('Giriş hatası:', error.message);
    res.status(500).json({ message: 'Sunucu hatası: ' + error.message });
  }
});

// Kullanıcı bilgilerini getir
app.get('/api/auth/user', (req, res) => {
  // Test modunda demo kullanıcı
  res.json({
    user: {
      id: 'test123',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'Kullanıcı'
    }
  });
});

// Auth ve kullanıcı rotaları
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Ana fonksiyon
const startServer = async () => {
  try {
    // Port ayarı
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Sunucu port ${PORT} üzerinde çalışıyor`);
      console.log(`API erişim noktası: http://localhost:${PORT}/api`);
    });
  } catch (error) {
    console.error('Sunucu başlatma hatası:', error);
    process.exit(1);
  }
};

// Hata yakalama
process.on('uncaughtException', (err) => {
  console.error('Yakalanmayan istisna:', err);
  console.log('Sunucu çalışmaya devam ediyor...');
});

// MongoDB bağlantı hatası durumunda
mongoose.connection.on('error', (err) => {
  console.error('MongoDB bağlantı hatası:', err);
  global.TEST_MODE = true;
  console.log('Uygulama test moduna geçti');
});

// Sunucuyu başlat
startServer();

module.exports = app; 
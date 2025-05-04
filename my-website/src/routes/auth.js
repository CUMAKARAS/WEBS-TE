const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

// Test modu
const TEST_MODE = true;

// Giriş endpoint'i
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login isteği:', { email });
    
    if (TEST_MODE) {
      // Test modunda sahte yanıt
      if (email === 'test@example.com' || email === 'boramorkan@hotmail.com') {
        return res.json({
          message: 'Giriş başarılı (test modu)',
          user: {
            id: email === 'boramorkan@hotmail.com' ? 'user456' : 'test123',
            email,
            firstName: email === 'boramorkan@hotmail.com' ? 'Bora' : 'Test',
            lastName: email === 'boramorkan@hotmail.com' ? 'Morkan' : 'Kullanıcı'
          }
        });
      } else {
        return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
      }
    }
    
    // Kullanıcıyı bul
    const user = await req.db.users.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // Şifreyi karşılaştır
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Geçersiz kullanıcı adı veya şifre' });
    }
    
    // Kullanıcı bilgilerini döndür
    return res.json({
      message: 'Giriş başarılı',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    });
  } catch (error) {
    console.error('Giriş hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kayıt endpoint'i
router.post('/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    if (TEST_MODE) {
      // Test modunda sahte yanıt
      return res.json({
        message: 'Kullanıcı başarıyla kaydedildi (test modu)',
        userId: `test_${Date.now()}`
      });
    }
    
    // E-posta zaten kullanılıyor mu kontrol et
    const existingUser = await req.db.users.findOne({ email });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanılıyor' });
    }
    
    // Şifreyi hashle
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Yeni kullanıcı oluştur
    const newUser = await req.db.users.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isActive: true
    });
    
    // Yanıt
    return res.status(201).json({
      message: 'Kullanıcı başarıyla kaydedildi',
      userId: newUser._id
    });
  } catch (error) {
    console.error('Kayıt hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Kullanıcı bilgilerini döndür
router.get('/user', (req, res) => {
  if (TEST_MODE) {
    // Test modunda sahte kullanıcı
    return res.json({
      user: {
        id: 'test123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'Kullanıcı'
      }
    });
  }
  
  return res.status(401).json({ message: 'Giriş yapılmamış' });
});

// Çıkış
router.get('/logout', (req, res) => {
  res.json({ message: 'Başarıyla çıkış yapıldı' });
});

module.exports = router; 
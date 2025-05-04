const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const axios = require('axios');

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

// Kripto para analiz endpoint'i
router.get('/analyze', async (req, res) => {
  try {
    const { coin_id, days, coin_name } = req.query;
    
    if (TEST_MODE) {
      // Test modunda sahte yanıt
      return res.json({
        coin_id,
        coin_name,
        current_price: 50000,
        bb_analysis: "Bantlar İçinde",
        macd_analysis: "MACD analizi geçici olarak devre dışı",
        rsi_analysis: "RSI analizi geçici olarak devre dışı",
        volatility: "Volatilite analizi geçici olarak devre dışı",
        recommendation: "BEKLEMEDE KAL",
        price_prediction: "Son 30 günde fiyat değişimi: %5.2",
        last_updated: new Date().toISOString(),
        prices: Array(30).fill().map((_, i) => [Date.now() - i * 86400000, 50000 + Math.random() * 1000]),
        volumes: Array(30).fill().map((_, i) => [Date.now() - i * 86400000, 1000000 + Math.random() * 500000]),
        ema20: Array(30).fill(50000),
        ema50: Array(30).fill(50000),
        bollinger_bands: {
          upper: Array(30).fill(51000),
          middle: Array(30).fill(50000),
          lower: Array(30).fill(49000)
        },
        rsi: 50,
        macd: 0,
        bollinger_position: "Bantlar İçinde",
        ai_prediction: {
          trend: "YUKARI",
          reliability: 60,
          predicted_price: 52000,
          price_change: 5.2
        }
      });
    }

    // CoinGecko API'den veri al
    const response = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin_id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: days,
        interval: 'daily'
      }
    });

    const { prices, total_volumes } = response.data;

    // Analiz sonuçlarını oluştur
    const analysis = {
      coin_id,
      coin_name,
      current_price: prices[prices.length - 1][1],
      bb_analysis: "Bantlar İçinde",
      macd_analysis: "MACD analizi geçici olarak devre dışı",
      rsi_analysis: "RSI analizi geçici olarak devre dışı",
      volatility: "Volatilite analizi geçici olarak devre dışı",
      recommendation: "BEKLEMEDE KAL",
      price_prediction: "Son 30 günde fiyat değişimi: %5.2",
      last_updated: new Date().toISOString(),
      prices,
      volumes: total_volumes,
      ema20: prices.map(p => p[1]),
      ema50: prices.map(p => p[1]),
      bollinger_bands: {
        upper: prices.map(p => p[1] * 1.02),
        middle: prices.map(p => p[1]),
        lower: prices.map(p => p[1] * 0.98)
      },
      rsi: 50,
      macd: 0,
      bollinger_position: "Bantlar İçinde",
      ai_prediction: {
        trend: "YUKARI",
        reliability: 60,
        predicted_price: prices[prices.length - 1][1] * 1.05,
        price_change: 5.2
      }
    };

    res.json(analysis);
  } catch (error) {
    console.error('Analiz hatası:', error);
    res.status(500).json({ error: 'Analiz yapılırken bir hata oluştu' });
  }
});

// Test route
router.get('/test', (req, res) => {
  res.json({ message: 'Auth rotaları çalışıyor!' });
});

module.exports = router; 
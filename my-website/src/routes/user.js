const express = require('express');
const router = express.Router();

// Test modu
const TEST_MODE = true;

// Kullanıcı profil bilgilerini getir
router.get('/profile/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    if (TEST_MODE) {
      // Test modunda sahte profil
      return res.json({
        profile: {
          id: userId,
          email: userId === 'user456' ? 'boramorkan@hotmail.com' : 'test@example.com',
          firstName: userId === 'user456' ? 'Bora' : 'Test',
          lastName: userId === 'user456' ? 'Morkan' : 'Kullanıcı',
          bio: 'Bu bir test kullanıcısıdır',
          joinDate: '2024-01-01'
        }
      });
    }
    
    // Gerçek kullanıcıyı bul
    const user = await req.db.users.findOne({ _id: userId });
    
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
    
    // Profil bilgilerini döndür
    return res.json({
      profile: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        bio: user.bio || '',
        joinDate: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profil getirme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

// Profil güncelleme
router.put('/profile/:id', async (req, res) => {
  try {
    if (TEST_MODE) {
      // Test modunda sahte güncelleme
      return res.json({
        message: 'Profil başarıyla güncellendi (test modu)',
        profile: {
          ...req.body,
          id: req.params.id
        }
      });
    }
    
    // Gerçek güncelleme
    // Burada kullanıcı güncellemesi yapılacak
    
    return res.json({
      message: 'Profil başarıyla güncellendi'
    });
  } catch (error) {
    console.error('Profil güncelleme hatası:', error);
    return res.status(500).json({ message: 'Sunucu hatası' });
  }
});

module.exports = router; 
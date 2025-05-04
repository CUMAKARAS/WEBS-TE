const bcrypt = require('bcryptjs');

// Şifre hashleme
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.error('Şifre hashleme hatası:', error);
    throw new Error('Şifre güvenli bir şekilde kaydedilemedi');
  }
};

// Şifre karşılaştırma
const comparePassword = async (password, hashedPassword) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.error('Şifre karşılaştırma hatası:', error);
    return false;
  }
};

// Rastgele şifre oluşturma
const generateRandomPassword = (length = 12) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars.charAt(randomIndex);
  }
  
  return password;
};

module.exports = {
  hashPassword,
  comparePassword,
  generateRandomPassword
}; 
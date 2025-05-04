import React, { useState, useEffect } from 'react';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    day: '',
    month: '',
    year: '',
    gender: ''
  });

  const [showModal, setShowModal] = useState(false);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  // ESC tuşu ile modalı kapatmak için
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closeModal();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleLoginChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    console.log('Giriş bilgileri:', loginData);
    if (onLogin) onLogin(loginData);
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    console.log('Kayıt bilgileri:', registerData);
    // Tam ad oluştur
    const userData = {
      ...registerData,
      fullName: `${registerData.firstName} ${registerData.lastName}`
    };
    if (onLogin) onLogin(userData);
  };

  // Sayfa dışına tıklandığında modalı kapatmak için
  const handleModalBackdropClick = (e) => {
    if (e.target.className === 'register-modal-backdrop show') {
      closeModal();
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="left-section">
          <h1 className="logo">facebook</h1>
          <h2 className="tagline">Facebook tanıdıklarınla iletişim kurmanı ve hayatında olup bitenleri paylaşmanı sağlar.</h2>
        </div>
        
        <div className="right-section">
          <div className="login-form-container">
            <form onSubmit={handleLoginSubmit}>
              <input
                type="text"
                name="email"
                placeholder="E-posta veya telefon numarası"
                value={loginData.email}
                onChange={handleLoginChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Şifre"
                value={loginData.password}
                onChange={handleLoginChange}
                required
              />
              <button type="submit" className="login-btn">Giriş Yap</button>
            </form>
            <div className="forgot-password">
              <a href="#">Şifreni mi unuttun?</a>
            </div>
            <div className="divider"></div>
            <button className="create-account-btn" onClick={openModal}>
              Yeni Hesap Oluştur
            </button>
          </div>
          
          <div className="create-page">
            <p><strong>Ünlüler, markalar veya işletmeler için</strong> <a href="#">sayfa oluşturabilirsin</a>.</p>
          </div>
        </div>
      </div>
      
      {/* Kayıt Modal */}
      <div 
        className={`register-modal-backdrop ${showModal ? 'show' : ''}`} 
        onClick={handleModalBackdropClick}
      >
        <div className="register-modal">
          <div className="register-modal-header">
            <div className="register-header-text">
              <h2>Kaydol</h2>
              <p>Hızlı ve kolaydır.</p>
            </div>
            <button className="close-modal" onClick={closeModal}>&times;</button>
          </div>
          
          <form onSubmit={handleRegisterSubmit}>
            <div className="name-group">
              <input
                type="text"
                name="firstName"
                placeholder="Adın"
                value={registerData.firstName}
                onChange={handleRegisterChange}
                required
              />
              <input
                type="text"
                name="lastName"
                placeholder="Soyadın"
                value={registerData.lastName}
                onChange={handleRegisterChange}
                required
              />
            </div>
            
            <input
              type="email"
              name="email"
              placeholder="Cep telefonu numarası veya e-posta"
              value={registerData.email}
              onChange={handleRegisterChange}
              required
            />
            
            <input
              type="password"
              name="password"
              placeholder="Yeni şifre"
              value={registerData.password}
              onChange={handleRegisterChange}
              required
            />
            
            <div className="birth-date">
              <label>Doğum Tarihi</label>
              <div className="birth-date-selects">
                <select 
                  name="day"
                  value={registerData.day}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="">Gün</option>
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                
                <select 
                  name="month"
                  value={registerData.month}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="">Ay</option>
                  <option value="1">Ocak</option>
                  <option value="2">Şubat</option>
                  <option value="3">Mart</option>
                  <option value="4">Nisan</option>
                  <option value="5">Mayıs</option>
                  <option value="6">Haziran</option>
                  <option value="7">Temmuz</option>
                  <option value="8">Ağustos</option>
                  <option value="9">Eylül</option>
                  <option value="10">Ekim</option>
                  <option value="11">Kasım</option>
                  <option value="12">Aralık</option>
                </select>
                
                <select 
                  name="year"
                  value={registerData.year}
                  onChange={handleRegisterChange}
                  required
                >
                  <option value="">Yıl</option>
                  {Array.from({ length: 100 }, (_, i) => 2025 - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="gender-select">
              <label>Cinsiyet</label>
              <div className="gender-options">
                <label className="gender-label">
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    onChange={handleRegisterChange}
                    required
                  />
                  <span>Kadın</span>
                </label>
                
                <label className="gender-label">
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    onChange={handleRegisterChange}
                  />
                  <span>Erkek</span>
                </label>
                
                <label className="gender-label">
                  <input
                    type="radio"
                    name="gender"
                    value="custom"
                    onChange={handleRegisterChange}
                  />
                  <span>Özel</span>
                </label>
              </div>
            </div>
            
            <div className="terms">
              <p>
                Kaydol düğmesine tıklayarak, Koşullarımızı, Gizlilik İlkemizi ve Çerezler İlkemizi kabul etmiş olursun. Facebook'tan SMS Bildirimleri alabilirsin ve bu bildirimleri istediğin zaman durdurabilirsin.
              </p>
            </div>
            
            <div className="submit-btn-container">
              <button type="submit" className="register-btn">Kaydol</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
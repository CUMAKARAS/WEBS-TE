import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';  // Aynı CSS dosyasını kullanıyoruz

const RegisterPage = ({ onRegister }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Hata varsa temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName) {
      newErrors.firstName = 'Ad gereklidir';
    }
    
    if (!formData.lastName) {
      newErrors.lastName = 'Soyad gereklidir';
    }
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi gereklidir';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi giriniz';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre gereklidir';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler eşleşmiyor';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Kullanım koşullarını kabul etmeniz gerekiyor';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form verileri:', formData);
      
      // Kayıt başarılı - simüle edilmiş
      const userData = {
        email: formData.email,
        fullName: `${formData.firstName} ${formData.lastName}`,
        id: Math.random().toString(36).substring(2, 9)
      };
      
      if (onRegister) {
        onRegister(userData);
      }
      
      // Giriş sayfasına yönlendir
      navigate('/login', { state: { registrationSuccess: true } });
    }
  };
  
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="app-branding">
          <Link to="/" className="logo-link">
            <h1 className="app-name">SocialApp</h1>
          </Link>
        </div>
        
        <div className="auth-form-container">
          <h2>Hesap Oluşturun</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="name-row">
              <div className="form-group">
                <label htmlFor="firstName">Ad</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <div className="error-message">{errors.firstName}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="lastName">Soyad</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <div className="error-message">{errors.lastName}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Şifre Tekrar</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>
            
            <div className="form-group checkbox-group">
              <div className="agree-terms">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  className={errors.agreeTerms ? 'error' : ''}
                />
                <label htmlFor="agreeTerms">
                  <Link to="/terms">Kullanım Koşullarını</Link> ve <Link to="/privacy">Gizlilik Politikasını</Link> kabul ediyorum.
                </label>
              </div>
              {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
            </div>
            
            <button type="submit" className="submit-btn">Kayıt Ol</button>
          </form>
          
          <div className="social-login">
            <p>Veya şununla kayıt olun:</p>
            <div className="social-buttons">
              <button className="social-btn google">
                Google ile Kayıt Ol
              </button>
              <button className="social-btn facebook">
                Facebook ile Kayıt Ol
              </button>
            </div>
          </div>
          
          <div className="auth-footer">
            <p>Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
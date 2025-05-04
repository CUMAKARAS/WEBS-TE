import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      console.log('Form verileri:', formData);
      
      // Giriş başarılı - simüle edilmiş
      const userData = {
        email: formData.email,
        // Gerçek uygulamada backend'den gelen kullanıcı bilgileri olacak
        fullName: 'Kullanıcı Adı',
        id: '12345'
      };
      
      if (onLogin) {
        onLogin(userData);
      }
      
      // Ana sayfaya yönlendir
      navigate('/dashboard');
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
          <h2>Hesabınıza Giriş Yapın</h2>
          
          <form onSubmit={handleSubmit} className="auth-form">
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
            
            <div className="form-options">
              <div className="remember-me">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                />
                <label htmlFor="rememberMe">Beni hatırla</label>
              </div>
              
              <div className="forgot-password">
                <Link to="/forgot-password">Şifremi Unuttum</Link>
              </div>
            </div>
            
            <button type="submit" className="submit-btn">Giriş Yap</button>
          </form>
          
          <div className="social-login">
            <p>Veya şununla giriş yapın:</p>
            <div className="social-buttons">
              <button className="social-btn google">
                Google ile Giriş Yap
              </button>
              <button className="social-btn facebook">
                Facebook ile Giriş Yap
              </button>
            </div>
          </div>
          
          <div className="auth-footer">
            <p>Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 
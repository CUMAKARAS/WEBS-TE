import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './LoginPage.css';
import { login, checkApiStatus } from '../services/firebase';
import { TEST_MODE } from '../firebase';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isServerConnected, setIsServerConnected] = useState(TEST_MODE); // Test modunda true başla
  const navigate = useNavigate();
  const location = useLocation();

  // Kayıt başarılı mesajını kontrol et
  const registrationSuccess = location.state?.registrationSuccess;

  // Firebase bağlantısını kontrol et
  useEffect(() => {
    const checkServer = async () => {
      try {
        // Test modunda kontrol etme
        if (TEST_MODE) {
          console.log('TEST MODU: Firebase bağlantısı atlanıyor');
          setIsServerConnected(true);
          return;
        }
        
        setIsSubmitting(true);
        
        // Firebase durumunu kontrol et
        const statusData = await checkApiStatus();
        console.log('Firebase durumu:', statusData);
        
        setIsServerConnected(true);
        setServerError('');
      } catch (error) {
        console.error('Firebase bağlantı hatası:', error);
        if (!TEST_MODE) {
          setIsServerConnected(false);
          setServerError(error.message || 'Firebase bağlantısı kurulamıyor. Lütfen daha sonra tekrar deneyin.');
        }
      } finally {
        setIsSubmitting(false);
      }
    };
    
    checkServer();
  }, []);

  const validateForm = () => {
    let valid = true;
    
    if (!email) {
      setEmailError('E-posta gerekli');
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Geçerli bir e-posta adresi girin');
      valid = false;
    } else {
      setEmailError('');
    }
    
    if (!password) {
      setPasswordError('Şifre gerekli');
      valid = false;
    } else if (password.length < 6) {
      setPasswordError('Şifre en az 6 karakter olmalıdır');
      valid = false;
    } else {
      setPasswordError('');
    }
    
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setIsSubmitting(true);

    try {
      const userCredential = await login(email, password);
      const user = userCredential.user;
      
      // Kullanıcı bilgilerini localStorage'a kaydet
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        lastLogin: new Date().toISOString()
      };
      localStorage.setItem('userData', JSON.stringify(userData));
      
      navigate('/');
    } catch (error) {
      console.error('Giriş hatası:', error);
      setServerError('Giriş yapılırken bir hata oluştu. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError('');
    setServerError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
    setServerError('');
  };

  const retryConnection = async () => {
    setServerError('Firebase bağlantısı kontrol ediliyor...');
    try {
      setIsSubmitting(true);
      await checkApiStatus();
      setIsServerConnected(true);
      setServerError('');
    } catch (error) {
      setIsServerConnected(false);
      setServerError(error.message || 'Firebase bağlantısı hala kurulamıyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="app-branding">
          <Link to="/" className="logo-link">
            <h1 className="app-name">Morkan</h1>
          </Link>
        </div>
        
        <div className="auth-form-container">
          <h2>Giriş Yap</h2>
          
          {registrationSuccess && (
            <div className="success-message">
              <p>Kayıt işleminiz başarılı! Lütfen hesabınıza giriş yapın.</p>
            </div>
          )}
          
          {!isServerConnected && !isSubmitting && !TEST_MODE && (
            <div className="server-status-error">
              <p>Firebase bağlantısı kurulamadı!</p>
              <p>Lütfen internet bağlantınızı kontrol edin veya daha sonra tekrar deneyin.</p>
              <button 
                className="retry-button"
                onClick={retryConnection}
              >
                Bağlantıyı Yeniden Dene
              </button>
            </div>
          )}
          
          {serverError && (
            <div className="server-error">
              {serverError}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={handleEmailChange}
                className={emailError ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="E-posta adresiniz"
              />
              {emailError && <div className="error-message">{emailError}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={handlePasswordChange}
                className={passwordError ? 'error' : ''}
                disabled={isSubmitting}
                placeholder="Şifreniz"
              />
              {passwordError && <div className="error-message">{passwordError}</div>}
            </div>
            
            <div className="forgot-password">
              <Link to="/forgot-password">Şifremi Unuttum</Link>
            </div>
            
            <button 
              type="submit" 
              className="submit-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
          
          <div className="auth-footer">
            <p>Hesabınız yok mu? <Link to="/register">Kayıt Olun</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage; 
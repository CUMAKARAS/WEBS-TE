import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './RegisterPage.css';
import { registerUser, checkApiStatus } from '../services/firebase';
import { TEST_MODE } from '../firebase';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');
  const [isServerConnected, setIsServerConnected] = useState(TEST_MODE); // Test modunda true başla
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate();
  
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
        
        setIsLoading(true);
        
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
        setIsLoading(false);
      }
    };
    
    checkServer();
  }, []);
  
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
    
    // Sunucu hatası varsa temizle
    if (serverError) {
      setServerError('');
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Ad alanı boş bırakılamaz';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Soyad alanı boş bırakılamaz';
    }
    
    if (!formData.email) {
      newErrors.email = 'E-posta adresi boş bırakılamaz';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Lütfen geçerli bir e-posta adresi girin (örn: isim@example.com)';
    }
    
    if (!formData.password) {
      newErrors.password = 'Şifre alanı boş bırakılamaz';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Şifreniz en az 6 karakter uzunluğunda olmalıdır';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Girdiğiniz şifreler eşleşmiyor';
    }
    
    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Devam etmek için kullanım koşullarını kabul etmelisiniz';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    
    if (!isServerConnected && !TEST_MODE) {
      setServerError('Firebase bağlantısı kurulamadı. Lütfen daha sonra tekrar deneyin.');
      return;
    }
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        // Firebase'e kayıt isteği gönder
        const userData = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password
        };
        
        console.log('Kullanıcı kayıt isteği gönderiliyor:', userData);
        const response = await registerUser(userData);
        console.log('Kayıt başarılı:', response);
        
        // Başarılı kayıt durumunu ayarla
        setRegistrationSuccess(true);
        
        // Form verilerini temizle
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          agreeTerms: false
        });
        
        // 2 saniye sonra giriş sayfasına yönlendir
        setTimeout(() => {
          navigate('/login', { state: { registrationSuccess: true } });
        }, 2000);
        
      } catch (error) {
        console.error('Kayıt hatası:', error);
        
        // Özel hata mesajları
        if (error.message && error.message.includes('e-posta adresi zaten kullanılıyor')) {
          setServerError('Bu e-posta adresi ile daha önce kayıt yapılmış. Lütfen başka bir e-posta adresi deneyin veya giriş yapın.');
        } else {
          setServerError(error.message || 'Kayıt işlemi sırasında bir hata oluştu. Lütfen bilgilerinizi kontrol edip tekrar deneyin.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  const retryConnection = async () => {
    setServerError('Firebase bağlantısı kontrol ediliyor...');
    try {
      setIsLoading(true);
      await checkApiStatus();
      setIsServerConnected(true);
      setServerError('');
    } catch (error) {
      setIsServerConnected(false);
      setServerError(error.message || 'Firebase bağlantısı hala kurulamıyor. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setIsLoading(false);
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
          <h2>Morkan'a Üye Olun</h2>
          
          {!isServerConnected && !isLoading && !TEST_MODE && (
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
          
          {registrationSuccess && (
            <div className="success-message">
              <p>Tebrikler! Hesabınız başarıyla oluşturuldu.</p>
              <p>Giriş sayfasına yönlendiriliyorsunuz...</p>
            </div>
          )}
          
          {!registrationSuccess && (
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-info">
                <p>Morkan'a hoş geldiniz! Hesap oluşturmak için lütfen aşağıdaki bilgileri doldurun.</p>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">Adınız <span className="required">*</span></label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Adınız"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.firstName && <div className="error-message">{errors.firstName}</div>}
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">Soyadınız <span className="required">*</span></label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Soyadınız"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'error' : ''}
                    disabled={isLoading}
                  />
                  {errors.lastName && <div className="error-message">{errors.lastName}</div>}
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="email">E-posta Adresiniz <span className="required">*</span></label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="ornek@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.email && <div className="error-message">{errors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="password">Şifre <span className="required">*</span></label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="En az 6 karakter"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.password && <div className="error-message">{errors.password}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="confirmPassword">Şifre Tekrarı <span className="required">*</span></label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  placeholder="Şifrenizi tekrar girin"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={isLoading}
                />
                {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
              </div>
              
              <div className="form-group terms">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  name="agreeTerms"
                  checked={formData.agreeTerms}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <label htmlFor="agreeTerms">
                  <Link to="/terms" target="_blank" rel="noopener noreferrer">Kullanım koşullarını ve gizlilik politikasını</Link> okudum ve kabul ediyorum
                </label>
                {errors.agreeTerms && <div className="error-message">{errors.agreeTerms}</div>}
              </div>
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? 'Hesap Oluşturuluyor...' : 'Hesabımı Oluştur'}
              </button>
            </form>
          )}
          
          <div className="auth-footer">
            <p>Zaten bir hesabınız var mı? <Link to="/login">Giriş Yapın</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 
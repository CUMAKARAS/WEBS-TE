import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { getCurrentUser } from '../services/api';
import './LoginPage.css'; // Aynı stil dosyasını kullanıyoruz

const DashboardPage = ({ user: propUser, onLogout }) => {
  const [user, setUser] = useState(propUser || null);
  const [loading, setLoading] = useState(!propUser);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      if (propUser) {
        setUser(propUser);
        setLoading(false);
        return;
      }
      
      try {
        // URL'den userId parametresini al (Google OAuth callback için)
        const params = new URLSearchParams(location.search);
        const userId = params.get('userId');
        
        if (userId) {
          console.log('Google ile giriş yapıldı, userId:', userId);
        }
        
        // Kullanıcı bilgilerini getir
        const userData = await getCurrentUser();
        console.log('Kullanıcı verileri:', userData);
        
        if (userData) {
          setUser(userData);
        } else {
          // Oturum açılmamışsa login sayfasına yönlendir
          navigate('/login');
        }
      } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate, location, propUser]);

  const handleLogout = () => {
    // Çıkış fonksiyonunu çağır
    if (onLogout) {
      onLogout();
    }
    
    // Login sayfasına yönlendir
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Yükleniyor...</div>;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div className="container">
          <h1>Kripto Analiz Dashboard</h1>
          <div className="user-info">
            <span>Hoş geldiniz, {user?.firstName || user?.fullName || 'Kullanıcı'}</span>
            <button onClick={handleLogout} className="logout-btn">Çıkış Yap</button>
          </div>
        </div>
      </header>
      
      <main className="dashboard-content container">
        <div className="welcome-message">
          <h2>Hesabınıza başarıyla giriş yaptınız!</h2>
          <p>Bu sayfada hesap bilgilerinizi görüntüleyebilir ve yönetebilirsiniz.</p>
          <div className="dashboard-links">
            <Link to="/crypto-analysis" className="dashboard-link">
              Kripto Analiz Aracını Kullan
            </Link>
          </div>
        </div>
        
        <div className="user-profile">
          <h3>Hesap Bilgileriniz</h3>
          <div className="profile-info">
            <p><strong>Ad Soyad:</strong> {user?.firstName} {user?.lastName || user?.fullName}</p>
            <p><strong>E-posta:</strong> {user?.email}</p>
            <p><strong>Hesap ID:</strong> {user?.id}</p>
            <p><strong>Giriş Yöntemi:</strong> {user?.googleId ? 'Google ile Giriş' : 'E-posta/Şifre'}</p>
          </div>
        </div>
      </main>
      
      <style jsx>{`
        .dashboard-page {
          min-height: 100vh;
          background-color: #f8f9fa;
        }
        
        .dashboard-header {
          background-color: #1877f2;
          color: white;
          padding: 1rem 0;
        }
        
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        
        .dashboard-header .container {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .logout-btn {
          background-color: rgba(255,255,255,0.2);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .dashboard-content {
          padding: 2rem 1.5rem;
        }
        
        .welcome-message, .user-profile {
          background-color: white;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .profile-info {
          margin-top: 1rem;
        }
        
        .loading {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          font-size: 1.2rem;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage; 
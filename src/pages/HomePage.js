import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';
import CryptoNews from '../components/CryptoNews';

const HomePage = () => {
  const scrollToNews = () => {
    const newsSection = document.getElementById('crypto-news-section');
    if (newsSection) {
      newsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-container">
          <h1 className="app-name">SocialApp</h1>
          <div className="nav-links">
            <Link to="/login" className="login-link">Giriş Yap</Link>
            <Link to="/register" className="register-link">Kayıt Ol</Link>
          </div>
        </div>
      </header>
      
      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Sosyal ağımıza hoş geldiniz</h2>
            <p>Arkadaşlarınızla bağlantı kurun, fotoğraf paylaşın ve hayatınızdaki önemli anları paylaşın.</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-button register">Hemen Kaydol</Link>
              <Link to="/login" className="cta-button login">Giriş Yap</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="image-placeholder">
              <img src="/social-illustration.svg" alt="Sosyal Medya" />
            </div>
          </div>
        </div>
        
        <div className="features-section">
          <h3>Özellikler</h3>
          <div className="features-container">
            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h4>Sosyal Bağlantılar</h4>
              <p>Arkadaşlarınızla bağlantı kurun ve yeni insanlarla tanışın.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🖼️</div>
              <h4>Fotoğraf Paylaşımı</h4>
              <p>En güzel anlarınızı fotoğraflarla paylaşın.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h4>Anlık Mesajlaşma</h4>
              <p>Arkadaşlarınızla gerçek zamanlı sohbet edin.</p>
            </div>
            <div className="feature-card" onClick={scrollToNews} style={{ cursor: 'pointer' }}>
              <div className="feature-icon">📰</div>
              <h4>Kripto Haberleri</h4>
              <p>Güncel kripto para haberlerini takip edin.</p>
            </div>
          </div>
        </div>

        <div id="crypto-news-section" className="crypto-news-section">
          <h3>Güncel Kripto Haberleri</h3>
          <CryptoNews />
        </div>
      </main>
      
      <footer className="home-footer">
        <div className="footer-container">
          <p>&copy; 2025 SocialApp. Tüm hakları saklıdır.</p>
          <div className="footer-links">
            <a href="#">Hakkımızda</a>
            <a href="#">Gizlilik Politikası</a>
            <a href="#">Kullanım Koşulları</a>
            <a href="#">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 
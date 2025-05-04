import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './HomePage.css';

// CoinGecko API URL
const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3';

const HomePage = ({ user }) => {
  const navigate = useNavigate();
  const [marketData, setMarketData] = useState([]);
  const [loadingMarket, setLoadingMarket] = useState(true);
  const [marketError, setMarketError] = useState('');

  // Canlı piyasa verilerini CoinGecko API'den al
  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        setLoadingMarket(true);
        
        // CoinGecko API'den popüler kripto paraların verilerini al
        const response = await axios.get(`${COINGECKO_API_URL}/coins/markets`, {
          params: {
            vs_currency: 'usd',
            ids: 'bitcoin,ethereum,binancecoin,solana,dogecoin',
            order: 'market_cap_desc',
            per_page: 5,
            page: 1,
            sparkline: false,
            price_change_percentage: '24h'
          }
        });
        
        // API yanıtını işle
        const data = response.data.map(coin => ({
          id: coin.id,
          symbol: coin.symbol.toUpperCase(),
          current_price: coin.current_price,
          price_change_percentage: coin.price_change_percentage_24h,
          price_change_direction: coin.price_change_percentage_24h >= 0 ? 'up' : 'down'
        }));
        
        setMarketData(data);
        setMarketError('');
      } catch (error) {
        console.error('CoinGecko API hatası:', error);
        setMarketError('Piyasa verileri yüklenemedi');
      } finally {
        setLoadingMarket(false);
      }
    };
    
    fetchMarketData();
    
    // 2 dakikada bir piyasa verilerini güncelle
    const intervalId = setInterval(fetchMarketData, 120000);
    
    // Temizleme fonksiyonu
    return () => clearInterval(intervalId);
  }, []);

  const handleAnalysisClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/crypto-analysis');
    } else {
      alert('Bu özelliği kullanmak için giriş yapmalısınız!');
      navigate('/login');
    }
  };

  // Fiyat formatını düzenle
  const formatPrice = (price) => {
    if (price >= 1000) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
    } else if (price >= 1) {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
    } else {
      return `$${price.toLocaleString('en-US', { maximumFractionDigits: 6 })}`;
    }
  };

  // Yüzde değişim formatını düzenle
  const formatChange = (change) => {
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <div className="header-container">
          <h1 className="app-name">MORKAN</h1>
          <div className="nav-links">
            <Link to="/login" className="login-link">Giriş Yap</Link>
            <Link to="/register" className="register-link">Kayıt Ol</Link>
          </div>
        </div>
      </header>
      
      <main className="home-main">
        <div className="hero-section">
          <div className="hero-content">
            <h2>Kripto Dünyasına Hoş Geldiniz</h2>
            <p>En güncel kripto para analizleri, piyasa haberleri ve uzman tahminleri ile yatırımlarınızı güvenle yönetin.</p>
            <div className="cta-buttons">
              <Link to="/register" className="cta-button register">Hemen Kaydol</Link>
              <Link to="/login" className="cta-button login">Giriş Yap</Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="logo-showcase">
              <div className="center-logo">
                <div className="morkan-logo">
                  <div className="crypto-icon">M</div>
                </div>
              </div>
              <div className="crypto-icons">
                <div className="crypto-icon btc">
                  <span className="crypto-symbol">BTC</span>
                  <span className="crypto-name">Bitcoin</span>
                </div>
                <div className="crypto-icon eth">
                  <span className="crypto-symbol">ETH</span>
                  <span className="crypto-name">Ethereum</span>
                </div>
                <div className="crypto-icon bnb">
                  <span className="crypto-symbol">BNB</span>
                  <span className="crypto-name">Binance</span>
                </div>
                <div className="crypto-icon sol">
                  <span className="crypto-symbol">SOL</span>
                  <span className="crypto-name">Solana</span>
                </div>
                <div className="crypto-icon xrp">
                  <span className="crypto-symbol">XRP</span>
                  <span className="crypto-name">Ripple</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="news-ticker">
          <div className="ticker-header">CANLI PİYASA</div>
          
          {loadingMarket ? (
            <div className="ticker-loading">Veriler yükleniyor...</div>
          ) : marketError ? (
            <div className="ticker-error">{marketError}</div>
          ) : (
            <div className="ticker-items">
              {marketData.map(coin => (
                <div key={coin.id} className={`ticker-item ${coin.price_change_direction}`}>
                  <span className="coin">{coin.symbol}</span>
                  <span className="price">{formatPrice(coin.current_price)}</span>
                  <span className="change">{formatChange(coin.price_change_percentage)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="features-section">
          <h3>Özelliklerimiz</h3>
          <div className="features-container">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h4>Detaylı Analizler</h4>
              <p>Teknik ve temel analizlerle kripto para birimlerinin geleceğini tahmin edin.</p>
              <button onClick={handleAnalysisClick} className="feature-button">Analiz Aracını Kullan</button>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📰</div>
              <h4>Kripto Haberleri</h4>
              <p>Kripto dünyasındaki son gelişmeleri ve haberleri anında takip edin.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h4>Portföy Yönetimi</h4>
              <p>Yatırımlarınızı takip edin ve performans raporlarını görüntüleyin.</p>
            </div>
          </div>
        </div>
        
        <div className="news-section">
          <h3>Son Haberler</h3>
          <div className="news-container">
            <div className="news-card">
              <div className="news-image btc-news"></div>
              <div className="news-content">
                <h4>Bitcoin $63,000 Direncini Aşmaya Çalışıyor</h4>
                <p>Bitcoin, son 24 saatte %2.4 yükselişle kritik direnç seviyesini test ediyor.</p>
                <a href="#" className="read-more">Devamını Oku</a>
              </div>
            </div>
            <div className="news-card">
              <div className="news-image eth-news"></div>
              <div className="news-content">
                <h4>Ethereum 2.0 Güncellemesi Yaklaşıyor</h4>
                <p>Ethereum ağı, yakında gerçekleşecek büyük güncellemeye hazırlanıyor.</p>
                <a href="#" className="read-more">Devamını Oku</a>
              </div>
            </div>
            <div className="news-card">
              <div className="news-image market-news"></div>
              <div className="news-content">
                <h4>Kripto Piyasasında Bu Hafta Beklenenler</h4>
                <p>Uzmanların bu hafta kripto piyasasında beklediği önemli gelişmeler.</p>
                <a href="#" className="read-more">Devamını Oku</a>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="home-footer">
        <div className="footer-container">
          <p>&copy; 2025 MORKAN. Tüm hakları saklıdır.</p>
          <div className="footer-links">
            <a href="/about">Hakkımızda</a>
            <a href="/privacy">Gizlilik Politikası</a>
            <a href="/terms">Kullanım Koşulları</a>
            <a href="/contact">İletişim</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage; 
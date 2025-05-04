import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './CryptoNews.css';

const CryptoNews = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await axios.get('https://api.coingecko.com/api/v3/news', {
          params: {
            per_page: 10
          }
        });
        
        if (response.data && response.data.data) {
          setNews(response.data.data);
        } else {
          throw new Error('Haberler alınamadı');
        }
      } catch (error) {
        console.error('Haber yükleme hatası:', error);
        setError('Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const refreshNews = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get('https://api.coingecko.com/api/v3/news', {
        params: {
          per_page: 10
        }
      });
      
      if (response.data && response.data.data) {
        setNews(response.data.data);
      } else {
        throw new Error('Haberler alınamadı');
      }
    } catch (error) {
      console.error('Haber yükleme hatası:', error);
      setError('Haberler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="news-container">
        <div className="loading">Haberler yükleniyor...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-container">
        <div className="error">{error}</div>
        <button onClick={refreshNews} className="refresh-button">
          Yeniden Dene
        </button>
      </div>
    );
  }

  return (
    <div className="crypto-news-container">
      <div className="news-header">
        <h2>Güncel Kripto Haberleri</h2>
        <button onClick={refreshNews} className="refresh-button">
          Haberleri Yenile
        </button>
      </div>
      <div className="news-grid">
        {news.map((item) => (
          <div key={item.id} className="news-card">
            <div className="news-image">
              {item.thumb_2x && (
                <img src={item.thumb_2x} alt={item.title} />
              )}
            </div>
            <div className="news-content">
              <h3>{item.title}</h3>
              <p className="news-description">{item.description}</p>
              <div className="news-meta">
                <span className="news-source">{item.source}</span>
                <span className="news-date">
                  {new Date(item.published_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
              <a 
                href={item.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="read-more"
              >
                Haberi Oku
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CryptoNews; 
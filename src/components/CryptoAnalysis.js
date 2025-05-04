import React, { useState, useEffect } from 'react';
import { analyzeCrypto } from '../services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement,
  CandlestickController,
  CandlestickElement
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { tr } from 'date-fns/locale';
import './CryptoAnalysis.css';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  BarElement,
  CandlestickController,
  CandlestickElement
);

const CryptoAnalysis = () => {
  const [coins, setCoins] = useState([]);
  const [selectedCoin, setSelectedCoin] = useState('');
  const [selectedCoinName, setSelectedCoinName] = useState('');
  const [timeRange, setTimeRange] = useState('30');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCoins, setLoadingCoins] = useState(false);
  const [error, setError] = useState('');

  // Kripto para listesini yükle
  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoadingCoins(true);
        setError('');
        
        const response = await analyzeCrypto('bitcoin', '1', 'Bitcoin');
        if (response && response.coins) {
          setCoins(response.coins);
          if (response.coins.length > 0) {
            setSelectedCoin(response.coins[0].id);
            setSelectedCoinName(response.coins[0].name);
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoadingCoins(false);
      }
    };

    fetchCoins();
  }, []);

  // Analiz çalıştır
  const runAnalysis = async () => {
    if (!selectedCoin) {
      setError('Lütfen bir kripto para birimi seçin');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await analyzeCrypto(selectedCoin, timeRange, selectedCoinName);
      setAnalysis(response);
      
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Kripto para seçimini değiştir
  const handleCoinChange = (e) => {
    const coinId = e.target.value;
    setSelectedCoin(coinId);
    
    const selectedCoinData = coins.find(coin => coin.id === coinId);
    if (selectedCoinData) {
      setSelectedCoinName(selectedCoinData.name);
    }
  };

  // Grafik verilerini hazırla
  const getChartData = () => {
    if (!analysis || !analysis.prices || !analysis.volumes) return null;

    const dates = analysis.prices.map(p => new Date(p[0]));
    const prices = analysis.prices.map(p => p[1]);
    const volumes = analysis.volumes.map(v => v[1]);
    const ema20 = analysis.ema20 || [];
    const ema50 = analysis.ema50 || [];
    const upperBand = analysis.bollinger_bands?.upper || [];
    const middleBand = analysis.bollinger_bands?.middle || [];
    const lowerBand = analysis.bollinger_bands?.lower || [];

    // Günlük mum verilerini oluştur
    const dailyCandles = [];
    for (let i = 0; i < prices.length; i++) {
      const currentPrice = prices[i];
      const nextPrice = i < prices.length - 1 ? prices[i + 1] : currentPrice;
      
      dailyCandles.push({
        x: dates[i],
        o: currentPrice, // Açılış fiyatı
        h: Math.max(currentPrice, nextPrice), // En yüksek fiyat
        l: Math.min(currentPrice, nextPrice), // En düşük fiyat
        c: nextPrice // Kapanış fiyatı
      });
    }

    return {
      labels: dates,
      datasets: [
        {
          label: 'Günlük Mumlar',
          data: dailyCandles,
          type: 'candlestick',
          yAxisID: 'y',
          color: {
            up: 'rgba(75, 192, 192, 1)',
            down: 'rgba(255, 99, 132, 1)',
            unchanged: 'rgba(255, 159, 64, 1)',
          },
        },
        {
          label: 'EMA 20',
          data: ema20,
          borderColor: 'rgb(255, 99, 132)',
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'EMA 50',
          data: ema50,
          borderColor: 'rgb(54, 162, 235)',
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'Bollinger Üst',
          data: upperBand,
          borderColor: 'rgba(153, 102, 255, 0.5)',
          borderDash: [5, 5],
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'Bollinger Orta',
          data: middleBand,
          borderColor: 'rgba(153, 102, 255, 0.3)',
          borderDash: [5, 5],
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'Bollinger Alt',
          data: lowerBand,
          borderColor: 'rgba(153, 102, 255, 0.5)',
          borderDash: [5, 5],
          tension: 0.1,
          yAxisID: 'y',
        }
      ]
    };
  };

  // Grafik seçenekleri
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        type: 'time',
        time: {
          unit: 'day',
          displayFormats: {
            day: 'dd/MM'
          }
        },
        adapters: {
          date: {
            locale: tr
          }
        },
        title: {
          display: true,
          text: 'Tarih'
        }
      },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Fiyat (USD)'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            if (context.dataset.type === 'candlestick') {
              const data = context.raw;
              return [
                `Açılış: $${data.o.toFixed(2)}`,
                `En Yüksek: $${data.h.toFixed(2)}`,
                `En Düşük: $${data.l.toFixed(2)}`,
                `Kapanış: $${data.c.toFixed(2)}`
              ];
            }
            return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
          }
        }
      }
    }
  };

  return (
    <div className="crypto-analysis">
      <div className="controls">
        <select 
          value={selectedCoin} 
          onChange={handleCoinChange}
          disabled={loading || loadingCoins}
        >
          <option value="">Kripto Para Seçin</option>
          {coins.map(coin => (
            <option key={coin.id} value={coin.id}>
              {coin.name} ({coin.symbol})
            </option>
          ))}
        </select>

        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          disabled={loading || loadingCoins}
        >
          <option value="7">Son 7 Gün</option>
          <option value="30">Son 30 Gün</option>
          <option value="90">Son 90 Gün</option>
          <option value="180">Son 180 Gün</option>
        </select>

        <button 
          className="analyze-button" 
          onClick={runAnalysis}
          disabled={loading || !selectedCoin || loadingCoins}
        >
          {loading ? 'Analiz Yapılıyor...' : 'Analiz Yap'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {loading && <div className="loading">Veri analiz ediliyor, lütfen bekleyin...</div>}
      
      {analysis && !loading && (
        <div className="analysis-results">
          <h2>{selectedCoinName} Teknik Analiz</h2>
          
          <div className="chart-container">
            {getChartData() && <Chart type="candlestick" data={getChartData()} options={chartOptions} />}
          </div>
          
          <div className="analysis-details">
            <div className="price-info">
              <h3>Güncel Fiyat: ${analysis.current_price?.toFixed(2) || 'N/A'}</h3>
              <p className="last-updated">Son güncelleme: {analysis.last_updated || 'N/A'}</p>
            </div>
            
            <div className="indicators">
              <div className="indicator-card">
                <h4>RSI (14):</h4>
                <span className={`value ${analysis.rsi > 70 ? 'overbought' : analysis.rsi < 30 ? 'oversold' : ''}`}>
                  {analysis.rsi?.toFixed(2) || 'N/A'}
                </span>
              </div>
              
              <div className="indicator-card">
                <h4>MACD:</h4>
                <span className={`value ${analysis.macd > 0 ? 'bullish' : 'bearish'}`}>
                  {analysis.macd?.toFixed(2) || 'N/A'}
                </span>
              </div>
              
              <div className="indicator-card">
                <h4>Bollinger Bantları:</h4>
                <span className={`value ${analysis.bollinger_position}`}>
                  {analysis.bollinger_position || 'N/A'}
                </span>
              </div>
            </div>
            
            <div className="recommendation">
              <h4>Öneri:</h4>
              <p className={`value ${analysis.recommendation.toLowerCase()}`}>
                {analysis.recommendation}
              </p>
              <p className="prediction">{analysis.price_prediction}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoAnalysis; 
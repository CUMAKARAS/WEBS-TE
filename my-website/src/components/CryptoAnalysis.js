import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';
import { tr } from 'date-fns/locale';
import './CryptoAnalysis.css';

// Chart.js ayarları
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  TimeScale
);

const API_URL = 'http://localhost:3001/api';

const CryptoAnalysis = () => {
  const [selectedCoin, setSelectedCoin] = useState('bitcoin');
  const [timeRange, setTimeRange] = useState('30');
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const coins = [
    { id: 'bitcoin', name: 'Bitcoin (BTC)' },
    { id: 'ethereum', name: 'Ethereum (ETH)' },
    { id: 'binancecoin', name: 'BNB (BNB)' },
    { id: 'solana', name: 'Solana (SOL)' },
    { id: 'cardano', name: 'Cardano (ADA)' },
    { id: 'ripple', name: 'XRP (XRP)' },
    { id: 'dogecoin', name: 'Dogecoin (DOGE)' },
    { id: 'polkadot', name: 'Polkadot (DOT)' },
    { id: 'avalanche', name: 'Avalanche (AVAX)' }
  ];

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(`${API_URL}/analyze`, {
        params: {
          coin_id: selectedCoin,
          days: timeRange
        }
      });

      setAnalysis(response.data);
    } catch (error) {
      console.error('Analiz hatası:', error);
      setError(error.response?.data?.error || 'Analiz yapılırken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [selectedCoin, timeRange]);

  const getChartData = () => {
    if (!analysis?.prices) return null;

    return {
      labels: analysis.prices.map(p => new Date(p[0])),
      datasets: [
        {
          label: 'Fiyat (USD)',
          data: analysis.prices.map(p => p[1]),
          borderColor: 'rgb(75, 192, 192)',
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'EMA 20',
          data: analysis.ema20,
          borderColor: 'rgb(255, 99, 132)',
          borderDash: [5, 5],
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'EMA 50',
          data: analysis.ema50,
          borderColor: 'rgb(54, 162, 235)',
          borderDash: [5, 5],
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'Bollinger Üst',
          data: analysis.bollinger_bands?.upper,
          borderColor: 'rgb(255, 159, 64)',
          borderDash: [2, 2],
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'Bollinger Alt',
          data: analysis.bollinger_bands?.lower,
          borderColor: 'rgb(255, 159, 64)',
          borderDash: [2, 2],
          tension: 0.1,
          yAxisID: 'y',
        },
        {
          label: 'RSI',
          data: analysis.rsi_series,
          borderColor: 'purple',
          borderDash: [1, 1],
          tension: 0.1,
          yAxisID: 'y1',
          spanGaps: true
        },
        {
          label: 'MACD',
          data: analysis.macd_series,
          borderColor: 'orange',
          borderDash: [3, 3],
          tension: 0.1,
          yAxisID: 'y2',
          spanGaps: true
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
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
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'RSI'
        },
        grid: {
          drawOnChartArea: false
        },
        min: 0,
        max: 100
      },
      y2: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'MACD'
        },
        grid: {
          drawOnChartArea: false
        },
        offset: true
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Fiyat Grafiği ve Teknik Göstergeler'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += context.parsed.y.toFixed(2);
            }
            return label;
          }
        }
      }
    }
  };

  return (
    <div className="crypto-analysis">
      <h1>Kripto Para Teknik Analiz</h1>

      <div className="controls">
        <select 
          value={selectedCoin} 
          onChange={(e) => setSelectedCoin(e.target.value)}
          disabled={loading}
        >
          {coins.map(coin => (
            <option key={coin.id} value={coin.id}>
              {coin.name}
            </option>
          ))}
        </select>

        <select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          disabled={loading}
        >
          <option value="7">Son 7 Gün</option>
          <option value="30">Son 30 Gün</option>
          <option value="90">Son 90 Gün</option>
          <option value="180">Son 180 Gün</option>
        </select>

        <button 
          onClick={fetchAnalysis}
          disabled={loading}
        >
          {loading ? 'Yükleniyor...' : 'Yenile'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading">
          Veriler yükleniyor...
        </div>
      )}

      {analysis && !loading && (
        <div className="analysis-results">
          <div className="price-info">
            <h2>
              Güncel Fiyat: ${analysis.current_price?.toFixed(2)}
              <span className={`price-change ${analysis.price_change_24h >= 0 ? 'positive' : 'negative'}`}>
                ({analysis.price_change_24h?.toFixed(2)}%)
              </span>
            </h2>
            <p>24s Hacim: ${analysis.volume_24h?.toLocaleString()}</p>
          </div>

          <div className="ai-prediction" style={{marginBottom: '20px', fontWeight: 'bold', fontSize: '18px'}}>
            Tavsiye: {analysis.ai_prediction?.trend} <span style={{color: '#888', fontSize: '14px'}}>({analysis.ai_prediction?.reliability}% güven)</span>
          </div>

          <div className="technical-indicators">
            <div className="indicator">
              <h3>RSI (14)</h3>
              <p className={analysis.rsi > 70 ? 'overbought' : analysis.rsi < 30 ? 'oversold' : 'neutral'}>
                {analysis.rsi?.toFixed(2)}
              </p>
            </div>
            <div className="indicator">
              <h3>MACD</h3>
              <p className={analysis.macd > 0 ? 'positive' : 'negative'}>
                {analysis.macd?.toFixed(2)}
              </p>
            </div>
            <div className="indicator">
              <h3>Bollinger Pozisyonu</h3>
              <p className={analysis.bollinger_position === 'Üst Bant' ? 'overbought' : 
                           analysis.bollinger_position === 'Alt Bant' ? 'oversold' : 'neutral'}>
                {analysis.bollinger_position}
              </p>
            </div>
          </div>

          <div className="chart-container">
            {getChartData() && (
              <Line data={getChartData()} options={chartOptions} />
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoAnalysis; 
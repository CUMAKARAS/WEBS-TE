const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/auth');

dotenv.config();

// Global hata yakalayıcı
const errorHandler = (err, req, res, next) => {
  console.error('Hata:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Sunucu hatası',
      code: err.code || 'INTERNAL_ERROR'
    }
  });
};

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting ayarları
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Çok fazla istek gönderildi, lütfen daha sonra tekrar deneyin.',
  standardHeaders: true,
  legacyHeaders: false
});

// CORS ayarları
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(limiter);

// Routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Backend sunucusu çalışıyor!' });
});

// Status endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'API çalışıyor',
    timestamp: new Date().toISOString(),
    cors: corsOptions
  });
});

// Binance API konfigürasyonu
const BINANCE_CONFIG = {
  baseURL: 'https://api.binance.com/api/v3',
  timeout: 10000,
  rateLimit: {
    windowMs: 60000, // 1 dakika
    max: 1200 // maksimum istek sayısı
  }
};

// CoinGecko id -> Binance sembolü eşleme tablosu
const binanceSymbolMap = {
  bitcoin: 'BTCUSDT',
  ethereum: 'ETHUSDT',
  binancecoin: 'BNBUSDT',
  solana: 'SOLUSDT',
  cardano: 'ADAUSDT',
  ripple: 'XRPUSDT',
  dogecoin: 'DOGEUSDT',
  polkadot: 'DOTUSDT',
  avalanche: 'AVAXUSDT',
  tether: 'BUSDUSDT' // Tether için BUSD/USDT paritesini kullanıyoruz
};

// Binance API için yardımcı fonksiyonlar
const getBinanceSymbol = (coinId) => {
  const normalizedCoinId = coinId.toLowerCase();
  
  // Özel durumlar
  if (normalizedCoinId === 'tether' || normalizedCoinId === 'usdt') {
    return 'BUSDUSDT';
  }
  
  return binanceSymbolMap[normalizedCoinId] || `${coinId.toUpperCase()}USDT`;
};

const fetchBinanceData = async (symbol, interval, limit) => {
  try {
    console.log('Binance API isteği:', symbol, interval, limit);
    const response = await axios.get(`${BINANCE_CONFIG.baseURL}/klines`, {
      params: {
        symbol,
        interval,
        limit: parseInt(limit)
      },
      timeout: BINANCE_CONFIG.timeout
    });

    console.log('Binance API yanıtı:', response.data);

    if (!Array.isArray(response.data) || response.data.length === 0) {
      console.log('Binance API boş veri döndü!');
      throw new Error(`Geçersiz veri: ${symbol}`);
    }

    return response.data.map(candle => ({
      timestamp: Number(candle[0]),
      open: Number(candle[1]),
      high: Number(candle[2]),
      low: Number(candle[3]),
      close: Number(candle[4]),
      volume: Number(candle[5])
    }));
  } catch (error) {
    console.error('Binance API Hatası:', error.message);
    if (error.response?.status === 400) {
      throw new Error(`Geçersiz sembol: ${symbol}`);
    }
    throw error;
  }
};

// Teknik analiz fonksiyonları
const calculateRSI = (prices) => {
  if (prices.length < 14) return 50;
  
  const changes = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i][1] - prices[i-1][1]);
  }
  
  let gains = 0;
  let losses = 0;
  
  for (let i = 0; i < 14; i++) {
    if (changes[i] > 0) gains += changes[i];
    else losses -= changes[i];
  }
  
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
};

const calculateEMA = (prices, period) => {
  const ema = [];
  const multiplier = 2 / (period + 1);
  
  let sum = 0;
  for (let i = 0; i < period; i++) {
    sum += prices[i][1];
  }
  ema.push(sum / period);
  
  for (let i = period; i < prices.length; i++) {
    ema.push((prices[i][1] - ema[ema.length - 1]) * multiplier + ema[ema.length - 1]);
  }
  
  return ema;
};

const calculateMACD = (prices) => {
  if (prices.length < 26) return 0;
  
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  
  return ema12[ema12.length - 1] - ema26[ema26.length - 1];
};

const calculateBollingerBands = (prices) => {
  const period = 20;
  const stdDev = 2;
  
  if (prices.length < period) return { upper: [], middle: [], lower: [] };
  
  const bands = {
    upper: [],
    middle: [],
    lower: []
  };
  
  for (let i = period - 1; i < prices.length; i++) {
    const slice = prices.slice(i - period + 1, i + 1).map(p => p[1]);
    const mean = slice.reduce((a, b) => a + b) / period;
    const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    
    bands.middle.push(mean);
    bands.upper.push(mean + (standardDeviation * stdDev));
    bands.lower.push(mean - (standardDeviation * stdDev));
  }
  
  return bands;
};

// RSI dizi hesaplama
const calculateRSISeries = (prices, period = 14) => {
  const rsiSeries = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period) {
      rsiSeries.push(null);
      continue;
    }
    const slice = prices.slice(i - period, i + 1).map(p => p[1]);
    rsiSeries.push(calculateRSI(slice));
  }
  return rsiSeries;
};

// MACD dizi hesaplama
const calculateMACDSeries = (prices) => {
  const macdSeries = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < 26) {
      macdSeries.push(null);
      continue;
    }
    const slice = prices.slice(i - 26, i + 1);
    macdSeries.push(calculateMACD(slice));
  }
  return macdSeries;
};

// Basit yapay zeka öneri fonksiyonu
function getAIPrediction({ rsi, macd, priceChange }) {
  if (rsi > 70 && macd < 0) return { trend: 'SAT', reliability: 80 };
  if (rsi < 30 && macd > 0) return { trend: 'AL', reliability: 80 };
  if (priceChange > 5) return { trend: 'AL', reliability: 60 };
  if (priceChange < -5) return { trend: 'SAT', reliability: 60 };
  return { trend: 'BEKLE', reliability: 50 };
}

// Analiz endpoint'i
app.get('/api/analyze', async (req, res) => {
  try {
    const { coin_id, days = 30 } = req.query;
    if (!coin_id) {
      return res.status(400).json({ error: 'coin_id parametresi gerekli' });
    }

    const symbol = getBinanceSymbol(coin_id);
    console.log(`Analiz başlıyor: ${coin_id} -> ${symbol}`);

    const data = await fetchBinanceData(symbol, '1d', days);

    if (!Array.isArray(data) || data.length === 0) {
      return res.status(500).json({ error: 'Veri alınamadı veya sembol hatalı.' });
    }
    if (!data[0].timestamp || !data[0].close) {
      return res.status(500).json({ error: 'Veri formatı hatalı.', details: data });
    }

    const prices = data.map(candle => [candle.timestamp, candle.close]);
    const volumes = data.map(candle => [candle.timestamp, candle.volume]);

    // Teknik analiz sonuçları
    const rsiSeries = calculateRSISeries(prices);
    const macdSeries = calculateMACDSeries(prices);
    const analysis = {
      symbol,
      current_price: prices[prices.length - 1][1],
      price_change_24h: calculatePriceChange(prices),
      volume_24h: volumes[volumes.length - 1][1],
      prices,
      volumes,
      rsi: rsiSeries[rsiSeries.length - 1],
      macd: macdSeries[macdSeries.length - 1],
      rsi_series: rsiSeries,
      macd_series: macdSeries
    };

    // AI önerisi
    analysis.ai_prediction = getAIPrediction({
      rsi: analysis.rsi,
      macd: analysis.macd,
      priceChange: analysis.price_change_24h
    });

    res.json(analysis);
  } catch (error) {
    console.error('Analiz hatası:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Fiyat değişimi hesaplama
const calculatePriceChange = (prices) => {
  if (prices.length < 2) return 0;
  const lastPrice = prices[prices.length - 1][1];
  const prevPrice = prices[prices.length - 2][1];
  return ((lastPrice - prevPrice) / prevPrice) * 100;
};

// Binance API error handling
const handleBinanceError = (error) => {
  if (error.response?.status === 400) {
    throw new Error(`Geçersiz sembol veya parametre: ${error.response.data.msg}`);
  } else if (error.response?.status === 429) {
    throw new Error('Rate limit aşıldı. Lütfen daha sonra tekrar deneyin.');
  } else if (error.code === 'ECONNABORTED') {
    throw new Error('Bağlantı zaman aşımına uğradı.');
  }
  throw error;
};

// Global error handler
app.use(errorHandler);

// Sunucu başlatma
const startServer = (port) => {
  return app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${port} kullanımda. Alternatif port deneniyor...`);
      startServer(port + 1);
    } else {
      console.error('Sunucu başlatma hatası:', err);
      process.exit(1);
    }
  });
};

startServer(PORT); 
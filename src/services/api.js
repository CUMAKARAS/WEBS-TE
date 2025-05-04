import axios from 'axios';

// API konfigürasyonu
const API_CONFIG = {
  baseURL: 'http://localhost:3001/api',
  timeout: 30000,
  retryCount: 3,
  retryDelay: 1000
};

// Hata mesajları
const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Sunucuya bağlanılamıyor. Lütfen internet bağlantınızı kontrol edin.',
  TIMEOUT_ERROR: 'İstek zaman aşımına uğradı. Lütfen tekrar deneyin.',
  RATE_LIMIT: 'API sınırlamasına ulaşıldı. Lütfen birkaç dakika bekleyin.',
  SERVER_ERROR: 'Sunucu hatası oluştu. Lütfen daha sonra tekrar deneyin.',
  UNKNOWN_ERROR: 'Bilinmeyen bir hata oluştu.'
};

// Axios instance oluştur
const api = axios.create({
  baseURL: API_CONFIG.baseURL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false,
  timeout: API_CONFIG.timeout
});

// Retry interceptor
api.interceptors.response.use(null, async (error) => {
  const { config, response } = error;
  
  if (!config || !config.retryCount) {
    return Promise.reject(error);
  }

  config.retryCount -= 1;
  
  if (config.retryCount > 0) {
    await new Promise(resolve => setTimeout(resolve, API_CONFIG.retryDelay));
    return api(config);
  }
  
  return Promise.reject(error);
});

// Hata yönetimi
const handleError = (error) => {
  if (error.response) {
    switch (error.response.status) {
      case 429:
        throw new Error(ERROR_MESSAGES.RATE_LIMIT);
      case 500:
        throw new Error(ERROR_MESSAGES.SERVER_ERROR);
      default:
        throw new Error(error.response.data?.error || ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  } else if (error.request) {
    throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
  } else {
    throw new Error(error.message || ERROR_MESSAGES.UNKNOWN_ERROR);
  }
};

// API fonksiyonları
export const analyzeCrypto = async (coinId, days, coinName) => {
  try {
    const response = await api.get('/analyze', {
      params: { coin_id: coinId, days, coin_name: coinName },
      retryCount: API_CONFIG.retryCount
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getMarketData = async () => {
  try {
    const response = await api.get('/market-data', {
      retryCount: API_CONFIG.retryCount
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const getNews = async () => {
  try {
    const response = await api.get('/news', {
      retryCount: API_CONFIG.retryCount
    });
    return response.data;
  } catch (error) {
    handleError(error);
  }
};

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_CONFIG.baseURL}/auth/login`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
};

export const register = async (email, password) => {
  try {
    const response = await axios.post(`${API_CONFIG.baseURL}/auth/register`, {
      email,
      password
    });
    return response.data;
  } catch (error) {
    console.error('Kayıt hatası:', error);
    throw error;
  }
}; 
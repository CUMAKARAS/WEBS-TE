from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
import numpy as np
from sklearn.linear_model import LinearRegression
import pandas as pd
import ta

app = Flask(__name__)
CORS(app)

# CoinGecko API URL'leri
COINGECKO_API_URL = 'https://api.coingecko.com/api/v3'

def calculate_technical_indicators(df):
    # EMA hesaplamaları
    df['ema20'] = ta.trend.ema_indicator(df['close'], window=20)
    df['ema50'] = ta.trend.ema_indicator(df['close'], window=50)
    
    # Bollinger Bantları
    df['bb_upper'] = ta.volatility.bollinger_hband(df['close'])
    df['bb_middle'] = ta.volatility.bollinger_mavg(df['close'])
    df['bb_lower'] = ta.volatility.bollinger_lband(df['close'])
    
    # RSI
    df['rsi'] = ta.momentum.rsi(df['close'])
    
    # MACD
    macd = ta.trend.MACD(df['close'])
    df['macd'] = macd.macd()
    
    return df

# Kripto para listesini getiren API
@app.route('/api/coins', methods=['GET'])
def get_coins():
    try:
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        response = requests.get('https://api.coingecko.com/api/v3/coins/markets', {
            'vs_currency': 'usd',
            'order': 'market_cap_desc',
            'per_page': 50,
            'page': 1,
            'sparkline': False
        }, headers=headers, timeout=10)
        
        if response.status_code == 429:
            return jsonify({'error': 'CoinGecko API rate limit aşıldı. Lütfen birkaç dakika bekleyin.'}), 429
        
        coins = response.json()
        return jsonify(coins)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Analiz API - Yapay zeka destekli versiyon
@app.route('/api/analyze', methods=['GET'])
def analyze():
    try:
        coin_id = request.args.get('coin_id', 'bitcoin')
        days = int(request.args.get('days', 30))
        coin_name = request.args.get('coin_name', coin_id.capitalize())
        
        print(f"Analiz isteği alındı: {coin_id}, {days} gün, {coin_name}")
        
        # CoinGecko'dan fiyat verilerini al
        end_date = datetime.now()
        start_date = end_date - timedelta(days=days)
        
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
        
        response = requests.get(
            f'https://api.coingecko.com/api/v3/coins/{coin_id}/market_chart',
            params={
                'vs_currency': 'usd',
                'days': days,
                'interval': 'daily'
            },
            headers=headers,
            timeout=30
        )
        
        print(f"CoinGecko API yanıtı: {response.status_code}")
        
        if response.status_code == 429:
            return jsonify({"error": "CoinGecko API rate limit aşıldı. Lütfen birkaç dakika bekleyin."}), 429
        
        if response.status_code != 200:
            print(f"CoinGecko API hatası: {response.text}")
            return jsonify({"error": f"CoinGecko API hatası: {response.status_code}"}), 500
        
        data = response.json()
        
        if 'prices' not in data or 'total_volumes' not in data:
            print("Eksik veri: prices veya total_volumes")
            return jsonify({"error": "CoinGecko'dan eksik veri"}), 500
        
        print(f"Alınan veri noktaları: {len(data['prices'])} fiyat, {len(data['total_volumes'])} hacim")
        
        # Veriyi DataFrame'e dönüştür
        df = pd.DataFrame(data['prices'], columns=['timestamp', 'close'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        
        # Hacim verilerini ekle
        volumes_df = pd.DataFrame(data['total_volumes'], columns=['timestamp', 'volume'])
        volumes_df['timestamp'] = pd.to_datetime(volumes_df['timestamp'], unit='ms')
        df = df.merge(volumes_df, on='timestamp')
        
        print(f"DataFrame boyutu: {df.shape}")
        
        # Teknik indikatörleri hesapla
        df = calculate_technical_indicators(df)
        
        print("Teknik indikatörler hesaplandı")
        
        # Yapay zeka tahmini
        X = np.array(range(len(df))).reshape(-1, 1)
        y = df['close'].values
        
        model = LinearRegression()
        model.fit(X, y)
        
        # Gelecek 7 günlük tahmin
        future_days = 7
        future_X = np.array(range(len(df), len(df) + future_days)).reshape(-1, 1)
        future_prices = model.predict(future_X)
        
        # Trend yönü ve güvenilirlik hesaplama
        last_price = df['close'].iloc[-1]
        predicted_price = future_prices[-1]
        price_change = ((predicted_price - last_price) / last_price) * 100
        
        # Güvenilirlik hesaplama (basit bir yaklaşım)
        reliability = min(100, max(0, 50 + (price_change * 2)))
        
        # Bollinger Bantları pozisyonu
        last_close = df['close'].iloc[-1]
        last_upper = df['bb_upper'].iloc[-1]
        last_lower = df['bb_lower'].iloc[-1]
        
        if last_close > last_upper:
            bb_position = "Üst Bant Üzerinde"
        elif last_close < last_lower:
            bb_position = "Alt Bant Altında"
        else:
            bb_position = "Bantlar İçinde"
        
        # Şu anki tarih ve saat
        current_datetime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        # Analiz sonuçlarını oluştur
        analysis = {
            "current_price": last_price,
            "bb_analysis": bb_position,
            "macd_analysis": "MACD analizi geçici olarak devre dışı",
            "rsi_analysis": "RSI analizi geçici olarak devre dışı",
            "volatility": "Volatilite analizi geçici olarak devre dışı",
            "recommendation": "ALIŞ" if price_change < -5 else "SATIŞ" if price_change > 5 else "BEKLEMEDE KAL",
            "price_prediction": f"Son {days} günde fiyat değişimi: %{price_change:.2f}",
            "last_updated": current_datetime
        }
        
        return jsonify({
            "coin_id": coin_id,
            "coin_name": coin_name,
            "chart": "",  # Grafik geçici olarak devre dışı
            "analysis": analysis,
            "prices": df[['timestamp', 'close']].values.tolist(),
            "volumes": df[['timestamp', 'volume']].values.tolist(),
            "ema20": df['ema20'].values.tolist(),
            "ema50": df['ema50'].values.tolist(),
            "bollinger_bands": {
                "upper": df['bb_upper'].values.tolist(),
                "middle": df['bb_middle'].values.tolist(),
                "lower": df['bb_lower'].values.tolist()
            },
            "rsi": df['rsi'].iloc[-1],
            "macd": df['macd'].iloc[-1],
            "bollinger_position": bb_position,
            "ai_prediction": {
                "trend": "YUKARI" if price_change > 0 else "AŞAĞI",
                "reliability": round(reliability, 2),
                "predicted_price": round(predicted_price, 2),
                "price_change": round(price_change, 2)
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True) 
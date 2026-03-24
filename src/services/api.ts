import axios from 'axios';

const COINGECKO_API = 'https://api.coingecko.com/api/v3';
const ALTERNATIVE_ME_API = 'https://api.alternative.me';
// Using BGeometrics or similar public endpoints for on-chain
const BGEOMETRICS_API = 'https://api.bgeometrics.com/v1'; 

export const fetchFearGreed = async () => {
  const response = await axios.get(`${ALTERNATIVE_ME_API}/fng/`);
  return parseInt(response.data.data[0].value);
};

export const fetchMarketData = async () => {
  // BTC Price and 24h Volume
  const btcResponse = await axios.get(`${COINGECKO_API}/simple/price`, {
    params: {
      ids: 'bitcoin',
      vs_currencies: 'usd',
      include_24hr_vol: 'true',
      include_24hr_change: 'true',
      include_last_updated_at: 'true'
    }
  });

  // Historical data for RSI and Volume Avg
  const historyResponse = await axios.get(`${COINGECKO_API}/coins/bitcoin/market_chart`, {
    params: {
      vs_currency: 'usd',
      days: '14',
      interval: 'daily'
    }
  });

  const prices = historyResponse.data.prices.map((p: any) => p[1]);
  const volumes = historyResponse.data.total_volumes.map((v: any) => v[1]);
  
  // Simple RSI Calculation (14 days)
  const rsi = calculateRSI(prices);
  
  // Volume 7d Average
  const vol7d = volumes.slice(-7).reduce((a: number, b: number) => a + b, 0) / 7;

  // Price Consolidation (last 7 days volatility < 2%)
  const last7DaysPrices = prices.slice(-7);
  const maxPrice = Math.max(...last7DaysPrices);
  const minPrice = Math.min(...last7DaysPrices);
  const volatility = (maxPrice - minPrice) / minPrice;
  const isConsolidating = volatility < 0.05; // 5% range for consolidation

  // Mocking on-chain for demo if BGeometrics fails or is restricted
  // In a real app, these would be real API calls
  const sopr = 0.98 + Math.random() * 0.05; // Mock SOPR around 1
  const mvrvZ = -0.2 + Math.random() * 0.5; // Mock MVRV Z-Score
  const hashRibbon = Math.random() > 0.8 ? 'buy' : 'neutral';

  return {
    price: btcResponse.data.bitcoin.usd,
    change24h: btcResponse.data.bitcoin.usd_24h_change,
    volume24h: btcResponse.data.bitcoin.usd_24h_vol,
    volume7dAvg: vol7d,
    rsi,
    isConsolidating,
    sopr,
    mvrvZScore: mvrvZ,
    hashRibbon,
    lastUpdated: btcResponse.data.bitcoin.last_updated_at * 1000
  };
};

function calculateRSI(prices: number[]) {
  if (prices.length < 14) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 1; i < 14; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  const avgGain = gains / 14;
  const avgLoss = losses / 14;
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

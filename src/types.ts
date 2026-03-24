export interface MarketData {
  price: number;
  change24h: number;
  volume24h: number;
  volume7dAvg: number;
  rsi: number;
  isConsolidating: boolean;
  fearGreed: number;
  sopr: number;
  mvrvZScore: number;
  hashRibbon: 'buy' | 'neutral';
  lastUpdated: number;
}

export interface SignalStatus {
  id: string;
  name: string;
  description: string;
  burmeseExplanation: string;
  isActive: boolean;
  value: string | number;
  threshold: string | number;
}

export interface HistoricalData {
  date: string;
  price: number;
  signals: number;
}

# BTC Bottom Signals

A modern, real-time Bitcoin market bottom detector built with React 18, Vite, TypeScript, and Tailwind CSS.

## Features

- **Real-time Dashboard**: Monitors 8 key market bottom signals.
- **8 Market Signals**:
  1. Extreme Fear & Greed Index (≤ 10)
  2. RSI Oversold (≤ 30)
  3. Short-Term Holder Capitulation (SOPR < 1)
  4. Miner Capitulation (Hash Ribbon buy signal)
  5. Volume Spike (> 1.5x 7-day average)
  6. MVRV Z-Score ≤ 0
  7. Price Consolidation (low volatility)
  8. Macro Positive Shift
- **Live Alerts**: Browser notifications and in-app logs when signals trigger.
- **Analysis**: Historical charts and daily summaries.
- **Dark Mode**: Sleek crypto-style interface.

## Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui, motion/react
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query), Axios
- **Charts**: Recharts
- **Notifications**: React Hot Toast, Browser Notification API

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Build for production:
   ```bash
   npm run build
   ```

## API Credits

- Price & Volume: [CoinGecko API](https://www.coingecko.com/en/api)
- Fear & Greed: [Alternative.me API](https://alternative.me/crypto/fear-and-greed-index/)
- On-chain Metrics: Mocked/Simulated for demo (can be extended with Glassnode or BGeometrics)

## License

Apache-2.0

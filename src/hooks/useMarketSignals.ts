import { useQuery } from '@tanstack/react-query';
import { fetchMarketData, fetchFearGreed } from '@/services/api';
import { MarketData, SignalStatus } from '@/types';
import { useAppStore } from '@/store/useAppStore';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export const useMarketSignals = () => {
  const { addAlert, notificationsEnabled, soundEnabled } = useAppStore();
  const prevSignalsRef = useRef<Record<string, boolean>>({});

  const { data: fearGreed, isLoading: isLoadingFG } = useQuery({
    queryKey: ['fearGreed'],
    queryFn: fetchFearGreed,
    refetchInterval: 60000,
  });

  const { data: market, isLoading: isLoadingMarket } = useQuery({
    queryKey: ['marketData'],
    queryFn: fetchMarketData,
    refetchInterval: 60000,
  });

  const signals: SignalStatus[] = [
    {
      id: 'fng',
      name: 'Extreme Fear',
      description: 'Fear & Greed Index ≤ 10 indicates extreme market fear.',
      burmeseExplanation: 'ဈေးကွက်အတွင်း အလွန်အမင်း ကြောက်ရွံ့မှုရှိနေခြင်း (အညွှန်းကိန်း ၁၀ အောက်)။ ဒါဟာ များသောအားဖြင့် ဝယ်ယူရန် အခွင့်အလမ်းကောင်းတစ်ခု ဖြစ်တတ်ပါတယ်။',
      isActive: (fearGreed || 50) <= 10,
      value: fearGreed || 'N/A',
      threshold: '≤ 10'
    },
    {
      id: 'rsi',
      name: 'RSI Oversold',
      description: 'Relative Strength Index ≤ 30 suggests oversold conditions.',
      burmeseExplanation: 'RSI ၃၀ အောက်ရောက်ခြင်းဟာ ရောင်းအားလွန်ကဲနေပြီး ဈေးနှုန်းပြန်တက်လာနိုင်ခြေ ရှိပါတယ်။',
      isActive: (market?.rsi || 50) <= 30,
      value: market?.rsi?.toFixed(2) || 'N/A',
      threshold: '≤ 30'
    },
    {
      id: 'sopr',
      name: 'STH Capitulation',
      description: 'SOPR < 1 means short-term holders are selling at a loss.',
      burmeseExplanation: 'ရေတိုရင်းနှီးမြှုပ်နှံသူများ အရှုံးဖြင့် ထွက်ခွာနေကြခြင်း။ ဒါဟာ ဈေးကွက်အောက်ခြေရောက်ခါနီး လက္ခဏာတစ်ခုပါ။',
      isActive: (market?.sopr || 1.1) < 1,
      value: market?.sopr?.toFixed(3) || 'N/A',
      threshold: '< 1.0'
    },
    {
      id: 'hash',
      name: 'Miner Capitulation',
      description: 'Hash Ribbon "Buy" signal indicates miners have finished capitulating.',
      burmeseExplanation: 'မိုင်းတူးသူများ အရှုံးပေါ်၍ ရပ်နားရာမှ ပြန်လည်စတင်ခြင်း (Hash Ribbon Buy Signal)။',
      isActive: market?.hashRibbon === 'buy',
      value: market?.hashRibbon === 'buy' ? 'BUY' : 'Neutral',
      threshold: 'BUY'
    },
    {
      id: 'vol',
      name: 'Volume Spike',
      description: '24h volume > 1.5x the 7-day average volume.',
      burmeseExplanation: 'အရောင်းအဝယ်ပမာဏ ရုတ်တရက် မြင့်တက်လာခြင်းဟာ ဈေးကွက်အပြောင်းအလဲကြီးကြီးမားမား ဖြစ်တော့မည့် လက္ခဏာပါ။',
      isActive: (market?.volume24h || 0) > (market?.volume7dAvg || 0) * 1.5,
      value: market ? `${(market.volume24h / market.volume7dAvg).toFixed(2)}x` : 'N/A',
      threshold: '> 1.5x'
    },
    {
      id: 'mvrv',
      name: 'MVRV Z-Score',
      description: 'MVRV Z-Score ≤ 0 indicates Bitcoin is significantly undervalued.',
      burmeseExplanation: 'Bitcoin ၏ တန်ဖိုးသည် အမှန်တကယ်ရှိသင့်သည်ထက် များစွာလျော့နည်းနေခြင်း (Undervalued)။',
      isActive: (market?.mvrvZScore || 1) <= 0,
      value: market?.mvrvZScore?.toFixed(2) || 'N/A',
      threshold: '≤ 0'
    },
    {
      id: 'consolidation',
      name: 'Price Consolidation',
      description: 'Low volatility and flat price for 7+ days (range < 5%).',
      burmeseExplanation: 'ဈေးနှုန်း အတက်အကျနည်းပါးပြီး တည်ငြိမ်နေခြင်း။ ဒါဟာ နောက်ထပ် အပြောင်းအလဲတစ်ခုအတွက် ပြင်ဆင်နေခြင်း ဖြစ်ပါတယ်။',
      isActive: market?.isConsolidating || false,
      value: market?.isConsolidating ? 'Active' : 'Volatile',
      threshold: '< 5% range'
    },
    {
      id: 'macro',
      name: 'Macro Shift',
      description: 'Positive macro shift (e.g. DXY downtrend or Fed rate cut).',
      burmeseExplanation: 'ကမ္ဘာ့စီးပွားရေး အခြေအနေ ကောင်းမွန်လာခြင်း (ဥပမာ - အတိုးနှုန်းလျှော့ချခြင်း)။',
      isActive: false, // Manual/Mock for now as requested
      value: 'Neutral',
      threshold: 'Positive'
    }
  ];

  useEffect(() => {
    signals.forEach(signal => {
      if (signal.isActive && !prevSignalsRef.current[signal.id]) {
        // Signal just turned GREEN
        addAlert({
          signalId: signal.id,
          signalName: signal.name,
          value: signal.value,
          timestamp: Date.now()
        });

        if (notificationsEnabled) {
          toast.success(`Signal Active: ${signal.name}`, {
            duration: 5000,
            icon: '🚀'
          });
          
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("BTC Bottom Signal", {
              body: `${signal.name} is now active!`,
              icon: "/favicon.ico"
            });
          }
        }
      }
      prevSignalsRef.current[signal.id] = signal.isActive;
    });
  }, [signals, addAlert, notificationsEnabled]);

  const activeCount = signals.filter(s => s.isActive).length;
  const bottomProbability = (activeCount / signals.length) * 100;

  return {
    signals,
    market,
    isLoading: isLoadingFG || isLoadingMarket,
    bottomProbability,
    activeCount
  };
};

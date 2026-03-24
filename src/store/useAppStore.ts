import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SignalAlert {
  id: string;
  signalId: string;
  signalName: string;
  value: string | number;
  timestamp: number;
}

interface AppState {
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  telegramConfig: {
    botToken: string;
    chatId: string;
    dailyReportEnabled: boolean;
  };
  thresholds: {
    fearGreed: number;
    rsi: number;
    volumeMultiplier: number;
  };
  alerts: SignalAlert[];
  setNotificationsEnabled: (enabled: boolean) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setTelegramConfig: (config: Partial<AppState['telegramConfig']>) => void;
  addAlert: (alert: Omit<SignalAlert, 'id'>) => void;
  clearAlerts: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      notificationsEnabled: true,
      soundEnabled: true,
      telegramConfig: {
        botToken: '',
        chatId: '',
        dailyReportEnabled: false,
      },
      thresholds: {
        fearGreed: 10,
        rsi: 30,
        volumeMultiplier: 1.5,
      },
      alerts: [],
      setNotificationsEnabled: (enabled) => set({ notificationsEnabled: enabled }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setTelegramConfig: (config) => set((state) => ({
        telegramConfig: { ...state.telegramConfig, ...config }
      })),
      addAlert: (alert) => set((state) => ({
        alerts: [{ ...alert, id: Math.random().toString(36).substr(2, 9) }, ...state.alerts].slice(0, 50)
      })),
      clearAlerts: () => set({ alerts: [] }),
    }),
    {
      name: 'btc-bottom-signals-storage',
    }
  )
);

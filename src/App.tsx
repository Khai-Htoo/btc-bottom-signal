import React, { useState, useEffect } from 'react';
import { useMarketSignals } from '@/hooks/useMarketSignals';
import { SignalCard } from '@/components/SignalCard';
import { useAppStore } from '@/store/useAppStore';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Bell, 
  Settings as SettingsIcon,
  LayoutDashboard,
  History,
  Info,
  CheckCircle2,
  Send,
  MessageSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { signals, market, isLoading, bottomProbability, activeCount } = useMarketSignals();
  const { alerts, notificationsEnabled, setNotificationsEnabled, clearAlerts, telegramConfig, setTelegramConfig } = useAppStore();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isSending, setIsSending] = useState(false);
  
  // Local state for Telegram inputs
  const [localBotToken, setLocalBotToken] = useState(telegramConfig.botToken);
  const [localChatId, setLocalChatId] = useState(telegramConfig.chatId);

  // Sync local state when store rehydrates or changes
  useEffect(() => {
    setLocalBotToken(telegramConfig.botToken);
    setLocalChatId(telegramConfig.chatId);
  }, [telegramConfig.botToken, telegramConfig.chatId]);

  const handleSaveTelegramConfig = () => {
    setTelegramConfig({
      botToken: localBotToken,
      chatId: localChatId
    });
    toast.success("Telegram configuration saved!");
  };

  const sendTelegramReport = async () => {
    if (!telegramConfig.botToken || !telegramConfig.chatId) {
      toast.error("Please configure Telegram Bot Token and Chat ID in Settings first.");
      return;
    }

    setIsSending(true);
    const activeSignals = signals.filter(s => s.isActive).map(s => `• ${s.name}`).join('\n');
    
    // Burmese Report Template
    const message = `
🇲🇲 *BTC အောက်ခြေအချက်ပြ အစီရင်ခံစာ*
📅 နေ့စွဲ: ${format(new Date(), 'MMMM dd, yyyy')}
⏰ အချိန်: ${format(new Date(), 'HH:mm:ss')}
💰 BTC ဈေးနှုန်း: $${market?.price?.toLocaleString() || '---'}
📊 Bottom Score: ${bottomProbability.toFixed(0)}%
✅ အလုပ်လုပ်နေသော အချက်ပြများ (${activeCount}/8):
${activeSignals || 'မရှိသေးပါ'}

*သုံးသပ်ချက်:*
"${bottomProbability > 50 ? 'ဈေးကွက်အောက်ခြေရောက်ရန် အလားအလာရှိနေပါသည်။ စုဆောင်းရန် အချိန်ကောင်းဖြစ်နိုင်ပါသည်။' : 'ဈေးကွက်က ဈေးနှုန်းအသစ်ကို ရှာဖွေနေဆဲဖြစ်ပါသည်။ သတိထားရန် လိုအပ်ပါသည်။'}"
    `.trim();

    try {
      await axios.post('/api/telegram/send', {
        botToken: telegramConfig.botToken,
        chatId: telegramConfig.chatId,
        message
      });
      toast.success("Report sent to Telegram!");
    } catch (error) {
      toast.error("Failed to send report to Telegram.");
    } finally {
      setIsSending(false);
    }
  };

  // Hourly Auto-Report Logic
  useEffect(() => {
    if (!telegramConfig.dailyReportEnabled) return;

    // Send immediately on enable if it's the first time
    const lastSent = localStorage.getItem('last_telegram_report_time');
    const now = Date.now();
    const oneHour = 60 * 60 * 1000;

    if (!lastSent || now - parseInt(lastSent) >= oneHour) {
      sendTelegramReport();
      localStorage.setItem('last_telegram_report_time', now.toString());
    }

    const interval = setInterval(() => {
      sendTelegramReport();
      localStorage.setItem('last_telegram_report_time', Date.now().toString());
    }, oneHour);

    return () => clearInterval(interval);
  }, [telegramConfig.dailyReportEnabled, telegramConfig.botToken, telegramConfig.chatId]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  // Mock historical data for the chart
  const historicalData = Array.from({ length: 30 }).map((_, i) => ({
    date: format(new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000), 'MMM dd'),
    price: 40000 + Math.random() * 20000,
    signals: Math.floor(Math.random() * 5)
  }));

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-green-500/30">
      <Toaster position="top-right" toastOptions={{
        style: { background: '#18181b', color: '#f4f4f5', border: '1px solid #27272a' }
      }} />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.4)]">
              <TrendingUp className="text-zinc-950" size={20} />
            </div>
            <h1 className="font-bold text-xl tracking-tight hidden sm:block">BTC Bottom Signals</h1>
          </div>

          <div className="flex items-center gap-4 sm:gap-8">
            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">BTC Price</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-lg">
                  ${market?.price?.toLocaleString() || '---'}
                </span>
                {market && (
                  <Badge variant={market.change24h >= 0 ? "default" : "destructive"} className={market.change24h >= 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : ""}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                  </Badge>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Bottom Score</span>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "font-mono font-bold text-lg",
                  bottomProbability > 50 ? "text-green-400" : "text-zinc-300"
                )}>
                  {bottomProbability.toFixed(0)}%
                </span>
                <div className="w-16 h-2 bg-zinc-800 rounded-full overflow-hidden hidden xs:block">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${bottomProbability}%` }}
                    className="h-full bg-green-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <TabsList className="bg-zinc-900 border border-zinc-800 p-1">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-zinc-800">
                <LayoutDashboard size={16} className="mr-2" /> Dashboard
              </TabsTrigger>
              <TabsTrigger value="analysis" className="data-[state=active]:bg-zinc-800">
                <History size={16} className="mr-2" /> Analysis
              </TabsTrigger>
              <TabsTrigger value="settings" className="data-[state=active]:bg-zinc-800">
                <SettingsIcon size={16} className="mr-2" /> Settings
              </TabsTrigger>
            </TabsList>

            <div className="flex items-center gap-2 text-zinc-500 text-sm font-mono">
              <Clock size={14} />
              Last updated: {market ? format(market.lastUpdated, 'HH:mm:ss') : '---'}
            </div>
          </div>

          <TabsContent value="dashboard" className="space-y-8">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Active Signals</p>
                  <p className="text-3xl font-bold">{activeCount} / 8</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <TrendingUp size={24} />
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">Fear & Greed</p>
                  <p className="text-3xl font-bold">{signals[0].value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <Info size={24} />
                </div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">RSI (14d)</p>
                  <p className="text-3xl font-bold">{signals[1].value}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-400">
                  <TrendingDown size={24} />
                </div>
              </div>
            </div>

            {/* Signals Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Market Bottom Signals
                    <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-500 uppercase">Live</Badge>
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {signals.map((signal) => (
                    <SignalCard 
                      key={signal.id} 
                      name={signal.name}
                      description={signal.description}
                      burmeseExplanation={signal.burmeseExplanation}
                      isActive={signal.isActive}
                      value={signal.value}
                      threshold={signal.threshold}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  Recent Alerts
                  <button onClick={clearAlerts} className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase underline ml-auto">Clear</button>
                </h2>
                <ScrollArea className="h-[500px] rounded-2xl border border-zinc-800 bg-zinc-900/30 p-4">
                  <div className="space-y-4">
                    <AnimatePresence initial={false}>
                      {alerts.length === 0 ? (
                        <div className="h-[400px] flex flex-col items-center justify-center text-zinc-600 space-y-2">
                          <Bell size={48} strokeWidth={1} />
                          <p>No recent signal alerts</p>
                        </div>
                      ) : (
                        alerts.map((alert) => (
                          <motion.div
                            key={alert.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900 border border-zinc-800"
                          >
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500 shrink-0">
                              <CheckCircle2 size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start">
                                <h4 className="font-bold text-zinc-100 truncate">{alert.signalName}</h4>
                                <span className="text-[10px] text-zinc-500 font-mono whitespace-nowrap">
                                  {format(alert.timestamp, 'HH:mm:ss')}
                                </span>
                              </div>
                              <p className="text-sm text-zinc-400 mt-1">
                                Signal triggered with value <span className="text-green-400 font-mono">{alert.value}</span>
                              </p>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </AnimatePresence>
                  </div>
                </ScrollArea>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-6">Price vs Bottom Signals (30d)</h3>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={historicalData}>
                        <defs>
                          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                        <XAxis 
                          dataKey="date" 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                        />
                        <YAxis 
                          stroke="#71717a" 
                          fontSize={12} 
                          tickLine={false} 
                          axisLine={false}
                          tickFormatter={(value) => `$${value/1000}k`}
                        />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a', borderRadius: '12px' }}
                          itemStyle={{ color: '#f4f4f5' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="price" 
                          stroke="#22c55e" 
                          fillOpacity={1} 
                          fill="url(#colorPrice)" 
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
                  <h3 className="text-lg font-bold mb-4">Daily Report Summary</h3>
                  <div className="prose prose-invert prose-sm max-w-none">
                    <p className="text-zinc-400">
                      **Date:** {format(new Date(), 'MMMM dd, yyyy')}
                    </p>
                    <p className="text-zinc-400">
                      The market is currently showing **{activeCount} active bottom signals**. 
                      Overall bottom probability is **{bottomProbability.toFixed(0)}%**.
                    </p>
                    <ul className="text-zinc-400 space-y-2">
                      {signals.filter(s => s.isActive).map(s => (
                        <li key={s.id} className="flex items-center gap-2">
                          <CheckCircle2 size={14} className="text-green-500" /> {s.name}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 p-4 bg-zinc-800/50 rounded-xl border border-zinc-700">
                      <p className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Analyst View</p>
                      <p className="text-zinc-300 italic">
                        "Current metrics suggest {bottomProbability > 50 ? 'a potential local bottom is forming. Accumulation phase may be starting.' : 'the market is still in a discovery phase. Caution is advised.'}"
                      </p>
                    </div>

                    <button 
                      onClick={sendTelegramReport}
                      disabled={isSending}
                      className="w-full mt-6 py-3 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                    >
                      {isSending ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <Send size={18} />
                      )}
                      Send Report to Telegram
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-8">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                <h3 className="text-lg font-bold">App Settings</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-bold">Browser Notifications</label>
                    <p className="text-xs text-zinc-500">Get alerted when a new signal turns green</p>
                  </div>
                  <Switch 
                    checked={notificationsEnabled} 
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <label className="text-sm font-bold">Sound Effects</label>
                    <p className="text-xs text-zinc-500">Play a sound when a signal is triggered</p>
                  </div>
                  <Switch checked={true} />
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-400" /> Telegram Integration
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest">Bot Token</label>
                      <input 
                        type="password" 
                        value={localBotToken}
                        onChange={(e) => setLocalBotToken(e.target.value)}
                        placeholder="Enter Telegram Bot Token" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest">Chat ID</label>
                      <input 
                        type="text" 
                        value={localChatId}
                        onChange={(e) => setLocalChatId(e.target.value)}
                        placeholder="Enter Chat ID" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                    <button 
                      onClick={handleSaveTelegramConfig}
                      className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-xs font-bold transition-colors border border-zinc-700"
                    >
                      Save Telegram Settings
                    </button>
                    <div className="flex items-center justify-between pt-2">
                      <div className="space-y-0.5">
                        <label className="text-xs font-bold">Hourly Auto-Report</label>
                        <p className="text-[10px] text-zinc-500">Automatically send report every 1 hour (Burmese)</p>
                      </div>
                      <Switch 
                        checked={telegramConfig.dailyReportEnabled}
                        onCheckedChange={(checked) => setTelegramConfig({ dailyReportEnabled: checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <LayoutDashboard size={16} className="text-purple-400" /> Progressive Web App (PWA)
                  </h4>
                  <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2">
                    <p className="text-xs text-zinc-300">
                      You can install this app on your home screen for a native-like experience.
                    </p>
                    <p className="text-[10px] text-zinc-500 italic">
                      * Look for the "Install" icon in your browser's address bar or "Add to Home Screen" in your mobile browser menu.
                    </p>
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-800">
                  <h4 className="text-sm font-bold mb-4">API Configuration</h4>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-widest">CoinGecko API Key (Optional)</label>
                      <input 
                        type="password" 
                        placeholder="Enter API Key" 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-green-500/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-zinc-800 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-zinc-600 text-xs">
          <p>© 2026 BTC Bottom Signals. Data provided by CoinGecko and Alternative.me.</p>
          <p className="mt-2">Not financial advice. Trade at your own risk.</p>
        </div>
      </footer>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}

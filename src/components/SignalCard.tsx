import { motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface SignalCardProps {
  key?: string;
  id?: string;
  name: string;
  description: string;
  burmeseExplanation: string;
  isActive: boolean;
  value: string | number;
  threshold: string | number;
}

export const SignalCard = ({ name, description, burmeseExplanation, isActive, value, threshold }: SignalCardProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={false}
          animate={{
            backgroundColor: isActive ? 'rgba(34, 197, 94, 0.1)' : 'rgba(24, 24, 27, 1)',
            borderColor: isActive ? 'rgba(34, 197, 94, 0.5)' : 'rgba(39, 39, 42, 1)',
          }}
          className={cn(
            "border rounded-xl p-5 transition-all duration-500 cursor-pointer group",
            isActive ? "shadow-[0_0_15px_rgba(34,197,94,0.2)]" : ""
          )}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-zinc-100 group-hover:text-green-400 transition-colors">{name}</h3>
              <p className="text-sm text-zinc-400 leading-tight">{description}</p>
            </div>
            <div className={cn(
              "p-2 rounded-full",
              isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
            )}>
              {isActive ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Current Value</span>
              <div className={cn(
                "text-2xl font-mono font-bold",
                isActive ? "text-green-400" : "text-zinc-200"
              )}>
                {value}
              </div>
            </div>
            <div className="text-right space-y-1">
              <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold">Threshold</span>
              <div className="text-sm font-mono text-zinc-400">
                {threshold}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-bold uppercase tracking-widest">
              <Info size={12} /> Click for details
            </div>
            {isActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-2 h-2 rounded-full bg-green-500 animate-pulse"
              />
            )}
          </div>
        </motion.div>
      </DialogTrigger>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className={cn(
              "p-1.5 rounded-lg",
              isActive ? "bg-green-500/20 text-green-500" : "bg-red-500/20 text-red-500"
            )}>
              {isActive ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            </div>
            {name}
          </DialogTitle>
          <DialogDescription className="text-zinc-400 mt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800">
            <h4 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2">Burmese Explanation (မြန်မာဘာသာဖြင့် ရှင်းလင်းချက်)</h4>
            <p className="text-zinc-200 leading-relaxed font-medium">
              {burmeseExplanation}
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Current</p>
              <p className={cn("text-lg font-mono font-bold", isActive ? "text-green-400" : "text-zinc-200")}>{value}</p>
            </div>
            <div className="p-3 rounded-lg bg-zinc-800/50 border border-zinc-700">
              <p className="text-[10px] uppercase font-bold text-zinc-500">Target</p>
              <p className="text-lg font-mono font-bold text-zinc-400">{threshold}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

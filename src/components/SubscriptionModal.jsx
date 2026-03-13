import React from 'react';
import { X, Check, Zap, Sparkles, Music, Star, Database } from 'lucide-react';

export function SubscriptionModal({ isOpen, onClose, onUpgrade, isDarkMode = true }) {
  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-6 isolation">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      <div className={`relative w-full max-w-sm rounded-[30px] border shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 ${isDarkMode ? 'bg-slate-900 border-indigo-500/30 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8)]' : 'bg-white border-indigo-200 shadow-[0_30px_60px_-15px_rgba(99,102,241,0.2)]'}`}>
        
        {/* Glowing Gradient Bar */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-sky-400 via-indigo-500 to-purple-500" />
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/30 blur-[50px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-500/30 blur-[50px] rounded-full pointer-events-none" />
        
        <button 
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md z-10 transition-colors ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'}`}
        >
          <X size={16} />
        </button>

        <div className="p-8 relative z-10">
          <div className="flex flex-col items-center text-center space-y-4 mb-8">
            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/40 ring-4 ring-indigo-500/20 transform -rotate-6">
              <Zap size={32} className="fill-white/80" />
            </div>
            <div>
              <h2 className={`text-2xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Upgrade to Pro</h2>
              <p className={`text-sm mt-1.5 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Unlock the full power of Finder</p>
            </div>
          </div>

          <div className="space-y-4 mb-8">
            {[
              { icon: <Music size={16} className="text-purple-500" />, text: "Real-time Music Identification" },
              { icon: <Star size={16} className="text-amber-500" />, text: "Full Movie Cast & Deep Info" },
              { icon: <Database size={16} className="text-emerald-500" />, text: "AI-powered Scene Inference" },
              { icon: <Sparkles size={16} className="text-indigo-500" />, text: "Unlimited GPT-4 Chat Assistant" },
              { icon: <Check size={16} className="text-sky-500" />, text: "Zero tracking, Zero ads" }
            ].map((feature, i) => (
              <div key={i} className={`flex items-center gap-3.5 p-3 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50 border border-slate-100'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isDarkMode ? 'bg-slate-800 ring-1 ring-white/10' : 'bg-white ring-1 ring-slate-200'}`}>
                  {feature.icon}
                </div>
                <span className={`text-[13px] font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{feature.text}</span>
              </div>
            ))}
          </div>

          <button 
            onClick={() => {
              onUpgrade();
              onClose();
            }}
            className="w-full py-4 rounded-[20px] bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-bold text-[15px] tracking-wide transition-all shadow-xl shadow-indigo-500/30 hover:shadow-indigo-500/50 active:scale-[0.98]"
          >
            Upgrade Now - $3.99/mo
          </button>
          
          <p className={`text-[11px] text-center font-medium mt-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            Secure checkout via Stripe. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}

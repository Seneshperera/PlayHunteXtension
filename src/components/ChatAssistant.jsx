import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, AlertCircle, X } from 'lucide-react';
import { AISceneService } from '../services/api';

export function ChatAssistant({ isPro, queryCount, setQueryCount, onUpgrade, onClose, isDarkMode = true }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hi! I can answer any questions about this video clip. What would you like to know?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const maxFreeQueries = 10;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    if (!isPro && queryCount >= maxFreeQueries) {
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    if (!isPro) {
      setQueryCount(prev => prev + 1);
    }

    try {
      const response = await AISceneService.chat(userMessage, "local_user_1", isPro);
      setMessages(prev => [...prev, { role: 'assistant', text: response.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', text: `Error: ${err.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const limitReached = !isPro && queryCount >= maxFreeQueries;

  return (
    <div className={`flex flex-col h-full rounded-l-[30px] shadow-glass ${isDarkMode ? 'bg-slate-900/90' : 'bg-slate-50/90'} backdrop-blur-2xl ring-1 ${isDarkMode ? 'ring-white/10' : 'ring-indigo-500/10'}`}>
      
      {/* 2026 Sleek Header */}
      <div className={`p-5 flex items-center justify-between border-b ${isDarkMode ? 'border-white/5' : 'border-slate-200'} shrink-0`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
             <Bot size={20} className="text-white drop-shadow-sm" />
          </div>
          <div>
            <span className={`block text-sm font-bold tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>AI Assistant</span>
            {!isPro && (
              <span className={`block text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                {maxFreeQueries - queryCount} queries left
              </span>
            )}
          </div>
        </div>
        <button onClick={onClose} className={`p-2 rounded-xl transition-colors ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-200 hover:bg-slate-300 text-slate-500'}`}>
           <X size={16} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 [&::-webkit-scrollbar]:hidden flex flex-col justify-end">
        <div className="flex flex-col gap-5 mt-auto">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 max-w-[90%] ${m.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-indigo-500 text-white' : isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500 shadow-md ring-1 ring-indigo-500/10'}`}>
                {m.role === 'user' ? <User size={14} /> : <Bot size={14} />}
              </div>
              <div className={`px-4 py-3 rounded-[20px] text-[13px] leading-relaxed shadow-sm backdrop-blur-md ${
                m.role === 'user' 
                  ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-tr-sm ring-1 ring-indigo-400/30' 
                  : isDarkMode ? 'bg-slate-800/80 text-slate-200 rounded-tl-sm ring-1 ring-white/10' : 'bg-white text-slate-700 rounded-tl-sm ring-1 ring-slate-200 shadow-md'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex gap-3 self-start max-w-[90%]">
               <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isDarkMode ? 'bg-slate-800 text-indigo-400' : 'bg-white text-indigo-500 ring-1 ring-indigo-500/10'}`}>
                 <Bot size={14} />
               </div>
               <div className={`px-4 py-4 rounded-[20px] shadow-sm backdrop-blur-md flex items-center gap-1.5 ${isDarkMode ? 'bg-slate-800/80 rounded-tl-sm ring-1 ring-white/10' : 'bg-white rounded-tl-sm ring-1 ring-slate-200 shadow-md'}`}>
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-300 animate-bounce delay-300" />
               </div>
             </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className={`p-4 ${isDarkMode ? 'bg-slate-900/80' : 'bg-slate-50/80'} backdrop-blur-xl border-t ${isDarkMode ? 'border-white/5' : 'border-slate-200'}`}>
        {limitReached ? (
          <div className="flex flex-col items-center justify-center p-3 text-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center">
               <AlertCircle size={20} />
            </div>
            <p className={`text-[12px] font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Daily limit reached for Free plan</p>
            <button 
              onClick={onUpgrade}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-[13px] font-bold tracking-wide transition-all shadow-lg active:scale-95"
            >
              Upgrade to Pro for Unlimited Chat
            </button>
          </div>
        ) : (
          <form onSubmit={handleSend} className="relative flex items-center shadow-lg">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about the cast, trivia..."
              className={`w-full rounded-[20px] pl-4 pr-12 py-3.5 text-[13px] focus:outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-white/10 text-white placeholder:text-slate-500 focus:ring-2 focus:ring-indigo-500/50' : 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/40 shadow-sm'}`}
              disabled={isLoading}
            />
            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-2 p-2 rounded-xl bg-indigo-500 text-white hover:bg-indigo-400 disabled:opacity-50 disabled:hover:bg-indigo-500 transition-colors shadow-sm"
            >
              <Send size={16} className="-ml-0.5" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

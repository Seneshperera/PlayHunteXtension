import React, { useState, useEffect } from 'react';
import { Search, Film, Info, Play, Sparkles, Youtube, Tv, Bot, ArrowLeft, Star, Users, Music, Moon, Sun, ChevronRight, PlayCircle, Plus } from 'lucide-react';
import { ChatAssistant } from './components/ChatAssistant';
import { SubscriptionModal } from './components/SubscriptionModal';
import { TMDBService, AudioRecognitionService } from './services/api';

function App() {
  const [status, setStatus] = useState('scanning'); // scanning, found
  const [isPro, setIsPro] = useState(false);
  const [showSubscription, setShowSubscription] = useState(false);
  const [queryCount, setQueryCount] = useState(0);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Extracted Data Simulation
  const [movieData, setMovieData] = useState(null);

  useEffect(() => {
    async function loadData() {
      let queryTitle = "";

      try {
        // Run only in extension context to get true active tab title
        if (typeof chrome !== 'undefined' && chrome.tabs) {
          const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
          if (tab && tab.title) {
            queryTitle = tab.title;
          }
        }
      } catch (e) {
        console.log("Not running in Chrome Extension context");
      }

      if (!queryTitle || queryTitle.trim() === "") {
        setStatus('error');
        return;
      }

      try {
        const data = await TMDBService.getMovieInfo(queryTitle);
        setMovieData(data);
        setStatus('found');
      } catch (error) {
        console.log("API did not find a movie match. Displaying 'Not Found' UI state.");
        setStatus('error');
      }
    }

    const timer = setTimeout(() => {
      loadData();
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Load persisted state from storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['isPro', 'queryCount'], (result) => {
        if (result.isPro !== undefined) setIsPro(result.isPro);
        if (result.queryCount !== undefined) setQueryCount(result.queryCount);
      });
    }
  }, []);

  useEffect(() => {
    // Persist state to storage when it changes
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ isPro, queryCount });
    }
  }, [isPro, queryCount]);

  const handleProCheck = (action) => {
    if (!isPro) {
      setShowSubscription(true);
    } else {
      action();
    }
  };

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Define dynamic class strings to keep JSX clean
  const containerClass = `w-full h-full flex flex-col font-sans overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-50' : 'bg-slate-50 text-slate-900'}`;
  const glassHeaderClass = `px-5 py-4 flex items-center justify-between shrink-0 z-10 transition-colors duration-300 ${isDarkMode ? 'glass-dark' : 'glass-light'}`;
  const glassCardClass = `rounded-2xl p-4 transition-all duration-300 relative overflow-hidden ${isDarkMode ? 'glass-card-dark' : 'glass-card-light'}`;

  return (
    <div className={containerClass}>
      {/* Immersive Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[120%] h-[70%] bg-gradient-to-br from-indigo-500/20 via-purple-500/10 to-transparent blur-3xl rounded-full pointer-events-none transition-opacity duration-[2s]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[60%] bg-gradient-to-tl from-sky-500/10 to-transparent blur-3xl rounded-full pointer-events-none transition-opacity duration-[2s]" />
      
      {/* Header */}
      <header className={glassHeaderClass}>
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl overflow-hidden shadow-lg shadow-indigo-500/30 ring-1 ring-white/20">
            <img src="/logo.png" alt="Playhunt Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-semibold tracking-tight text-[15px] drop-shadow-sm">Playhunt</span>
        </div>
        <div className="flex items-center gap-1.5 bg-slate-200/50 dark:bg-slate-800/50 backdrop-blur-md p-1 rounded-xl">
          <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition-colors ${!isDarkMode ? 'bg-white shadow-sm text-indigo-500' : 'text-slate-400 hover:text-slate-200'}`}>
            <Sun size={14} />
          </button>
          <button onClick={toggleTheme} className={`p-1.5 rounded-lg transition-colors ${isDarkMode ? 'bg-slate-700 shadow-sm text-indigo-400' : 'text-slate-500 hover:text-slate-700'}`}>
            <Moon size={14} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden relative pt-2 pb-[100px]">
        {status === 'scanning' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-8 animate-in fade-in duration-1000">
            <div className="relative px-8">
              <div className="absolute inset-0 bg-indigo-500/30 blur-[40px] animate-pulse rounded-full" />
              <div className="relative h-28 w-28 rounded-full border border-indigo-500/30 flex items-center justify-center bg-white/10 dark:bg-slate-800/50 shadow-[0_0_40px_rgba(99,102,241,0.2)] backdrop-blur-xl overflow-hidden">
                <img src="/logo.png" alt="Hunting..." className="w-16 h-16 object-contain animate-pulse" />
                <div className="absolute inset-0 rounded-full border-t-[3px] border-indigo-500 animate-[spin_2s_linear_infinite]" />
                <div className="absolute inset-0 rounded-full border-r-[3px] border-purple-400 animate-[spin_3s_linear_infinite]" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className={`text-xl font-medium tracking-tight animate-pulse ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Hunting for media...</h2>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cross-referencing global video hashes</p>
            </div>
          </div>
        )}
        
        {status === 'error' && (
          <div className="h-full flex flex-col items-center justify-center p-6 text-center space-y-4 animate-in fade-in duration-500">
             <Info size={48} className="text-slate-400 mb-2" />
             <h2 className={`text-xl font-medium tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>No Video Recognized</h2>
             <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Playhunt: Hunt Media Anywhere. Please make sure you are on a webpage that contains a video name, or try using the Purple Bubble to scan a frame from the video screen.</p>
          </div>
        )}

        {status === 'found' && movieData && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 h-full flex flex-col gap-4 px-4">
              <>
                {/* 2026 Sleek Hero Card */}
                <div className="group relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-slate-800 border border-white/10 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] isolation">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent z-10" />
                  <img 
                    src={movieData.poster} 
                    alt="Movie scene" 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute bottom-4 left-5 right-5 z-20 space-y-2">
                     <div className="flex gap-2">
                       <span className="px-2.5 py-1 rounded-lg bg-indigo-500/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-white border border-indigo-400/50 shadow-[0_0_15px_rgba(99,102,241,0.4)]">
                          98% Match
                       </span>
                     </div>
                     <div>
                       <h1 className="text-3xl font-bold tracking-tight text-white mb-0.5 drop-shadow-md">{movieData.title}</h1>
                       <p className="text-xs font-medium text-slate-300 drop-shadow flex items-center gap-1.5">
                         <span>{movieData.year}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-400" />
                         <span className="text-indigo-300">{movieData.genres.join(", ")}</span>
                       </p>
                     </div>
                  </div>
                </div>

                {/* Primary Action Button */}
                <button onClick={() => window.open(`https://www.google.com/search?q=${encodeURIComponent(movieData.title)}+streaming`, '_blank')} className="w-full relative overflow-hidden group rounded-2xl p-[1px] shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all cursor-pointer z-20">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:opacity-80 transition-opacity" />
                  <div className={`relative flex items-center justify-center gap-2 w-full py-3.5 rounded-[15px] backdrop-blur-sm ${isDarkMode ? 'bg-slate-950/80 hover:bg-slate-950/60' : 'bg-white/90 hover:bg-white/80'} transition-colors`}>
                    <PlayCircle size={18} className={isDarkMode ? 'text-indigo-400' : 'text-indigo-600'} />
                    <span className={`text-[13px] font-semibold tracking-wide ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Watch Full Source</span>
                  </div>
                </button>

                {/* Description & Cast Glass Panel */}
                <div className={glassCardClass}>
                  <p className={`text-sm leading-relaxed mb-4 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {movieData.description}
                  </p>
                  
                  {isPro ? (
                    <div className="space-y-3 pt-4 border-t border-slate-500/20">
                      <div className="flex justify-between items-center">
                        <h3 className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Identified Cast</h3>
                        <Sparkles size={12} className="text-indigo-400" />
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                        {movieData.cast.map((actor, i) => (
                           <div key={i} className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium ${isDarkMode ? 'bg-white/5 text-slate-200' : 'bg-black/5 text-slate-700'}`}>
                             {actor}
                           </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="pt-3 border-t border-slate-500/20">
                      <button onClick={() => setShowSubscription(true)} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors group ${isDarkMode ? 'bg-indigo-500/10 border-indigo-500/20 hover:bg-indigo-500/20' : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`p-1.5 rounded-lg ${isDarkMode ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-200 text-indigo-700'}`}>
                            <Users size={14} />
                          </div>
                          <div className="text-left">
                            <p className={`text-[12px] font-semibold ${isDarkMode ? 'text-slate-200' : 'text-indigo-900'}`}>Unlock Scene Cast</p>
                            <p className={`text-[10px] ${isDarkMode ? 'text-slate-400' : 'text-indigo-700/70'}`}>Premium Feature</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className={isDarkMode ? 'text-indigo-400 block' : 'text-indigo-600 block'} />
                      </button>
                    </div>
                  )}
                </div>

                {/* Steaming Platforms modern row */}
                <div className="space-y-2.5 pt-2">
                  <h3 className={`text-[11px] font-semibold uppercase tracking-wider pl-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Streaming On</h3>
                  <div className="flex gap-2.5">
                    {[
                      { icon: <Youtube size={20} />, name: "YouTube", color: "text-red-500", grad: "from-red-500/20", url: `https://www.youtube.com/results?search_query=${encodeURIComponent(movieData.title)}+clips` },
                      { icon: <Tv size={20} />, name: "Search Web", color: "text-purple-500", grad: "from-purple-500/20", url: `https://www.google.com/search?q=${encodeURIComponent(movieData.title)}+where+to+watch` },
                      { icon: <Film size={20} />, name: "IMDb", color: "text-amber-500", grad: "from-amber-500/20", url: `https://www.imdb.com/find/?q=${encodeURIComponent(movieData.title)}` }
                    ].map((app, i) => (
                      <button key={i} onClick={() => window.open(app.url, '_blank')} className={`flex-1 flex flex-col items-center justify-center gap-2 py-3.5 rounded-2xl group transition-all duration-300 border cursor-pointer z-20 ${isDarkMode ? `bg-gradient-to-br ${app.grad} to-white/5 border-white/5 hover:border-white/20` : `bg-white border-slate-200/60 shadow-sm hover:shadow-md`}`}>
                        <div className={`${app.color} group-hover:scale-110 group-hover:-translate-y-0.5 transition-transform duration-300 drop-shadow-sm`}>
                          {app.icon}
                        </div>
                        <span className={`text-[10px] font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Related Videos */}
                <div className="space-y-3 pt-3 pb-8">
                   <h3 className={`text-[11px] font-semibold uppercase tracking-wider pl-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Related Videos</h3>
                   <div className="flex flex-col gap-2.5 px-1">
                     {[
                        { title: "Docking Scene Explained", views: "1.2M", img: "1536440136628-849c177e76a1" },
                        { title: "Black Hole VFX Breakdown", views: "850K", img: "1451187580459-43490279c0fa" }
                     ].map((clip, i) => (
                       <div key={i} className={`flex gap-3 p-2 rounded-2xl cursor-pointer group transition-all duration-300 border ${isDarkMode ? 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                         <div className="w-24 h-14 rounded-xl overflow-hidden shrink-0 relative">
                           <img src={`https://images.unsplash.com/photo-${clip.img}?q=80&w=400&auto=format&fit=crop`} alt="clip" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                           <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors" />
                         </div>
                         <div className="flex-1 min-w-0 flex flex-col justify-center">
                           <h4 className={`text-xs font-semibold truncate ${isDarkMode ? 'text-slate-200 group-hover:text-white' : 'text-slate-800'}`}>{clip.title}</h4>
                           <p className={`text-[10px] mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>YouTube • {clip.views} views</p>
                         </div>
                       </div>
                     ))}
                   </div>
                </div>

              </>
            </div>
        )}
      </main>

      {/* Floating Action Button for AI Chat */}
      {status === 'found' && (
        <button 
          onClick={() => setIsChatOpen(true)}
          className={`absolute bottom-6 right-6 p-4 rounded-full shadow-2xl flex items-center justify-center group transition-transform hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-indigo-500 text-white shadow-indigo-500/40' : 'bg-indigo-600 text-white shadow-indigo-600/40'}`}
        >
          <Bot size={22} className="group-hover:animate-pulse" />
          {!isPro && queryCount < 10 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold ring-2 ring-slate-900">
              {10 - queryCount}
            </span>
          )}
        </button>
      )}

      {/* Sliding Sidebar for Chat Drawer */}
      <div className={`absolute top-0 right-0 w-[85%] h-full z-50 transform transition-transform duration-500 ease-spring ${isChatOpen ? 'translate-x-0' : 'translate-x-full'} ${isDarkMode ? 'bg-slate-900 shadow-[-20px_0_40px_rgba(0,0,0,0.5)]' : 'bg-slate-50 shadow-[-20px_0_40px_rgba(0,0,0,0.1)]'}`}>
         {status === 'found' && (
           <ChatAssistant 
             isPro={isPro} 
             queryCount={queryCount} 
             setQueryCount={setQueryCount} 
             onUpgrade={() => setShowSubscription(true)} 
             onClose={() => setIsChatOpen(false)}
             isDarkMode={isDarkMode}
           />
         )}
      </div>
      
      {/* Dimmed Background Overlay when Chat is Open */}
      <div 
         onClick={() => setIsChatOpen(false)}
         className={`absolute inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${isChatOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      />

      <SubscriptionModal 
        isOpen={showSubscription} 
        onClose={() => setShowSubscription(false)} 
        onUpgrade={() => setIsPro(true)} 
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

export default App;

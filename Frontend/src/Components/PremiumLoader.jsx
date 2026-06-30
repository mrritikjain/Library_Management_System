import React, { useEffect, useState } from "react";

const PremiumLoader = () => {
  const [tipIndex, setTipIndex] = useState(0);
  const loadingTips = [
    "Optimizing seating grid layout...",
    "Securing administrative console...",
    "Syncing real-time attendance ledger...",
    "Loading data analytics widgets..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex((prev) => (prev + 1) % loadingTips.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center p-4">
      {/* Decorative ambient background glows */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 rounded-full bg-pink-500/10 blur-[100px] pointer-events-none animate-pulse" />

      {/* Loading Container */}
      <div className="w-full max-w-md bg-slate-900/30 border border-slate-850 rounded-3xl p-8 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">
        {/* Top accent glowing line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 animate-pulse" />

        {/* Glow spinner icon */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          {/* Outer Ring */}
          <div className="absolute inset-0 rounded-full border-4 border-indigo-500/10 border-t-indigo-500 animate-spin" style={{ animationDuration: '1.5s' }} />
          {/* Inner Ring (Reverse direction) */}
          <div className="absolute inset-2 rounded-full border-4 border-pink-500/10 border-b-pink-500 animate-spin" style={{ animationDuration: '1s', animationDirection: 'reverse' }} />
          {/* Central Logo/Icon */}
          <span className="text-2xl animate-pulse">🏢</span>
        </div>

        {/* Title */}
        <h2 className="text-lg font-black tracking-wider text-slate-100 uppercase">
          Library Hub
        </h2>
        
        {/* Dynamic status message */}
        <div className="h-6 mt-3 mb-1 overflow-hidden relative w-full flex items-center justify-center">
          <p 
            key={tipIndex} 
            className="text-xs font-semibold text-slate-400 tracking-wide animate-bounce"
          >
            {loadingTips[tipIndex]}
          </p>
        </div>

        {/* Progress Bar simulation */}
        <div className="w-48 bg-slate-950 h-1.5 rounded-full mt-4 border border-slate-850 overflow-hidden relative">
          <div className="absolute top-0 bottom-0 left-0 bg-linear-to-r from-indigo-500 via-violet-500 to-pink-500 rounded-full animate-loading-bar" style={{ width: '60%' }} />
        </div>
      </div>
    </div>
  );
};

export default PremiumLoader;

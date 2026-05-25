'use client';

import React, { useState, useEffect } from 'react';

export default function Loader({ text = "Loading Archives...", subtext = "Syncing with secure database...", fullScreen = true }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const content = (
    <div className="flex flex-col items-center justify-center p-4 max-w-md w-full text-center">
      {/* Container box with double border retro look */}
      <div className="relative border-4 border-black bg-white p-6 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col items-center gap-6 select-none animate-fade-in w-full max-w-[340px]">
        {/* Top bar styling to look like a window */}
        <div className="absolute top-0 left-0 right-0 h-6 bg-black flex items-center justify-between px-2 text-[#EAE5D9] font-mono text-[9px] font-bold">
          <span>SYSTEM_LOADER.EXE</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-[#C2410C] rounded-full"></span>
            <span className="w-1.5 h-1.5 bg-[#EAE5D9] rounded-full"></span>
          </div>
        </div>

        {/* Outer spinner animation */}
        <div className="relative w-16 h-16 mt-4 flex items-center justify-center">
          {/* Inner spinning circle / radar */}
          <div className="absolute inset-0 rounded-full border-4 border-black border-t-[#C2410C] animate-spin"></div>
          {/* Pulsing/bouncing cockroach in the center */}
          <div className="text-3xl animate-bounce select-none">🪳</div>
        </div>

        <div className="flex flex-col gap-1 w-full">
          <h4 className="font-mono text-xs font-bold uppercase tracking-widest text-black flex items-center justify-center">
            {text.replace(/\.+$/, '')}{dots}
          </h4>
          {subtext && (
            <p className="font-mono text-[9px] font-bold text-gray-500 uppercase tracking-wide">
              {subtext}
            </p>
          )}
        </div>

        {/* Vintage-style fake progress bar */}
        <div className="w-full bg-[#EAE5D9] border-2 border-black h-4 overflow-hidden relative p-[2px]">
          <div className="h-full bg-[#C2410C] animate-progress-bar w-[40%] rounded-sm"></div>
        </div>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="vintage-grain min-h-[70vh] flex items-center justify-center py-12 px-4 bg-[#EAE5D9]">
        {content}
      </div>
    );
  }

  return content;
}

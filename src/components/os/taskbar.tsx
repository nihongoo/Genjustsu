'use client';

import React, { useState, useEffect } from 'react';
import { useOS } from './os-context';
import { Wifi, Volume2, Grid2x2 } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load FluidFire component
const FluidFire = dynamic(() => import('../ui/fluid-fire').then(mod => mod.FluidFire), {
  ssr: false,
  loading: () => <div className="w-full h-full" />
});

export function Taskbar() {
  const { state, dispatch } = useOS();
  const [time, setTime] = useState('');
  const [fireWidth, setFireWidth] = useState(800);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const updateFireWidth = () => {
      const width = window.innerWidth > 2560 
        ? 800 
        : window.innerWidth / 1.8;
      setFireWidth(width);
    };
    
    updateFireWidth();
    setIsMounted(true);
    
    window.addEventListener('resize', updateFireWidth);
    return () => window.removeEventListener('resize', updateFireWidth);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
      setTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const config = {
    config: {
      width: fireWidth,
      height: 35,
      fps: 30,
      gridResolution: fireWidth < 400 ? 8000 : 18000,
      gravity: 0.0,
      burningFloor: true,
      burningObstacle: false,
      floorShape: 'bottom',
      floorThickness: 1,
      floorCurve: 0,
      colorScheme: 'black',
      showSwirls: false,
      swirlProbability: 25,
    },
    style: {
      canvas: {
        border: 'none',
        borderRadius: '0px',
        overflow: 'hidden',
      },
    }
  };

  const openWindows = state.windows.filter((w) => w.isOpen);

  return (
    <>
      {/* Fire Effect Container - với aspect-ratio để tránh CLS */}
      {isMounted && (
        <div
          className="fixed left-0 right-0 pointer-events-none z-[1]"
          style={{
            bottom: '48px',
            height: '63px',
            width: '100%',
          }}
        >
          <div 
            className="w-full h-full absolute bottom-0"
            style={{
              containIntrinsicSize: '100% 63px', // Optimize rendering
            }}
          >
            <FluidFire
              {...config.config}
              interactive={false}
              backgroundColor='transparent'
              style={config.style.canvas}
            />
          </div>
        </div>
      )}

      {/* Taskbar - với fixed dimensions */}
      <div className="fixed bottom-0 left-0 right-0 h-12 bg-gradient-to-r from-[#0a0a0a] via-[#1a0009] to-[#0a0a0a] flex items-center justify-between px-2 z-[9999]">
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'TOGGLE_START_MENU' })}
            className={`h-10 w-12 flex items-center justify-center hover:bg-white/10 transition ${
              state.startMenuOpen ? 'bg-white/10' : ''
            }`}
          >
            <Grid2x2 size={20} className="text-white" />
          </button>

          <div className="flex items-center ml-1">
            {openWindows.map((window) => (
              <button
                key={window.id}
                onClick={() => {
                  if (window.isMinimized) {
                    dispatch({ type: 'MINIMIZE_WINDOW', payload: window.id });
                  } else {
                    dispatch({ type: 'FOCUS_WINDOW', payload: window.id });
                  }
                }}
                className={`relative h-10 w-12 flex items-center justify-center hover:bg-white/10 transition`}
                title={window.title}
              >
                <span className="text-lg">{window.icon}</span>

                {/* ACTIVE INDICATOR */}
                {!window.isMinimized && (
                  <div className="absolute bottom-0 w-6 h-[3px] bg-[#0078d4] rounded"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-white/80 text-sm">
          <button className="h-10 w-10 flex items-center justify-center hover:bg-white/10">
            <Wifi size={16} />
          </button>

          <button className="h-10 w-10 flex items-center justify-center hover:bg-white/10">
            <Volume2 size={16} />
          </button>

          <div className="px-3 text-xs leading-tight text-right min-w-[3rem]">
            <div>{time || '00:00'}</div>
          </div>
        </div>

      </div>
    </>
  );
}
'use client';

import React, { useState, ReactNode, useEffect, useRef } from 'react';
import { X, Minus, Square } from 'lucide-react';
import { useOS } from './os-context';
import dynamic from 'next/dynamic';
import Image, { StaticImageData } from 'next/image';

// Lazy load FluidFire
const FluidFire = dynamic(() => import('../ui/fluid-fire'), {
  ssr: false,
  loading: () => <div className="w-full h-8" />
});

interface WindowProps {
  id: string;
  title: string;
  icon: string | StaticImageData;
  children: ReactNode;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}

export function Window({
  id,
  title,
  icon,
  children,
  position,
  size,
  isMinimized,
  isMaximized,
  zIndex,
}: WindowProps) {
  const { dispatch } = useOS();
  const [fireWidth, setFireWidth] = useState(size.width / 1.8);
  const [isMounted, setIsMounted] = useState(false);
  const isDraggingRef = useRef(false);
  const dragOffsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateFireWidth = () => {
      const width = size.width / 1;
        console.log('calculated width:', width); 
      setFireWidth(width);
    };
    updateFireWidth();
    requestAnimationFrame(() => {
      setIsMounted(true);
    });

    window.addEventListener('resize', updateFireWidth);
    return () => window.removeEventListener('resize', updateFireWidth);
  }, []);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    document.body.style.userSelect = 'none';
    const rect = e.currentTarget.getBoundingClientRect();

    dragOffsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    isDraggingRef.current = true;

    dispatch({ type: 'FOCUS_WINDOW', payload: id });

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const newX = e.clientX - dragOffsetRef.current.x;
    const newY = e.clientY - dragOffsetRef.current.y;

    dispatch({
      type: 'MOVE_WINDOW',
      payload: { id, x: newX, y: newY },
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;

    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', handleMouseUp);
  };

  if (isMinimized) return null;

  const windowStyle = {
    position: 'fixed' as const,
    left: isMaximized ? 0 : `${position.x}px`,
    top: isMaximized ? 0 : `${position.y}px`,
    width: isMaximized ? '100%' : `${size.width}px`,
    height: isMaximized ? `calc(100% - 48px)` : `${size.height}px`,
    zIndex: zIndex,
  };

  const config = {
    config: {
      width: fireWidth,
      height: 35,
      fps: 30,
      gridResolution: fireWidth < 400 ? 8000 : 10000,
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

  return (
    <div
      style={windowStyle}
      className="flex flex-col dark:bg-[#2a2a2a] dark:border-[#404040] shadow-lg"
      onMouseDown={handleMouseDown}
    >
      <div
        className="left-0 right-0 pointer-events-none z-[1]"
        style={{
          height: '32px',
          width: '100%',
          containIntrinsicSize: '100% 32px',
        }}
      >
        {isMounted && (
          <div style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            bottom: 0,
          }}>
            <FluidFire
              {...config.config}
              interactive={false}
              backgroundColor='transparent'
              style={config.style.canvas}
            />
          </div>
        )}
      </div>

      {/* Title Bar */}
      <div
        onMouseDown={handleMouseDown}
        className="flex bg-blue items-center justify-between h-8 bg-[#d12b58] text-white px-2 cursor-move select-none flex-shrink-0"
      >
        <div className="flex items-center gap-2 flex-1">
          {typeof icon === 'object' ? (
            <Image
              src={icon}
              alt=''
              width={27}
              height={27}
              className="pointer-events-none"
            />
          ) : (
            <div className="text-xl select-none">{icon}</div>
          )}
          <span className="text-sm font-medium">{title}</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => dispatch({ type: 'MINIMIZE_WINDOW', payload: id })}
            className="p-1 hover:bg-white/20 active:bg-white/30 transition-colors"
            title="Minimize"
          >
            <Minus size={16} />
          </button>
          <button
            onClick={() => dispatch({ type: 'MAXIMIZE_WINDOW', payload: id })}
            className="p-1 hover:bg-white/20 active:bg-white/30 transition-colors"
            title="Maximize"
          >
            <Square size={16} />
          </button>
          <button
            onClick={() => dispatch({ type: 'CLOSE_WINDOW', payload: id })}
            className="p-1 hover:bg-red-500 active:bg-red-600 transition-colors"
            title="Close"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto bg-white dark:bg-[#2a2a2a] text-foreground">
        {children}
      </div>
    </div>
  );
}
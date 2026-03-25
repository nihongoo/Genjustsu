'use client';

import React, { createContext, useReducer, ReactNode } from 'react';
import ThisPc from '../../assets/this-pc.png';
import Commands from '../../assets/commands.png';
import { th } from 'date-fns/locale';
import { StaticImageData } from 'next/image';

export interface WindowState {
  id: string;
  title: string;
  icon: string | StaticImageData;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
}

export interface OSState {
  windows: WindowState[];
  focusedWindowId: string | null;
  startMenuOpen: boolean;
  nextZIndex: number;
  isShutdown: boolean;
  wallpaper: {
    type: 'gradient' | 'custom' | 'video';
    value: string;
    name: string;
  };
}

export type OSAction =
  | { type: 'OPEN_WINDOW'; payload: string }
  | { type: 'CLOSE_WINDOW'; payload: string }
  | { type: 'MINIMIZE_WINDOW'; payload: string }
  | { type: 'MAXIMIZE_WINDOW'; payload: string }
  | { type: 'FOCUS_WINDOW'; payload: string }
  | { type: 'MOVE_WINDOW'; payload: { id: string; x: number; y: number } }
  | { type: 'TOGGLE_START_MENU' }
  | { type: 'CLOSE_START_MENU' }
  | { type: 'SHUTDOWN' }
  | { type: 'BOOT' }
  | { type: 'SET_WALLPAPER'; payload: OSState['wallpaper'] };

const initialState: OSState = {
  windows: [],
  focusedWindowId: null,
  startMenuOpen: false,
  nextZIndex: 1,
  isShutdown: false,
  wallpaper: {
    type: 'video',
    value: 'background.mp4',
    name: 'Default Video',
  },
};

function osReducer(state: OSState, action: OSAction): OSState {
  switch (action.type) {
    case 'OPEN_WINDOW': {
      const existingWindow = state.windows.find((w) => w.id === action.payload);
      if (existingWindow) {
        return {
          ...state,
          windows: state.windows.map((w) =>
            w.id === action.payload ? { ...w, isOpen: true, isMinimized: false } : w
          ),
          focusedWindowId: action.payload,
          nextZIndex: state.nextZIndex + 1,
        };
      }

      const windowConfigs: Record<string, Omit<WindowState, 'zIndex'>> = {
        about: {
          id: 'about',
          title: 'About Me',
          icon: ThisPc,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 100, y: 80 },
          size: { width: 600, height: 500 },
        },
        skills: {
          id: 'skills',
          title: 'Skills',
          icon: '⚙️',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 150, y: 130 },
          size: { width: 700, height: 550 },
        },
        projects: {
          id: 'projects',
          title: 'Projects',
          icon: '📁',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 200, y: 180 },
          size: { width: 800, height: 600 },
        },
        contact: {
          id: 'contact',
          title: 'Contact',
          icon: '✉️',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 250, y: 230 },
          size: { width: 550, height: 480 },
        },
        resume: {
          id: 'resume',
          title: 'Resume',
          icon: '📄',
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 300, y: 280 },
          size: { width: 650, height: 520 },
        },
        commands: {
          id: 'commands',
          title: 'Commands',
          icon: Commands,
          isOpen: true,
          isMinimized: false,
          isMaximized: false,
          position: { x: 300, y: 280 },
          size: { width: 650, height: 520 },
        },
      };

      const windowConfig = windowConfigs[action.payload];
      if (!windowConfig) return state;

      const newWindow: WindowState = {
        ...windowConfig,
        zIndex: state.nextZIndex,
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        focusedWindowId: action.payload,
        nextZIndex: state.nextZIndex + 1,
        startMenuOpen: false,
      };
    }

    case 'CLOSE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload ? { ...w, isOpen: false } : w
        ),
        focusedWindowId: state.focusedWindowId === action.payload ? null : state.focusedWindowId,
      };

    case 'MINIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload ? { ...w, isMinimized: !w.isMinimized } : w
        ),
      };

    case 'MAXIMIZE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload
            ? {
              ...w,
              isMaximized: !w.isMaximized,
              position: w.isMaximized ? { x: w.position.x, y: w.position.y } : { x: 0, y: 0 },
              size: w.isMaximized
                ? { ...w.size }
                : { width: window.innerWidth, height: window.innerHeight - 48 },
            }
            : w
        ),
      };

    case 'FOCUS_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload ? { ...w, zIndex: state.nextZIndex } : w
        ),
        focusedWindowId: action.payload,
        nextZIndex: state.nextZIndex + 1,
      };

    case 'MOVE_WINDOW':
      return {
        ...state,
        windows: state.windows.map((w) =>
          w.id === action.payload.id
            ? { ...w, position: { x: action.payload.x, y: action.payload.y } }
            : w
        ),
      };

    case 'TOGGLE_START_MENU':
      return {
        ...state,
        startMenuOpen: !state.startMenuOpen,
      };

    case 'CLOSE_START_MENU':
      return {
        ...state,
        startMenuOpen: false,
      };
    case 'SHUTDOWN':
      return {
        ...state,
        isShutdown: true,
        startMenuOpen: false,
      };

    case 'BOOT':
      return {
        ...state,
        isShutdown: false,
        windows: [],
        focusedWindowId: null,
      };
    case 'SET_WALLPAPER':
      return { ...state, wallpaper: action.payload };

    default:
      return state;
  }
}

export const OSContext = createContext<{
  state: OSState;
  dispatch: React.Dispatch<OSAction>;
} | undefined>(undefined);

export function OSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(osReducer, initialState);

  return <OSContext.Provider value={{ state, dispatch }}>{children}</OSContext.Provider>;
}

export function useOS() {
  const context = React.useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within OSProvider');
  }
  return context;
}

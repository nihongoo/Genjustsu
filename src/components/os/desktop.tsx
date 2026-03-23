'use client';

import React, { useState } from 'react';
import { useOS } from './os-context';
import { DesktopIcon } from './desktop-icon';
import { Window } from './window';
import { AboutWindow } from '../windows/about-window';
import { SkillsWindow } from '../windows/skills-window';
import { ProjectsWindow } from '../windows/projects-window';
import { ContactWindow } from '../windows/contact-window';
import { ResumeWindow } from '../windows/resume-window';
import { VideoWallpaper } from './video-wallpaper';
import { APPS_CONFIG } from '../../config/apps-config';

const WINDOW_COMPONENTS: Record<string, React.ComponentType<any>> = {
  about: AboutWindow,
  skills: SkillsWindow,
  projects: ProjectsWindow,
  contact: ContactWindow,
  resume: ResumeWindow,
};

// Predefined wallpapers
const WALLPAPERS = [
  { id: 'default', gradient: 'from-[#0078d4] to-[#1084d7]', name: 'Windows Blue' },
  { id: 'dark', gradient: 'from-[#1a1a1a] to-[#2d2d2d]', name: 'Dark' },
  { id: 'purple', gradient: 'from-[#667eea] to-[#764ba2]', name: 'Purple Dream' },
  { id: 'sunset', gradient: 'from-[#ff6b6b] to-[#feca57]', name: 'Sunset' },
  { id: 'ocean', gradient: 'from-[#2193b0] to-[#6dd5ed]', name: 'Ocean' },
  { id: 'forest', gradient: 'from-[#134e5e] to-[#71b280]', name: 'Forest' },
  { id: 'rose', gradient: 'from-[#c94b4b] to-[#4b134f]', name: 'Rose' },
  { id: 'sky', gradient: 'from-[#56ccf2] to-[#2f80ed]', name: 'Sky' },
];

export function Desktop() {
  const { state, dispatch } = useOS();
  const [showWallpaperMenu, setShowWallpaperMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  const handleDesktopClick = () => {
    if (state.startMenuOpen) {
      dispatch({ type: 'CLOSE_START_MENU' });
    }
    setShowWallpaperMenu(false);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuPosition({ x: e.clientX, y: e.clientY });
    setShowWallpaperMenu(true);
  };

  const handleWallpaperChange = (wallpaper: typeof WALLPAPERS[0]) => {
    dispatch({
      type: 'SET_WALLPAPER',
      payload: {
        type: 'gradient',
        value: wallpaper.gradient,
        name: wallpaper.name,
      },
    });
    setShowWallpaperMenu(false);
  };

  const handleCustomWallpaper = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      dispatch({
        type: 'SET_WALLPAPER',
        payload: {
          type: 'custom',
          value: event.target?.result as string,
          name: file.name,
        },
      });

      setShowWallpaperMenu(false);
    };

    reader.readAsDataURL(file);
  };

  return (
    <>
      <div
        onClick={handleDesktopClick}
        onContextMenu={handleContextMenu}
        className="fixed inset-0 w-full h-full overflow-hidden"
        style={
          state.wallpaper.type === 'custom'
            ? {
              backgroundImage: `url(${state.wallpaper.value})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
            : {}
        }
      >
        {state.wallpaper.type === 'video' && (
          <VideoWallpaper src={state.wallpaper.value} />
        )}
        {/* Gradient wallpaper */}
        {state.wallpaper.type === 'gradient' && (
          <div
            className={`absolute inset-0 bg-gradient-to-br ${state.wallpaper.value} opacity-70`}
          />
        )}

        {/* Desktop Icons - RESPONSIVE VERSION */}
        <div className="p-4 absolute top-0 left-0 bottom-12 flex flex-col flex-wrap gap-4 z-10 content-start max-h-[calc(100vh-3rem)]">
          {APPS_CONFIG.map((item) => (
            <DesktopIcon
              key={item.id}
              id={item.id}
              label={item.label}
              icon={item.icon}
            />
          ))}
        </div>

        {/* Windows */}
        {state.windows.map((windowState) => {
          const WindowComponent = WINDOW_COMPONENTS[windowState.id];

          if (!WindowComponent || !windowState.isOpen) return null;

          return (
            <Window
              key={windowState.id}
              id={windowState.id}
              title={windowState.title}
              icon={windowState.icon}
              position={windowState.position}
              size={windowState.size}
              isMinimized={windowState.isMinimized}
              isMaximized={windowState.isMaximized}
              zIndex={windowState.zIndex}
            >
              <WindowComponent />
            </Window>
          );
        })}
      </div>

      {/* Context Menu */}
      {showWallpaperMenu && (
        <div
          className="fixed bg-white/95 dark:bg-[#2a2a2a]/95 backdrop-blur-lg border border-[#d0d0d0] dark:border-[#404040] shadow-2xl rounded-lg overflow-hidden z-[20000] min-w-[280px]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="py-2">
            <div className="px-4 py-2 text-xs font-semibold text-[#666666] dark:text-[#999999] uppercase">
              Personalize
            </div>

            {/* Predefined Wallpapers */}
            <div className="max-h-[400px] overflow-y-auto">
              {WALLPAPERS.map((wallpaper) => (
                <button
                  key={wallpaper.id}
                  onClick={() => handleWallpaperChange(wallpaper)}
                  className="w-full px-4 py-2 hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] flex items-center gap-3 transition-colors"
                >
                  <div
                    className={`w-12 h-8 rounded border border-[#d0d0d0] dark:border-[#404040] bg-gradient-to-br ${wallpaper.gradient}`}
                  />

                  <span className="text-sm">{wallpaper.name}</span>

                  {state.wallpaper.type === 'gradient' &&
                    state.wallpaper.value === wallpaper.gradient && (
                      <span className="ml-auto text-blue-500">✓</span>
                    )}
                </button>
              ))}
            </div>

            <div className="border-t border-[#d0d0d0] dark:border-[#404040] my-2" />

            {/* Upload custom wallpaper */}
            <label className="w-full px-4 py-2 hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] flex items-center gap-3 cursor-pointer transition-colors">
              <span className="text-2xl">🖼️</span>
              <span className="text-sm">Browse for image...</span>

              <input
                type="file"
                accept="image/*,video/mp4,video/webm"
                onChange={handleCustomWallpaper}
                className="hidden"
              />

              {state.wallpaper.type === 'custom' && (
                <span className="ml-auto text-blue-500">✓</span>
              )}
            </label>

            <div className="border-t border-[#d0d0d0] dark:border-[#404040] my-2" />

            {/* Reset to Default */}
            <button
              onClick={() => {
                dispatch({
                  type: 'SET_WALLPAPER',
                  payload: {
                    type: 'video',
                    value: 'background.mp4',
                    name: 'Windows Blue',
                  },
                });
                setShowWallpaperMenu(false);
              }}
              className="w-full px-4 py-2 hover:bg-[#e0e0e0] dark:hover:bg-[#3a3a3a] flex items-center gap-3 transition-colors"
            >
              <span className="text-xl">🔄</span>
              <span className="text-sm font-medium">Reset to Default</span>
              {state.wallpaper.type === 'video' &&
                state.wallpaper.value === 'background.mp4' && (
                  <span className="ml-auto text-green-500">●</span>
                )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
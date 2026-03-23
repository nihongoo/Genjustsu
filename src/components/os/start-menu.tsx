'use client';

import React from 'react';
import { useOS } from './os-context';
import { Power, Settings, CircleUser } from 'lucide-react';
import Image from 'next/image';
import { APPS_CONFIG, PINNED_TILES } from '../../config/apps-config';

export function StartMenu() {
  const { state, dispatch } = useOS();

  const apps = APPS_CONFIG;
  const tiles = PINNED_TILES;

  const handleAppClick = (appId: string) => {
    dispatch({ type: 'OPEN_WINDOW', payload: appId });
  };

  const handleShutdown = () => {
    dispatch({ type: 'SHUTDOWN' });
  };

  // group apps theo alphabet
  const groupedApps = apps.reduce((acc, app) => {
    const letter = app.label[0].toUpperCase();

    if (!acc[letter]) {
      acc[letter] = [];
    }

    acc[letter].push(app);
    return acc;
  }, {} as Record<string, typeof apps>);

  if (!state.startMenuOpen) return null;

  return (
    <div className="fixed bottom-12 left-0 w-[660px] bg-[#1a1a1a]/95 backdrop-blur-xl border-t border-white/10 shadow-2xl z-[10000] flex max-h-[600px] min-h-[600px]">

      {/* LEFT SIDEBAR */}
      <div className="w-12 bg-[#0a0a0a]/50 flex flex-col py-4 border-r border-white/5">

        <button className="w-full h-12 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white">
          <span className="text-xl">≡</span>
        </button>

        <div className="flex-1"></div>

        <button className="w-full h-12 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white">
          <CircleUser size={20} />
        </button>

        <button
          onClick={handleShutdown}
          className="w-full h-12 flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white">
          <Power size={20} />
        </button>

      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex">

        {/* APP LIST */}
        <div className="flex-1 overflow-y-auto p-4">

          {Object.entries(groupedApps).map(([letter, apps]) => (
            <div key={letter} className="mb-4">

              <div className="text-xs text-white/40 px-2 py-1">
                {letter}
              </div>

              {apps.map((app) => (
                <button
                  key={app.id}
                  onClick={() => handleAppClick(app.id)}
                  className="w-full flex items-center gap-3 p-2 hover:bg-white/5 transition-colors group"
                >

                  {typeof app.icon === 'object' ? (
                    <Image
                      src={app.icon}
                      alt={app.label}
                      width={28}
                      height={28}
                      className="pointer-events-none group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <span className="text-xl group-hover:scale-110 transition-transform">
                      {app.icon}
                    </span>
                  )}

                  <span className="text-sm text-white/90">
                    {app.label}
                  </span>

                </button>
              ))}

            </div>
          ))}

        </div>

        {/* TILES AREA */}
        <div className="w-[300px] p-4 border-l border-white/5">

          <div className="text-xs text-white/40 mb-2">
            Pinned
          </div>

          <div className="grid grid-cols-2 gap-2">

            {tiles.map((tile) => (
              <button
                key={tile.id}
                onClick={() => handleAppClick(tile.id)}
                className={`${tile.color} h-[90px] flex items-end p-3 text-white text-sm font-medium hover:brightness-110 transition`}
              >
                {tile.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import ThisPC from '../assets/this-pc.png';

export interface AppConfig {
  id: string;
  label: string;
  icon: typeof ThisPC | string;
}

/**
 * Centralized apps configuration
 * Add new apps here and they will automatically appear in:
 * - Desktop icons
 * - Start menu app list
 * - Start menu tiles (if added to PINNED_TILES)
 */
export const APPS_CONFIG: AppConfig[] = [
  { id: 'about', label: 'About Me', icon: ThisPC },
  { id: 'skills', label: 'Skills', icon: '⚙️' },
  { id: 'projects', label: 'Projects', icon: '📁' },
  { id: 'contact', label: 'Contact', icon: '✉️' },
  { id: 'resume', label: 'Resume', icon: '📄' },
];

/**
 * Pinned tiles configuration for Start Menu
 * These are the prominent tiles shown in the pinned section
 */
export const PINNED_TILES = [
  { id: 'about', label: 'About', color: 'bg-blue-600' },
  { id: 'projects', label: 'Projects', color: 'bg-purple-600' },
  { id: 'skills', label: 'Skills', color: 'bg-green-600' },
  { id: 'contact', label: 'Contact', color: 'bg-pink-600' },
];

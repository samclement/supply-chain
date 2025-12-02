import React from 'react';
import { Layers, GitBranch, Map, Cpu, Users, ZoomOut, ZoomIn, Edit3, Moon, Sun } from 'lucide-react';
import { useTheme } from './ThemeContext.jsx';

export default function Header({
  activeView,
  onViewChange,
  zoomLevel,
  onZoomOut,
  onZoomIn,
  onOpenDataManager
}) {
  const { isDark, toggleTheme } = useTheme();

  const views = [
    { id: 'logical', icon: GitBranch, label: 'Logical' },
    { id: 'physical', icon: Map, label: 'Physical' },
    { id: 'systems', icon: Cpu, label: 'Systems' },
    { id: 'teams', icon: Users, label: 'Teams' },
  ];

  return (
    <header className="border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">Supply Chain Collaboration</h1>
              <p className="text-xs text-slate-500 dark:text-slate-500">Foods Network Visibility</p>
            </div>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                  activeView === view.id
                    ? 'bg-slate-200 dark:bg-slate-700 text-slate-950 dark:text-white'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                <view.icon className="w-4 h-4" />
                {view.label}
              </button>
            ))}
          </div>

          {/* Zoom controls and data manager */}
          <div className="flex items-center gap-2">
            <button
              onClick={onZoomOut}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-600 dark:text-slate-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={onZoomIn}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1" />
            <button
              onClick={() => {
                toggleTheme();
              }}
              className="p-2 rounded-lg bg-yellow-100 dark:bg-slate-800 text-yellow-600 dark:text-yellow-400 hover:bg-yellow-200 dark:hover:bg-slate-700 transition-colors border border-yellow-300 dark:border-yellow-600/30"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onOpenDataManager}
              className="p-2 rounded-lg bg-purple-100 dark:bg-purple-600/20 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-600/30 transition-colors border border-purple-300 dark:border-purple-500/30 dark:hover:border-purple-500/50"
              title="Open data manager"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

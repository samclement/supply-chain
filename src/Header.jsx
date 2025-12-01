import React from 'react';
import { Layers, GitBranch, Map, Cpu, Users, ZoomOut, ZoomIn, Edit3 } from 'lucide-react';

export default function Header({
  activeView,
  onViewChange,
  zoomLevel,
  onZoomOut,
  onZoomIn,
  onOpenDataManager
}) {
  const views = [
    { id: 'logical', icon: GitBranch, label: 'Logical' },
    { id: 'physical', icon: Map, label: 'Physical' },
    { id: 'systems', icon: Cpu, label: 'Systems' },
    { id: 'teams', icon: Users, label: 'Teams' },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-[1800px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">Supply Chain Collaboration</h1>
              <p className="text-xs text-slate-500">Foods Network Visibility</p>
            </div>
          </div>

          {/* View switcher */}
          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
            {views.map(view => (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-all ${
                  activeView === view.id
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white'
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
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-slate-500 w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={onZoomIn}
              className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-6 bg-slate-700 mx-1" />
            <button
              onClick={onOpenDataManager}
              className="p-2 rounded-lg bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 transition-colors border border-purple-500/30 hover:border-purple-500/50"
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

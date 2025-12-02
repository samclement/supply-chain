import React from 'react';
import { Map } from 'lucide-react';
import { nodeStyles } from './styles.js';

const nodeTypeColors = {
  'supplier': '#10b981',
  'ndc': '#a855f7',
  'primary': '#f43f5e',
  'rdc': '#f97316',
  'store': '#3b82f6',
};

export default function MapLegend({ visibleNodes }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-300 dark:border-slate-700/50 p-4 text-slate-950 dark:text-white">
      <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
        <Map className="w-4 h-4" />
        Node Types
      </div>
      <div className="grid grid-cols-5 gap-3">
        {Object.entries(nodeStyles).map(([type, style]) => {
          const typeNodes = visibleNodes.filter(n => n.type === type);
          if (typeNodes.length === 0) return null;

          return (
            <div key={type} className="text-xs">
              <div
                className="w-full h-6 rounded mb-1 opacity-80"
                style={{ backgroundColor: nodeTypeColors[type] }}
              ></div>
              <div className="font-medium text-slate-700 dark:text-slate-300 capitalize">{type}</div>
              <div className="text-slate-600 dark:text-slate-500">{typeNodes.length}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

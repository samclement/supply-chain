import React from 'react';
import { nodeStyles } from './styles.js';

export default function SummaryStats({ visibleNodes, totalNodes }) {
  return (
    <div className="grid grid-cols-5 gap-4 mb-6">
      {Object.entries(nodeStyles).map(([type, style]) => {
        const count = visibleNodes.filter(n => n.type === type).length;
        const total = totalNodes.filter(n => n.type === type).length;
        return (
          <div key={type} className={`${style.bg} border ${style.border} rounded-lg p-4`}>
            <div className="flex items-center gap-2 mb-1">
              {React.createElement(style.icon, { className: `w-4 h-4 ${style.border.replace('border-', 'text-').replace('/60', '')}` })}
              <span className="text-xs text-slate-400 uppercase tracking-wider">{style.label}s</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {count}
              {count !== total && <span className="text-sm text-slate-500 ml-1">/ {total}</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

import React from 'react';
import { Users } from 'lucide-react';
import { nodeStyles } from './styles.js';

export default function TeamCard({ teamName, team, system, nodesWithSystem }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-300 dark:border-slate-700/50 p-4 text-slate-950 dark:text-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-slate-950 dark:text-white flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            {teamName}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-500 mt-1">{team.contact}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-400 dark:border-slate-700/50">
        <div className="text-xs text-slate-600 dark:text-slate-500 mb-2">Owns: {system}</div>
        <div className="text-xs text-slate-600 dark:text-slate-500 mb-1">Used by:</div>
        <div className="space-y-1">
          {nodesWithSystem.slice(0, 5).map(node => (
            <div key={node.id} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
              {React.createElement(nodeStyles[node.type].icon, { className: 'w-3 h-3' })}
              {node.name}
            </div>
          ))}
          {nodesWithSystem.length > 5 && (
            <div className="text-xs text-slate-500 dark:text-slate-600">+{nodesWithSystem.length - 5} more</div>
          )}
        </div>
      </div>
    </div>
  );
}

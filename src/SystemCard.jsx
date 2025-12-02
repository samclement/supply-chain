import React from 'react';
import { Cpu, Users } from 'lucide-react';
import { nodeStyles } from './styles.js';

export default function SystemCard({ system, team, nodesWithSystem }) {
  return (
    <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-300 dark:border-slate-700/50 p-4 text-slate-950 dark:text-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm font-semibold text-slate-950 dark:text-white flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            {system}
          </div>
          {team && (
            <div className="text-xs text-slate-600 dark:text-slate-500 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" />
              {team.name}
            </div>
          )}
        </div>
        <span className="text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-400 px-2 py-0.5 rounded">
          {nodesWithSystem.length} nodes
        </span>
      </div>

      <div className="space-y-1">
        {nodesWithSystem.map(node => (
          <div key={node.id} className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-2">
            {React.createElement(nodeStyles[node.type].icon, { className: 'w-3 h-3' })}
            {node.name}
          </div>
        ))}
      </div>
    </div>
  );
}

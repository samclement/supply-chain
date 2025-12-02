import React from 'react';
import { Cpu, Users } from 'lucide-react';
import { tempColors, nodeStyles, operatorColors } from './styles.js';

export default function NodeCard({
  node,
  compact = false,
  zoomLevel = 1,
  showLayers = { systems: true, teams: true },
  teamsData = {}
}) {
  const style = nodeStyles[node.type];
  const Icon = style.icon;
  const isSelected = node.isSelected;

  return (
    <div
      onClick={node.onSelect}
      className={`
        ${style.bg} ${style.border} border rounded-lg p-3 cursor-pointer transition-all
        ${node.operator ? operatorColors[node.operator] : ''}
        ${isSelected ? 'ring-2 ring-white/50 shadow-lg shadow-white/10' : 'hover:brightness-110'}
        ${compact ? 'p-2' : ''}
      `}
      style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
    >
      <div className="flex items-start gap-2">
        <Icon className={`w-4 h-4 ${style.border.replace('border-', 'text-').replace('/60', '')}`} />
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{style.label}</div>
          <div className="text-sm font-medium text-slate-900 dark:text-white truncate">{node.name}</div>
          {!compact && <div className="text-xs text-slate-600 dark:text-slate-500">{node.location}</div>}
        </div>
      </div>

      {/* Temperature badges */}
      <div className="flex gap-1 mt-2 flex-wrap">
        {node.temp.map(t => {
          const tc = tempColors[t];
          const TempIcon = tc.icon;
          return (
            <span key={t} className={`${tc.bg} ${tc.text} border ${tc.border} px-1.5 py-0.5 rounded text-xs flex items-center gap-1`}>
              <TempIcon className="w-3 h-3" />
              {t}
            </span>
          );
        })}
      </div>

      {/* Systems layer */}
      {showLayers.systems && !compact && (
        <div className="mt-2 pt-2 border-t border-slate-400/50 dark:border-slate-700/50">
          <div className="text-xs text-slate-600 dark:text-slate-500 mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Systems
          </div>
          <div className="flex flex-wrap gap-1">
            {node.systems.map(sys => (
              <span key={sys} className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-xs">
                {sys}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Teams layer */}
      {showLayers.teams && !compact && (
        <div className="mt-2 pt-2 border-t border-slate-400/50 dark:border-slate-700/50">
          <div className="text-xs text-slate-600 dark:text-slate-500 mb-1 flex items-center gap-1">
            <Users className="w-3 h-3" /> Teams
          </div>
          <div className="flex flex-wrap gap-1">
            {[...new Set(node.systems.map(s => teamsData[s]?.name).filter(Boolean))].map(team => (
              <span key={team} className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded text-xs">
                {team}
              </span>
            ))}
          </div>
        </div>
      )}

      {node.operator && (
        <div className="mt-2 text-xs text-slate-500">
          Operator: <span className={node.operator === 'Company A' ? 'text-green-400' : 'text-purple-400'}>{node.operator}</span>
        </div>
      )}
    </div>
  );
}

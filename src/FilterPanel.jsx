import React from 'react';
import { Filter, Cpu, Users, GitBranch, Eye, EyeOff } from 'lucide-react';
import FilterButton from './FilterButton.jsx';
import { tempColors, nodeStyles } from './styles.js';

export default function FilterPanel({
  isOpen,
  onToggle,
  filters,
  onToggleFilter,
  onClearFilters,
  showLayers,
  onToggleLayer
}) {
  const activeFilterCount = Object.values(filters).flat().length;

  return (
    <aside className={`${isOpen ? 'w-72' : 'w-12'} border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 transition-all flex-shrink-0`}>
      <button
        onClick={onToggle}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-slate-950 dark:text-white"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-400" />
          {isOpen && <span className="text-sm font-medium">Filters</span>}
        </div>
        {isOpen && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-500">
              {activeFilterCount} active
            </span>
            {activeFilterCount > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClearFilters();
                }}
                className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
                title="Clear all filters"
              >
                ✕
              </button>
            )}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-6">
          {/* Temperature filter */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">Temperature</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(tempColors).map(([temp, style]) => {
                const TempIcon = style.icon;
                return (
                  <FilterButton
                    key={temp}
                    active={filters.temp.includes(temp)}
                    onClick={() => onToggleFilter('temp', temp)}
                    className={`flex items-center gap-1 ${style.bg} ${style.text} border ${style.border}`}
                  >
                    <TempIcon className="w-3 h-3" />
                    {temp}
                  </FilterButton>
                );
              })}
            </div>
          </div>

          {/* Operator filter */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">Operator</div>
            <div className="flex flex-wrap gap-2">
              {['Company A', 'Company B', 'None'].map(op => (
                <FilterButton
                  key={op}
                  active={filters.operator.includes(op)}
                  onClick={() => onToggleFilter('operator', op)}
                  className={`${
                    op === 'Company A'
                      ? 'bg-green-500/20 text-green-400 border-green-500/50'
                      : op === 'Company B'
                      ? 'bg-purple-500/20 text-purple-400 border-purple-500/50'
                      : 'bg-slate-600/50 text-slate-300 border-slate-500/50'
                  }`}
                >
                  {op}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Node type filter */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">Node Type</div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(nodeStyles).map(([type, style]) => (
                <FilterButton
                  key={type}
                  active={filters.nodeType.includes(type)}
                  onClick={() => onToggleFilter('nodeType', type)}
                  className={`flex items-center gap-1 ${style.bg} ${style.border.replace('border-', 'text-').replace('/60', '')} border ${style.border}`}
                >
                  {React.createElement(style.icon, { className: 'w-3 h-3' })}
                  {style.label}
                </FilterButton>
              ))}
            </div>
          </div>

          {/* Layer toggles */}
          <div>
            <div className="text-xs uppercase tracking-wider text-slate-600 dark:text-slate-500 mb-2">Layers</div>
            <div className="space-y-2">
              {[
                { key: 'systems', icon: Cpu, label: 'Systems' },
                { key: 'teams', icon: Users, label: 'Teams' },
                { key: 'businessProcess', icon: GitBranch, label: 'Business Process' },
              ].map(layer => (
                <button
                  key={layer.key}
                  onClick={() => onToggleLayer(layer.key)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700/50 transition-colors text-slate-950 dark:text-white"
                >
                  <div className="flex items-center gap-2">
                    <layer.icon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{layer.label}</span>
                  </div>
                  {showLayers[layer.key] ? (
                    <Eye className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-slate-400 dark:text-slate-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

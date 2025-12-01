import React from 'react';
import { GitBranch, ChevronDown, ChevronRight, Database, Users } from 'lucide-react';

export default function BusinessProcessFlow({
  process,
  expanded,
  onToggle,
  showLayers = { systems: true, teams: true },
  teamsData = {}
}) {
  return (
    <div className="bg-slate-900/60 rounded-lg border border-slate-700/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-800/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <GitBranch className="w-4 h-4 text-slate-400" />
          <span className="font-medium text-white">{process.name}</span>
          <span className="text-xs text-slate-500 bg-slate-800 px-2 py-0.5 rounded">
            {process.steps.length} steps
          </span>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
      </button>

      {expanded && (
        <div className="px-4 pb-4">
          <div className="relative">
            {process.steps.map((step, idx) => (
              <div key={step.id} className="flex items-start gap-3 relative">
                {/* Connector line */}
                {idx < process.steps.length - 1 && (
                  <div className="absolute left-[11px] top-6 w-0.5 h-full bg-slate-700" />
                )}

                {/* Step dot */}
                <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center text-xs text-slate-400 z-10 flex-shrink-0">
                  {idx + 1}
                </div>

                <div className="flex-1 pb-4">
                  <div className="text-sm font-medium text-white">{step.name}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>

                  {showLayers.systems && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {step.systems.map(sys => (
                        <span key={sys} className="bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                          <Database className="w-3 h-3" />
                          {sys}
                        </span>
                      ))}
                    </div>
                  )}

                  {showLayers.teams && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {[...new Set(step.systems.map(s => teamsData[s]?.name).filter(Boolean))].map(team => (
                        <span key={team} className="bg-indigo-900/40 text-indigo-300 px-1.5 py-0.5 rounded text-xs flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {team}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

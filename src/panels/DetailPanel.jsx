import React from 'react';
import { ArrowRight } from 'lucide-react';
import NodeCard from '../NodeCard.jsx';
import { tempColors } from '../styles.js';

export default function DetailPanel({
  selectedNode,
  onClose,
  supplyChainData,
  showLayers
}) {
  if (!selectedNode) return null;

  return (
    <aside className="w-80 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/30 p-4 text-slate-950 dark:text-white">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold">Node Details</span>
        <button
          onClick={onClose}
          className="text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white text-xs"
        >
          Close
        </button>
      </div>

      <NodeCard
        node={{
          ...selectedNode,
          isSelected: true,
          onSelect: onClose
        }}
        showLayers={showLayers}
        teamsData={supplyChainData.teams}
      />

      {/* Connected flows */}
      <div className="mt-4">
        <div className="text-xs text-slate-600 dark:text-slate-500 uppercase tracking-wider mb-2">Connected Flows</div>
        <div className="space-y-2">
          {supplyChainData.flows
            .filter(f => f.from === selectedNode.id || f.to === selectedNode.id)
            .map(flow => {
              const fromNode = supplyChainData.nodes.find(n => n.id === flow.from);
              const toNode = supplyChainData.nodes.find(n => n.id === flow.to);
              const tc = flow.temp !== 'multi' ? tempColors[flow.temp] : null;

              return (
                <div key={flow.id} className="bg-slate-100 dark:bg-slate-800/50 rounded p-2 text-xs text-slate-950 dark:text-slate-300">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                    <span className="truncate">{fromNode?.name}</span>
                    <ArrowRight className="w-3 h-3 text-slate-400 dark:text-slate-500 flex-shrink-0" />
                    <span className="truncate">{toNode?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-slate-600 dark:text-slate-500">{flow.type}</span>
                    {tc && (
                      <span className={`${tc.bg} ${tc.text} border ${tc.border} px-1 py-0.5 rounded text-xs`}>
                        {flow.temp}
                      </span>
                    )}
                    {flow.hasASN !== undefined && (
                      <span className={`px-1 py-0.5 rounded text-xs ${flow.hasASN ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                        {flow.hasASN ? 'ASN' : 'No ASN'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </aside>
  );
}

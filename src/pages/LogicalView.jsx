import React from 'react';
import { GitBranch, ArrowRight } from 'lucide-react';
import NodeCard from '../NodeCard.jsx';
import BusinessProcessFlow from '../BusinessProcessFlow.jsx';
import { nodeStyles } from '../styles.js';

export default function LogicalView({
  visibleNodes,
  selectedNode,
  onSelectNode,
  supplyChainData,
  zoomLevel,
  showLayers,
  expandedProcess,
  onToggleProcess
}) {
  const groupedNodes = {
    supplier: visibleNodes.filter(n => n.type === 'supplier'),
    ndc: visibleNodes.filter(n => n.type === 'ndc'),
    primary: visibleNodes.filter(n => n.type === 'primary'),
    rdc: visibleNodes.filter(n => n.type === 'rdc'),
    store: visibleNodes.filter(n => n.type === 'store'),
  };

  return (
    <div className="space-y-6">
      {/* Flow diagram */}
      <div className="flex items-start gap-4 overflow-x-auto pb-4">
        {Object.entries(groupedNodes).map(([type, nodes], groupIdx) => (
          <React.Fragment key={type}>
            <div className="flex-shrink-0 min-w-[200px]">
              <div className={`text-xs uppercase tracking-wider mb-3 ${nodeStyles[type].border.replace('border-', 'text-').replace('/60', '')} font-semibold`}>
                {nodeStyles[type].label}s ({nodes.length})
              </div>
              <div className="space-y-3">
                {nodes.map(node => (
                  <NodeCard
                    key={node.id}
                    node={{
                      ...node,
                      isSelected: selectedNode?.id === node.id,
                      onSelect: () => onSelectNode(selectedNode?.id === node.id ? null : node)
                    }}
                    zoomLevel={zoomLevel}
                    showLayers={showLayers}
                    teamsData={supplyChainData.teams}
                  />
                ))}
              </div>
            </div>
            {groupIdx < Object.keys(groupedNodes).length - 1 && (
              <div className="flex-shrink-0 flex flex-col items-center justify-center pt-8">
                <ArrowRight className="w-8 h-8 text-slate-400 dark:text-slate-600" />
                <div className="text-xs text-slate-400 dark:text-slate-600 mt-1">Flow</div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Business processes */}
      {showLayers.businessProcess && (
        <div className="space-y-3">
          <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            Business Processes
          </div>
          {Object.entries(supplyChainData.businessProcesses).map(([key, process]) => (
            <BusinessProcessFlow
              key={key}
              process={process}
              expanded={expandedProcess === key}
              onToggle={() => onToggleProcess(expandedProcess === key ? null : key)}
              showLayers={showLayers}
              teamsData={supplyChainData.teams}
            />
          ))}
        </div>
      )}
    </div>
  );
}

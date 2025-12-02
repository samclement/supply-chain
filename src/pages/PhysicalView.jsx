import React from 'react';
import MapView from '../MapView.jsx';
import MapLegend from '../MapLegend.jsx';

const locationsByRegion = {
  'Scotland': ['Glasgow', 'Edinburgh'],
  'North': ['Manchester', 'Leeds', 'Sheffield', 'Doncaster'],
  'Midlands': ['Birmingham', 'Nottingham'],
  'South': ['Milton Keynes', 'Reading', 'Bristol'],
};

export default function PhysicalView({
  visibleNodes,
  selectedNode,
  onSelectNode
}) {
  return (
    <div className="space-y-4">
      {/* Interactive Map */}
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-300 dark:border-slate-700/50 overflow-hidden">
        <MapView
          visibleNodes={visibleNodes}
          selectedNode={selectedNode}
          onSelectNode={onSelectNode}
        />
      </div>

      {/* Legend */}
      <MapLegend visibleNodes={visibleNodes} />

      {/* Detailed View */}
      <div className="bg-slate-100 dark:bg-slate-900/60 rounded-lg border border-slate-300 dark:border-slate-700/50 p-4 text-slate-950 dark:text-white">
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Cities & Locations</div>
        <div className="grid grid-cols-2 gap-4">
          {Object.entries(locationsByRegion).map(([region, cities]) => (
            <div key={region}>
              <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">{region}</div>
              <div className="space-y-2">
                {cities.map(city => {
                  const nodesInCity = visibleNodes.filter(n => n.location === city);
                  if (nodesInCity.length === 0) return null;
                  return (
                    <div key={city} className="pl-3 border-l-2 border-slate-400 dark:border-slate-700 text-xs">
                      <div className="text-slate-700 dark:text-slate-300 font-medium mb-1">{city}</div>
                      <div className="space-y-1">
                        {nodesInCity.map(node => (
                          <div key={node.id} className="text-slate-600 dark:text-slate-500 text-xs">{node.name}</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

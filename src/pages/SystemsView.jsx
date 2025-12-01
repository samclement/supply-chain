import React from 'react';
import SystemCard from '../SystemCard.jsx';

export default function SystemsView({
  visibleNodes,
  supplyChainData
}) {
  const allSystems = [...new Set(supplyChainData.nodes.flatMap(n => n.systems))];

  return (
    <div className="grid grid-cols-3 gap-4">
      {allSystems.map(system => {
        const nodesWithSystem = visibleNodes.filter(n => n.systems.includes(system));
        const team = supplyChainData.teams[system];

        return (
          <SystemCard
            key={system}
            system={system}
            team={team}
            nodesWithSystem={nodesWithSystem}
          />
        );
      })}
    </div>
  );
}

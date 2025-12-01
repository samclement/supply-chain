import React from 'react';
import TeamCard from '../TeamCard.jsx';

export default function TeamsView({
  visibleNodes,
  supplyChainData
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {Object.entries(supplyChainData.teams).map(([system, team]) => {
        const nodesWithSystem = visibleNodes.filter(n => n.systems.includes(system));

        return (
          <TeamCard
            key={system}
            teamName={team.name}
            team={team}
            system={system}
            nodesWithSystem={nodesWithSystem}
          />
        );
      })}
    </div>
  );
}

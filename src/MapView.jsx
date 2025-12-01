import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// City coordinates in UK (latitude, longitude)
const cityLocations = {
  'Glasgow': { lat: 55.8642, lng: -4.2518, region: 'Scotland' },
  'Edinburgh': { lat: 55.9533, lng: -3.1883, region: 'Scotland' },
  'Manchester': { lat: 53.4808, lng: -2.2426, region: 'North' },
  'Leeds': { lat: 53.8008, lng: -1.5491, region: 'North' },
  'Sheffield': { lat: 53.3811, lng: -1.4701, region: 'North' },
  'Doncaster': { lat: 53.5233, lng: -1.1367, region: 'North' },
  'Birmingham': { lat: 52.5086, lng: -1.8853, region: 'Midlands' },
  'Nottingham': { lat: 52.9549, lng: -1.1584, region: 'Midlands' },
  'Milton Keynes': { lat: 52.0406, lng: -0.7594, region: 'South' },
  'Reading': { lat: 51.4545, lng: -0.9735, region: 'South' },
  'Bristol': { lat: 51.4545, lng: -2.5879, region: 'South' },
};

const nodeTypeColors = {
  'supplier': '#10b981',  // green
  'ndc': '#a855f7',       // violet/purple
  'primary': '#f43f5e',   // rose/pink
  'rdc': '#f97316',       // orange
  'store': '#3b82f6',     // blue
};

export default function MapView({ visibleNodes, selectedNode, onSelectNode }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    if (!map.current) {
      map.current = L.map(mapContainer.current).setView([54.5, -3.5], 6);

      // Add OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map.current);
    }

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => {
      if (Array.isArray(marker)) {
        marker.forEach(m => map.current.removeLayer(m));
      } else {
        map.current.removeLayer(marker);
      }
    });
    markersRef.current = {};

    // Add markers for each city with nodes, grouped by type
    const cityMarkers = {};

    visibleNodes.forEach(node => {
      const cityInfo = cityLocations[node.location];
      if (!cityInfo) return;

      if (!cityMarkers[node.location]) {
        cityMarkers[node.location] = {};
      }
      if (!cityMarkers[node.location][node.type]) {
        cityMarkers[node.location][node.type] = [];
      }
      cityMarkers[node.location][node.type].push(node);
    });

    // Create markers for each node type at each city location
    Object.entries(cityMarkers).forEach(([city, nodesByType]) => {
      const cityInfo = cityLocations[city];
      const typeEntries = Object.entries(nodesByType);

      // Create one marker per node type at this location
      typeEntries.forEach(([nodeType, nodes], typeIndex) => {
        const color = nodeTypeColors[nodeType];
        const offset = typeIndex * 25; // Offset markers slightly so they don't overlap

        // Create custom icon with node type badge
        const iconHtml = `
          <div style="
            width: 40px;
            height: 40px;
            background-color: ${color};
            border: 3px solid white;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4);
            cursor: pointer;
            position: relative;
          ">
            <div style="font-size: 16px; line-height: 1;">${nodes.length}</div>
            <div style="font-size: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${nodeType.substring(0, 2)}</div>
          </div>
        `;

        const icon = L.divIcon({
          html: iconHtml,
          iconSize: [40, 40],
          className: 'custom-marker',
        });

        const marker = L.marker(
          [cityInfo.lat + (offset * 0.005), cityInfo.lng + (offset * 0.005)],
          { icon }
        )
          .bindPopup(`
            <div style="font-family: monospace;">
              <div style="font-weight: bold; margin-bottom: 4px;">${city}</div>
              <div style="font-weight: 600; font-size: 12px; color: ${color}; margin-bottom: 6px; text-transform: uppercase;">
                ${nodeType}s (${nodes.length})
              </div>
              <div style="border-top: 1px solid #ddd; padding-top: 6px; margin-top: 6px;">
                ${nodes.map(n => `
                  <div style="font-size: 11px; padding: 3px 0; color: #333;">
                    • ${n.name}
                  </div>
                `).join('')}
              </div>
            </div>
          `)
          .addTo(map.current);

        // Highlight on node selection
        marker.on('click', () => {
          if (nodes.length === 1) {
            onSelectNode(nodes[0]);
          }
        });

        if (!markersRef.current[city]) {
          markersRef.current[city] = [];
        }
        markersRef.current[city].push(marker);

        // Highlight if selected node is in this city
        if (selectedNode && selectedNode.location === city && selectedNode.type === nodeType) {
          marker.openPopup();
        }
      });
    });

    // Fit map to show all markers if we have them
    const allMarkers = [];
    Object.values(markersRef.current).forEach(marker => {
      if (Array.isArray(marker)) {
        allMarkers.push(...marker);
      } else {
        allMarkers.push(marker);
      }
    });

    if (allMarkers.length > 0) {
      const group = new L.featureGroup(allMarkers);
      map.current.fitBounds(group.getBounds().pad(0.1));
    }
  }, [visibleNodes, selectedNode, onSelectNode]);

  return (
    <div
      ref={mapContainer}
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(71, 85, 105, 0.5)',
      }}
    />
  );
}

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Navigation } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import GlassCard from './ui/GlassCard';

// Custom Marker Icon Generator
function createCustomPin(color, symbol) {
  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
        border: 2px solid #ffffff;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 13px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">${symbol}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
}

const ICONS = {
  START: createCustomPin('#2563eb', '🚛'),
  PICKUP: createCustomPin('#9333ea', '📦'),
  REST_BREAK: createCustomPin('#d97706', '☕'),
  DAILY_RESET: createCustomPin('#4f46e5', '🌙'),
  FUEL: createCustomPin('#059669', '⛽'),
  CYCLE_RESET: createCustomPin('#e11d48', '🔄'),
  DROPOFF: createCustomPin('#dc2626', '🏁'),
  FINAL_SIGNOFF: createCustomPin('#16a34a', '✅'),
};

function ChangeView({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
    }
  }, [bounds, map]);
  return null;
}

export default function RouteMap({ routeCoordinates, stops }) {
  const { theme } = useTheme();
  const hasRoute = routeCoordinates && routeCoordinates.length > 0;
  const center = hasRoute ? routeCoordinates[0] : [39.8283, -98.5795];

  // Dark tiles for dark mode, light for light mode
  const tileUrl = theme === 'dark'
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

  const LEGEND = [
    { color: 'bg-blue-500', label: 'Start' },
    { color: 'bg-purple-500', label: 'Pickup' },
    { color: 'bg-amber-500', label: 'Rest' },
    { color: 'bg-indigo-500', label: '10h Reset' },
    { color: 'bg-emerald-500', label: 'Fuel' },
    { color: 'bg-rose-500', label: 'Dropoff' },
  ];

  return (
    <GlassCard className="!p-4 overflow-hidden">
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-[var(--text-primary)]">Interactive Route Map</h3>
        </div>
        {hasRoute && (
          <div className="flex items-center gap-3 text-[11px] text-[var(--text-muted)]">
            {LEGEND.map((l, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${l.color} inline-block`} />
                {l.label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="h-[440px] w-full rounded-xl overflow-hidden border border-[var(--glass-border)] relative z-10">
        <MapContainer center={center} zoom={5} scrollWheelZoom={true} className="h-full w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url={tileUrl}
          />

          {hasRoute && (
            <>
              <ChangeView bounds={routeCoordinates} />
              <Polyline
                positions={routeCoordinates}
                color="#3b82f6"
                weight={5}
                opacity={0.85}
              />
            </>
          )}

          {stops &&
            stops.map((stop, idx) => {
              if (!stop.lat || !stop.lng) return null;
              const icon = ICONS[stop.type] || ICONS.REST_BREAK;

              return (
                <Marker key={`${stop.type}-${idx}`} position={[stop.lat, stop.lng]} icon={icon}>
                  <Popup>
                    <div className="p-1 font-sans text-slate-900 text-xs space-y-1">
                      <div className="font-bold text-sm text-slate-900">{stop.name}</div>
                      <p className="text-slate-600 font-semibold">{stop.location}</p>
                      <div className="grid grid-cols-2 gap-1 pt-1 text-[11px] border-t border-slate-200">
                        <div><span className="text-slate-500">Duration:</span> <strong>{stop.duration_hours}h</strong></div>
                        <div><span className="text-slate-500">Status:</span> <strong className="text-blue-700">{stop.duty_status}</strong></div>
                        <div><span className="text-slate-500">Arrival:</span> <strong>Hour {stop.arrival_time_hrs}</strong></div>
                        <div><span className="text-slate-500">Mile:</span> <strong>{stop.accumulated_miles} mi</strong></div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic mt-1">{stop.remark}</p>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
        </MapContainer>
      </div>
    </GlassCard>
  );
}

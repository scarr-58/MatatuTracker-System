import React from 'react';
import { Matatu, RouteDetail } from '../types';
import { ROUTE_PATHWAYS } from '../data';
import { MapPin, Bus, Navigation, Flame, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface NairobiMapProps {
  matatus: Matatu[];
  selectedMatatu: Matatu | null;
  onSelectMatatu: (matatu: Matatu) => void;
  selectedRoute: RouteDetail | null;
}

export default function NairobiMap({
  matatus,
  selectedMatatu,
  onSelectMatatu,
  selectedRoute
}: NairobiMapProps) {
  // We can render custom visual markers of routes on an elegant SVG container.
  // Dimensions 800 x 550
  const width = 800;
  const height = 550;

  // Render roads as paths
  const routeKeys = Object.keys(ROUTE_PATHWAYS);

  return (
    <div className="relative bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 min-h-[500px]">
      {/* Background Graphic Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:30px_30px] opacity-25 pointer-events-none" />

      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div>
          <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping" />
            Live Nairobi Tracking Core (Matatu Map)
          </h2>
          <p className="text-slate-400 text-xs font-mono">
            {matatus.filter(m => m.status === 'Moving').length} active, {matatus.filter(m => m.status === 'Stuck in Traffic').length} stuck in jams, updating live
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-semibold">
            <div className="w-2 h-2 bg-indigo-500 rounded-full" />
            <span>CBD Transit Hub</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-full text-slate-300 font-semibold">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
            <span>Moving matatu</span>
          </div>
        </div>
      </div>

      {/* Primary SVG Container */}
      <div className="w-full aspect-[8/5.5] border border-slate-800/80 rounded-2xl bg-slate-950 relative overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-full select-none"
          id="nairobi-tracking-svg-map"
        >
          {/* Subtle Ambient Defs */}
          <defs>
            <radialGradient id="cbd-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
            </radialGradient>
            <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="shimmer" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f43f5e" floodOpacity="0.8"/>
            </filter>
          </defs>

          {/* Central CBD Highlight Radiance */}
          <circle cx={400} cy={260} r={180} fill="url(#cbd-glow)" pointerEvents="none" />

          {/* Render Transit Road Network Lines */}
          {routeKeys.map((key) => {
            const points = ROUTE_PATHWAYS[key];
            const isHighlighted = selectedRoute?.routeCode === key;

            // Build SVG path string from point list
            const pathData = points
              .map((p, idx) => {
                const scaledX = (p.x / 100) * width;
                const scaledY = (p.y / 100) * height;
                return `${idx === 0 ? 'M' : 'L'} ${scaledX} ${scaledY}`;
              })
              .join(' ');

            return (
              <g id={`route-group-${key}`} key={`route-line-${key}`}>
                {/* Outer Glow Background Line for highlighted / selected route */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#3b82f6' : '#1e293b'}
                  strokeWidth={isHighlighted ? 8 : 4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="transition-all duration-500 ease-out opacity-40"
                  filter={isHighlighted ? 'url(#neon-glow)' : ''}
                />
                {/* Inner Thin Accurate Route Line */}
                <path
                  d={pathData}
                  fill="none"
                  stroke={isHighlighted ? '#60a5fa' : '#334155'}
                  strokeWidth={isHighlighted ? 3 : 1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray={isHighlighted ? 'none' : '4 4'}
                  className="transition-all duration-300"
                />
              </g>
            );
          })}

          {/* Stage Labels on Map */}
          {routeKeys.map((key) => {
            const points = ROUTE_PATHWAYS[key];
            return points.map((p, pIdx) => {
              const scaledX = (p.x / 100) * width;
              const scaledY = (p.y / 100) * height;
              const isCbd = p.name.includes('CBD');

              // Avoid duplicate rendering of CBD stage labels
              if (isCbd && key !== '45') return null;

              return (
                <g key={`stage-${key}-${pIdx}`} className="group cursor-default">
                  {/* Stage Dot Pulsing Background */}
                  <circle
                    cx={scaledX}
                    cy={scaledY}
                    r={isCbd ? 7 : 4}
                    fill={isCbd ? '#6366f1' : '#334155'}
                    className={`transition-all duration-300 duration-1000 ${
                      isCbd ? 'animate-pulse hover:fill-indigo-400' : 'group-hover:fill-slate-400'
                    }`}
                  />
                  {/* Clean text backdrop for readability */}
                  <rect
                    x={scaledX - (isCbd ? 50 : 35)}
                    y={scaledY - (isCbd ? 24 : 20)}
                    width={isCbd ? 100 : 70}
                    height={14}
                    rx={3}
                    fill="#020617"
                    fillOpacity={0.8}
                    className="pointer-events-none"
                  />
                  {/* Stage Label Text */}
                  <text
                    x={scaledX}
                    y={scaledY - (isCbd ? 14 : 11)}
                    textAnchor="middle"
                    fill={isCbd ? '#a5b4fc' : '#94a3b8'}
                    fontSize={isCbd ? '9px' : '7.5px'}
                    fontWeight={isCbd ? '700' : '500'}
                    className="font-mono pointer-events-none tracking-tight"
                  >
                    {p.name}
                  </text>
                </g>
              );
            });
          })}

          {/* Render Active Matatu Markers */}
          {matatus.map((matatu) => {
            const routePoints = ROUTE_PATHWAYS[matatu.routeNumber];
            if (!routePoints) return null;

            // Interpolate position based on current mock coordinate locations
            const mappedX = (matatu.location.x / 100) * width;
            const mappedY = (matatu.location.y / 100) * height;

            const isSelected = selectedMatatu?.id === matatu.id;
            const neon = matatu.vibe.neonColor || '#10b981';

            return (
              <g
                key={matatu.id}
                transform={`translate(${mappedX}, ${mappedY})`}
                id={`matatu-marker-${matatu.id}`}
                className="cursor-pointer group"
                onClick={() => onSelectMatatu(matatu)}
              >
                {/* Active Neon Aura Glow */}
                <circle
                  cx={0}
                  cy={0}
                  r={isSelected ? 18 : 12}
                  fill={neon}
                  fillOpacity={0.15}
                  stroke={neon}
                  strokeOpacity={isSelected ? 0.9 : 0.4}
                  strokeWidth={isSelected ? 2 : 1}
                  className={`transition-all duration-300 ${
                    matatu.status === 'Moving' ? 'animate-pulse' : ''
                  }`}
                  style={{
                    filter: isSelected ? 'url(#shimmer)' : ''
                  }}
                />

                {/* Pin / Bus Indicator */}
                <g transform="translate(-8, -8)" className="pointer-events-none">
                  <rect
                    width={16}
                    height={16}
                    rx={4}
                    fill={isSelected ? neon : '#1e293b'}
                    stroke={isSelected ? '#ffffff' : neon}
                    strokeWidth={1.5}
                    className="transition-colors duration-300 shadow-md"
                  />
                  <foreignObject x={2} y={2} width={12} height={12}>
                    <div className="flex items-center justify-center w-full h-full text-white">
                      <Bus size={9} strokeWidth={2.5} className={isSelected ? 'text-slate-950' : 'text-white'} />
                    </div>
                  </foreignObject>
                </g>

                {/* Floating Micro Moniker Label */}
                <g transform="translate(0, -18)" className="pointer-events-none">
                  <rect
                    x={-40}
                    y={-6}
                    width={80}
                    height={14}
                    rx={4}
                    fill="#0f172a"
                    stroke={isSelected ? neon : 'transparent'}
                    strokeWidth={1}
                    fillOpacity={0.9}
                  />
                  <text
                    x={0}
                    y={4}
                    textAnchor="middle"
                    fill={isSelected ? '#ffffff' : '#e2e8f0'}
                    fontSize="7.5px"
                    fontWeight="700"
                    className="font-sans tracking-tight"
                  >
                    {matatu.name}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Floating Quick Info Panel inside Map */}
        <AnimatePresence>
          {selectedMatatu && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute bottom-4 left-4 right-4 bg-slate-950/95 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 z-20 shadow-2xl backdrop-blur-md"
              id="selected-matatu-quick-panel"
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg relative"
                  style={{
                    backgroundColor: `${selectedMatatu.vibe.neonColor}20`,
                    border: `2px solid ${selectedMatatu.vibe.neonColor}`
                  }}
                >
                  <Bus size={22} style={{ color: selectedMatatu.vibe.neonColor }} />
                  {selectedMatatu.vibe.rating >= 4.7 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-yellow-500 rounded-full p-0.5 text-slate-950">
                      <Flame size={10} fill="currentColor" />
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold text-base">{selectedMatatu.name}</h3>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded">
                      {selectedMatatu.regNumber}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs font-mono">
                    Route {selectedMatatu.routeNumber} • {selectedMatatu.sacco}
                  </p>
                </div>
              </div>

              {/* Stats Grid inside the Quick Banner */}
              <div className="grid grid-cols-3 gap-2 text-center md:text-left">
                <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block">Speed</span>
                  <span className="text-slate-200 font-bold text-xs">{selectedMatatu.speed} km/h</span>
                </div>
                <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block font-bold">Fare</span>
                  <span className="text-sky-400 font-bold text-xs">{selectedMatatu.currentFare} KES</span>
                </div>
                <div className="bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800/50">
                  <span className="text-slate-500 text-[9px] uppercase font-mono block font-bold">Seats Left</span>
                  <span className="text-blue-400 font-bold text-xs">
                    {selectedMatatu.capacity - selectedMatatu.currentOccupancy} free
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto font-mono">
                <span
                  className={`text-[10px] px-2.5 py-1 rounded-full border font-bold ${
                    selectedMatatu.status === 'Moving'
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      : selectedMatatu.status === 'Stuck in Traffic'
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}
                >
                  {selectedMatatu.status}
                </span>
                <span className="text-xs font-mono text-slate-400 italic">
                  Vibe rating: ⭐{selectedMatatu.vibe.rating}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Map Control Guide */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] text-slate-500 font-mono gap-y-2">
        <span>💡 Tap on any pulsing minibus marker to explore its dynamic speed, graffiti theme, and music vibe.</span>
        <span>Corridor routes mapped directly from Nairobi CBD core.</span>
      </div>
    </div>
  );
}

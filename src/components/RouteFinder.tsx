import React, { useState } from 'react';
import { RouteDetail } from '../types';
import { ROUTES } from '../data';
import { MapPin, Search, Compass, DollarSign, ArrowRight, BookOpen, ToggleLeft, Percent, Landmark } from 'lucide-react';
import { motion } from 'motion/react';

interface RouteFinderProps {
  onRouteSelect: (route: RouteDetail) => void;
  selectedRoute: RouteDetail | null;
}

export default function RouteFinder({ onRouteSelect, selectedRoute }: RouteFinderProps) {
  const [origin, setOrigin] = useState<string>('');
  const [destination, setDestination] = useState<string>('');
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<RouteDetail[]>([]);

  // Unique list of stages for selectors
  const allOrigins = Array.from(new Set(ROUTES.map(r => r.from)));
  const allDestinations = Array.from(new Set(ROUTES.map(r => r.to)));

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearched(true);

    if (!origin && !destination) {
      setResults(ROUTES);
      return;
    }

    const filtered = ROUTES.filter(route => {
      const matchOrigin = !origin || route.from.toLowerCase().includes(origin.toLowerCase()) || route.stages.some(s => s.toLowerCase().includes(origin.toLowerCase()));
      const matchDest = !destination || route.to.toLowerCase().includes(destination.toLowerCase()) || route.stages.some(s => s.toLowerCase().includes(destination.toLowerCase()));
      return matchOrigin && matchDest;
    });

    setResults(filtered);
  };

  const handleReset = () => {
    setOrigin('');
    setDestination('');
    setResults([]);
    setSearched(false);
  };

  // Pre-generate standard street hacks based on route identifiers
  const getRouteHack = (routeCode: string) => {
    switch (routeCode) {
      case '45':
        return {
          title: 'The Ngara Terminal Bypass',
          desc: 'Instead of lining up at the chaotic CBD Odeon Stage where rush hour fares hit 120 KES, take a brief 8-minute walk to Ngara Stage (just past Globe roundabout). High frequency boarding there will cost you only 60 KES!',
          savings: '40 - 60 KES'
        };
      case '125':
        return {
          title: 'Langata Road Multi-Stage Split',
          desc: 'Direct peak Railways express to Rongai is 150 KES. Save cash by boarding a Lang\'ata Sacco matatu to Galleria Mall / T-Mall for 50 bob, then board the frequent transit outers from Galleria to Rongai Town for only 40 bob.',
          savings: '60 KES'
        };
      case '58':
        return {
          title: 'City Stadium Walk Hack',
          desc: 'Fares inside Commercial terminal are spiked during rush hours. Walk or board a local shuttle to Landhies Road / City Stadium stage and pick up outbound Jogoo Road matatus. Fares drop significantly outside CBD.',
          savings: '30 KES'
        };
      case '23':
        return {
          title: 'Westlands Stage Pick',
          desc: 'Super Metro is popular but has long queues. Walk slightly past Khoja towards the Westlands flyover slipway or board a non-branded 14-seater. Non-rush hours offer instant boarding at 30 KES.',
          savings: '10 - 20 KES'
        };
      default:
        return {
          title: 'Universal Sacco Check',
          desc: 'Compare boardings of different Saccos - Super Metro maintains strict pricing cards, whereas smaller non-regulated transit outers offer lower rates off-peak to fill empty seats quickly.',
          savings: '15 - 30 KES'
        };
    }
  };

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 backdrop-blur-lg flex flex-col h-full shadow-lg" id="route-finder-section">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-blue-500/10 rounded-xl text-blue-400">
          <Compass size={20} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white font-sans">Nairobi Corridor Route & Fare Intelligence</h2>
          <p className="text-xs text-slate-400">Discover direct pathways, peak multipliers, or alternative pocket-friendly route hacks.</p>
        </div>
      </div>

      {/* Origin/Desination inputs */}
      <form onSubmit={handleSearch} className="space-y-3 mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-500">
              <MapPin size={15} />
            </span>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 appearance-none"
            >
              <option value="">-- Choose Origin Stage --</option>
              {allOrigins.map(o => <option key={o} value={o}>{o}</option>)}
              <option value="Westlands">Westlands Stage (Route 23 Hub)</option>
              <option value="Roysambu">Roysambu Stage (Thika Hwy)</option>
              <option value="Pangani">Pangani Bypass</option>
            </select>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-3.5 text-slate-500">
              <MapPin size={15} className="text-blue-400" />
            </span>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 appearance-none"
            >
              <option value="">-- Choose Destination Stage --</option>
              {allDestinations.map(d => <option key={d} value={d}>{d}</option>)}
              <option value="Githurai 45">Githurai 45 Terminal</option>
              <option value="Rongai Town">Rongai Town</option>
              <option value="Buruburu 4">Buruburu Phase 4</option>
              <option value="Uthiru">Uthiru Junction</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-1.5">
          <button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Search size={14} />
            Get Rates & Alternatives
          </button>
          {(origin || destination || searched) && (
            <button
              type="button"
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3.5 rounded-xl text-xs transition-colors cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </form>

      {/* Results Container */}
      <div className="flex-1 overflow-y-auto space-y-4 max-h-[360px] pr-1">
        {searched && results.length === 0 ? (
          <div className="text-center py-8 bg-slate-950/40 rounded-2xl border border-dashed border-slate-800/80">
            <p className="text-slate-400 text-xs">No direct Matatu routes matched your parameters.</p>
            <button
              type="button"
              onClick={() => { setResults(ROUTES); setSearched(true); }}
              className="text-blue-400 hover:underline text-[11px] mt-2 font-mono"
            >
              Show all {ROUTES.length} general routes instead
            </button>
          </div>
        ) : (
          (results.length > 0 ? results : ROUTES).map((route) => {
            const isSelected = selectedRoute?.id === route.id;
            const hack = getRouteHack(route.routeCode);

            return (
              <div
                key={route.id}
                onClick={() => onRouteSelect(route)}
                className={`p-4 rounded-2xl border transition-all duration-300 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-950 border-blue-500/80 shadow-md ring-1 ring-blue-500/20'
                    : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950/70'
                }`}
                id={`route-card-${route.routeCode}`}
              >
                {/* Route Header Info */}
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-500/10 text-blue-400 text-[11px] font-mono font-bold px-2 py-0.5 rounded border border-blue-500/20">
                      R_{route.routeCode}
                    </span>
                    <span className="text-white font-semibold text-xs tracking-tight">
                      CBD ➔ {route.to}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-mono block">Transit Dist</span>
                    <span className="text-slate-200 font-bold text-xs font-mono">{route.distanceKm} km</span>
                  </div>
                </div>

                {/* Fare Tier Levels */}
                <div className="grid grid-cols-3 gap-1 mb-3 text-center">
                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/40">
                    <span className="text-slate-500 text-[8px] uppercase font-mono block">Off-Peak</span>
                    <span className="text-sky-400 font-bold text-xs">KES {route.offPeakFare}</span>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/40">
                    <span className="text-slate-500 text-[8px] uppercase font-mono block">Standard</span>
                    <span className="text-amber-400 font-bold text-xs">KES {route.standardFare}</span>
                  </div>
                  <div className="bg-slate-900/60 p-1.5 rounded border border-slate-800/40">
                    <span className="text-slate-500 text-[8px] uppercase font-mono block">Peak Hours</span>
                    <span className="text-rose-400 font-bold text-xs">KES {route.peakFare}</span>
                  </div>
                </div>

                {/* Sacco operators & Jam details */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-3 py-1.5 px-2 bg-slate-900/40 rounded-lg">
                  <span className="flex items-center gap-1">
                    <Landmark size={11} className="text-indigo-400" />
                    Saccos: {route.primarySaccos.join(', ')}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      route.congestionLevel === 'Low' ? 'bg-sky-400' :
                      route.congestionLevel === 'Medium' ? 'bg-yellow-500' : 'bg-red-500'
                    }`} />
                    Jam: {route.congestionLevel}
                  </span>
                </div>

                {/* Detailed Transit Stages */}
                <div className="flex flex-wrap items-center gap-1.5 text-[9px] text-slate-500 font-mono py-1.5 border-t border-slate-900">
                  <span className="text-slate-400">Stages:</span>
                  {route.stages.map((stage, sIdx) => (
                    <React.Fragment key={stage}>
                      <span className="text-slate-300 bg-slate-900 px-1.5 py-0.5 rounded">{stage}</span>
                      {sIdx < route.stages.length - 1 && <ArrowRight size={8} className="text-slate-600" />}
                    </React.Fragment>
                  ))}
                </div>

                {/* Show Expandable Nairobi Street-Smart Commuter Hack! */}
                {isSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-3 pt-3 border-t border-dashed border-blue-500/20 bg-blue-500/5 -mx-4 -mb-4 p-4 rounded-b-2xl overflow-hidden"
                  >
                    <div className="flex items-center justify-between text-xs text-blue-400 font-bold mb-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Percent size={13} strokeWidth={2.5} />
                        STREET CHEAP ALTERNATIVE (HACK)
                      </span>
                      <span className="bg-blue-500/25 text-white text-[9px] uppercase px-1.5 py-0.5 rounded-full">
                        Save {hack.savings}
                      </span>
                    </div>
                    <h4 className="text-xs font-semibold text-slate-200 mb-1">{hack.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{hack.desc}</p>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

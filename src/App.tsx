import React, { useState, useEffect } from 'react';
import NairobiMap from './components/NairobiMap';
import RouteFinder from './components/RouteFinder';
import { Matatu, RouteDetail, CommuterReport, BoardingPass } from './types';
import { GENERAL_TIPS, ROUTE_PATHWAYS } from './data';
import { 
  Bus, MapPin, Search, Compass, DollarSign, Fuel, Users, 
  ChevronRight, Radio, Send, Star, Volume2, ShieldAlert, 
  Tag, Clock, CheckCircle, Database, HelpCircle, RefreshCw, Layers, Ticket
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Authentication & Session State
  const [userSession, setUserSession] = useState<{ email: string; name: string; isAdmin: boolean } | null>(() => {
    const saved = localStorage.getItem('matatu_tracker_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authIsAdmin, setAuthIsAdmin] = useState(false);
  const [authError, setAuthError] = useState('');

  // DB & General State
  const [dbStatus, setDbStatus] = useState<{ mode: string; connected: boolean; error?: string }>({
    mode: 'Checking...',
    connected: false
  });
  
  const [matatus, setMatatus] = useState<Matatu[]>([]);
  const [routes, setRoutes] = useState<RouteDetail[]>([]);
  const [reports, setReports] = useState<CommuterReport[]>([]);
  const [selectedMatatu, setSelectedMatatu] = useState<Matatu | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteDetail | null>(null);
  const [selectedStage, setSelectedStage] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [maxFareLimit, setMaxFareLimit] = useState<number>(160);

  // Form State
  const [postSheng, setPostSheng] = useState('');
  const [postEnglish, setPostEnglish] = useState('');
  const [postStage, setPostStage] = useState('');
  const [postType, setPostType] = useState<'traffic' | 'fare_drop' | 'fare_spike' | 'police_crackdown' | 'heavy_rain' | 'general'>('general');
  const [postUser, setPostUser] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  // Booking Modal State
  const [bookingMatatu, setBookingMatatu] = useState<Matatu | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<string>('S-1');
  const [mpesaPhone, setMpesaPhone] = useState<string>('');
  const [mpesaProcessing, setMpesaProcessing] = useState(false);
  const [purchasedTickets, setPurchasedTickets] = useState<BoardingPass[]>([]);
  const [activeTab, setActiveTab] = useState<'tracker' | 'tickets' | 'sheng-alerts'>('tracker');
  const [successTicket, setSuccessTicket] = useState<BoardingPass | null>(null);

  // Pre-fill helper utilities
  const handlePresetLogin = async (role: 'admin' | 'commuter') => {
    setAuthError('');
    const email = role === 'admin' ? 'admin@matatutracker.com' : 'brayo.commuter@gmail.com';
    const password = 'password';

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Preset login failed.');
        return;
      }
      const session = {
        email: data.email,
        name: data.name,
        isAdmin: data.isAdmin
      };
      localStorage.setItem('matatu_tracker_session', JSON.stringify(session));
      setUserSession(session);
    } catch (err) {
      console.warn('Backend login fallback to local session state:', err);
      const session = {
        email,
        name: role === 'admin' ? 'Nairobi_Command_Central' : 'Brayo_Manyanga',
        isAdmin: role === 'admin'
      };
      localStorage.setItem('matatu_tracker_session', JSON.stringify(session));
      setUserSession(session);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('matatu_tracker_session');
    setUserSession(null);
    setAuthEmail('');
    setAuthPassword('');
    setAuthName('');
    setAuthIsAdmin(false);
    setAuthError('');
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    if (!authEmail || !authPassword) {
      setAuthError('Please fill out all required details.');
      return;
    }

    try {
      if (authMode === 'signup') {
        if (!authName) {
          setAuthError('Please provide a moniker tag (e.g. Shiko_Ngara).');
          return;
        }

        const response = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            name: authName,
            password: authPassword,
            isAdmin: authIsAdmin
          })
        });

        const data = await response.json();
        if (!response.ok) {
          setAuthError(data.error || 'Registration failed.');
          return;
        }

        const newSession = {
          email: data.email,
          name: data.name,
          isAdmin: data.isAdmin
        };
        localStorage.setItem('matatu_tracker_session', JSON.stringify(newSession));
        setUserSession(newSession);
      } else {
        // Login
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: authEmail,
            password: authPassword
          })
        });

        const data = await response.json();
        if (!response.ok) {
          setAuthError(data.error || 'Invalid credentials.');
          return;
        }

        const newSession = {
          email: data.email,
          name: data.name,
          isAdmin: data.isAdmin
        };
        localStorage.setItem('matatu_tracker_session', JSON.stringify(newSession));
        setUserSession(newSession);
      }
    } catch (err) {
      console.error('Authentication request failed', err);
      // Resilience fallback
      const calculatedName = authEmail.split('@')[0];
      const newSession = {
        email: authEmail,
        name: authMode === 'signup' 
          ? authName.trim().replace(/\s+/g, '_') 
          : calculatedName.charAt(0).toUpperCase() + calculatedName.slice(1) + '_Commutes',
        isAdmin: authIsAdmin
      };
      localStorage.setItem('matatu_tracker_session', JSON.stringify(newSession));
      setUserSession(newSession);
    }
  };

  // Fetch initial state
  const fetchData = async () => {
    try {
      // 1. Status Check
      const statusRes = await fetch('/api/db-status');
      if (statusRes.ok) {
        const statusData = await statusRes.json();
        setDbStatus(statusData);
      }
      
      // 2. Fetch Matatus
      const matatusRes = await fetch('/api/matatus');
      if (matatusRes.ok) {
        const matData = await matatusRes.json();
        setMatatus(matData);
      }
      
      // 3. Fetch Routes
      const routesRes = await fetch('/api/routes');
      if (routesRes.ok) {
        const routeData = await routesRes.json();
        setRoutes(routeData);
      }

      // 4. Fetch Crowd Reports
      const reportsRes = await fetch('/api/reports');
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setReports(reportsData);
      }
    } catch (err) {
      console.warn('Backend API loaded in limited offline simulation mode.', err);
      // Fallback data is automatically set or simulation is active
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 8000); // Poll every 8s for live coordinate updates from DB status
    return () => clearInterval(interval);
  }, []);

  // Client-side visual physics GPS simulation loop
  useEffect(() => {
    if (matatus.length === 0) return;
    const movementTimer = setInterval(() => {
      setMatatus(prev =>
        prev.map(mat => {
          if (mat.status !== 'Moving') return mat;
          const pathway = ROUTE_PATHWAYS[mat.routeNumber];
          if (!pathway) return mat;

          let nextIdx = mat.location.pathIndex;
          let nextDirection = mat.location.direction;

          if (nextDirection === 'outbound') {
            if (nextIdx < pathway.length - 1) {
              nextIdx++;
            } else {
              nextDirection = 'inbound';
              nextIdx--;
            }
          } else {
            if (nextIdx > 0) {
              nextIdx--;
            } else {
              nextDirection = 'outbound';
              nextIdx++;
            }
          }

          const targetPoint = pathway[nextIdx];
          const jitterX = (Math.random() - 0.5) * 1.0;
          const jitterY = (Math.random() - 0.5) * 1.0;

          return {
            ...mat,
            location: {
              x: Math.max(2, Math.min(98, targetPoint.x + jitterX)),
              y: Math.max(2, Math.min(98, targetPoint.y + jitterY)),
              pathIndex: nextIdx,
              direction: nextDirection as 'inbound' | 'outbound'
            },
            speed: Math.floor(40 + Math.random() * 32)
          };
        })
      );
    }, 4500);

    return () => clearInterval(movementTimer);
  }, [matatus.length]);

  // Handle post report
  const handlePostReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postSheng || !postStage) return;

    setSubmittingReport(true);
    // Simple autotranslation to English
    let autoTranslation = postEnglish;
    if (!autoTranslation) {
      autoTranslation = `Alert post for stage: ${postStage}. Status detail: ${postSheng}`;
    }

    const payload = {
      user: userSession?.name || postUser || 'Commuter_' + Math.floor(100 + Math.random() * 900),
      matatuName: selectedMatatu?.name || '',
      routeCode: selectedRoute?.routeCode || 'All',
      stageName: postStage,
      type: postType,
      shengText: postSheng,
      englishTranslation: autoTranslation
    };

    try {
      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newReport = await res.json();
        setReports(prev => [newReport, ...prev]);
        setPostSheng('');
        setPostEnglish('');
        setPostStage('');
        setPostUser('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingReport(false);
    }
  };

  // Upvote alert report
  const handleVote = async (reportId: string) => {
    try {
      const res = await fetch(`/api/reports/${reportId}/vote`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        setReports(prev =>
          prev.map(r => r.id === reportId ? { ...r, votes: data.votes } : r)
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger manual MySQL seed
  const handleManualSeed = async () => {
    if (!confirm('Are you sure you want to reset & populate database tables with standard Nairobi route models?')) return;
    try {
      const res = await fetch('/api/db-seed', { method: 'POST' });
      if (res.ok) {
        alert('MySQL database has been re-seeded successfully!');
        fetchData();
      } else {
        const data = await res.json();
        alert(`Error: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Seed execution failed: ${err.message}`);
    }
  };

  // Handle Ticketing checkout simulation
  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingMatatu || !mpesaPhone) return;

    setMpesaProcessing(true);
    
    // Simulate STK push wait
    setTimeout(async () => {
      const mpesaRefKey = 'MPESA_TX_' + Math.random().toString(36).substring(2, 9).toUpperCase();
      const payload = {
        matatuName: bookingMatatu.name,
        route: `Route ${bookingMatatu.routeNumber} (${bookingMatatu.routeName})`,
        farePaid: bookingMatatu.currentFare,
        boardingStage: selectedStage !== 'All' ? selectedStage : 'CBD Transit Box',
        destinationStage: bookingMatatu.routeName,
        seatNumber: selectedSeat,
        mpesaRef: mpesaRefKey
      };

      try {
        const res = await fetch('/api/tickets/book', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const pass = await res.json();
          setPurchasedTickets(prev => [pass, ...prev]);
          setSuccessTicket(pass);
          setBookingMatatu(null);
          setMpesaPhone('');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setMpesaProcessing(false);
      }
    }, 2200);
  };

  // Filters calculation
  const filteredMatatus = matatus.filter(mat => {
    // Stage Filter
    const matchesStage = selectedStage === 'All' || 
                         mat.routeName.toLowerCase().includes(selectedStage.toLowerCase()) || 
                         mat.routeName.toLowerCase().includes(selectedStage.toLowerCase()) ||
                         (ROUTE_PATHWAYS[mat.routeNumber]?.some(p => p.name.includes(selectedStage)));
    
    // Free search text filter
    const matchesSearch = !searchQuery || 
                          mat.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          mat.sacco.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mat.regNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          mat.routeNumber.includes(searchQuery);

    // Max fare
    const matchesFare = mat.currentFare <= maxFareLimit;

    return matchesStage && matchesSearch && matchesFare;
  });

  // Calculate cheapest route
  const cheapestRoute = routes.length > 0 
    ? [...routes].sort((a,b) => a.offPeakFare - b.offPeakFare)[0]
    : null;

  if (!userSession) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between py-12 relative overflow-hidden">
        {/* Glow elements */}
        <div className="absolute top-0 left-1/4 right-1/4 h-96 bg-blue-600/10 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-72 h-72 bg-blue-600/5 blur-[100px] pointer-events-none" />

        <div className="max-w-md w-full mx-auto px-6 z-10 flex-1 flex flex-col justify-center">
          {/* Logo Brand Header */}
          <div className="text-center mb-8 space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-3xl shadow-[0_0_25px_rgba(37,99,235,0.4)] mx-auto">
              <Compass strokeWidth={2.5} size={32} />
            </div>
            <div>
              <h1 className="text-4xl tracking-tight font-black text-white">
                Matatu<span className="italic text-blue-400">Tracker</span>
              </h1>
              <p className="text-xs text-slate-400 font-sans tracking-wider uppercase mt-1">Live Commuters Smart Grid • Kenya</p>
            </div>
          </div>

          {/* Form Box */}
          <div className="bg-slate-900/60 backdrop-blur-md border border-slate-900 rounded-3xl p-8 shadow-2xl relative">
            <h2 className="text-xl font-bold italic text-white text-center mb-6">
              {authMode === 'login' ? 'Welcome Back Commuter' : 'Create Commuter Profile'}
            </h2>

            {authError && (
              <div className="mb-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl p-3 text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4 font-mono text-xs">
              {authMode === 'signup' && (
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Moniker ID / Handle</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Shiko_Ngara"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600 font-sans"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="name@corridor.com"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600 font-sans"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600 font-sans"
                />
              </div>

              {/* Admin Conductor Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={authIsAdmin}
                    onChange={(e) => setAuthIsAdmin(e.target.checked)}
                    className="accent-blue-500 rounded border-slate-800 text-blue-500 focus:ring-0 focus:ring-offset-0"
                  />
                  <div>
                    <span className="text-xs text-slate-300 font-semibold block">Enable Conductor / Admin Mode</span>
                    <span className="text-[10px] text-slate-500 block leading-tight">Authorize database seeding, police updates, and fleet metrics panel</span>
                  </div>
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all mt-4 cursor-pointer shadow-lg shadow-blue-900/30"
              >
                {authMode === 'login' ? "Let's Board" : 'Register Profile'}
              </button>
            </form>

            {/* Switch mode */}
            <div className="mt-6 text-center text-xs">
              <span className="text-slate-500">
                {authMode === 'login' ? "Don't have a commuter account? " : "Already registered? "}
              </span>
              <button
                onClick={() => {
                  setAuthMode(authMode === 'login' ? 'signup' : 'login');
                  setAuthError('');
                }}
                className="text-blue-400 hover:underline font-bold"
              >
                {authMode === 'login' ? 'Register here' : 'Sign in here'}
              </button>
            </div>

            {/* Quick Presets for Demo */}
            <div className="mt-8 pt-6 border-t border-slate-900 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest text-center block">Or quick sign-in</span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handlePresetLogin('commuter')}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-[10px] font-mono transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-blue-400 font-bold">Commuter</span>
                  <span className="text-slate-500 text-[8px]">Brayo (Route 125)</span>
                </button>
                <button
                  onClick={() => handlePresetLogin('admin')}
                  className="bg-slate-950 hover:bg-slate-800 text-slate-300 p-2.5 rounded-xl border border-slate-800 hover:border-slate-700 text-[10px] font-mono transition-colors flex flex-col items-center justify-center gap-1 cursor-pointer"
                >
                  <span className="text-amber-400 font-bold">Conductor Admin</span>
                  <span className="text-slate-500 text-[8px]">Control Server Command</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Brand Footer */}
        <footer className="text-center text-slate-600 text-[10px] font-mono mt-8 z-10 px-6">
          <p>© 2026 Nairobi Intel Manyanga Network Transit System.</p>
          <p className="mt-1">Pristine layouts rendered in high-contrast cyberpunk and structured Plus Jakarta Sans display headings.</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white pb-16">
      
      {/* Top Gloss glow header */}
      <div className="absolute top-0 left-1/4 right-1/4 h-32 bg-blue-500/10 blur-[100px] pointer-events-none" />

      {/* Main Structural Navbar */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Logo & Headline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-[0_0_15px_rgba(37,99,235,0.4)]">
              <Compass strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-sans tracking-tight font-black text-white flex items-center gap-2">
                Matatu<span className="italic text-blue-400">Tracker</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-sans tracking-wider uppercase">Live Commuters Smart Grid • Kenya</p>
            </div>
          </div>

          {/* User Session Controller & Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            {/* User Details Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-800 text-xs font-mono bg-slate-900 bg-opacity-60">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-slate-200">@{userSession.name}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded ${userSession.isAdmin ? 'bg-amber-400/10 text-amber-300' : 'bg-blue-500/10 text-blue-400'}`}>
                {userSession.isAdmin ? '👑 ADMIN' : 'COMMUTER'}
              </span>
            </div>

            <button
              onClick={handleLogout}
              className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-700 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer"
            >
              Sign Out
            </button>

            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-mono bg-slate-900 ${
              dbStatus.connected ? 'border-blue-500/30 text-blue-400' : 'border-amber-500/30 text-amber-400'
            }`}>
              <Database size={13} />
              <span>Backend: {dbStatus.mode}</span>
              <span className={`w-2 h-2 rounded-full ${dbStatus.connected ? 'bg-blue-500 animate-pulse' : 'bg-amber-400 animate-pulse'}`} />
            </div>

            {dbStatus.connected && userSession.isAdmin && (
              <button 
                onClick={handleManualSeed}
                className="bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-850 hover:border-slate-700 px-3 py-1.5 rounded-full text-xs font-mono transition-all cursor-pointer flex items-center gap-1.5"
                title="Wipe & Reset tables to standard Route Seeds"
              >
                <RefreshCw size={12} />
                Seed Tables
              </button>
            )}
          </div>

        </div>
      </nav>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 mt-8 space-y-8">
        
        {/* Dynamic Multi-Tab Selector */}
        <div className="flex items-center border-b border-slate-900 pb-px gap-2">
          <button
            onClick={() => setActiveTab('tracker')}
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tracker' 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass size={14} />
            Live Tracker & Cheap Finder
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tickets' 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Ticket size={14} />
            My Boarding Passes ({purchasedTickets.length})
          </button>
          <button
            onClick={() => setActiveTab('sheng-alerts')}
            className={`px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sheng-alerts' 
                ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Radio size={14} />
            commuters sheng alerts
          </button>
        </div>

        {/* Tab 1: Tracker & Selector */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column (8-cols): Interactive Live Canvas Map & Filters */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Map Component */}
              <NairobiMap 
                matatus={filteredMatatus}
                selectedMatatu={selectedMatatu}
                onSelectMatatu={(m) => {
                  setSelectedMatatu(m);
                  // Auto highlight matching route code
                  const matchR = routes.find(r => r.routeCode === m.routeNumber);
                  if (matchR) setSelectedRoute(matchR);
                }}
                selectedRoute={selectedRoute}
              />

              {/* Advanced Filter Box */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6" id="dashboard-filtering">
                <h3 className="text-sm font-bold font-sans text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                  <Layers size={14} className="text-slate-400" />
                  Commute Radar Parameters
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Select Nearest Stage */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-2 uppercase tracking-wide">Nearest Stage (Locate Close)</label>
                    <select
                      value={selectedStage}
                      onChange={(e) => setSelectedStage(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 appearance-none cursor-pointer"
                    >
                      <option value="All">All Nairobi stages (Global)</option>
                      <option value="CBD">CBD Transit Terminals</option>
                      <option value="Nyayo">Nyayo Stadium Stage</option>
                      <option value="Westlands">Westlands Flyover</option>
                      <option value="Roysambu">Thika Road Roysambu</option>
                      <option value="Galleria">Galleria Mall (Langata Road)</option>
                      <option value="Githurai">Githurai Stage</option>
                      <option value="Rongai">Rongai Town Terminal</option>
                    </select>
                  </div>

                  {/* Search Query */}
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block mb-2 uppercase tracking-wide">Search Name / Sacco / Route</label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-slate-500">
                        <Search size={13} />
                      </span>
                      <input
                        type="text"
                        placeholder="e.g. Catalyst, Super Metro, 45..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500/60"
                      />
                    </div>
                  </div>

                  {/* Price budget slider */}
                  <div>
                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400 mb-2 uppercase tracking-wide">
                      <span>Max Fare Cap</span>
                      <span className="text-sky-400 font-bold">KES {maxFareLimit}</span>
                    </div>
                    <input
                      type="range"
                      min="30"
                      max="160"
                      step="10"
                      value={maxFareLimit}
                      onChange={(e) => setMaxFareLimit(Number(e.target.value))}
                      className="w-full accent-blue-500 h-1 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
                      <span>30 bob</span>
                      <span>160 bob</span>
                    </div>
                  </div>

                </div>

                {/* Grid of matched manyangas */}
                <div className="mt-6 pt-6 border-t border-slate-900">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-xs font-mono uppercase text-slate-400">
                      Matched Minibuses ({filteredMatatus.length} active)
                    </h4>
                    {selectedStage !== 'All' && (
                      <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/20 px-2 rounded-full py-0.5">
                        Selected: Close to {selectedStage}
                      </span>
                    )}
                  </div>

                  {filteredMatatus.length === 0 ? (
                    <div className="text-center py-6 bg-slate-950/20 border border-slate-900 rounded-2xl">
                      <p className="text-slate-500 text-xs font-mono">No active matatus matched your filters. Adjust budget or search terms.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredMatatus.map((mat) => {
                        const isSelect = selectedMatatu?.id === mat.id;
                        return (
                          <div 
                            key={mat.id}
                            onClick={() => {
                              setSelectedMatatu(mat);
                              const matchR = routes.find(r => r.routeCode === mat.routeNumber);
                              if (matchR) setSelectedRoute(matchR);
                            }}
                            className={`p-3.5 rounded-2xl border transition-all duration-300 cursor-pointer flex justify-between items-center ${
                              isSelect 
                                ? 'bg-slate-950 border-blue-500/60 shadow-[0_0_15px_rgba(37,99,235,0.05)]' 
                                : 'bg-slate-950/30 border-slate-900 hover:border-slate-800 hover:bg-slate-950/60'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                                style={{ 
                                  backgroundColor: `${mat.vibe.neonColor}10`,
                                  color: mat.vibe.neonColor,
                                  border: `1px solid ${mat.vibe.neonColor}30`
                                }}
                              >
                                {mat.routeNumber}
                              </div>
                              <div>
                                <h5 className="text-white text-xs font-bold flex items-center gap-1.5">
                                  {mat.name}
                                  <span className="text-[9px] text-slate-400 font-mono font-normal">({mat.sacco})</span>
                                </h5>
                                <p className="text-slate-500 text-[10px] font-mono">To: {mat.routeName}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-1">
                              <span className="text-sky-400 font-bold text-xs">KES {mat.currentFare}</span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBookingMatatu(mat);
                                }}
                                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[9px] px-2.5 py-1 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
                              >
                                Book Seat
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>

            </div>

            {/* Right Column (4-cols): Cheapest Routes & Hacks / Tips */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Route Finder Selector */}
              <RouteFinder 
                selectedRoute={selectedRoute}
                onRouteSelect={(route) => setSelectedRoute(route)}
              />

              {/* Cheapest Fare Live Highlights Panel */}
              <div className="bg-gradient-to-br from-blue-500/5 to-slate-900 border border-blue-500/10 rounded-3xl p-6" id="cheapest-corridor-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
                    <Tag size={16} />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 font-mono uppercase tracking-widest block">Cheapest commuter rate</span>
                    <h3 className="font-sans italic text-white text-base">Nairobi Lowest Off-Peak Rates</h3>
                  </div>
                </div>

                {cheapestRoute && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center bg-slate-950/80 p-3 rounded-2xl border border-slate-900">
                      <div>
                        <span className="text-xs font-extrabold text-slate-100 flex items-center gap-1.5">
                          Route {cheapestRoute.routeCode} ({cheapestRoute.to})
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Standard distance: {cheapestRoute.distanceKm} km</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-mono block">Lowest Fare</span>
                        <span className="text-lg font-black text-blue-400 font-mono">KES {cheapestRoute.offPeakFare}</span>
                      </div>
                    </div>
                    <p className="text-slate-400 text-xs font-sans leading-relaxed">
                      💡 Commute with <strong>{cheapestRoute.primarySaccos.join(' or ')}</strong> between 10:00 AM and 3:30 PM to claim the cheap rate bypass. Standard peak fares normally hit KES {cheapestRoute.peakFare}.
                    </p>
                  </div>
                )}
              </div>

              {/* Informative Stage/Tip Guide list */}
              <div className="bg-slate-900/20 border border-slate-900 rounded-3xl p-6 space-y-4">
                <h3 className="text-xs font-bold text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle size={14} className="text-slate-500" />
                  Street-Smart Commuting Guide
                </h3>
                <div className="space-y-3.5 max-h-[290px] overflow-y-auto pr-1">
                  {GENERAL_TIPS.map((tip, idx) => (
                    <div key={idx} className="bg-slate-950/50 p-4 border border-slate-900 rounded-2xl">
                      <h4 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5 font-sans">
                        <span className="text-blue-400 font-mono">0{idx + 1}.</span>
                        {tip.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed whitespace-pre-line font-mono">{tip.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Boarding Tickets & In-Iframe passes */}
        {activeTab === 'tickets' && (
          <div className="max-w-3xl mx-auto space-y-6">
            
            <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-sans text-white font-bold italic tracking-tight">Active Nairobi Boarding Passes</h2>
                  <p className="text-slate-400 text-xs font-mono">Pristine digital copies of tickets booked securely via simulated paybill transaction.</p>
                </div>
                <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
                  <Ticket size={24} />
                </div>
              </div>

              {purchasedTickets.length === 0 ? (
                <div className="text-center py-16 border border-dashed border-slate-800 rounded-2xl bg-slate-950/40 space-y-3">
                  <p className="text-slate-400 text-sm font-mono">No tickets booked in this session.</p>
                  <p className="text-slate-500 text-xs font-sans max-w-md mx-auto">Explore the direct live minimap on the first tab, select any minibuses (manyangas) and tap "Book Seat" to experience cashless boarding.</p>
                  <button 
                    onClick={() => setActiveTab('tracker')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors cursor-pointer"
                  >
                    Go to live map
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {purchasedTickets.map((pass) => (
                    <div 
                      key={pass.ticketId}
                      className="bg-slate-950 border border-indigo-500/20 rounded-2xl overflow-hidden shadow-2xl"
                    >
                      {/* Ticket Header */}
                      <div className="bg-indigo-500/10 border-b border-indigo-500/20 px-5 py-3.5 flex justify-between items-center font-mono text-xs">
                        <span className="text-indigo-400 font-bold">{pass.ticketId}</span>
                        <span className="text-indigo-300">CONFIRMED • KES {pass.farePaid}</span>
                      </div>

                      {/* Ticket Body details */}
                      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Transit Manyanga</span>
                          <span className="font-bold text-white text-sm flex items-center gap-1.5">
                            <Bus size={14} className="text-blue-400" />
                            {pass.matatuName}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block font-bold">Route Grid</span>
                          <span className="text-slate-200 text-xs">{pass.route}</span>
                        </div>
                        <div className="space-y-1">
                          <span className="text-[10px] text-slate-500 uppercase font-mono block">Assigned Seat</span>
                          <span className="text-blue-400 font-mono font-bold text-xs bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">{pass.seatNumber}</span>
                        </div>
                      </div>

                      {/* Decal divider strip */}
                      <div className="flex items-center justify-between px-3">
                        <div className="w-4 h-4 bg-slate-900 rounded-full -ml-5" />
                        <div className="border-t border-dashed border-slate-800/80 flex-1 mx-2" />
                        <div className="w-4 h-4 bg-slate-900 rounded-full -mr-5" />
                      </div>

                      <div className="px-5 py-4 bg-slate-900/20 flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-mono">
                        <div>
                          <span className="text-slate-500 font-normal block text-[9px] uppercase">M-PESA REF</span>
                          <span className="text-amber-400 font-bold select-all">{pass.mpesaRef} (Simulated)</span>
                        </div>
                        <div>
                          <span className="text-slate-500 font-normal block text-[9px] uppercase text-right">BOOKING TIME</span>
                          <span className="text-slate-300 text-right block">{pass.timestamp}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>
        )}

        {/* Tab 3: Sheng Live Commuter Forum */}
        {activeTab === 'sheng-alerts' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Box (7-cols): Dynamic feeds */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-sans text-white font-bold italic tracking-tight">Crowdsourced Sheng Commuter Feeds</h2>
                    <p className="text-slate-400 text-xs font-mono">Fresh commuter updates reported directly in authentic Sheng language from Nairobi roads.</p>
                  </div>
                  <Radio size={20} className="text-rose-500 animate-pulse" />
                </div>

                <div className="space-y-4 mt-6">
                  {reports.map((rep) => {
                    let badgeColor = "bg-slate-900 text-slate-300 border-slate-800";
                    if (rep.type === 'traffic') badgeColor = "bg-rose-500/10 text-rose-400 border-rose-500/20";
                    if (rep.type === 'fare_drop') badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                    if (rep.type === 'fare_spike') badgeColor = "bg-amber-500/10 text-amber-400 border-amber-500/20";
                    if (rep.type === 'police_crackdown') badgeColor = "bg-red-500/10 text-red-400 border-red-500/20";

                    return (
                      <div 
                        key={rep.id}
                        className="bg-slate-950/60 p-4 border border-slate-900 rounded-2xl hover:border-slate-800 transition-all space-y-3"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 bg-slate-700 rounded-full" />
                            <span className="text-white font-bold text-xs">{rep.user}</span>
                            <span className="text-slate-500 font-mono text-[9px]">{rep.timestamp}</span>
                          </div>
                          <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                            {rep.type}
                          </span>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-200 font-sans tracking-wide">
                            "{rep.shengText}"
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 italic font-mono leading-relaxed bg-slate-900/40 p-2.5 rounded-lg border border-slate-900">
                            Translate: {rep.englishTranslation}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-slate-900/60 text-[10px] font-mono text-slate-500">
                          <span>Stage: <strong className="text-slate-300">{rep.stageName}</strong> {rep.routeCode !== 'All' && `• Route R_${rep.routeCode}`}</span>
                          <button 
                            onClick={() => handleVote(rep.id)}
                            className="bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1 rounded-full border border-slate-800 flex items-center gap-1 hover:text-blue-400 transition-colors cursor-pointer"
                          >
                            👍 Upvote ({rep.votes})
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Box (5-cols): Form to post report */}
            <div className="lg:col-span-5">
              <div className="bg-slate-900/40 border border-slate-900 rounded-3xl p-6 sticky top-24">
                <h3 className="text-sm font-bold font-mono uppercase tracking-wider mb-2 text-white">Broadcast Live Commuter Alert</h3>
                <p className="text-xs text-slate-400 mb-4">Provide street info to help others avoid jams or save money.</p>

                <form onSubmit={handlePostReport} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Your Commuter Moniker (Nickname)</label>
                    <input
                      type="text"
                      placeholder="e.g. OtienoCommuts, Shiko_K"
                      value={postUser}
                      onChange={(e) => setPostUser(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Stage Location</label>
                      <input
                        type="text"
                        placeholder="e.g. Roysambu, Westlands"
                        required
                        value={postStage}
                        onChange={(e) => setPostStage(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Alert Category</label>
                      <select
                        value={postType}
                        onChange={(e) => setPostType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500/60 appearance-none cursor-pointer"
                      >
                        <option value="general">Regular Alert</option>
                        <option value="traffic">Traffic Jams</option>
                        <option value="fare_drop">Fare Discount Drop</option>
                        <option value="fare_spike">Fare Surge Hike</option>
                        <option value="police_crackdown">Police Patrols</option>
                        <option value="heavy_rain">Heavy Rains</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">Your Sheng Update (Authentic Street Sheng)</label>
                    <textarea
                      placeholder="e.g. Super Metro imeshuka bei fika 50 bob hapa Roysambu..."
                      rows={3}
                      required
                      value={postSheng}
                      onChange={(e) => setPostSheng(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">English Translation (For other commuters)</label>
                    <textarea
                      placeholder="e.g. Super Metro fare has dropped to 50 bob at Roysambu due to offpeak hours."
                      rows={2}
                      value={postEnglish}
                      onChange={(e) => setPostEnglish(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submittingReport}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-900/30"
                  >
                    <Send size={13} />
                    {submittingReport ? 'Publishing Alert...' : 'Broadcast live warning'}
                  </button>

                </form>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Booking Dialog Modal overlay */}
      <AnimatePresence>
        {bookingMatatu && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              <button 
                onClick={() => setBookingMatatu(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 font-bold p-1 cursor-pointer"
              >
                ✕
              </button>

              <h3 className="font-sans italic text-xl text-white font-bold mb-1">
                Seat Booking: {bookingMatatu.name}
              </h3>
              <p className="text-slate-400 text-xs mb-4">
                Sacco: {bookingMatatu.sacco} • Route {bookingMatatu.routeNumber} ({bookingMatatu.routeName})
              </p>

              <form onSubmit={handleBookTicket} className="space-y-4">
                {/* Select seat */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-2">Select commuter seat</label>
                  <div className="grid grid-cols-4 gap-2 text-center text-[11px]">
                    {['S-1', 'S-2', 'S-3 (Win)', 'S-4', 'S-5', 'S-6 (Win)', 'VIP-1', 'VIP-2'].map(seat => {
                      const isSelectedSeat = selectedSeat === seat;
                      return (
                        <div
                          key={seat}
                          onClick={() => setSelectedSeat(seat)}
                          className={`p-2 rounded-xl border font-mono cursor-pointer transition-all ${
                            isSelectedSeat 
                              ? 'bg-blue-600 text-white border-blue-500 font-bold shadow-md'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {seat}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Simulated MPESA phone input */}
                <div>
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">M-PESA checkout phone number</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 font-mono text-xs">+254</span>
                    <input
                      type="tel"
                      required
                      placeholder="712345678"
                      value={mpesaPhone}
                      onChange={(e) => setMpesaPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500/60 placeholder-slate-600"
                    />
                  </div>
                  <span className="text-[9px] text-slate-500 font-mono mt-1 block">A simulated STK checkout push request will be triggered for KES {bookingMatatu.currentFare}.</span>
                </div>

                <div className="bg-slate-950 border border-slate-800 p-3 rounded-2xl flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">Commuter Sacco fare:</span>
                  <span className="text-sky-450 text-sky-400 font-bold">KES {bookingMatatu.currentFare}</span>
                </div>

                <button
                  type="submit"
                  disabled={mpesaProcessing}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-900/30"
                >
                  {mpesaProcessing ? (
                    <span className="flex items-center gap-1.5">
                      <span className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      Awaiting Payment Confirmation...
                    </span>
                  ) : (
                    <span>Confirm simulated booking</span>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Ticket Success Confirmation Overlay Modal */}
      <AnimatePresence>
        {successTicket && (
          <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-blue-500/20 rounded-3xl p-6 w-full max-sm shadow-2xl space-y-4"
            >
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mx-auto border border-blue-500/20">
                  <CheckCircle size={28} />
                </div>
                <h3 className="font-sans text-white font-bold text-lg italic">Cashless Boarding Confirmed!</h3>
                <p className="text-slate-400 text-[11px] leading-relaxed">Your digital boarding pass has been registered on our live commuters transit grid.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2.5 text-[11px] font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">TICKET:</span>
                  <span className="text-white font-bold">{successTicket.ticketId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">BUS:</span>
                  <span className="text-white font-bold">{successTicket.matatuName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">SEAT:</span>
                  <span className="text-sky-400 font-bold">{successTicket.seatNumber}</span>
                </div>
                <div className="flex justify-between border-t border-slate-900 pt-2 text-xs">
                  <span className="text-slate-500Label">FARE PAID:</span>
                  <span className="text-sky-400 font-extrabold font-mono">KES {successTicket.farePaid}</span>
                </div>
              </div>

              <div className="text-center">
                <p className="text-[9px] text-indigo-400 bg-indigo-500/5 py-1 px-2 rounded font-mono border border-indigo-500/10">Show this screen to the Manyanga conductor before boarding.</p>
                <button
                  onClick={() => {
                    setSuccessTicket(null);
                    setActiveTab('tickets');
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 mt-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  View My Tickets
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Small design-focused footer */}
      <footer className="max-w-7xl mx-auto px-6 mt-16 text-center text-slate-600 text-[11px] font-mono border-t border-slate-900/60 pt-8">
        <p>© 2026 Nairobi Intel Manyanga Network Transit System. All Rights Reserved.</p>
        <p className="mt-1">Pristine layouts rendered in high-contrast cyberpunk and structured Plus Jakarta Sans display headings.</p>
      </footer>

    </div>
  );
}

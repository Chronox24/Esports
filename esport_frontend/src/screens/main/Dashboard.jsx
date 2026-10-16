import React, { useState, useEffect } from 'react';
import { apiFetch } from '../../utils/api';

const IconTrophy = () => (  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />  </svg>);

const IconUsers = () => (  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />  </svg>);

const IconCrosshair = () => (  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 22v-4m0-12V2m10 10h-4M6 12H2m13.414 7.414l-2.828-2.828M6.414 6.414l2.828 2.828m8.486 0l-2.828 2.828M6.414 17.586l2.828-2.828" />  </svg>);

const IconGlobe = () => (  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />  </svg>);

const IconPlay = () => (  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">    <path d="M8 5v14l11-7z" />  </svg>);

const IconFacebook = () => (  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/>  </svg>);

const IconYoutube = () => (  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">    <path d="M21.582 6.186a2.651 2.651 0 00-1.868-1.874c-1.646-.443-8.24-.443-8.24-.443s-6.594 0-8.24.443a2.651 2.651 0 00-1.868 1.874c-.44 1.649-.44 5.093-.44 5.093s0 3.444.44 5.093a2.652 2.652 0 001.868 1.874c1.646.443 8.24.443 8.24.443s6.594 0 8.24-.443a2.652 2.652 0 001.868-1.874c.44-1.649.44-5.093.44-5.093s0-3.444-.44-5.093zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>  </svg>);

const IconChevron = () => (  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />  </svg>);

const roleBadge = (role) => {  
  const s = {    
    'Duelist':   'text-red-300 bg-red-500/10 border-red-500/20',    
    'Initiator': 'text-yellow-300 bg-yellow-500/10 border-yellow-500/20',    
    'Controller':'text-purple-300 bg-purple-500/10 border-purple-500/20',    
    'Sentinel':  'text-cyan-300 bg-cyan-500/10 border-cyan-500/20',    
    'Sniper':    'text-emerald-300 bg-emerald-500/10 border-emerald-500/20',    
    'Assaulter': 'text-orange-300 bg-orange-500/10 border-orange-500/20',    
    'Lurker':    'text-indigo-300 bg-indigo-500/10 border-indigo-500/20',    
    'Support':   'text-blue-300 bg-blue-500/10 border-blue-500/20',    
    'Flex':      'text-pink-300 bg-pink-500/10 border-pink-500/20',  
  };  
  return s[role] || 'text-theme-text-base bg-gray-500/10 border-gray-500/20';
};

const db = {  
  valorant: {    
    label: 'VALORANT',    
    accent: '#06b6d4',    
    accentAlt: '#3b82f6',    
    timerSeconds: 225301,    
    kpis: [      
      { title: 'VCT Tournaments', icon: 'globe', stats: [{ label: 'Active', value: '3' }, { label: 'Upcoming', value: '12' }] },      
      { title: 'Valorant Players', icon: 'users', stats: [{ label: 'Registered', value: '18,250' }, { label: 'Active', value: '6,400' }] },      
      { title: 'Total Teams', icon: 'crosshair', stats: [{ label: 'Verified', value: '450' }, { label: 'Amateur', value: '1,800' }] },      
    ],    
    liveMatch: { team1: 'PRX', team2: 'SEN', score: '7 – 9', map: 'Sunset', status: 'LIVE' },    
    standings: [      
      { t1: 'PRX', t2: 'SEN', score: '7 – 9', map: 'Map 2: Sunset', live: true },      
      { t1: 'FNC', t2: 'DRX', score: '0 – 1', map: 'Map 1: Ascent', live: true },      
      { t1: 'LOUD', t2: 'NRG', score: '13 – 7', map: 'Match Finished', live: false },    
    ],    
    stats: [      
      { rank: 1, name: 'PRX.Jinggg', kd: 1.8, wl: '12 / 3', dmg: '45k', role: 'Duelist' },      
      { rank: 2, name: 'DRX.MaKo', kd: 1.7, wl: '11 / 4', dmg: '38k', role: 'Controller' },      
      { rank: 3, name: 'ZETA.Laz', kd: 1.6, wl: '10 / 5', dmg: '35k', role: 'Sentinel' },      
      { rank: 4, name: 'PRX.Forsaken', kd: 1.5, wl: '9 / 3', dmg: '32k', role: 'Flex' },      
      { rank: 5, name: 'T1.Sayaplayer', kd: 1.45, wl: '8 / 4', dmg: '30k', role: 'Duelist' },      
      { rank: 6, name: 'GEN.Meteor', kd: 1.4, wl: '8 / 5', dmg: '28k', role: 'Duelist' },      
      { rank: 7, name: 'TS.Invy', kd: 1.35, wl: '7 / 5', dmg: '25k', role: 'Initiator' },      
      { rank: 8, name: 'RRQ.Lmemore', kd: 1.3, wl: '6 / 6', dmg: '22k', role: 'Sentinel' },    
    ],  
  },  
  crossfire: {    
    label: 'CROSSFIRE',    
    accent: '#f59e0b',    
    accentAlt: '#ef4444',    
    timerSeconds: 86400,    
    kpis: [      
      { title: 'CFS Tournaments', icon: 'globe', stats: [{ label: 'Active', value: '1' }, { label: 'Upcoming', value: '4' }] },      
      { title: 'Crossfire Players', icon: 'users', stats: [{ label: 'Registered', value: '45,120' }, { label: 'Active', value: '12,300' }] },      
      { title: 'Clan Rosters', icon: 'crosshair', stats: [{ label: 'Verified', value: '890' }, { label: 'Amateur', value: '3,200' }] },      
    ],    
    liveMatch: { team1: 'ALL GAMERS', team2: 'BAISHA', score: '5 – 3', map: 'Black Widow', status: 'LIVE' },    
    standings: [      
      { t1: 'AG', t2: 'BS', score: '5 – 3', map: 'Map 1: Black Widow', live: true },      
      { t1: 'VG', t2: 'SV', score: '9 – 9', map: 'Map 3: Port', live: true },      
      { t1: 'PM', t2: 'EXE', score: '10 – 4', map: 'Match Finished', live: false },    
    ],    
    stats: [      
      { rank: 1, name: 'AG.Even', kd: 2.1, wl: '18 / 2', dmg: '55k', role: 'Assaulter' },      
      { rank: 2, name: 'BS.N9', kd: 1.9, wl: '16 / 4', dmg: '48k', role: 'Sniper' },      
      { rank: 3, name: 'VG.Mzi', kd: 1.5, wl: '12 / 5', dmg: '38k', role: 'Support' },      
      { rank: 4, name: 'AG.ZY', kd: 1.4, wl: '11 / 6', dmg: '35k', role: 'Lurker' },      
      { rank: 5, name: 'BS.baby', kd: 1.35, wl: '10 / 5', dmg: '32k', role: 'Assaulter' },      
      { rank: 6, name: 'EP.First', kd: 1.3, wl: '9 / 6', dmg: '30k', role: 'Sniper' },      
      { rank: 7, name: 'KZ.Lsn', kd: 1.25, wl: '8 / 7', dmg: '28k', role: 'Support' },      
      { rank: 8, name: 'AG.Doo', kd: 1.2, wl: '8 / 8', dmg: '25k', role: 'Assaulter' },    
    ],  
  },
};

const KpiCard = ({ card, accent, onClick }) => {  
  const icons = { globe: <IconGlobe />, users: <IconUsers />, crosshair: <IconCrosshair />, trophy: <IconTrophy /> };  
  return (    
    <div onClick={() => onClick(card)} className="cursor-pointer bg-bg-200 rounded-2xl border border-slate-800/60 flex flex-col hover:border-slate-700/60 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] transition-all duration-300 group relative overflow-hidden" style={{ padding: '32px', gap: '24px' }}>      
      {}      <div className="absolute -right-6 -top-6 w-20 h-20 rounded-full blur-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-500" style={{ backgroundColor: accent }} />      
      {}      <div className="flex items-start justify-between gap-3 relative z-10">        
        <h3 className="text-[11px] font-bold text-theme-text-muted uppercase tracking-widest leading-tight">{card.title}</h3>        
        <div className="rounded-xl bg-white/5 border border-white/10 shrink-0" style={{ color: accent, padding: '8px' }}>          
          {icons[card.icon]}        
        </div>      
      </div>      
      {}      <div className="grid grid-cols-2 relative z-10" style={{ gap: '24px' }}>        
        {card.stats.map((s, i) => (          
          <div key={i} className="flex flex-col gap-1">            
            <span className="text-[10px] text-theme-text-muted uppercase tracking-wider font-semibold">{s.label}</span>            
            <span className="text-xl font-black text-theme-text-base">{s.value}</span>          
          </div>        
        ))}      
      </div>      
      {}      <div className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-700 rounded-b-2xl" style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />    
    </div>  
  );
};

const KpiModal = ({ card, accent, onClose }) => {  
  if (!card) return null;  
  return (    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-200" style={{ padding: '16px' }} onClick={onClose}>      
      <div className="bg-bg-200 border border-slate-700/60 rounded-2xl w-full max-w-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex flex-col animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>        
        <div className="border-b border-slate-800/60 flex items-center justify-between bg-slate-900/30" style={{ padding: '20px 24px' }}>          
          <div className="flex items-center gap-3">            
            <div className="w-1 h-6 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}80` }} />            
            <h2 className="text-lg font-black uppercase tracking-widest text-theme-text-base">{card.title} Details</h2>          
          </div>          
          <button onClick={onClose} className="text-theme-text-muted hover:text-theme-text-base rounded-lg hover:bg-white/10 transition-colors" style={{ padding: '8px' }}>            
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>          
          </button>        
        </div>        
        <div style={{ padding: '24px' }}>          
          <div className="grid grid-cols-2 gap-4 mb-6">            
            {card.stats.map((s, i) => (              
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl flex flex-col gap-1" style={{ padding: '16px' }}>                
                <span className="text-[10px] text-theme-text-muted uppercase tracking-widest font-bold">{s.label}</span>                
                <span className="text-2xl font-black text-theme-text-base">{s.value}</span>              
              </div>            
            ))}          
          </div>          
          <div className="bg-bg-200 border border-slate-800 rounded-xl" style={{ padding: '20px' }}>            
            <h4 className="text-xs font-black uppercase tracking-widest text-theme-text-muted mb-4">Detailed Breakdown</h4>            
            <div className="space-y-3">              
              {[1, 2, 3].map(i => (                
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors border border-transparent hover:border-slate-700" style={{ padding: '12px' }}>                  
                  <div className="flex items-center gap-3">                    
                    <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center text-xs font-bold" style={{ color: accent }}>{i}</div>                    
                    <div className="text-sm font-bold text-theme-text-base">Data Entry Point {i}</div>                  
                  </div>                  
                  <div className="text-sm font-mono text-theme-text-muted">+{(Math.random() * 100).toFixed(1)}%</div>                
                </div>              
              ))}            
            </div>          
          </div>        
        </div>      
      </div>    
    </div>  
  );
};

const MatchRow = ({ match, accent }) => (  
  <div className="flex items-center justify-between bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 rounded-xl transition-all cursor-pointer group" style={{ padding: '12px 16px' }}>    
    <div className="flex items-center gap-3 min-w-0 flex-1">      
      <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-theme-text-base shrink-0">{match.t1[0]}</div>      
      <div className="min-w-0">        
        <div className="text-sm font-bold text-theme-text-base truncate">{match.t1} <span className="text-theme-text-muted font-normal">vs</span> {match.t2}</div>        
        <div className="text-[10px] text-theme-text-muted truncate">{match.map}</div>      
      </div>    
    </div>    
    <div className="flex items-center gap-3 shrink-0 pl-3">      
      <div className="text-base font-black text-theme-text-base">{match.score}</div>      
      {match.live ? (        
        <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">          
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />          
          <span className="text-[9px] font-black text-red-400">LIVE</span>        
        </div>      
      ) : (        
        <span className="text-[9px] font-bold text-theme-text-muted bg-white/5 border border-white/5 rounded-full px-2 py-0.5">FIN</span>      )}    
    </div>  
  </div>
);

const TimerBlock = ({ label, value }) => (  
  <div className="flex flex-col items-center gap-1">    
    <div className="text-2xl md:text-3xl font-mono font-black text-theme-text-base">{value}</div>    
    <div className="text-[9px] text-theme-text-muted uppercase tracking-widest font-bold">{label}</div>  
  </div>
);

const LeaderboardOverviewModal = ({ isOpen, onClose, data, player, accent }) => {  
  if (!isOpen) return null;  
  return (    
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md animate-in fade-in duration-200" style={{ padding: '16px' }} onClick={onClose}>      
      <div className="bg-bg-200 border border-slate-700/60 rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>        
        {}        <div className="border-b border-slate-800/60 flex items-center justify-between bg-slate-900/30 shrink-0" style={{ padding: '20px 24px' }}>          
          <div className="flex items-center gap-4">            
            {player ? (              
              <div className="w-12 h-12 rounded-lg bg-bg-300 border-2 shadow-lg flex items-center justify-center text-xl font-black text-theme-text-base" style={{ borderColor: accent }}>                
                {player.name.split('.')[0]?.[0] || 'P'}              
              </div>            
            ) : (              
              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: accent, boxShadow: `0 0 10px ${accent}80` }} />            
            )}            
            <div>              
              <h2 className="text-xl font-black uppercase tracking-widest text-theme-text-base drop-shadow-md">                
                {player ? `${player.name} Profile` : 'Full Leaderboard Stats'}              
              </h2>              
              <p className="text-[10px] font-bold tracking-widest text-theme-text-muted uppercase mt-1">                
                {player ? `Rank #${player.rank} — ${player.role}` : 'Season Performance Overview'}              
              </p>            
            </div>          
          </div>          
          <button onClick={onClose} className="text-theme-text-muted hover:text-theme-text-base rounded-lg hover:bg-white/10 transition-colors" style={{ padding: '8px' }}>            
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>          
          </button>        
        </div>        
        {}        <div className="flex-1 overflow-y-auto custom-scrollbar" style={{ padding: '24px' }}>          
          {player ? (            
            <div className="grid grid-cols-2 gap-6">              
              <div className="space-y-4">                
                <div className="bg-bg-300 border border-slate-800 rounded-xl" style={{ padding: '20px' }}>                  
                  <h3 className="text-[10px] font-black tracking-widest text-theme-text-muted uppercase mb-4">Combat Overview</h3>                  
                  <div className="space-y-3">                    
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-theme-text-muted">K/D Ratio</span><span className="text-xl font-black text-theme-text-base" style={{ color: accent }}>{player.kd}</span></div>                    
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-theme-text-muted">Win / Loss</span><span className="text-lg font-black text-theme-text-base">{player.wl}</span></div>                    
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-theme-text-muted">Total Damage</span><span className="text-lg font-black text-theme-text-base">{player.dmg}</span></div>                  
                  </div>                
                </div>              
              </div>              
              <div className="space-y-4">                
                <div className="bg-bg-300 border border-slate-800 rounded-xl h-full" style={{ padding: '20px' }}>                  
                  <h3 className="text-[10px] font-black tracking-widest text-theme-text-muted uppercase mb-4">Advanced Metrics</h3>                  
                  <div className="space-y-3">                    
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-theme-text-muted">Kill per Round</span><span className="text-lg font-black text-theme-text-base">{(player.kd * 0.7).toFixed(2)}</span></div>                    
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-theme-text-muted">Survive Rate</span><span className="text-lg font-black text-theme-text-base">62%</span></div>                    
                    <div className="flex justify-between items-center"><span className="text-sm font-bold text-theme-text-muted">Headshot %</span><span className="text-lg font-black text-theme-text-base">45%</span></div>                  
                  </div>                
                </div>              
              </div>            
            </div>          
          ) : (            
            <div className="bg-bg-300 rounded-xl border border-slate-800 overflow-hidden">              
              <table className="w-full text-left">                
                <thead className="bg-bg-400 text-[10px] uppercase tracking-widest text-theme-text-muted border-b border-slate-800">                  
                  <tr>                    
                    <th className="font-bold" style={{ padding: '16px 24px' }}>Rank</th>                    
                    <th className="font-bold" style={{ padding: '16px 24px' }}>Player</th>                    
                    <th className="font-bold" style={{ padding: '16px 24px' }}>Avg K/D</th>                    
                    <th className="font-bold" style={{ padding: '16px 24px' }}>W/L</th>                    
                    <th className="font-bold" style={{ padding: '16px 24px' }}>Damage</th>                    
                    <th className="font-bold text-right" style={{ padding: '16px 24px' }}>Role</th>                  
                  </tr>                
                </thead>                
                <tbody className="divide-y divide-slate-800/50">                  
                  {data.stats.map((s, i) => (                    
                    <tr key={i} className="hover:bg-white/[0.03] transition-colors">                      
                      <td className="text-theme-text-muted font-mono font-bold text-base" style={{ padding: '16px 24px' }}><span className="opacity-50">#</span>{s.rank}</td>                      
                      <td className="font-bold text-theme-text-base" style={{ padding: '16px 24px' }}>{s.name}</td>                      
                      <td className="font-black" style={{ color: accent, padding: '16px 24px' }}>{s.kd}</td>                      
                      <td className="text-theme-text-base font-medium text-sm" style={{ padding: '16px 24px' }}>{s.wl}</td>                      
                      <td className="text-theme-text-base font-bold text-sm" style={{ padding: '16px 24px' }}>{s.dmg}</td>                      
                      <td className="text-right" style={{ padding: '16px 24px' }}>                        
                        <span className="inline-block text-[10px] font-bold rounded-full border border-slate-600 tracking-widest uppercase" style={{ padding: '6px 12px' }}>{s.role}</span>                      
                      </td>                    
                    </tr>                  
                  ))}                
                </tbody>              
              </table>            
            </div>          
          )}        
        </div>      
      </div>    
    </div>  
  );
};

const Dashboard = ({ globalGame, globalTournament }) => {
  const activeGame = (globalGame || 'valorant').toLowerCase();
  const data = db[activeGame];
  const [dbMatches, setDbMatches] = useState([]);
  const [kpiData, setKpiData] = useState(data.kpis);
  const [playerStats, setPlayerStats] = useState([]);
  const [customStreamUrl, setCustomStreamUrl] = useState('');
  const [isStreamLive, setIsStreamLive] = useState(false);

  const getYouTubeVideoId = (url) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : url.trim();
  };

  const parsedStreamId = getYouTubeVideoId(customStreamUrl);

  useEffect(() => {
    // Reset state on game change
    setCustomStreamUrl('');
    setIsStreamLive(false);

    // Polling for live stream from the backend scraper
    const fetchLiveStream = () => {
      apiFetch(`/api/streams/live?game=${activeGame}`)
        .then(r => r.json())
        .then(data => {
          setIsStreamLive(data.isLive);
          if (data.isLive && data.videoId) {
            setCustomStreamUrl(data.videoId);
          }
        })
        .catch(e => console.error('Failed to fetch auto-live stream', e));
    };

    // Fetch immediately, then every 2 minutes
    fetchLiveStream();
    const interval = setInterval(fetchLiveStream, 120000);
    return () => clearInterval(interval);
  }, [activeGame]);

  useEffect(() => {
    if (!globalTournament) return;

    const fetchMatches = () => {
      apiFetch(`/api/matches?tournament=${encodeURIComponent(globalTournament)}`)
        .then(r => r.json())
        .then(data => {
          if (Array.isArray(data)) setDbMatches(data.filter(m => m.status === 'live'));
        })
        .catch(e => console.error('Failed to fetch db matches', e));
    };

    fetchMatches();
    const interval = setInterval(fetchMatches, 5000);
    return () => clearInterval(interval);
  }, [globalTournament]);
  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const [tournamentsRes, teamsRes, playersRes] = await Promise.all([
          apiFetch('/api/tournaments'),
          apiFetch('/api/teams'),
          apiFetch('/api/players')
        ]);
        const tournaments = await tournamentsRes.json();
        const teams = await teamsRes.json();
        const players = await playersRes.json();
        const gameUpper = activeGame.toUpperCase();
        const gameTournaments = Array.isArray(tournaments) ? tournaments.filter(t => t.game === gameUpper) : [];
        const gameTeams = Array.isArray(teams) ? teams.filter(t => t.game === gameUpper) : [];
        const gameTeamIds = new Set(gameTeams.map(t => t.team_id));
        const gamePlayers = Array.isArray(players) ? players.filter(p => gameTeamIds.has(p.team_id)) : [];
        setKpiData([
          { 
            title: `${gameUpper === 'VALORANT' ? 'VCT' : 'CFS'} Tournaments`, 
            icon: 'globe', 
            stats: [{ label: 'Total', value: gameTournaments.length }, { label: 'Active', value: gameTournaments.length > 0 ? 1 : 0 }] 
          },
          { 
            title: `${gameUpper === 'VALORANT' ? 'Valorant' : 'Crossfire'} Players`, 
            icon: 'users', 
            stats: [{ label: 'Registered', value: gamePlayers.length }, { label: 'Active', value: gamePlayers.length }] 
          },
          { 
            title: 'Total Teams', 
            icon: 'crosshair', 
            stats: [{ label: 'Verified', value: gameTeams.length }, { label: 'Amateur', value: 0 }] 
          },
        ]);
      } catch (e) {
        console.error('Failed to fetch KPIs', e);
      }
    };
    fetchKpis();
  }, [activeGame]);
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiFetch(`/api/stats/${activeGame}?tournament=${globalTournament || 'Default'}`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const statsData = await res.json();
        const formattedStats = statsData
          .sort((a, b) => b.final_rating - a.final_rating)
          .map((s, i) => {
            const kd = s.total_deaths === 0 ? s.total_kills : (s.total_kills / s.total_deaths).toFixed(2);
            let wl = '-';
            let dmg = '-';
            if (activeGame === 'valorant') {
              wl = `${s.matches_played || 0} Mat`;
              dmg = `${Math.round(s.total_acs || 0)} ACS`;
            } else {
              wl = `${s.total_rounds_played || 0} Rnd`;
              dmg = `${s.total_headshots || 0} HS`;
            }
            return {
              rank: i + 1,
              name: s.ign,
              kd: kd,
              wl: wl,
              dmg: dmg,
              role: 'Flex'
            };
          });
        setPlayerStats(formattedStats);
      } catch (err) {
        console.error('Error fetching player stats:', err);
      }
    };
    fetchStats();
  }, [activeGame, globalTournament]);
  const [isBroadcasting, setIsBroadcasting] = useState(() => {
    const saved = localStorage.getItem('isBroadcasting');
    return saved !== null ? JSON.parse(saved) : true;
  });
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'isBroadcasting') {
        setIsBroadcasting(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
        const saved = localStorage.getItem('isBroadcasting');
        if (saved !== null) {
            const val = JSON.parse(saved);
            if (val !== isBroadcasting) setIsBroadcasting(val);
        }
    }, 1000);
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        clearInterval(interval);
    }
  }, [isBroadcasting]);
  const [timeLeft, setTimeLeft] = useState(data.timerSeconds);
  const [activeModal, setActiveModal] = useState(null);
  const [overviewState, setOverviewState] = useState({ open: false, player: null });
  useEffect(() => { setTimeLeft(data.timerSeconds); }, [activeGame]);
  useEffect(() => {
    const id = setInterval(() => setTimeLeft(p => p > 0 ? p - 1 : 0), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = (s) => ({
    d: String(Math.floor(s / 86400)).padStart(2, '0'),
    h: String(Math.floor((s % 86400) / 3600)).padStart(2, '0'),
    m: String(Math.floor((s % 3600) / 60)).padStart(2, '0'),
    s: String(s % 60).padStart(2, '0'),
  });
  const t = fmt(timeLeft);
  const liveMatch = dbMatches.length > 0 ? {
    team1: dbMatches[0].team_a?.team_name || 'TBD',
    team2: dbMatches[0].team_b?.team_name || 'TBD',
    score: `${dbMatches[0].team_a_score || 0} - ${dbMatches[0].team_b_score || 0}`,
    map: dbMatches[0].map_name || 'TBD',
    status: dbMatches[0].status === 'live' ? 'LIVE' : 'FIN',
    t1Logo: dbMatches[0].team_a?.team_name?.[0] || 'T',
    t2Logo: dbMatches[0].team_b?.team_name?.[0] || 'T',
  } : {
    team1: 'TBD',
    team2: 'TBD',
    score: '0 - 0',
    map: 'TBD',
    status: 'OFFLINE',
    t1Logo: 'T',
    t2Logo: 'T',
  };
  return (
    <div className="w-full h-full bg-bg-base text-theme-text-base overflow-y-auto flex flex-col items-center" style={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
      <style>{`
        .dash-scroll::-webkit-scrollbar { width: 4px; }
        .dash-scroll::-webkit-scrollbar-track { background: transparent; }
        .dash-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 9999px; }
      `}</style>
      {}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full blur-[120px] opacity-10" style={{ backgroundColor: data.accent }} />
      </div>
      {}
      <div className="relative z-10 w-full max-w-[1400px] flex flex-col mx-auto" style={{ padding: '48px', gap: '48px' }}>
        {}
        <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: '32px' }}>
          {kpiData.map((card, i) => (
            <KpiCard key={i} card={card} accent={data.accent} onClick={setActiveModal} />
          ))}
        </div>
        {isBroadcasting && liveMatch && (
          <>
          {}
        <div className="grid grid-cols-1 xl:grid-cols-5" style={{ gap: '32px' }}>
          {}
          <div className="xl:col-span-3 bg-bg-200 rounded-2xl border border-slate-800/60 overflow-hidden relative flex flex-col" style={{ minHeight: '360px' }}>
            {}
            <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
            {}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[400px] h-[200px] rounded-full blur-[100px] opacity-10" style={{ backgroundColor: data.accent }} />
            </div>
            {}
            <div className="relative z-10 flex items-center justify-between" style={{ padding: '20px 20px 0 20px' }}>
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 border rounded-full ${liveMatch.status === 'LIVE' || isStreamLive ? 'bg-red-500/10 border-red-500/20' : 'bg-slate-500/10 border-slate-500/20'}`} style={{ padding: '6px 12px' }}>
                  <span className={`w-2 h-2 rounded-full ${liveMatch.status === 'LIVE' || isStreamLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                  <span className={`text-[10px] font-black tracking-widest uppercase ${liveMatch.status === 'LIVE' || isStreamLive ? 'text-red-400' : 'text-theme-text-muted'}`}>{liveMatch.status === 'LIVE' || isStreamLive ? 'Live Broadcast' : 'Match Finished'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <a href={activeGame === 'crossfire' ? "https://www.facebook.com/cfphofficial" : "https://www.facebook.com/valorantesports"} target="_blank" rel="noreferrer" title="Watch on Facebook" className="flex items-center justify-center bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2] hover:text-white p-2 rounded-lg transition-all duration-300">
                    <IconFacebook />
                  </a>
                  <a href={activeGame === 'crossfire' ? "https://www.youtube.com/@CrossfirePhilippines" : "https://www.youtube.com/@ValorantEsports"} target="_blank" rel="noreferrer" title="Watch on YouTube" className="flex items-center justify-center bg-[#FF0000]/10 text-[#FF0000] hover:bg-[#FF0000] hover:text-white p-2 rounded-lg transition-all duration-300">
                    <IconYoutube />
                  </a>
                </div>
                <input 
                  type="text" 
                  value={customStreamUrl}
                  onChange={(e) => setCustomStreamUrl(e.target.value)}
                  placeholder="Custom Video ID (e.g. jNQXAC9IVRw)"
                  className="bg-black/30 border border-slate-700/50 rounded-md text-[10px] px-3 py-1.5 text-white w-56 focus:outline-none focus:border-cyan-500/50 transition-colors"
                />
              </div>
              <div className="text-[10px] font-bold text-theme-text-muted uppercase tracking-widest">{liveMatch.map}</div>
            </div>
            {}
            <div className="relative z-10 flex-1 w-full flex flex-col justify-center" style={{ padding: '20px' }}>
              <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.6)] relative bg-black flex items-center justify-center group">
                {parsedStreamId ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/${parsedStreamId}?autoplay=1&mute=1`}
                    title="Live Stream" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : isStreamLive ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.youtube.com/embed/live_stream?channel=${activeGame === 'crossfire' ? 'UCTn6ZUb6oi2Ubj46e3Ou62Q' : 'UCT-81uJmO1c8t-w3s33lS2g'}&autoplay=1&mute=1`}
                    title="Live Stream" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="flex flex-col items-center justify-center text-white/30">
                    <svg className="w-12 h-12 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                    </svg>
                    <span className="text-[11px] font-black tracking-widest uppercase">Stream Offline</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          {}
          <div className="xl:col-span-2 bg-bg-200 rounded-2xl border border-slate-800/60 flex flex-col overflow-hidden">
            <div className="border-b border-slate-800/50 flex items-center justify-between shrink-0" style={{ padding: '16px 20px' }}>
              <div>
                <div className="text-[9px] font-black uppercase tracking-widest text-theme-text-muted mb-0.5">Live</div>
                <h2 className="text-sm font-black uppercase tracking-widest text-theme-text-base">Ongoing Matches</h2>
              </div>
              <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full" style={{ padding: '4px 10px' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                <span className="text-[9px] font-black text-red-400">LIVE</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto" style={{ padding: '16px', gap: '12px', scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}>
              {dbMatches.length > 0 ? dbMatches.map(m => (
                <MatchRow key={m.match_id} accent={data.accent} match={{
                  t1: m.team_a?.team_name || 'TBD',
                  t2: m.team_b?.team_name || 'TBD',
                  score: `${m.team_a_score || 0} - ${m.team_b_score || 0}`,
                  map: m.map_name || 'TBD',
                  live: m.status === 'live'
                }} />
              )) : (
                <div className="flex items-center justify-center h-full text-theme-text-muted py-8">
                  <span className="text-sm">No ongoing matches found</span>
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
        {}
        <div className="bg-bg-200 rounded-2xl border border-slate-800/60 overflow-hidden">
          <div className="border-b border-slate-800/50 flex items-center justify-between" style={{ padding: '16px 20px' }}>
            <div>
              <div className="text-[9px] font-black uppercase tracking-widest text-theme-text-muted mb-0.5">Season</div>
              <h2 className="text-sm font-black uppercase tracking-widest text-theme-text-base">Player Performance Overview</h2>
            </div>
            <button onClick={() => setOverviewState({ open: true, player: null })} className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: data.accent }}>
              View Full Stats <IconChevron />
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px]">
              <thead>
                <tr className="text-[10px] uppercase tracking-widest text-theme-text-muted border-b border-slate-800/50 bg-slate-900/30">
                  <th className="text-left font-bold" style={{ padding: '12px 20px' }}>Rank</th>
                  <th className="text-left font-bold" style={{ padding: '12px 20px' }}>Player</th>
                  <th className="text-left font-bold" style={{ padding: '12px 20px' }}>Avg K/D</th>
                  <th className="text-left font-bold" style={{ padding: '12px 20px' }}>W/L</th>
                  <th className="text-left font-bold" style={{ padding: '12px 20px' }}>Damage</th>
                  <th className="text-right font-bold" style={{ padding: '12px 20px' }}>Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {playerStats.length === 0 && (
                  <tr><td colSpan="6" className="text-center text-theme-text-muted text-sm" style={{ padding: '32px 20px' }}>No player stats available for this tournament yet. Play some matches!</td></tr>
                )}
                {playerStats.slice(0,4).map((s, i) => (
                  <tr key={i} onClick={() => setOverviewState({ open: true, player: s })} className="hover:bg-white/[0.04] transition-colors group cursor-pointer">
                    <td className="text-theme-text-muted font-mono font-bold text-base" style={{ padding: '16px 20px' }}>
                      <span className="opacity-50">#</span>{s.rank}
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-black text-theme-text-muted shrink-0">
                          {s.name.split('.')[0]?.[0]}
                        </div>
                        <span className="font-bold text-theme-text-base text-sm group-hover:text-theme-text-base">{s.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span className="font-black text-lg" style={{ color: data.accent }}>{s.kd}</span>
                    </td>
                    <td className="text-theme-text-base font-medium text-sm" style={{ padding: '16px 20px' }}>{s.wl}</td>
                    <td className="text-theme-text-base font-bold text-sm" style={{ padding: '16px 20px' }}>{s.dmg}</td>
                    <td className="text-right" style={{ padding: '16px 20px' }}>
                      <span className={`inline-block text-[10px] font-bold rounded-full border tracking-widest uppercase ${roleBadge(s.role)}`} style={{ padding: '6px 12px' }}>
                        {s.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <KpiModal card={activeModal} accent={data.accent} onClose={() => setActiveModal(null)} />
      <LeaderboardOverviewModal 
        isOpen={overviewState.open} 
        player={overviewState.player} 
        data={data} 
        accent={data.accent} 
        onClose={() => setOverviewState({ open: false, player: null })} 
      />
    </div>
  );
};
export default Dashboard;

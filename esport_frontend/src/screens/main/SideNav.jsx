import React from 'react';
import { 
  LayoutDashboard, Trophy, GitMerge, LineChart, 
  Map, FileEdit, Users, BarChart2, 
  ListOrdered, TrendingUp, Archive, 
  ShieldCheck, ScrollText, Settings, 
  LogOut, Sun 
} from 'lucide-react';

const SideNav = ({ activePage, setActivePage, onLogout }) => {

  const navSections = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Tournament', icon: Trophy },

        { name: 'Tournament History', icon: Archive },
        { name: 'Predictions', icon: LineChart },
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Map Vetoes', icon: Map },
        { name: 'Data Entry', icon: FileEdit },
        { name: 'Player Management', icon: Users },
        { name: 'Map BP Results', icon: BarChart2 },
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Leaderboards', icon: ListOrdered },
        { name: 'Player Rankings', icon: TrendingUp },
        { name: 'Player Stats', icon: Users },
        { name: 'Raw Records', icon: Archive },
      ]
    },
    {
      title: 'SYSTEM',
      items: [
        { name: 'Admin', icon: ShieldCheck },
        { name: 'Audit Logs', icon: ScrollText },
        { name: 'Settings', icon: Settings },
      ]
    }
  ];

  return (
    <aside className="w-64 h-screen bg-bg-100 border-r border-slate-800/60 flex flex-col font-sans select-none shrink-0">
      
      {/* Brand Header */}
      <div className="h-20 flex items-center justify-center border-b border-slate-800/60">
        <h1 className="text-2xl font-black tracking-[0.15em] text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">
          ESPORT
        </h1>
      </div>

      {/* Scrollable Navigation */}
      <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-8 custom-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="px-3">
            <h2 className="text-[10px] font-bold text-theme-text-muted tracking-[0.2em] uppercase mb-3 px-3">
              {section.title}
            </h2>
            
            <ul className="flex flex-col gap-1">
              {section.items.map((item) => {
                const isActive = activePage === item.name;
                const Icon = item.icon;
                
                return (
                  <li key={item.name}>
                    <button
                      onClick={() => setActivePage(item.name)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                        isActive 
                          ? 'bg-cyan-950/40 text-cyan-400 border-l-[3px] border-cyan-400 font-semibold' 
                          : 'text-theme-text-muted hover:bg-slate-800/40 hover:text-theme-text-base border-l-[3px] border-transparent font-medium'
                      }`}
                    >
                      <Icon 
                        size={18} 
                        className={`transition-colors ${isActive ? 'text-cyan-400' : 'text-theme-text-muted group-hover:text-theme-text-base'}`} 
                      />
                      <span className="text-[13px] tracking-wide">{item.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>

      {/* Bottom Controls */}
      <div className="p-4 border-t border-slate-800/60 flex flex-col gap-2 bg-bg-100">
        <button className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-theme-text-muted hover:bg-slate-800/40 hover:text-theme-text-base transition-colors">
          <div className="flex items-center gap-3">
            <Sun size={18} className="text-theme-text-muted" />
            <span className="text-[13px] font-medium">Light Mode</span>
          </div>
          <div className="w-9 h-5 bg-slate-700 rounded-full relative shadow-inner">
            <div className="w-3.5 h-3.5 bg-white rounded-full absolute left-1 top-[3px] transition-transform"></div>
          </div>
        </button>
        
        <button onClick={onLogout} className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-theme-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors group">
          <LogOut size={18} className="text-theme-text-muted group-hover:text-red-400" />
          <span className="text-[13px] font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default SideNav;

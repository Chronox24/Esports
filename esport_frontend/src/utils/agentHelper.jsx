import React from 'react';

export const AGENT_IMAGE_MAP = {
  'astra': 'astra agent.png',
  'breach': 'breach agent.png',
  'brimstone': 'brimstone agent.png',
  'chamber': 'chamber agent.png',
  'clove': 'clove agent.png',
  'cypher': 'cypher agent.png',
  'deadlock': 'deadlock agent.png',
  'fade': 'fade agent.png',
  'gekko': 'gekko agent.png',
  'harbor': 'harbor agent.png',
  'hush': 'Hush agent.png',
  'hushagent': 'Hush agent.png',
  'iso': 'iso agent.png',
  'jett': 'jett agent.png',
  'kayo': 'kayo agent.png',
  'killjoy': 'killjoy agent.png',
  'miks': 'miks agent.png',
  'neon': 'neon agent.png',
  'omen': 'omen agent.png',
  'phoenix': 'phoenix agent.png',
  'raze': 'raze agent.png',
  'reyna': 'reyna agent.png',
  'sage': 'sage agent.png',
  'skye': 'skye agent.png',
  'sova': 'sova agent.png',
  'tejo': 'tejo agent.png',
  'veto': 'veto agent.png',
  'viper': 'viper agent.png',
  'vyse': 'vyse agent.png',
  'waylay': 'waylay agent.png',
  'yoru': 'yoru agent.png',
};

export const getAgentImagePath = (agentName) => {
  if (!agentName) return null;
  const clean = String(agentName).toLowerCase().trim().replace(/[\/\-_.\s]/g, '');
  const fileName = AGENT_IMAGE_MAP[clean] || `${clean} agent.png`;
  return encodeURI(`/assets/${fileName}`);
};

export const getAgentRoleStyle = (agentName) => {
  const agent = String(agentName || '').toLowerCase().trim().replace(/[\/\-_.\s]/g, '');
  if (['jett', 'reyna', 'raze', 'phoenix', 'yoru', 'neon', 'iso', 'waylay', 'hush'].includes(agent)) {
    return { role: 'Duelist', icon: '🎯', badge: 'bg-rose-500/15 text-rose-300 border-rose-500/30' };
  }
  if (['sova', 'breach', 'skye', 'kayo', 'fade', 'gekko', 'tejo'].includes(agent)) {
    return { role: 'Initiator', icon: '⚡', badge: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
  }
  if (['omen', 'brimstone', 'viper', 'astra', 'harbor', 'clove', 'veto'].includes(agent)) {
    return { role: 'Controller', icon: '☁️', badge: 'bg-purple-500/15 text-purple-300 border-purple-500/30' };
  }
  if (['killjoy', 'cypher', 'sage', 'chamber', 'deadlock', 'vyse', 'miks'].includes(agent)) {
    return { role: 'Sentinel', icon: '🛡️', badge: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' };
  }
  return { role: agentName || 'Flex', icon: '⚔️', badge: 'bg-slate-800 text-slate-300 border-slate-700' };
};

export const AgentBadge = ({ agent, className = '', imgClassName = '', showName = true }) => {
  if (!agent) return <span className="text-slate-600 font-mono">—</span>;

  const aStyle = getAgentRoleStyle(agent);
  const imgPath = getAgentImagePath(agent);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${aStyle.badge} ${className}`}>
      {imgPath ? (
        <img
          key={agent}
          src={imgPath}
          alt={agent}
          className={`w-4 h-4 rounded-full object-cover shrink-0 border border-white/20 shadow-sm ${imgClassName}`}
          onLoad={(e) => {
            e.currentTarget.style.display = 'block';
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = 'none';
            }
          }}
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            if (e.currentTarget.nextElementSibling) {
              e.currentTarget.nextElementSibling.style.display = 'inline';
            }
          }}
        />
      ) : null}
      <span style={{ display: imgPath ? 'none' : 'inline' }}>{aStyle.icon}</span>
      {showName && <span>{agent}</span>}
    </span>
  );
};

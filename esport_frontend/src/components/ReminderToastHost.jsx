import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, ExternalLink, AlertTriangle, CheckCircle2, Radio } from 'lucide-react';
import { apiFetch } from '../utils/api';
import {
  getStoredReminders,
  saveStoredReminders,
  markStoredReminderNotified,
  parseMatchStartTimestamp,
  triggerReminderNotification,
} from '../utils/reminders';

/**
 * Monitors saved match/tournament reminders across all tabs and displays
 * immediate HUD notification alerts when a tournament has started.
 */
export default function ReminderToastHost({ onOpenTournament }) {
  const [alerts, setAlerts] = useState([]);

  const dismissAlert = useCallback((alertId) => {
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
  }, []);

  useEffect(() => {
    const handleIncomingAlert = (e) => {
      const detail = e?.detail;
      if (!detail) return;
      setAlerts((prev) => [detail, ...prev].slice(0, 4));
      setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.id !== detail.id));
      }, 12000);
    };

    window.addEventListener('tournament-reminder-alert', handleIncomingAlert);
    return () => window.removeEventListener('tournament-reminder-alert', handleIncomingAlert);
  }, []);

  // Poll saved reminders periodically so scheduled matches trigger even after switching tabs
  useEffect(() => {
    const checkActiveReminders = async () => {
      const map = getStoredReminders();
      const pendingEntries = Object.values(map).filter((r) => r && !r.notified);
      if (pendingEntries.length === 0) return;

      const now = Date.now();
      let liveMatches = [];
      let shouldFetchBackend = pendingEntries.some(
        (r) => r.startTimestamp === null || now >= r.startTimestamp - 60000
      );

      if (shouldFetchBackend) {
        try {
          const res = await apiFetch('/api/matches');
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) liveMatches = data;
          }
        } catch (_) {}
      }

      pendingEntries.forEach((rem) => {
        const matched = liveMatches.find((m) => String(m.match_id) === String(rem.id));
        const statusLower = String(matched?.status || '').toLowerCase();
        const isLive = Boolean(matched?.is_live || statusLower === 'in_progress' || statusLower === 'live');
        const isFinished = statusLower === 'finished' || statusLower === 'completed';
        const ts = matched ? parseMatchStartTimestamp(matched) ?? rem.startTimestamp : rem.startTimestamp;

        if (isLive || isFinished || (ts !== null && now >= ts)) {
          markStoredReminderNotified(rem.id);
          triggerReminderNotification({
            matchId: rem.id,
            tournamentName: rem.tournamentName,
            gameTitle: rem.gameTitle,
            type: isFinished ? 'warning' : 'started',
            title: isFinished
              ? 'Tournament Match Concluded'
              : 'Tournament Has Started!',
            message: `${rem.tournamentName}: ${rem.teamA} vs ${rem.teamB} ${isFinished ? 'has concluded.' : 'has started!'}`,
          });
        }
      });
    };

    const handleTournamentDeleted = (e) => {
      const deletedName = String(e?.detail?.name || '').trim().toLowerCase();
      if (!deletedName) return;
      const map = getStoredReminders();
      let changed = false;
      Object.keys(map).forEach((key) => {
        if (String(map[key]?.tournamentName || '').trim().toLowerCase() === deletedName) {
          delete map[key];
          changed = true;
        }
      });
      if (changed) saveStoredReminders(map);
    };

    checkActiveReminders();
    const interval = setInterval(checkActiveReminders, 15000);
    window.addEventListener('tournament-deleted', handleTournamentDeleted);
    return () => {
      clearInterval(interval);
      window.removeEventListener('tournament-deleted', handleTournamentDeleted);
    };
  }, []);

  if (alerts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 sm:right-6 z-[120] flex flex-col gap-3 w-[calc(100vw-2rem)] max-w-md pointer-events-none">
      {alerts.map((alert) => {
        const isStarted = alert.type === 'started';
        const isWarning = alert.type === 'warning';

        const containerColors = isStarted
          ? 'border-rose-500/70 bg-slate-950/95 shadow-[0_12px_35px_rgba(244,63,94,0.35)]'
          : isWarning
            ? 'border-amber-500/70 bg-slate-950/95 shadow-[0_12px_35px_rgba(245,158,11,0.3)]'
            : 'border-cyan-400/60 bg-slate-950/95 shadow-[0_12px_35px_rgba(0,229,255,0.28)]';

        const accentText = isStarted
          ? 'text-rose-400'
          : isWarning
            ? 'text-amber-400'
            : 'text-cyan-400';

        const iconBox = isStarted
          ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
          : isWarning
            ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            : 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400';

        return (
          <div
            key={alert.id}
            className={`hud-chamfer-sm pointer-events-auto border backdrop-blur-xl p-4 flex items-start gap-3.5 animate-fade-in ${containerColors}`}
          >
            <div className={`w-9 h-9 hud-chamfer-sm border flex items-center justify-center shrink-0 mt-0.5 ${iconBox}`}>
              {isStarted ? (
                <Radio size={18} className="animate-pulse" />
              ) : isWarning ? (
                <AlertTriangle size={18} />
              ) : (
                <CheckCircle2 size={18} />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className={`font-tactical text-[10px] font-extrabold uppercase tracking-[0.18em] flex items-center gap-1.5 ${accentText}`}>
                  <Bell size={11} />
                  {alert.title}
                </span>
                <button
                  type="button"
                  onClick={() => dismissAlert(alert.id)}
                  className="text-slate-400 hover:text-white transition-colors p-0.5 cursor-pointer"
                  aria-label="Dismiss alert"
                >
                  <X size={15} />
                </button>
              </div>

              <p className="text-xs text-slate-200 mt-1 leading-relaxed font-medium">
                {alert.message}
              </p>

              {alert.tournamentName && onOpenTournament && (
                <button
                  type="button"
                  onClick={() => {
                    onOpenTournament(alert.tournamentName, alert.gameTitle);
                    dismissAlert(alert.id);
                  }}
                  className={`mt-2.5 inline-flex items-center gap-1.5 font-tactical text-[10px] font-extrabold uppercase tracking-[0.14em] px-2.5 py-1 hud-chamfer-sm border transition-colors cursor-pointer ${
                    isStarted
                      ? 'bg-rose-500/20 border-rose-500/45 text-rose-300 hover:bg-rose-500/35'
                      : isWarning
                        ? 'bg-amber-500/20 border-amber-500/45 text-amber-300 hover:bg-amber-500/35'
                        : 'bg-cyan-500/20 border-cyan-500/45 text-cyan-300 hover:bg-cyan-500/35'
                  }`}
                >
                  <span>Open Tournament</span>
                  <ExternalLink size={11} />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

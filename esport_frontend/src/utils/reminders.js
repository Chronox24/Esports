const REMINDERS_STORAGE_KEY = 'esports_match_reminders_v1';

/**
 * Parses a match's scheduled start timestamp (epoch ms), or returns null if unscheduled.
 */
export function parseMatchStartTimestamp(match) {
  if (!match) return null;

  if (match.match_schedule) {
    const parsed = new Date(match.match_schedule);
    if (!Number.isNaN(parsed.getTime())) {
      return parsed.getTime();
    }
  }

  const rawDate = String(match.dateStr || match.match_day || match.day || '').trim();
  if (!rawDate) return null;

  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth();
  let day = now.getDate();

  const isoDateMatch = rawDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoDateMatch) {
    year = parseInt(isoDateMatch[1], 10);
    month = parseInt(isoDateMatch[2], 10) - 1;
    day = parseInt(isoDateMatch[3], 10);
  } else {
    const numericDay = parseInt(rawDate, 10);
    if (Number.isNaN(numericDay) || numericDay < 1 || numericDay > 31) {
      return null;
    }
    day = numericDay;
  }

  const rawTime = String(match.time || match.match_time || '00:00').trim();
  const timeMatch = rawTime.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
  let hours = 0;
  let minutes = 0;
  if (timeMatch) {
    hours = parseInt(timeMatch[1], 10);
    minutes = parseInt(timeMatch[2], 10);
    const ampm = timeMatch[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
  }

  const tz = String(match.timezone || match.match_timezone || '').trim().toUpperCase();
  if (tz === 'UTC' || tz === 'GMT') {
    return Date.UTC(year, month, day, hours, minutes, 0, 0);
  }

  const dt = new Date(year, month, day, hours, minutes, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt.getTime();
}

/**
 * Evaluates whether a match or its parent tournament has already started or concluded.
 */
export function evaluateTournamentStartState(
  match,
  { tournamentsList = [], dashboardList = [], allMatches = [], nowMs = Date.now() } = {}
) {
  const statusLower = String(match?.status || '').trim().toLowerCase();
  const startTimestamp = match?.startTimestamp ?? parseMatchStartTimestamp(match);
  const tournName = String(match?.tournamentName || match?.tournament_name || '').trim();
  const tournKey = tournName.toLowerCase();

  const tournMeta = tournamentsList.find(
    (t) => String(t?.name || '').trim().toLowerCase() === tournKey
  );
  const dashMeta = dashboardList.find(
    (d) => String(d?.name || '').trim().toLowerCase() === tournKey
  );

  const isMatchFinished = statusLower === 'finished' || statusLower === 'completed';
  const isTournamentFinished = Boolean(
    tournMeta?.is_finished ||
      String(tournMeta?.status || '').toUpperCase() === 'COMPLETE' ||
      String(dashMeta?.status || '').toUpperCase() === 'COMPLETE'
  );
  const isMatchLive = Boolean(match?.isLive || match?.is_live || statusLower === 'in_progress' || statusLower === 'live');

  const hasStartedMatchInTournament = allMatches.some((other) => {
    const otherKey = String(other?.tournamentName || other?.tournament_name || '').trim().toLowerCase();
    if (!tournKey || otherKey !== tournKey) return false;
    const otherStatus = String(other?.status || '').trim().toLowerCase();
    if (
      other?.isLive ||
      other?.is_live ||
      otherStatus === 'live' ||
      otherStatus === 'in_progress' ||
      otherStatus === 'finished' ||
      otherStatus === 'completed'
    ) {
      return true;
    }
    const otherTs = parseMatchStartTimestamp(other);
    return otherTs !== null && nowMs >= otherTs;
  });

  const matchupLabel = `${match?.teamA || 'TBD'} vs ${match?.teamB || 'TBD'}`;
  const timeLabel = `${match?.time || match?.match_time || ''}${match?.timezone || match?.match_timezone ? ` ${match.timezone || match.match_timezone}` : ''}`.trim();

  if (isMatchFinished || isTournamentFinished) {
    return {
      started: true,
      alreadyConcluded: true,
      kind: 'finished',
      startTimestamp,
      badge: 'CONCLUDED',
      headline: isMatchFinished ? 'Tournament Match Already Finished' : 'Tournament Already Concluded',
      detail: `${tournName || 'Tournament'} (${matchupLabel}) has already ended.`,
    };
  }

  if (isMatchLive) {
    return {
      started: true,
      alreadyConcluded: false,
      kind: 'live',
      startTimestamp,
      badge: 'LIVE NOW',
      headline: 'Tournament Has Already Started!',
      detail: `${tournName || 'Tournament'} (${matchupLabel}) is currently LIVE.`,
    };
  }

  if (startTimestamp !== null && nowMs >= startTimestamp) {
    return {
      started: true,
      alreadyConcluded: false,
      kind: 'started_time',
      startTimestamp,
      badge: 'STARTED',
      headline: 'Tournament Has Already Started!',
      detail: `${tournName || 'Tournament'} (${matchupLabel}) was scheduled for ${timeLabel || 'earlier today'} and has already begun.`,
    };
  }

  if (hasStartedMatchInTournament || String(dashMeta?.status || '').toUpperCase() === 'IN PROGRESS') {
    return {
      started: true,
      alreadyConcluded: false,
      kind: 'tournament_active',
      startTimestamp,
      badge: 'IN PROGRESS',
      headline: 'Tournament Already Underway!',
      detail: `${tournName || 'Tournament'} has already started. Your reminder for ${matchupLabel}${timeLabel ? ` (${timeLabel})` : ''} is active.`,
    };
  }

  return {
    started: false,
    alreadyConcluded: false,
    kind: 'upcoming',
    startTimestamp,
    badge: 'UPCOMING',
    headline: 'Reminder Set',
    detail: `You will be notified automatically when ${tournName || 'the tournament'} (${matchupLabel}) starts${timeLabel ? ` at ${timeLabel}` : ''}.`,
  };
}

export function getStoredReminders() {
  if (typeof localStorage === 'undefined') return {};
  try {
    const raw = localStorage.getItem(REMINDERS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (_) {
    return {};
  }
}

export function saveStoredReminders(remindersMap) {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(REMINDERS_STORAGE_KEY, JSON.stringify(remindersMap || {}));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('tournament-reminders-updated'));
    }
  } catch (_) {}
}

export function upsertStoredReminder(id, entry) {
  const map = getStoredReminders();
  map[id] = entry;
  saveStoredReminders(map);
  return map;
}

export function removeStoredReminder(id) {
  const map = getStoredReminders();
  delete map[id];
  saveStoredReminders(map);
  return map;
}

export function markStoredReminderNotified(id) {
  const map = getStoredReminders();
  if (map[id]) {
    map[id] = { ...map[id], notified: true, notifiedAt: Date.now() };
    saveStoredReminders(map);
  }
  return map;
}

export function requestBrowserNotificationPermission() {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission === 'default') {
    Notification.requestPermission().catch(() => {});
  }
}

export function triggerReminderNotification(alert) {
  if (typeof window === 'undefined') return;

  window.dispatchEvent(
    new CustomEvent('tournament-reminder-alert', {
      detail: {
        id: `${alert.matchId || alert.tournamentName || 'reminder'}-${Date.now()}`,
        createdAt: Date.now(),
        ...alert,
      },
    })
  );

  // Also dispatch native browser notification when permitted and alert represents a start/live/concluded notice
  if (
    alert.sendBrowserNotification !== false &&
    'Notification' in window &&
    Notification.permission === 'granted'
  ) {
    try {
      new Notification(alert.title || 'Tournament Reminder', {
        body: alert.message || '',
        icon: '/assets/weblogo.png',
        tag: `tournament-reminder-${alert.matchId || alert.tournamentName || 'default'}`,
      });
    } catch (_) {}
  }
}

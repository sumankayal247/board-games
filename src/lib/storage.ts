export interface MatchHistoryEntry {
  matchId: string;
  gameId: string;
  gameName: string;
  players: { name: string; type: string }[];
  winner: number | null;
  isDraw: boolean;
  durationSeconds: number;
  finishedAt: number;
  moveCount: number;
}

const STORAGE_KEYS = {
  history: 'boardgames_history',
  prefs: 'boardgames_prefs',
  saved: 'boardgames_saved_',
};

export function getHistory(): MatchHistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function addHistory(entry: MatchHistoryEntry) {
  const h = getHistory();
  h.unshift(entry);
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(h.slice(0, 100)));
}

export function getPrefs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.prefs);
    return raw ? JSON.parse(raw) : { sound: true, reducedMotion: false };
  } catch { return { sound: true, reducedMotion: false }; }
}

export function setPrefs(prefs: any) {
  localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(prefs));
}

export function saveGameState(matchId: string, state: any) {
  try {
    localStorage.setItem(STORAGE_KEYS.saved + matchId, JSON.stringify(state));
  } catch {}
}

export function loadGameState(matchId: string): any | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.saved + matchId);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function listSavedGames(): { matchId: string; state: any }[] {
  const res: any[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k?.startsWith(STORAGE_KEYS.saved)) {
      const raw = localStorage.getItem(k);
      if (raw) res.push({ matchId: k.replace(STORAGE_KEYS.saved, ''), state: JSON.parse(raw) });
    }
  }
  return res;
}

export function removeSaved(matchId: string) {
  localStorage.removeItem(STORAGE_KEYS.saved + matchId);
}

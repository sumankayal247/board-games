let ctx: AudioContext | null = null;
function getCtx() {
  if (!ctx) {
    try { ctx = new (window.AudioContext || (window as any).webkitAudioContext)(); } catch { return null; }
  }
  return ctx;
}

export function playSound(type: 'move'|'win'|'invalid'|'click') {
  try {
    const c = getCtx();
    if (!c) return;
    const prefs = JSON.parse(localStorage.getItem('boardgames_prefs') || '{"sound":true}');
    if (!prefs.sound) return;
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    const now = c.currentTime;
    if (type === 'move') { o.frequency.setValueAtTime(600, now); g.gain.setValueAtTime(0.12, now); o.start(now); o.stop(now+0.12); }
    else if (type === 'win') { o.frequency.setValueAtTime(440, now); o.frequency.linearRampToValueAtTime(880, now+0.3); g.gain.setValueAtTime(0.15, now); o.start(now); o.stop(now+0.4); }
    else if (type === 'invalid') { o.frequency.setValueAtTime(180, now); g.gain.setValueAtTime(0.1, now); o.start(now); o.stop(now+0.15); }
    else { o.frequency.setValueAtTime(900, now); g.gain.setValueAtTime(0.07, now); o.start(now); o.stop(now+0.08); }
  } catch {}
}

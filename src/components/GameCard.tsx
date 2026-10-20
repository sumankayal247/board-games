import type { GameMetadata } from '../types';
import { Link } from 'react-router-dom';

export function GameCard({ game }: { game: GameMetadata }) {
  const statusColor: Record<string,string> = {
    playable: 'bg-emerald-500 text-white',
    prototype: 'bg-amber-400 text-slate-900',
    coming_soon: 'bg-slate-200 text-slate-600',
    unavailable: 'bg-rose-100 text-rose-700'
  };
  const statusLabel: Record<string,string> = {
    playable: 'Playable',
    prototype: 'Prototype',
    coming_soon: 'Coming Soon',
    unavailable: 'Unavailable'
  };
  return (
    <div className="group bg-white rounded-[20px] border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col">
      <div className="h-[140px] flex items-center justify-center relative overflow-hidden" style={{background: game.accent}}>
        <div className="absolute inset-0 opacity-10" style={{background: `radial-gradient(400px 200px at 50% 0%, ${game.color} 0%, transparent 70%)`}}/>
        <div className="text-5xl drop-shadow-sm relative z-10 group-hover:scale-110 transition-transform">{game.icon}</div>
        <div className="absolute top-3 left-3 flex gap-1">
          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-white/90 border border-slate-200 text-slate-700">{game.category[0]}</span>
        </div>
        <div className="absolute top-3 right-3">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${statusColor[game.status]}`}>{statusLabel[game.status]}</span>
        </div>
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-black text-[16px] leading-tight text-slate-900">{game.name}</h3>
        <p className="text-[13px] text-slate-500 mt-1 line-clamp-2 min-h-[38px]">{game.description}</p>
        <div className="flex items-center gap-2 mt-3 text-[12px] text-slate-600">
          <span className="px-2 py-1 bg-slate-100 rounded-full font-semibold">{game.minPlayers===game.maxPlayers? `${game.minPlayers} Players` : `${game.minPlayers}–${game.maxPlayers} Players`}</span>
          <span className="px-2 py-1 bg-slate-100 rounded-full">{game.estimatedDuration}</span>
        </div>
        <div className="flex items-center gap-1 mt-2">
          {game.tags.slice(0,3).map(t=> <span key={t} className="text-[11px] px-2 py-0.5 bg-slate-50 border border-slate-200 rounded-full text-slate-600">{t}</span>)}
        </div>
        <div className="mt-4 flex gap-2">
          <Link to={`/game/${game.id}`} className="flex-1 text-center px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-bold hover:bg-slate-50 transition">View Details</Link>
          {game.status==='playable' ? (
            <Link to={`/game/${game.id}/setup`} className="flex-1 text-center px-3 py-2 bg-slate-900 text-white rounded-full text-sm font-bold hover:bg-slate-800 transition">Play Now</Link>
          ) : (
            <span className="flex-1 text-center px-3 py-2 bg-slate-100 text-slate-400 rounded-full text-sm font-bold cursor-not-allowed">Coming Soon</span>
          )}
        </div>
        {game.supportsAI && game.status==='playable' && (
          <div className="mt-2 text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1 text-center font-semibold">AI: {game.supportedAIDifficulties.join(' • ')}</div>
        )}
      </div>
    </div>
  );
}

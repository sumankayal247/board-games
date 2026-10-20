import type { PlayerConfig } from '../types';

export function TurnIndicator({ players, currentPlayer, status }: { players:PlayerConfig[]; currentPlayer:number; status:string }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-1">
      {players.map((p,i)=>(
        <div key={p.id} className={`flex items-center gap-2 px-3 py-2 rounded-full border transition
          ${i===currentPlayer && status==='playing' ? 'bg-slate-900 text-white border-slate-900 shadow-md scale-[1.02]' : 'bg-white border-slate-200 text-slate-700'}`}>
          <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm" style={{background: p.color}}>{p.avatar}</span>
          <span className="text-sm font-bold whitespace-nowrap">{p.name}</span>
          <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-black/10">{p.type==='computer'? p.difficulty : 'Human'}</span>
          {i===currentPlayer && status==='playing' && <span className="ml-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse"/>}
        </div>
      ))}
    </div>
  );
}

import type { Connect4State } from './engine';

export function Connect4Board({ state, onMove, disabled }: { state: Connect4State; onMove:(col:number)=>void; disabled?:boolean }) {
  return (
    <div className="mx-auto max-w-[480px]">
      <div className="bg-[#0ea5e9] p-3 rounded-[24px] shadow-xl border-4 border-sky-600">
        {/* top selector */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {Array.from({length:7}).map((_,c)=>(
            <button key={c} disabled={disabled || state.status==='finished' || state.board[0][c]!==null}
              onClick={()=>onMove(c)}
              className="h-8 rounded-full bg-sky-400 hover:bg-white/90 disabled:opacity-30 transition flex items-center justify-center text-white text-xs">▼</button>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2 bg-sky-700 p-2 rounded-2xl">
          {Array.from({length:6}).map((_,r)=> Array.from({length:7}).map((_,c)=>{
            const v=state.board[r][c];
            const isLast = state.lastMove?.r===r && state.lastMove?.c===c;
            return (
              <div key={`${r}-${c}`} className="aspect-square bg-sky-800 rounded-full p-1 flex items-center justify-center">
                <div className={`w-full h-full rounded-full flex items-center justify-center transition-all
                  ${v===null ? 'bg-white shadow-inner' : v===0 ? 'bg-amber-400 shadow-lg border-2 border-amber-600' : 'bg-rose-500 shadow-lg border-2 border-rose-700'}
                  ${isLast ? 'ring-2 ring-white scale-105' : ''}`}>
                  {v!==null ? <span className="w-3 h-3 bg-white/30 rounded-full"/> : null}
                </div>
              </div>
            );
          }))}
        </div>
      </div>
      <div className="mt-3 text-center text-sm text-slate-600">
        {state.status==='finished' ? (state.isDraw?'Draw!': `${state.players[state.winner!]?.name} connects four!`) : `Tap a column to drop`}
      </div>
    </div>
  );
}

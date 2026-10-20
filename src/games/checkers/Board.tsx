import { getAllMoves, type CheckersState } from './engine';

export function CheckersBoard({ state, onMove, disabled, selected, onSelect }: { state: CheckersState; onMove:(from:[number,number],to:[number,number])=>void; disabled?:boolean; selected: [number,number]|null; onSelect: (pos:[number,number]|null)=>void }) {
  const legal=getAllMoves(state);
  const canMoveFrom = new Set(legal.map(m=> `${m.from[0]}-${m.from[1]}`));
  const targets = new Set<string>();
  if(selected){
    for(const m of legal) if(m.from[0]===selected[0]&&m.from[1]===selected[1]) targets.add(`${m.to[0]}-${m.to[1]}`);
  }
  return (
    <div className="mx-auto max-w-[520px]">
      <div className="bg-[#b58863] p-3 rounded-[18px] shadow-xl border-4 border-amber-900">
        <div className="grid grid-cols-8 gap-0 rounded-lg overflow-hidden border-4 border-amber-900">
          {Array.from({length:8}).map((_,r)=> Array.from({length:8}).map((_,c)=>{
            const isDark=(r+c)%2===1;
            const piece=state.board[r][c];
            const isSelected=selected?.[0]===r && selected?.[1]===c;
            const isTarget=targets.has(`${r}-${c}`);
            const isCanMove=canMoveFrom.has(`${r}-${c}`) && piece?.player===state.currentPlayer;
            return (
              <div key={`${r}-${c}`} className={`aspect-square flex items-center justify-center relative
                ${isDark?'bg-[#6b3a2a]':'bg-[#f0d9b5]'} ${isTarget?'!bg-amber-300':''}`}>
                {piece ? (
                  <button disabled={disabled || state.status==='finished'}
                    onClick={()=>{
                      if(selected && isTarget){
                        onMove(selected,[r,c]);
                      } else {
                        if(isCanMove) onSelect([r,c]); else if(piece.player===state.currentPlayer) onSelect([r,c]);
                      }
                    }}
                    className={`w-[82%] h-[82%] rounded-full flex items-center justify-center shadow-md border-2 transition-transform
                      ${piece.player===0?'bg-slate-800 border-slate-900 text-white':'bg-rose-500 border-rose-700 text-white'}
                      ${isSelected?'ring-4 ring-amber-400 scale-105':''}
                      ${isCanMove?'animate-pulse':''}
                    `}>
                    <span className="text-xs font-black">{piece.king?'♔':'●'}</span>
                  </button>
                ) : (
                  <button disabled={!isTarget || disabled}
                    onClick={()=> selected && isTarget && onMove(selected,[r,c])}
                    className={`w-full h-full ${isTarget?'bg-amber-400/60 cursor-pointer hover:bg-amber-400':''}`}>
                    {isTarget ? <span className="w-4 h-4 bg-amber-600 rounded-full inline-block"/> : null}
                  </button>
                )}
              </div>
            );
          }))}
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-slate-500">Tap your piece, then tap destination. Captures are mandatory.</div>
    </div>
  );
}

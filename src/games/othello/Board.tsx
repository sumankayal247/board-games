import { countDiscs, getFlips, type OthelloState } from './engine';

export function OthelloBoard({ state, onMove, disabled }: { state: OthelloState; onMove:(r:number,c:number)=>void; disabled?:boolean }) {
  const legal = new Set<string>();
  if(!disabled && state.status!=='finished'){
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(getFlips(state.board,r,c,state.currentPlayer).length>0) legal.add(`${r}-${c}`);
  }
  const [c0,c1]=countDiscs(state.board);
  return (
    <div className="mx-auto max-w-[480px]">
      <div className="flex justify-between items-center mb-3 px-1">
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${state.currentPlayer===0?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200'}`}>
          <span className="w-4 h-4 rounded-full bg-slate-900 border border-white"/> Black: {c0}
        </div>
        <div className={`px-3 py-1.5 rounded-full text-sm font-bold flex items-center gap-2 border ${state.currentPlayer===1?'bg-white text-slate-900 border-slate-400 shadow':'bg-white border-slate-200'}`}>
          <span className="w-4 h-4 rounded-full bg-white border border-slate-400"/> White: {c1}
        </div>
      </div>
      <div className="bg-[#0f5d2f] p-3 rounded-[20px] shadow-xl border-4 border-green-800">
        <div className="grid grid-cols-8 gap-1 bg-green-900 p-2 rounded-xl">
          {Array.from({length:8}).map((_,r)=> Array.from({length:8}).map((_,c)=>{
            const v=state.board[r][c];
            const isLegal=legal.has(`${r}-${c}`);
            return (
              <button key={`${r}-${c}`} disabled={!isLegal || disabled}
                onClick={()=>onMove(r,c)}
                className={`aspect-square bg-[#1a7a3a] rounded-sm flex items-center justify-center relative
                  ${isLegal?'hover:bg-green-700 cursor-pointer ring-2 ring-amber-300':'cursor-default'}
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400`}>
                {v!==null && (
                  <div className={`w-[78%] h-[78%] rounded-full shadow-md border flex items-center justify-center transition-all
                    ${v===0?'bg-slate-900 border-slate-950':'bg-white border-slate-300'}`}>
                    <div className={`w-2 h-2 rounded-full ${v===0?'bg-white/20':'bg-slate-200'}`}/>
                  </div>
                )}
                {isLegal && !v && <span className="w-3 h-3 rounded-full bg-amber-300/80 shadow"/>}
              </button>
            );
          }))}
        </div>
      </div>
      {state.status==='finished' && (
        <div className="mt-3 text-center font-bold">
          {state.isDraw ? 'Draw!' : `${state.players[state.winner!]?.name} wins ${c0}-${c1}`}
        </div>
      )}
    </div>
  );
}

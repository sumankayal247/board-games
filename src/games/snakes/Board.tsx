import { ladders, snakes, type SnakesState } from './engine';

export function SnakesBoard({ state, onRoll, disabled, lastEvent }: { state: SnakesState; onRoll:()=>void; disabled?:boolean; lastEvent?:string|null }) {
  const cells=[];
  for(let r=9;r>=0;r--){
    const reversed = r%2===0; // snake board zigzag
    for(let c=0;c<10;c++){
      const colIdx = reversed? 9-c : c;
      const num = r*10 + colIdx +1;
      const isLadder = ladders[num];
      const isSnake = snakes[num];
      const playersHere=state.positions.map((p,i)=> p===num? i:null).filter(v=>v!==null) as number[];
      cells.push(
        <div key={num} className={`aspect-square border border-emerald-200 flex flex-col items-center justify-center text-[10px] p-0.5 relative
          ${isLadder?'bg-amber-100': isSnake?'bg-rose-50': num%2?'bg-white':'bg-emerald-50'}
          ${num===100?'bg-amber-400 !border-amber-600':''}`}>
          <span className="font-bold text-slate-700">{num}</span>
          {isLadder && <span className="text-[9px] text-amber-700">↗{isLadder}</span>}
          {isSnake && <span className="text-[9px] text-rose-700">↘{isSnake}</span>}
          {playersHere.length>0 && (
            <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
              {playersHere.map(pi=> (
                <span key={pi} className="w-3 h-3 rounded-full border border-white shadow text-[8px] flex items-center justify-center text-white font-bold" style={{background:['#e11d48','#0ea5e9','#16a34a','#f59e0b'][pi]}}>{pi+1}</span>
              ))}
            </div>
          )}
        </div>
      );
    }
  }
  return (
    <div className="mx-auto max-w-[560px]">
      <div className="bg-white rounded-[20px] shadow-xl border-4 border-emerald-600 p-3">
        <div className="flex justify-between items-center mb-3">
          <div className="flex gap-2">
            {state.players.map((p,i)=>(
              <div key={i} className={`px-3 py-1 rounded-full text-xs font-bold border ${state.currentPlayer===i?'bg-emerald-600 text-white border-emerald-700':'bg-white border-slate-200'}`}>
                {p.name}: {state.positions[i]}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-amber-400 border-2 border-amber-600 flex items-center justify-center font-black text-xl">
              {state.diceValue ?? '•'}
            </div>
            <button onClick={onRoll} disabled={disabled || state.status==='finished'} className="px-4 py-2 bg-emerald-600 text-white rounded-full font-bold hover:bg-emerald-700 disabled:opacity-40">Roll 🎲</button>
          </div>
        </div>
        <div className="grid grid-cols-10 gap-0 rounded-xl overflow-hidden border-2 border-emerald-800 bg-white">
          {cells}
        </div>
        {lastEvent && <div className="mt-2 text-center text-sm font-semibold text-amber-700 bg-amber-50 rounded-full py-1">{lastEvent}</div>}
        {state.status==='finished' && <div className="mt-3 text-center font-bold text-emerald-700">{state.players[state.winner!].name} reaches 100 and wins! 🎉</div>}
        <div className="mt-2 text-xs text-slate-500 text-center">Need exact roll to hit 100. Ladders climb, snakes slide. Roll a 6 for extra turn (3 sixes lose turn).</div>
      </div>
    </div>
  );
}

import type { LudoState } from './engine';

export function LudoBoard({ state, onTokenClick }: { state: LudoState; onTokenClick:(idx:number)=>void }) {
  const playerCount=state.players.length;
  return (
    <div className="mx-auto max-w-[560px]">
      <div className="bg-white rounded-[20px] shadow-xl border border-slate-200 p-4">
        {/* dice area */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-2">
            {state.players.map((p,i)=> (
              <div key={i} className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${state.currentPlayer===i?'bg-slate-900 text-white border-slate-900':'bg-white border-slate-200'}`}>
                <span className="w-3 h-3 rounded-full" style={{background: state.playerStates[i].color}}/> {p.name} <span className="opacity-70">{state.playerStates[i].tokens.filter(t=>t===57).length}/4</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border-2 ${state.diceValue?'bg-amber-400 border-amber-600 text-slate-900':'bg-slate-100 border-slate-200'}`}>
              {state.diceValue ?? '🎲'}
            </div>
            <div className="text-xs text-slate-500">{state.mustRoll?'Roll!':'Move token'}</div>
          </div>
        </div>

        {/* abstract board representation */}
        <div className="grid grid-cols-4 gap-3">
          {state.playerStates.slice(0,playerCount).map((ps,pi)=> (
            <div key={pi} className="rounded-2xl p-3 border-2" style={{borderColor: ps.color, background: `${ps.color}12`}}>
              <div className="text-xs font-bold mb-2" style={{color: ps.color}}>{state.players[pi].name} • {pi===state.currentPlayer?'● Turn':''}</div>
              <div className="grid grid-cols-2 gap-2">
                {ps.tokens.map((steps,ti)=>{
                  const canMove = state.currentPlayer===pi && state.canMoveTokens.includes(ti);
                  const status = steps===-1?'Yard': steps===57?'Home': steps>=52?`H${steps-52}`:`${steps}`;
                  return (
                    <button key={ti} onClick={()=> canMove && onTokenClick(ti)}
                      disabled={!canMove}
                      className={`h-16 rounded-xl flex flex-col items-center justify-center border-2 text-xs font-bold transition
                        ${steps===57?'bg-emerald-500 text-white border-emerald-600': steps===-1?'bg-white border-slate-300 text-slate-500':'bg-white border-slate-200'}
                        ${canMove?'!border-amber-500 !bg-amber-50 hover:scale-105 cursor-pointer ring-2 ring-amber-300':''}
                      `}>
                      <span className="w-6 h-6 rounded-full mb-1" style={{background: steps===57? 'white': ps.color}}/>
                      T{ti+1}: {status}
                    </button>
                  );
                })}
              </div>
              {/* track visualization mini */}
              <div className="mt-2 h-2 bg-slate-100 rounded-full overflow-hidden flex">
                {ps.tokens.map((s,i)=> (
                  <div key={i} className="h-full" style={{width: `${((s===-1?0: s===57?57:s)/57)*25}%`, background: ps.color, opacity: 0.8}}/>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 text-center text-xs text-slate-500">
          {state.status==='finished' ? `${state.players[state.winner!].name} wins!` : state.canMoveTokens.length? 'Select a highlighted token to move' : state.diceValue?'No moves — turn passes':'Roll the die'}
        </div>
      </div>
    </div>
  );
}

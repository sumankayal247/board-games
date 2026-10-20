import { getLegalMoves, getPseudoLegalMoves, type ChessState } from './engine';

const pieceIcons: Record<string, string> = {
  'k-0':'♔','q-0':'♕','r-0':'♖','b-0':'♗','n-0':'♘','p-0':'♙',
  'k-1':'♚','q-1':'♛','r-1':'♜','b-1':'♝','n-1':'♞','p-1':'♟︎'
};

export function ChessBoard({ state, onMove, selected, onSelect, disabled }: { state: ChessState; onMove:(from:[number,number],to:[number,number],promo?:any)=>void; selected:[number,number]|null; onSelect:(p:[number,number]|null)=>void; disabled?:boolean }) {
  const legal = selected ? getLegalMoves({...state} as any).filter(m=> m.from[0]===selected[0]&&m.from[1]===selected[1]) : [];
  const legalTos = new Set(legal.map(m=> `${m.to[0]}-${m.to[1]}`));
  const pieceLegalFrom = new Set(getLegalMoves(state as any).map(m=> `${m.from[0]}-${m.from[1]}`));
  const isSelected = (r:number,c:number)=> selected?.[0]===r && selected?.[1]===c;
  return (
    <div className="mx-auto max-w-[520px]">
      <div className="bg-[#f0d9b5] p-2 rounded-xl shadow-xl border-4 border-[#b58863]">
        <div className="grid grid-cols-8 gap-0 overflow-hidden rounded-md border-2 border-[#8b5a2b]">
          {Array.from({length:8}).map((_,r)=> Array.from({length:8}).map((_,c)=>{
            const isLight=(r+c)%2===0;
            const piece=state.board[r][c];
            const isLegalTarget=legalTos.has(`${r}-${c}`);
            const isCanMoveFrom=pieceLegalFrom.has(`${r}-${c}`);
            return (
              <div key={`${r}-${c}`} className={`aspect-square flex items-center justify-center relative
                ${isLight?'bg-[#f0d9b5]':'bg-[#b58863]'}
                ${isSelected(r,c)?'!bg-amber-300':''}
                ${isLegalTarget?'!bg-amber-400/70':''}
              `}>
                {piece ? (
                  <button disabled={disabled}
                    onClick={()=>{
                      if(isSelected(r,c)) { onSelect(null); return; }
                      if(selected && isLegalTarget){
                        const mv=legal.find(m=> m.to[0]===r&&m.to[1]===c);
                        onMove(mv!.from, mv!.to, mv!.promotion);
                      } else {
                        if(piece.color===state.turnColor) onSelect([r,c]);
                      }
                    }}
                    className={`w-full h-full flex items-center justify-center text-[28px] sm:text-3xl font-bold
                      ${piece.color===0?'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]':'text-slate-900'}
                      ${isCanMoveFrom?'cursor-pointer hover:scale-105':''}
                      focus:outline-none`}>
                    <span className={piece.color===0 ? 'filter drop-shadow-md' : ''}>{pieceIcons[`${piece.type}-${piece.color}`]}</span>
                  </button>
                ) : (
                  <button disabled={!isLegalTarget || disabled}
                    onClick={()=> selected && isLegalTarget && (()=> { const mv=legal.find(m=> m.to[0]===r&&m.to[1]===c); onMove(mv!.from,mv!.to,mv!.promotion); })()}
                    className={`w-full h-full flex items-center justify-center ${isLegalTarget?'cursor-pointer':''}`}>
                    {isLegalTarget && <span className="w-4 h-4 rounded-full bg-amber-700/60 border border-amber-900"/>}
                    {selected && !isLegalTarget && <span className="sr-only">empty</span>}
                  </button>
                )}
                {/* coordinates */}
                {c===7 && <span className={`absolute bottom-0.5 right-0.5 text-[8px] ${isLight?'text-[#8b5a2b]':'text-[#f0d9b5]'}`}>{8-r}</span>}
                {r===7 && <span className={`absolute top-0.5 left-0.5 text-[8px] ${isLight?'text-[#8b5a2b]':'text-[#f0d9b5]'}`}>{String.fromCharCode(97+c)}</span>}
              </div>
            );
          }))}
        </div>
      </div>
      <div className="mt-2 text-center text-xs text-slate-600">
        {state.status==='finished' ? (state.isDraw?'Stalemate — draw!':`Checkmate! ${state.players[state.winner!]?.name} wins`) : `${state.turnColor===0?'White':'Black'} to move`}
      </div>
    </div>
  );
}

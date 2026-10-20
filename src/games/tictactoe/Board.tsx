import { checkWinner, type TTTState } from './engine';

export function TicTacToeBoard({ state, onMove, disabled }: { state: TTTState; onMove: (i:number)=>void; disabled?: boolean }) {
  const res = checkWinner(state.board);
  const winningSet = new Set(res.line || []);
  return (
    <div className="mx-auto max-w-[360px]">
      <div className="grid grid-cols-3 gap-3 bg-[#fef3c7] p-4 rounded-[20px] shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-amber-200">
        {state.board.map((cell, idx) => {
          const isWin = winningSet.has(idx);
          return (
            <button
              key={idx}
              aria-label={`Cell ${idx+1} ${cell===null?'empty':cell===0?'X':'O'}`}
              disabled={disabled || cell!==null || state.status==='finished'}
              onClick={()=>onMove(idx)}
              className={`aspect-square rounded-2xl flex items-center justify-center text-4xl font-black transition-all
                ${cell===null ? 'bg-white hover:bg-amber-50 border-2 border-amber-200 hover:border-amber-400 hover:scale-[1.02] cursor-pointer' : 'bg-white border-2 border-slate-200'}
                ${isWin ? '!bg-amber-400 !border-amber-500 !text-white shadow-lg scale-[1.02]' : ''}
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500
                disabled:cursor-not-allowed`}
            >
              {cell===0 ? <span className="text-slate-800">✕</span> : cell===1 ? <span className="text-amber-600">○</span> : null}
            </button>
          );
        })}
      </div>
      {state.status==='finished' && (
        <div className="mt-4 text-center font-bold">
          {state.isDraw ? 'It’s a draw!' : `${state.players[state.winner!]?.name} wins!`}
        </div>
      )}
    </div>
  );
}

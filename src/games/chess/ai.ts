import { applyMoveClone, getLegalMoves, isInCheck, type ChessState } from './engine';

const pieceValues: Record<string,number> = { p:1,n:3,b:3,r:5,q:9,k:100 };

export function getBestMoveChess(state: ChessState, difficulty:'noob'|'master'|'god'): any {
  const moves=getLegalMoves(state);
  if(!moves.length) throw new Error('No moves');
  const aiColor = state.turnColor;
  if(difficulty==='noob'){
    const captures=moves.filter(m=> state.board[m.to[0]][m.to[1]]!==null);
    if(captures.length && Math.random()<0.3) return captures[Math.floor(Math.random()*captures.length)];
    return moves[Math.floor(Math.random()*moves.length)];
  }
  const depth = difficulty==='master'?2:3;

  function evalBoard(board:any[][], color:number){
    let s=0;
    for(let r=0;r<8;r++) for(let c=0;c<8;c++){
      const p=board[r][c];
      if(!p) continue;
      let v=pieceValues[p.type];
      if(p.type==='p') v+= (p.color===0? (7-r)*0.05 : r*0.05);
      if(p.type==='n' || p.type==='b') if(r>=2&&r<=5&&c>=2&&c<=5) v+=0.2;
      if(p.color===color) s+=v; else s-=v;
    }
    if(isInCheck(board as any, color===0?1:0)) s+=0.5;
    if(isInCheck(board as any, color as any)) s-=0.5;
    return s;
  }

  function search(s: ChessState, d:number, alpha:number, beta:number, isMax:boolean): number {
    const ms=getLegalMoves(s);
    if(d===0 || ms.length===0){
      if(ms.length===0){
        if(isInCheck(s.board, s.turnColor)) return isMax? -1000 : 1000;
        return 0;
      }
      return evalBoard(s.board, aiColor as number);
    }
    if(isMax){
      let best=-Infinity;
      for(const m of ms){
        const ns=applyMoveClone(s,m);
        const nextPlayer = s.currentPlayer===0?1:0;
        const child={...ns, currentPlayer: nextPlayer} as ChessState;
        const val=search(child, d-1, alpha, beta, false);
        best=Math.max(best,val);
        alpha=Math.max(alpha,val);
        if(beta<=alpha) break;
      }
      return best;
    } else {
      let best=Infinity;
      for(const m of ms){
        const ns=applyMoveClone(s,m);
        const nextPlayer = s.currentPlayer===0?1:0;
        const child={...ns, currentPlayer: nextPlayer} as ChessState;
        const val=search(child, d-1, alpha, beta, true);
        best=Math.min(best,val);
        beta=Math.min(beta,val);
        if(beta<=alpha) break;
      }
      return best;
    }
  }

  let bestMove=moves[0];
  let bestScore=-Infinity;
  const ordered=[...moves].sort((a,b)=>{
    const ca= state.board[a.to[0]][a.to[1]] ? 1:0;
    const cb= state.board[b.to[0]][b.to[1]] ? 1:0;
    return cb-ca;
  });
  for(const m of ordered){
    const ns=applyMoveClone(state,m);
    const nextPlayer= state.currentPlayer===0?1:0;
    const child={...ns, currentPlayer: nextPlayer} as ChessState;
    const score=search(child, depth-1, -Infinity, Infinity, false);
    const jitter = (difficulty==='master' ? (Math.random()*0.3) : 0);
    const finalScore=score+jitter;
    if(finalScore>bestScore){ bestScore=finalScore; bestMove=m; }
  }
  return bestMove;
}

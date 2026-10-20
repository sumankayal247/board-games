import { applyMoveCheckers, getAllMoves, getCaptureContinuations, type CheckersState, type Move } from './engine';

function evaluate(board:(any)[][], ai:number){
  let score=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    const p=board[r][c];
    if(!p) continue;
    let val= p.king? 1.5 : 1;
    // central control bonus
    if(c>=2&&c<=5) val+=0.1;
    // advancement bonus for men
    if(!p.king){
      if(p.player===0) val+= r*0.05;
      else val+= (7-r)*0.05;
    }
    if(p.player===ai) score+=val;
    else score-=val;
  }
  return score;
}

function cloneBoard(board:any[][]){ return board.map(r=> r.map(p=> p? {...p}: null)); }

function minimax(state: CheckersState, depth:number, maximizing:boolean, ai:number, alpha:number, beta:number): number {
  // check terminal
  if(depth===0){
    return evaluate(state.board, ai);
  }
  const moves=getAllMoves(state);
  if(moves.length===0){
    // current player loses
    return state.currentPlayer===ai ? -1000 - depth : 1000 + depth;
  }
  if(maximizing){
    let maxEval=-Infinity;
    for(const m of moves){
      const nb=cloneBoard(state.board);
      const piece=nb[m.from[0]][m.from[1]]!;
      nb[m.from[0]][m.from[1]]=null;
      nb[m.to[0]][m.to[1]]=piece;
      for(const [cr,cc] of m.captures) nb[cr][cc]=null;
      if(!piece.king){
        if((piece.player===0 && m.to[0]===7) || (piece.player===1 && m.to[0]===0)) piece.king=true;
      }
      // handle multi jumps: for evaluation, we can consider continuation as additional branching? Simplify: if continuation exists, we treat as same turn extended move, but for minimax we generate full sequence by continuing to apply captures greedily
      // For simplicity, if there are continuations, we recurse with same player after applying one jump (search will handle chain)
      let mustContinue=false;
      if(m.captures.length>0){
        const cont = getCaptureContinuations(nb, m.to, state.currentPlayer);
        if(cont.length>0) mustContinue=true;
      }
      const nextPlayer= mustContinue? state.currentPlayer : (state.currentPlayer===0?1:0);
      const child:CheckersState={...state, board:nb, currentPlayer: nextPlayer};
      const ev=minimax(child, depth-1, nextPlayer===ai, ai, alpha, beta);
      maxEval=Math.max(maxEval,ev);
      alpha=Math.max(alpha,ev);
      if(beta<=alpha) break;
    }
    return maxEval;
  } else {
    let minEval=Infinity;
    for(const m of moves){
      const nb=cloneBoard(state.board);
      const piece=nb[m.from[0]][m.from[1]]!;
      nb[m.from[0]][m.from[1]]=null;
      nb[m.to[0]][m.to[1]]=piece;
      for(const [cr,cc] of m.captures) nb[cr][cc]=null;
      if(!piece.king){
        if((piece.player===0 && m.to[0]===7) || (piece.player===1 && m.to[0]===0)) piece.king=true;
      }
      let mustContinue=false;
      if(m.captures.length>0){
        const cont=getCaptureContinuations(nb, m.to, state.currentPlayer);
        if(cont.length>0) mustContinue=true;
      }
      const nextPlayer= mustContinue? state.currentPlayer : (state.currentPlayer===0?1:0);
      const child:CheckersState={...state, board:nb, currentPlayer: nextPlayer};
      const ev=minimax(child, depth-1, nextPlayer===ai, ai, alpha, beta);
      minEval=Math.min(minEval,ev);
      beta=Math.min(beta,ev);
      if(beta<=alpha) break;
    }
    return minEval;
  }
}

export function getBestMoveCheckers(state: CheckersState, difficulty:'noob'|'master'|'god'): Move {
  const moves=getAllMoves(state);
  if(!moves.length) throw new Error('No moves');
  const ai=state.currentPlayer;
  if(difficulty==='noob'){
    // noob: prefers capture but random; 20% picks random even if better
    if(Math.random()<0.7) return moves[Math.floor(Math.random()*moves.length)];
    // else pick max capture
    let best=moves[0];
    // prefer moves that king
    for(const m of moves){
      if(m.captures.length>0 && best.captures.length===0) best=m;
    }
    return best;
  }
  const depth = difficulty==='master'?3:5;
  let bestMove=moves[0];
  let bestScore=-Infinity;
  for(const m of moves){
    const nb=cloneBoard(state.board);
    const piece=nb[m.from[0]][m.from[1]]!;
    nb[m.from[0]][m.from[1]]=null;
    nb[m.to[0]][m.to[1]]=piece;
    for(const [cr,cc] of m.captures) nb[cr][cc]=null;
    if(!piece.king){
      if((piece.player===0 && m.to[0]===7) || (piece.player===1 && m.to[0]===0)) piece.king=true;
    }
    let mustContinue=false;
    if(m.captures.length>0){
      const cont=getCaptureContinuations(nb, m.to, ai);
      if(cont.length>0) mustContinue=true;
    }
    const nextPlayer= mustContinue? ai : (ai===0?1:0);
    const child:CheckersState={...state, board:nb, currentPlayer: nextPlayer};
    const score=minimax(child, depth-1, nextPlayer===ai, ai, -Infinity, Infinity);
    if(score>bestScore){ bestScore=score; bestMove=m; }
  }
  return bestMove;
}

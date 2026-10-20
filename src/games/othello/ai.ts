import { getFlips, getLegalMovesOthello, type OthelloState } from './engine';

function evaluate(board:(number|null)[][], ai:number){
  // weighted table
  const weights = [
    [100,-20,10,5,5,10,-20,100],
    [-20,-50,-2,-2,-2,-2,-50,-20],
    [10,-2,-1,-1,-1,-1,-2,10],
    [5,-2,-1,-1,-1,-1,-2,5],
    [5,-2,-1,-1,-1,-1,-2,5],
    [10,-2,-1,-1,-1,-1,-2,10],
    [-20,-50,-2,-2,-2,-2,-50,-20],
    [100,-20,10,5,5,10,-20,100],
  ];
  let score=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(board[r][c]===ai) score+=weights[r][c];
    else if(board[r][c]!==null) score-=weights[r][c];
  }
  // mobility
  const opp=ai===0?1:0;
  let myMoves=0, oppMoves=0;
  for(let r=0;r<8;r++) for(let c=0;c<8;c++){
    if(board[r][c]===null){
      if(getFlips(board,r,c,ai).length>0) myMoves++;
      if(getFlips(board,r,c,opp).length>0) oppMoves++;
    }
  }
  score+= (myMoves-oppMoves)*5;
  return score;
}

function minimax(board:(number|null)[][], player:number, depth:number, ai:number, maximizing:boolean, alpha:number, beta:number): number {
  const hasMoves = (p:number)=> {
    for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(getFlips(board,r,c,p).length>0) return true;
    return false;
  };
  const opp=player===0?1:0;
  if(depth===0 || (!hasMoves(player) && !hasMoves(opp))){
    const [c0,c1]= (()=>{ let a=0,b=0; for(let r=0;r<8;r++) for(let c=0;c<8;c++){ if(board[r][c]===0) a++; else if(board[r][c]===1) b++; } return [a,b] as const; })();
    if(!hasMoves(player) && !hasMoves(opp)){
      if(ai===0) return c0>c1? 10000 : c0<c1? -10000 : 0;
      else return c1>c0?10000:-10000;
    }
    return evaluate(board, ai);
  }
  // if no moves, pass
  let moves:[number,number][]=[];
  for(let r=0;r<8;r++) for(let c=0;c<8;c++) if(getFlips(board,r,c,player).length>0) moves.push([r,c]);
  if(moves.length===0){
    return minimax(board, opp, depth-1, ai, !maximizing, alpha, beta);
  }
  if(maximizing){
    let maxEval=-Infinity;
    for(const [r,c] of moves){
      const nb=board.map(row=>[...row]);
      const flips=getFlips(nb,r,c,player);
      nb[r][c]=player;
      for(const [fr,fc] of flips) nb[fr][fc]=player;
      const ev=minimax(nb, opp, depth-1, ai, false, alpha, beta);
      maxEval=Math.max(maxEval,ev);
      alpha=Math.max(alpha,ev);
      if(beta<=alpha) break;
    }
    return maxEval;
  } else {
    let minEval=Infinity;
    for(const [r,c] of moves){
      const nb=board.map(row=>[...row]);
      const flips=getFlips(nb,r,c,player);
      nb[r][c]=player;
      for(const [fr,fc] of flips) nb[fr][fc]=player;
      const ev=minimax(nb, opp, depth-1, ai, true, alpha, beta);
      minEval=Math.min(minEval,ev);
      beta=Math.min(beta,ev);
      if(beta<=alpha) break;
    }
    return minEval;
  }
}

export function getBestMoveOthello(state: OthelloState, difficulty:'noob'|'master'|'god'): [number,number] {
  const moves=getLegalMovesOthello(state);
  if(!moves.length) throw new Error('No moves');
  const ai=state.currentPlayer;
  if(difficulty==='noob'){
    // random, but sometimes picks max flips 30% chance
    if(Math.random()<0.3){
      let best=moves[0]; let bestFlips=0;
      for(const [r,c] of moves){ const f=getFlips(state.board,r,c,ai).length; if(f>bestFlips){ bestFlips=f; best=[r,c]; } }
      return best;
    }
    return moves[Math.floor(Math.random()*moves.length)];
  }
  if(difficulty==='master'){
    // greedy max flips with mobility weight 20% randomness
    if(Math.random()<0.2) return moves[Math.floor(Math.random()*moves.length)];
    let best=moves[0]; let bestScore=-Infinity;
    for(const [r,c] of moves){
      const flips=getFlips(state.board,r,c,ai).length;
      // corner bonus
      let bonus=0;
      if((r===0&&c===0)||(r===0&&c===7)||(r===7&&c===0)||(r===7&&c===7)) bonus=10;
      const score=flips+bonus;
      if(score>bestScore){ bestScore=score; best=[r,c]; }
    }
    return best;
  }
  // god minimax depth 4
  let best=moves[0]; let bestScore=-Infinity;
  for(const [r,c] of moves){
    const nb=state.board.map(row=>[...row]);
    const flips=getFlips(nb,r,c,ai);
    nb[r][c]=ai;
    for(const [fr,fc] of flips) nb[fr][fc]=ai;
    const opp=ai===0?1:0;
    const score=minimax(nb, opp, 3, ai, false, -Infinity, Infinity);
    if(score>bestScore){ bestScore=score; best=[r,c]; }
  }
  return best;
}

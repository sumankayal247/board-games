import { checkWinnerC4, getLegalMovesC4, type Connect4State } from './engine';

function evaluateBoard(board:(number|null)[][], ai:number){
  // simple heuristic: count windows of 4
  const opp = ai===0?1:0;
  let score=0;
  const scoreWindow = (window:(number|null)[])=>{
    let aiCount=0, oppCount=0, empty=0;
    for(const v of window){ if(v===ai) aiCount++; else if(v===opp) oppCount++; else empty++; }
    if(aiCount===4) return 100;
    if(aiCount===3 && empty===1) return 5;
    if(aiCount===2 && empty===2) return 2;
    if(oppCount===3 && empty===1) return -4;
    return 0;
  };
  // center preference
  let centerCount=0;
  for(let r=0;r<6;r++) if(board[r][3]===ai) centerCount++;
  score+= centerCount*3;
  // horizontal
  for(let r=0;r<6;r++) for(let c=0;c<4;c++){ const w=[board[r][c],board[r][c+1],board[r][c+2],board[r][c+3]]; score+=scoreWindow(w); }
  // vertical
  for(let c=0;c<7;c++) for(let r=0;r<3;r++){ const w=[board[r][c],board[r+1][c],board[r+2][c],board[r+3][c]]; score+=scoreWindow(w); }
  // diag
  for(let r=0;r<3;r++) for(let c=0;c<4;c++){ const w=[board[r][c],board[r+1][c+1],board[r+2][c+2],board[r+3][c+3]]; score+=scoreWindow(w); }
  for(let r=3;r<6;r++) for(let c=0;c<4;c++){ const w=[board[r][c],board[r-1][c+1],board[r-2][c+2],board[r-3][c+3]]; score+=scoreWindow(w); }
  return score;
}

function minimax(board:(number|null)[][], depth:number, alpha:number, beta:number, maximizing:boolean, ai:number): {score:number, col:number|null}{
  const winner=checkWinnerC4(board);
  const moves:number[]=[];
  for(let c=0;c<7;c++) if(board[0][c]===null) moves.push(c);
  const isTerminal = winner!==null || moves.length===0 || depth===0;
  if(depth===0 || isTerminal){
    if(winner===ai) return {score: 100000 + depth, col: null};
    if(winner!==null) return {score: -100000 - depth, col: null};
    if(moves.length===0) return {score:0, col:null};
    return {score: evaluateBoard(board, ai), col:null};
  }
  // order moves center first for better pruning
  const order=[3,2,4,1,5,0,6];
  const ordered = order.filter(c=>moves.includes(c));
  if(maximizing){
    let value=-Infinity; let bestCol=ordered[0];
    for(const col of ordered){
      const newBoard= board.map(r=>[...r]);
      // drop
      for(let r=5;r>=0;r--) if(newBoard[r][col]===null){ newBoard[r][col]=ai; break; }
      const res=minimax(newBoard, depth-1, alpha, beta, false, ai);
      if(res.score>value){ value=res.score; bestCol=col; }
      alpha=Math.max(alpha,value);
      if(alpha>=beta) break;
    }
    return {score:value, col:bestCol};
  } else {
    const opp=ai===0?1:0;
    let value=Infinity; let bestCol=ordered[0];
    for(const col of ordered){
      const newBoard= board.map(r=>[...r]);
      for(let r=5;r>=0;r--) if(newBoard[r][col]===null){ newBoard[r][col]=opp; break; }
      const res=minimax(newBoard, depth-1, alpha, beta, true, ai);
      if(res.score<value){ value=res.score; bestCol=col; }
      beta=Math.min(beta,value);
      if(alpha>=beta) break;
    }
    return {score:value, col:bestCol};
  }
}

export function getBestMoveC4(state: Connect4State, difficulty:'noob'|'master'|'god'): number {
  const moves=getLegalMovesC4(state);
  if(!moves.length) throw new Error('No moves');
  const ai=state.currentPlayer;
  if(difficulty==='noob'){
    // noob: random with 25% chance to block win, 25% to win
    // try win
    for(const col of moves){
      const copy= state.board.map(r=>[...r]);
      for(let r=5;r>=0;r--) if(copy[r][col]===null){ copy[r][col]=ai; break; }
      if(checkWinnerC4(copy)===ai && Math.random()<0.6) return col;
    }
    // block opponent win
    const opp=ai===0?1:0;
    for(const col of moves){
      const copy= state.board.map(r=>[...r]);
      for(let r=5;r>=0;r--) if(copy[r][col]===null){ copy[r][col]=opp; break; }
      if(checkWinnerC4(copy)===opp && Math.random()<0.4) return col;
    }
    return moves[Math.floor(Math.random()*moves.length)];
  }
  if(difficulty==='master'){
    const res=minimax(state.board.map(r=>[...r]), 4, -Infinity, Infinity, true, ai);
    return res.col ?? moves[0];
  }
  // god depth 6
  const res=minimax(state.board.map(r=>[...r]), 6, -Infinity, Infinity, true, ai);
  return res.col ?? moves[0];
}

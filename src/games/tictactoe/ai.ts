import { checkWinner, getLegalMoves, type TTTState } from './engine';

function minimax(board: (number|null)[], player: number, depth: number, isMax: boolean, aiPlayer: number): { score: number, move: number|null } {
  const res = checkWinner(board as any);
  if (res.winner === aiPlayer) return { score: 10 - depth, move: null };
  if (res.winner !== null) return { score: depth - 10, move: null };
  if (res.isDraw) return { score: 0, move: null };
  const moves = board.map((v,i)=> v===null?i:-1).filter(i=>i>=0);
  let bestMove: number|null = null;
  let bestScore = isMax ? -Infinity : Infinity;
  for (const m of moves) {
    board[m] = player;
    const nextPlayer = player===0?1:0;
    const evalRes = minimax(board, nextPlayer, depth+1, !isMax, aiPlayer);
    board[m] = null;
    if (isMax) {
      if (evalRes.score > bestScore) { bestScore = evalRes.score; bestMove = m; }
    } else {
      if (evalRes.score < bestScore) { bestScore = evalRes.score; bestMove = m; }
    }
  }
  return { score: bestScore, move: bestMove };
}

export function getBestMove(state: TTTState, difficulty: 'noob'|'master'|'god'): number {
  const moves = getLegalMoves(state);
  if (moves.length===0) throw new Error('No moves');
  const aiPlayer = state.currentPlayer;
  if (difficulty==='noob') {
    // Noob: 50% random, 50% try win/block else random; sometimes miss block
    const board: (number|null)[] = [...state.board];
    // Try win
    for (const m of moves) {
      board[m]=aiPlayer;
      if (checkWinner(board as any).winner===aiPlayer) { board[m]=null; if (Math.random()<0.7) return m; }
      board[m]=null;
    }
    // Try block with 50% chance to miss
    const opp = aiPlayer===0?1:0;
    for (const m of moves) {
      board[m]=opp;
      if (checkWinner(board as any).winner===opp) { board[m]=null; if (Math.random()<0.5) return m; else break; }
      board[m]=null;
    }
    return moves[Math.floor(Math.random()*moves.length)];
  }
  if (difficulty==='master') {
    // Master: minimax but with chance to not be perfect if depth limited
    // Use minimax but inject 20% randomness
    if (Math.random()<0.2) return moves[Math.floor(Math.random()*moves.length)];
    const res = minimax([...state.board], aiPlayer, 0, true, aiPlayer);
    return res.move ?? moves[0];
  }
  // God: perfect minimax
  const res = minimax([...state.board], aiPlayer, 0, true, aiPlayer);
  return res.move ?? moves[0];
}

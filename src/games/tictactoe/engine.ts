import type { BaseGameState, PlayerConfig, MoveRecord } from '../../types';

export type TTTCell = null | 0 | 1; // 0 = X (player0), 1 = O (player1)
export interface TTTState extends BaseGameState {
  board: TTTCell[]; // 9 length
}

export function createTTTState(players: PlayerConfig[]): TTTState {
  const now = Date.now();
  return {
    gameId: 'tictactoe',
    matchId: `ttt-${now}-${Math.random().toString(36).slice(2,6)}`,
    players,
    currentPlayer: 0,
    board: Array(9).fill(null),
    status: 'playing',
    winner: null,
    isDraw: false,
    moveHistory: [],
    createdAt: now,
    updatedAt: now,
    durationSeconds: 0,
  };
}

export const winningLines = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6]
];

export function checkWinner(board: TTTCell[]): { winner: number | null, line: number[] | null, isDraw: boolean } {
  for (const line of winningLines) {
    const [a,b,c] = line;
    if (board[a] !== null && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a]!, line, isDraw: false };
    }
  }
  if (board.every(c => c !== null)) return { winner: null, line: null, isDraw: true };
  return { winner: null, line: null, isDraw: false };
}

export function getLegalMoves(state: TTTState): number[] {
  if (state.status === 'finished') return [];
  return state.board.map((v,i)=> v===null ? i : -1).filter(i=> i>=0);
}

export function applyMove(state: TTTState, index: number): { next: TTTState, error?: string } {
  if (state.status === 'finished') return { next: state, error: 'Game already finished.' };
  if (index <0 || index >8) return { next: state, error: 'Invalid square.' };
  if (state.board[index] !== null) return { next: state, error: 'Square already taken.' };
  const board = [...state.board] as TTTCell[];
  board[index] = state.currentPlayer as 0|1;
  const res = checkWinner(board);
  const move: MoveRecord = { playerIndex: state.currentPlayer, move: index, timestamp: Date.now(), notation: `P${state.currentPlayer+1}@${index}` };
  let status: TTTState['status'] = 'playing';
  let winner: number|null = null;
  let isDraw = false;
  if (res.winner !== null) { status='finished'; winner=res.winner; }
  else if (res.isDraw) { status='finished'; isDraw=true; }
  const next: TTTState = {
    ...state,
    board,
    currentPlayer: status==='finished' ? state.currentPlayer : (state.currentPlayer === 0 ? 1 : 0),
    status,
    winner,
    isDraw,
    moveHistory: [...state.moveHistory, move],
    updatedAt: Date.now(),
  };
  return { next };
}

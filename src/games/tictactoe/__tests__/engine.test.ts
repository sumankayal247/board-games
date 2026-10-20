import { describe, it, expect } from 'vitest';
import { createTTTState, applyMove, checkWinner, winningLines } from '../engine';

const players:any=[{id:'p0',name:'A',type:'human',avatar:'🦊',color:'#000'},{id:'p1',name:'B',type:'human',avatar:'🐼',color:'#fff'}];

describe('TicTacToe engine',()=>{
  it('creates empty board',()=>{
    const s=createTTTState(players);
    expect(s.board.every(v=>v===null)).toBe(true);
    expect(s.status).toBe('playing');
  });
  it('detects win',()=>{
    let s=createTTTState(players);
    // X wins top row: moves 0,3,1,4,2
    const moves=[0,3,1,4,2];
    for(const m of moves){ const r=applyMove(s,m); s=r.next; }
    expect(s.winner).toBe(0);
    expect(s.status).toBe('finished');
  });
  it('detects draw',()=>{
    let s=createTTTState(players);
    const moves=[0,1,2,4,3,5,7,6,8]; // draw sequence
    for(const m of moves){ const r=applyMove(s,m); s=r.next; }
    expect(s.isDraw).toBe(true);
    expect(s.winner).toBeNull();
  });
  it('rejects illegal move',()=>{
    let s=createTTTState(players);
    let r=applyMove(s,0); s=r.next;
    const r2=applyMove(s,0);
    expect(r2.error).toBeDefined();
    expect(r2.next.board[0]).toBe(0);
  });
  it('AI never illegal', async ()=>{
    const { getBestMove } = await import('../ai');
    let s=createTTTState(players);
    // play random via AI until finished 10 times
    for(let i=0;i<10;i++){
      let state=createTTTState(players);
      while(state.status!=='finished'){
        const m=getBestMove(state,'god');
        expect([0,1,2,3,4,5,6,7,8]).toContain(m);
        expect(state.board[m]).toBeNull();
        const r=applyMove(state,m); state=r.next;
      }
    }
  });
});

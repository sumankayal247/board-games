import { describe, it, expect } from 'vitest';
import { createOthelloState, applyMoveOthello, getLegalMovesOthello } from '../engine';

const players:any=[{id:'p0',name:'A',type:'human',avatar:'🦊',color:'#000'},{id:'p1',name:'B',type:'human',avatar:'🐼',color:'#fff'}];

describe('Othello',()=>{
  it('starts with 4 discs',()=>{
    const s=createOthelloState(players);
    const count=s.board.flat().filter(v=>v!==null).length;
    expect(count).toBe(4);
  });
  it('legal moves exist',()=>{
    const s=createOthelloState(players);
    const moves=getLegalMovesOthello(s);
    expect(moves.length).toBeGreaterThan(0);
  });
  it('apply move flips',()=>{
    let s=createOthelloState(players);
    const moves=getLegalMovesOthello(s);
    const [r,c]=moves[0];
    const res=applyMoveOthello(s,r,c);
    expect(res.error).toBeUndefined();
    expect(res.next.board[r][c]).toBe(s.currentPlayer);
  });
  it('AI never illegal', async()=>{
    const { getBestMoveOthello } = await import('../ai');
    let s=createOthelloState(players);
    for(let i=0;i<10;i++){
      const moves=getLegalMovesOthello(s);
      if(moves.length===0) break;
      const [r,c]=getBestMoveOthello(s,'god');
      const flips=(await import('../engine')).getFlips(s.board,r,c,s.currentPlayer);
      expect(flips.length).toBeGreaterThan(0);
      const res=applyMoveOthello(s,r,c);
      s=res.next;
      if(s.status==='finished') break;
    }
  });
});

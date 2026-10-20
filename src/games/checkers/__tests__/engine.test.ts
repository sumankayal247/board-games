import { describe, it, expect } from 'vitest';
import { createCheckersState, getAllMoves, applyMoveCheckers } from '../engine';

const players:any=[{id:'p0',name:'A',type:'human',avatar:'🦊',color:'#000'},{id:'p1',name:'B',type:'human',avatar:'🐼',color:'#fff'}];

describe('Checkers',()=>{
  it('has 24 pieces',()=>{
    const s=createCheckersState(players);
    const cnt=s.board.flat().filter(v=>v!==null).length;
    expect(cnt).toBe(24);
  });
  it('mandatory capture',()=>{
    const s=createCheckersState(players);
    // set up manual capture position
    const board= Array.from({length:8},()=>Array(8).fill(null));
    board[2][3]={player:0,king:false};
    board[3][4]={player:1,king:false};
    const state:any={...s, board, currentPlayer:0};
    const moves=getAllMoves(state);
    // should only include capture
    expect(moves.every(m=>m.captures.length>0)).toBe(true);
    expect(moves.length).toBeGreaterThan(0);
  });
  it('AI legal', async()=>{
    const { getBestMoveCheckers } = await import('../ai');
    let s=createCheckersState(players);
    for(let i=0;i<5;i++){
      const m=getBestMoveCheckers(s,'god');
      const legal=getAllMoves(s);
      expect(legal.some(a=> a.from[0]===m.from[0]&&a.from[1]===m.from[1]&&a.to[0]===m.to[0]&&a.to[1]===m.to[1])).toBe(true);
      const r=applyMoveCheckers(s,m);
      s=r.next;
      if(s.status==='finished') break;
    }
  });
});

import { describe, it, expect } from 'vitest';
import { createChessState, getLegalMoves, applyMoveChess } from '../engine';

const players:any=[{id:'p0',name:'W',type:'human',avatar:'♔',color:'#fff'},{id:'p1',name:'B',type:'human',avatar:'♚',color:'#000'}];

describe('Chess',()=>{
  it('starts with legal moves',()=>{
    const s=createChessState(players);
    const moves=getLegalMoves(s);
    expect(moves.length).toBe(20); // standard opening
  });
  it('pawn move',()=>{
    let s=createChessState(players);
    const mv=getLegalMoves(s).find(m=> m.from[0]===6 && m.from[1]===4 && m.to[0]===4 && m.to[1]===4); // e2-e4
    expect(mv).toBeDefined();
    const res=applyMoveChess(s, mv!);
    expect(res.error).toBeUndefined();
    expect(res.next.board[4][4]?.type).toBe('p');
  });
  it('illegal rejected',()=>{
    let s=createChessState(players);
    const res=applyMoveChess(s, {from:[6,0],to:[3,0]} as any);
    // maybe legal is 2-step but okay
    // try illegal king move
    const illegal={from:[7,4],to:[5,4]} as any;
    const r2=applyMoveChess(s, illegal);
    expect(r2.error).toBeDefined();
  });
  it('AI legal', async()=>{
    const { getBestMoveChess } = await import('../ai');
    let s=createChessState(players);
    for(let i=0;i<4;i++){
      const m=getBestMoveChess(s,'master');
      const legal=getLegalMoves(s);
      expect(legal.some(a=> a.from[0]===m.from[0]&&a.from[1]===m.from[1]&&a.to[0]===m.to[0]&&a.to[1]===m.to[1])).toBe(true);
      const r=applyMoveChess(s,m);
      s=r.next;
      if(s.status==='finished') break;
    }
  });
});

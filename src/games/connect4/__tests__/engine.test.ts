import { describe, it, expect } from 'vitest';
import { createC4State, applyMoveC4, checkWinnerC4 } from '../engine';

const players:any=[{id:'p0',name:'A',type:'human',avatar:'🦊',color:'#000'},{id:'p1',name:'B',type:'human',avatar:'🐼',color:'#fff'}];

describe('Connect4',()=>{
  it('creates empty board',()=>{
    const s=createC4State(players);
    expect(s.board.flat().every(v=>v===null)).toBe(true);
  });
  it('detects vertical win',()=>{
    let s=createC4State(players);
    // column 0 four times alternating columns to let same player stack
    // sequence: 0,1,0,1,0,1,0 -> player0 gets 4 in col0
    const seq=[0,1,0,1,0,1,0];
    for(const col of seq){ const r=applyMoveC4(s,col); s=r.next; }
    expect(s.winner).toBe(0);
    expect(s.status).toBe('finished');
  });
  it('rejects full column',()=>{
    let s=createC4State(players);
    for(let i=0;i<6;i++){ const r=applyMoveC4(s,0); s=r.next; }
    const r2=applyMoveC4(s,0);
    expect(r2.error).toBeDefined();
  });
  it('AI picks legal', async()=>{
    const { getBestMoveC4 } = await import('../ai');
    let s=createC4State(players);
    for(let i=0;i<3;i++){ const mv=getBestMoveC4(s,'god'); expect(mv).toBeGreaterThanOrEqual(0); expect(mv).toBeLessThan(7); const r=applyMoveC4(s,mv); s=r.next; if(s.status==='finished') break; }
  });
});

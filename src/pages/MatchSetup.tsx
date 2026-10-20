import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { gamesCatalog } from '../data/games';
import type { PlayerConfig, AIDifficulty } from '../types';

const avatars=['🦊','🐼','🐯','🦁','🐨','🐵','🦄','🐶','🐱','🐰'];
const colors=['#e11d48','#0ea5e9','#16a34a','#f59e0b','#7c3aed','#0e7490','#dc2626','#1f2937'];

export function MatchSetup() {
  const { id }=useParams();
  const game=gamesCatalog.find(g=>g.id===id);
  const nav=useNavigate();
  const [playerCount,setPlayerCount]=useState(game? game.minPlayers : 2);
  const [players,setPlayers]=useState<PlayerConfig[]>(()=> {
    if(!game) return [];
    const cnt=game.minPlayers;
    return Array.from({length:cnt},(_,i)=> ({
      id:`p${i}`,
      name: i===0? 'You' : `Player ${i+1}`,
      type: i===0? 'human':'human',
      avatar: avatars[i%avatars.length],
      color: colors[i%colors.length],
      difficulty: 'noob' as AIDifficulty
    }));
  });
  useEffect(()=>{
    if(!game) return;
    // ensure playerCount within bounds
    const clamped=Math.max(game.minPlayers, Math.min(game.maxPlayers, playerCount));
    if(clamped!==playerCount) setPlayerCount(clamped);
  },[game, playerCount]);

  useEffect(()=>{
    // sync players array length to count
    setPlayers(prev=>{
      const arr=[...prev];
      while(arr.length<playerCount){
        const i=arr.length;
        arr.push({id:`p${i}`, name:`Player ${i+1}`, type:'human', avatar:avatars[i%avatars.length], color: colors[i%colors.length], difficulty:'noob'});
      }
      while(arr.length>playerCount) arr.pop();
      return arr;
    });
  },[playerCount]);

  if(!game) return <div className="p-8">Game not found</div>;
  if(game.status!=='playable') return (
    <div className="max-w-[720px] mx-auto p-8 text-center bg-white rounded-2xl border border-slate-200 mt-8">
      <div className="text-4xl">{game.icon}</div>
      <h2 className="font-black text-xl mt-2">{game.name} — Coming Soon</h2>
      <p className="text-slate-600 mt-2">Gameplay for this title is not yet implemented. Browse the library for playable games.</p>
      <Link to="/library" className="inline-block mt-4 px-5 py-2 bg-slate-900 text-white rounded-full font-bold">Back to Library</Link>
    </div>
  );

  const canStart = players.length>=game.minPlayers && players.length<=game.maxPlayers && players.every(p=> p.name.trim().length>0) && players.filter(p=>p.type==='computer').every(p=> !!p.difficulty);

  function toggleType(idx:number){
    if(!game!.supportsAI) return;
    setPlayers(prev=> prev.map((p,i)=> i===idx? {...p, type: p.type==='human'?'computer':'human', difficulty: p.difficulty||'noob'}:p));
  }
  function update(idx:number, patch:Partial<PlayerConfig>){
    setPlayers(prev=> prev.map((p,i)=> i===idx? {...p,...patch}:p));
  }
  function start(){
    if(!canStart) return;
    const matchId=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
    sessionStorage.setItem(`setup-${id}`, JSON.stringify({ matchId, players, playerCount }));
    nav(`/game/${id}/play?match=${matchId}`);
  }

  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 py-6">
        <Link to={`/game/${id}`} className="text-sm font-bold text-slate-600">← Back to {game.name}</Link>
        <h1 className="text-[24px] font-black mt-3">Match Setup — {game.name}</h1>
        <p className="text-sm text-slate-600">Configure players. Mix humans and computers where supported. You’ll play locally on this device.</p>

        <div className="mt-4 bg-white rounded-[20px] border border-slate-200 p-5">
          <div className="flex items-center justify-between">
            <h3 className="font-black">Players</h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-600">Count:</span>
              <div className="flex items-center gap-1">
                <button disabled={playerCount<=game.minPlayers} onClick={()=>setPlayerCount(c=>c-1)} className="w-8 h-8 rounded-full border border-slate-200 bg-white disabled:opacity-40">−</button>
                <span className="w-8 text-center font-bold">{playerCount}</span>
                <button disabled={playerCount>=game.maxPlayers} onClick={()=>setPlayerCount(c=>c+1)} className="w-8 h-8 rounded-full border border-slate-200 bg-white disabled:opacity-40">+</button>
              </div>
              <span className="text-xs text-slate-500 ml-2">Allowed: {game.minPlayers}–{game.maxPlayers}</span>
            </div>
          </div>

          <div className="mt-4 grid gap-3">
            {players.map((p,i)=>(
              <div key={p.id} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center p-3 rounded-2xl border bg-slate-50 border-slate-200">
                <div className="flex items-center gap-3 flex-1 w-full">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 bg-white" style={{borderColor:p.color}}>{p.avatar}</div>
                  <input value={p.name} onChange={e=>update(i,{name:e.target.value})} className="flex-1 px-3 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-400" placeholder="Player name"/>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button onClick={()=>toggleType(i)} disabled={!game.supportsAI} className={`flex-1 sm:flex-none px-4 py-2 rounded-full text-sm font-bold border transition ${p.type==='human'?'bg-white border-slate-200':'bg-slate-900 text-white border-slate-900'}`}>
                    {p.type==='human'?'Human':'Computer'}
                  </button>
                  {p.type==='computer' && game.supportsAI && (
                    <select value={p.difficulty} onChange={e=>update(i,{difficulty:e.target.value as AIDifficulty})} className="px-3 py-2 rounded-full border border-slate-200 bg-white text-sm font-semibold">
                      <option value="noob">Noob</option>
                      <option value="master">Master</option>
                      <option value="god">God</option>
                    </select>
                  )}
                  <input type="color" value={p.color} onChange={e=>update(i,{color:e.target.value})} className="w-8 h-8 rounded-full border border-slate-200 p-0.5"/>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-600 bg-amber-50 border border-amber-200 rounded-xl p-3">
            <span>💡</span>
            <span>
              {game.supportsAI ? 'Tip: Noob makes weak moves, Master is competitive, God uses deeper search.' : 'This game is human-only in this release. AI coming soon.'}
            </span>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={start} disabled={!canStart} className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-full font-black disabled:opacity-40 hover:bg-slate-800 transition">Start Match →</button>
            <Link to={`/game/${id}`} className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold">Cancel</Link>
          </div>
          {!canStart && <div className="mt-2 text-xs text-rose-600">Please fill all player names and select AI difficulties.</div>}
        </div>

        <div className="mt-4 bg-white rounded-[20px] border border-slate-200 p-4 text-xs text-slate-600">
          <div className="font-bold text-slate-800">Rules reminder</div>
          <div className="mt-1">{game.instructions.objective} • {game.instructions.winning}</div>
        </div>
      </div>
    </div>
  );
}

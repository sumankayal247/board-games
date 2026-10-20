import { Link, useParams } from 'react-router-dom';
import { gamesCatalog } from '../data/games';

export function GameDetail() {
  const { id }=useParams();
  const game=gamesCatalog.find(g=>g.id===id);
  if(!game) return <div className="p-8 text-center">Game not found. <Link to="/library" className="underline">Go to Library</Link></div>;
  const statusMeta:Record<string,{label:string;cls:string}>={
    playable:{label:'Playable',cls:'bg-emerald-500 text-white'},
    prototype:{label:'Prototype',cls:'bg-amber-400 text-slate-900'},
    coming_soon:{label:'Coming Soon',cls:'bg-slate-200 text-slate-700'},
    unavailable:{label:'Unavailable',cls:'bg-rose-200 text-rose-800'}
  };
  const s=statusMeta[game.status];
  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6">
        <Link to="/library" className="text-sm font-bold text-slate-600 hover:text-slate-900">← Back to Library</Link>
        <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <div className="bg-white rounded-[24px] border border-slate-200 overflow-hidden shadow-sm">
            <div className="h-[240px] flex items-center justify-center relative" style={{background: game.accent}}>
              <div className="text-[84px]">{game.icon}</div>
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-bold">{game.category.join(' • ')}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-xl border border-slate-200 text-xs">
                <div className="font-bold">{game.minPlayers===game.maxPlayers? `${game.minPlayers} Players`:`${game.minPlayers}–${game.maxPlayers} Players`} • {game.estimatedDuration}</div>
                <div className="text-slate-600">Difficulty: {game.difficulty} • {game.supportsAI? `AI: ${game.supportedAIDifficulties.join('/')}`:'No AI yet'}</div>
              </div>
            </div>
            <div className="p-6">
              <h1 className="text-[26px] font-black text-slate-900">{game.name}</h1>
              <p className="mt-2 text-[15px] leading-relaxed text-slate-600">{game.longDescription}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {game.features.map(f=> <span key={f} className="text-xs px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-full font-semibold">{f}</span>)}
              </div>
              <div className="mt-6 flex gap-3">
                {game.status==='playable' ? (
                  <Link to={`/game/${game.id}/setup`} className="flex-1 text-center px-6 py-3 bg-slate-900 text-white rounded-full font-bold hover:bg-slate-800 transition">Play Now →</Link>
                ) : (
                  <span className="flex-1 text-center px-6 py-3 bg-slate-100 text-slate-400 rounded-full font-bold cursor-not-allowed">Coming Soon</span>
                )}
                <a href="#rules" className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold hover:bg-slate-50">How to Play</a>
              </div>
              {game.status!=='playable' && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                  This game is catalogued but not yet playable. Status: <b>{s.label}</b>. AI: {game.supportsAI?'Planned':'Coming Soon'}.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-[20px] border border-slate-200 p-5">
              <h3 className="font-black text-slate-900">Quick facts</h3>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-slate-500 text-xs">Players</dt><dd className="font-bold">{game.minPlayers===game.maxPlayers? game.minPlayers : `${game.minPlayers}–${game.maxPlayers}`}</dd></div>
                <div><dt className="text-slate-500 text-xs">Duration</dt><dd className="font-bold">{game.estimatedDuration}</dd></div>
                <div><dt className="text-slate-500 text-xs">Category</dt><dd className="font-bold">{game.category.join(', ')}</dd></div>
                <div><dt className="text-slate-500 text-xs">AI</dt><dd className="font-bold">{game.supportsAI? game.supportedAIDifficulties.join(', ') : 'Coming Soon'}</dd></div>
              </dl>
              <div className="mt-4 flex flex-wrap gap-1">
                {game.tags.map(t=> <span key={t} className="text-[11px] px-2 py-1 bg-amber-50 border border-amber-200 rounded-full">{t}</span>)}
              </div>
            </div>

            <div id="rules" className="bg-white rounded-[20px] border border-slate-200 p-5">
              <h3 className="font-black text-slate-900">How to Play</h3>
              <div className="mt-3 space-y-3 text-sm leading-relaxed">
                <div><div className="font-bold text-slate-800">Objective</div><div className="text-slate-600">{game.instructions.objective}</div></div>
                <div><div className="font-bold text-slate-800">Setup</div><div className="text-slate-600">{game.instructions.setup}</div></div>
                <div><div className="font-bold text-slate-800">Turn Structure</div><div className="text-slate-600">{game.instructions.turnStructure}</div></div>
                <div><div className="font-bold text-slate-800">Legal Moves</div><div className="text-slate-600">{game.instructions.legalMoves}</div></div>
                <div><div className="font-bold text-slate-800">How the Game Ends</div><div className="text-slate-600">{game.instructions.ending}</div></div>
                <div><div className="font-bold text-slate-800">Winning</div><div className="text-slate-600">{game.instructions.winning}</div></div>
                {game.instructions.rulesetNote && <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700"><b>Ruleset:</b> {game.instructions.rulesetNote}</div>}
              </div>
            </div>

            <div className="bg-white rounded-[20px] border border-slate-200 p-5">
              <h3 className="font-black text-slate-900">Implementation status</h3>
              <div className="mt-2 text-sm text-slate-600">
                <div>Status: <span className={`px-2 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span></div>
                <div className="mt-2">Supported modes: {game.features.join(' • ')}</div>
                {game.status==='playable' ? (
                  <div className="mt-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs">✅ This implementation uses the rules described above. AI difficulties (Noob/Master/God) differ in search depth and evaluation.</div>
                ) : (
                  <div className="mt-3 p-3 bg-slate-100 border border-slate-200 rounded-xl text-xs">🚧 Gameplay not yet implemented. Check back — playable builds are added without fake placeholders.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

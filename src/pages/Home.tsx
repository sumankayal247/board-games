import { Link } from 'react-router-dom';
import { gamesCatalog } from '../data/games';
import { GameCard } from '../components/GameCard';

export function Home() {
  const featured=gamesCatalog.filter(g=> g.status==='playable').slice(0,6);
  const popular=gamesCatalog.filter(g=> ['Chess','Ludo','Monopoly','Scrabble','Risk','Go'].includes(g.name)).slice(0,4);
  const categories=[
    {label:'All Games', icon:'🎲', filter:'/library'},
    {label:'Board Games', icon:'♟️', filter:'/library?cat=Board'},
    {label:'Card Games', icon:'🃏', filter:'/library?cat=Card'},
    {label:'Strategy', icon:'🧠', filter:'/library?cat=Strategy'},
    {label:'Family', icon:'👨‍👩‍👧', filter:'/library?cat=Family'},
    {label:'2 Player', icon:'⚔️', filter:'/library?cat=2 Players'},
  ];
  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-10 sm:py-14 grid md:grid-cols-[1.1fr_0.9fr] gap-8 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold">
              ✨ New — Chess & Othello AI now with God difficulty!
            </div>
            <h1 className="mt-4 text-[36px] sm:text-[48px] font-black leading-[0.95] tracking-tight text-slate-900">
              Board Games <br/><span className="bg-gradient-to-r from-amber-500 to-rose-500 bg-clip-text text-transparent">for everyone</span>
            </h1>
            <p className="mt-4 text-[17px] leading-relaxed text-slate-600 max-w-[560px]">
              Browse 19 classics, learn the rules in 30 seconds, and start playing — local multiplayer or against clever computer opponents. No account needed.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/library" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold shadow hover:bg-slate-800 transition">Browse Games →</Link>
              <Link to="/library" className="px-6 py-3 bg-white border border-slate-200 rounded-full font-bold hover:bg-slate-50 transition">Start Playing</Link>
            </div>
            <div className="mt-6 flex items-center gap-6 text-sm text-slate-600">
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-emerald-500 rounded-full"/> 7 Playable now</span>
              <span className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-400 rounded-full"/> No fake AI</span>
              <span className="flex items-center gap-2">📱 Mobile ready</span>
            </div>
          </div>
          <div className="relative">
            <div className="bg-white rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-200 p-4 sm:p-6">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#fef3c7] rounded-2xl p-3 flex flex-col items-center border border-amber-200">
                  <span className="text-3xl">⭕</span><span className="text-xs font-bold mt-1">Tic-Tac-Toe</span><span className="text-[11px] text-slate-600">2–5 min</span>
                </div>
                <div className="bg-[#e0f2fe] rounded-2xl p-3 flex flex-col items-center border border-sky-200">
                  <span className="text-3xl">🔵</span><span className="text-xs font-bold mt-1">Connect Four</span><span className="text-[11px] text-slate-600">5–10 min</span>
                </div>
                <div className="bg-[#f3f4f6] rounded-2xl p-3 flex flex-col items-center border border-slate-200">
                  <span className="text-3xl">♞</span><span className="text-xs font-bold mt-1">Chess</span><span className="text-[11px] text-slate-600">15–45 min</span>
                </div>
                <div className="bg-[#ffe4e6] rounded-2xl p-3 flex flex-col items-center border border-rose-200">
                  <span className="text-3xl">🎲</span><span className="text-xs font-bold mt-1">Ludo</span><span className="text-[11px] text-slate-600">20–40 min</span>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-slate-900 text-white rounded-xl py-2"><div className="text-lg font-black">19</div><div className="text-[11px] opacity-70">Titles</div></div>
                <div className="bg-amber-400 text-slate-900 rounded-xl py-2"><div className="text-lg font-black">7</div><div className="text-[11px]">Playable</div></div>
                <div className="bg-white border border-slate-200 rounded-xl py-2"><div className="text-lg font-black">3</div><div className="text-[11px] text-slate-600">AI Levels</div></div>
              </div>
              <div className="mt-4 flex gap-2">
                <span className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden"><span className="block h-full w-[70%] bg-emerald-500"/></span>
                <span className="text-xs text-slate-500">Progressive rollout</span>
              </div>
            </div>
            <div className="absolute -z-10 -top-4 -right-4 w-24 h-24 bg-amber-300 rounded-full blur-2xl opacity-30"/>
            <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-rose-300 rounded-full blur-2xl opacity-30"/>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6">
        <h2 className="text-lg font-black text-slate-900">Explore by category</h2>
        <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-3">
          {categories.map(c=>(
            <Link key={c.label} to={c.filter} className="bg-white border border-slate-200 rounded-2xl p-3 text-center hover:shadow-md hover:border-slate-300 transition">
              <div className="text-2xl">{c.icon}</div><div className="text-xs font-bold mt-1 text-slate-800">{c.label}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[18px] font-black text-slate-900">Featured — Play Now</h2>
          <Link to="/library" className="text-sm font-bold text-amber-600 hover:text-amber-700">View all →</Link>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map(g=> <GameCard key={g.id} game={g}/>)}
        </div>
      </section>

      {/* Popular classic */}
      <section className="max-w-[1180px] mx-auto px-4 sm:px-6 mt-8 pb-8">
        <h2 className="text-[18px] font-black text-slate-900">Classics — Coming Soon as Playable</h2>
        <p className="text-sm text-slate-600 mt-1">These icons will graduate to fully playable with AI — they’re in the catalog today with accurate status.</p>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {popular.map(g=> <GameCard key={g.id} game={g}/>)}
        </div>
      </section>

      {/* Trust footer */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-8 grid sm:grid-cols-3 gap-6 text-sm">
          <div className="flex gap-3"><span className="text-xl">✅</span><div><div className="font-bold">No fake functionality</div><div className="text-slate-600">Playable means fully playable. Everything else is clearly labeled.</div></div></div>
          <div className="flex gap-3"><span className="text-xl">🤖</span><div><div className="font-bold">Real AI, three levels</div><div className="text-slate-600">Noob / Master / God differ in search depth and strategy — not just speed.</div></div></div>
          <div className="flex gap-3"><span className="text-xl">💾</span><div><div className="font-bold">Local persistence</div><div className="text-slate-600">Match history and in-progress games saved in your browser.</div></div></div>
        </div>
      </section>
    </div>
  );
}

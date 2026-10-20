import { Link, useLocation, useNavigate } from 'react-router-dom';

export function Header() {
  const loc=useLocation();
  const nav=useNavigate();
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-slate-200">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-rose-500 flex items-center justify-center text-white font-black text-lg shadow">B</div>
          <span className="font-black text-[22px] tracking-tight text-slate-900">Board Games</span>
          <span className="hidden sm:inline text-xs font-semibold px-2 py-1 bg-amber-100 text-amber-800 rounded-full ml-1">Playground</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <Link to="/" className={`px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition ${loc.pathname==='/'?'bg-slate-900 text-white':'hover:bg-slate-100 text-slate-700'}`}>Home</Link>
          <Link to="/library" className={`px-3 sm:px-4 py-2 rounded-full text-sm font-semibold transition ${loc.pathname.startsWith('/library')||loc.pathname.startsWith('/game')?'bg-slate-900 text-white':'hover:bg-slate-100 text-slate-700'}`}>Library</Link>
          <button onClick={()=>nav('/library')} className="hidden sm:inline-flex ml-1 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-900 rounded-full text-sm font-bold shadow">Start Playing →</button>
        </nav>
      </div>
    </header>
  );
}

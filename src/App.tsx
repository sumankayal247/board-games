import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { Library } from './pages/Library';
import { GameDetail } from './pages/GameDetail';
import { MatchSetup } from './pages/MatchSetup';
import { GamePlay } from './pages/GamePlay';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#fdf8ef] text-slate-900">
        <Header/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/library" element={<Library/>}/>
          <Route path="/game/:id" element={<GameDetail/>}/>
          <Route path="/game/:id/setup" element={<MatchSetup/>}/>
          <Route path="/game/:id/play" element={<GamePlay/>}/>
          <Route path="*" element={<Navigate to="/" replace/>}/>
        </Routes>
        <footer className="bg-white border-t border-slate-200 mt-auto">
          <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6 text-sm text-slate-600 flex flex-col sm:flex-row justify-between gap-2">
            <div>© {new Date().getFullYear()} Board Games — original designs, no branded assets. <span className="font-bold">7 playable</span> • 12 coming soon.</div>
            <div className="flex gap-3"><a href="#" className="hover:underline">Privacy</a><a href="#" className="hover:underline">Terms</a><a href="#" className="hover:underline">README</a></div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}

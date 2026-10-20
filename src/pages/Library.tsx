import { useMemo, useState } from 'react';
import { gamesCatalog } from '../data/games';
import { GameCard } from '../components/GameCard';
import { SearchBar } from '../components/SearchBar';
import { GameFilters, type FilterState } from '../components/GameFilters';

export function Library() {
  const [q,setQ]=useState('');
  const [filters,setFilters]=useState<FilterState>({ category:'all', status:'all', players:'all', ai:'all', sort:'featured'});
  const filtered=useMemo(()=>{
    let list=[...gamesCatalog];
    if(q.trim()){
      const qq=q.toLowerCase();
      list=list.filter(g=> g.name.toLowerCase().includes(qq) || g.category.join(' ').toLowerCase().includes(qq) || g.tags.join(' ').toLowerCase().includes(qq));
    }
    if(filters.category!=='all') list=list.filter(g=> g.category.includes(filters.category as any));
    if(filters.status!=='all') list=list.filter(g=> g.status===filters.status);
    if(filters.players!=='all'){
      if(filters.players==='2') list=list.filter(g=> g.minPlayers===2 && g.maxPlayers===2);
      else if(filters.players==='multi') list=list.filter(g=> g.maxPlayers>=3);
      else if(filters.players==='1') list=list.filter(g=> g.minPlayers===1);
    }
    if(filters.ai!=='all') list=list.filter(g=> filters.ai==='yes'? g.supportsAI : !g.supportsAI);
    if(filters.sort==='name-asc') list.sort((a,b)=> a.name.localeCompare(b.name));
    else if(filters.sort==='players') list.sort((a,b)=> a.maxPlayers-b.maxPlayers);
    else if(filters.sort==='duration') list.sort((a,b)=> a.estimatedMinutes[0]-b.estimatedMinutes[0]);
    return list;
  },[q,filters]);
  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h1 className="text-[24px] font-black text-slate-900">Game Library <span className="ml-2 text-sm font-bold text-slate-500">{filtered.length} titles</span></h1>
          <div className="text-xs text-slate-600 bg-white border border-slate-200 rounded-full px-3 py-1.5">Showing {filtered.length} of {gamesCatalog.length} • Playable {gamesCatalog.filter(g=>g.status==='playable').length} • Coming Soon {gamesCatalog.filter(g=>g.status==='coming_soon').length}</div>
        </div>
        <div className="mt-4 grid lg:grid-cols-[1.2fr_0.8fr] gap-3">
          <SearchBar value={q} onChange={setQ}/>
          <div className="flex items-center justify-end">
            <span className="text-sm text-slate-600 mr-2 hidden sm:inline">Filters:</span>
            <GameFilters value={filters} onChange={setFilters}/>
          </div>
        </div>

        {filtered.length===0 ? (
          <div className="mt-12 text-center bg-white border border-slate-200 rounded-[20px] p-10">
            <div className="text-4xl">🔍</div>
            <div className="font-bold mt-2">No games found.</div>
            <div className="text-sm text-slate-600">Try clearing filters or searching differently.</div>
            <button onClick={()=>{setQ(''); setFilters({category:'all',status:'all',players:'all',ai:'all',sort:'featured'})}} className="mt-4 px-5 py-2 bg-slate-900 text-white rounded-full font-bold">Clear Filters</button>
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(g=> <GameCard key={g.id} game={g}/>)}
          </div>
        )}
      </div>
    </div>
  );
}

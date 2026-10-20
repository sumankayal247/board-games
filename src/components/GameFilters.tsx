export type FilterState = {
  category: string;
  status: string;
  players: string;
  ai: string;
  sort: string;
};

export function GameFilters({ value, onChange }: { value:FilterState; onChange:(f:FilterState)=>void }) {
  const set=(k:keyof FilterState,v:string)=> onChange({...value,[k]:v});
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <select value={value.category} onChange={e=>set('category',e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold">
        <option value="all">All Categories</option>
        <option value="Board">Board</option>
        <option value="Card">Card</option>
        <option value="Classic">Classic</option>
        <option value="Strategy">Strategy</option>
        <option value="Family">Family</option>
        <option value="Abstract">Abstract</option>
        <option value="Word">Word</option>
        <option value="Party">Party</option>
      </select>
      <select value={value.status} onChange={e=>set('status',e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold">
        <option value="all">All Status</option>
        <option value="playable">Playable</option>
        <option value="coming_soon">Coming Soon</option>
        <option value="prototype">Prototype</option>
      </select>
      <select value={value.players} onChange={e=>set('players',e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold">
        <option value="all">Any Players</option>
        <option value="2">2 Players</option>
        <option value="multi">Multiplayer (3+)</option>
        <option value="1">Solo / 1 Player</option>
      </select>
      <select value={value.ai} onChange={e=>set('ai',e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold">
        <option value="all">AI Any</option>
        <option value="yes">With AI</option>
        <option value="no">No AI</option>
      </select>
      <select value={value.sort} onChange={e=>set('sort',e.target.value)} className="px-3 py-2 bg-white border border-slate-200 rounded-full text-sm font-semibold">
        <option value="featured">Featured</option>
        <option value="name-asc">Name A–Z</option>
        <option value="players">Player Count</option>
        <option value="duration">Duration</option>
      </select>
    </div>
  );
}

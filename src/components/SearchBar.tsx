export function SearchBar({ value, onChange, placeholder }: { value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <div className="relative flex-1">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
      <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder||'Search games, categories, tags...'}
        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 shadow-sm"/>
    </div>
  );
}

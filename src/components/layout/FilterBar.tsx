import { useStore } from '../../store/useStore';
import { ASSIGNEE_NAMES } from '../../utils/dataGenerator';

export function FilterBar() {
  const { filters, toggleFilter, setDateFilter, clearFilters, tasks: _tasks } = useStore();
  
  const hasFilters = filters.status.length > 0 || filters.priority.length > 0 || filters.assignee.length > 0 || filters.dateFrom || filters.dateTo;
  
  const statusOptions = ['todo', 'inprogress', 'inreview', 'done'] as const;
  const statusLabels: Record<string, string> = {todo:'To Do', inprogress:'In Progress', inreview:'In Review', done:'Done'};
  const priorityOptions = ['critical', 'high', 'medium', 'low'] as const;

  return (
    <div className="flex items-center gap-2 px-5 py-2 border-b border-[var(--border)] bg-[var(--bg1)] shrink-0 overflow-x-auto whitespace-nowrap scrollbar-thin">
      
      <span className="text-[11px] font-semibold text-[var(--text3)] tracking-[0.4px] uppercase shrink-0">Status</span>
      <div className="flex items-center gap-1 shrink-0">
        {statusOptions.map(s => (
          <button 
            key={s}
            onClick={() => toggleFilter('status', s)}
            className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full border text-[11px] font-medium cursor-pointer transition-all duration-120 
              ${filters.status.includes(s) 
                ? 'bg-[rgba(79,142,247,.15)] border-[rgba(79,142,247,.4)] text-[#93b8fb]' 
                : 'border-[var(--border2)] bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text1)]'}`}
          >
            {statusLabels[s]}
          </button>
        ))}
      </div>
      
      <div className="w-px h-4 bg-[var(--border2)] shrink-0 mx-1"></div>
      
      <span className="text-[11px] font-semibold text-[var(--text3)] tracking-[0.4px] uppercase shrink-0">Priority</span>
      <div className="flex items-center gap-1 shrink-0">
        {priorityOptions.map(p => (
          <button 
            key={p}
            onClick={() => toggleFilter('priority', p)}
            className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full border text-[11px] font-medium cursor-pointer transition-all duration-120 
              ${filters.priority.includes(p) 
                ? 'bg-[rgba(79,142,247,.15)] border-[rgba(79,142,247,.4)] text-[#93b8fb]' 
                : 'border-[var(--border2)] bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text1)]'}`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>
      
      <div className="w-px h-4 bg-[var(--border2)] shrink-0 mx-1"></div>
      
      <span className="text-[11px] font-semibold text-[var(--text3)] tracking-[0.4px] uppercase shrink-0">Assignee</span>
      <div className="flex items-center gap-1 shrink-0">
        {Object.entries(ASSIGNEE_NAMES).map(([k, v]) => (
          <button 
            key={k}
            onClick={() => toggleFilter('assignee', k)}
            className={`inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full border text-[11px] font-medium cursor-pointer transition-all duration-120 
              ${filters.assignee.includes(k as any) 
                ? 'bg-[rgba(79,142,247,.15)] border-[rgba(79,142,247,.4)] text-[#93b8fb]' 
                : 'border-[var(--border2)] bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text1)]'}`}
          >
            {v.split(' ')[0]}
          </button>
        ))}
      </div>
      
      <div className="w-px h-4 bg-[var(--border2)] shrink-0 mx-1"></div>
      
      <span className="text-[11px] font-semibold text-[var(--text3)] tracking-[0.4px] uppercase shrink-0">Due</span>
      <input 
        type="date" 
        value={filters.dateFrom} 
        onChange={(e) => setDateFilter('dateFrom', e.target.value)}
        className="px-2 py-[3px] rounded-[var(--radius)] border border-[var(--border2)] bg-[var(--bg3)] text-[var(--text1)] font-mono text-[11px] outline-none w-[110px] focus:border-[var(--accent)] transition-colors duration-150 [color-scheme:dark]"
      />
      <input 
        type="date" 
        value={filters.dateTo} 
        onChange={(e) => setDateFilter('dateTo', e.target.value)}
        className="px-2 py-[3px] rounded-[var(--radius)] border border-[var(--border2)] bg-[var(--bg3)] text-[var(--text1)] font-mono text-[11px] outline-none w-[110px] focus:border-[var(--accent)] transition-colors duration-150 [color-scheme:dark]"
      />
      
      {hasFilters && (
        <>
          <div className="w-px h-4 bg-[var(--border2)] shrink-0 mx-1"></div>
          <button 
            onClick={clearFilters}
            className="inline-flex items-center gap-1 px-[9px] py-[3px] rounded-full border border-[rgba(240,82,82,.35)] bg-transparent text-[#f87171] text-[11px] font-medium cursor-pointer transition-all duration-120 whitespace-nowrap hover:bg-[rgba(240,82,82,.1)]"
          >
            ✕ Clear filters
          </button>
        </>
      )}
    </div>
  );
}

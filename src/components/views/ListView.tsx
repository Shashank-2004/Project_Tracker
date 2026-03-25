import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../../store/useStore';
import { ASSIGNEE_NAMES, ASSIGNEE_COLORS } from '../../utils/dataGenerator';
import type { Status } from '../../types';

const ROW_H = 44;
const VBUF  = 5;
const THEAD_H = 40;

const PRIORITY_ORDER: Record<string, number> = {critical:0, high:1, medium:2, low:3};

function dueDateLabel(str: string | null, done: boolean) {
  if (!str) return { html: <span className="text-[var(--text3)]">—</span>, overdue: false, today: false };
  const t = new Date(str + 'T00:00:00');
  const n = new Date(); n.setHours(0,0,0,0);
  const diffDays = Math.round((n.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  
  if (!done && diffDays > 7) {
    return { html: <span className="text-[11px] text-[var(--red)] font-mono">⚠ {diffDays}d overdue</span>, overdue: true, today: false };
  }
  if (!done && diffDays === 0) {
    return { html: <span className="text-[11px] text-[var(--amber)] font-semibold font-mono">Due Today</span>, overdue: false, today: true };
  }
  if (!done && diffDays > 0) {
    return { html: <span className="text-[11px] text-[var(--red)] font-mono">⚠ {t.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>, overdue: true, today: false };
  }
  return { html: <span className="text-[11px] text-[var(--text3)] font-mono">{t.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>, overdue: false, today: false };
}

function priorityBadge(p: string) {
  const colors: Record<string, string> = {
    critical: 'bg-[rgba(240,82,82,.15)] text-[#f87171]',
    high: 'bg-[rgba(245,158,11,.15)] text-[#fbbf24]',
    medium: 'bg-[rgba(79,142,247,.15)] text-[#60a5fa]',
    low: 'bg-[rgba(34,197,94,.15)] text-[#4ade80]',
  };
  const label = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }[p] || p;
  return <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-[0.3px] uppercase ${colors[p]}`}>{label}</span>;
}

export function ListView() {
  const { tasks: rawTasks, filters, sort, setSort, moveTask } = useStore();
  
  const tasks = useMemo(() => {
    let list = rawTasks.filter(t => {
      if (filters.status.length && !filters.status.includes(t.status)) return false;
      if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(t.assignee)) return false;
      if (filters.dateFrom && t.due && t.due < filters.dateFrom) return false;
      if (filters.dateTo && t.due && t.due > filters.dateTo) return false;
      return true;
    });

    list.sort((a,b) => {
      let va: any, vb: any;
      if(sort.key === 'title') { va = a.title.toLowerCase(); vb = b.title.toLowerCase(); }
      else if(sort.key === 'priority') { va = PRIORITY_ORDER[a.priority] ?? 9; vb = PRIORITY_ORDER[b.priority] ?? 9; }
      else if(sort.key === 'due') { va = a.due || '9999'; vb = b.due || '9999'; }
      else if(sort.key === 'status') { va = a.status; vb = b.status; }
      else if(sort.key === 'assignee') { va = a.assignee; vb = b.assignee; }
      
      if(va < vb) return sort.dir === 'asc' ? -1 : 1;
      if(va > vb) return sort.dir === 'asc' ? 1 : -1;
      return 0;
    });
    
    return list;
  }, [rawTasks, filters, sort]);

  const wrapRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [clientHeight, setClientHeight] = useState(800);

  const handleScroll = useCallback(() => {
    if (!wrapRef.current) return;
    setScrollTop(Math.max(0, wrapRef.current.scrollTop - THEAD_H));
  }, []);

  useEffect(() => {
    if (wrapRef.current) {
      setClientHeight(wrapRef.current.clientHeight);
    }
    const updateSize = () => {
      if (wrapRef.current) setClientHeight(wrapRef.current.clientHeight);
    };
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  if (tasks.length === 0) {
    return (
      <div className="flex-1 p-4 md:p-5 overflow-hidden flex flex-col">
        <div className="flex flex-col items-center justify-center p-10 md:p-14 gap-3 flex-1 bg-[var(--bg1)] border border-[var(--border)] rounded-[var(--radius-xl)]">
          <div className="text-[32px] opacity-30">🔍</div>
          <div className="text-[15px] font-medium text-[var(--text2)]">No tasks match your filters</div>
          <div className="text-[13px] text-[var(--text3)]">Try adjusting your filters to find what you're looking for.</div>
        </div>
      </div>
    );
  }

  const viewH = Math.max(0, clientHeight - THEAD_H);
  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - VBUF);
  const end = Math.min(tasks.length, Math.ceil((scrollTop + viewH) / ROW_H) + VBUF);
  
  const visibleTasks = tasks.slice(start, end);

  const topH = start * ROW_H;
  const botH = (tasks.length - end) * ROW_H;

  const colHead = (label: string, k: any) => {
    const active = sort.key === k;
    const arrow = sort.dir === 'asc' ? '↑' : '↓';
    return (
      <th 
        onClick={() => setSort(k)}
        className={`px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.5px] uppercase sticky top-0 z-10 cursor-pointer whitespace-nowrap select-none transition-colors duration-150 bg-[var(--bg1)] border-b border-[var(--border)] 
          ${active ? 'text-[var(--accent)]' : 'text-[var(--text3)] hover:text-[var(--text1)]'}`}
      >
        {label}{active && <span className="ml-1 opacity-70 text-[10px]">{arrow}</span>}
      </th>
    );
  };

  return (
    <div className="flex-1 p-4 md:p-5 overflow-hidden flex flex-col gap-0 border-t border-[var(--border)] md:border-none">
      <div 
        ref={wrapRef} 
        onScroll={handleScroll}
        className="flex-1 overflow-auto border border-[var(--border)] rounded-md md:rounded-[var(--radius-xl)] bg-[var(--bg1)]"
      >
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr>
              {colHead('Title', 'title')}
              {colHead('Status', 'status')}
              {colHead('Priority', 'priority')}
              {colHead('Assignee', 'assignee')}
              {colHead('Due', 'due')}
              <th className="px-3.5 py-2.5 text-left text-[11px] font-semibold tracking-[0.5px] uppercase sticky top-0 z-10 whitespace-nowrap select-none bg-[var(--bg1)] border-b border-[var(--border)] text-[var(--text3)]">Tag</th>
            </tr>
          </thead>
          <tbody>
            {topH > 0 && <tr style={{ height: topH, border: 'none' }}><td colSpan={6} style={{ padding: 0, border: 'none' }}></td></tr>}
            {visibleTasks.map(t => {
              const done = t.status === 'done';
              const dd = dueDateLabel(t.due, done);
              const bg = ASSIGNEE_COLORS[t.assignee] || '#666';
              
              return (
                <tr key={t.id} className="border-b border-[var(--border)] transition-colors duration-100 hover:bg-[var(--bg2)]">
                  <td className="px-3.5 py-2.5 align-middle text-[13px]">
                    <div className="flex items-center gap-[7px]">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white" style={{ background: bg }}>
                        {t.assignee}
                      </div>
                      <span className="font-medium">{t.title}</span>
                    </div>
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]">
                    <select 
                      value={t.status}
                      onChange={(e) => moveTask(t.id, e.target.value as Status)}
                      className="appearance-none bg-[var(--bg3)] text-[var(--text1)] border border-[var(--border2)] rounded-md py-1 pr-5 pl-2 text-xs font-sans cursor-pointer outline-none transition-colors duration-150 focus:border-[var(--accent)]"
                      style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 16 16\' fill=\'%235c6170\'%3E%3Cpath d=\'M4 6l4 4 4-4\'/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 4px center', backgroundSize: '11px' }}
                    >
                      <option value="todo">To Do</option>
                      <option value="inprogress">In Progress</option>
                      <option value="inreview">In Review</option>
                      <option value="done">Done</option>
                    </select>
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]">
                    {priorityBadge(t.priority)}
                  </td>
                  <td className="px-3.5 py-2.5 text-xs text-[var(--text2)]">
                    {ASSIGNEE_NAMES[t.assignee] || t.assignee}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]">
                    {dd.html}
                  </td>
                  <td className="px-3.5 py-2.5 text-[13px]">
                    <span className="text-[10px] text-[var(--text3)] bg-[var(--bg3)] px-1.5 py-0.5 rounded font-mono">{t.tag || '—'}</span>
                  </td>
                </tr>
              );
            })}
            {botH > 0 && <tr style={{ height: botH, border: 'none' }}><td colSpan={6} style={{ padding: 0, border: 'none' }}></td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

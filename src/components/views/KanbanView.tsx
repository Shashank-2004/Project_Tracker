import { useMemo } from 'react';
import { useStore } from '../../store/useStore';
import { ASSIGNEE_COLORS, ASSIGNEE_NAMES } from '../../utils/dataGenerator';
import type { Status, Task } from '../../types';
import { useKanbanDnD } from '../../hooks/useKanbanDnD';

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'To Do', color: '#5c6170' },
  { id: 'inprogress', label: 'In Progress', color: '#4f8ef7' },
  { id: 'inreview', label: 'In Review', color: '#a78bfa' },
  { id: 'done', label: 'Done', color: '#22c55e' },
];

function priorityBadge({ priority }: Task) {
  const colors: Record<string, string> = {
    critical: 'bg-[rgba(240,82,82,.15)] text-[#f87171]',
    high: 'bg-[rgba(245,158,11,.15)] text-[#fbbf24]',
    medium: 'bg-[rgba(79,142,247,.15)] text-[#60a5fa]',
    low: 'bg-[rgba(34,197,94,.15)] text-[#4ade80]',
  };
  const label = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' }[priority] || priority;
  return <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full tracking-[0.3px] uppercase ${colors[priority]}`}>{label}</span>;
}

function dueDateLabel(str: string | null, done: boolean) {
  if (!str) return null;
  const t = new Date(str + 'T00:00:00');
  const n = new Date(); n.setHours(0,0,0,0);
  const diffDays = Math.round((n.getTime() - t.getTime()) / (1000 * 60 * 60 * 24));
  
  if (!done && diffDays > 7) return <span className="text-[11px] text-[var(--red)] font-mono">⚠ {diffDays}d overdue</span>;
  if (!done && diffDays === 0) return <span className="text-[11px] text-[var(--amber)] font-semibold font-mono">Due Today</span>;
  if (!done && diffDays > 0) return <span className="text-[11px] text-[var(--red)] font-mono">⚠ {t.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>;
  return <span className="text-[11px] text-[var(--text3)] font-mono">{t.toLocaleDateString('en-GB',{day:'2-digit',month:'short'})}</span>;
}

export function KanbanView() {
  const { tasks: rawTasks, filters } = useStore();
  const { handlePointerDown } = useKanbanDnD();

  const filtered = useMemo(() => {
    return rawTasks.filter(t => {
      if (filters.status.length && !filters.status.includes(t.status)) return false;
      if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(t.assignee)) return false;
      if (filters.dateFrom && t.due && t.due < filters.dateFrom) return false;
      if (filters.dateTo && t.due && t.due > filters.dateTo) return false;
      return true;
    });
  }, [rawTasks, filters]);

  const byCol = useMemo(() => {
    const res: Record<Status, Task[]> = { todo: [], inprogress: [], inreview: [], done: [] };
    filtered.forEach(t => {
      if (res[t.status]) res[t.status].push(t);
    });
    return res;
  }, [filtered]);

  return (
    <div className="flex-1 flex gap-3.5 p-4 overflow-x-auto overflow-y-hidden">
      {COLUMNS.map(col => {
        const cards = byCol[col.id];
        return (
          <div key={col.id} className="kanban-col flex-[0_0_240px] md:flex-[0_0_272px] flex flex-col bg-[var(--bg1)] border border-[var(--border)] rounded-[var(--radius-xl)] overflow-hidden max-h-full">
            <div className="flex items-center justify-between p-3 border-b border-[var(--border)] shrink-0">
              <div className="flex items-center gap-[7px] text-[13px] font-semibold">
                <div className="w-[7px] h-[7px] rounded-full shrink-0" style={{ background: col.color }}></div>
                {col.label}
              </div>
              <span className="text-[11px] font-semibold px-1.5 py-[1px] rounded-[20px] bg-[var(--bg3)] text-[var(--text2)]">
                {cards.length}
              </span>
            </div>
            
            <div 
              className="kanban-cards flex-1 overflow-y-auto p-2 flex flex-col gap-[7px] min-h-[80px] transition-all duration-150 rounded-[var(--radius-lg)]" 
              data-drop-col={col.id}
            >
              {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 px-4 gap-2 opacity-50 empty-col select-none">
                  <div className="w-8 h-8 rounded-full border-2 border-dashed border-[var(--border2)] flex items-center justify-center">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5 text-[var(--text3)]">
                      <line x1="4" y1="8" x2="12" y2="8"/>
                    </svg>
                  </div>
                  <div className="text-[12px] text-[var(--text3)] text-center">No tasks here</div>
                </div>
              ) : (
                cards.map(t => (
                  <div 
                    key={t.id} 
                    data-id={t.id}
                    className="task-card bg-[var(--bg2)] border border-[var(--border)] rounded-[var(--radius-lg)] p-3 cursor-grab select-none transition-all duration-150 hover:border-[var(--border2)] hover:shadow-[var(--shadow)] relative touch-none"
                    onPointerDown={(e) => handlePointerDown(e, t.id)}
                  >
                    <div className="flex items-start justify-between gap-[7px] mb-[7px]">
                      <div className="text-[13px] font-medium leading-[1.4] text-[var(--text1)]">{t.title}</div>
                      {priorityBadge(t)}
                    </div>
                    <div className="mb-2">
                      {t.tag && <span className="text-[10px] text-[var(--text3)] bg-[var(--bg3)] px-1.5 py-0.5 rounded text-mono">{t.tag}</span>}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <div 
                          className="w-[22px] h-[22px] rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 text-white" 
                          style={{ background: ASSIGNEE_COLORS[t.assignee] || '#666' }}
                          title={ASSIGNEE_NAMES[t.assignee]}
                        >
                          {t.assignee}
                        </div>
                      </div>
                      {dueDateLabel(t.due, t.status === 'done')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

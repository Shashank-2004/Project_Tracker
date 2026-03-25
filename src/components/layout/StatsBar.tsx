import { useStore } from '../../store/useStore';

export function StatsBar() {
  const { tasks } = useStore();
  
  const total = tasks.length;
  const byStatus = {todo: 0, inprogress: 0, inreview: 0, done: 0};
  let overdue = 0;
  
  const n = new Date();
  n.setHours(0,0,0,0);
  
  tasks.forEach(t => {
    byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    if (t.due && t.status !== 'done') {
      const dd = new Date(t.due + 'T00:00:00');
      const diffDays = Math.round((n.getTime() - dd.getTime())/(1000*60*60*24));
      if (diffDays > 0) overdue++;
    }
  });
  
  const pct = total > 0 ? Math.round((byStatus.done / total) * 100) : 0;
  
  return (
    <div className="flex items-center gap-4 px-5 py-2 border-b border-[var(--border)] shrink-0 bg-[var(--bg1)] hidden md:flex">
      <div className="flex items-center gap-[5px] text-xs text-[var(--text2)]">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#5c6170]"></div>
        <span className="font-semibold text-[var(--text1)] font-mono">{byStatus.todo}</span> To Do
      </div>
      <div className="flex items-center gap-[5px] text-xs text-[var(--text2)]">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#4f8ef7]"></div>
        <span className="font-semibold text-[var(--text1)] font-mono">{byStatus.inprogress}</span> In Progress
      </div>
      <div className="flex items-center gap-[5px] text-xs text-[var(--text2)]">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#a78bfa]"></div>
        <span className="font-semibold text-[var(--text1)] font-mono">{byStatus.inreview}</span> In Review
      </div>
      <div className="flex items-center gap-[5px] text-xs text-[var(--text2)]">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#22c55e]"></div>
        <span className="font-semibold text-[var(--text1)] font-mono">{byStatus.done}</span> Done
      </div>
      
      <div className="flex items-center gap-[5px] text-xs text-[var(--text2)] ml-auto">
        <div className="w-1.5 h-1.5 rounded-full shrink-0 bg-[#f05252]"></div>
        <span className="font-semibold text-[var(--text1)] font-mono">{overdue}</span> Overdue
      </div>
      <div className="flex items-center gap-[5px] text-xs text-[var(--text2)]">
        <span className="font-semibold text-[var(--text1)] font-mono">{pct}%</span> Complete
      </div>
      <div className="flex items-center gap-[5px] text-xs text-[var(--text3)]">
        {total} total
      </div>
    </div>
  );
}

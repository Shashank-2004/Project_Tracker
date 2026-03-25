import { useMemo, useRef } from 'react';
import { useStore } from '../../store/useStore';
import type { Task } from '../../types';

const DAY_W = 36;
const ROW_H = 42;

export function TimelineView() {
  const { tasks: rawTasks, filters } = useStore();
  
  const tasks = useMemo(() => {
    return rawTasks.filter(t => {
      if (filters.status.length && !filters.status.includes(t.status)) return false;
      if (filters.priority.length && !filters.priority.includes(t.priority)) return false;
      if (filters.assignee.length && !filters.assignee.includes(t.assignee)) return false;
      if (filters.dateFrom && t.due && t.due < filters.dateFrom) return false;
      if (filters.dateTo && t.due && t.due > filters.dateTo) return false;
      return true;
    });
  }, [rawTasks, filters]);

  const now = new Date();
  const year = now.getFullYear();
  const mon = now.getMonth();
  const todayDay = now.getDate();
  const daysInMonth = new Date(year, mon + 1, 0).getDate();
  const totalW = daysInMonth * DAY_W;

  const days = Array.from({length: daysInMonth}, (_, i) => {
    const dt = new Date(year, mon, i + 1);
    const wd = ['Su','Mo','Tu','We','Th','Fr','Sa'][dt.getDay()];
    return { n: i + 1, wd, isWE: dt.getDay() === 0 || dt.getDay() === 6, isToday: i + 1 === todayDay };
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const hdrRef = useRef<HTMLDivElement>(null);
  const namesRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    if (hdrRef.current && scrollRef.current) {
      hdrRef.current.scrollLeft = scrollRef.current.scrollLeft;
    }
    if (namesRef.current && scrollRef.current) {
      namesRef.current.scrollTop = scrollRef.current.scrollTop;
    }
  };

  const todayLeft = (todayDay - 1) * DAY_W + DAY_W / 2;

  const getTaskBarBounds = (t: Task) => {
    const parse = (str: string | null) => {
      if (!str) return null;
      const dt = new Date(str + 'T00:00:00');
      if (dt.getFullYear() !== year || dt.getMonth() !== mon) return null;
      return dt.getDate();
    };
    
    let s = parse(t.start);
    let e = parse(t.due);
    
    if (!e) {
      if (t.due) {
        const dt = new Date(t.due + 'T00:00:00');
        if (dt.getMonth() < mon) return null;
        if (dt.getMonth() > mon) e = daysInMonth;
      }
    }
    
    if (!e) return null;
    if (!s) s = e;
    
    const left = (s - 1) * DAY_W;
    const w = Math.max(14, (e - s + 1) * DAY_W - 4);
    
    const bg = {
      critical: '#f05252',
      high: '#f59e0b',
      medium: '#4f8ef7',
      low: '#22c55e'
    }[t.priority] || '#4f8ef7';
    
    const isMarker = s === e && !t.start;
    
    return { left, w, bg, isMarker };
  };

  return (
    <div className="flex-1 p-4 md:p-5 overflow-hidden flex flex-col border-t border-[var(--border)] md:border-none">
      <div className="flex flex-col flex-1 border border-[var(--border)] rounded-md md:rounded-[var(--radius-xl)] bg-[var(--bg1)] overflow-hidden">
        {/* Header Row */}
        <div className="flex border-b border-[var(--border)] shrink-0">
          <div className="w-[140px] md:w-[190px] shrink-0 px-[14px] py-2 text-[11px] font-semibold tracking-[0.5px] uppercase text-[var(--text3)] flex items-center bg-[var(--bg1)]">
            Task
          </div>
          <div className="flex-1 overflow-hidden" ref={hdrRef}>
            <div className="flex h-[36px]" style={{ width: totalW }}>
              {days.map(d => (
                <div 
                  key={d.n} 
                  className={`flex-[0_0_auto] flex flex-col items-center justify-center text-[10px] border-l border-[var(--border)] px-[3px]
                    ${d.isToday ? 'text-[var(--accent)] font-semibold' : 'text-[var(--text3)]'}`}
                  style={{ width: DAY_W }}
                >
                  <div className="text-[11px] font-medium">{d.n}</div>
                  <div className="text-[9px] opacity-60 uppercase">{d.wd}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-hidden flex bg-[var(--bg1)]">
          {/* Names Column */}
          <div className="w-[140px] md:w-[190px] shrink-0 overflow-hidden border-r border-[var(--border)] bg-[var(--bg1)] z-10" ref={namesRef}>
            {tasks.map(t => (
              <div 
                key={t.id} 
                className="flex items-center px-[14px] border-b border-[var(--border)] text-[12px] font-medium text-[var(--text2)] whitespace-nowrap overflow-hidden text-ellipsis bg-[var(--bg1)]"
                style={{ height: ROW_H }}
                title={t.title}
              >
                {t.title}
              </div>
            ))}
          </div>

          {/* Grid Area */}
          <div 
            className="flex-1 overflow-auto" 
            ref={scrollRef} 
            onScroll={handleScroll}
          >
            <div className="relative" style={{ width: totalW, minHeight: tasks.length * ROW_H }}>
              {/* Today Line */}
              <div 
                className="absolute top-0 bottom-0 w-[2px] bg-[var(--accent)] opacity-60 z-10 pointer-events-none" 
                style={{ left: todayLeft }}
              ></div>

              {/* Rows */}
              {tasks.map(t => {
                const bounds = getTaskBarBounds(t);
                return (
                  <div 
                    key={t.id} 
                    className="flex items-center border-b border-[var(--border)] relative"
                    style={{ height: ROW_H, width: totalW }}
                  >
                    {/* Background cells */}
                    {days.map(d => (
                      <div 
                        key={d.n} 
                        className={`flex-[0_0_auto] border-l border-[var(--border)] relative h-full
                          ${d.isWE ? 'bg-[rgba(255,255,255,.015)]' : ''} 
                          ${d.isToday ? 'bg-[rgba(79,142,247,.06)]' : ''}`
                        }
                        style={{ width: DAY_W }}
                      ></div>
                    ))}

                    {/* Task Bar */}
                    {bounds && (
                      <div
                        title={t.title}
                        className={`absolute top-1/2 -translate-y-1/2 z-20 transition-all duration-150 cursor-pointer hover:brightness-110 flex items-center text-[10px] font-semibold text-white overflow-hidden text-ellipsis whitespace-nowrap
                          ${bounds.isMarker ? 'rounded-full justify-center p-0' : 'h-[20px] rounded-[4px] px-[7px] opacity-85'}`}
                        style={{
                          left: bounds.isMarker ? bounds.left + DAY_W / 2 - 7 : bounds.left,
                          width: bounds.w,
                          height: bounds.isMarker ? 14 : 20,
                          background: bounds.bg
                        }}
                      >
                        {!bounds.isMarker && t.title}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

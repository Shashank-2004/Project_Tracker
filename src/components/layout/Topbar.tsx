import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';


interface CollabUser {
  id: string;
  initials: string;
  colorClass?: string;
  color: string;
  name: string;
  status: 'active' | 'away';
  taskId: string | null;
}

const COLLAB_USERS: CollabUser[] = [
  {id:'cu1',initials:'SR',color:'#e55a2b',name:'Sara R.',status:'active',taskId:null},
  {id:'cu2',initials:'MJ',color:'#7c3aed',name:'Mike J.',status:'active',taskId:null},
  {id:'cu3',initials:'PL',color:'#0d9488',name:'Priya L.',status:'away',taskId:null},
  {id:'cu4',initials:'TW',color:'#db2777',name:'Tom W.',status:'active',taskId:null},
];

interface TopbarProps {
  onOpenAddModal: () => void;
}

export function Topbar({ onOpenAddModal }: TopbarProps) {
  const { view, setView } = useStore();
  const [collabUsers, setCollabUsers] = useState<CollabUser[]>(COLLAB_USERS);

  useEffect(() => {
    const interval = setInterval(() => {
      setCollabUsers(prev => prev.map(u => {
        if (Math.random() < 0.35) {
          return {
            ...u,
            status: Math.random() > 0.15 ? 'active' : 'away'
          };
        }
        return u;
      }));
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  const activeCount = collabUsers.filter(u => u.status === 'active').length;

  return (
    <div className="flex items-center gap-4 px-5 h-[52px] bg-[var(--bg1)] border-b border-[var(--border)] shrink-0">
      <div className="font-semibold text-[15px] tracking-tight text-[var(--text1)] shrink-0">
        Flow<span className="text-[var(--accent)]">Desk</span>
      </div>
      
      <div className="flex-1 flex items-center justify-center gap-[3px]">
        <button 
          onClick={() => setView('kanban')}
          className={`flex items-center gap-[5px] px-3 py-[5px] rounded-[var(--radius)] border text-[13px] font-medium transition-all duration-150 ${view === 'kanban' ? 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text1)]' : 'border-transparent bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text1)]'}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[13px] h-[13px] opacity-70">
            <rect x="1" y="2" width="4" height="12" rx="1"/><rect x="6" y="2" width="4" height="8" rx="1"/><rect x="11" y="2" width="4" height="10" rx="1"/>
          </svg>
          Board
        </button>
        
        <button 
          onClick={() => setView('list')}
          className={`flex items-center gap-[5px] px-3 py-[5px] rounded-[var(--radius)] border text-[13px] font-medium transition-all duration-150 ${view === 'list' ? 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text1)]' : 'border-transparent bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text1)]'}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[13px] h-[13px] opacity-70">
            <line x1="1" y1="4" x2="15" y2="4"/><line x1="1" y1="8" x2="15" y2="8"/><line x1="1" y1="12" x2="15" y2="12"/>
          </svg>
          List
        </button>
        
        <button 
          onClick={() => setView('timeline')}
          className={`flex items-center gap-[5px] px-3 py-[5px] rounded-[var(--radius)] border text-[13px] font-medium transition-all duration-150 ${view === 'timeline' ? 'bg-[var(--bg3)] border-[var(--border2)] text-[var(--text1)]' : 'border-transparent bg-transparent text-[var(--text2)] hover:bg-[var(--bg3)] hover:text-[var(--text1)]'}`}
        >
          <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-[13px] h-[13px] opacity-70">
            <rect x="1" y="3" width="14" height="10" rx="1"/><line x1="5" y1="3" x2="5" y2="13"/><line x1="1" y1="7" x2="15" y2="7"/>
          </svg>
          Timeline
        </button>
      </div>
      
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 text-xs text-[var(--text3)] mr-4">
          <span>{activeCount ? `${activeCount} viewing` : ''}</span>
          <div className="flex items-center">
            {collabUsers.map((u, i) => (
              <div 
                key={u.id}
                title={`${u.name} — ${u.status}`}
                className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[10px] font-semibold border-2 border-[var(--bg1)] relative cursor-pointer transition-transform duration-150 hover:-translate-y-0.5 hover:z-10 shrink-0 text-white -ml-[7px] first:ml-0"
                style={{ backgroundColor: u.color, opacity: u.status === 'active' ? 1 : 0.45, zIndex: collabUsers.length - i }}
              >
                {u.initials}
                <div className={`absolute bottom-0 right-0 w-[7px] h-[7px] rounded-full border-[1.5px] border-[var(--bg1)] ${u.status === 'away' ? 'bg-[var(--amber)]' : 'bg-[var(--green)]'}`}></div>
              </div>
            ))}
          </div>
        </div>
        
        <button 
          onClick={onOpenAddModal}
          className="flex items-center gap-[5px] px-3 py-1.5 rounded-[var(--radius)] bg-[var(--accent)] text-white border-none cursor-pointer text-[13px] font-medium transition-colors duration-150 hover:bg-[var(--accent2)]"
        >
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><line x1="6" y1="1" x2="6" y2="11"/><line x1="1" y1="6" x2="11" y2="6"/></svg>
          Add Task
        </button>
      </div>
    </div>
  );
}

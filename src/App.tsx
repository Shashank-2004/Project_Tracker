import { useState, useEffect } from 'react';
import { Topbar } from './components/layout/Topbar';
import { FilterBar } from './components/layout/FilterBar';
import { StatsBar } from './components/layout/StatsBar';
import { TaskModal } from './components/ui/TaskModal';
import { Notification } from './components/ui/Notification';
import { useStore } from './store/useStore';

import { KanbanView } from './components/views/KanbanView';
import { ListView } from './components/views/ListView';
import { TimelineView } from './components/views/TimelineView';

function App() {
  const { view, filters, setDateFilter, toggleFilter } = useStore();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(location.search);
    if(p.get('status')) p.get('status')?.split(',').filter(Boolean).forEach(v => toggleFilter('status', v));
    if(p.get('priority')) p.get('priority')?.split(',').filter(Boolean).forEach(v => toggleFilter('priority', v));
    if(p.get('assignee')) p.get('assignee')?.split(',').filter(Boolean).forEach(v => toggleFilter('assignee', v));
    if(p.get('from')) setDateFilter('dateFrom', p.get('from')!);
    if(p.get('to')) setDateFilter('dateTo', p.get('to')!);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const p = new URLSearchParams();
    if(filters.status.length) p.set('status', filters.status.join(','));
    if(filters.priority.length) p.set('priority', filters.priority.join(','));
    if(filters.assignee.length) p.set('assignee', filters.assignee.join(','));
    if(filters.dateFrom) p.set('from', filters.dateFrom);
    if(filters.dateTo) p.set('to', filters.dateTo);
    const str = p.toString();
    window.history.replaceState(null, '', str ? `?${str}` : location.pathname);
  }, [filters]);

  return (
    <>
      <Topbar onOpenAddModal={() => setModalOpen(true)} />
      <FilterBar />
      <StatsBar />
      
      <main className="flex-1 overflow-hidden flex flex-col" id="main-content justify-evenly">
        {view === 'kanban' && <KanbanView />}
        {view === 'list' && <ListView />}
        {view === 'timeline' && <TimelineView />}
      </main>

      <TaskModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      <Notification />
    </>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useStore } from '../../store/useStore';
import type { Priority, Status, Assignee, Tag } from '../../types';


interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ isOpen, onClose }: TaskModalProps) {
  const { addTask, showNotification } = useStore();
  
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<Status>('todo');
  const [priority, setPriority] = useState<Priority>('medium');
  const [start, setStart] = useState('');
  const [due, setDue] = useState('');
  const [assignee, setAssignee] = useState<Assignee>('AK');
  const [tag, setTag] = useState<Tag>('FE');
  
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const n = new Date();
      setStart(`${n.getFullYear()}-${String(n.getMonth()+1).padStart(2,'0')}-${String(n.getDate()).padStart(2,'0')}`);
      setDue('');
      setTitle('');
      setStatus('todo');
      setPriority('medium');
      setAssignee('AK');
      setTag('FE');
      setError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = () => {
    if (!title.trim()) {
      setError(true);
      return;
    }
    
    addTask({
      id: 't' + Date.now(),
      title,
      status,
      priority,
      assignee,
      tag,
      start: start || null,
      due: due || null
    });
    
    showNotification('Task created');
    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 bg-black/60 flex items-center justify-center z-[500] transition-opacity duration-200 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`bg-[var(--bg2)] border border-[var(--border2)] rounded-[var(--radius-xl)] p-[22px] w-[460px] max-w-[92vw] transition-transform duration-200 ${isOpen ? 'translate-y-0' : '-translate-y-2'}`}>
        <div className="text-[15px] font-semibold mb-[18px]">New Task</div>
        
        <div className="mb-3">
          <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Title</label>
          <input 
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(false); }}
            className={`w-full px-2.5 py-[7px] bg-[var(--bg3)] border ${error ? 'border-[var(--red)]' : 'border-[var(--border2)]'} rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)]`}
            placeholder="Task title..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Status</label>
            <select 
              value={status}
              onChange={(e) => setStatus(e.target.value as Status)}
              className="w-full px-2.5 py-[7px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
            >
              <option value="todo">To Do</option>
              <option value="inprogress">In Progress</option>
              <option value="inreview">In Review</option>
              <option value="done">Done</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Priority</label>
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="w-full px-2.5 py-[7px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Start Date</label>
            <input 
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full px-2.5 py-[7px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)] [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Due Date</label>
            <input 
              type="date"
              value={due}
              onChange={(e) => setDue(e.target.value)}
              className="w-full px-2.5 py-[7px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)] [color-scheme:dark]"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 mb-3">
          <div>
            <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Assignee</label>
            <select 
              value={assignee}
              onChange={(e) => setAssignee(e.target.value as Assignee)}
              className="w-full px-2.5 py-[7px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
            >
              <option value="AK">Alex Kim</option>
              <option value="SR">Sara R.</option>
              <option value="MJ">Mike J.</option>
              <option value="PL">Priya L.</option>
              <option value="TW">Tom W.</option>
              <option value="JS">John S.</option>
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold text-[var(--text2)] mb-1 block uppercase tracking-[0.4px]">Tag</label>
            <select 
              value={tag}
              onChange={(e) => setTag(e.target.value as Tag)}
              className="w-full px-2.5 py-[7px] bg-[var(--bg3)] border border-[var(--border2)] rounded-[var(--radius)] text-[var(--text1)] font-sans text-[13px] outline-none transition-colors duration-150 focus:border-[var(--accent)]"
            >
              <option value="FE">Frontend</option>
              <option value="BE">Backend</option>
              <option value="DS">Design</option>
              <option value="QA">QA</option>
              <option value="OPS">Ops</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-[7px] mt-[18px]">
          <button 
            onClick={onClose}
            className="px-[13px] py-1.5 rounded-[var(--radius)] bg-transparent border border-[var(--border2)] text-[var(--text2)] cursor-pointer font-sans text-[13px] transition-colors duration-150 hover:bg-[var(--bg3)] hover:text-[var(--text1)]"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate}
            className="px-[13px] py-1.5 rounded-[var(--radius)] bg-[var(--accent)] border-none text-white cursor-pointer font-sans text-[13px] transition-colors duration-150 hover:bg-[var(--accent2)]"
          >
            Create Task
          </button>
        </div>
      </div>
    </div>
  );
}

import { create } from 'zustand';
import type { Task, ViewMode, SortOptions, FilterOptions, Status } from '../types';
import { generateTasks } from '../utils/dataGenerator';

interface StoreState {
  tasks: Task[];
  view: ViewMode;
  sort: SortOptions;
  filters: FilterOptions;
  notification: string | null;
  
  moveTask: (id: string, status: Status) => void;
  setSort: (key: keyof Task) => void;
  addTask: (task: Task) => void;
  toggleFilter: (type: 'status' | 'priority' | 'assignee', val: string) => void;
  setDateFilter: (type: 'dateFrom' | 'dateTo', val: string) => void;
  clearFilters: () => void;
  setView: (view: ViewMode) => void;
  showNotification: (msg: string) => void;
  hideNotification: () => void;
}

export const useStore = create<StoreState>((set) => ({
  tasks: generateTasks(500),
  view: 'kanban',
  sort: { key: 'title', dir: 'asc' },
  filters: { status: [], priority: [], assignee: [], dateFrom: '', dateTo: '' },
  notification: null,

  moveTask: (id, status) => {
    set((state) => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
    }));
  },

  setSort: (key) => {
    set((state) => {
      if (state.sort.key === key) {
        return { sort: { key, dir: state.sort.dir === 'asc' ? 'desc' : 'asc' } };
      }
      return { sort: { key, dir: 'asc' } };
    });
  },

  addTask: (task) => {
    set((state) => ({ tasks: [task, ...state.tasks] }));
  },

  toggleFilter: (type, val) => {
    set((state) => {
      const arr = state.filters[type] as string[];
      const idx = arr.indexOf(val);
      const newArr = idx >= 0 ? arr.filter(item => item !== val) : [...arr, val];
      
      return {
        filters: { ...state.filters, [type]: newArr }
      };
    });
  },

  setDateFilter: (type, val) => {
    set((state) => ({
      filters: { ...state.filters, [type]: val }
    }));
  },

  clearFilters: () => {
    set({ filters: { status: [], priority: [], assignee: [], dateFrom: '', dateTo: '' } });
  },

  setView: (view) => set({ view }),

  showNotification: (msg) => {
    set({ notification: msg });
  },

  hideNotification: () => {
    set({ notification: null });
  }
}));

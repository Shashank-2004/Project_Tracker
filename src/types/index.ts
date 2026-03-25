export type Priority = 'critical' | 'high' | 'medium' | 'low';
export type Status = 'todo' | 'inprogress' | 'inreview' | 'done';
export type Assignee = 'AK' | 'SR' | 'MJ' | 'PL' | 'TW' | 'JS';
export type Tag = 'FE' | 'BE' | 'DS' | 'QA' | 'OPS';
export type ViewMode = 'kanban' | 'list' | 'timeline';

export interface Task {
  id: string;
  title: string;
  status: Status;
  priority: Priority;
  assignee: Assignee;
  tag?: Tag;
  start: string | null;
  due: string | null;
}

export interface SortOptions {
  key: keyof Task;
  dir: 'asc' | 'desc';
}

export interface FilterOptions {
  status: Status[];
  priority: Priority[];
  assignee: Assignee[];
  dateFrom: string;
  dateTo: string;
}

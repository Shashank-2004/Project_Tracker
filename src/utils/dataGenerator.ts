import type { Task, Status, Priority, Assignee, Tag } from '../types';

export const ASSIGNEE_NAMES: Record<Assignee, string> = {
  AK: 'Alex Kim',
  SR: 'Sara R.',
  MJ: 'Mike J.',
  PL: 'Priya L.',
  TW: 'Tom W.',
  JS: 'John S.'
};

export const ASSIGNEE_COLORS: Record<Assignee, string> = {
  AK: '#4f8ef7',
  SR: '#e55a2b',
  MJ: '#7c3aed',
  PL: '#0d9488',
  TW: '#db2777',
  JS: '#22c55e'
};

export const STATUS_COLORS: Record<Status, string> = {
  todo: '#5c6170',
  inprogress: '#4f8ef7',
  inreview: '#a78bfa',
  done: '#22c55e'
};

export const PRIORITY_COLORS: Record<Priority, string> = {
  critical: '#f05252',
  high: '#f59e0b',
  medium: '#4f8ef7',
  low: '#22c55e'
};

const dStr = (dt: Date) => {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
};

export function generateTasks(count: number = 500): Task[] {
  const TITLES = [
    'Implement {f} for {m}', 'Refactor {m} {f}', 'Fix {f} bug in {m}',
    'Add unit tests — {m}', 'Document {f} API', 'Optimise {m} performance',
    'Review {f} PR', 'Deploy {m} to staging', 'Set up {f} monitoring',
    'Migrate {m} to {f}', 'Integrate {f} with {m}', 'Audit {m} {f}',
  ];
  const FEAT = ['auth', 'cache', 'search', 'logging', 'queue', 'webhook', 'parser', 'validator', 'scheduler', 'exporter'];
  const MODS = ['billing', 'dashboard', 'profiles', 'settings', 'admin', 'reports', 'notifications', 'teams'];
  const STATUSES: Status[] = ['todo', 'todo', 'todo', 'inprogress', 'inprogress', 'inreview', 'done'];
  const PRIORITIES: Priority[] = ['critical', 'high', 'high', 'medium', 'medium', 'medium', 'low'];
  const ASSIGNEES: Assignee[] = ['AK', 'SR', 'MJ', 'PL', 'TW', 'JS'];
  const TAGS: Tag[] = ['FE', 'BE', 'DS', 'QA', 'OPS'];

  const rand = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));

  const tasks: Task[] = [];
  const now = new Date();

  for (let i = 1; i <= count; i++) {
    const tmpl = rand(TITLES);
    const title = tmpl.replace('{f}', rand(FEAT)).replace('{m}', rand(MODS));
    
    const dayOffsetStart = randInt(-15, 10);
    const dur = randInt(1, 15);
    
    const startDateDt = new Date(now);
    startDateDt.setDate(startDateDt.getDate() + dayOffsetStart);
    
    const dueDateDt = new Date(startDateDt);
    dueDateDt.setDate(startDateDt.getDate() + dur);

    tasks.push({
      id: `t${i}`,
      title,
      status: rand(STATUSES),
      priority: rand(PRIORITIES),
      assignee: rand(ASSIGNEES),
      tag: rand(TAGS),
      start: Math.random() > 0.2 ? dStr(startDateDt) : null,
      due: dStr(dueDateDt),
    });
  }

  return tasks;
}

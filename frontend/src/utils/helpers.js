export const formatDate = (date) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const isOverdue = (dueDate, status) => {
  if (!dueDate || status === 'DONE') return false;
  return new Date() > new Date(dueDate);
};

export const statusLabel = s => ({ TODO: 'To Do', IN_PROGRESS: 'In Progress', DONE: 'Done' }[s] || s);
export const priorityLabel = p => ({ LOW: 'Low', MEDIUM: 'Medium', HIGH: 'High' }[p] || p);
export const initials = name => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

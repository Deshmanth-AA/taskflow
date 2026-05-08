import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, statusLabel, priorityLabel, initials } from '../utils/helpers';
import {
  Plus, Trash2, Edit3, Users, CheckSquare, ArrowLeft,
  Calendar, AlertCircle, UserPlus, X, ChevronDown
} from 'lucide-react';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('tasks');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  const [memberModal, setMemberModal] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  const load = () => {
    api.get(`/projects/${id}`).then(r => setProject(r.data)).catch(() => navigate('/projects')).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [id]);

  const myRole = project?.members.find(m => m.user.id === user.id)?.role;
  const isAdmin = myRole === 'ADMIN';

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', dueDate: '', assigneeId: '' });
    setTaskError('');
    setTaskModal(true);
  };

  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      assigneeId: task.assignee?.id || ''
    });
    setTaskError('');
    setTaskModal(true);
  };

  const saveTask = async (e) => {
    e.preventDefault();
    setTaskError(''); setTaskLoading(true);
    try {
      const payload = { ...taskForm, assigneeId: taskForm.assigneeId || null, dueDate: taskForm.dueDate || null };
      if (editingTask) {
        const { data } = await api.put(`/tasks/project/${id}/${editingTask.id}`, payload);
        setProject(p => ({ ...p, tasks: p.tasks.map(t => t.id === data.id ? data : t) }));
      } else {
        const { data } = await api.post(`/tasks/project/${id}`, payload);
        setProject(p => ({ ...p, tasks: [data, ...p.tasks] }));
      }
      setTaskModal(false);
    } catch (err) {
      setTaskError(err.response?.data?.error || err.response?.data?.errors?.[0]?.msg || 'Failed');
    } finally { setTaskLoading(false); }
  };

  const deleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return;
    await api.delete(`/tasks/project/${id}/${taskId}`);
    setProject(p => ({ ...p, tasks: p.tasks.filter(t => t.id !== taskId) }));
  };

  const quickStatusUpdate = async (task, status) => {
    const { data } = await api.put(`/tasks/project/${id}/${task.id}`, { status });
    setProject(p => ({ ...p, tasks: p.tasks.map(t => t.id === data.id ? data : t) }));
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberError(''); setMemberLoading(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail, role: memberRole });
      load();
      setMemberModal(false);
      setMemberEmail('');
    } catch (err) {
      setMemberError(err.response?.data?.error || 'Failed');
    } finally { setMemberLoading(false); }
  };

  const removeMember = async (memberId) => {
    if (!confirm('Remove this member?')) return;
    await api.delete(`/projects/${id}/members/${memberId}`);
    load();
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;
  if (!project) return null;

  const filteredTasks = (project.tasks || []).filter(t => {
    if (filterStatus && t.status !== filterStatus) return false;
    if (filterPriority && t.priority !== filterPriority) return false;
    return true;
  });

  const grouped = {
    TODO: filteredTasks.filter(t => t.status === 'TODO'),
    IN_PROGRESS: filteredTasks.filter(t => t.status === 'IN_PROGRESS'),
    DONE: filteredTasks.filter(t => t.status === 'DONE'),
  };

  const statusColors = { TODO: 'var(--text-2)', IN_PROGRESS: 'var(--yellow)', DONE: 'var(--green)' };

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <button className="btn-ghost" onClick={() => navigate('/projects')} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, fontSize: 13 }}>
          <ArrowLeft size={14} /> Projects
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800 }}>{project.name}</h1>
            {project.description && <p style={{ color: 'var(--text-2)', marginTop: 4, maxWidth: 600 }}>{project.description}</p>}
          </div>
          {isAdmin && (
            <button className="btn-primary" onClick={openCreateTask} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add Task
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
        {[['tasks', CheckSquare, 'Tasks'], ['members', Users, 'Members']].map(([key, Icon, label]) => (
          <button key={key} onClick={() => setActiveTab(key)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
            background: 'transparent', borderRadius: '8px 8px 0 0',
            color: activeTab === key ? 'var(--text)' : 'var(--text-2)',
            borderBottom: `2px solid ${activeTab === key ? 'var(--accent)' : 'transparent'}`,
            fontSize: 14, fontWeight: activeTab === key ? 600 : 400
          }}>
            <Icon size={14} /> {label}
            {key === 'tasks' && <span style={{ background: 'var(--bg-3)', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>{project.tasks?.length || 0}</span>}
            {key === 'members' && <span style={{ background: 'var(--bg-3)', borderRadius: 99, padding: '1px 7px', fontSize: 11 }}>{project.members?.length || 0}</span>}
          </button>
        ))}
      </div>

      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} style={{ width: 'auto', padding: '8px 12px' }}>
              <option value="">All Statuses</option>
              {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
            </select>
            <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} style={{ width: 'auto', padding: '8px 12px' }}>
              <option value="">All Priorities</option>
              {PRIORITIES.map(p => <option key={p} value={p}>{priorityLabel(p)}</option>)}
            </select>
            {(filterStatus || filterPriority) && (
              <button className="btn-ghost" onClick={() => { setFilterStatus(''); setFilterPriority(''); }} style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                <X size={12} /> Clear
              </button>
            )}
            {!isAdmin && (
              <button className="btn-ghost" onClick={openCreateTask} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, marginLeft: 'auto' }}>
                <Plus size={14} /> Add Task
              </button>
            )}
          </div>

          {/* Kanban columns */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {STATUSES.map(status => (
              <div key={status}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[status] }} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: statusColors[status] }}>{statusLabel(status)}</span>
                  <span style={{ background: 'var(--bg-3)', borderRadius: 99, padding: '1px 7px', fontSize: 11, color: 'var(--text-3)', marginLeft: 'auto' }}>
                    {grouped[status].length}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 80 }}>
                  {grouped[status].map(task => {
                    const overdue = isOverdue(task.dueDate, task.status);
                    const canEdit = isAdmin || task.assignee?.id === user.id || task.creator?.id === user.id;
                    return (
                      <div key={task.id} className="card" style={{
                        padding: '12px 14px', cursor: canEdit ? 'pointer' : 'default',
                        borderLeft: `3px solid ${statusColors[status]}`,
                        transition: 'border-color 0.15s, transform 0.15s'
                      }}
                        onMouseEnter={e => canEdit && (e.currentTarget.style.transform = 'translateX(2px)')}
                        onMouseLeave={e => (e.currentTarget.style.transform = 'translateX(0)')}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <div style={{ fontWeight: 500, fontSize: 13, flex: 1 }}>{task.title}</div>
                          {canEdit && (
                            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                              <button onClick={() => openEditTask(task)} style={{
                                background: 'transparent', color: 'var(--text-3)', padding: '2px 4px',
                                fontSize: 10
                              }}><Edit3 size={12} /></button>
                              {isAdmin && (
                                <button onClick={() => deleteTask(task.id)} style={{
                                  background: 'transparent', color: 'var(--red)', padding: '2px 4px'
                                }}><Trash2 size={12} /></button>
                              )}
                            </div>
                          )}
                        </div>

                        {task.description && (
                          <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4, lineHeight: 1.4,
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                            {task.description}
                          </p>
                        )}

                        <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                          <span className={`badge badge-${task.priority.toLowerCase()}`}>{priorityLabel(task.priority)}</span>
                          {task.dueDate && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 11,
                              color: overdue ? 'var(--red)' : 'var(--text-3)' }}>
                              {overdue && <AlertCircle size={10} />}
                              <Calendar size={10} />
                              {formatDate(task.dueDate)}
                            </span>
                          )}
                        </div>

                        {task.assignee && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                            <div style={{
                              width: 20, height: 20, borderRadius: '50%', background: 'var(--accent)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 9, fontWeight: 700, color: 'white'
                            }}>
                              {initials(task.assignee.name)}
                            </div>
                            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{task.assignee.name}</span>
                          </div>
                        )}

                        {canEdit && task.status !== 'DONE' && (
                          <select value={task.status}
                            onChange={e => quickStatusUpdate(task, e.target.value)}
                            onClick={e => e.stopPropagation()}
                            style={{ marginTop: 8, fontSize: 11, padding: '3px 8px', width: '100%' }}>
                            {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                          </select>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <h2 style={{ fontSize: 18 }}>Team Members</h2>
            {isAdmin && (
              <button className="btn-primary" onClick={() => setMemberModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <UserPlus size={15} /> Add Member
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {project.members.map(member => (
              <div key={member.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%', background: member.user.id === project.owner?.id ? 'var(--accent)' : 'var(--bg-3)',
                  border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, fontWeight: 700, color: 'white', flexShrink: 0
                }}>
                  {initials(member.user.name)}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8 }}>
                    {member.user.name}
                    {member.user.id === user.id && <span style={{ fontSize: 11, color: 'var(--text-3)' }}>(you)</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{member.user.email}</div>
                </div>
                <span className={`badge badge-${member.role.toLowerCase()}`}>{member.role}</span>
                {isAdmin && member.user.id !== user.id && (
                  <button className="btn-danger" onClick={() => removeMember(member.user.id)} style={{ padding: '6px 12px', fontSize: 12 }}>
                    Remove
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Modal */}
      {taskModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
        }} onClick={e => e.target === e.currentTarget && setTaskModal(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 520, padding: 32, maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={saveTask} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Title *</label>
                <input placeholder="Task title" value={taskForm.title}
                  onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Optional description" value={taskForm.description}
                  onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} rows={3} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Status</label>
                  <select value={taskForm.status} onChange={e => setTaskForm(p => ({ ...p, status: e.target.value }))}>
                    {STATUSES.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Priority</label>
                  <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value }))}>
                    {PRIORITIES.map(p => <option key={p} value={p}>{priorityLabel(p)}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={taskForm.dueDate}
                    onChange={e => setTaskForm(p => ({ ...p, dueDate: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Assign To</label>
                  <select value={taskForm.assigneeId} onChange={e => setTaskForm(p => ({ ...p, assigneeId: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {project.members.map(m => (
                      <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {taskError && <p className="form-error">{taskError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={taskLoading}>
                  {taskLoading ? 'Saving...' : editingTask ? 'Save Changes' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Modal */}
      {memberModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
        }} onClick={e => e.target === e.currentTarget && setMemberModal(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 420, padding: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>Add Team Member</h2>
            <form onSubmit={addMember} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Email Address</label>
                <input type="email" placeholder="user@example.com" value={memberEmail}
                  onChange={e => setMemberEmail(e.target.value)} required autoFocus />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={memberRole} onChange={e => setMemberRole(e.target.value)}>
                  <option value="MEMBER">Member — can view and update tasks</option>
                  <option value="ADMIN">Admin — full project access</option>
                </select>
              </div>
              {memberError && <p className="form-error">{memberError}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={memberLoading}>
                  {memberLoading ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

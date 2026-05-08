import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Plus, FolderKanban, Users, CheckSquare, ChevronRight } from 'lucide-react';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data)).finally(() => setLoading(false));
  }, []);

  const create = async (e) => {
    e.preventDefault();
    setError(''); setCreating(true);
    try {
      const { data } = await api.post('/projects', form);
      setProjects(p => [data, ...p]);
      setShowModal(false);
      setForm({ name: '', description: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create');
    } finally { setCreating(false); }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800 }}>Projects</h1>
          <p style={{ color: 'var(--text-2)', marginTop: 4 }}>{projects.length} workspace{projects.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Plus size={16} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <FolderKanban size={40} color="var(--text-3)" style={{ marginBottom: 16 }} />
          <h3 style={{ marginBottom: 8 }}>No projects yet</h3>
          <p style={{ color: 'var(--text-2)', marginBottom: 20 }}>Create your first project to get started.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={14} style={{ marginRight: 8 }} />Create Project</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {projects.map(project => {
            const myRole = project.members.find(m => m.user.id === user.id)?.role;
            const doneTasks = project.tasks?.filter(t => t.status === 'DONE').length || 0;
            const totalTasks = project._count?.tasks || 0;
            const progress = totalTasks ? Math.round((doneTasks / totalTasks) * 100) : 0;

            return (
              <Link key={project.id} to={`/projects/${project.id}`} style={{ textDecoration: 'none' }}>
                <div className="card" style={{ cursor: 'pointer', transition: 'border-color 0.2s, transform 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ background: 'var(--accent-glow)', borderRadius: 8, padding: 8 }}>
                        <FolderKanban size={16} color="var(--accent-2)" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{project.name}</div>
                        <span className={`badge badge-${myRole?.toLowerCase()}`} style={{ marginTop: 2 }}>{myRole}</span>
                      </div>
                    </div>
                    <ChevronRight size={16} color="var(--text-3)" />
                  </div>

                  {project.description && (
                    <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 14, lineHeight: 1.5,
                      display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {project.description}
                    </p>
                  )}

                  <div style={{ height: 4, background: 'var(--bg-3)', borderRadius: 99, marginBottom: 12, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progress}%`, background: 'var(--accent)', borderRadius: 99 }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-3)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <CheckSquare size={12} /> {totalTasks} tasks
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Users size={12} /> {project.members.length} members
                    </span>
                    <span style={{ color: 'var(--accent-2)', fontWeight: 600 }}>{progress}% done</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)'
        }} onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="card fade-in" style={{ width: '100%', maxWidth: 480, padding: 32 }}>
            <h2 style={{ fontSize: 20, marginBottom: 24 }}>New Project</h2>
            <form onSubmit={create} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label>Project Name *</label>
                <input placeholder="e.g. Website Redesign" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required autoFocus />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="What is this project about?" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  rows={3} style={{ resize: 'vertical' }} />
              </div>
              {error && <p className="form-error">{error}</p>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

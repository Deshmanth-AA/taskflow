import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { formatDate, isOverdue, statusLabel, priorityLabel } from '../utils/helpers';
import { CheckCircle2, Clock, AlertCircle, Layers, TrendingUp, Calendar } from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ color: 'var(--text-2)', fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
      <div style={{ background: `${color}20`, borderRadius: 8, padding: 7, display: 'flex' }}>
        <Icon size={15} color={color} />
      </div>
    </div>
    <div style={{ fontSize: 32, fontFamily: 'Syne', fontWeight: 800, color }}>{value}</div>
    {sub && <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{sub}</div>}
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 80 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>;

  const completionRate = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'}, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ color: 'var(--text-2)' }}>Here's what's happening across your projects.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        <StatCard icon={Layers} label="Total Tasks" value={stats.total} color="var(--accent-2)" sub={`${stats.projects} projects`} />
        <StatCard icon={Clock} label="In Progress" value={stats.inProgress} color="var(--yellow)" sub={`${stats.todo} to do`} />
        <StatCard icon={CheckCircle2} label="Completed" value={stats.done} color="var(--green)" sub={`${completionRate}% done`} />
        <StatCard icon={AlertCircle} label="Overdue" value={stats.overdue} color="var(--red)" sub={stats.overdue > 0 ? 'needs attention' : 'all on track'} />
      </div>

      {/* Progress bar */}
      <div className="card" style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <TrendingUp size={15} color="var(--accent-2)" />
            <span style={{ fontWeight: 600, fontSize: 14 }}>Overall Progress</span>
          </div>
          <span style={{ color: 'var(--accent-2)', fontFamily: 'Syne', fontWeight: 700 }}>{completionRate}%</span>
        </div>
        <div style={{ height: 8, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${completionRate}%`,
            background: 'linear-gradient(90deg, var(--accent) 0%, var(--green) 100%)',
            borderRadius: 99, transition: 'width 0.8s ease'
          }} />
        </div>
        <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
          {[['To Do', stats.todo, 'var(--text-2)'], ['In Progress', stats.inProgress, 'var(--yellow)'], ['Done', stats.done, 'var(--green)']].map(([label, val, color]) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
              <span style={{ color: 'var(--text-2)' }}>{label}</span>
              <span style={{ color, fontWeight: 600 }}>{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* My tasks */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 style={{ fontSize: 18 }}>My Upcoming Tasks</h2>
          <Link to="/projects" style={{ color: 'var(--accent-2)', fontSize: 13 }}>View all →</Link>
        </div>

        {stats.myTasks.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: 40 }}>
            <CheckCircle2 size={32} color="var(--green)" style={{ marginBottom: 12 }} />
            <p style={{ color: 'var(--text-2)' }}>You're all caught up! No pending tasks.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {stats.myTasks.map(task => (
              <div key={task.id} className="card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {task.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Link to={`/projects/${task.project.id}`} style={{ fontSize: 12, color: 'var(--accent-2)' }}>
                      {task.project.name}
                    </Link>
                    {task.dueDate && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: isOverdue(task.dueDate, task.status) ? 'var(--red)' : 'var(--text-3)' }}>
                        <Calendar size={11} />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className={`badge badge-${task.priority.toLowerCase()}`}>{priorityLabel(task.priority)}</span>
                  <span className={`badge badge-${task.status.toLowerCase().replace('_','-')}`}>{statusLabel(task.status)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

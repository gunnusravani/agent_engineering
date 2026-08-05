import React, { useState } from 'react';
import { Plus, Check, Trash2, Edit3, Target, Filter } from 'lucide-react';

export default function TaskList({
  tasks,
  activeTaskId,
  onSelectActiveTask,
  onToggleComplete,
  onDeleteTask,
  onOpenAddTask,
  onEditTask
}) {
  const [filter, setFilter] = useState('all'); // all, active, completed

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'active') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  return (
    <div className="tasks-container glass-card">
      <div className="section-header">
        <div className="section-title">
          <Target size={18} />
          <span>Focus Tasks</span>
        </div>

        <button className="nav-btn" onClick={onOpenAddTask}>
          <Plus size={16} />
          <span>Add Task</span>
        </button>
      </div>

      {/* Filter Chips */}
      <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '1rem' }}>
        <button
          className={`btn-chip ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
          style={{ opacity: filter === 'all' ? 1 : 0.6 }}
        >
          All ({tasks.length})
        </button>
        <button
          className={`btn-chip ${filter === 'active' ? 'active' : ''}`}
          onClick={() => setFilter('active')}
          style={{ opacity: filter === 'active' ? 1 : 0.6 }}
        >
          Active ({tasks.filter(t => !t.completed).length})
        </button>
        <button
          className={`btn-chip ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
          style={{ opacity: filter === 'completed' ? 1 : 0.6 }}
        >
          Done ({tasks.filter(t => t.completed).length})
        </button>
      </div>

      {/* Task List */}
      <div className="task-list">
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No tasks found. Click "Add Task" to start setting your focus intentions.
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isActive = task.id === activeTaskId;
            return (
              <div
                key={task.id}
                className={`task-item ${isActive ? 'active' : ''} ${task.completed ? 'completed' : ''}`}
                onClick={() => onSelectActiveTask(task.id)}
              >
                <div className="task-left">
                  <div
                    className={`task-checkbox ${task.completed ? 'checked' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleComplete(task.id);
                    }}
                  >
                    {task.completed && <Check size={12} />}
                  </div>

                  <div className="task-info">
                    <div className="task-title-text">{task.title}</div>
                    <div className="task-meta">
                      <span className="task-pomo-badge">
                        🍅 {task.completedPomodoros}/{task.estPomodoros}
                      </span>
                      {task.tag && <span className="task-tag">{task.tag}</span>}
                    </div>
                  </div>
                </div>

                <div className="task-right-actions">
                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                    title="Edit Task"
                  >
                    <Edit3 size={15} />
                  </button>

                  <button
                    className="icon-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteTask(task.id);
                    }}
                    title="Delete Task"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

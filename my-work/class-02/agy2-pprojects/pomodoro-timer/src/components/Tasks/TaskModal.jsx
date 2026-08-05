import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSaveTask, taskToEdit }) {
  const [title, setTitle] = useState('');
  const [estPomodoros, setEstPomodoros] = useState(2);
  const [tag, setTag] = useState('General');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setEstPomodoros(taskToEdit.estPomodoros || 2);
      setTag(taskToEdit.tag || 'General');
      setNotes(taskToEdit.notes || '');
    } else {
      setTitle('');
      setEstPomodoros(2);
      setTag('General');
      setNotes('');
    }
  }, [taskToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSaveTask({
      id: taskToEdit ? taskToEdit.id : 'task-' + Date.now(),
      title: title.trim(),
      estPomodoros: Number(estPomodoros) || 1,
      completedPomodoros: taskToEdit ? taskToEdit.completedPomodoros : 0,
      completed: taskToEdit ? taskToEdit.completed : false,
      tag: tag.trim() || 'General',
      notes: notes.trim(),
      createdAt: taskToEdit ? taskToEdit.createdAt : Date.now()
    });

    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{taskToEdit ? 'Edit Focus Task' : 'New Focus Task'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Task Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="What are you working on?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Estimated Pomodoros (🍅)</label>
              <input
                type="number"
                min="1"
                max="20"
                className="form-input"
                value={estPomodoros}
                onChange={(e) => setEstPomodoros(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category Tag</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Design, Coding, Reading"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              className="form-input"
              rows="3"
              placeholder="Add key goals or details for this session..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" className="nav-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="nav-btn active">
              <Check size={16} />
              <span>{taskToEdit ? 'Save Changes' : 'Create Task'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

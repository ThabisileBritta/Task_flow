'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Task, CreateTaskInput, TaskStatus, TaskPriority } from '@/types';

interface TaskFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: CreateTaskInput) => Promise<void>;
  initialData?: Task | null;
}

export function TaskFormModal({ open, onClose, onSubmit, initialData }: TaskFormModalProps) {
  const [form, setForm] = useState<CreateTaskInput>({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    due_date: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        description: initialData.description ?? '',
        status: initialData.status,
        priority: initialData.priority,
        due_date: initialData.due_date
          ? new Date(initialData.due_date).toISOString().split('T')[0]
          : null,
      });
    } else {
      setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: null });
    }
    setError('');
  }, [initialData, open]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: CreateTaskInput = {
        ...form,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      };
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">
            {initialData ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-5">
          {error && (
            <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Title *</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="input-base"
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Description</label>
            <textarea
              value={form.description ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="input-base resize-none"
              rows={3}
              placeholder="Optional details..."
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as TaskStatus }))}
                className="input-base"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((p) => ({ ...p, priority: e.target.value as TaskPriority }))}
                className="input-base"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-700">Due date</label>
            <input
              type="date"
              value={form.due_date ?? ''}
              onChange={(e) => setForm((p) => ({ ...p, due_date: e.target.value || null }))}
              className="input-base"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : initialData ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

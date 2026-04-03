'use client';

import { useState } from 'react';
import { Task, TaskStatus, TaskFilters } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';

export function TasksClient() {
  const [filters, setFilters] = useState<TaskFilters>({});
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks(filters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleStatusChange = async (id: string, status: TaskStatus) => {
    await updateTask(id, { status });
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Delete this task?')) {
      await deleteTask(id);
    }
  };

  const handleModalSubmit = async (input: any) => {
    if (editingTask) {
      await updateTask(editingTask.id, input);
    } else {
      await createTask(input);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingTask(null);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">All tasks</h1>
        <button
          onClick={() => setModalOpen(true)}
          className="btn-primary flex items-center gap-1.5"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          New task
        </button>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filters.status ?? ''}
          onChange={(e) =>
            setFilters((p) => ({ ...p, status: (e.target.value as TaskStatus) || undefined }))
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-500"
        >
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select
          value={filters.priority ?? ''}
          onChange={(e) =>
            setFilters((p) => ({ ...p, priority: (e.target.value as any) || undefined }))
          }
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-500"
        >
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          value={`${filters.sort ?? 'created_at'}:${filters.order ?? 'desc'}`}
          onChange={(e) => {
            const [sort, order] = e.target.value.split(':');
            setFilters((p) => ({ ...p, sort, order: order as 'asc' | 'desc' }));
          }}
          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-indigo-500"
        >
          <option value="created_at:desc">Newest first</option>
          <option value="created_at:asc">Oldest first</option>
          <option value="due_date:asc">Due date (soonest)</option>
          <option value="priority:desc">Priority (highest)</option>
        </select>

        {(filters.status || filters.priority) && (
          <button
            onClick={() => setFilters({})}
            className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700"
          >
            Clear filters ✕
          </button>
        )}
      </div>

      {/* Task count */}
      {!loading && (
        <p className="mb-3 text-xs text-gray-400">
          {tasks.length} task{tasks.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card h-16 animate-pulse bg-gray-100" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="mb-3 text-4xl">🔍</div>
          <p className="text-sm font-medium text-gray-900">No tasks found</p>
          <p className="mt-1 text-xs text-gray-500">
            {filters.status || filters.priority
              ? 'Try adjusting your filters'
              : 'Create your first task to get started'}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}

      <TaskFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
      />
    </>
  );
}

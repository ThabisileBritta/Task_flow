'use client';

import { Task, TaskStatus } from '@/types';

const priorityConfig = {
  low: { label: 'Low', classes: 'bg-gray-100 text-gray-600' },
  medium: { label: 'Medium', classes: 'bg-amber-100 text-amber-700' },
  high: { label: 'High', classes: 'bg-red-100 text-red-700' },
};

const statusConfig = {
  todo: { label: 'To do', classes: 'bg-gray-100 text-gray-600' },
  in_progress: { label: 'In progress', classes: 'bg-blue-100 text-blue-700' },
  done: { label: 'Done', classes: 'bg-green-100 text-green-700' },
};

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onDelete: (id: string) => void;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onStatusChange, onDelete, onEdit }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];

  const isOverdue =
    task.due_date &&
    task.status !== 'done' &&
    new Date(task.due_date) < new Date();

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const nextStatus: Record<TaskStatus, TaskStatus> = {
    todo: 'in_progress',
    in_progress: 'done',
    done: 'todo',
  };

  return (
    <div className={`card p-4 transition hover:shadow-md ${task.status === 'done' ? 'opacity-70' : ''}`}>
      <div className="flex items-start gap-3">
        {/* Checkbox / status toggle */}
        <button
          onClick={() => onStatusChange(task.id, nextStatus[task.status])}
          className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
            task.status === 'done'
              ? 'border-green-500 bg-green-500'
              : 'border-gray-300 hover:border-indigo-500'
          }`}
          aria-label="Toggle task status"
        >
          {task.status === 'done' && (
            <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className={`text-sm font-medium text-gray-900 ${task.status === 'done' ? 'line-through text-gray-400' : ''}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="mt-0.5 text-xs text-gray-500 line-clamp-2">{task.description}</p>
          )}

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${priority.classes}`}>
              {priority.label}
            </span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${status.classes}`}>
              {status.label}
            </span>
            {task.due_date && (
              <span className={`text-xs ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                {isOverdue ? '⚠ ' : ''}Due {formatDate(task.due_date)}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            aria-label="Edit task"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button
            onClick={() => onDelete(task.id)}
            className="rounded p-1 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
            aria-label="Delete task"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

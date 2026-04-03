'use client';

import { useState } from 'react';
import { User, Task, TaskStatus } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';

interface DashboardClientProps {
  user: User;
}

export function DashboardClient({ user }: DashboardClientProps) {
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Stats
  const total = tasks.length;
  const todo = tasks.filter((t) => t.status === 'todo').length;
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
  const done = tasks.filter((t) => t.status === 'done').length;
  const highPriority = tasks.filter((t) => t.priority === 'high' && t.status !== 'done').length;

  const recentTasks = tasks.slice(0, 5);

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            Good {getTimeOfDay()}, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-gray-500">
            {inProgress > 0
              ? `You have ${inProgress} task${inProgress > 1 ? 's' : ''} in progress`
              : 'All caught up!'}
          </p>
        </div>
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

      {/* Stats row */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total tasks" value={total} />
        <StatCard label="To do" value={todo} color="text-gray-600" />
        <StatCard label="In progress" value={inProgress} color="text-blue-600" />
        <StatCard label="High priority" value={highPriority} color="text-red-600" />
      </div>

      {/* Recent tasks */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Recent tasks</h2>
          {total > 5 && (
            <a href="/tasks" className="text-xs text-indigo-600 hover:underline">
              View all →
            </a>
          )}
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="card h-16 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div className="card flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 text-3xl">📋</div>
            <p className="text-sm font-medium text-gray-900">No tasks yet</p>
            <p className="mt-1 text-xs text-gray-500">Create your first task to get started</p>
            <button
              onClick={() => setModalOpen(true)}
              className="btn-primary mt-4"
            >
              Create task
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task) => (
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
      </div>

      <TaskFormModal
        open={modalOpen}
        onClose={handleModalClose}
        onSubmit={handleModalSubmit}
        initialData={editingTask}
      />
    </>
  );
}

function StatCard({ label, value, color = 'text-gray-900' }: { label: string; value: number; color?: string }) {
  return (
    <div className="card p-4">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

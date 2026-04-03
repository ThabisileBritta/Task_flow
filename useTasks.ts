'use client';

import { useState, useEffect, useCallback } from 'react';
import { tasksApi } from '@/lib/api';
import { Task, CreateTaskInput, UpdateTaskInput, TaskFilters } from '@/types';

export function useTasks(filters?: TaskFilters) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await tasksApi.getAll(filters);
      setTasks(res.data.tasks);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.priority, filters?.sort, filters?.order]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const createTask = async (input: CreateTaskInput) => {
    const res = await tasksApi.create(input);
    setTasks((prev) => [res.data.task, ...prev]);
    return res.data.task;
  };

  const updateTask = async (id: string, input: UpdateTaskInput) => {
    const res = await tasksApi.update(id, input);
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? res.data.task : t))
    );
    return res.data.task;
  };

  const deleteTask = async (id: string) => {
    await tasksApi.delete(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tasks,
    loading,
    error,
    refetch: fetchTasks,
    createTask,
    updateTask,
    deleteTask,
  };
}

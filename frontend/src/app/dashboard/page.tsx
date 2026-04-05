'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  LogOut,
  Zap,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ListTodo,
} from 'lucide-react';
import { taskApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Task, TaskFilters, TaskStatus, Priority } from '@/types';
import TaskCard from '@/components/TaskCard';
import TaskModal from '@/components/TaskModal';
import DeleteDialog from '@/components/DeleteDialog';
import TaskSkeleton from '@/components/TaskSkeleton';
import { AxiosError } from 'axios';

const STATUS_OPTIONS: { value: TaskStatus | ''; label: string }[] = [
  { value: '', label: 'All status' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

const PRIORITY_OPTIONS: { value: Priority | ''; label: string }[] = [
  { value: '', label: 'All priority' },
  { value: 'HIGH', label: 'High' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW', label: 'Low' },
];

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<TaskFilters>({ page: 1 });
  const [searchInput, setSearchInput] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) router.push('/auth/login');
  }, [user, authLoading, router]);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const params: Record<string, string | number | undefined> = {
        page: filters.page || 1,
        limit: 8,
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.priority ? { priority: filters.priority } : {}),
        ...(filters.search ? { search: filters.search } : {}),
      };
      const res = await taskApi.getAll(params);
      setTasks(res.data.tasks);
      setTotalPages(res.data.pagination.totalPages);
      setTotal(res.data.pagination.total);
    } catch (err) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    if (user) fetchTasks();
  }, [fetchTasks, user]);

  // Debounced search
  const handleSearch = (value: string) => {
    setSearchInput(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: value, page: 1 }));
    }, 400);
  };

  const handleFilterChange = (key: keyof TaskFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value || undefined, page: 1 }));
  };

  // CRUD handlers
  const handleSave = async (data: Partial<Task>) => {
    setIsSaving(true);
    try {
      if (editingTask) {
        await taskApi.update(editingTask.id, data);
        toast.success('Task updated');
      } else {
        await taskApi.create(data);
        toast.success('Task created');
      }
      setShowModal(false);
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || 'Something went wrong');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await taskApi.delete(deletingTask.id);
      toast.success('Task deleted');
      setDeletingTask(null);
      fetchTasks();
    } catch {
      toast.error('Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      await taskApi.toggle(task.id);
      const next = task.status === 'COMPLETED' ? 'pending' : 'completed';
      toast.success(`Marked as ${next}`);
      fetchTasks();
    } catch {
      toast.error('Failed to update task');
    }
  };

  const openCreate = () => {
    setEditingTask(null);
    setShowModal(true);
  };

  const openEdit = (task: Task) => {
    setEditingTask(task);
    setShowModal(true);
  };

  if (authLoading) return null;
  if (!user) return null;

  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Subtle grid bg */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
          opacity: 0.15,
        }}
      />

      {/* Navbar */}
      <nav
        className="sticky top-0 z-40"
        style={{
          background: 'rgba(10,10,10,0.85)',
          backdropFilter: 'blur(12px)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'var(--accent)' }}
            >
              <Zap size={14} color="#0a0a0a" strokeWidth={2.5} />
            </div>
            <span className="font-display font-bold text-base" style={{ color: 'var(--text-primary)' }}>
              TaskFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm hidden sm:block" style={{ color: 'var(--text-secondary)' }}>
              {user.name}
            </span>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-elevated)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <LogOut size={15} />
              <span className="hidden sm:block">Sign out</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 animate-in">
          <div>
            <h1
              className="font-display text-3xl sm:text-4xl font-bold mb-1"
              style={{ color: 'var(--text-primary)' }}
            >
              My Tasks
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              {total} task{total !== 1 ? 's' : ''} total
              {completedCount > 0 && (
                <span style={{ color: 'var(--green)' }}>
                  {' '}· {completedCount} done
                </span>
              )}
            </p>
          </div>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-display font-semibold text-sm transition-all"
            style={{ background: 'var(--accent)', color: '#0a0a0a' }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden sm:block">New task</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>

        {/* Filters */}
        <div
          className="rounded-xl p-4 mb-6 animate-in"
          style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border)',
            animationDelay: '80ms',
          }}
        >
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: 'var(--text-muted)' }}
              />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search tasks..."
                className="w-full pl-9 pr-4 py-2 rounded-lg text-sm outline-none transition-all"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              />
            </div>

            {/* Status filter */}
            <div className="flex items-center gap-2">
              <SlidersHorizontal size={14} style={{ color: 'var(--text-muted)' }} className="flex-shrink-0" />
              <select
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="py-2 px-3 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <select
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                className="py-2 px-3 rounded-lg text-sm outline-none"
                style={{
                  background: 'var(--bg-elevated)',
                  border: '1px solid var(--border-light)',
                  color: 'var(--text-primary)',
                  cursor: 'pointer',
                }}
              >
                {PRIORITY_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Task list */}
        <div className="animate-in" style={{ animationDelay: '140ms' }}>
          {isLoading ? (
            <TaskSkeleton />
          ) : tasks.length === 0 ? (
            <div
              className="rounded-xl py-16 flex flex-col items-center gap-3 text-center"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'var(--bg-elevated)' }}
              >
                <ListTodo size={22} style={{ color: 'var(--text-muted)' }} />
              </div>
              <div>
                <p className="font-display font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {filters.search || filters.status || filters.priority
                    ? 'No tasks match your filters'
                    : 'No tasks yet'}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
                  {filters.search || filters.status || filters.priority
                    ? 'Try adjusting your search or filters'
                    : 'Create your first task to get started'}
                </p>
              </div>
              {!filters.search && !filters.status && !filters.priority && (
                <button
                  onClick={openCreate}
                  className="mt-2 text-sm font-medium px-4 py-2 rounded-lg"
                  style={{ background: 'var(--accent-dim)', color: 'var(--accent)' }}
                >
                  + New task
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map((task, i) => (
                <div key={task.id} style={{ animationDelay: `${i * 40}ms` }} className="animate-in">
                  <TaskCard
                    task={task}
                    onEdit={openEdit}
                    onDelete={setDeletingTask}
                    onToggle={handleToggle}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) - 1 }))}
              disabled={(filters.page || 1) <= 1}
              className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <ChevronLeft size={16} style={{ color: 'var(--text-primary)' }} />
            </button>
            <span className="text-sm font-mono" style={{ color: 'var(--text-secondary)' }}>
              {filters.page || 1} / {totalPages}
            </span>
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page || 1) + 1 }))}
              disabled={(filters.page || 1) >= totalPages}
              className="p-2 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
            >
              <ChevronRight size={16} style={{ color: 'var(--text-primary)' }} />
            </button>
          </div>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSubmit={handleSave}
          isLoading={isSaving}
        />
      )}
      {deletingTask && (
        <DeleteDialog
          task={deletingTask}
          onConfirm={handleDelete}
          onCancel={() => setDeletingTask(null)}
          isLoading={isDeleting}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Loader2 } from 'lucide-react';
import { Task, TaskStatus, Priority } from '@/types';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
  dueDate: z.string().optional(),
});
type FormData = z.infer<typeof schema>;

interface TaskModalProps {
  task?: Task | null;
  onClose: () => void;
  onSubmit: (data: Partial<Task>) => Promise<void>;
  isLoading: boolean;
}

const inputStyle = {
  background: 'var(--bg-elevated)',
  border: '1px solid var(--border-light)',
  color: 'var(--text-primary)',
  borderRadius: '10px',
  padding: '10px 14px',
  fontSize: '14px',
  width: '100%',
  outline: 'none',
  transition: 'border-color 0.15s',
};

export default function TaskModal({ task, onClose, onSubmit, isLoading }: TaskModalProps) {
  const isEdit = !!task;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      status: 'PENDING',
      priority: 'MEDIUM',
    },
  });

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description ?? '',
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate
          ? new Date(task.dueDate).toISOString().slice(0, 10)
          : '',
      });
    }
  }, [task, reset]);

  const handleFormSubmit = async (data: FormData) => {
    await onSubmit({
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : null,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-lg rounded-2xl animate-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text-primary)' }}>
            {isEdit ? 'Edit task' : 'New task'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--bg-hover)';
              e.currentTarget.style.color = 'var(--text-primary)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = 'var(--text-muted)';
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-5">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: 'var(--text-secondary)' }}>
              Title *
            </label>
            <input
              {...register('title')}
              placeholder="What needs to be done?"
              style={{
                ...inputStyle,
                borderColor: errors.title ? 'var(--red)' : 'var(--border-light)',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) =>
                (e.target.style.borderColor = errors.title ? 'var(--red)' : 'var(--border-light)')
              }
            />
            {errors.title && (
              <p className="text-xs mt-1" style={{ color: 'var(--red)' }}>{errors.title.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Add more context (optional)"
              style={{
                ...inputStyle,
                resize: 'vertical',
                minHeight: '80px',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
            />
          </div>

          {/* Status + Priority row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium mb-2 tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}>
                Status
              </label>
              <select
                {...register('status')}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-2 tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}>
                Priority
              </label>
              <select
                {...register('priority')}
                style={{ ...inputStyle, cursor: 'pointer' }}
                onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          {/* Due date */}
          <div>
            <label className="block text-xs font-medium mb-2 tracking-wider uppercase"
              style={{ color: 'var(--text-secondary)' }}>
              Due Date
            </label>
            <input
              {...register('dueDate')}
              type="date"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--border-light)')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors"
              style={{
                background: 'var(--bg-elevated)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border-light)',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold flex items-center justify-center gap-2 transition-all"
              style={{
                background: isLoading ? 'var(--bg-elevated)' : 'var(--accent)',
                color: isLoading ? 'var(--text-muted)' : '#0a0a0a',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <><Loader2 size={15} className="animate-spin" /> Saving...</>
              ) : isEdit ? (
                'Save changes'
              ) : (
                'Create task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

'use client';

import { format } from 'date-fns';
import { Calendar, Pencil, Trash2, CheckCircle2, Circle, Clock } from 'lucide-react';
import { Task } from '@/types';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onToggle: (task: Task) => void;
}

const priorityConfig = {
  HIGH: { label: 'High', color: 'var(--red)', bg: 'var(--red-dim)' },
  MEDIUM: { label: 'Medium', color: 'var(--accent)', bg: 'var(--accent-dim)' },
  LOW: { label: 'Low', color: 'var(--green)', bg: 'var(--green-dim)' },
};

const statusConfig = {
  PENDING: { label: 'Pending', icon: Circle, color: 'var(--text-muted)' },
  IN_PROGRESS: { label: 'In Progress', icon: Clock, color: 'var(--blue)' },
  COMPLETED: { label: 'Done', icon: CheckCircle2, color: 'var(--green)' },
};

export default function TaskCard({ task, onEdit, onDelete, onToggle }: TaskCardProps) {
  const priority = priorityConfig[task.priority];
  const status = statusConfig[task.status];
  const StatusIcon = status.icon;
  const isCompleted = task.status === 'COMPLETED';

  return (
    <div
      className="rounded-xl p-5 transition-all group animate-in"
      style={{
        background: 'var(--bg-card)',
        border: `1px solid ${isCompleted ? 'var(--border)' : 'var(--border-light)'}`,
        opacity: isCompleted ? 0.65 : 1,
      }}
      onMouseEnter={(e) => {
        if (!isCompleted) e.currentTarget.style.borderColor = 'var(--border-light)';
        e.currentTarget.style.background = 'var(--bg-elevated)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = isCompleted ? 'var(--border)' : 'var(--border-light)';
        e.currentTarget.style.background = 'var(--bg-card)';
      }}
    >
      <div className="flex items-start gap-3">
        {/* Toggle button */}
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 flex-shrink-0 transition-transform hover:scale-110"
          style={{ color: isCompleted ? 'var(--green)' : 'var(--text-muted)' }}
          title={isCompleted ? 'Mark as pending' : 'Mark as complete'}
        >
          <StatusIcon size={20} />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3
              className="font-display font-semibold text-base leading-snug"
              style={{
                color: isCompleted ? 'var(--text-muted)' : 'var(--text-primary)',
                textDecoration: isCompleted ? 'line-through' : 'none',
              }}
            >
              {task.title}
            </h3>

            {/* Actions — visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <button
                onClick={() => onEdit(task)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--bg-hover)';
                  e.currentTarget.style.color = 'var(--text-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Edit task"
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => onDelete(task)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-secondary)' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--red-dim)';
                  e.currentTarget.style.color = 'var(--red)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                }}
                title="Delete task"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>

          {task.description && (
            <p
              className="text-sm mt-1 line-clamp-2"
              style={{ color: 'var(--text-secondary)' }}
            >
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Priority badge */}
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full font-mono"
              style={{ color: priority.color, background: priority.bg }}
            >
              {priority.label}
            </span>

            {/* Status badge */}
            <span
              className="text-xs font-medium px-2 py-0.5 rounded-full"
              style={{
                color: status.color,
                background: `${status.color}20`,
              }}
            >
              {status.label}
            </span>

            {/* Due date */}
            {task.dueDate && (
              <span
                className="text-xs flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                <Calendar size={11} />
                {format(new Date(task.dueDate), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

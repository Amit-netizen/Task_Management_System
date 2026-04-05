'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { Task } from '@/types';

interface DeleteDialogProps {
  task: Task;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function DeleteDialog({ task, onConfirm, onCancel, isLoading }: DeleteDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-6 animate-in"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-light)' }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
          style={{ background: 'var(--red-dim)' }}
        >
          <Trash2 size={18} style={{ color: 'var(--red)' }} />
        </div>

        <h3 className="font-display font-bold text-lg mb-1" style={{ color: 'var(--text-primary)' }}>
          Delete task?
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
            &quot;{task.title}&quot;
          </span>{' '}
          will be permanently deleted. This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium"
            style={{
              background: 'var(--bg-elevated)',
              color: 'var(--text-secondary)',
              border: '1px solid var(--border-light)',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 py-2.5 rounded-xl text-sm font-display font-semibold flex items-center justify-center gap-2"
            style={{
              background: isLoading ? 'var(--bg-elevated)' : 'var(--red)',
              color: isLoading ? 'var(--text-muted)' : '#fff',
              cursor: isLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {isLoading ? <><Loader2 size={15} className="animate-spin" /> Deleting...</> : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

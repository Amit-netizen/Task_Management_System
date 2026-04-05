'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';
import { AxiosError } from 'axios';
import { useRouter } from 'next/navigation';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const { register: registerUser, user, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && user) router.push('/dashboard');
  }, [user, authLoading, router]);

  if (authLoading || user) return null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await registerUser(data.name, data.email, data.password);
      toast.success('Account created!');
    } catch (err) {
      const error = err as AxiosError<{ error: string }>;
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
          opacity: 0.3,
        }}
      />

      <div className="w-full max-w-md animate-in">
        <div className="flex items-center gap-2 mb-10">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'var(--accent)' }}
          >
            <Zap size={16} color="#0a0a0a" strokeWidth={2.5} />
          </div>
          <span className="font-display font-700 text-xl" style={{ color: 'var(--text-primary)' }}>
            TaskFlow
          </span>
        </div>

        <div
          className="rounded-2xl p-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <h1 className="font-display text-3xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>
            Create account
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            Already have one?{' '}
            <Link href="/auth/login" className="font-medium" style={{ color: 'var(--accent)' }}>
              Sign in
            </Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {[
              { field: 'name' as const, label: 'Full Name', type: 'text', placeholder: 'Jane Smith', autocomplete: 'name' },
              { field: 'email' as const, label: 'Email', type: 'email', placeholder: 'you@example.com', autocomplete: 'email' },
            ].map(({ field, label, type, placeholder, autocomplete }) => (
              <div key={field}>
                <label
                  className="block text-xs font-medium mb-2 tracking-wider uppercase"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {label}
                </label>
                <input
                  {...register(field)}
                  type={type}
                  placeholder={placeholder}
                  autoComplete={autocomplete}
                  className="w-full px-4 py-3 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${errors[field] ? 'var(--red)' : 'var(--border-light)'}`,
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors[field] ? 'var(--red)' : 'var(--border-light)')
                  }
                />
                {errors[field] && (
                  <p className="text-xs mt-1.5" style={{ color: 'var(--red)' }}>
                    {errors[field]?.message}
                  </p>
                )}
              </div>
            ))}

            <div>
              <label
                className="block text-xs font-medium mb-2 tracking-wider uppercase"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className="w-full px-4 py-3 pr-12 rounded-xl text-sm outline-none transition-all"
                  style={{
                    background: 'var(--bg-elevated)',
                    border: `1px solid ${errors.password ? 'var(--red)' : 'var(--border-light)'}`,
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
                  onBlur={(e) =>
                    (e.target.style.borderColor = errors.password ? 'var(--red)' : 'var(--border-light)')
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs mt-1.5" style={{ color: 'var(--red)' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl font-display font-semibold text-sm transition-all flex items-center justify-center gap-2 mt-2"
              style={{
                background: isLoading ? 'var(--bg-elevated)' : 'var(--accent)',
                color: isLoading ? 'var(--text-muted)' : '#0a0a0a',
                cursor: isLoading ? 'not-allowed' : 'pointer',
              }}
            >
              {isLoading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

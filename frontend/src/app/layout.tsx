import type { Metadata } from 'next';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from '@/lib/auth-context';
import './globals.css';

export const metadata: Metadata = {
  title: 'TaskFlow — Personal Task Manager',
  description: 'Manage your tasks with clarity and focus',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#1a1a1a',
                color: '#f0ede8',
                border: '1px solid #2a2a2a',
                borderRadius: '8px',
                fontFamily: "'DM Sans', sans-serif",
                fontSize: '14px',
              },
              success: {
                iconTheme: { primary: '#47e87a', secondary: '#1a1a1a' },
              },
              error: {
                iconTheme: { primary: '#e85547', secondary: '#1a1a1a' },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}

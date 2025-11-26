// src/routes/guards.tsx
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return null; // or a spinner
    if (!user) return <Navigate to="/login" replace />;
    return <>{children} </>;
}

export function RequireAnon({ children }: { children: ReactNode }) {
    const { user, loading } = useAuth();
    if (loading) return null; // or a spinner
    if (user) return <Navigate to="/" replace />;
    return <>{children} </>;
}

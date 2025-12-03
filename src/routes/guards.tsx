// src/routes/guards.tsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface GuardProps {
    children: JSX.Element;   // 🔥 IMPORTANT FIX
}

export function RequireAuth({ children }: GuardProps) {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return children; // 🔥 return only ONE element
}

export function RequireAnon({ children }: GuardProps) {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children; // 🔥 no fragment
}

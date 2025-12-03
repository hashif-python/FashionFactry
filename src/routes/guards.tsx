import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface GuardProps {
    children: JSX.Element;
}

/* -----------------------------
   ONLY BLOCK WHEN user != null
----------------------------- */
export function RequireAnon({ children }: GuardProps) {
    const { user, loading } = useAuth();

    // ❌ Don't hide form when loading user=null (login form stage)
    if (loading && user !== null) {
        return null;
    }

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
}

/* -----------------------------
   AUTH PROTECTED ROUTES
----------------------------- */
export function RequireAuth({ children }: GuardProps) {
    const { user, loading } = useAuth();

    if (loading) return null;

    if (!user) return <Navigate to="/login" replace />;

    return children;
}

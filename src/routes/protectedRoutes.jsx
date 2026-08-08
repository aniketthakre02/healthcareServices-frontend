import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, authLoading } = useAuth();

    if (authLoading) return null;

    if (!user) return <Navigate to="/login" />;

    // if allowedRoles specified, check if user's role is in it
    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to="/dashboard" />;
    }

    return children;
};
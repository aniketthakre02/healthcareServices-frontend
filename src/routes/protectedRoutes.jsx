import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const ProtectedRoute = ({ children, allowedRoles }) => {
    const { user, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-orange-50 to-white">
                <div className="text-center">
                    <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mx-auto mb-3"></div>
                    <p className="text-sm text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // if allowedRoles specified, check if user's role is allowed
    if (allowedRoles && allowedRoles.length > 0) {
        const userRole = user.role || user.roles?.[0] || null;
        // Support both string role and array
        const hasAccess = allowedRoles.includes(userRole);
        if (!hasAccess) {
            return <Navigate to="/dashboard" replace />;
        }
    }

    return children;
};

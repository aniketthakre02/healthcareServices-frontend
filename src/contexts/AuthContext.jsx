/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";

const AuthContext = createContext(null);

// Proper base64url decode for JWT payload
const decodeToken = (token) => {
    try {
        const payload = token.split(".")[1];
        if (!payload) return null;
        // base64url -> base64
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
        const json = atob(padded);
        // Handle UTF-8 characters correctly
        const decoded = decodeURIComponent(
            Array.prototype.map
                .call(json, (c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(decoded);
    } catch {
        try {
            // Fallback for ASCII-only payloads
            const payload = token.split(".")[1];
            const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
            return JSON.parse(atob(base64));
        } catch {
            return null;
        }
    }
};

const isTokenExpired = (decoded) => {
    if (!decoded || !decoded.exp) return false;
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    const clearAuth = useCallback(() => {
        localStorage.removeItem("token");
        setUser(null);
    }, []);

    const initializeAuth = useCallback(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            if (!decoded || isTokenExpired(decoded)) {
                clearAuth();
            } else {
                setUser(decoded);
            }
        }
        setAuthLoading(false);
    }, [clearAuth]);

    useEffect(() => {
        initializeAuth();
        // Listen for storage changes across tabs
        const handleStorage = (e) => {
            if (e.key === "token" && !e.newValue) {
                setUser(null);
            }
        };
        window.addEventListener("storage", handleStorage);
        return () => window.removeEventListener("storage", handleStorage);
    }, [initializeAuth]);

    const login = useCallback((token) => {
        localStorage.setItem("token", token);
        const decoded = decodeToken(token);
        if (!decoded || isTokenExpired(decoded)) {
            clearAuth();
            return;
        }
        setUser(decoded);
    }, [clearAuth]);

    const logout = useCallback(() => {
        clearAuth();
    }, [clearAuth]);

    const value = useMemo(
        () => ({
            user,
            login,
            logout,
            authLoading,
            isAuthenticated: !!user,
        }),
        [user, login, logout, authLoading]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};

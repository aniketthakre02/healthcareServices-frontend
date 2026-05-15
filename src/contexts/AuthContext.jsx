import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const decodeToken = (token) => {
    try {
        const payload = token.split(".")[1];
        return JSON.parse(atob(payload));
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            const decoded = decodeToken(token);
            setUser(decoded);
        }
        setAuthLoading(false); 
    }, []);

    const login = (token) => {
        localStorage.setItem("token", token);
        const decoded = decodeToken(token);
        console.log("Decoded JWT:", decoded);
        setUser(decoded);
    };

    const logout = () => {
        localStorage.removeItem("token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, authLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check for existing token logic could be applied here
    // But since HTTPOnly cookies won't be accessible by JS directly,
    // we manage user state from explicit API results (login/signup payload) 
    // or by keeping the user payload in localStorage.
    
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    const logout = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/user/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout error", error);
        }
        setUser(null);
        localStorage.removeItem('user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

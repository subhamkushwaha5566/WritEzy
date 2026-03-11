import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Initial check for existing token
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // Setup axios interceptor to attach the token on every request
        const requestInterceptor = axios.interceptors.request.use((config) => {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });

        setLoading(false);

        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []);

    const login = (userData, token) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (token) {
            localStorage.setItem('token', token);
        }
    };

    const logout = async () => {
        try {
            await axios.post(`${BACKEND_URL}/api/user/logout`, {}, { withCredentials: true });
        } catch (error) {
            console.error("Logout error", error);
        }
        setUser(null);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};

"use client";

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// --- CONFIGURACIÓN DE AXIOS ---
// Configuramos una instancia de Axios para que siempre envíe las cookies
const api = axios.create({
    baseURL: 'http://localhost:3001/api',
    withCredentials: true,
});

// --- DEFINICIÓN DE TIPOS ---
interface User {
    usuario: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
    login: (usuario: string, contrasena: string) => Promise<void>;
    register: (usuario: string, contrasena: string) => Promise<void>;
    logout: () => void;
}

// --- CREACIÓN DEL CONTEXTO ---
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- HOOK PERSONALIZADO para usar el contexto fácilmente ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// --- EL COMPONENTE PROVEEDOR (EL "CEREBRO") ---
export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true); // Inicia en true para verificar la sesión
    const router = useRouter();

    // Función para verificar si hay una sesión activa al cargar la app
    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                // Hacemos una petición a una ruta protegida para verificar el token
                // Si la cookie es válida, esto funcionará
                const response = await api.get('/clientes'); // Usamos una ruta protegida existente
                // Si la petición tuvo éxito, el token es válido. Pero necesitamos los datos del usuario.
                // Podríamos crear un endpoint /api/profile que devuelva el usuario del token.
                // Por ahora, asumimos que si /clientes funciona, estamos logueados.
                // Para una mejor UX, el endpoint de login debería devolver el usuario.
                setUser({ usuario: 'Usuario Activo' }); // Placeholder
            } catch (error) {
                setUser(null); // Si falla, no hay sesión
            } finally {
                setLoading(false);
           }
        };
        checkLoggedIn();
    }, []);

    const login = async (usuario: string, contrasena: string) => {
        const response = await api.post('/login', { usuario, contrasena });
        const userData: User = { usuario: response.data.usuario };
        setUser(userData);
        router.push('/'); // Redirige a la página principal después del login
    };

    const register = async (usuario: string, contrasena: string) => {
        await api.post('/register', { usuario, contrasena });
        // Después de registrar, puedes redirigir al login o loguear automáticamente
        router.push('/login');
    };

    const logout = async () => {
        await api.post('/logout');
        setUser(null);
        router.push('/login'); // Redirige al login después de cerrar sesión
    };

    const value = {
        user,
        isAuthenticated: !!user,
        loading,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
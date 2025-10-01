"use client";

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Este componente recibe 'children', que es la página que queremos proteger.
export default function ProtectedRoute({ children }: { children: ReactNode }) {
    // Usamos nuestro hook para saber si el usuario está autenticado y si se está verificando.
    const { isAuthenticated, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        // useEffect se ejecuta cada vez que 'loading', 'isAuthenticated' o 'router' cambian.
        
        // Si la verificación ha terminado (!loading) y el usuario NO está autenticado...
        if (!loading && !isAuthenticated) {
            // ...lo redirigimos a la página de login.
            router.push('/login');
        }
    }, [isAuthenticated, loading, router]); // Dependencias del efecto

    // Mientras se verifica la sesión (loading es true), mostramos un mensaje.
    // Esto es crucial para evitar que la página protegida se muestre por un instante.
    if (loading) {
        return (
            <div className="vh-100 d-flex justify-content-center align-items-center" data-bs-theme="dark">
                <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si la verificación terminó y el usuario SÍ está autenticado,
    // mostramos los 'children' (es decir, la página protegida).
    if (isAuthenticated) {
        return <>{children}</>;
    }

    // Si no está autenticado, no mostramos nada porque ya se está redirigiendo.
    return null;
}
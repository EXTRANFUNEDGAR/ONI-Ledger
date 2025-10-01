"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Importamos nuestro hook
import Link from 'next/link';

export default function LoginPage() {
    // Estados para los campos del formulario
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // Obtenemos la función de login desde el contexto
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(''); // Limpiamos errores previos
        setLoading(true);

        try {
            await login(usuario, contrasena);
            // El AuthContext se encargará de redirigir si el login es exitoso
        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.message || 'Error al iniciar sesión.');
            setLoading(false);
        }
    };

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center" data-bs-theme="dark">
            <div className="card text-light bg-dark border-secondary" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-4">
                    <h2 className="text-center text-success mb-4">Iniciar Sesión</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="usuario" className="form-label">Usuario</label>
                            <input
                                type="text"
                                id="usuario"
                                className="form-control"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="contrasena" className="form-label">Contraseña</label>
                            <input
                                type="password"
                                id="contrasena"
                                className="form-control"
                                value={contrasena}
                                onChange={(e) => setContrasena(e.target.value)}
                                required
                            />
                        </div>
                        
                        {error && <div className="alert alert-danger p-2">{error}</div>}

                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? 'Ingresando...' : 'Ingresar'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3">
                        <small>
                            ¿No tienes una cuenta? <Link href="/register">Regístrate aquí</Link>
                        </small>
                    </div>
                </div>
            </div>
        </div>
    );
}
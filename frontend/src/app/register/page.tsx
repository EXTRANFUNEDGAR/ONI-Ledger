"use client";

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import axios from 'axios'; // Importa axios para verificar el tipo de error

export default function RegisterPage() {
    const [usuario, setUsuario] = useState('');
    const [contrasena, setContrasena] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register(usuario, contrasena);
        } catch (err) { // <-- CORRECCIÓN: Quitamos ': any'
            console.error(err);
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Error al registrar el usuario.');
            } else {
                setError('Ocurrió un error inesperado.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="container vh-100 d-flex align-items-center justify-content-center" data-bs-theme="dark">
            <div className="card text-light bg-dark border-secondary" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-body p-4">
                    <h2 className="text-center text-success mb-4">Crear Cuenta</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="usuario" className="form-label">Usuario</label>
                            <input type="text" id="usuario" className="form-control" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="contrasena" className="form-label">Contraseña</label>
                            <input type="password" id="contrasena" className="form-control" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
                        </div>
                        {error && <div className="alert alert-danger p-2">{error}</div>}
                        <div className="d-grid mt-4">
                            <button type="submit" className="btn btn-success" disabled={loading}>
                                {loading ? 'Registrando...' : 'Registrar'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-3">
                        <small>¿Ya tienes una cuenta? <Link href="/login">Inicia sesión aquí</Link></small>
                    </div>
                </div>
            </div>
        </div>
    );
}
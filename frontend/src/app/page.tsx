"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '@/components/Header';
import Search from '@/components/Search';
import Agregar from '@/components/Agregar';
import Tabla from '@/components/Tabla';
import Formulario from '@/components/Formulario';
import ProtectedRoute from '@/components/ProtectedRoute';

// Interfaz para la estructura de un cliente
interface Cliente {
    id_cliente: number;
    nombre: string;
    rfc: string;
    email: string;
    codigo_postal: string;
    regimen_fiscal: string;
    constancia: string;
    fecha: string;
}

export default function Home() {
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const obtenerClientes = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/clientes', { withCredentials: true });
            setClientes(response.data);
        } catch (error) {
            console.error("Error al obtener los clientes:", error);
        }
    };

    useEffect(() => {
        obtenerClientes();
    }, []);

    const handleEditarClick = (cliente: Cliente) => {
        setClienteAEditar(cliente);
        setShowModal(true);
    };

    const handleAgregarClick = () => {
        setClienteAEditar(null);
        setShowModal(true);
    };

    const filteredClientes = clientes.filter(cliente =>
        cliente.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.rfc.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <ProtectedRoute>
            {/* Se aplica el tema oscuro a toda la página */}
            <div data-bs-theme="dark" style={{ backgroundColor: '#212529', minHeight: '100vh' }}>
                <Header />
                <main className="container mt-4">
                    {/* Tarjeta para contener los controles y la tabla */}
                    <div className="card text-light bg-dark border-secondary">
                        <div className="card-header border-secondary">
                            <div className="d-flex justify-content-between align-items-center">
                                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                                <Agregar onAgregarClick={handleAgregarClick} />
                            </div>
                        </div>
                        <div className="card-body">
                            <Tabla
                                clientes={filteredClientes}
                                setClientes={setClientes}
                                onEditarClick={handleEditarClick}
                            />
                        </div>
                    </div>
                    
                    <Formulario
                        show={showModal}
                        onHide={() => setShowModal(false)}
                        onClienteGuardado={() => {
                            setShowModal(false);
                            obtenerClientes();
                        }}
                        clienteAEditar={clienteAEditar}
                    />
                </main>
            </div>
        </ProtectedRoute>
    );
}
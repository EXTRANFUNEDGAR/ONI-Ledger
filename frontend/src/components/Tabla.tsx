"use client";

import React from 'react';
import axios from 'axios';
import Link from 'next/link';

// Interfaz para definir la estructura de un cliente
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

// Interfaz para las props que la tabla recibirá
interface TablaProps {
    clientes: Cliente[];
    setClientes: React.Dispatch<React.SetStateAction<Cliente[]>>;
    onEditarClick: (cliente: Cliente) => void;
}

export default function Tabla({ clientes, setClientes, onEditarClick }: TablaProps) {
    
    // Función para manejar la eliminación de un cliente
    const handleDelete = async (id: number) => {
        const confirmacion = window.confirm("¿Estás seguro de que deseas eliminar este cliente?");
        if (!confirmacion) return;

        try {
            // Hacemos la llamada a la API para eliminar el registro
            await axios.delete(`http://localhost:3001/api/clientes/${id}`, { 
                withCredentials: true // <-- CORRECCIÓN
            });
            
            // Actualizamos el estado local para que la tabla se actualice
            setClientes(clientes.filter(cliente => cliente.id_cliente !== id));
        } catch (error) {
            console.error("Error al eliminar el cliente", error);
            alert("Error al eliminar el cliente. Tu sesión puede haber expirado.");
        }
    };

    return (
        <div>
            <h2>Lista de Clientes</h2>
            <div className="table-responsive">
                <table className="table table-dark table-striped table-hover">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">RFC</th>
                            <th scope="col">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.map(cliente => (
                            <tr key={cliente.id_cliente}>
                                <th scope="row">{cliente.id_cliente}</th>
                                <td>
                                    <Link href={`/clientes/${cliente.id_cliente}`}>
                                        {cliente.nombre}
                                    </Link>
                                </td>
                                <td>{cliente.rfc}</td>
                                <td>
                                    <button
                                        className="btn btn-primary btn-sm me-2"
                                        onClick={() => onEditarClick(cliente)}
                                    >
                                        Editar
                                    </button>
                                    <button
                                        className="btn btn-danger btn-sm"
                                        onClick={() => handleDelete(cliente.id_cliente)}
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
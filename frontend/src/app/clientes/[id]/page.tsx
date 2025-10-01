"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import ProtectedRoute from '@/components/ProtectedRoute';

// --- INTERFACES DE TIPOS ---
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

interface Factura {
    id_factura: number;
    factura: string;
    fecha: string;
    descripcion: string;
    total: number;
}

export default function ClienteDetalle() {
    // --- ESTADOS ---
    const [cliente, setCliente] = useState<Cliente | null>(null);
    const [facturas, setFacturas] = useState<Factura[]>([]);
    const [loading, setLoading] = useState(true);
    const [newFacturaFile, setNewFacturaFile] = useState<File | null>(null);
    const [newFacturaDate, setNewFacturaDate] = useState('');
    const [newFacturaDesc, setNewFacturaDesc] = useState('');
    const [newFacturaTotal, setNewFacturaTotal] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [enviandoId, setEnviandoId] = useState<number | null>(null);
    const params = useParams();
    const id = params.id as string;

    // --- LÓGICA DE DATOS ---
    const fetchFacturas = useCallback(async (page: number, search: string) => {
        if (!id) return;
        try {
            const response = await axios.get(`http://localhost:3001/api/clientes/${id}/facturas`, {
                params: { page, search, limit: 5 },
                withCredentials: true
            });
            setFacturas(response.data.facturas);
            setTotalPages(response.data.totalPages);
            setCurrentPage(response.data.currentPage);
        } catch (error) {
            console.error("Error al obtener las facturas:", error);
        }
    }, [id]);

    const fetchCliente = useCallback(async () => {
        if (!id) return;
        try {
            const response = await axios.get(`http://localhost:3001/api/clientes/${id}`, { withCredentials: true });
            setCliente(response.data);
        } catch (error) {
            console.error("Error al obtener el cliente:", error);
        }
    }, [id]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await fetchCliente();
            await fetchFacturas(currentPage, searchTerm);
            setLoading(false);
        };
        if (id) {
            loadData();
        }
    }, [id, currentPage, searchTerm, fetchCliente, fetchFacturas]);

    // --- MANEJADORES DE EVENTOS ---
    const handleFacturaSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newFacturaFile || !id) return;
        const data = new FormData();
        data.append('id_cliente', id);
        data.append('fecha', newFacturaDate);
        data.append('factura_pdf', newFacturaFile);
        data.append('descripcion', newFacturaDesc);
        data.append('total', newFacturaTotal);
        try {
            await axios.post('http://localhost:3001/api/facturas', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
                withCredentials: true
            });
            await fetchFacturas(1, '');
            setSearchTerm('');
            (e.target as HTMLFormElement).reset();
            setNewFacturaFile(null);
            setNewFacturaDate('');
            setNewFacturaDesc('');
            setNewFacturaTotal('');
        } catch (error) {
            alert("Error al subir la factura.");
        }
    };
    
    const handleFacturaDelete = async (id_factura: number) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar esta factura?")) return;
        try {
            await axios.delete(`http://localhost:3001/api/facturas/${id_factura}`, { withCredentials: true });
            await fetchFacturas(currentPage, searchTerm);
        } catch (error) {
            alert("Error al eliminar la factura.");
        }
    };

    const handleEnviarCorreo = async (id_factura: number) => {
        setEnviandoId(id_factura);
        try {
            const response = await axios.post(`http://localhost:3001/api/facturas/${id_factura}/enviar`, {}, { withCredentials: true });
            alert(response.data.message);
        } catch (error) {
            alert("Hubo un error al enviar el correo.");
        } finally {
            setEnviandoId(null);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1);
    };

    if (loading && !cliente) return null;
    if (!cliente) {
        return (
            <ProtectedRoute>
                <div className="container mt-5 text-center" data-bs-theme="dark"><p>Cliente no encontrado.</p><Link href="/" className="btn btn-secondary">Volver a la Lista</Link></div>
            </ProtectedRoute>
        );
    }
    
    const urlConstancia = `http://localhost:3001/${cliente.constancia.replace(/\\/g, '/')}`;

    return (
        <ProtectedRoute>
            <div className="min-vh-100" style={{ backgroundColor: '#212529' }}>
                <div className="container py-4" data-bs-theme="dark">
                    <div className="card mb-4 text-light bg-dark border-secondary">
                        <div className="card-header border-secondary d-flex justify-content-between align-items-center">
                            <h2>Detalles del Cliente: <span className="text-success">{cliente.nombre}</span></h2>
                            <Link href="/" className="btn btn-outline-secondary">
                                Volver a la Lista
                            </Link>
                        </div>
                        <div className="card-body">
                            <p><strong>ID:</strong> {cliente.id_cliente}</p>
                            <p><strong>RFC:</strong> {cliente.rfc}</p>
                            <p><strong>Correo Electrónico:</strong> {cliente.email || 'No registrado'}</p>
                            <p><strong>Código Postal:</strong> {cliente.codigo_postal}</p>
                            <p><strong>Régimen Fiscal:</strong> {cliente.regimen_fiscal}</p>
                            <p><strong>Fecha de Registro:</strong> {new Date(cliente.fecha).toLocaleDateString()}</p>
                            <p><strong>Constancia Fiscal:</strong> <a href={urlConstancia} target="_blank" rel="noopener noreferrer" className="ms-2 btn btn-sm btn-outline-success">Ver Documento</a></p>
                        </div>
                    </div>

                    <div className="card text-light bg-dark border-secondary">
                        <div className="card-header border-secondary"><h3>Gestión de Facturas</h3></div>
                        <div className="card-body">
                            <form onSubmit={handleFacturaSubmit} className="mb-4 p-3 border border-secondary rounded">
                                <h5 className="text-success">Subir Nueva Factura</h5>
                                <div className="row g-3">
                                    <div className="col-md-12"><label htmlFor="descripcion" className="form-label">Descripción</label><input type="text" className="form-control" id="descripcion" value={newFacturaDesc} onChange={(e) => setNewFacturaDesc(e.target.value)} required /></div>
                                    <div className="col-md-5"><label htmlFor="factura_pdf" className="form-label">Archivo (PDF)</label><input type="file" className="form-control" id="factura_pdf" onChange={(e) => setNewFacturaFile(e.target.files ? e.target.files[0] : null)} required /></div>
                                    <div className="col-md-3"><label htmlFor="fecha_factura" className="form-label">Fecha</label><input type="date" className="form-control" id="fecha_factura" value={newFacturaDate} onChange={(e) => setNewFacturaDate(e.target.value)} required /></div>
                                    <div className="col-md-2"><label htmlFor="total" className="form-label">Total</label><input type="number" step="0.01" className="form-control" id="total" value={newFacturaTotal} onChange={(e) => setNewFacturaTotal(e.target.value)} required /></div>
                                    <div className="col-md-2 d-flex align-items-end"><button type="submit" className="btn btn-success w-100">Subir</button></div>
                                </div>
                            </form>

                            <div className="mb-3">
                                <input type="text" className="form-control" placeholder="Buscar facturas por descripción o total..." value={searchTerm} onChange={handleSearchChange} />
                            </div>

                            <div className="table-responsive">
                                <table className="table table-dark table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>ID</th><th>Descripción</th><th>Fecha</th><th>Total</th><th>Archivo</th><th className="text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {facturas.map(factura => (
                                            <tr key={factura.id_factura}>
                                                <td>{factura.id_factura}</td>
                                                <td>{factura.descripcion}</td>
                                                <td>{new Date(factura.fecha).toLocaleDateString()}</td>
                                                <td>${factura.total ? parseFloat(factura.total.toString()).toFixed(2) : '0.00'}</td>
                                                <td><a href={`http://localhost:3001/${factura.factura.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">Ver PDF</a></td>
                                                <td className="text-center">
                                                    <button className="btn btn-info btn-sm me-2" onClick={() => handleEnviarCorreo(factura.id_factura)} disabled={enviandoId === factura.id_factura}>{enviandoId === factura.id_factura ? 'Enviando...' : 'Enviar'}</button>
                                                    <button className="btn btn-danger btn-sm" onClick={() => handleFacturaDelete(factura.id_factura)}>Eliminar</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            {facturas.length === 0 && <p className="text-center text-muted">No se encontraron facturas.</p>}

                            <div className="d-flex justify-content-between align-items-center mt-3">
                                <button className="btn btn-outline-secondary" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage <= 1}>Anterior</button>
                                <span>Página {currentPage} de {totalPages}</span>
                                <button className="btn btn-outline-secondary" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage >= totalPages}>Siguiente</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
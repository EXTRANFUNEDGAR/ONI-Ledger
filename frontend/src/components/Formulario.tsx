"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';

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

interface FormularioProps {
    show: boolean;
    onHide: () => void;
    onClienteGuardado: () => void;
    clienteAEditar: Cliente | null;
}

interface IFormData {
    nombre: string;
    rfc: string;
    email: string;
    codigo_postal: string;
    regimen_fiscal: string;
    constancia: File | null;
    fecha: string;
}

export default function Formulario({ show, onHide, onClienteGuardado, clienteAEditar }: FormularioProps) {
    // Estado para los campos del formulario
    const [formData, setFormData] = useState<IFormData>({
        nombre: '', rfc: '', email: '', codigo_postal: '', regimen_fiscal: '', constancia: null, fecha: ''
    });

    // Efecto para llenar o resetear el formulario
    useEffect(() => {
        if (clienteAEditar) {
            setFormData({
                nombre: clienteAEditar.nombre,
                rfc: clienteAEditar.rfc,
                email: clienteAEditar.email || '',
                codigo_postal: clienteAEditar.codigo_postal,
                regimen_fiscal: clienteAEditar.regimen_fiscal,
                fecha: clienteAEditar.fecha ? clienteAEditar.fecha.split('T')[0] : '',
                constancia: null, // El archivo siempre se debe seleccionar de nuevo por seguridad
            });
        } else {
            setFormData({ nombre: '', rfc: '', email: '', codigo_postal: '', regimen_fiscal: '', constancia: null, fecha: '' });
        }
    }, [clienteAEditar, show]);

    // Maneja los cambios en todos los inputs
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.type === 'file') {
            setFormData({ ...formData, [e.target.name]: e.target.files ? e.target.files[0] : null });
        } else {
            setFormData({ ...formData, [e.target.name]: e.target.value });
        }
    };

    // Maneja el envío del formulario
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const data = new FormData();
        data.append('nombre', formData.nombre);
        data.append('rfc', formData.rfc);
        data.append('email', formData.email);
        data.append('codigo_postal', formData.codigo_postal);
        data.append('regimen_fiscal', formData.regimen_fiscal);
        data.append('fecha', formData.fecha);
        if (formData.constancia) {
            data.append('constancia', formData.constancia);
        }

        try {
            if (clienteAEditar) {
                // MODO EDICIÓN: Petición PUT con credenciales
                await axios.put(`http://localhost:3001/api/clientes/${clienteAEditar.id_cliente}`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true // <- CORRECCIÓN
                });
            } else {
                // MODO CREACIÓN: Petición POST con credenciales
                await axios.post('http://localhost:3001/api/clientes', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                    withCredentials: true // <- CORRECCIÓN
                });
            }
            onClienteGuardado();
        } catch (error) {
            console.error("Error al guardar el cliente:", error);
            alert("Error al guardar el cliente. Asegúrate de haber iniciado sesión.");
        }
    };

    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false} data-bs-theme="dark">
            <Modal.Header closeButton>
                <Modal.Title>{clienteAEditar ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <form id="cliente-form" onSubmit={handleSubmit}>
                    <div className="mb-3"><label htmlFor="nombre" className="form-label">Nombre</label><input type="text" className="form-control" id="nombre" name="nombre" value={formData.nombre} onChange={handleChange} required /></div>
                    <div className="mb-3"><label htmlFor="rfc" className="form-label">RFC</label><input type="text" className="form-control" id="rfc" name="rfc" value={formData.rfc} onChange={handleChange} required /></div>
                    <div className="mb-3"><label htmlFor="email" className="form-label">Correo Electrónico</label><input type="email" className="form-control" id="email" name="email" value={formData.email} onChange={handleChange} required /></div>
                    <div className="mb-3"><label htmlFor="codigo_postal" className="form-label">Código Postal</label><input type="text" className="form-control" id="codigo_postal" name="codigo_postal" value={formData.codigo_postal} onChange={handleChange} required /></div>
                    <div className="mb-3"><label htmlFor="regimen_fiscal" className="form-label">Régimen Fiscal</label><input type="text" className="form-control" id="regimen_fiscal" name="regimen_fiscal" value={formData.regimen_fiscal} onChange={handleChange} required /></div>
                    <div className="mb-3"><label htmlFor="constancia" className="form-label">Constancia Fiscal (PDF)</label><input type="file" className="form-control" id="constancia" name="constancia" onChange={handleChange} required={!clienteAEditar} /></div>
                    <div className="mb-3"><label htmlFor="fecha" className="form-label">Fecha</label><input type="date" className="form-control" id="fecha" name="fecha" value={formData.fecha} onChange={handleChange} required /></div>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>Cancelar</Button>
                <Button variant="primary" type="submit" form="cliente-form">
                    {clienteAEditar ? 'Guardar Cambios' : 'Guardar Cliente'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
}
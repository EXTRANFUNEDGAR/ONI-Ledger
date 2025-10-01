"use client";

import React from 'react';
import styles from "./Search.module.css";

// Interfaz para definir las props que el componente recibirá
interface SearchProps {
    searchTerm: string;
    setSearchTerm: (term: string) => void;
}

export default function Search({ searchTerm, setSearchTerm }: SearchProps) {
    
    // Función para manejar el cambio en el input
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    // Prevenimos que el formulario recargue la página
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
    };

    return (
        <div>
            <form className="d-flex" role="search" onSubmit={handleSubmit}>
                <input
                    className={styles.inSearch}
                    type="search"
                    placeholder="Buscar por nombre o RFC..."
                    aria-label="Search"
                    value={searchTerm} // El valor del input está controlado por el estado del padre
                    onChange={handleSearchChange} // Cada cambio actualiza el estado del padre
                />
                {/* Sintaxis de className corregida */}
                <button className={`${styles.boton} btn btn-outline-success`} type="submit">
                    Buscar
                </button>
            </form>
        </div>
    );
}
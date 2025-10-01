import React from 'react';
import Link from 'next/link'; // Es una buena práctica que el logo/título sea un enlace a la página principal

export default function Header() {
    return (
        // Usamos clases de Bootstrap para crear una barra de navegación oscura
        <header className="navbar navbar-dark bg-dark border-bottom border-secondary shadow-sm">
            <div className="container-fluid justify-content-center">
                {/* 'navbar-brand' es la clase estándar para el título/logo */}
                <Link href="/" className="navbar-brand text-success fs-3 fw-bold text-uppercase">
                    ONI-Ledger
                </Link>
            </div>
        </header>
    );
}
Gestor de Clientes y Facturas (ONI-Ledger)

Una aplicación web full-stack diseñada para la gestión de clientes y sus facturas.  
Permite registrar clientes, subir documentos fiscales, administrar facturas por cliente y enviar notificaciones por correo electrónico.  
El proyecto está protegido por un sistema de autenticación basado en JWT.

---

## Características Principales

- Autenticación de Usuarios: Registro y Login con tokens JWT y contraseñas encriptadas.
- Gestión de Clientes (CRUD): Crear, Leer, Actualizar y Eliminar clientes.
- Subida de Archivos: Carga de constancias fiscales con almacenamiento organizado.
- Gestión de Facturas: Añadir, ver, eliminar y enviar facturas asociadas a cada cliente.
- Envío de Correos: Envío de facturas por correo electrónico con Nodemailer.
- Búsqueda y Paginación: Filtrado y manejo de grandes volúmenes de datos.

---

## Tecnologías Utilizadas

Frontend:

- Framework: Next.js (App Router)
- Lenguaje: TypeScript
- Librerías: React, Axios
- Estilos: React-Bootstrap, Bootstrap 5

Backend:

- Entorno: Node.js
- Framework: Express
- Base de Datos: PostgreSQL
- Autenticación: JSON Web Tokens, bcryptjs, cookie-parser
- Manejo de Archivos: Multer
- Envío de Correos: Nodemailer

---

## Estructura del Proyecto

Este es un monorepo simple que contiene dos proyectos independientes:

/frontend → Aplicación Next.js que consume la API  
/backend → Servidor API con Node.js y Express

---

## Guía de Instalación y Ejecución Local

Prerrequisitos:

- Node.js (v18 o superior)
- PostgreSQL
- Git

1. Clonar el Repositorio:
   git clone https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   cd TU_REPOSITORIO

2. Configurar el Backend:
   cd backend
   npm install

# Crear archivo .env en /backend (ver configuración más abajo)

npm run dev

El backend estará disponible en: http://localhost:3001

3. Configurar el Frontend:
   cd frontend
   npm install
   npm run dev

El frontend estará disponible en: http://localhost:3000

---

## Variables de Entorno

Crea un archivo .env en la raíz de la carpeta /backend con el siguiente contenido:

DB_USER=tu_usuario_postgres  
DB_PASSWORD=tu_contraseña_postgres  
DB_HOST=localhost  
DB_PORT=5432  
DB_NAME=tu_base_de_datos

JWT_SECRET=este_es_un_secreto_muy_largo_y_dificil_de_adivinar

EMAIL_USER=tu.correo@gmail.com  
EMAIL_PASS=xxxxxxxxxxxxxxxx

---

## Uso de la Aplicación

1. Abre http://localhost:3000 en tu navegador.
2. Serás redirigido a /login.
   - Si no tienes cuenta, regístrate en /register.
3. Tras iniciar sesión, accederás al panel principal para gestionar clientes.
4. Funcionalidades:
   - Agregar, editar y eliminar clientes.
   - Ver detalles de un cliente específico.
   - Subir, ver, eliminar y enviar facturas por correo electrónico.

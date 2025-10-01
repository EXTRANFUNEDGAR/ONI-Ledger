Gestor de Clientes y Facturas (ONI-Ledger)

Una aplicación web full-stack diseñada para la gestión de clientes y sus facturas. Permite registrar clientes, subir documentos fiscales, administrar facturas por cliente y enviar notificaciones por correo electrónico. El proyecto está protegido por un sistema de autenticación basado en JWT.
Características Principales

    Autenticación de Usuarios: Sistema completo de Registro y Login con tokens JWT y contraseñas encriptadas.

    Gestión de Clientes (CRUD): Funcionalidad completa para Crear, Leer, Actualizar y Eliminar clientes.

    Subida de Archivos: Carga de constancias fiscales para cada cliente con almacenamiento organizado en el servidor.

    Gestión de Facturas: Sistema para añadir, ver, eliminar y enviar facturas asociadas a cada cliente.

    Envío de Correos: Envío de facturas por correo electrónico directamente desde la aplicación usando Nodemailer.

    Búsqueda y Paginación: Filtrado de clientes y facturas, con paginación para manejar grandes volúmenes de datos.

Tecnologías Utilizadas
Frontend

    Framework: Next.js (con App Router)

    Lenguaje: TypeScript

    Librerías: React, Axios

    Estilos: React-Bootstrap, Bootstrap 5

Backend

    Entorno: Node.js

    Framework: Express

    Base de Datos: PostgreSQL

    Autenticación: JSON Web Tokens (jsonwebtoken), bcryptjs, cookie-parser

    Manejo de Archivos: Multer

    Envío de Correos: Nodemailer

Estructura del Proyecto

Este es un monorepo simple que contiene dos proyectos independientes:

    /frontend: La aplicación de Next.js que consume la API.

    /backend: El servidor de API con Node.js y Express.

Guía de Instalación y Ejecución Local

Sigue estos pasos para levantar el proyecto en tu máquina local.
Prerrequisitos

    Node.js (v18 o superior)

    PostgreSQL

    Git

1. Clonar el Repositorio

git clone [https://github.com/TU_USUARIO/TU_REPOSITORIO.git](https://github.com/TU_USUARIO/TU_REPOSITORIO.git)
cd TU_REPOSITORIO

2. Configurar el Backend

Primero, configura y levanta el servidor de la API.

# Navega a la carpeta del backend

cd backend

# Instala las dependencias

npm install

# Crea un archivo .env en la raíz de /backend y configúralo (ver abajo)

# Inicia el servidor de desarrollo (con nodemon)

npm run dev

El servidor del backend estará corriendo en http://localhost:3001. 3. Configurar el Frontend

Abre una nueva terminal para configurar y levantar la aplicación de React.

# Navega a la carpeta del frontend (desde la raíz del proyecto)

cd frontend

# Instala las dependencias

npm install

# Inicia el servidor de desarrollo

npm run dev

La aplicación de frontend estará corriendo en http://localhost:3000.
Variables de Entorno

Necesitas crear un archivo .env en la raíz de la carpeta /backend para que la aplicación funcione.
Archivo .env en la carpeta /backend

# Credenciales de la Base de Datos

DB_USER=tu_usuario_postgres
DB_PASSWORD=tu_contraseña_postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=tu_base_de_datos

# Secreto para firmar los Tokens JWT

JWT_SECRET=este_es_un_secreto_muy_largo_y_dificil_de_adivinar

# Credenciales de Gmail para Nodemailer (usa una Contraseña de Aplicación de 16 dígitos)

EMAIL_USER=tu.correo@gmail.com
EMAIL_PASS=xxxxxxxxxxxxxxxx

Uso de la Aplicación

    Abre http://localhost:3000 en tu navegador.

    Serás redirigido a la página de /login. Si no tienes una cuenta, ve a /register para crear una.

    Una vez iniciada la sesión, serás llevado al panel principal donde puedes ver y gestionar los clientes.

    Puedes agregar, editar y eliminar clientes.

    Al hacer clic en el nombre de un cliente, irás a su página de detalles.

    En la página de detalles, puedes gestionar las facturas de ese cliente: subirlas, verlas, eliminarlas y enviarlas por correo.

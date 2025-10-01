// 1. IMPORTACIONES
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

// 2. INICIALIZACIÓN DE LA APLICACIÓN
const app = express();
const PORT = 3001;

// 3. CONFIGURACIÓN DE LA BASE DE DATOS
const pool = new Pool({
    user: process.env.DB_USER,
    host: 'localhost',
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: 5432
});

// 4. CONFIGURACIÓN DE MIDDLEWARES
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static('uploads'));

// 5. CONFIGURACIÓN DE NODEMAILER
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

// 6. CONFIGURACIÓN DE MULTER
const storageConstancia = multer.diskStorage({
    destination: (req, file, cb) => {
        const nombreCliente = req.body.nombre.replace(/\s+/g, '_');
        const dir = path.join('uploads', nombreCliente);
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const filename = 'constancia' + path.extname(file.originalname);
        cb(null, filename);
    }
});
const uploadConstancia = multer({ storage: storageConstancia });

const storageFactura = multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
            const { id_cliente } = req.body;
            const result = await pool.query('SELECT nombre FROM clientes WHERE id_cliente = $1', [id_cliente]);
            if (result.rows.length === 0) return cb(new Error('Cliente no encontrado para guardar la factura.'));
            const nombreCliente = result.rows[0].nombre.replace(/\s+/g, '_');
            const dir = path.join('uploads', nombreCliente, 'facturas');
            fs.mkdirSync(dir, { recursive: true });
            cb(null, dir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const uploadFactura = multer({ storage: storageFactura });

// 7. MIDDLEWARE DE AUTENTICACIÓN
const authenticateToken = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.sendStatus(401);
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// 8. RUTAS DE AUTENTICACIÓN
app.post('/api/register', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;
        if (!usuario || !contrasena) return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);
        const { rows } = await pool.query('INSERT INTO users (usuario, contrasena) VALUES ($1, $2) RETURNING id_user, usuario', [usuario, contrasenaEncriptada]);
        res.status(201).json({ message: "Usuario registrado exitosamente", user: rows[0] });
    } catch (error) {
        res.status(500).json({ message: "Error al registrar el usuario. El usuario puede que ya exista." });
    }
});
app.post('/api/login', async (req, res) => {
    try {
        const { usuario, contrasena } = req.body;
        if (!usuario || !contrasena) return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
        const { rows } = await pool.query('SELECT * FROM users WHERE usuario = $1', [usuario]);
        if (rows.length === 0) return res.status(400).json({ message: "Credenciales inválidas." });
        const user = rows[0];
        const esValida = await bcrypt.compare(contrasena, user.contrasena);
        if (!esValida) return res.status(400).json({ message: "Credenciales inválidas." });
        const token = jwt.sign({ id: user.id_user, usuario: user.usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 3600000 });
        res.json({ message: "Inicio de sesión exitoso", usuario: user.usuario });
    } catch (error) {
        res.status(500).json({ message: "Error en el servidor durante el inicio de sesión." });
    }
});
app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Sesión cerrada exitosamente" });
});

// 9. RUTAS DE CLIENTES (PROTEGIDAS)
app.get('/api/clientes', authenticateToken, async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id_cliente DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor api/clientes' });
    }
});
app.get('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { rows } = await pool.query('SELECT * FROM clientes WHERE id_cliente = $1', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor' });
    }
});
app.post('/api/clientes', authenticateToken, uploadConstancia.single('constancia'), async (req, res) => {
    try {
        const { nombre, rfc, email, codigo_postal, regimen_fiscal, fecha } = req.body;
        const constanciaPath = req.file.path;
        const values = [nombre, rfc, email, codigo_postal, regimen_fiscal, constanciaPath, fecha];
        const { rows } = await pool.query('INSERT INTO clientes (nombre, rfc, email, codigo_postal, regimen_fiscal, constancia, fecha) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', values);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el cliente' });
    }
});
app.put('/api/clientes/:id', authenticateToken, uploadConstancia.single('constancia'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, rfc, email, codigo_postal, regimen_fiscal, fecha } = req.body;
        const findResult = await pool.query('SELECT constancia FROM clientes WHERE id_cliente = $1', [id]);
        if (findResult.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        let oldFilePath = findResult.rows[0].constancia;
        let newConstanciaPath = oldFilePath;
        if (req.file) {
            newConstanciaPath = req.file.path;
            if (oldFilePath) {
                const oldDirectoryPath = path.dirname(oldFilePath);
                if (fs.existsSync(oldDirectoryPath)) fs.rmSync(oldDirectoryPath, { recursive: true, force: true });
            }
        }
        const values = [nombre, rfc, email, codigo_postal, regimen_fiscal, newConstanciaPath, fecha, id];
        const { rows } = await pool.query(`UPDATE clientes SET nombre = $1, rfc = $2, email = $3, codigo_postal = $4, regimen_fiscal = $5, constancia = $6, fecha = $7 WHERE id_cliente = $8 RETURNING *`, values);
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el cliente' });
    }
});
app.delete('/api/clientes/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const findResult = await pool.query('SELECT constancia FROM clientes WHERE id_cliente = $1', [id]);
        if (findResult.rows.length === 0) return res.status(404).json({ message: 'Cliente no encontrado' });
        const filePath = findResult.rows[0].constancia;
        await pool.query('DELETE FROM clientes WHERE id_cliente = $1', [id]);
        if (filePath) {
            const directoryPath = path.dirname(filePath);
            if (fs.existsSync(directoryPath)) fs.rmSync(directoryPath, { recursive: true, force: true });
        }
        res.status(200).json({ message: 'Cliente y archivos eliminados exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el cliente' });
    }
});

// 10. RUTAS DE FACTURAS (PROTEGIDAS)
app.get('/api/clientes/:id/facturas', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { search = '', page = 1, limit = 5 } = req.query;
        const offset = (page - 1) * limit;
        const totalResult = await pool.query(`SELECT COUNT(*) FROM facturas WHERE id_cliente = $1 AND (descripcion ILIKE $2 OR total::text ILIKE $2)`, [id, `%${search}%`]);
        const totalFacturas = parseInt(totalResult.rows[0].count, 10);
        const { rows } = await pool.query(`SELECT * FROM facturas WHERE id_cliente = $1 AND (descripcion ILIKE $2 OR total::text ILIKE $2) ORDER BY fecha DESC LIMIT $3 OFFSET $4`, [id, `%${search}%`, limit, offset]);
        res.json({
            facturas: rows,
            totalPages: Math.ceil(totalFacturas / limit),
            currentPage: parseInt(page, 10),
        });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor al obtener facturas' });
    }
});
app.post('/api/facturas', authenticateToken, uploadFactura.single('factura_pdf'), async (req, res) => {
    try {
        const { id_cliente, fecha, descripcion, total } = req.body;
        const facturaPath = req.file.path;
        const values = [id_cliente, facturaPath, fecha, descripcion, total];
        const { rows } = await pool.query('INSERT INTO facturas (id_cliente, factura, fecha, descripcion, total) VALUES ($1, $2, $3, $4, $5) RETURNING *', values);
        res.status(201).json(rows[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al subir la factura' });
    }
});
app.delete('/api/facturas/:id_factura', authenticateToken, async (req, res) => {
    try {
        const { id_factura } = req.params;
        const findResult = await pool.query('SELECT factura FROM facturas WHERE id_factura = $1', [id_factura]);
        if (findResult.rows.length === 0) return res.status(404).json({ message: 'Factura no encontrada' });
        const filePath = findResult.rows[0].factura;
        await pool.query('DELETE FROM facturas WHERE id_factura = $1', [id_factura]);
        if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
        res.status(200).json({ message: 'Factura eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar la factura' });
    }
});
app.post('/api/facturas/:id_factura/enviar', authenticateToken, async (req, res) => {
    try {
        const { id_factura } = req.params;
        const result = await pool.query(`SELECT f.factura, c.nombre AS cliente_nombre, c.email AS cliente_email FROM facturas f JOIN clientes c ON f.id_cliente = c.id_cliente WHERE f.id_factura = $1`, [id_factura]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Factura o cliente no encontrado' });
        const { factura: facturaPath, cliente_nombre, cliente_email } = result.rows[0];
        if (!cliente_email) return res.status(400).json({ message: 'El cliente no tiene un correo electrónico registrado.' });
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: cliente_email,
            subject: `Factura para ${cliente_nombre}`,
            text: `Hola ${cliente_nombre},\n\nAdjuntamos tu factura.\n\nGracias,\nTu Empresa.`,
            attachments: [{ filename: `factura_${id_factura}.pdf`, path: path.join(__dirname, facturaPath) }]
        };
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: `Factura enviada exitosamente a ${cliente_email}` });
    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor al enviar el correo' });
    }
});

// 11. INICIAR EL SERVIDOR
app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
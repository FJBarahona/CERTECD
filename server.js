const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const pool = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// ============================================================
// MIDDLEWARE: Verificar JWT
// ============================================================
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token requerido' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'certecd_secret');
    req.usuario = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};

// ============================================================
// AUTH
// ============================================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Para demo: aceptar admin/admin123
    if (username === 'admin' && password === 'admin123') {
      const token = jwt.sign(
        { id: 1, username: 'admin', rol: 'admin', nombre: 'Administrador' },
        process.env.JWT_SECRET || 'certecd_secret',
        { expiresIn: '8h' }
      );
      return res.json({ token, usuario: { username: 'admin', rol: 'admin', nombre: 'Administrador Sistema' } });
    }
    if (username === 'rrhh' && password === 'rrhh123') {
      const token = jwt.sign(
        { id: 3, username: 'rrhh', rol: 'rrhh', nombre: 'Área RRHH' },
        process.env.JWT_SECRET || 'certecd_secret',
        { expiresIn: '8h' }
      );
      return res.json({ token, usuario: { username: 'rrhh', rol: 'rrhh', nombre: 'Área RRHH' } });
    }
    return res.status(401).json({ error: 'Credenciales incorrectas' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DASHBOARD - KPIs generales
// ============================================================
app.get('/api/dashboard', verificarToken, async (req, res) => {
  try {
    const [
      totalTrabajadores,
      trabajadoresActivos,
      docsVencidos,
      docsPorVencer,
      tareasSinFirma,
      ordenesActivas
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM trabajadores'),
      pool.query("SELECT COUNT(*) FROM trabajadores WHERE estado = 'activo'"),
      pool.query("SELECT COUNT(*) FROM documentos_trabajador WHERE estado = 'vencido'"),
      pool.query("SELECT COUNT(*) FROM documentos_trabajador WHERE estado = 'por_vencer'"),
      pool.query("SELECT COUNT(*) FROM tareos WHERE estado = 'registrado' AND supervisor_firma IS NULL"),
      pool.query("SELECT COUNT(*) FROM ordenes_trabajo WHERE estado = 'activo'"),
    ]);

    // Horas del mes actual
    const horasMes = await pool.query(`
      SELECT COALESCE(SUM(horas_normales + horas_extras), 0) as total
      FROM tareos
      WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
      AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE)
    `);

    // Alertas críticas (vencen en menos de 7 días)
    const alertasCriticas = await pool.query(`
      SELECT t.nombres || ' ' || t.apellidos as trabajador, td.nombre as documento,
             dt.fecha_vencimiento,
             (dt.fecha_vencimiento - CURRENT_DATE) as dias_restantes
      FROM documentos_trabajador dt
      JOIN trabajadores t ON dt.trabajador_id = t.id
      JOIN tipo_documento td ON dt.tipo_documento_id = td.id
      WHERE t.estado = 'activo' AND (dt.fecha_vencimiento - CURRENT_DATE) <= 7
      ORDER BY dias_restantes ASC
      LIMIT 5
    `);

    res.json({
      kpis: {
        total_trabajadores: parseInt(totalTrabajadores.rows[0].count),
        trabajadores_activos: parseInt(trabajadoresActivos.rows[0].count),
        docs_vencidos: parseInt(docsVencidos.rows[0].count),
        docs_por_vencer: parseInt(docsPorVencer.rows[0].count),
        tareos_sin_firma: parseInt(tareasSinFirma.rows[0].count),
        ordenes_activas: parseInt(ordenesActivas.rows[0].count),
        horas_mes: parseFloat(horasMes.rows[0].total),
      },
      alertas_criticas: alertasCriticas.rows
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// TRABAJADORES
// ============================================================
app.get('/api/trabajadores', verificarToken, async (req, res) => {
  try {
    const { estado, search } = req.query;
    let query = `
      SELECT t.*, c.nombre as cargo_nombre, c.area
      FROM trabajadores t
      LEFT JOIN cargos c ON t.cargo_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (estado) { params.push(estado); query += ` AND t.estado = $${params.length}`; }
    if (search) { params.push(`%${search}%`); query += ` AND (t.nombres ILIKE $${params.length} OR t.apellidos ILIKE $${params.length} OR t.dni ILIKE $${params.length})`; }
    query += ' ORDER BY t.apellidos, t.nombres';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/trabajadores/:id', verificarToken, async (req, res) => {
  try {
    const trabajador = await pool.query(`
      SELECT t.*, c.nombre as cargo_nombre, c.area
      FROM trabajadores t
      LEFT JOIN cargos c ON t.cargo_id = c.id
      WHERE t.id = $1
    `, [req.params.id]);
    if (!trabajador.rows[0]) return res.status(404).json({ error: 'No encontrado' });

    const documentos = await pool.query(`
      SELECT dt.*, td.nombre as tipo_nombre, td.es_critico,
             (dt.fecha_vencimiento - CURRENT_DATE) as dias_restantes
      FROM documentos_trabajador dt
      JOIN tipo_documento td ON dt.tipo_documento_id = td.id
      WHERE dt.trabajador_id = $1
      ORDER BY dt.fecha_vencimiento ASC
    `, [req.params.id]);

    const tareos = await pool.query(`
      SELECT ta.*, ot.codigo as ot_codigo, ot.descripcion as ot_descripcion
      FROM tareos ta
      LEFT JOIN ordenes_trabajo ot ON ta.orden_trabajo_id = ot.id
      WHERE ta.trabajador_id = $1
      ORDER BY ta.fecha DESC
      LIMIT 30
    `, [req.params.id]);

    res.json({ ...trabajador.rows[0], documentos: documentos.rows, tareos: tareos.rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/trabajadores', verificarToken, async (req, res) => {
  const { dni, nombres, apellidos, cargo_id, telefono, email, fecha_ingreso } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO trabajadores (dni, nombres, apellidos, cargo_id, telefono, email, fecha_ingreso)
      VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *
    `, [dni, nombres, apellidos, cargo_id, telefono, email, fecha_ingreso]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'DNI ya registrado' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/trabajadores/:id', verificarToken, async (req, res) => {
  const { nombres, apellidos, cargo_id, telefono, email, estado } = req.body;
  try {
    const result = await pool.query(`
      UPDATE trabajadores SET nombres=$1, apellidos=$2, cargo_id=$3,
      telefono=$4, email=$5, estado=$6, updated_at=NOW()
      WHERE id=$7 RETURNING *
    `, [nombres, apellidos, cargo_id, telefono, email, estado, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// DOCUMENTOS / HOMOLOGACIONES
// ============================================================
app.get('/api/homologaciones', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT dt.*, t.nombres || ' ' || t.apellidos as trabajador, t.dni,
             c.nombre as cargo, td.nombre as tipo_documento, td.es_critico,
             (dt.fecha_vencimiento - CURRENT_DATE) as dias_restantes
      FROM documentos_trabajador dt
      JOIN trabajadores t ON dt.trabajador_id = t.id
      JOIN cargos c ON t.cargo_id = c.id
      JOIN tipo_documento td ON dt.tipo_documento_id = td.id
      WHERE t.estado = 'activo'
      ORDER BY dt.fecha_vencimiento ASC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/homologaciones/alertas', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM v_alertas_vencimiento WHERE dias_restantes <= 30 ORDER BY dias_restantes ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/homologaciones', verificarToken, async (req, res) => {
  const { trabajador_id, tipo_documento_id, fecha_emision, fecha_vencimiento, numero_doc, observaciones } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO documentos_trabajador (trabajador_id, tipo_documento_id, fecha_emision, fecha_vencimiento, numero_doc, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (trabajador_id, tipo_documento_id) DO UPDATE
      SET fecha_emision=$3, fecha_vencimiento=$4, numero_doc=$5, observaciones=$6, updated_at=NOW()
      RETURNING *
    `, [trabajador_id, tipo_documento_id, fecha_emision, fecha_vencimiento, numero_doc, observaciones]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// TAREOS
// ============================================================
app.get('/api/tareos', verificarToken, async (req, res) => {
  try {
    const { fecha, orden_trabajo_id } = req.query;
    let query = `
      SELECT ta.*, t.nombres || ' ' || t.apellidos as trabajador_nombre,
             t.dni, c.nombre as cargo, ot.codigo as ot_codigo
      FROM tareos ta
      JOIN trabajadores t ON ta.trabajador_id = t.id
      JOIN cargos c ON t.cargo_id = c.id
      LEFT JOIN ordenes_trabajo ot ON ta.orden_trabajo_id = ot.id
      WHERE 1=1
    `;
    const params = [];
    if (fecha) { params.push(fecha); query += ` AND ta.fecha = $${params.length}`; }
    if (orden_trabajo_id) { params.push(orden_trabajo_id); query += ` AND ta.orden_trabajo_id = $${params.length}`; }
    query += ' ORDER BY ta.fecha DESC, t.apellidos';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tareos', verificarToken, async (req, res) => {
  const { trabajador_id, orden_trabajo_id, fecha, hora_ingreso, hora_salida, horas_normales, horas_extras, tipo_turno, observaciones } = req.body;
  try {
    const result = await pool.query(`
      INSERT INTO tareos (trabajador_id, orden_trabajo_id, fecha, hora_ingreso, hora_salida, horas_normales, horas_extras, tipo_turno, observaciones)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (trabajador_id, fecha, orden_trabajo_id) DO UPDATE
      SET hora_ingreso=$4, hora_salida=$5, horas_normales=$6, horas_extras=$7, tipo_turno=$8, observaciones=$9
      RETURNING *
    `, [trabajador_id, orden_trabajo_id, fecha, hora_ingreso, hora_salida, horas_normales || 8, horas_extras || 0, tipo_turno || 'dia', observaciones]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/tareos/:id/firmar', verificarToken, async (req, res) => {
  const { supervisor_firma } = req.body;
  try {
    const result = await pool.query(`
      UPDATE tareos SET supervisor_firma=$1, estado='confirmado'
      WHERE id=$2 RETURNING *
    `, [supervisor_firma, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// ÓRDENES DE TRABAJO
// ============================================================
app.get('/api/ordenes', verificarToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ot.*, cl.nombre as cliente_nombre, cl.ubicacion,
             COUNT(ta.id) as total_tareos,
             COALESCE(SUM(ta.horas_normales + ta.horas_extras), 0) as horas_ejecutadas
      FROM ordenes_trabajo ot
      LEFT JOIN clientes cl ON ot.cliente_id = cl.id
      LEFT JOIN tareos ta ON ot.id = ta.orden_trabajo_id
      GROUP BY ot.id, cl.nombre, cl.ubicacion
      ORDER BY ot.fecha_inicio DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// REPORTES
// ============================================================
app.get('/api/reportes/valorización', verificarToken, async (req, res) => {
  try {
    const { mes, anio } = req.query;
    const result = await pool.query(`
      SELECT * FROM v_resumen_tareos
      WHERE mes = $1 AND anio = $2
      ORDER BY total_horas DESC
    `, [mes || new Date().getMonth() + 1, anio || new Date().getFullYear()]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/cargos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM cargos ORDER BY area, nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/tipo-documentos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tipo_documento ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================================
// START
// ============================================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 CERTECD SGPM API corriendo en http://localhost:${PORT}`);
  console.log(`📋 Endpoints disponibles:`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/dashboard`);
  console.log(`   GET  /api/trabajadores`);
  console.log(`   GET  /api/homologaciones`);
  console.log(`   GET  /api/tareos`);
  console.log(`   GET  /api/ordenes`);
});

// Ruta simple para probar la conexión a PostgreSQL
app.get('/api/test-bd', async (req, res) => {
  try {
    // Hace una consulta muy básica a la base de datos pidiendo la hora actual
    const resultado = await pool.query('SELECT NOW()'); 
    
    res.json({ 
      estado: 'conectado', 
      mensaje: '¡Conexión a PostgreSQL exitosa! 🚀', 
      hora_servidor_bd: resultado.rows[0].now 
    });
  } catch (error) {
    console.error('Error de conexión:', error);
    res.status(500).json({ 
      estado: 'desconectado', 
      mensaje: 'Fallo al conectar con la base de datos ❌', 
      detalle: error.message 
    });
  }
});
-- ============================================================
-- CERTECD PERÚ S.R.L.
-- Sistema de Gestión de Personal Minero (SGPM)
-- Schema PostgreSQL v1.0
-- ============================================================

-- Extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLA: cargos
-- ============================================================
CREATE TABLE cargos (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(100) NOT NULL,
    area        VARCHAR(100) NOT NULL,
    created_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO cargos (nombre, area) VALUES
    ('Mecánico de Equipos Pesados', 'Operaciones'),
    ('Electricista Industrial', 'Operaciones'),
    ('Operario de Limpieza Industrial', 'Operaciones'),
    ('Soldador Homologado', 'Operaciones'),
    ('Supervisor de Campo', 'Operaciones'),
    ('Ingeniero de Seguridad SST', 'SST'),
    ('Reclutador RRHH', 'Recursos Humanos'),
    ('Técnico Komatsu', 'Operaciones'),
    ('Asistente Administrativo', 'Administración'),
    ('Jefe de Logística', 'Logística');

-- ============================================================
-- TABLA: trabajadores
-- ============================================================
CREATE TABLE trabajadores (
    id              SERIAL PRIMARY KEY,
    uuid            UUID DEFAULT uuid_generate_v4() UNIQUE,
    dni             VARCHAR(8) NOT NULL UNIQUE,
    nombres         VARCHAR(100) NOT NULL,
    apellidos       VARCHAR(100) NOT NULL,
    cargo_id        INTEGER REFERENCES cargos(id),
    telefono        VARCHAR(15),
    email           VARCHAR(150),
    fecha_ingreso   DATE NOT NULL,
    estado          VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
    foto_url        VARCHAR(255),
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: clientes (minas)
-- ============================================================
CREATE TABLE clientes (
    id          SERIAL PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    ruc         VARCHAR(11),
    ubicacion   VARCHAR(200),
    altitud_msnm INTEGER,
    contacto    VARCHAR(100),
    created_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO clientes (nombre, ruc, ubicacion, altitud_msnm, contacto) VALUES
    ('Sociedad Minera Cerro Verde (SMCV)', '20170072465', 'Uchumayo, Arequipa', 2700, 'Ing. Supervisor SMCV'),
    ('Southern Copper Corporation', '20100152356', 'Cuajone, Moquegua', 3500, 'Ing. Supervisor Southern'),
    ('Komatsu Mitsui Maquinarias Perú', '20101362702', 'Arequipa', 2335, 'Jefe de Mantenimiento Komatsu');

-- ============================================================
-- TABLA: proyectos / órdenes de trabajo
-- ============================================================
CREATE TABLE ordenes_trabajo (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(30) NOT NULL UNIQUE,
    cliente_id      INTEGER REFERENCES clientes(id),
    descripcion     TEXT NOT NULL,
    tipo_servicio   VARCHAR(50) CHECK (tipo_servicio IN ('mantenimiento', 'limpieza', 'outsourcing', 'residuos', 'sst')),
    fecha_inicio    DATE NOT NULL,
    fecha_fin       DATE,
    estado          VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'completado', 'cancelado', 'pendiente')),
    horas_estimadas DECIMAL(8,2),
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: documentos_habilitantes
-- Controla EMOs, pases a mina, inducciones, SCTR, etc.
-- ============================================================
CREATE TABLE tipo_documento (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    descripcion     TEXT,
    dias_vigencia   INTEGER NOT NULL, -- días de validez del documento
    es_critico      BOOLEAN DEFAULT true
);

INSERT INTO tipo_documento (nombre, descripcion, dias_vigencia, es_critico) VALUES
    ('Examen Médico Ocupacional (EMO)', 'Examen médico para trabajos a más de 4000 msnm', 365, true),
    ('Pase a Mina SMCV', 'Fotocheck de acceso a Cerro Verde', 365, true),
    ('Pase a Mina Southern', 'Fotocheck de acceso a Southern Copper', 365, true),
    ('Inducción Anexo 4 SMCV', 'Inducción virtual obligatoria SMCV', 365, true),
    ('Inducción Anexo 5 Southern', 'Inducción virtual obligatoria Southern', 365, true),
    ('SCTR Salud', 'Seguro Complementario de Trabajo de Riesgo - Salud', 365, true),
    ('SCTR Pensión', 'Seguro Complementario de Trabajo de Riesgo - Pensión', 365, true),
    ('Antecedentes Penales', 'Certificado de antecedentes penales', 90, false),
    ('Licencia de Conducir', 'Licencia A2 o superior para conductores', 365, false),
    ('Certificado de Altura', 'Certificado de aptitud para trabajos en altura', 180, true);

CREATE TABLE documentos_trabajador (
    id                  SERIAL PRIMARY KEY,
    trabajador_id       INTEGER REFERENCES trabajadores(id) ON DELETE CASCADE,
    tipo_documento_id   INTEGER REFERENCES tipo_documento(id),
    fecha_emision       DATE NOT NULL,
    fecha_vencimiento   DATE NOT NULL,
    numero_doc          VARCHAR(50),
    archivo_url         VARCHAR(255),
    estado              VARCHAR(20) DEFAULT 'vigente' CHECK (estado IN ('vigente', 'por_vencer', 'vencido', 'renovando')),
    observaciones       TEXT,
    created_at          TIMESTAMP DEFAULT NOW(),
    updated_at          TIMESTAMP DEFAULT NOW(),
    UNIQUE(trabajador_id, tipo_documento_id)
);

-- ============================================================
-- TABLA: tareos (asistencia diaria)
-- ============================================================
CREATE TABLE tareos (
    id              SERIAL PRIMARY KEY,
    trabajador_id   INTEGER REFERENCES trabajadores(id),
    orden_trabajo_id INTEGER REFERENCES ordenes_trabajo(id),
    fecha           DATE NOT NULL,
    hora_ingreso    TIME,
    hora_salida     TIME,
    horas_normales  DECIMAL(4,2) DEFAULT 0,
    horas_extras    DECIMAL(4,2) DEFAULT 0,
    tipo_turno      VARCHAR(20) DEFAULT 'dia' CHECK (tipo_turno IN ('dia', 'noche', 'guardia')),
    estado          VARCHAR(20) DEFAULT 'registrado' CHECK (estado IN ('registrado', 'confirmado', 'observado')),
    observaciones   TEXT,
    supervisor_firma VARCHAR(100),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(trabajador_id, fecha, orden_trabajo_id)
);

-- ============================================================
-- TABLA: valorizaciones (facturación mensual)
-- ============================================================
CREATE TABLE valorizaciones (
    id              SERIAL PRIMARY KEY,
    codigo          VARCHAR(30) NOT NULL UNIQUE,
    orden_trabajo_id INTEGER REFERENCES ordenes_trabajo(id),
    periodo_mes     INTEGER CHECK (periodo_mes BETWEEN 1 AND 12),
    periodo_anio    INTEGER,
    total_horas_hombre DECIMAL(10,2) DEFAULT 0,
    total_horas_extras DECIMAL(10,2) DEFAULT 0,
    monto_bruto     DECIMAL(12,2) DEFAULT 0,
    estado          VARCHAR(20) DEFAULT 'borrador' CHECK (estado IN ('borrador', 'enviado', 'aprobado', 'facturado', 'pagado')),
    fecha_emision   DATE,
    fecha_pago      DATE,
    conformidad_firmada BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: cuadrillas
-- ============================================================
CREATE TABLE cuadrillas (
    id              SERIAL PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    orden_trabajo_id INTEGER REFERENCES ordenes_trabajo(id),
    supervisor_id   INTEGER REFERENCES trabajadores(id),
    created_at      TIMESTAMP DEFAULT NOW()
);

CREATE TABLE cuadrilla_trabajadores (
    cuadrilla_id    INTEGER REFERENCES cuadrillas(id),
    trabajador_id   INTEGER REFERENCES trabajadores(id),
    fecha_asignacion DATE DEFAULT CURRENT_DATE,
    PRIMARY KEY (cuadrilla_id, trabajador_id)
);

-- ============================================================
-- TABLA: alertas del sistema
-- ============================================================
CREATE TABLE alertas (
    id              SERIAL PRIMARY KEY,
    tipo            VARCHAR(50) NOT NULL,
    trabajador_id   INTEGER REFERENCES trabajadores(id),
    documento_id    INTEGER REFERENCES documentos_trabajador(id),
    mensaje         TEXT NOT NULL,
    nivel           VARCHAR(20) DEFAULT 'warning' CHECK (nivel IN ('info', 'warning', 'critical')),
    leida           BOOLEAN DEFAULT false,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================================
-- TABLA: usuarios del sistema
-- ============================================================
CREATE TABLE usuarios (
    id          SERIAL PRIMARY KEY,
    username    VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150),
    rol         VARCHAR(30) DEFAULT 'operador' CHECK (rol IN ('admin', 'supervisor', 'operador', 'rrhh')),
    email       VARCHAR(150),
    activo      BOOLEAN DEFAULT true,
    ultimo_login TIMESTAMP,
    created_at  TIMESTAMP DEFAULT NOW()
);

INSERT INTO usuarios (username, password_hash, nombre_completo, rol, email) VALUES
    ('admin', '$2b$10$rOzJqZqZqZqZqZqZqZqZqO', 'Administrador Sistema', 'admin', 'admin@certecd.pe'),
    ('dayna.rojas', '$2b$10$rOzJqZqZqZqZqZqZqZqZqO', 'Dayna Regina Rojas Chavez', 'admin', 'drojas@certecd.pe'),
    ('rrhh', '$2b$10$rOzJqZqZqZqZqZqZqZqZqO', 'Área RRHH', 'rrhh', 'rrhh@certecd.pe'),
    ('supervisor1', '$2b$10$rOzJqZqZqZqZqZqZqZqZqO', 'Supervisor Campo', 'supervisor', 'supervisor@certecd.pe');

-- ============================================================
-- VISTAS ÚTILES
-- ============================================================

-- Vista: documentos por vencer en los próximos 30 días
CREATE OR REPLACE VIEW v_alertas_vencimiento AS
SELECT
    t.id AS trabajador_id,
    t.dni,
    t.nombres || ' ' || t.apellidos AS trabajador,
    c.nombre AS cargo,
    td.nombre AS tipo_documento,
    dt.fecha_vencimiento,
    (dt.fecha_vencimiento - CURRENT_DATE) AS dias_restantes,
    CASE
        WHEN (dt.fecha_vencimiento - CURRENT_DATE) < 0 THEN 'VENCIDO'
        WHEN (dt.fecha_vencimiento - CURRENT_DATE) <= 7 THEN 'CRITICO'
        WHEN (dt.fecha_vencimiento - CURRENT_DATE) <= 30 THEN 'POR VENCER'
        ELSE 'VIGENTE'
    END AS estado_alerta
FROM documentos_trabajador dt
JOIN trabajadores t ON dt.trabajador_id = t.id
JOIN tipo_documento td ON dt.tipo_documento_id = td.id
JOIN cargos c ON t.cargo_id = c.id
WHERE t.estado = 'activo'
ORDER BY dias_restantes ASC;

-- Vista: resumen de horas por trabajador y mes
CREATE OR REPLACE VIEW v_resumen_tareos AS
SELECT
    t.id AS trabajador_id,
    t.nombres || ' ' || t.apellidos AS trabajador,
    c.nombre AS cargo,
    EXTRACT(MONTH FROM ta.fecha) AS mes,
    EXTRACT(YEAR FROM ta.fecha) AS anio,
    COUNT(ta.id) AS dias_trabajados,
    SUM(ta.horas_normales) AS total_horas_normales,
    SUM(ta.horas_extras) AS total_horas_extras,
    SUM(ta.horas_normales + ta.horas_extras) AS total_horas
FROM tareos ta
JOIN trabajadores t ON ta.trabajador_id = t.id
JOIN cargos c ON t.cargo_id = c.id
GROUP BY t.id, t.nombres, t.apellidos, c.nombre, mes, anio;

-- ============================================================
-- DATOS DE PRUEBA - TRABAJADORES
-- ============================================================
INSERT INTO trabajadores (dni, nombres, apellidos, cargo_id, telefono, email, fecha_ingreso, estado) VALUES
    ('40123456', 'Carlos Alberto', 'Quispe Mamani', 1, '959123456', 'cquispe@certecd.pe', '2022-03-15', 'activo'),
    ('42345678', 'José Luis', 'Flores Condori', 1, '958234567', 'jflores@certecd.pe', '2021-08-01', 'activo'),
    ('44567890', 'María Elena', 'Huanca Torres', 6, '957345678', 'mhuanca@certecd.pe', '2023-01-10', 'activo'),
    ('46789012', 'Roberto', 'Cáceres Vilca', 2, '956456789', 'rcaceres@certecd.pe', '2022-06-20', 'activo'),
    ('48901234', 'Ana Lucía', 'Mamani Quispe', 7, '955567890', 'amamani@certecd.pe', '2023-05-05', 'activo'),
    ('41234567', 'Diego Fernando', 'Zapata Cruz', 5, '954678901', 'dzapata@certecd.pe', '2021-11-15', 'activo'),
    ('43456789', 'Luis Miguel', 'Apaza Ramos', 8, '953789012', 'lapaza@certecd.pe', '2022-09-01', 'activo'),
    ('45678901', 'Carmen Rosa', 'Vargas Ccoa', 3, '952890123', 'cvargas@certecd.pe', '2023-02-14', 'activo'),
    ('47890123', 'Miguel Ángel', 'Soto Paredes', 4, '951901234', 'msoto@certecd.pe', '2021-07-22', 'activo'),
    ('49012345', 'Patricia', 'Lazo Huanca', 9, '950012345', 'plazo@certecd.pe', '2022-12-01', 'activo');

-- ============================================================
-- DATOS DE PRUEBA - ÓRDENES DE TRABAJO
-- ============================================================
INSERT INTO ordenes_trabajo (codigo, cliente_id, descripcion, tipo_servicio, fecha_inicio, fecha_fin, estado, horas_estimadas) VALUES
    ('OT-2026-001', 1, 'Mantenimiento preventivo de flota Komatsu - Planta Concentradora Cerro Verde', 'mantenimiento', '2026-01-06', '2026-01-20', 'completado', 480),
    ('OT-2026-002', 2, 'Limpieza industrial de fajas transportadoras - Parada de planta Southern Q1', 'limpieza', '2026-02-03', '2026-02-10', 'completado', 320),
    ('OT-2026-003', 1, 'Outsourcing cuadrilla técnica - Operación continua Cerro Verde', 'outsourcing', '2026-03-01', NULL, 'activo', 2400),
    ('OT-2026-004', 3, 'Mantenimiento correctivo equipos Komatsu - Sede Arequipa', 'mantenimiento', '2026-04-15', NULL, 'activo', 160),
    ('OT-2026-005', 2, 'Gestión de residuos sólidos - Campamento Southern Cuajone', 'residuos', '2026-05-01', NULL, 'activo', 960);

-- ============================================================
-- DATOS DE PRUEBA - DOCUMENTOS
-- ============================================================
INSERT INTO documentos_trabajador (trabajador_id, tipo_documento_id, fecha_emision, fecha_vencimiento, numero_doc, estado) VALUES
    -- Carlos Quispe
    (1, 1, '2025-05-15', '2026-05-15', 'EMO-2025-001', 'vigente'),
    (1, 2, '2025-06-01', '2026-06-01', 'PSMCV-001', 'vigente'),
    (1, 6, '2026-01-01', '2026-12-31', 'SCTR-S-001', 'vigente'),
    -- José Flores
    (2, 1, '2025-04-20', '2026-04-20', 'EMO-2025-002', 'vigente'),
    (2, 2, '2025-05-10', '2026-05-10', 'PSMCV-002', 'por_vencer'),
    (2, 3, '2025-03-01', '2026-03-01', 'PSOUTH-001', 'vencido'),
    -- María Huanca
    (3, 1, '2026-01-10', '2027-01-10', 'EMO-2026-001', 'vigente'),
    (3, 6, '2026-01-01', '2026-12-31', 'SCTR-S-003', 'vigente'),
    -- Roberto Cáceres
    (4, 1, '2025-12-01', '2026-12-01', 'EMO-2025-004', 'vigente'),
    (4, 2, '2026-05-01', '2026-05-28', 'PSMCV-004', 'por_vencer'),
    -- Diego Zapata (supervisor)
    (6, 1, '2026-02-15', '2027-02-15', 'EMO-2026-002', 'vigente'),
    (6, 2, '2026-02-20', '2027-02-20', 'PSMCV-006', 'vigente'),
    (6, 3, '2026-02-20', '2027-02-20', 'PSOUTH-006', 'vigente'),
    (6, 4, '2026-01-15', '2027-01-15', 'INDSMCV-006', 'vigente'),
    (6, 5, '2026-01-15', '2027-01-15', 'INDSOUTH-006', 'vigente');

-- ============================================================
-- DATOS DE PRUEBA - TAREOS (Mayo 2026)
-- ============================================================
INSERT INTO tareos (trabajador_id, orden_trabajo_id, fecha, hora_ingreso, hora_salida, horas_normales, horas_extras, tipo_turno, estado, supervisor_firma) VALUES
    (1, 3, '2026-05-01', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (2, 3, '2026-05-01', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (4, 3, '2026-05-01', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (7, 3, '2026-05-01', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (1, 3, '2026-05-02', '07:00', '15:00', 8.00, 0.00, 'dia', 'confirmado', 'Diego Zapata'),
    (2, 3, '2026-05-02', '07:00', '15:00', 8.00, 0.00, 'dia', 'confirmado', 'Diego Zapata'),
    (4, 3, '2026-05-02', '07:00', '15:00', 8.00, 0.00, 'dia', 'confirmado', 'Diego Zapata'),
    (1, 3, '2026-05-05', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (2, 3, '2026-05-05', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (7, 3, '2026-05-05', '07:00', '19:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (8, 5, '2026-05-05', '06:00', '18:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (9, 5, '2026-05-05', '06:00', '18:00', 8.00, 4.00, 'dia', 'confirmado', 'Diego Zapata'),
    (1, 3, '2026-05-06', '07:00', '15:00', 8.00, 0.00, 'dia', 'registrado', 'Diego Zapata'),
    (2, 3, '2026-05-06', '07:00', '15:00', 8.00, 0.00, 'dia', 'registrado', 'Diego Zapata'),
    (4, 3, '2026-05-07', '07:00', '19:00', 8.00, 4.00, 'dia', 'registrado', NULL),
    (7, 3, '2026-05-07', '07:00', '19:00', 8.00, 4.00, 'dia', 'registrado', NULL);

-- ============================================================
-- FUNCIÓN: actualizar estado de documentos automáticamente
-- ============================================================
CREATE OR REPLACE FUNCTION actualizar_estado_documentos()
RETURNS void AS $$
BEGIN
    UPDATE documentos_trabajador
    SET estado = CASE
        WHEN fecha_vencimiento < CURRENT_DATE THEN 'vencido'
        WHEN fecha_vencimiento <= CURRENT_DATE + INTERVAL '30 days' THEN 'por_vencer'
        ELSE 'vigente'
    END
    WHERE estado != 'renovando';
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX idx_trabajadores_dni ON trabajadores(dni);
CREATE INDEX idx_trabajadores_estado ON trabajadores(estado);
CREATE INDEX idx_documentos_trabajador ON documentos_trabajador(trabajador_id);
CREATE INDEX idx_documentos_vencimiento ON documentos_trabajador(fecha_vencimiento);
CREATE INDEX idx_tareos_fecha ON tareos(fecha);
CREATE INDEX idx_tareos_trabajador ON tareos(trabajador_id);
CREATE INDEX idx_alertas_leida ON alertas(leida);

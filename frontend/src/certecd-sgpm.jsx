import { useState, useEffect, useCallback, useRef } from "react";

// ============================================================
// CONFIG
// ============================================================
const API = "http://localhost:3001/api";
let JWT = null;

// ============================================================
// MOCK DATA
// ============================================================
const MOCK = {
  trabajadores: [
    { id:1, dni:"40123456", nombres:"Carlos Alberto", apellidos:"Quispe Mamani", cargo_nombre:"Mecánico de Equipos Pesados", area:"Operaciones", estado:"activo", fecha_ingreso:"2022-03-15", telefono:"959123456", email:"cquispe@certecd.pe", regimen:"14x7" },
    { id:2, dni:"42345678", nombres:"José Luis", apellidos:"Flores Condori", cargo_nombre:"Mecánico de Equipos Pesados", area:"Operaciones", estado:"activo", fecha_ingreso:"2021-08-01", telefono:"958234567", email:"jflores@certecd.pe", regimen:"14x7" },
    { id:3, dni:"44567890", nombres:"María Elena", apellidos:"Huanca Torres", cargo_nombre:"Ingeniero de Seguridad SST", area:"SST", estado:"activo", fecha_ingreso:"2023-01-10", telefono:"957345678", email:"mhuanca@certecd.pe", regimen:"Mensual" },
    { id:4, dni:"46789012", nombres:"Roberto", apellidos:"Cáceres Vilca", cargo_nombre:"Electricista Industrial", area:"Operaciones", estado:"activo", fecha_ingreso:"2022-06-20", telefono:"956456789", email:"rcaceres@certecd.pe", regimen:"14x7" },
    { id:5, dni:"48901234", nombres:"Ana Lucía", apellidos:"Mamani Quispe", cargo_nombre:"Reclutador RRHH", area:"Recursos Humanos", estado:"activo", fecha_ingreso:"2023-05-05", telefono:"955567890", email:"amamani@certecd.pe", regimen:"Mensual" },
    { id:6, dni:"41234567", nombres:"Diego Fernando", apellidos:"Zapata Cruz", cargo_nombre:"Supervisor de Campo", area:"Operaciones", estado:"activo", fecha_ingreso:"2021-11-15", telefono:"954678901", email:"dzapata@certecd.pe", regimen:"14x7" },
    { id:7, dni:"43456789", nombres:"Luis Miguel", apellidos:"Apaza Ramos", cargo_nombre:"Técnico Komatsu", area:"Operaciones", estado:"activo", fecha_ingreso:"2022-09-01", telefono:"953789012", email:"lapaza@certecd.pe", regimen:"14x7" },
    { id:8, dni:"45678901", nombres:"Carmen Rosa", apellidos:"Vargas Ccoa", cargo_nombre:"Operario de Limpieza", area:"Operaciones", estado:"activo", fecha_ingreso:"2023-02-14", telefono:"952890123", email:"cvargas@certecd.pe", regimen:"14x7" },
    { id:9, dni:"47890123", nombres:"Miguel Ángel", apellidos:"Soto Paredes", cargo_nombre:"Soldador Homologado", area:"Operaciones", estado:"activo", fecha_ingreso:"2021-07-22", telefono:"951901234", email:"msoto@certecd.pe", regimen:"14x7" },
    { id:10, dni:"49012345", nombres:"Patricia", apellidos:"Lazo Huanca", cargo_nombre:"Asistente Administrativo", area:"Administración", estado:"inactivo", fecha_ingreso:"2022-12-01", telefono:"950012345", email:"plazo@certecd.pe", regimen:"Mensual" },
  ],
  homologaciones: [
    { id:1, trabajador_id:2, trabajador:"José Luis Flores Condori", dni:"42345678", cargo:"Mecánico", tipo_documento:"Pase a Mina Southern", fecha_vencimiento:"2026-03-01", dias_restantes:-77, es_critico:true },
    { id:2, trabajador_id:2, trabajador:"José Luis Flores Condori", dni:"42345678", cargo:"Mecánico", tipo_documento:"Pase a Mina SMCV", fecha_vencimiento:"2026-05-10", dias_restantes:-7, es_critico:true },
    { id:3, trabajador_id:4, trabajador:"Roberto Cáceres Vilca", dni:"46789012", cargo:"Electricista", tipo_documento:"Pase a Mina SMCV", fecha_vencimiento:"2026-05-28", dias_restantes:11, es_critico:true },
    { id:4, trabajador_id:2, trabajador:"José Luis Flores Condori", dni:"42345678", cargo:"Mecánico", tipo_documento:"Examen Médico Ocupacional (EMO)", fecha_vencimiento:"2026-04-20", dias_restantes:-27, es_critico:true },
    { id:5, trabajador_id:1, trabajador:"Carlos Alberto Quispe Mamani", dni:"40123456", cargo:"Mecánico", tipo_documento:"Examen Médico Ocupacional (EMO)", fecha_vencimiento:"2026-05-20", dias_restantes:3, es_critico:true },
    { id:6, trabajador_id:6, trabajador:"Diego Fernando Zapata Cruz", dni:"41234567", cargo:"Supervisor", tipo_documento:"Pase a Mina SMCV", fecha_vencimiento:"2027-02-20", dias_restantes:279, es_critico:true },
    { id:7, trabajador_id:3, trabajador:"María Elena Huanca Torres", dni:"44567890", cargo:"Ing. SST", tipo_documento:"Examen Médico Ocupacional (EMO)", fecha_vencimiento:"2027-01-10", dias_restantes:238, es_critico:true },
    { id:8, trabajador_id:7, trabajador:"Luis Miguel Apaza Ramos", dni:"43456789", cargo:"Técnico Komatsu", tipo_documento:"Examen Médico Ocupacional (EMO)", fecha_vencimiento:"2026-07-15", dias_restantes:59, es_critico:true },
    { id:9, trabajador_id:9, trabajador:"Miguel Ángel Soto Paredes", dni:"47890123", cargo:"Soldador", tipo_documento:"Pase a Mina Southern", fecha_vencimiento:"2026-06-01", dias_restantes:15, es_critico:true },
    { id:10, trabajador_id:1, trabajador:"Carlos Alberto Quispe Mamani", dni:"40123456", cargo:"Mecánico", tipo_documento:"SCTR Salud", fecha_vencimiento:"2026-12-31", dias_restantes:228, es_critico:false },
    { id:11, trabajador_id:6, trabajador:"Diego Fernando Zapata Cruz", dni:"41234567", cargo:"Supervisor", tipo_documento:"Inducción Anexo 4 SMCV", fecha_vencimiento:"2027-01-15", dias_restantes:243, es_critico:true },
    { id:12, trabajador_id:3, trabajador:"María Elena Huanca Torres", dni:"44567890", cargo:"Ing. SST", tipo_documento:"SCTR Salud", fecha_vencimiento:"2026-12-31", dias_restantes:228, es_critico:false },
  ],
  tareos: [
    { id:1, trabajador_nombre:"Carlos Alberto Quispe Mamani", dni:"40123456", cargo:"Mecánico", fecha:"2026-05-07", hora_ingreso:"07:00", hora_salida:"19:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"registrado", supervisor_firma:null, ot_codigo:"OT-2026-003" },
    { id:2, trabajador_nombre:"Luis Miguel Apaza Ramos", dni:"43456789", cargo:"Técnico Komatsu", fecha:"2026-05-07", hora_ingreso:"07:00", hora_salida:"19:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"registrado", supervisor_firma:null, ot_codigo:"OT-2026-003" },
    { id:3, trabajador_nombre:"Carlos Alberto Quispe Mamani", dni:"40123456", cargo:"Mecánico", fecha:"2026-05-06", hora_ingreso:"07:00", hora_salida:"15:00", horas_normales:8, horas_extras:0, tipo_turno:"dia", estado:"registrado", supervisor_firma:null, ot_codigo:"OT-2026-003" },
    { id:4, trabajador_nombre:"José Luis Flores Condori", dni:"42345678", cargo:"Mecánico", fecha:"2026-05-06", hora_ingreso:"07:00", hora_salida:"15:00", horas_normales:8, horas_extras:0, tipo_turno:"dia", estado:"registrado", supervisor_firma:null, ot_codigo:"OT-2026-003" },
    { id:5, trabajador_nombre:"Diego Fernando Zapata Cruz", dni:"41234567", cargo:"Supervisor", fecha:"2026-05-05", hora_ingreso:"07:00", hora_salida:"19:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"confirmado", supervisor_firma:"Diego F. Zapata", ot_codigo:"OT-2026-003" },
    { id:6, trabajador_nombre:"Carmen Rosa Vargas Ccoa", dni:"45678901", cargo:"Operario", fecha:"2026-05-05", hora_ingreso:"06:00", hora_salida:"18:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"confirmado", supervisor_firma:"Diego F. Zapata", ot_codigo:"OT-2026-005" },
    { id:7, trabajador_nombre:"Roberto Cáceres Vilca", dni:"46789012", cargo:"Electricista", fecha:"2026-05-04", hora_ingreso:"07:00", hora_salida:"19:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"confirmado", supervisor_firma:"Diego F. Zapata", ot_codigo:"OT-2026-003" },
    { id:8, trabajador_nombre:"Miguel Ángel Soto Paredes", dni:"47890123", cargo:"Soldador", fecha:"2026-05-04", hora_ingreso:"07:00", hora_salida:"19:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"confirmado", supervisor_firma:"Diego F. Zapata", ot_codigo:"OT-2026-004" },
    { id:9, trabajador_nombre:"Carlos Alberto Quispe Mamani", dni:"40123456", cargo:"Mecánico", fecha:"2026-05-03", hora_ingreso:"07:00", hora_salida:"19:00", horas_normales:8, horas_extras:4, tipo_turno:"dia", estado:"confirmado", supervisor_firma:"Diego F. Zapata", ot_codigo:"OT-2026-003" },
    { id:10, trabajador_nombre:"Luis Miguel Apaza Ramos", dni:"43456789", cargo:"Técnico Komatsu", fecha:"2026-05-02", hora_ingreso:"07:00", hora_salida:"15:00", horas_normales:8, horas_extras:0, tipo_turno:"dia", estado:"confirmado", supervisor_firma:"Diego F. Zapata", ot_codigo:"OT-2026-004" },
  ],
  ordenes: [
    { id:1, codigo:"OT-2026-001", cliente_nombre:"Sociedad Minera Cerro Verde (SMCV)", descripcion:"Mantenimiento preventivo flota Komatsu - Planta Concentradora", tipo_servicio:"mantenimiento", fecha_inicio:"2026-01-06", fecha_fin:"2026-01-20", estado:"completado", horas_estimadas:480, horas_ejecutadas:476 },
    { id:2, codigo:"OT-2026-002", cliente_nombre:"Southern Copper Corporation", descripcion:"Limpieza industrial de fajas - Parada de planta Q1", tipo_servicio:"limpieza", fecha_inicio:"2026-02-03", fecha_fin:"2026-02-10", estado:"completado", horas_estimadas:320, horas_ejecutadas:318 },
    { id:3, codigo:"OT-2026-003", cliente_nombre:"Sociedad Minera Cerro Verde (SMCV)", descripcion:"Outsourcing cuadrilla técnica - Operación continua Cerro Verde", tipo_servicio:"outsourcing", fecha_inicio:"2026-03-01", fecha_fin:null, estado:"activo", horas_estimadas:2400, horas_ejecutadas:1240 },
    { id:4, codigo:"OT-2026-004", cliente_nombre:"Komatsu Mitsui Maquinarias Perú", descripcion:"Mantenimiento correctivo equipos Komatsu - Sede Arequipa", tipo_servicio:"mantenimiento", fecha_inicio:"2026-04-15", fecha_fin:null, estado:"activo", horas_estimadas:160, horas_ejecutadas:88 },
    { id:5, codigo:"OT-2026-005", cliente_nombre:"Southern Copper Corporation", descripcion:"Gestión de residuos sólidos - Campamento Southern Cuajone", tipo_servicio:"residuos", fecha_inicio:"2026-05-01", fecha_fin:null, estado:"activo", horas_estimadas:960, horas_ejecutadas:112 },
  ],
};

// ============================================================
// PLANILLAS PERUANAS (Ley 29783 + Régimen Minero)
// ============================================================
const RMV = 1025;
const calcPlanilla = (trabajador, tareos) => {
  const ts = tareos.filter(t => t.dni === trabajador.dni && t.estado === "confirmado");
  const diasTrab = ts.length;
  const hn = ts.reduce((s,t) => s + (+t.horas_normales||0), 0);
  const he = ts.reduce((s,t) => s + (+t.horas_extras||0), 0);
  const valHora = RMV / 30 / 8;
  const he1 = Math.min(he, 2), he2 = Math.max(0, he - 2);
  const heValor = he1 * valHora * 1.25 + he2 * valHora * 1.35;
  const sueldoBruto = (hn * valHora) + heValor;
  const totalBruto = sueldoBruto;
  const afp = totalBruto * 0.1;
  const impRenta5ta = totalBruto > 1750 ? (totalBruto - 1750) * 0.08 : 0;
  const totalDescuentos = afp + impRenta5ta;
  const netoPagable = totalBruto - totalDescuentos;
  const essaludEmp = totalBruto * 0.09;
  const sctr = totalBruto * 0.0196;
  const totalAportesEmp = essaludEmp + sctr;
  const cts = (totalBruto / 12) * (diasTrab / 30);
  const gratificacion = (totalBruto / 6) * (diasTrab / 30);
  const vacaciones = (totalBruto / 12) * (diasTrab / 30);
  const r2 = (n) => Math.round(n * 100) / 100;
  return {
    diasTrab, hn, he,
    sueldoBruto: r2(sueldoBruto), heValor: r2(heValor),
    totalBruto: r2(totalBruto), afp: r2(afp), impRenta5ta: r2(impRenta5ta),
    totalDescuentos: r2(totalDescuentos), netoPagable: r2(netoPagable),
    essaludEmp: r2(essaludEmp), sctr: r2(sctr), totalAportesEmp: r2(totalAportesEmp),
    cts: r2(cts), gratificacion: r2(gratificacion), vacaciones: r2(vacaciones),
  };
};

// ============================================================
// HELPERS
// ============================================================
const inits = (n="") => n.trim().split(" ").filter(Boolean).slice(0,2).map(w=>w[0]).join("").toUpperCase()||"??";
const fmtDate = (d) => !d?"—":new Date(d+"T12:00:00").toLocaleDateString("es-PE",{day:"2-digit",month:"short",year:"numeric"});
const fmtShort = (d) => !d?"—":new Date(d+"T12:00:00").toLocaleDateString("es-PE",{day:"2-digit",month:"2-digit",year:"2-digit"});
const fmtDateTime = (d) => d.toLocaleString("es-PE",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
const S = (n) => `S/ ${(+n||0).toLocaleString("es-PE",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const diasR = (fv) => !fv?0:Math.ceil((new Date(fv+"T12:00:00")-new Date())/86400000);
const diasLbl = (d) => d===null||d===undefined?"—":d<0?`Venc. ${Math.abs(d)}d`:d===0?"Hoy":`${d}d`;
const docCls = (d) => d<0?"vencido":d<=30?"por_vencer":"vigente";
const pct = (e,t) => Math.min(100,Math.round(((+e||0)/(+t||1))*100));
const aTag = (a="") => ({Operaciones:"op",SST:"ss","Recursos Humanos":"rh",Administración:"ad",Logística:"lo"}[a]||"op");

function exportCSV(filename, rows, columns) {
  const header = columns.map(c=>`"${c.label}"`).join(";");
  const body = rows.map(r => columns.map(c => {
    let v = typeof c.get === "function" ? c.get(r) : r[c.key];
    if (v === null || v === undefined) v = "";
    return `"${String(v).replace(/"/g,'""')}"`;
  }).join(";")).join("\n");
  const csv = "\uFEFF" + header + "\n" + body;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}

function exportPDF(title, htmlContent) {
  const win = window.open("", "_blank", "width=900,height=700");
  if (!win) { alert("Habilita las ventanas emergentes para exportar PDF"); return; }
  win.document.write(`
    <!DOCTYPE html><html><head><meta charset="utf-8"/>
    <title>${title}</title>
    <style>
      *{box-sizing:border-box;font-family:'Segoe UI',Arial,sans-serif;}
      body{padding:36px;color:#1a1a1a;}
      h1{font-size:18px;margin-bottom:2px;}
      h2{font-size:12px;color:#666;font-weight:500;margin-bottom:18px;margin-top:24px;}
      table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:11px;}
      th{background:#f3f0ff;color:#4c1d95;text-align:left;padding:7px 10px;border:1px solid #ddd;font-size:10px;text-transform:uppercase;letter-spacing:.4px;}
      td{padding:6px 10px;border:1px solid #ddd;}
      .hd{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #875bf7;padding-bottom:14px;margin-bottom:20px;}
      .brand{font-size:20px;font-weight:800;color:#7348e8;}
      .total-row td{font-weight:700;background:#f8f7ff;}
      .neg{color:#c0392b;} .pos{color:#1e7e4f;}
      .footer{margin-top:30px;font-size:9px;color:#999;border-top:1px solid #eee;padding-top:10px;}
      @media print{ body{padding:14px;} }
    </style></head><body>
    <div class="hd">
      <div><div class="brand">CERTECD PERÚ S.R.L.</div><div style="font-size:10px;color:#888;">Sistema de Gestión de Personal Minero · RUC 20453866786</div></div>
      <div style="text-align:right;font-size:10px;color:#888;">Generado: ${new Date().toLocaleString("es-PE")}</div>
    </div>
    <h1>${title}</h1>
    ${htmlContent}
    <div class="footer">Documento generado automáticamente por CERTECD SGPM v1.1 — Av. Arancota 124, Sachaca, Arequipa.</div>
    <script>window.onload=()=>window.print();</script>
    </body></html>
  `);
  win.document.close();
}

function sendMail(to, subject, body) {
  const url = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(url, "_blank");
}

// ============================================================
// API
// ============================================================
async function apiFetch(path, opts={}, ms=4000) {
  const ctrl = new AbortController();
  const tid = setTimeout(()=>ctrl.abort(), ms);
  try {
    const res = await fetch(`${API}${path}`, {
      ...opts,
      headers:{"Content-Type":"application/json",...(JWT?{Authorization:`Bearer ${JWT}`}:{})},
      signal:ctrl.signal,
    });
    clearTimeout(tid);
    if(!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch(e){ clearTimeout(tid); throw e; }
}
async function apiLogin(u,p) {
  try {
    const r = await apiFetch("/auth/login",{method:"POST",body:JSON.stringify({username:u,password:p})},3000);
    if(r?.token){ JWT=r.token; return true; }
  } catch {}
  return false;
}
async function loadBD() {
  const [w,h,t,o] = await Promise.all([
    apiFetch("/trabajadores"), apiFetch("/homologaciones"), apiFetch("/tareos"), apiFetch("/ordenes"),
  ]);
  return {
    trabajadores: Array.isArray(w)&&w.length?w:MOCK.trabajadores,
    homologaciones: Array.isArray(h)&&h.length?h:MOCK.homologaciones,
    tareos: Array.isArray(t)&&t.length?t:MOCK.tareos,
    ordenes: Array.isArray(o)&&o.length?o:MOCK.ordenes,
  };
}

// ============================================================
// CSS
// ============================================================
const mkCSS = (dark) => `
@import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600&display=swap');
*{margin:0;padding:0;box-sizing:border-box;}
:root{
  --bg:   ${dark?"#07090f":"#f1f4f9"};
  --bg2:  ${dark?"#0c1018":"#ffffff"};
  --bg3:  ${dark?"#111622":"#f7f9fc"};
  --bg4:  ${dark?"#171f2e":"#edf1f8"};
  --bg5:  ${dark?"#1e2840":"#e2e8f4"};
  --b1:   ${dark?"#1d2c40":"#d6dce9"};
  --b2:   ${dark?"#253348":"#c4cde0"};
  --b3:   ${dark?"#2e3f5a":"#b0bcd4"};
  --t1:   ${dark?"#e4edf8":"#111827"};
  --t2:   ${dark?"#718fac":"#4b6080"};
  --t3:   ${dark?"#3e5570":"#8096b4"};
  --t4:   ${dark?"#243040":"#c0cce0"};
  --ac:   #875bf7;
  --ac2:  #7348e8;
  --ac3:  ${dark?"rgba(135,91,247,.18)":"rgba(135,91,247,.1)"};
  --ac4:  ${dark?"rgba(135,91,247,.08)":"rgba(135,91,247,.05)"};
  --or:   #f59e0b;
  --or3:  ${dark?"rgba(245,158,11,.16)":"rgba(245,158,11,.1)"};
  --red:  #ef4444; --red2: ${dark?"rgba(239,68,68,.16)":"rgba(239,68,68,.1)"};
  --ylw:  #d97706; --ylw2: ${dark?"rgba(217,119,6,.16)":"rgba(217,119,6,.1)"};
  --grn:  #10b981; --grn2: ${dark?"rgba(16,185,129,.14)":"rgba(16,185,129,.08)"};
  --blu:  #3b82f6; --blu2: ${dark?"rgba(59,130,246,.14)":"rgba(59,130,246,.08)"};
  --prp:  #8b5cf6; --prp2: ${dark?"rgba(139,92,246,.14)":"rgba(139,92,246,.08)"};
  --tel:  #06b6d4; --tel2: ${dark?"rgba(6,182,212,.14)":"rgba(6,182,212,.08)"};
  --pk:   #ec4899; --pk2:  ${dark?"rgba(236,72,153,.14)":"rgba(236,72,153,.08)"};
  --font:'Inter',sans-serif;
  --mono:'JetBrains Mono',monospace;
  --r:6px;--r2:10px;--r3:14px;
  --sh: ${dark?"0 1px 8px rgba(0,0,0,.4)":"0 1px 8px rgba(30,60,120,.08)"};
  --sh2:${dark?"0 6px 24px rgba(0,0,0,.5)":"0 6px 24px rgba(30,60,120,.12)"};
  --sh3:${dark?"0 16px 48px rgba(0,0,0,.6)":"0 16px 48px rgba(30,60,120,.16)"};
}
body{font-family:var(--font);background:var(--bg);color:var(--t1);font-size:13px;line-height:1.5;transition:background .3s,color .3s;}
*{transition:background .15s,border-color .15s,color .15s;}
input,select,textarea,button{transition:none!important;}
.app{display:flex;min-height:100vh;}
.sb{width:230px;min-height:100vh;background:var(--bg2);border-right:1px solid var(--b1);display:flex;flex-direction:column;position:fixed;top:0;left:0;bottom:0;z-index:300;box-shadow:var(--sh);}
.sb-brand{display:flex;align-items:center;gap:10px;padding:16px 18px;border-bottom:1px solid var(--b1);background:${dark?"linear-gradient(135deg,#0f172a,#1e1b4b)":"linear-gradient(135deg,#ede9fe,#f5f3ff)"};}
.sb-logo{width:34px;height:34px;background:linear-gradient(135deg,var(--ac),var(--ac2));border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;color:#fff;font-family:var(--mono);box-shadow:0 2px 10px rgba(135,91,247,.4);flex-shrink:0;}
.sb-name{font-size:14px;font-weight:700;letter-spacing:.2px;color:${dark?"#e9d5ff":"#4c1d95"};}
.sb-ver{font-family:var(--mono);font-size:9px;color:#7c3aed;letter-spacing:.5px;}
.sb-status{padding:10px 18px;border-bottom:1px solid var(--b1);}
.conn-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border-radius:20px;background:var(--bg3);border:1px solid var(--b1);font-family:var(--mono);font-size:9px;letter-spacing:.4px;}
.cd{width:6px;height:6px;border-radius:50%;flex-shrink:0;animation:pulse 2s infinite;}
@keyframes pulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.4;transform:scale(.8)}}
.cd.ok{background:var(--grn);} .cd.off{background:var(--ylw);}
.nav{flex:1;padding:8px 0;overflow-y:auto;}
.ns{padding:12px 18px 4px;font-family:var(--mono);font-size:9px;font-weight:600;color:var(--t4);letter-spacing:2px;text-transform:uppercase;}
.ni{display:flex;align-items:center;gap:10px;padding:8px 16px 8px 18px;cursor:pointer;color:var(--t2);font-size:12.5px;font-weight:500;border-left:3px solid transparent;transition:all .15s!important;margin:1px 6px 1px 0;border-radius:0 var(--r) var(--r) 0;}
.ni:hover{background:var(--ac4);color:var(--t1);}
.ni.on{background:var(--ac3);color:var(--ac);border-left-color:var(--ac);font-weight:600;}
.ni-ic{font-size:15px;width:18px;text-align:center;flex-shrink:0;}
.nb{margin-left:auto;padding:2px 7px;border-radius:20px;font-family:var(--mono);font-size:9px;font-weight:700;}
.nb.r{background:var(--red);color:#fff;} .nb.y{background:var(--ylw);color:#fff;} .nb.g{background:var(--grn);color:#fff;}
.sb-bot{padding:12px 16px;border-top:1px solid var(--b1);}
.ucard{display:flex;align-items:center;gap:9px;padding:8px 10px;background:var(--bg3);border-radius:var(--r2);border:1px solid var(--b1);}
.uav{width:30px;height:30px;border-radius:var(--r);flex-shrink:0;background:linear-gradient(135deg,var(--ac),var(--ac2));display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:700;color:#fff;}
.un{font-size:11.5px;font-weight:600;line-height:1.2;}
.ur{font-family:var(--mono);font-size:9px;color:var(--t3);text-transform:uppercase;letter-spacing:.5px;}
.main{margin-left:230px;flex:1;display:flex;flex-direction:column;min-height:100vh;}
.topbar{height:52px;background:var(--bg2);border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;padding:0 24px;position:sticky;top:0;z-index:200;box-shadow:var(--sh);}
.topbar-l{display:flex;align-items:center;gap:10px;}
.page-title{font-size:16px;font-weight:600;letter-spacing:-.2px;}
.topbar-r{display:flex;align-items:center;gap:10px;}
.bell{position:relative;cursor:pointer;font-size:16px;padding:6px;border-radius:var(--r);transition:background .15s!important;}
.bell:hover{background:var(--ac4);}
.bell-dot{position:absolute;top:3px;right:3px;width:7px;height:7px;border-radius:50%;background:var(--red);border:1.5px solid var(--bg2);}
.tgl{width:38px;height:22px;border-radius:11px;border:none;cursor:pointer;position:relative;background:${dark?"var(--ac)":"var(--b2)"};box-shadow:inset 0 1px 3px rgba(0,0,0,.2);flex-shrink:0;outline:none;}
.tgl::after{content:'';position:absolute;top:3px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.3);transition:left .2s!important;left:${dark?"19px":"3px"};}
.topbar-date{font-family:var(--mono);font-size:10px;color:var(--t3);}
.topbar-sep{width:1px;height:20px;background:var(--b1);}
.page{padding:20px 24px;flex:1;}
.scards{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin-bottom:20px;}
.sc{background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r2);padding:16px 18px;position:relative;overflow:hidden;box-shadow:var(--sh);transition:all .2s!important;cursor:default;}
.sc:hover{border-color:var(--b2);transform:translateY(-2px);box-shadow:var(--sh2);}
.sc-icon{width:36px;height:36px;border-radius:var(--r);display:flex;align-items:center;justify-content:center;font-size:16px;margin-bottom:10px;}
.sc-lbl{font-family:var(--mono);font-size:9px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:1.2px;margin-bottom:4px;}
.sc-val{font-size:26px;font-weight:700;letter-spacing:-.5px;line-height:1;}
.sc-sub{font-size:10.5px;color:var(--t3);margin-top:5px;}
.sc-stripe{position:absolute;bottom:0;left:0;right:0;height:3px;border-radius:0 0 var(--r2) var(--r2);}
.sc.ac .sc-icon{background:var(--ac3);} .sc.ac .sc-val{color:var(--ac);} .sc.ac .sc-stripe{background:linear-gradient(90deg,var(--ac),var(--prp));}
.sc.grn .sc-icon{background:var(--grn2);} .sc.grn .sc-val{color:var(--grn);} .sc.grn .sc-stripe{background:linear-gradient(90deg,var(--grn),var(--tel));}
.sc.red .sc-icon{background:var(--red2);} .sc.red .sc-val{color:var(--red);} .sc.red .sc-stripe{background:linear-gradient(90deg,var(--red),var(--pk));}
.sc.ylw .sc-icon{background:var(--ylw2);} .sc.ylw .sc-val{color:var(--ylw);} .sc.ylw .sc-stripe{background:linear-gradient(90deg,var(--ylw),var(--or));}
.sc.blu .sc-icon{background:var(--blu2);} .sc.blu .sc-val{color:var(--blu);} .sc.blu .sc-stripe{background:linear-gradient(90deg,var(--blu),var(--tel));}
.sc.prp .sc-icon{background:var(--prp2);} .sc.prp .sc-val{color:var(--prp);} .sc.prp .sc-stripe{background:linear-gradient(90deg,var(--prp),var(--pk));}
.panel{background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r2);overflow:hidden;margin-bottom:16px;box-shadow:var(--sh);}
.ph{padding:12px 18px;border-bottom:1px solid var(--b1);display:flex;align-items:center;justify-content:space-between;background:var(--bg3);flex-wrap:wrap;gap:8px;}
.pt{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.6px;display:flex;align-items:center;gap:7px;}
.pm{font-family:var(--mono);font-size:10px;color:var(--t3);}
.g2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px;}
@media(max-width:900px){.g2,.g3{grid-template-columns:1fr;}}
.tw{overflow-x:auto;}
table{width:100%;border-collapse:collapse;}
thead{background:var(--bg3);}
th{padding:9px 14px;text-align:left;font-family:var(--mono);font-size:9px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid var(--b1);white-space:nowrap;user-select:none;}
td{padding:10px 14px;border-bottom:1px solid var(--b1);vertical-align:middle;}
tr:last-child td{border-bottom:none;}
tbody tr{cursor:default;transition:background .1s!important;}
tbody tr:hover td{background:${dark?"rgba(135,91,247,.04)":"rgba(135,91,247,.03)"};}
.mono{font-family:var(--mono);font-size:11px;}
.badge{display:inline-flex;align-items:center;gap:3px;padding:3px 8px;border-radius:4px;font-family:var(--mono);font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:.4px;white-space:nowrap;}
.badge.activo,.badge.vigente,.badge.confirmado,.badge.completado,.badge.enviado{background:var(--grn2);color:var(--grn);border:1px solid rgba(16,185,129,.25);}
.badge.inactivo,.badge.vencido{background:var(--red2);color:var(--red);border:1px solid rgba(239,68,68,.25);}
.badge.por_vencer,.badge.registrado,.badge.pendiente{background:var(--ylw2);color:var(--ylw);border:1px solid rgba(217,119,6,.25);}
.badge.activo-ot{background:var(--ac3);color:var(--ac);border:1px solid rgba(135,91,247,.25);}
.badge.mantenimiento{background:var(--blu2);color:var(--blu);border:1px solid rgba(59,130,246,.25);}
.badge.outsourcing{background:var(--prp2);color:var(--prp);border:1px solid rgba(139,92,246,.25);}
.badge.limpieza{background:var(--tel2);color:var(--tel);border:1px solid rgba(6,182,212,.25);}
.badge.residuos{background:var(--or3);color:var(--or);border:1px solid rgba(245,158,11,.25);}
.badge.sst{background:var(--pk2);color:var(--pk);border:1px solid rgba(236,72,153,.25);}
.badge.dia{background:var(--blu2);color:var(--blu);border:1px solid rgba(59,130,246,.25);}
.badge.noche{background:var(--prp2);color:var(--prp);border:1px solid rgba(139,92,246,.25);}
.badge.guardia{background:var(--tel2);color:var(--tel);border:1px solid rgba(6,182,212,.25);}
.bar{display:flex;align-items:center;gap:9px;padding:12px 16px;border-bottom:1px solid var(--b1);flex-wrap:wrap;background:var(--bg3);}
.srch{display:flex;align-items:center;gap:7px;background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r);padding:6px 11px;flex:1;min-width:180px;}
.srch:focus-within{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac3);}
.srch input{background:none;border:none;outline:none;color:var(--t1);font-size:12px;width:100%;font-family:var(--font);}
.srch input::placeholder{color:var(--t3);}
.btn{display:inline-flex;align-items:center;gap:6px;padding:7px 14px;border-radius:var(--r);border:none;font-size:12px;font-weight:500;cursor:pointer;font-family:var(--font);transition:all .15s!important;white-space:nowrap;outline:none;}
.bp{background:linear-gradient(135deg,var(--ac),var(--ac2));color:#fff;box-shadow:0 2px 8px rgba(135,91,247,.35);}
.bp:hover{transform:translateY(-1px);box-shadow:0 4px 14px rgba(135,91,247,.45);}
.bg{background:var(--bg3);color:var(--t2);border:1px solid var(--b1);}
.bg:hover{background:var(--bg4);color:var(--t1);border-color:var(--b2);}
.br{background:var(--red2);color:var(--red);border:1px solid rgba(239,68,68,.25);}
.br:hover{background:rgba(239,68,68,.22);}
.bgrn{background:var(--grn2);color:var(--grn);border:1px solid rgba(16,185,129,.25);}
.bblu{background:var(--blu2);color:var(--blu);border:1px solid rgba(59,130,246,.25);}
.sm{padding:4px 10px;font-size:11px;}
.xs{padding:3px 7px;font-size:10px;}
.btn:disabled{opacity:.5;cursor:not-allowed;transform:none!important;}
.tabs{display:flex;gap:1px;padding:3px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--b1);}
.tab{padding:4px 12px;border-radius:4px;font-family:var(--mono);font-size:10px;font-weight:600;cursor:pointer;color:var(--t3);border:none;background:none;transition:all .15s!important;text-transform:uppercase;letter-spacing:.4px;}
.tab.on{background:var(--ac);color:#fff;box-shadow:0 2px 6px rgba(135,91,247,.3);}
.ov{position:fixed;inset:0;background:${dark?"rgba(0,0,0,.8)":"rgba(15,23,42,.5)"};display:flex;align-items:center;justify-content:center;z-index:1000;padding:20px;backdrop-filter:blur(6px);animation:fadeIn .2s ease;}
@keyframes fadeIn{from{opacity:0}to{opacity:1}}
.modal{background:var(--bg2);border:1px solid var(--b2);border-radius:var(--r3);width:100%;max-width:580px;max-height:90vh;overflow-y:auto;box-shadow:var(--sh3);animation:slideUp .22s ease;}
.modal.lg{max-width:780px;}
@keyframes slideUp{from{transform:translateY(18px) scale(.98);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
.mh{padding:18px 22px;border-bottom:1px solid var(--b1);display:flex;justify-content:space-between;align-items:center;background:${dark?"linear-gradient(135deg,#0f172a,#1e1b4b)":"linear-gradient(135deg,#ede9fe,#f5f3ff)"};}
.mt{font-size:15px;font-weight:700;letter-spacing:-.1px;color:${dark?"#e9d5ff":"#4c1d95"};}
.msub{font-size:11px;color:${dark?"#a78bfa":"#7c3aed"};margin-top:2px;}
.mb{padding:18px 22px;display:flex;flex-direction:column;gap:14px;}
.mf{padding:14px 22px;border-top:1px solid var(--b1);display:flex;gap:9px;justify-content:flex-end;background:var(--bg3);flex-wrap:wrap;}
.fg{display:flex;flex-direction:column;gap:5px;}
.fg2{display:grid;grid-template-columns:1fr 1fr;gap:13px;}
.fg3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:13px;}
label{font-family:var(--mono);font-size:9px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:.8px;}
input,select,textarea{background:var(--bg3);border:1px solid var(--b1);color:var(--t1);padding:8px 11px;border-radius:var(--r);font-size:12.5px;font-family:var(--font);outline:none;width:100%;}
input:focus,select:focus,textarea:focus{border-color:var(--ac);box-shadow:0 0 0 3px var(--ac3);}
select option{background:var(--bg2);color:var(--t1);}
textarea{resize:vertical;min-height:68px;line-height:1.5;}
.frm-section{font-family:var(--mono);font-size:9px;font-weight:600;color:var(--ac);text-transform:uppercase;letter-spacing:1.5px;padding-bottom:6px;border-bottom:1px solid var(--b1);margin-bottom:2px;}
.al-list{padding:10px 14px;display:flex;flex-direction:column;gap:7px;}
.al{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:var(--r);border:1px solid;transition:transform .15s!important;cursor:default;}
.al:hover{transform:translateX(4px);}
.al.c{background:var(--red2);border-color:rgba(239,68,68,.22);} .al.w{background:var(--ylw2);border-color:rgba(217,119,6,.22);}
.al-ic{font-size:16px;flex-shrink:0;}
.al-n{font-size:12px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.al-d{font-family:var(--mono);font-size:10px;color:var(--t3);margin-top:1px;}
.al-day{font-size:15px;font-weight:700;flex-shrink:0;font-variant-numeric:tabular-nums;}
.al-day.c{color:var(--red);} .al-day.w{color:var(--ylw);}
.pb{background:var(--bg5);border-radius:3px;overflow:hidden;}
.pf{border-radius:3px;transition:width .6s ease;}
.wc{display:flex;align-items:center;gap:10px;}
.wav{width:32px;height:32px;border-radius:var(--r);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-family:var(--mono);font-size:11px;font-weight:700;}
.wn{font-size:12.5px;font-weight:600;line-height:1.2;}
.ws{font-family:var(--mono);font-size:10px;color:var(--t3);margin-top:1px;}
.dg{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:16px 20px;}
.di{display:flex;flex-direction:column;gap:3px;}
.dl{font-family:var(--mono);font-size:9px;font-weight:600;color:var(--t3);text-transform:uppercase;letter-spacing:1px;}
.dv{font-size:12.5px;font-weight:500;}
.otc{padding:13px;background:var(--bg3);border-radius:var(--r);border:1px solid var(--b1);transition:all .2s!important;}
.otc:hover{border-color:var(--ac);box-shadow:0 2px 12px var(--ac3);}
.otc+.otc{margin-top:9px;}
.tag{display:inline-flex;padding:2px 8px;border-radius:20px;font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.4px;border:1px solid;}
.tag.op{background:var(--blu2);color:var(--blu);border-color:rgba(59,130,246,.28);}
.tag.ss{background:var(--pk2);color:var(--pk);border-color:rgba(236,72,153,.28);}
.tag.rh{background:var(--prp2);color:var(--prp);border-color:rgba(139,92,246,.28);}
.tag.ad{background:var(--tel2);color:var(--tel);border-color:rgba(6,182,212,.28);}
.tag.lo{background:var(--grn2);color:var(--grn);border-color:rgba(16,185,129,.28);}
.pl-positive{color:var(--grn);font-weight:600;} .pl-negative{color:var(--red);font-weight:600;} .pl-total{font-weight:700;font-size:13px;}
.chart-wrap{padding:16px 18px 12px;}
.bar-chart{display:flex;align-items:flex-end;gap:5px;height:80px;}
.bar-col{display:flex;flex-direction:column;align-items:center;gap:3px;flex:1;}
.bar-fill{width:100%;border-radius:3px 3px 0 0;transition:height .5s ease!important;min-height:2px;}
.bar-lbl{font-family:var(--mono);font-size:8px;color:var(--t3);} .bar-val{font-family:var(--mono);font-size:9px;font-weight:700;color:var(--t2);}
.tl{padding:14px 18px;display:flex;flex-direction:column;gap:0;}
.tl-item{display:flex;gap:12px;padding-bottom:14px;position:relative;}
.tl-item:last-child{padding-bottom:0;}
.tl-item::before{content:'';position:absolute;left:15px;top:28px;bottom:0;width:1px;background:var(--b1);}
.tl-item:last-child::before{display:none;}
.tl-dot{width:30px;height:30px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;z-index:1;}
.tl-body{flex:1;padding-top:4px;}
.tl-title{font-size:12px;font-weight:600;}
.tl-date{font-family:var(--mono);font-size:10px;color:var(--t3);margin-top:1px;}
.toast{position:fixed;bottom:22px;right:22px;z-index:9999;padding:12px 18px;border-radius:var(--r2);font-size:12px;font-weight:500;box-shadow:var(--sh3);display:flex;align-items:center;gap:9px;max-width:340px;animation:toastIn .25s ease;}
@keyframes toastIn{from{transform:translateY(16px) scale(.95);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
.toast.ok{background:var(--grn2);border:1px solid rgba(16,185,129,.3);color:var(--grn);}
.toast.err{background:var(--red2);border:1px solid rgba(239,68,68,.3);color:var(--red);}
.toast.info{background:var(--ac3);border:1px solid rgba(135,91,247,.3);color:var(--ac);}
.empty{text-align:center;padding:48px 20px;color:var(--t3);}
.empty-ic{font-size:36px;margin-bottom:12px;opacity:.3;}
.empty-txt{font-size:12.5px;}
.sd{font-family:var(--mono);font-size:9px;font-weight:600;color:var(--ac);text-transform:uppercase;letter-spacing:1.2px;padding:10px 0 6px;border-bottom:1px solid var(--b1);margin-bottom:8px;}
.info-box{padding:12px 14px;border-radius:var(--r);border:1px solid;font-size:12px;line-height:1.5;margin-bottom:14px;}
.info-box.law{background:var(--ac3);border-color:rgba(135,91,247,.25);color:var(--ac);}
::-webkit-scrollbar{width:4px;height:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--b2);border-radius:10px;}
.lw{min-height:100vh;display:flex;align-items:center;justify-content:center;background:var(--bg);position:relative;overflow:hidden;}
.lw::before{content:'';position:absolute;inset:0;background:${dark?"radial-gradient(ellipse at 20% 50%,rgba(135,91,247,.12) 0,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(59,130,246,.08) 0,transparent 50%)":"radial-gradient(ellipse at 20% 50%,rgba(135,91,247,.08) 0,transparent 50%),radial-gradient(ellipse at 80% 20%,rgba(59,130,246,.06) 0,transparent 50%)"};pointer-events:none;}
.lcard{background:var(--bg2);border:1px solid var(--b1);border-radius:var(--r3);padding:38px;width:400px;box-shadow:var(--sh3);animation:slideUp .3s ease;position:relative;z-index:1;}
.l-brand{display:flex;align-items:center;gap:12px;margin-bottom:24px;padding-bottom:20px;border-bottom:1px solid var(--b1);}
.l-logo{width:46px;height:46px;border-radius:var(--r2);background:linear-gradient(135deg,var(--ac),var(--ac2));display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:#fff;font-family:var(--mono);box-shadow:0 4px 14px rgba(135,91,247,.4);}
.l-name{font-size:22px;font-weight:700;letter-spacing:-.2px;}
.l-sub{font-family:var(--mono);font-size:10px;color:var(--t3);margin-top:2px;letter-spacing:.5px;text-transform:uppercase;}
.l-stripe{padding:8px 12px;background:var(--ac3);border-radius:var(--r);border:1px solid rgba(135,91,247,.22);font-family:var(--mono);font-size:9px;color:var(--ac);letter-spacing:.8px;text-transform:uppercase;margin-bottom:20px;display:flex;align-items:center;gap:6px;}
.l-form{display:flex;flex-direction:column;gap:13px;}
.l-hint{font-family:var(--mono);font-size:9px;color:var(--t3);text-align:center;margin-top:14px;letter-spacing:.3px;line-height:1.6;}
.lerr{background:var(--red2);border:1px solid rgba(239,68,68,.25);border-radius:var(--r);padding:9px 12px;font-size:11.5px;color:var(--red);display:flex;align-items:center;gap:6px;}
.popover{position:absolute;top:48px;right:24px;width:340px;max-height:420px;overflow-y:auto;background:var(--bg2);border:1px solid var(--b2);border-radius:var(--r2);box-shadow:var(--sh3);z-index:400;animation:slideUp .15s ease;}
.pv-hd{padding:12px 16px;border-bottom:1px solid var(--b1);display:flex;justify-content:space-between;align-items:center;background:var(--bg3);}
.pv-item{padding:11px 16px;border-bottom:1px solid var(--b1);display:flex;gap:10px;cursor:default;}
.pv-item:hover{background:var(--ac4);}
.switch-row{display:flex;align-items:center;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--b1);}
.switch-row:last-child{border-bottom:none;}
.switch-lbl{font-size:12px;}
.switch-sub{font-size:10px;color:var(--t3);margin-top:1px;}
`;

// ============================================================
// PLANTILLAS DE CORREO AUTOMÁTICO
// ============================================================
const EMAIL_TEMPLATES = {
  doc_vencido: (h) => ({
    subject: `🚨 URGENTE: Documento vencido — ${h.trabajador}`,
    body: `Estimado equipo de RRHH,\n\nEl siguiente documento se encuentra VENCIDO y bloquea el acceso a mina del trabajador:\n\nTrabajador: ${h.trabajador}\nDNI: ${h.dni}\nDocumento: ${h.tipo_documento}\nFecha de vencimiento: ${fmtDate(h.fecha_vencimiento)}\n\nSe requiere renovación INMEDIATA antes de la próxima subida a campamento.\n\nSistema CERTECD SGPM — Notificación automática`,
  }),
  doc_por_vencer: (h) => ({
    subject: `⚠️ Aviso: Documento por vencer en ${h.dias_restantes} días — ${h.trabajador}`,
    body: `Estimado equipo de RRHH,\n\nEl siguiente documento vencerá pronto:\n\nTrabajador: ${h.trabajador}\nDocumento: ${h.tipo_documento}\nVence: ${fmtDate(h.fecha_vencimiento)} (en ${h.dias_restantes} días)\n\nSe recomienda iniciar el trámite de renovación con anticipación.\n\nSistema CERTECD SGPM — Notificación automática`,
  }),
  boleta: (p) => ({
    subject: `Boleta de pago — ${p.trabajador.nombres} ${p.trabajador.apellidos} — Mayo 2026`,
    body: `Estimado/a ${p.trabajador.nombres},\n\nSe adjunta el detalle de su boleta de pago correspondiente al período Mayo 2026:\n\nDías trabajados: ${p.diasTrab}\nHoras normales: ${p.hn}h\nHoras extras: ${p.he}h\nTotal bruto: ${S(p.totalBruto)}\nDescuentos: -${S(p.totalDescuentos)}\nNETO A PAGAR: ${S(p.netoPagable)}\n\nEl depósito se realizará a su cuenta Scotiabank registrada.\n\nÁrea de Administración — CERTECD Perú S.R.L.`,
  }),
  ot_resumen: (o) => ({
    subject: `Resumen de avance — ${o.codigo}`,
    body: `Estimado cliente,\n\nResumen de avance de la orden de trabajo ${o.codigo}:\n\nCliente: ${o.cliente_nombre}\nDescripción: ${o.descripcion}\nHoras ejecutadas: ${o.horas_ejecutadas}h de ${o.horas_estimadas}h estimadas (${pct(o.horas_ejecutadas,o.horas_estimadas)}%)\nEstado: ${o.estado}\n\nQuedamos atentos a cualquier consulta.\n\nGerencia de Operaciones — CERTECD Perú S.R.L.`,
  }),
};

// ============================================================
// BASE COMPONENTS
// ============================================================
const AVATARS_COLORS = ["#875bf7","#3b82f6","#10b981","#f59e0b","#ef4444","#ec4899","#06b6d4","#8b5cf6"];
const wavColor = (name) => AVATARS_COLORS[(name||"X").charCodeAt(0) % AVATARS_COLORS.length];

function WCell({nombre, sub, size=32}) {
  const col = wavColor(nombre);
  return (
    <div className="wc">
      <div className="wav" style={{width:size,height:size,background:`${col}22`,border:`1px solid ${col}44`}}>
        <span style={{color:col,fontSize:size*0.34,fontWeight:700}}>{inits(nombre)}</span>
      </div>
      <div><div className="wn">{nombre}</div>{sub&&<div className="ws">{sub}</div>}</div>
    </div>
  );
}
function SC({icon,label,value,sub,c="ac"}) {
  return (
    <div className={`sc ${c}`}>
      <div className="sc-icon"><span>{icon}</span></div>
      <div className="sc-lbl">{label}</div>
      <div className="sc-val">{value}</div>
      {sub&&<div className="sc-sub">{sub}</div>}
      <div className="sc-stripe"/>
    </div>
  );
}
function PBar({exec,est,h=4}) {
  const p=pct(exec,est);
  const col=p>85?"var(--red)":p>60?"var(--ylw)":"var(--grn)";
  return(
    <div style={{display:"flex",alignItems:"center",gap:7}}>
      <div className="pb" style={{flex:1,height:h}}><div className="pf" style={{width:`${p}%`,height:h,background:col}}/></div>
      <span className="mono" style={{color:"var(--t3)",width:28,textAlign:"right",fontSize:9}}>{p}%</span>
    </div>
  );
}
function AlRow({item, onSend}) {
  const d=item.dias_restantes!==undefined?item.dias_restantes:diasR(item.fecha_vencimiento);
  const c=d<0;
  return(
    <div className={`al ${c?"c":"w"}`}>
      <span className="al-ic">{c?"🚨":"⚠️"}</span>
      <div style={{flex:1,minWidth:0}}>
        <div className="al-n">{item.trabajador||`${item.nombres} ${item.apellidos}`}</div>
        <div className="al-d">{item.documento||item.tipo_documento}</div>
      </div>
      <div className={`al-day ${c?"c":"w"}`}>{c?`−${Math.abs(d)}d`:`${d}d`}</div>
      {onSend&&<button className="btn bg xs" title="Enviar alerta por correo" onClick={()=>onSend(item)}>✉️</button>}
    </div>
  );
}

// ============================================================
// PAGE: DASHBOARD
// ============================================================
function Dashboard({data, onSendAlert}) {
  const homs=data.homologaciones.map(h=>({...h,_d:h.dias_restantes!==undefined?h.dias_restantes:diasR(h.fecha_vencimiento)}));
  const alertas=homs.filter(h=>h._d<=7).slice(0,5);
  const totalH=data.tareos.reduce((s,t)=>s+(+t.horas_normales||0)+(+t.horas_extras||0),0);
  const ordenesAct=data.ordenes.filter(o=>o.estado==="activo");
  const chart=[...Array(7)].map((_,i)=>{
    const d=new Date();d.setDate(d.getDate()-6+i);
    const k=d.toISOString().split("T")[0];
    const h=data.tareos.filter(t=>t.fecha===k).reduce((s,t)=>s+(+t.horas_normales||0)+(+t.horas_extras||0),0);
    return {l:d.toLocaleDateString("es-PE",{weekday:"narrow"}),h};
  });
  const maxH=Math.max(...chart.map(c=>c.h),1);
  const activity=[
    ...data.tareos.filter(t=>t.estado==="confirmado").slice(0,3).map(t=>({icon:"✅",text:`Tareo confirmado — ${t.trabajador_nombre?.split(" ")[0]}`,time:"Hoy",color:"var(--grn)"})),
    ...homs.filter(h=>h._d<0).slice(0,2).map(h=>({icon:"🚨",text:`Doc vencido — ${h.trabajador?.split(" ")[0]}`,time:"Alerta",color:"var(--red)"})),
  ].slice(0,5);

  return(
    <div>
      <div className="scards">
        <SC icon="👥" label="Personal Activo" value={data.trabajadores.filter(w=>w.estado==="activo").length} sub={`de ${data.trabajadores.length} registrados`} c="grn"/>
        <SC icon="📄" label="Docs Vencidos" value={homs.filter(h=>h._d<0).length} sub="Requieren renovación" c="red"/>
        <SC icon="⚠️" label="Por Vencer" value={homs.filter(h=>h._d>=0&&h._d<=30).length} sub="Próximos 30 días" c="ylw"/>
        <SC icon="🔧" label="Órdenes Activas" value={ordenesAct.length} sub="En ejecución" c="prp"/>
        <SC icon="⏱" label="Tareos s/Firma" value={data.tareos.filter(t=>t.estado==="registrado").length} sub="Pendientes" c="ylw"/>
        <SC icon="⚡" label="H-H Mes" value={totalH} sub="Mayo 2026" c="ac"/>
      </div>
      <div className="g2">
        <div className="panel">
          <div className="ph">
            <div className="pt">🚨 Alertas de Vencimiento</div>
            <div className="pm">{homs.filter(h=>h._d<0).length} vencidos · {homs.filter(h=>h._d>=0&&h._d<=30).length} por vencer</div>
          </div>
          {alertas.length>0
            ?<div className="al-list">{alertas.map((a,i)=><AlRow key={i} item={a} onSend={onSendAlert}/>)}</div>
            :<div className="empty"><div className="empty-ic">✅</div><div className="empty-txt">Sin alertas críticas</div></div>}
          <div style={{padding:"10px 18px",borderTop:"1px solid var(--b1)",display:"flex",gap:16,background:"var(--bg3)"}}>
            <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>Total docs: <b style={{color:"var(--t1)"}}>{homs.length}</b></span>
            <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--grn)"}}>Vigentes: <b>{homs.filter(h=>h._d>30).length}</b></span>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">📋 Órdenes de Trabajo</div><div className="pm">{ordenesAct.length} activas</div></div>
          <div style={{padding:"12px 14px"}}>
            {ordenesAct.map(o=>(
              <div key={o.id} className="otc">
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                  <div>
                    <div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--ac)",marginBottom:3}}>{o.codigo}</div>
                    <div style={{fontSize:12,fontWeight:600,marginBottom:2}}>{o.cliente_nombre.replace("Sociedad Minera ","").replace(" Corporation","").replace(" Mitsui Maquinarias Perú","")}</div>
                    <div style={{fontSize:11,color:"var(--t3)"}}>{o.descripcion.substring(0,50)}…</div>
                  </div>
                  <span className={`badge ${o.tipo_servicio}`}>{o.tipo_servicio}</span>
                </div>
                <div style={{display:"flex",justifyContent:"space-between",fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginBottom:5}}>
                  <span>{o.horas_ejecutadas}h / {o.horas_estimadas}h estimadas</span>
                  <b style={{color:"var(--ac)"}}>{pct(o.horas_ejecutadas,o.horas_estimadas)}%</b>
                </div>
                <PBar exec={o.horas_ejecutadas} est={o.horas_estimadas}/>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="g2">
        <div className="panel">
          <div className="ph"><div className="pt">📈 Horas Registradas — 7 días</div></div>
          <div className="chart-wrap">
            <div className="bar-chart">
              {chart.map((c,i)=>(
                <div key={i} className="bar-col">
                  <div className="bar-val">{c.h||""}</div>
                  <div className="bar-fill" style={{height:`${c.h?(c.h/maxH)*70:2}px`,background:c.h?"linear-gradient(to top,var(--ac),var(--blu))":"var(--bg5)"}}/>
                  <div className="bar-lbl">{c.l}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{padding:"0 18px 14px",borderTop:"1px solid var(--b1)",paddingTop:12,background:"var(--bg3)"}}>
            <div style={{display:"flex",gap:16,fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)"}}>
              <span>Total período: <b style={{color:"var(--ac)"}}>{totalH}h</b></span>
              <span>Prom/día: <b style={{color:"var(--t1)"}}>{chart.filter(c=>c.h>0).length>0?Math.round(totalH/chart.filter(c=>c.h>0).length):0}h</b></span>
            </div>
          </div>
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">🕐 Actividad Reciente</div></div>
          <div className="tl">
            {activity.map((a,i)=>(
              <div key={i} className="tl-item">
                <div className="tl-dot" style={{background:`${a.color}22`,border:`1px solid ${a.color}44`}}>{a.icon}</div>
                <div className="tl-body"><div className="tl-title">{a.text}</div><div className="tl-date">{a.time}</div></div>
              </div>
            ))}
            {activity.length===0&&<div className="empty"><div className="empty-txt">Sin actividad</div></div>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: TRABAJADORES
// ============================================================
function Trabajadores({data,setData,toast}) {
  const [srch,setSrch]=useState(""); const [tab,setTab]=useState("todos");
  const [modal,setModal]=useState(null); const [sel,setSel]=useState(null);
  const [form,setForm]=useState({dni:"",nombres:"",apellidos:"",cargo_nombre:"",area:"Operaciones",telefono:"",email:"",fecha_ingreso:"",estado:"activo",regimen:"14x7"});
  const [saving,setSaving]=useState(false);

  const filtered=data.trabajadores.filter(w=>{
    const ok=tab==="todos"||w.estado===tab;
    const q=!srch||`${w.nombres} ${w.apellidos} ${w.dni}`.toLowerCase().includes(srch.toLowerCase());
    return ok&&q;
  });
  const docsTrab=(dni)=>data.homologaciones.filter(h=>h.dni===dni).map(h=>({...h,_d:h.dias_restantes!==undefined?h.dias_restantes:diasR(h.fecha_vencimiento)}));

  const save=async()=>{
    if(!form.dni||!form.nombres||!form.apellidos){toast("Completa DNI, nombres y apellidos","err");return;}
    setSaving(true);
    try {
      let saved={...form,id:Date.now()};
      try{const r=await apiFetch("/trabajadores",{method:"POST",body:JSON.stringify(form)});if(r?.id)saved=r;}catch{}
      setData(d=>({...d,trabajadores:[...d.trabajadores,saved]}));
      toast("Trabajador registrado ✓");setModal(null);
    }catch{toast("Error al guardar","err");}
    setSaving(false);
  };
  const vT=(dni)=>docsTrab(dni).filter(d=>d._d<0).length;
  const xvT=(dni)=>docsTrab(dni).filter(d=>d._d>=0&&d._d<=30).length;

  const doExportCSV=()=>exportCSV("trabajadores_certecd.csv", filtered, [
    {label:"DNI",key:"dni"},{label:"Nombres",key:"nombres"},{label:"Apellidos",key:"apellidos"},
    {label:"Cargo",key:"cargo_nombre"},{label:"Área",key:"area"},{label:"Régimen",key:"regimen"},
    {label:"Estado",key:"estado"},{label:"Ingreso",get:r=>fmtDate(r.fecha_ingreso)},{label:"Teléfono",key:"telefono"},{label:"Correo",key:"email"},
  ]);

  return(
    <div>
      <div className="scards">
        <SC icon="👥" label="Total Personal" value={data.trabajadores.length} c="ac"/>
        <SC icon="✅" label="Activos" value={data.trabajadores.filter(w=>w.estado==="activo").length} c="grn"/>
        <SC icon="❌" label="Inactivos" value={data.trabajadores.filter(w=>w.estado==="inactivo").length} c="red"/>
        <SC icon="🏔" label="Régimen 14×7" value={data.trabajadores.filter(w=>w.regimen==="14x7").length} sub="En campamento minero" c="prp"/>
      </div>
      <div className="panel">
        <div className="bar">
          <div className="srch"><span style={{color:"var(--t3)"}}>🔍</span><input placeholder="Buscar nombre, apellido o DNI…" value={srch} onChange={e=>setSrch(e.target.value)}/></div>
          <div className="tabs">{["todos","activo","inactivo"].map(f=><button key={f} className={`tab ${tab===f?"on":""}`} onClick={()=>setTab(f)}>{f}</button>)}</div>
          <button className="btn bg sm" onClick={doExportCSV}>⬇ CSV</button>
          <button className="btn bp sm" onClick={()=>setModal("new")}>+ Nuevo Trabajador</button>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Trabajador</th><th>DNI</th><th>Cargo</th><th>Área</th><th>Régimen</th><th>Ingreso</th><th>Estado</th><th>Docs</th><th></th></tr></thead>
            <tbody>
              {filtered.map(w=>{
                const v=vT(w.dni),xv=xvT(w.dni),docs=docsTrab(w.dni);
                return(
                  <tr key={w.id||w.dni} onClick={()=>{setSel(w);setModal("det");}} style={{cursor:"pointer"}}>
                    <td><WCell nombre={`${w.nombres} ${w.apellidos}`} sub={w.email}/></td>
                    <td><span className="mono">{w.dni}</span></td>
                    <td style={{fontSize:11.5,maxWidth:150}}>{w.cargo_nombre||"—"}</td>
                    <td><span className={`tag ${aTag(w.area)}`}>{w.area||"Ops"}</span></td>
                    <td><span className="mono" style={{fontSize:10,color:"var(--t2)"}}>{w.regimen||"—"}</span></td>
                    <td><span className="mono">{fmtShort(w.fecha_ingreso)}</span></td>
                    <td><span className={`badge ${w.estado}`}>{w.estado}</span></td>
                    <td>
                      {v>0&&<span className="badge vencido" style={{marginRight:3}}>{v}V</span>}
                      {xv>0&&<span className="badge por_vencer">{xv}⚠</span>}
                      {v===0&&xv===0&&docs.length>0&&<span className="badge vigente">✓OK</span>}
                      {docs.length===0&&<span style={{color:"var(--t4)",fontFamily:"var(--mono)",fontSize:9}}>—</span>}
                    </td>
                    <td onClick={e=>e.stopPropagation()}><button className="btn bg xs" onClick={()=>{setSel(w);setModal("det");}}>Ver</button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length===0&&<div className="empty"><div className="empty-ic">👥</div><div className="empty-txt">Sin resultados</div></div>}
        </div>
      </div>

      {modal==="new"&&(
        <div className="ov" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mh"><div><div className="mt">Registrar Trabajador</div><div className="msub">Nuevo colaborador CERTECD</div></div><button className="btn bg sm" onClick={()=>setModal(null)}>✕</button></div>
            <div className="mb">
              <div className="frm-section">Datos Personales</div>
              <div className="fg2">
                <div className="fg"><label>DNI *</label><input placeholder="40123456" value={form.dni} onChange={e=>setForm({...form,dni:e.target.value})}/></div>
                <div className="fg"><label>Estado</label><select value={form.estado} onChange={e=>setForm({...form,estado:e.target.value})}><option value="activo">Activo</option><option value="inactivo">Inactivo</option></select></div>
              </div>
              <div className="fg2">
                <div className="fg"><label>Nombres *</label><input value={form.nombres} onChange={e=>setForm({...form,nombres:e.target.value})}/></div>
                <div className="fg"><label>Apellidos *</label><input value={form.apellidos} onChange={e=>setForm({...form,apellidos:e.target.value})}/></div>
              </div>
              <div className="frm-section">Datos Laborales</div>
              <div className="fg2">
                <div className="fg"><label>Cargo</label><input value={form.cargo_nombre} onChange={e=>setForm({...form,cargo_nombre:e.target.value})}/></div>
                <div className="fg"><label>Área</label><select value={form.area} onChange={e=>setForm({...form,area:e.target.value})}>{["Operaciones","SST","Recursos Humanos","Administración","Logística"].map(a=><option key={a}>{a}</option>)}</select></div>
              </div>
              <div className="fg2">
                <div className="fg"><label>Régimen</label><select value={form.regimen} onChange={e=>setForm({...form,regimen:e.target.value})}><option value="14x7">14×7 (Campamento)</option><option value="Mensual">Mensual (Oficina)</option><option value="Part-time">Part-time</option></select></div>
                <div className="fg"><label>Fecha de Ingreso</label><input type="date" value={form.fecha_ingreso} onChange={e=>setForm({...form,fecha_ingreso:e.target.value})}/></div>
              </div>
              <div className="fg2">
                <div className="fg"><label>Teléfono</label><input placeholder="9XXXXXXXX" value={form.telefono} onChange={e=>setForm({...form,telefono:e.target.value})}/></div>
                <div className="fg"><label>Correo</label><input placeholder="correo@certecd.pe" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></div>
              </div>
            </div>
            <div className="mf"><button className="btn bg" onClick={()=>setModal(null)}>Cancelar</button><button className="btn bp" onClick={save} disabled={saving}>{saving?"Guardando…":"Guardar Trabajador"}</button></div>
          </div>
        </div>
      )}

      {modal==="det"&&sel&&(
        <div className="ov" onClick={()=>setModal(null)}>
          <div className="modal lg" onClick={e=>e.stopPropagation()}>
            <div className="mh">
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                <div className="wav" style={{width:44,height:44,border:`2px solid ${wavColor(sel.nombres)}66`,background:`${wavColor(sel.nombres)}22`}}><span style={{color:wavColor(sel.nombres),fontSize:16,fontWeight:700}}>{inits(`${sel.nombres} ${sel.apellidos}`)}</span></div>
                <div><div className="mt">{sel.apellidos}, {sel.nombres}</div><div className="msub">{sel.cargo_nombre} · {sel.area} · {sel.regimen}</div></div>
              </div>
              <button className="btn bg sm" onClick={()=>setModal(null)}>✕</button>
            </div>
            <div className="dg">
              <div className="di"><div className="dl">DNI</div><div className="dv mono">{sel.dni}</div></div>
              <div className="di"><div className="dl">Estado</div><div className="dv"><span className={`badge ${sel.estado}`}>{sel.estado}</span></div></div>
              <div className="di"><div className="dl">Teléfono</div><div className="dv mono">{sel.telefono||"—"}</div></div>
              <div className="di"><div className="dl">Correo</div><div className="dv" style={{fontSize:11}}>{sel.email||"—"}</div></div>
              <div className="di"><div className="dl">Ingreso</div><div className="dv">{fmtDate(sel.fecha_ingreso)}</div></div>
              <div className="di"><div className="dl">Régimen</div><div className="dv">{sel.regimen||"—"}</div></div>
            </div>
            <div style={{padding:"0 20px 16px"}}>
              <div className="sd">Documentos Habilitantes</div>
              {docsTrab(sel.dni).length>0
                ?docsTrab(sel.dni).map((h,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid var(--b1)"}}>
                    <div>{h.es_critico&&<span style={{color:"var(--red)",marginRight:5,fontSize:9}}>●</span>}<span style={{fontSize:12}}>{h.tipo_documento}</span><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginTop:1}}>{fmtDate(h.fecha_vencimiento)}</div></div>
                    <span className={`badge ${docCls(h._d)}`}>{diasLbl(h._d)}</span>
                  </div>
                ))
                :<div style={{fontSize:12,color:"var(--t3)",padding:"8px 0"}}>Sin documentos registrados</div>}
              <div className="sd" style={{marginTop:12}}>Tareos Recientes</div>
              {data.tareos.filter(t=>t.dni===sel.dni).slice(0,5).map((t,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:"1px solid var(--b1)"}}>
                  <div style={{display:"flex",alignItems:"center",gap:10}}><span className="mono" style={{color:"var(--ac)",fontSize:10}}>{t.ot_codigo}</span><span style={{fontSize:11}}>{fmtDate(t.fecha)}</span></div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}><span className="mono">{(+t.horas_normales||0)+(+t.horas_extras||0)}h</span><span className={`badge ${t.estado}`}>{t.estado}</span></div>
                </div>
              ))}
              {data.tareos.filter(t=>t.dni===sel.dni).length===0&&<div style={{fontSize:12,color:"var(--t3)",padding:"8px 0"}}>Sin tareos registrados</div>}
            </div>
            <div className="mf">
              {sel.email&&<button className="btn bblu sm" onClick={()=>sendMail(sel.email,`Comunicado CERTECD — ${sel.nombres}`,`Estimado/a ${sel.nombres},\n\n`)}>✉️ Enviar correo</button>}
              <button className="btn bg" onClick={()=>setModal(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: HOMOLOGACIONES
// ============================================================
function Homologaciones({data,setData,toast}) {
  const [tab,setTab]=useState("todos"); const [srch,setSrch]=useState("");
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({trabajador_id:"",tipo_documento:"",fecha_emision:"",fecha_vencimiento:"",numero_doc:"",observaciones:""});
  const [saving,setSaving]=useState(false);

  const homs=data.homologaciones.map(h=>({...h,_d:h.dias_restantes!==undefined?h.dias_restantes:diasR(h.fecha_vencimiento)}));
  const filtered=homs.filter(h=>{
    if(tab==="vencido"&&h._d>=0)return false;
    if(tab==="por_vencer"&&(h._d<0||h._d>30))return false;
    if(tab==="vigente"&&h._d<=30)return false;
    if(srch&&!`${h.trabajador} ${h.tipo_documento}`.toLowerCase().includes(srch.toLowerCase()))return false;
    return true;
  });

  const save=async()=>{
    if(!form.trabajador_id||!form.tipo_documento||!form.fecha_vencimiento){toast("Completa campos requeridos","err");return;}
    setSaving(true);
    try {
      const trab=data.trabajadores.find(t=>t.id===+form.trabajador_id);
      const nuevo={id:Date.now(),trabajador_id:+form.trabajador_id,trabajador:trab?`${trab.nombres} ${trab.apellidos}`:"—",dni:trab?.dni||"",cargo:trab?.cargo_nombre||"",tipo_documento:form.tipo_documento,fecha_vencimiento:form.fecha_vencimiento,dias_restantes:diasR(form.fecha_vencimiento),numero_doc:form.numero_doc,es_critico:true};
      try{await apiFetch("/homologaciones",{method:"POST",body:JSON.stringify(form)});}catch{}
      setData(d=>({...d,homologaciones:[...d.homologaciones.filter(h=>!(h.trabajador_id===nuevo.trabajador_id&&h.tipo_documento===nuevo.tipo_documento)),nuevo]}));
      toast("Documento registrado ✓");setModal(false);
    }catch{toast("Error al guardar","err");}
    setSaving(false);
  };

  const enviarAlerta=(h)=>{
    const t = data.trabajadores.find(w=>w.dni===h.dni);
    const tpl = h._d<0 ? EMAIL_TEMPLATES.doc_vencido(h) : EMAIL_TEMPLATES.doc_por_vencer(h);
    sendMail(t?.email||"rrhh@certecd.pe", tpl.subject, tpl.body);
    toast(`Cliente de correo abierto para ${h.trabajador}`,"info");
  };

  const doExportCSV=()=>exportCSV("homologaciones_certecd.csv", filtered, [
    {label:"Trabajador",key:"trabajador"},{label:"DNI",key:"dni"},{label:"Cargo",key:"cargo"},
    {label:"Documento",key:"tipo_documento"},{label:"Vencimiento",get:r=>fmtDate(r.fecha_vencimiento)},
    {label:"Días",get:r=>r._d},{label:"Estado",get:r=>docCls(r._d)},
  ]);
  const doExportPDF=()=>{
    const rows = filtered.map(h=>`<tr><td>${h.trabajador}</td><td>${h.dni}</td><td>${h.tipo_documento}</td><td>${fmtDate(h.fecha_vencimiento)}</td><td>${diasLbl(h._d)}</td><td>${docCls(h._d).replace("_"," ")}</td></tr>`).join("");
    exportPDF("Control de Homologaciones", `<table><thead><tr><th>Trabajador</th><th>DNI</th><th>Documento</th><th>Vencimiento</th><th>Días</th><th>Estado</th></tr></thead><tbody>${rows}</tbody></table>`);
  };

  return(
    <div>
      <div className="scards">
        <SC icon="🚨" label="Vencidos" value={homs.filter(h=>h._d<0).length} sub="Bloqueo de acceso a mina" c="red"/>
        <SC icon="⚠️" label="Por Vencer ≤30d" value={homs.filter(h=>h._d>=0&&h._d<=30).length} sub="Atención inmediata" c="ylw"/>
        <SC icon="✅" label="Vigentes" value={homs.filter(h=>h._d>30).length} sub="En regla" c="grn"/>
        <SC icon="📋" label="Total Docs" value={homs.length} c="blu"/>
      </div>
      <div className="panel">
        <div className="bar">
          <div className="srch"><span style={{color:"var(--t3)"}}>🔍</span><input placeholder="Buscar trabajador o tipo de documento…" value={srch} onChange={e=>setSrch(e.target.value)}/></div>
          <div className="tabs">{["todos","vencido","por_vencer","vigente"].map(f=><button key={f} className={`tab ${tab===f?"on":""}`} onClick={()=>setTab(f)}>{f.replace("_"," ")}</button>)}</div>
          <button className="btn bg sm" onClick={doExportCSV}>⬇ CSV</button>
          <button className="btn bg sm" onClick={doExportPDF}>📄 PDF</button>
          <button className="btn bp sm" onClick={()=>setModal(true)}>+ Registrar Doc</button>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Trabajador</th><th>Cargo</th><th>Documento</th><th>Vencimiento</th><th>Días</th><th>Estado</th><th></th></tr></thead>
            <tbody>
              {filtered.map((h,i)=>(
                <tr key={h.id||i}>
                  <td><WCell nombre={h.trabajador||`${h.nombres} ${h.apellidos}`} sub={h.dni}/></td>
                  <td style={{fontSize:11,color:"var(--t2)",maxWidth:120}}>{h.cargo||"—"}</td>
                  <td style={{fontSize:12}}>{h.es_critico&&<span style={{color:"var(--red)",marginRight:5,fontSize:9}}>●</span>}{h.tipo_documento}</td>
                  <td><span className="mono">{fmtDate(h.fecha_vencimiento)}</span></td>
                  <td><span style={{fontFamily:"var(--mono)",fontSize:11,fontWeight:700,color:h._d<0?"var(--red)":h._d<=30?"var(--ylw)":"var(--grn)"}}>{diasLbl(h._d)}</span></td>
                  <td><span className={`badge ${docCls(h._d)}`}>{docCls(h._d).replace("_"," ")}</span></td>
                  <td>{h._d<=30&&<button className="btn bg xs" title="Enviar alerta" onClick={()=>enviarAlerta(h)}>✉️</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<div className="empty"><div className="empty-ic">📄</div><div className="empty-txt">Sin resultados</div></div>}
        </div>
      </div>

      {modal&&(
        <div className="ov" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mh"><div><div className="mt">Registrar Documento</div><div className="msub">Habilitación para acceso a mina</div></div><button className="btn bg sm" onClick={()=>setModal(false)}>✕</button></div>
            <div className="mb">
              <div className="fg"><label>Trabajador *</label><select value={form.trabajador_id} onChange={e=>setForm({...form,trabajador_id:e.target.value})}><option value="">Seleccionar trabajador…</option>{data.trabajadores.filter(w=>w.estado==="activo").map(w=><option key={w.id} value={w.id}>{w.apellidos}, {w.nombres} — {w.dni}</option>)}</select></div>
              <div className="fg"><label>Tipo de Documento *</label><select value={form.tipo_documento} onChange={e=>setForm({...form,tipo_documento:e.target.value})}><option value="">Seleccionar tipo…</option>{["Examen Médico Ocupacional (EMO)","Pase a Mina SMCV","Pase a Mina Southern","Inducción Anexo 4 SMCV","Inducción Anexo 5 Southern","SCTR Salud","SCTR Pensión","Antecedentes Penales","Certificado de Altura","Licencia de Conducir A2"].map(t=><option key={t} value={t}>{t}</option>)}</select></div>
              <div className="fg2"><div className="fg"><label>Fecha de Emisión</label><input type="date" value={form.fecha_emision} onChange={e=>setForm({...form,fecha_emision:e.target.value})}/></div><div className="fg"><label>Fecha de Vencimiento *</label><input type="date" value={form.fecha_vencimiento} onChange={e=>setForm({...form,fecha_vencimiento:e.target.value})}/></div></div>
              <div className="fg"><label>N° Documento / Referencia</label><input placeholder="EMO-2026-015" value={form.numero_doc} onChange={e=>setForm({...form,numero_doc:e.target.value})}/></div>
              <div className="fg"><label>Observaciones</label><textarea placeholder="Notas adicionales…" value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})}/></div>
            </div>
            <div className="mf"><button className="btn bg" onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" onClick={save} disabled={saving}>{saving?"Guardando…":"Guardar Documento"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: TAREOS
// ============================================================
function Tareos({data,setData,toast}) {
  const [tab,setTab]=useState("todos"); const [modal,setModal]=useState(false);
  const [form,setForm]=useState({trabajador_id:"",orden_trabajo_id:"",fecha:"",hora_ingreso:"07:00",hora_salida:"19:00",horas_normales:8,horas_extras:0,tipo_turno:"dia",observaciones:""});
  const [saving,setSaving]=useState(false);
  const filtered=data.tareos.filter(t=>tab==="todos"||t.estado===tab);
  const totalHN=data.tareos.reduce((s,t)=>s+(+t.horas_normales||0),0);
  const totalHE=data.tareos.reduce((s,t)=>s+(+t.horas_extras||0),0);

  const save=async()=>{
    if(!form.trabajador_id||!form.fecha){toast("Completa trabajador y fecha","err");return;}
    setSaving(true);
    try {
      const trab=data.trabajadores.find(t=>t.id===+form.trabajador_id);
      const ot=data.ordenes.find(o=>o.id===+form.orden_trabajo_id);
      const nuevo={id:Date.now(),trabajador_id:+form.trabajador_id,trabajador_nombre:trab?`${trab.nombres} ${trab.apellidos}`:"—",dni:trab?.dni||"",cargo:trab?.cargo_nombre||"",orden_trabajo_id:+form.orden_trabajo_id,ot_codigo:ot?.codigo||"—",fecha:form.fecha,hora_ingreso:form.hora_ingreso,hora_salida:form.hora_salida,horas_normales:+form.horas_normales||8,horas_extras:+form.horas_extras||0,tipo_turno:form.tipo_turno,estado:"registrado",supervisor_firma:null};
      try{await apiFetch("/tareos",{method:"POST",body:JSON.stringify(form)});}catch{}
      setData(d=>({...d,tareos:[nuevo,...d.tareos]}));
      toast("Tareo registrado ✓");setModal(false);
    }catch{toast("Error al guardar","err");}
    setSaving(false);
  };
  const firmar=(id)=>{
    setData(d=>({...d,tareos:d.tareos.map(t=>t.id===id?{...t,estado:"confirmado",supervisor_firma:"Supervisor SGPM"}:t)}));
    toast("Tareo confirmado con firma digital ✓");
  };
  const doExportCSV=()=>exportCSV("tareos_certecd.csv", filtered, [
    {label:"Trabajador",key:"trabajador_nombre"},{label:"OT",key:"ot_codigo"},{label:"Fecha",get:r=>fmtDate(r.fecha)},
    {label:"Ingreso",key:"hora_ingreso"},{label:"Salida",key:"hora_salida"},{label:"H.Normales",key:"horas_normales"},
    {label:"H.Extras",key:"horas_extras"},{label:"Turno",key:"tipo_turno"},{label:"Estado",key:"estado"},
  ]);

  return(
    <div>
      <div className="scards">
        <SC icon="📝" label="Total Tareos" value={data.tareos.length} c="ac"/>
        <SC icon="⏳" label="Sin Confirmar" value={data.tareos.filter(t=>t.estado==="registrado").length} c="ylw"/>
        <SC icon="✅" label="Confirmados" value={data.tareos.filter(t=>t.estado==="confirmado").length} c="grn"/>
        <SC icon="🕐" label="H. Normales" value={totalHN} c="blu"/>
        <SC icon="⚡" label="H. Extras" value={totalHE} sub={`+${totalHE>0?Math.round(totalHE/(totalHN+totalHE)*100):0}% sobre total`} c="prp"/>
        <SC icon="⏱" label="H-H Total" value={totalHN+totalHE} c="ac"/>
      </div>
      <div className="panel">
        <div className="bar">
          <div className="tabs">{["todos","registrado","confirmado"].map(f=><button key={f} className={`tab ${tab===f?"on":""}`} onClick={()=>setTab(f)}>{f}</button>)}</div>
          <div style={{marginLeft:"auto"}}/>
          <button className="btn bg sm" onClick={doExportCSV}>⬇ CSV</button>
          <button className="btn bp sm" onClick={()=>setModal(true)}>+ Registrar Tareo</button>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Trabajador</th><th>OT</th><th>Fecha</th><th>Ingreso</th><th>Salida</th><th>H.N</th><th>H.E</th><th>Turno</th><th>Estado</th><th>Firma</th><th></th></tr></thead>
            <tbody>
              {filtered.map((t,i)=>(
                <tr key={t.id||i}>
                  <td><WCell nombre={t.trabajador_nombre} sub={t.cargo}/></td>
                  <td><span className="mono" style={{color:"var(--ac)",fontSize:10}}>{t.ot_codigo}</span></td>
                  <td><span className="mono">{fmtShort(t.fecha)}</span></td>
                  <td><span className="mono">{t.hora_ingreso}</span></td>
                  <td><span className="mono">{t.hora_salida}</span></td>
                  <td><span className="mono">{t.horas_normales}h</span></td>
                  <td><span className="mono" style={{color:t.horas_extras>0?"var(--ac)":"var(--t3)"}}>{t.horas_extras}h</span></td>
                  <td><span className={`badge ${t.tipo_turno||"dia"}`}>{t.tipo_turno||"día"}</span></td>
                  <td><span className={`badge ${t.estado}`}>{t.estado}</span></td>
                  <td style={{fontSize:11}}>{t.supervisor_firma?<span style={{color:"var(--grn)",fontFamily:"var(--mono)",fontSize:10}}>✓ {t.supervisor_firma.split(" ").pop()}</span>:<span style={{color:"var(--red)",fontFamily:"var(--mono)",fontSize:9}}>PENDIENTE</span>}</td>
                  <td>{t.estado==="registrado"&&<button className="btn bgrn xs" onClick={()=>firmar(t.id)}>Firmar</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<div className="empty"><div className="empty-ic">⏱</div><div className="empty-txt">Sin tareos</div></div>}
        </div>
      </div>

      {modal&&(
        <div className="ov" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mh"><div><div className="mt">Registrar Tareo</div><div className="msub">Control de asistencia diaria en mina</div></div><button className="btn bg sm" onClick={()=>setModal(false)}>✕</button></div>
            <div className="mb">
              <div className="frm-section">Asignación</div>
              <div className="fg2">
                <div className="fg"><label>Trabajador *</label><select value={form.trabajador_id} onChange={e=>setForm({...form,trabajador_id:e.target.value})}><option value="">Seleccionar…</option>{data.trabajadores.filter(w=>w.estado==="activo").map(w=><option key={w.id} value={w.id}>{w.apellidos}, {w.nombres}</option>)}</select></div>
                <div className="fg"><label>Orden de Trabajo</label><select value={form.orden_trabajo_id} onChange={e=>setForm({...form,orden_trabajo_id:e.target.value})}><option value="">Seleccionar…</option>{data.ordenes.filter(o=>o.estado==="activo").map(o=><option key={o.id} value={o.id}>{o.codigo}</option>)}</select></div>
              </div>
              <div className="frm-section">Horario</div>
              <div className="fg3">
                <div className="fg"><label>Fecha *</label><input type="date" value={form.fecha} onChange={e=>setForm({...form,fecha:e.target.value})}/></div>
                <div className="fg"><label>Hora Ingreso</label><input type="time" value={form.hora_ingreso} onChange={e=>setForm({...form,hora_ingreso:e.target.value})}/></div>
                <div className="fg"><label>Hora Salida</label><input type="time" value={form.hora_salida} onChange={e=>setForm({...form,hora_salida:e.target.value})}/></div>
              </div>
              <div className="fg3">
                <div className="fg"><label>H. Normales</label><input type="number" min="0" max="12" value={form.horas_normales} onChange={e=>setForm({...form,horas_normales:e.target.value})}/></div>
                <div className="fg"><label>H. Extras</label><input type="number" min="0" max="8" value={form.horas_extras} onChange={e=>setForm({...form,horas_extras:e.target.value})}/></div>
                <div className="fg"><label>Tipo Turno</label><select value={form.tipo_turno} onChange={e=>setForm({...form,tipo_turno:e.target.value})}><option value="dia">Día</option><option value="noche">Noche</option><option value="guardia">Guardia</option></select></div>
              </div>
              <div className="fg"><label>Observaciones</label><textarea placeholder="Notas del turno, incidencias…" value={form.observaciones} onChange={e=>setForm({...form,observaciones:e.target.value})}/></div>
            </div>
            <div className="mf"><button className="btn bg" onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" onClick={save} disabled={saving}>{saving?"Guardando…":"Registrar Tareo"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: PLANILLAS
// ============================================================
function Planillas({data, toast}) {
  const [sel,setSel]=useState(null);
  const planillas=data.trabajadores.filter(w=>w.estado==="activo").map(w=>({trabajador:w,...calcPlanilla(w,data.tareos)}));
  const totalBruto=planillas.reduce((s,p)=>s+p.totalBruto,0);
  const totalNeto=planillas.reduce((s,p)=>s+p.netoPagable,0);
  const totalEssalud=planillas.reduce((s,p)=>s+p.essaludEmp,0);

  const doExportCSV=()=>exportCSV("planilla_mayo2026.csv", planillas, [
    {label:"Trabajador",get:p=>`${p.trabajador.nombres} ${p.trabajador.apellidos}`},{label:"DNI",get:p=>p.trabajador.dni},
    {label:"Días",key:"diasTrab"},{label:"H.Norm",key:"hn"},{label:"H.Extra",key:"he"},
    {label:"Bruto",key:"totalBruto"},{label:"AFP",key:"afp"},{label:"Renta5ta",key:"impRenta5ta"},
    {label:"Neto",key:"netoPagable"},{label:"EsSalud",key:"essaludEmp"},{label:"SCTR",key:"sctr"},
  ]);
  const doExportPDF=()=>{
    const rows = planillas.map(p=>`<tr><td>${p.trabajador.nombres} ${p.trabajador.apellidos}</td><td>${p.diasTrab}</td><td>${p.hn}h</td><td>${p.he}h</td><td class="pos">${S(p.totalBruto)}</td><td class="neg">-${S(p.afp)}</td><td class="neg">-${S(p.impRenta5ta)}</td><td><b>${S(p.netoPagable)}</b></td></tr>`).join("");
    exportPDF("Planilla de Remuneraciones — Mayo 2026", `<table><thead><tr><th>Trabajador</th><th>Días</th><th>H.N</th><th>H.E</th><th>Bruto</th><th>AFP</th><th>Renta 5ta</th><th>Neto</th></tr></thead><tbody>${rows}<tr class="total-row"><td colspan="4">TOTALES</td><td>${S(totalBruto)}</td><td colspan="2"></td><td>${S(totalNeto)}</td></tr></tbody></table>`);
  };
  const enviarBoleta=(p)=>{
    const tpl = EMAIL_TEMPLATES.boleta(p);
    sendMail(p.trabajador.email||"", tpl.subject, tpl.body);
    toast(`Boleta enviada a ${p.trabajador.nombres}`,"info");
  };

  return(
    <div>
      <div className="info-box law">📋 <b>Planillas bajo Ley N° 29783</b> · Régimen Laboral Minería · RMV: S/ {RMV.toLocaleString()} · EsSalud 9% · AFP ~10% · SCTR 1.96% · CTS semestral · Gratificación Fiestas Patrias/Navidad</div>
      <div className="scards">
        <SC icon="💰" label="Masa Salarial Bruta" value={S(totalBruto)} sub="Total devengado" c="grn"/>
        <SC icon="🏦" label="Total Neto Pagable" value={S(totalNeto)} sub="Después de descuentos" c="ac"/>
        <SC icon="🏥" label="EsSalud (Empleador)" value={S(totalEssalud)} sub="9% sobre remuneración" c="blu"/>
        <SC icon="👷" label="Trabajadores" value={planillas.length} sub="Con registro de horas" c="prp"/>
      </div>
      <div className="panel">
        <div className="ph">
          <div className="pt">📊 Planilla — Mayo 2026</div>
          <div style={{display:"flex",gap:8}}>
            <button className="btn bg sm" onClick={doExportCSV}>⬇ CSV</button>
            <button className="btn bp sm" onClick={doExportPDF}>📄 Exportar PDF</button>
          </div>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Trabajador</th><th>Días</th><th>H.N</th><th>H.E</th><th>Sueldo Bruto</th><th>AFP</th><th>Renta 5ta</th><th>Descuentos</th><th>NETO PAGABLE</th><th>EsSalud</th><th>SCTR</th><th></th></tr></thead>
            <tbody>
              {planillas.map((p,i)=>(
                <tr key={i}>
                  <td style={{cursor:"pointer"}} onClick={()=>setSel(p)}><WCell nombre={`${p.trabajador.nombres} ${p.trabajador.apellidos}`} sub={p.trabajador.cargo_nombre}/></td>
                  <td><span className="mono">{p.diasTrab}</span></td>
                  <td><span className="mono">{p.hn}h</span></td>
                  <td><span className="mono" style={{color:p.he>0?"var(--ac)":"var(--t3)"}}>{p.he}h</span></td>
                  <td><span className="mono pl-positive">{S(p.sueldoBruto)}</span></td>
                  <td><span className="mono pl-negative">-{S(p.afp)}</span></td>
                  <td><span className="mono pl-negative">-{S(p.impRenta5ta)}</span></td>
                  <td><span className="mono pl-negative">-{S(p.totalDescuentos)}</span></td>
                  <td><span className="mono pl-total">{S(p.netoPagable)}</span></td>
                  <td><span className="mono" style={{color:"var(--blu)"}}>{S(p.essaludEmp)}</span></td>
                  <td><span className="mono" style={{color:"var(--tel)"}}>{S(p.sctr)}</span></td>
                  <td><button className="btn bg xs" onClick={()=>setSel(p)}>Ver</button></td>
                </tr>
              ))}
              <tr>
                <td colSpan={4} style={{fontFamily:"var(--mono)",fontSize:10,fontWeight:700,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1,padding:"10px 14px",background:"var(--bg3)"}}>TOTALES</td>
                <td style={{background:"var(--bg3)"}}><span className="mono pl-positive" style={{fontSize:12}}>{S(planillas.reduce((s,p)=>s+p.sueldoBruto,0))}</span></td>
                <td style={{background:"var(--bg3)"}}><span className="mono pl-negative">-{S(planillas.reduce((s,p)=>s+p.afp,0))}</span></td>
                <td style={{background:"var(--bg3)"}}><span className="mono pl-negative">-{S(planillas.reduce((s,p)=>s+p.impRenta5ta,0))}</span></td>
                <td style={{background:"var(--bg3)"}}><span className="mono pl-negative">-{S(planillas.reduce((s,p)=>s+p.totalDescuentos,0))}</span></td>
                <td style={{background:"var(--bg3)"}}><span className="mono pl-total" style={{fontSize:13}}>{S(totalNeto)}</span></td>
                <td style={{background:"var(--bg3)"}}><span className="mono" style={{color:"var(--blu)"}}>{S(totalEssalud)}</span></td>
                <td style={{background:"var(--bg3)"}}><span className="mono" style={{color:"var(--tel)"}}>{S(planillas.reduce((s,p)=>s+p.sctr,0))}</span></td>
                <td style={{background:"var(--bg3)"}}/>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {sel&&(
        <div className="ov" onClick={()=>setSel(null)}>
          <div className="modal lg" onClick={e=>e.stopPropagation()}>
            <div className="mh">
              <div><div className="mt">Boleta de Pago — {sel.trabajador.nombres} {sel.trabajador.apellidos}</div><div className="msub">Mayo 2026 · {sel.trabajador.cargo_nombre} · {sel.trabajador.regimen}</div></div>
              <button className="btn bg sm" onClick={()=>setSel(null)}>✕</button>
            </div>
            <div style={{padding:"18px 22px"}}>
              <div className="sd">Ingresos</div>
              <table style={{marginBottom:14}}>
                <thead><tr><th>Concepto</th><th>Base</th><th>Monto</th></tr></thead>
                <tbody>
                  <tr><td>Remuneración básica</td><td className="mono">{sel.hn}h normales</td><td className="mono pl-positive">{S(sel.sueldoBruto-sel.heValor)}</td></tr>
                  {sel.he>0&&<tr><td>Horas extras (25–35% adicional)</td><td className="mono">{sel.he}h extras</td><td className="mono pl-positive">{S(sel.heValor)}</td></tr>}
                  <tr style={{fontWeight:700}}><td><b>TOTAL BRUTO</b></td><td/><td className="mono pl-positive" style={{fontSize:13}}><b>{S(sel.totalBruto)}</b></td></tr>
                </tbody>
              </table>
              <div className="sd">Descuentos al Trabajador</div>
              <table style={{marginBottom:14}}>
                <thead><tr><th>Concepto</th><th>%</th><th>Monto</th></tr></thead>
                <tbody>
                  <tr><td>AFP (Sistema Privado de Pensiones)</td><td className="mono">10%</td><td className="mono pl-negative">−{S(sel.afp)}</td></tr>
                  <tr><td>Impuesto a la Renta 5ta Categoría</td><td className="mono">8%</td><td className="mono pl-negative">−{S(sel.impRenta5ta)}</td></tr>
                  <tr style={{fontWeight:700}}><td><b>TOTAL DESCUENTOS</b></td><td/><td className="mono pl-negative" style={{fontSize:13}}><b>−{S(sel.totalDescuentos)}</b></td></tr>
                </tbody>
              </table>
              <div style={{background:"var(--grn2)",border:"1px solid rgba(16,185,129,.25)",borderRadius:"var(--r)",padding:"14px 16px",marginBottom:14,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><div style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--grn)",textTransform:"uppercase",letterSpacing:1}}>Neto a Pagar al Trabajador</div><div style={{fontFamily:"var(--mono)",fontSize:22,fontWeight:800,color:"var(--grn)",marginTop:2}}>{S(sel.netoPagable)}</div></div>
                <div style={{fontSize:28,opacity:.5}}>💰</div>
              </div>
              <div className="sd">Aportes del Empleador (No deducidos del trabajador)</div>
              <table style={{marginBottom:14}}>
                <thead><tr><th>Concepto</th><th>%</th><th>Monto</th></tr></thead>
                <tbody>
                  <tr><td>EsSalud (Seguro de Salud)</td><td className="mono">9%</td><td className="mono" style={{color:"var(--blu)"}}>{S(sel.essaludEmp)}</td></tr>
                  <tr><td>SCTR (Seguro Trabajo de Riesgo)</td><td className="mono">1.96%</td><td className="mono" style={{color:"var(--tel)"}}>{S(sel.sctr)}</td></tr>
                  <tr style={{fontWeight:700}}><td><b>TOTAL APORTES EMPLEADOR</b></td><td/><td className="mono" style={{color:"var(--blu)",fontSize:13}}><b>{S(sel.totalAportesEmp)}</b></td></tr>
                </tbody>
              </table>
              <div className="sd">Beneficios Sociales Proporcionales (Devengados)</div>
              <table>
                <thead><tr><th>Concepto</th><th>Base Legal</th><th>Monto Devengado</th></tr></thead>
                <tbody>
                  <tr><td>CTS (Compensación por Tiempo de Servicios)</td><td className="mono" style={{fontSize:10}}>D.S. 001-97-TR</td><td className="mono" style={{color:"var(--prp)"}}>{S(sel.cts)}</td></tr>
                  <tr><td>Gratificación (proporcional)</td><td className="mono" style={{fontSize:10}}>Ley 27735</td><td className="mono" style={{color:"var(--prp)"}}>{S(sel.gratificacion)}</td></tr>
                  <tr><td>Vacaciones (proporcional)</td><td className="mono" style={{fontSize:10}}>D. Leg. 713</td><td className="mono" style={{color:"var(--prp)"}}>{S(sel.vacaciones)}</td></tr>
                </tbody>
              </table>
            </div>
            <div className="mf">
              <button className="btn bg" onClick={()=>setSel(null)}>Cerrar</button>
              {sel.trabajador.email&&<button className="btn bblu" onClick={()=>enviarBoleta(sel)}>✉️ Enviar por correo</button>}
              <button className="btn bp" onClick={()=>{
                const html = `<table><tr><td><b>Trabajador</b></td><td>${sel.trabajador.nombres} ${sel.trabajador.apellidos}</td></tr><tr><td><b>DNI</b></td><td>${sel.trabajador.dni}</td></tr><tr><td><b>Cargo</b></td><td>${sel.trabajador.cargo_nombre}</td></tr><tr><td><b>Días trabajados</b></td><td>${sel.diasTrab}</td></tr><tr><td><b>H. Normales</b></td><td>${sel.hn}h</td></tr><tr><td><b>H. Extras</b></td><td>${sel.he}h</td></tr><tr><td><b>Total Bruto</b></td><td class="pos">${S(sel.totalBruto)}</td></tr><tr><td><b>AFP (10%)</b></td><td class="neg">-${S(sel.afp)}</td></tr><tr><td><b>Renta 5ta (8%)</b></td><td class="neg">-${S(sel.impRenta5ta)}</td></tr><tr class="total-row"><td><b>NETO A PAGAR</b></td><td><b>${S(sel.netoPagable)}</b></td></tr></table>`;
                exportPDF(`Boleta de Pago — ${sel.trabajador.nombres} ${sel.trabajador.apellidos}`, html);
              }}>📄 Imprimir Boleta</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: ÓRDENES
// ============================================================
function Ordenes({data,setData,toast}) {
  const [tab,setTab]=useState("todos"); const [sel,setSel]=useState(null);
  const [modal,setModal]=useState(false);
  const [form,setForm]=useState({codigo:"",cliente:"",descripcion:"",tipo_servicio:"mantenimiento",fecha_inicio:"",horas_estimadas:""});
  const [saving,setSaving]=useState(false);
  const CLIENTES=["Sociedad Minera Cerro Verde (SMCV)","Southern Copper Corporation","Komatsu Mitsui Maquinarias Perú"];

  const save=async()=>{
    if(!form.codigo||!form.descripcion){toast("Completa código y descripción","err");return;}
    setSaving(true);
    try {
      const nuevo={id:Date.now(),codigo:form.codigo,cliente_nombre:form.cliente||CLIENTES[0],descripcion:form.descripcion,tipo_servicio:form.tipo_servicio,fecha_inicio:form.fecha_inicio,fecha_fin:null,estado:"activo",horas_estimadas:+form.horas_estimadas||0,horas_ejecutadas:0};
      try{await apiFetch("/ordenes",{method:"POST",body:JSON.stringify(form)});}catch{}
      setData(d=>({...d,ordenes:[nuevo,...d.ordenes]}));
      toast("Orden de trabajo creada ✓");setModal(false);
    }catch{toast("Error al guardar","err");}
    setSaving(false);
  };
  const enviarResumen=(o)=>{
    const tpl = EMAIL_TEMPLATES.ot_resumen(o);
    sendMail("contacto@cliente.pe", tpl.subject, tpl.body);
    toast("Resumen de avance preparado para envío","info");
  };

  const filtered=data.ordenes.filter(o=>tab==="todos"||o.estado===tab);
  return(
    <div>
      <div className="scards">
        <SC icon="📋" label="Total OTs" value={data.ordenes.length} c="ac"/>
        <SC icon="🔄" label="Activas" value={data.ordenes.filter(o=>o.estado==="activo").length} c="grn"/>
        <SC icon="✅" label="Completadas" value={data.ordenes.filter(o=>o.estado==="completado").length} c="blu"/>
        <SC icon="⏱" label="H. Estimadas" value={data.ordenes.filter(o=>o.estado==="activo").reduce((s,o)=>s+(+o.horas_estimadas||0),0).toLocaleString()} sub="En órdenes activas" c="prp"/>
      </div>
      <div className="panel">
        <div className="bar">
          <div className="tabs">{["todos","activo","completado"].map(f=><button key={f} className={`tab ${tab===f?"on":""}`} onClick={()=>setTab(f)}>{f}</button>)}</div>
          <div style={{marginLeft:"auto"}}/><button className="btn bp sm" onClick={()=>setModal(true)}>+ Nueva OT</button>
        </div>
        <div className="tw">
          <table>
            <thead><tr><th>Código</th><th>Cliente</th><th>Descripción</th><th>Tipo</th><th>Inicio</th><th>Estado</th><th>Avance</th><th></th></tr></thead>
            <tbody>
              {filtered.map(o=>(
                <tr key={o.id}>
                  <td><span className="mono" style={{color:"var(--ac)"}}>{o.codigo}</span></td>
                  <td style={{fontSize:11.5,maxWidth:140}}>{o.cliente_nombre.replace("Sociedad Minera ","").replace(" Corporation","").replace(" Mitsui Maquinarias Perú","")}</td>
                  <td style={{fontSize:11.5,maxWidth:180,color:"var(--t2)"}}>{o.descripcion.substring(0,46)}…</td>
                  <td><span className={`badge ${o.tipo_servicio}`}>{o.tipo_servicio}</span></td>
                  <td><span className="mono">{fmtShort(o.fecha_inicio)}</span></td>
                  <td><span className={`badge ${o.estado==="activo"?"activo-ot":o.estado}`}>{o.estado}</span></td>
                  <td style={{minWidth:110}}><PBar exec={o.horas_ejecutadas} est={o.horas_estimadas}/></td>
                  <td><button className="btn bg xs" onClick={()=>setSel(o)}>Ver</button></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0&&<div className="empty"><div className="empty-ic">📋</div><div className="empty-txt">Sin órdenes</div></div>}
        </div>
      </div>
      {sel&&(
        <div className="ov" onClick={()=>setSel(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mh"><div><div className="mt">{sel.codigo}</div><div className="msub">{sel.cliente_nombre}</div></div><button className="btn bg sm" onClick={()=>setSel(null)}>✕</button></div>
            <div className="dg">
              <div className="di"><div className="dl">Tipo</div><div className="dv"><span className={`badge ${sel.tipo_servicio}`}>{sel.tipo_servicio}</span></div></div>
              <div className="di"><div className="dl">Estado</div><div className="dv"><span className={`badge ${sel.estado==="activo"?"activo-ot":sel.estado}`}>{sel.estado}</span></div></div>
              <div className="di"><div className="dl">Inicio</div><div className="dv">{fmtDate(sel.fecha_inicio)}</div></div>
              <div className="di"><div className="dl">Fin</div><div className="dv">{sel.fecha_fin?fmtDate(sel.fecha_fin):"En curso"}</div></div>
              <div className="di"><div className="dl">H. Estimadas</div><div className="dv mono">{sel.horas_estimadas}h</div></div>
              <div className="di"><div className="dl">H. Ejecutadas</div><div className="dv mono">{sel.horas_ejecutadas}h</div></div>
            </div>
            <div style={{padding:"0 20px 14px"}}>
              <div className="sd">Descripción</div>
              <p style={{fontSize:12,color:"var(--t2)",lineHeight:1.6}}>{sel.descripcion}</p>
              <div style={{marginTop:14}}><div className="sd">Avance</div><PBar exec={sel.horas_ejecutadas} est={sel.horas_estimadas} h={6}/></div>
              <div style={{marginTop:14}}><div className="sd">Tareos Asociados</div>
                {data.tareos.filter(t=>t.ot_codigo===sel.codigo).slice(0,6).map((t,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--b1)"}}>
                    <span style={{fontSize:11}}>{t.trabajador_nombre?.split(" ").slice(-2).join(" ")}</span>
                    <div style={{display:"flex",gap:8}}><span className="mono">{fmtShort(t.fecha)}</span><span className="mono">{(+t.horas_normales||0)+(+t.horas_extras||0)}h</span><span className={`badge ${t.estado}`}>{t.estado}</span></div>
                  </div>
                ))}
                {data.tareos.filter(t=>t.ot_codigo===sel.codigo).length===0&&<div style={{fontSize:12,color:"var(--t3)"}}>Sin tareos</div>}
              </div>
            </div>
            <div className="mf"><button className="btn bg" onClick={()=>setSel(null)}>Cerrar</button><button className="btn bblu" onClick={()=>enviarResumen(sel)}>✉️ Enviar resumen</button></div>
          </div>
        </div>
      )}
      {modal&&(
        <div className="ov" onClick={()=>setModal(false)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div className="mh"><div><div className="mt">Nueva Orden de Trabajo</div><div className="msub">Registro de servicio</div></div><button className="btn bg sm" onClick={()=>setModal(false)}>✕</button></div>
            <div className="mb">
              <div className="fg2"><div className="fg"><label>Código *</label><input placeholder="OT-2026-006" value={form.codigo} onChange={e=>setForm({...form,codigo:e.target.value})}/></div><div className="fg"><label>Tipo</label><select value={form.tipo_servicio} onChange={e=>setForm({...form,tipo_servicio:e.target.value})}>{["mantenimiento","limpieza","outsourcing","residuos","sst"].map(t=><option key={t}>{t}</option>)}</select></div></div>
              <div className="fg"><label>Cliente</label><select value={form.cliente} onChange={e=>setForm({...form,cliente:e.target.value})}><option value="">Seleccionar…</option>{CLIENTES.map(c=><option key={c} value={c}>{c}</option>)}</select></div>
              <div className="fg"><label>Descripción *</label><textarea value={form.descripcion} onChange={e=>setForm({...form,descripcion:e.target.value})}/></div>
              <div className="fg2"><div className="fg"><label>Fecha Inicio</label><input type="date" value={form.fecha_inicio} onChange={e=>setForm({...form,fecha_inicio:e.target.value})}/></div><div className="fg"><label>H. Estimadas</label><input type="number" min="0" value={form.horas_estimadas} onChange={e=>setForm({...form,horas_estimadas:e.target.value})}/></div></div>
            </div>
            <div className="mf"><button className="btn bg" onClick={()=>setModal(false)}>Cancelar</button><button className="btn bp" onClick={save} disabled={saving}>{saving?"Guardando…":"Crear OT"}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// PAGE: NOTIFICACIONES / CENTRO DE CORREO
// ============================================================
function Notificaciones({data, log, setLog, settings, setSettings, toast}) {
  const homs=data.homologaciones.map(h=>({...h,_d:h.dias_restantes!==undefined?h.dias_restantes:diasR(h.fecha_vencimiento)}));
  const pendientes = homs.filter(h=>h._d<=(settings.diasAnticipacion||30));

  const enviarTodas=()=>{
    pendientes.forEach((h,i)=>{
      setTimeout(()=>{
        const t = data.trabajadores.find(w=>w.dni===h.dni);
        setLog(l=>[{id:Date.now()+i, ts:new Date(), to: t?.email||"rrhh@certecd.pe", subject: h._d<0?`Documento vencido — ${h.trabajador}`:`Por vencer — ${h.trabajador}`, estado:"enviado", tipo: h._d<0?"vencido":"por_vencer"}, ...l]);
      }, i*120);
    });
    toast(`Procesando ${pendientes.length} notificaciones automáticas…`,"info");
  };

  const enviarUna=(h)=>{
    const t = data.trabajadores.find(w=>w.dni===h.dni);
    const tpl = h._d<0 ? EMAIL_TEMPLATES.doc_vencido(h) : EMAIL_TEMPLATES.doc_por_vencer(h);
    sendMail(t?.email||"rrhh@certecd.pe", tpl.subject, tpl.body);
    setLog(l=>[{id:Date.now(), ts:new Date(), to:t?.email||"rrhh@certecd.pe", subject:tpl.subject, estado:"enviado", tipo:h._d<0?"vencido":"por_vencer"}, ...l]);
    toast("Correo abierto en tu cliente de email","ok");
  };

  return(
    <div>
      <div className="info-box law">📧 <b>Centro de Notificaciones Automáticas</b> · El sistema detecta documentos próximos a vencer y genera el correo listo para enviar a través de tu cliente de correo (Gmail/Outlook). Configura la anticipación y el destinatario por defecto abajo.</div>
      <div className="scards">
        <SC icon="📤" label="Pendientes de Notificar" value={pendientes.length} sub="Según configuración actual" c="ylw"/>
        <SC icon="✅" label="Enviadas (sesión)" value={log.length} sub="Registro local" c="grn"/>
        <SC icon="⏰" label="Anticipación" value={`${settings.diasAnticipacion}d`} sub="Antes del vencimiento" c="ac"/>
        <SC icon="📮" label="Destino RRHH" value={settings.correoRRHH?.split("@")[0]||"—"} sub={settings.correoRRHH} c="blu"/>
      </div>

      <div className="g2">
        <div className="panel">
          <div className="ph"><div className="pt">⚙️ Configuración de Alertas</div></div>
          <div className="mb">
            <div className="switch-row">
              <div><div className="switch-lbl">Alertas automáticas activas</div><div className="switch-sub">Detecta vencimientos al cargar el sistema</div></div>
              <button className="tgl" onClick={()=>setSettings(s=>({...s,activo:!s.activo}))} style={{background:settings.activo?"var(--ac)":"var(--b2)"}}>
                <span style={{position:"absolute",top:3,width:16,height:16,borderRadius:"50%",background:"#fff",left:settings.activo?19:3,transition:"left .2s"}}/>
              </button>
            </div>
            <div className="fg" style={{marginTop:6}}>
              <label>Días de anticipación para alertar</label>
              <select value={settings.diasAnticipacion} onChange={e=>setSettings(s=>({...s,diasAnticipacion:+e.target.value}))}>
                <option value={7}>7 días antes</option>
                <option value={15}>15 días antes</option>
                <option value={30}>30 días antes</option>
                <option value={45}>45 días antes</option>
              </select>
            </div>
            <div className="fg">
              <label>Correo por defecto de RRHH</label>
              <input value={settings.correoRRHH} onChange={e=>setSettings(s=>({...s,correoRRHH:e.target.value}))} placeholder="rrhh@certecd.pe"/>
            </div>
            <button className="btn bp" style={{marginTop:6}} onClick={enviarTodas} disabled={pendientes.length===0}>
              ✉️ Notificar todas las pendientes ({pendientes.length})
            </button>
          </div>
        </div>

        <div className="panel">
          <div className="ph"><div className="pt">📋 Documentos Pendientes de Notificar</div><div className="pm">{pendientes.length} en cola</div></div>
          <div className="al-list" style={{maxHeight:260,overflowY:"auto"}}>
            {pendientes.slice(0,15).map((h,i)=>(
              <div key={i} className={`al ${h._d<0?"c":"w"}`}>
                <span className="al-ic">{h._d<0?"🚨":"⚠️"}</span>
                <div style={{flex:1,minWidth:0}}><div className="al-n">{h.trabajador}</div><div className="al-d">{h.tipo_documento}</div></div>
                <div className={`al-day ${h._d<0?"c":"w"}`}>{diasLbl(h._d)}</div>
                <button className="btn bg xs" onClick={()=>enviarUna(h)}>✉️</button>
              </div>
            ))}
            {pendientes.length===0&&<div className="empty"><div className="empty-ic">✅</div><div className="empty-txt">Sin pendientes</div></div>}
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="ph"><div className="pt">🕐 Historial de Notificaciones Enviadas</div><div className="pm">{log.length} registros</div></div>
        <div className="tw">
          <table>
            <thead><tr><th>Fecha/Hora</th><th>Destinatario</th><th>Asunto</th><th>Tipo</th><th>Estado</th></tr></thead>
            <tbody>
              {log.slice(0,30).map(l=>(
                <tr key={l.id}>
                  <td><span className="mono" style={{fontSize:10}}>{fmtDateTime(l.ts)}</span></td>
                  <td style={{fontSize:11.5}}>{l.to}</td>
                  <td style={{fontSize:11.5,maxWidth:280}}>{l.subject}</td>
                  <td><span className={`badge ${l.tipo}`}>{l.tipo?.replace("_"," ")}</span></td>
                  <td><span className="badge enviado">{l.estado}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {log.length===0&&<div className="empty"><div className="empty-ic">📭</div><div className="empty-txt">Aún no se ha enviado ninguna notificación esta sesión</div></div>}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// PAGE: REPORTES
// ============================================================
function Reportes({data}) {
  const totalHN=data.tareos.reduce((s,t)=>s+(+t.horas_normales||0),0);
  const totalHE=data.tareos.reduce((s,t)=>s+(+t.horas_extras||0),0);
  const porTrab=data.trabajadores.map(w=>{
    const ts=data.tareos.filter(t=>t.dni===w.dni);
    const hn=ts.reduce((s,t)=>s+(+t.horas_normales||0),0);
    const he=ts.reduce((s,t)=>s+(+t.horas_extras||0),0);
    return {...w,hn,he,total:hn+he,dias:ts.length};
  }).filter(w=>w.total>0).sort((a,b)=>b.total-a.total);
  const porOT=data.ordenes.map(o=>{
    const ts=data.tareos.filter(t=>t.ot_codigo===o.codigo);
    return {...o,hT:ts.reduce((s,t)=>s+(+t.horas_normales||0)+(+t.horas_extras||0),0),nW:[...new Set(ts.map(t=>t.trabajador_nombre))].length};
  }).filter(o=>o.hT>0);
  const maxH=Math.max(...porTrab.map(w=>w.total),1);
  const homs=data.homologaciones.map(h=>({...h,_d:h.dias_restantes!==undefined?h.dias_restantes:diasR(h.fecha_vencimiento)}));

  const doExportPDF=()=>{
    const rowsTrab = porTrab.map((w,i)=>`<tr><td>${i+1}</td><td>${w.nombres} ${w.apellidos}</td><td>${w.cargo_nombre}</td><td>${w.dias}</td><td>${w.hn}h</td><td>${w.he}h</td><td><b>${w.total}h</b></td></tr>`).join("");
    const rowsOT = porOT.map(o=>`<tr><td>${o.codigo}</td><td>${o.cliente_nombre}</td><td>${o.tipo_servicio}</td><td>${o.nW}</td><td>${o.hT}h</td><td>${pct(o.hT,o.horas_estimadas)}%</td></tr>`).join("");
    exportPDF("Reporte de Horas-Hombre y Valorización", `
      <h2>Ranking de horas por trabajador</h2>
      <table><thead><tr><th>#</th><th>Trabajador</th><th>Cargo</th><th>Días</th><th>H.Norm</th><th>H.Extra</th><th>Total</th></tr></thead><tbody>${rowsTrab}</tbody></table>
      <h2>Valorización por orden de trabajo</h2>
      <table><thead><tr><th>OT</th><th>Cliente</th><th>Tipo</th><th>Trabajadores</th><th>Horas</th><th>% Ejecutado</th></tr></thead><tbody>${rowsOT}</tbody></table>
    `);
  };

  return(
    <div>
      <div className="scards">
        <SC icon="⏱" label="H-H Total" value={totalHN+totalHE} sub="Período actual" c="ac"/>
        <SC icon="🕐" label="H. Normales" value={totalHN} sub={`${(totalHN+totalHE)?Math.round(totalHN/(totalHN+totalHE)*100):0}%`} c="grn"/>
        <SC icon="⚡" label="H. Extras" value={totalHE} sub={`${(totalHN+totalHE)?Math.round(totalHE/(totalHN+totalHE)*100):0}%`} c="ylw"/>
        <SC icon="👷" label="Activos c/Tareo" value={porTrab.length} c="blu"/>
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <button className="btn bp sm" onClick={doExportPDF}>📄 Exportar Reporte PDF</button>
      </div>
      <div className="g2">
        <div className="panel">
          <div className="ph"><div className="pt">🏆 Ranking H-H por Trabajador</div><div className="pm">Mayo 2026</div></div>
          <div style={{padding:"14px 18px"}}>
            {porTrab.map((w,i)=>(
              <div key={w.id} style={{marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5,alignItems:"center"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)",width:18,fontWeight:700}}>{i+1}</span>
                    <WCell nombre={`${w.nombres} ${w.apellidos}`} sub={w.cargo_nombre}/>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>{w.he>0&&<span className="badge por_vencer">+{w.he}e</span>}<span className="mono" style={{fontWeight:700,fontSize:13}}>{w.total}h</span></div>
                </div>
                <div className="pb" style={{height:5}}><div className="pf" style={{width:`${(w.total/maxH)*100}%`,height:5,background:`linear-gradient(90deg,var(--ac),var(--blu))`}}/></div>
              </div>
            ))}
            {porTrab.length===0&&<div className="empty"><div>Sin datos</div></div>}
          </div>
        </div>
        <div className="panel">
          <div className="ph"><div className="pt">📋 Valorización por OT</div></div>
          <div style={{padding:"14px 18px"}}>
            {porOT.map(o=>(
              <div key={o.id} style={{paddingBottom:13,borderBottom:"1px solid var(--b1)",marginBottom:13}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <div>
                    <span className="mono" style={{color:"var(--ac)",fontSize:10,display:"block",marginBottom:2}}>{o.codigo}</span>
                    <span style={{fontSize:12,fontWeight:600}}>{o.cliente_nombre.replace("Sociedad Minera ","").replace(" Corporation","")}</span>
                    <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginTop:2}}>{o.nW} trabajadores · <span className={`badge ${o.tipo_servicio}`}>{o.tipo_servicio}</span></div>
                  </div>
                  <div style={{textAlign:"right"}}><div className="mono" style={{fontSize:17,fontWeight:700}}>{o.hT}h</div><div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)"}}>{pct(o.hT,o.horas_estimadas)}% ejec.</div></div>
                </div>
                <PBar exec={o.hT} est={o.horas_estimadas} h={4}/>
              </div>
            ))}
            {porOT.length===0&&<div className="empty"><div>Sin datos</div></div>}
          </div>
          <div style={{padding:"12px 18px",borderTop:"1px solid var(--b1)",display:"flex",justifyContent:"space-between",background:"var(--bg3)"}}>
            <span style={{fontFamily:"var(--mono)",fontSize:10,color:"var(--t3)",textTransform:"uppercase",letterSpacing:1}}>Total H-H Facturables</span>
            <span style={{fontFamily:"var(--mono)",fontSize:20,fontWeight:800,color:"var(--ac)"}}>{totalHN+totalHE}h</span>
          </div>
        </div>
      </div>
      <div className="panel">
        <div className="ph"><div className="pt">📊 Estado de Homologaciones</div></div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))"}}>
          {[
            {l:"Total documentos",v:homs.length,c:"var(--t1)"},
            {l:"Vencidos",v:homs.filter(h=>h._d<0).length,c:"var(--red)"},
            {l:"Por vencer ≤30d",v:homs.filter(h=>h._d>=0&&h._d<=30).length,c:"var(--ylw)"},
            {l:"Vigentes",v:homs.filter(h=>h._d>30).length,c:"var(--grn)"},
          ].map((s,i)=>(
            <div key={i} style={{padding:"18px 20px",borderRight:i<3?"1px solid var(--b1)":"none",textAlign:"center"}}>
              <div style={{fontFamily:"var(--mono)",fontSize:9,color:"var(--t3)",marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>{s.l}</div>
              <div style={{fontSize:32,fontWeight:800,color:s.c}}>{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// LOGIN
// ============================================================
function Login({onLogin,dark,setDark}) {
  const [form,setForm]=useState({username:"admin",password:"admin123"});
  const [loading,setLoading]=useState(false);
  const [err,setErr]=useState("");
  const USERS={
    admin:{nombre:"Administrador Sistema",rol:"admin",pass:"admin123"},
    rrhh:{nombre:"Área de RRHH",rol:"rrhh",pass:"rrhh123"},
    supervisor1:{nombre:"Supervisor de Campo",rol:"supervisor",pass:"sup123"},
    dayna:{nombre:"Dayna R. Rojas Chavez",rol:"admin",pass:"ti2026"},
  };
  const go=async()=>{
    setErr("");setLoading(true);
    const ok=await apiLogin(form.username,form.password);
    if(ok){onLogin({username:form.username,...(USERS[form.username]||{nombre:form.username,rol:"operador"}),apiOk:true});return;}
    setTimeout(()=>{
      const u=USERS[form.username];
      if(u&&u.pass===form.password){onLogin({username:form.username,...u,apiOk:false});}
      else{setErr("Usuario o contraseña incorrectos");setLoading(false);}
    },500);
  };
  return(
    <div className="lw">
      <div style={{position:"fixed",top:20,right:20,zIndex:10}}><button className="btn bg sm" onClick={()=>setDark(d=>!d)}>{dark?"☀️ Modo Claro":"🌙 Modo Oscuro"}</button></div>
      <div className="lcard">
        <div className="l-brand"><div className="l-logo">C</div><div><div className="l-name">CERTECD</div><div className="l-sub">SGPM · Sistema de Gestión de Personal Minero</div></div></div>
        <div className="l-stripe">🔐 ACCESO RESTRINGIDO · PERSONAL AUTORIZADO · v1.1.0</div>
        <div className="l-form">
          {err&&<div className="lerr">❌ {err}</div>}
          <div className="fg"><label>Usuario</label><input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} autoComplete="username" onKeyDown={e=>e.key==="Enter"&&go()}/></div>
          <div className="fg"><label>Contraseña</label><input type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} onKeyDown={e=>e.key==="Enter"&&go()} autoComplete="current-password"/></div>
          <button className="btn bp" style={{width:"100%",justifyContent:"center",padding:"12px",fontSize:13}} onClick={go} disabled={loading}>{loading?"Verificando acceso…":"Ingresar al Sistema →"}</button>
        </div>
        <div className="l-hint">admin / admin123 · rrhh / rrhh123<br/>supervisor1 / sup123 · dayna / ti2026</div>
      </div>
    </div>
  );
}

// ============================================================
// APP ROOT
// ============================================================
const NAV=[
  {id:"dashboard",label:"Dashboard",icon:"▦",sec:"PRINCIPAL"},
  {id:"trabajadores",label:"Personal",icon:"👥",sec:"GESTIÓN",bt:"y",bf:(d)=>d.trabajadores.filter(w=>w.estado==="inactivo").length},
  {id:"homologaciones",label:"Homologaciones",icon:"📋",bt:"r",bf:(d)=>d.homologaciones.filter(h=>(h.dias_restantes??0)<0).length},
  {id:"tareos",label:"Tareos",icon:"⏱",bt:"y",bf:(d)=>d.tareos.filter(t=>t.estado==="registrado").length},
  {id:"ordenes",label:"Órdenes de Trabajo",icon:"🔧"},
  {id:"planillas",label:"Planillas",icon:"💰",sec:"NÓMINA",bt:"g",bf:(d)=>d.trabajadores.filter(w=>w.estado==="activo").length},
  {id:"notificaciones",label:"Notificaciones",icon:"📧",sec:"COMUNICACIÓN",bt:"r",bf:(d)=>d.homologaciones.filter(h=>(h.dias_restantes??0)<=7).length},
  {id:"reportes",label:"Reportes",icon:"📊",sec:"ANÁLISIS"},
];
const TITLES={dashboard:"Dashboard General",trabajadores:"Gestión de Personal",homologaciones:"Control de Homologaciones",tareos:"Registro de Tareos",ordenes:"Órdenes de Trabajo",planillas:"Planillas y Boletas",notificaciones:"Centro de Notificaciones",reportes:"Reportes y Valorización"};

export default function App() {
  const [dark,setDark]=useState(true);
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("dashboard");
  const [data,setData]=useState(MOCK);
  const [apiOk,setApiOk]=useState(false);
  const [toast,setToast]=useState(null);
  const [mailLog,setMailLog]=useState([]);
  const [mailSettings,setMailSettings]=useState({activo:true,diasAnticipacion:30,correoRRHH:"rrhh@certecd.pe"});
  const [showBell,setShowBell]=useState(false);
  const tRef=useRef(null);

  const showToast=useCallback((msg,type="ok")=>{
    setToast({msg,type});
    clearTimeout(tRef.current);
    tRef.current=setTimeout(()=>setToast(null),3500);
  },[]);

  useEffect(()=>{
    if(!user)return;
    (async()=>{
      try{
        const d=await loadBD();
        setData(d);setApiOk(true);
        showToast("✅ Conectado a la base de datos PostgreSQL","ok");
      }catch{
        setApiOk(false);
        showToast("📶 Modo offline — usando datos de ejemplo","info");
      }
    })();
  },[user]);

  const handleSendAlert=(h)=>{
    const t = data.trabajadores.find(w=>w.dni===h.dni);
    const tpl = (h.dias_restantes??0)<0 ? EMAIL_TEMPLATES.doc_vencido(h) : EMAIL_TEMPLATES.doc_por_vencer(h);
    sendMail(t?.email||mailSettings.correoRRHH, tpl.subject, tpl.body);
    setMailLog(l=>[{id:Date.now(), ts:new Date(), to:t?.email||mailSettings.correoRRHH, subject:tpl.subject, estado:"enviado", tipo:(h.dias_restantes??0)<0?"vencido":"por_vencer"}, ...l]);
    showToast("Cliente de correo abierto","ok");
  };

  if(!user)return(<><style>{mkCSS(dark)}</style><Login onLogin={setUser} dark={dark} setDark={setDark}/></>);

  const homsAll = data.homologaciones.map(h=>({...h,_d:h.dias_restantes!==undefined?h.dias_restantes:diasR(h.fecha_vencimiento)}));
  const bellAlerts = homsAll.filter(h=>h._d<=7).slice(0,8);

  let lastSec=null;
  return(
    <>
      <style>{mkCSS(dark)}</style>
      <div className="app">
        <nav className="sb">
          <div className="sb-top">
            <div className="sb-brand"><div className="sb-logo">C</div><div><div className="sb-name">CERTECD</div><div className="sb-ver">SGPM v1.1.0</div></div></div>
            <div className="sb-status"><div className="conn-pill"><div className={`cd ${apiOk?"ok":"off"}`}/><span style={{color:apiOk?"var(--grn)":"var(--ylw)"}}>{apiOk?"BD conectada":"Modo offline"}</span></div></div>
          </div>
          <div className="nav">
            {NAV.map(item=>{
              const showSec=item.sec&&item.sec!==lastSec;
              if(showSec)lastSec=item.sec;
              const cnt=item.bf?item.bf(data):0;
              return(
                <div key={item.id}>
                  {showSec&&<div className="ns">{item.sec}</div>}
                  <div className={`ni ${page===item.id?"on":""}`} onClick={()=>setPage(item.id)}>
                    <span className="ni-ic">{item.icon}</span><span>{item.label}</span>
                    {cnt>0&&<span className={`nb ${item.bt}`}>{cnt}</span>}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="sb-bot">
            <div className="ucard">
              <div className="uav">{inits(user.nombre)}</div>
              <div style={{flex:1,minWidth:0}}><div className="un" style={{overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.nombre}</div><div className="ur">{user.rol}</div></div>
              <button className="btn bg xs" onClick={()=>{setUser(null);JWT=null;}} title="Salir">↩</button>
            </div>
          </div>
        </nav>
        <main className="main">
          <div className="topbar">
            <div className="topbar-l"><div style={{fontSize:11,color:"var(--t3)"}}>CERTECD</div><div style={{color:"var(--t3)",fontSize:11}}>/</div><div className="page-title">{TITLES[page]}</div></div>
            <div className="topbar-r" style={{position:"relative"}}>
              <div className="bell" onClick={()=>setShowBell(v=>!v)}>🔔{bellAlerts.length>0&&<span className="bell-dot"/>}</div>
              {showBell&&(
                <div className="popover" onMouseLeave={()=>setShowBell(false)}>
                  <div className="pv-hd"><b style={{fontSize:12}}>Alertas críticas</b><span className="mono" style={{fontSize:10,color:"var(--t3)"}}>{bellAlerts.length}</span></div>
                  {bellAlerts.length>0?bellAlerts.map((h,i)=>(
                    <div key={i} className="pv-item">
                      <span style={{fontSize:14}}>{h._d<0?"🚨":"⚠️"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:11.5,fontWeight:600}}>{h.trabajador}</div>
                        <div style={{fontSize:10,color:"var(--t3)",fontFamily:"var(--mono)"}}>{h.tipo_documento} · {diasLbl(h._d)}</div>
                      </div>
                    </div>
                  )):<div style={{padding:20,textAlign:"center",fontSize:11.5,color:"var(--t3)"}}>Sin alertas críticas</div>}
                  <div style={{padding:10}}><button className="btn bp sm" style={{width:"100%",justifyContent:"center"}} onClick={()=>{setPage("notificaciones");setShowBell(false);}}>Ir a Notificaciones</button></div>
                </div>
              )}
              <button className="tgl" onClick={()=>setDark(d=>!d)} title={dark?"Modo claro":"Modo oscuro"}/>
              <div className="topbar-sep"/>
              <div className="topbar-date">{new Date().toLocaleDateString("es-PE",{weekday:"short",day:"2-digit",month:"short",year:"numeric"})}</div>
            </div>
          </div>
          <div className="page">
            {page==="dashboard"&&<Dashboard data={data} onSendAlert={handleSendAlert}/>}
            {page==="trabajadores"&&<Trabajadores data={data} setData={setData} toast={showToast}/>}
            {page==="homologaciones"&&<Homologaciones data={data} setData={setData} toast={showToast}/>}
            {page==="tareos"&&<Tareos data={data} setData={setData} toast={showToast}/>}
            {page==="ordenes"&&<Ordenes data={data} setData={setData} toast={showToast}/>}
            {page==="planillas"&&<Planillas data={data} toast={showToast}/>}
            {page==="notificaciones"&&<Notificaciones data={data} log={mailLog} setLog={setMailLog} settings={mailSettings} setSettings={setMailSettings} toast={showToast}/>}
            {page==="reportes"&&<Reportes data={data}/>}
          </div>
        </main>
        {toast&&(<div className={`toast ${toast.type}`}><span>{toast.type==="ok"?"✅":toast.type==="err"?"❌":"📶"}</span><span>{toast.msg}</span></div>)}
      </div>
    </>
  );
}

import React, { useMemo, useState } from "react";
import {
  Inbox, FileCheck2, Send, ShieldAlert, FileQuestion, MessageSquare,
  Clock, AlertTriangle, ChevronDown, ChevronRight, Search, X, Check,
  ArrowRight, Plus, Download, Eye, MoreHorizontal, Sparkles, MapPin,
  TrendingUp, TrendingDown, Landmark, Filter, CalendarClock, ListChecks,
  FileText, Gavel, Users, CheckCircle2, Circle, Bell, RefreshCw,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type EstadoSLA = "estandar" | "limite" | "fuera";
type AccionTipo = "apercibimiento" | "despachese" | "fuerza_publica" | "previo" | "consulta";

interface WorkItem {
  id: string;
  rol: string;
  deudor: string;
  tribunal: string;
  mandante: string;
  cuantia: number;
  exhorto: boolean;
  tribunalExhortado?: string;
  estado: EstadoSLA;
  accionTipo: AccionTipo;
  plazo?: string;
  plazoUrgente?: boolean;
  autor?: string;
  detalle?: string;
}

interface CaseRow {
  id: string;
  rol: string;
  debtorRut: string;
  deudor: string;
  tribunal: string;
  etapa: string;
  cuantia: number;
  exhorto: boolean;
  estado: EstadoSLA;
  mandante: string;
}

interface HistItem {
  fecha: string;
  autor: string;
  texto: string;
  tipo: "observacion" | "consulta" | "respuesta" | "accion";
}

interface DocItem {
  id: string;
  tipo: string;
  rol: string;
  deudor: string;
  estado: "pendiente" | "visacion" | "visado" | "presentado";
  fecha: string;
}

// ─── Datos simulados ────────────────────────────────────────────────────────

const CARTERA = { total: 248, estandar: 199, limite: 30, fuera: 19 };
const COMPARATIVO_EQUIPO = { estandarDeltaPct: 3, fueraDeltaPct: -2 };

const ACCION_META: Record<AccionTipo, { label: string; icon: React.ElementType; actionLabel: string; hint: string }> = {
  apercibimiento: { label: "Acompañar documentos", icon: FileCheck2, actionLabel: "Marcar entregado", hint: "Apercibimiento — poder o título" },
  despachese: { label: "Encargar receptor", icon: Send, actionLabel: "Asignar receptor", hint: "Demanda proveída (despáchese)" },
  fuerza_publica: { label: "Solicitar fuerza pública", icon: ShieldAlert, actionLabel: "Generar escrito", hint: "Oposición al retiro registrada" },
  previo: { label: "Cumplir lo ordenado", icon: FileQuestion, actionLabel: "Revisar y responder", hint: "Previo a proveer del tribunal" },
  consulta: { label: "Responder consulta", icon: MessageSquare, actionLabel: "Responder", hint: "Consulta de jefatura sobre la causa" },
};

const ESTADO_META: Record<EstadoSLA, { label: string; dot: string; bg: string; text: string; border: string }> = {
  estandar: { label: "Dentro de estándar", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  limite: { label: "Límite de estándar", dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  fuera: { label: "Fuera de estándar", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
};

const WORK_ITEMS: WorkItem[] = [
  { id: "w1", rol: "C-7199-2026", deudor: "Roberto Martínez Silva", tribunal: "2° Juzgado Civil Santiago", mandante: "BFN", cuantia: 89200000, exhorto: false, estado: "fuera", accionTipo: "apercibimiento", plazo: "Hoy 18:00", plazoUrgente: true },
  { id: "w2", rol: "C-3211-2026", deudor: "Alejandro Vásquez Moreno", tribunal: "1° Juzgado Civil Puente Alto", mandante: "ITAU", cuantia: 6200000, exhorto: false, estado: "fuera", accionTipo: "apercibimiento", plazo: "Hoy 18:00", plazoUrgente: true },
  { id: "w3", rol: "C-9187-2026", deudor: "Jorge Salinas Bravo", tribunal: "4° Juzgado Civil Santiago", mandante: "BFN", cuantia: 12800000, exhorto: true, tribunalExhortado: "Juzgado de Letras de Rancagua", estado: "limite", accionTipo: "apercibimiento", plazo: "Mañana 12:00" },
  { id: "w4", rol: "C-6812-2026", deudor: "Inversiones Torres SpA", tribunal: "3° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 45800000, exhorto: false, estado: "estandar", accionTipo: "despachese", plazo: "Vie 12:00" },
  { id: "w5", rol: "C-5541-2026", deudor: "María Isabel Rojas Vega", tribunal: "2° Juzgado Civil Santiago", mandante: "SANTANDER", cuantia: 8750000, exhorto: false, estado: "estandar", accionTipo: "despachese", plazo: "Vie 12:00" },
  { id: "w6", rol: "C-4820-2026", deudor: "Pedro Andrés Muñoz Riquelme", tribunal: "1° Juzgado Civil Santiago", mandante: "BCI", cuantia: 18200000, exhorto: true, tribunalExhortado: "Juzgado de Letras de Talca", estado: "estandar", accionTipo: "despachese", plazo: "Lun 10:00" },
  { id: "w7", rol: "C-3914-2026", deudor: "Comercial Andina Ltda.", tribunal: "5° Juzgado Civil Santiago", mandante: "CHILE", cuantia: 32100000, exhorto: false, estado: "limite", accionTipo: "fuerza_publica", plazo: "Mañana 09:00" },
  { id: "w8", rol: "C-2891-2025", deudor: "Soc. Constructora Sur S.A.", tribunal: "7° Juzgado Civil Santiago", mandante: "BFN", cuantia: 156000000, exhorto: false, estado: "limite", accionTipo: "fuerza_publica", plazo: "Mañana 09:00" },
  { id: "w9", rol: "C-6650-2026", deudor: "Enrique Paredes Núñez", tribunal: "3° Juzgado Civil Santiago", mandante: "SANTANDER", cuantia: 27400000, exhorto: false, estado: "estandar", accionTipo: "fuerza_publica", plazo: "Lun 09:00" },
  { id: "w10", rol: "C-4477-2026", deudor: "Patricio Lemus Ortiz", tribunal: "8° Juzgado Civil Santiago", mandante: "CHILE", cuantia: 18300000, exhorto: false, estado: "fuera", accionTipo: "previo", plazo: "Hoy 17:00", plazoUrgente: true, detalle: "Previo a proveer: aclare el monto de la demanda y acompañe liquidación de saldo insoluto." },
  { id: "w11", rol: "C-9004-2026", deudor: "Francisca Yáñez Soto", tribunal: "2° Juzgado Civil Santiago", mandante: "BFN", cuantia: 15200000, exhorto: false, estado: "limite", accionTipo: "previo", plazo: "Mañana 12:00", detalle: "Previo a proveer: señale cuántas cuotas se pagaron y descuente intereses." },
  { id: "w12", rol: "C-2755-2025", deudor: "Marcelo Iturra Peña", tribunal: "1° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 6400000, exhorto: false, estado: "fuera", accionTipo: "consulta", plazo: "Hoy", plazoUrgente: true, autor: "Claudia (jefatura)", detalle: "¿Por qué este caso está detenido? No hay movimiento hace 20 días." },
  { id: "w13", rol: "C-2999-2025", deudor: "Valentina Cortés Muñoz", tribunal: "6° Juzgado Civil Santiago", mandante: "CHILE", cuantia: 41200000, exhorto: false, estado: "limite", accionTipo: "consulta", autor: "Sergio (jefatura)", detalle: "¿Qué pasó con la última audiencia de este caso? El mandante está preguntando." },
];

const VENCIMIENTOS_CRITICOS = [
  { id: "v1", rol: "C-7199-2026", deudor: "Roberto Martínez Silva", accion: "Evacuar traslado", plazo: "Hoy 17:00", critico: true },
  { id: "v2", rol: "C-4477-2026", deudor: "Patricio Lemus Ortiz", accion: "Responder excepción", plazo: "Hoy 18:00", critico: true },
  { id: "v3", rol: "C-3211-2026", deudor: "Alejandro Vásquez Moreno", accion: "Apercibimiento: tener por no presentada", plazo: "Hoy 18:00", critico: true },
  { id: "v4", rol: "C-9187-2026", deudor: "Jorge Salinas Bravo", accion: "Acompañar título original", plazo: "Vie 09:00", critico: false },
];

const CASES: CaseRow[] = [
  { id: "c1", rol: "C-8421-2026", debtorRut: "12.345.678-9", deudor: "Carlos González Pérez", tribunal: "2° Juzgado Civil Santiago", etapa: "Notificación", cuantia: 21540000, exhorto: false, estado: "fuera", mandante: "BFN" },
  { id: "c2", rol: "C-7199-2026", debtorRut: "8.912.311-K", deudor: "Roberto Martínez Silva", tribunal: "2° Juzgado Civil Santiago", etapa: "Embargo pendiente", cuantia: 89200000, exhorto: false, estado: "fuera", mandante: "BFN" },
  { id: "c3", rol: "C-6812-2026", debtorRut: "76.441.229-3", deudor: "Inversiones Torres SpA", tribunal: "3° Juzgado Civil Santiago", etapa: "Demanda en preparación", cuantia: 45800000, exhorto: false, estado: "limite", mandante: "ITAU" },
  { id: "c4", rol: "C-5541-2026", debtorRut: "14.221.009-1", deudor: "María Isabel Rojas Vega", tribunal: "2° Juzgado Civil Santiago", etapa: "Convenio de pago", cuantia: 8750000, exhorto: false, estado: "estandar", mandante: "SANTANDER" },
  { id: "c5", rol: "C-4820-2026", debtorRut: "11.891.005-8", deudor: "Pedro Muñoz Riquelme", tribunal: "1° Juzgado Civil Santiago", etapa: "Liquidación", cuantia: 18200000, exhorto: true, estado: "limite", mandante: "BCI" },
  { id: "c6", rol: "C-3914-2026", debtorRut: "77.112.443-0", deudor: "Comercial Andina Ltda.", tribunal: "5° Juzgado Civil Santiago", etapa: "Preparación remate", cuantia: 32100000, exhorto: false, estado: "limite", mandante: "CHILE" },
  { id: "c7", rol: "C-3211-2026", debtorRut: "13.440.882-7", deudor: "Alejandro Vásquez Moreno", tribunal: "1° Juzgado Civil Puente Alto", etapa: "Notificación pendiente", cuantia: 6200000, exhorto: false, estado: "fuera", mandante: "ITAU" },
  { id: "c8", rol: "C-2891-2025", debtorRut: "99.441.221-5", deudor: "Soc. Constructora Sur S.A.", tribunal: "7° Juzgado Civil Santiago", etapa: "Remate programado", cuantia: 156000000, exhorto: false, estado: "limite", mandante: "BFN" },
  { id: "c9", rol: "C-9004-2026", debtorRut: "10.221.884-5", deudor: "Francisca Yáñez Soto", tribunal: "2° Juzgado Civil Santiago", etapa: "Previo a proveer", cuantia: 15200000, exhorto: false, estado: "limite", mandante: "BFN" },
  { id: "c10", rol: "C-6650-2026", debtorRut: "9.884.221-0", deudor: "Enrique Paredes Núñez", tribunal: "3° Juzgado Civil Santiago", etapa: "Fuerza pública", cuantia: 27400000, exhorto: false, estado: "estandar", mandante: "SANTANDER" },
];

const HISTORIAL_MOCK: Record<string, HistItem[]> = {
  c1: [
    { fecha: "23/04/2025", autor: "Romina Fuentes", texto: "Este caso me tiene chata, no hay forma de ubicar al deudor.", tipo: "observacion" },
    { fecha: "14/06/2026", autor: "Sergio (jefatura)", texto: "¿Por qué este caso no se ha movido? El mandante está preguntando.", tipo: "consulta" },
    { fecha: "14/06/2026", autor: "Romina Fuentes", texto: "Se agotó la búsqueda de domicilio, solicité búsqueda negativa. Reintentando con nueva dirección del RNVM.", tipo: "respuesta" },
    { fecha: "10/07/2026", autor: "Sistema", texto: "Tribunal tuvo por acompañados documentos.", tipo: "accion" },
  ],
};

const DOCS: DocItem[] = [
  { id: "d1", tipo: "Solicitud fuerza pública", rol: "C-3914-2026", deudor: "Comercial Andina Ltda.", estado: "visacion", fecha: "Hoy 09:14" },
  { id: "d2", tipo: "Solicitud fuerza pública", rol: "C-2891-2025", deudor: "Soc. Constructora Sur S.A.", estado: "visacion", fecha: "Hoy 09:14" },
  { id: "d3", tipo: "Cumple lo ordenado", rol: "C-4477-2026", deudor: "Patricio Lemus Ortiz", estado: "pendiente", fecha: "Hoy 08:02" },
  { id: "d4", tipo: "Exhorto para retiro", rol: "C-9187-2026", deudor: "Jorge Salinas Bravo", estado: "visado", fecha: "Ayer 17:40" },
  { id: "d5", tipo: "Demanda ejecutiva · Pagaré", rol: "C-6812-2026", deudor: "Inversiones Torres SpA", estado: "presentado", fecha: "04/07/2026" },
  { id: "d6", tipo: "Ficha instrucción receptor", rol: "C-6812-2026", deudor: "Inversiones Torres SpA", estado: "presentado", fecha: "04/07/2026" },
  { id: "d7", tipo: "Acompaña documentos", rol: "C-7199-2026", deudor: "Roberto Martínez Silva", estado: "pendiente", fecha: "Hoy 08:40" },
];

const TIPOS_ESCRITO = ["Solicitud fuerza pública", "Encargo a receptor", "Exhorto para retiro", "Cumple lo ordenado", "Acompaña documentos"];

const METRICAS_MES = { demandas: 46, demandasDeltaPct: 12, notificaciones: 62, notificacionesDeltaPct: 8, embargos: 21, embargosDeltaPct: -4 };
const METRICAS_SEMANA = [
  { d: "Lun", demandas: 6, notificaciones: 9, embargos: 3 },
  { d: "Mar", demandas: 9, notificaciones: 11, embargos: 4 },
  { d: "Mié", demandas: 7, notificaciones: 8, embargos: 2 },
  { d: "Jue", demandas: 10, notificaciones: 14, embargos: 5 },
  { d: "Vie", demandas: 8, notificaciones: 12, embargos: 4 },
  { d: "Sáb", demandas: 3, notificaciones: 4, embargos: 1 },
  { d: "Dom", demandas: 3, notificaciones: 4, embargos: 2 },
];
const EQUIPO_COMPARATIVO = [
  { nombre: "Romina (tú)", pct: 80, tu: true },
  { nombre: "Andrea F.", pct: 77 },
  { nombre: "Matías S.", pct: 84 },
  { nombre: "Valentina L.", pct: 71 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function fCLP(n: number) { return "$" + (n / 1_000_000).toFixed(1) + "M"; }

function EstadoDot({ estado }: { estado: EstadoSLA }) {
  return <span className={`inline-block w-2.5 h-2.5 rounded-full shrink-0 ${ESTADO_META[estado].dot}`} />;
}

function EstadoBadge({ estado }: { estado: EstadoSLA }) {
  const m = ESTADO_META[estado];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${m.bg} ${m.text} border ${m.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{m.label}
    </span>
  );
}

const DOC_ESTADO_META: Record<DocItem["estado"], { label: string; bg: string; text: string }> = {
  pendiente: { label: "Pendiente generación", bg: "bg-gray-100", text: "text-gray-600" },
  visacion: { label: "Pendiente visación", bg: "bg-amber-50", text: "text-amber-700" },
  visado: { label: "Visado", bg: "bg-blue-50", text: "text-blue-700" },
  presentado: { label: "Presentado", bg: "bg-emerald-50", text: "text-emerald-700" },
};

// ─── Header azul unificado (título + búsqueda, notificaciones, sync, perfil) ─

export function ProcuradorHeader({
  email, title, subtitle, actions,
}: { email: string; title: string; subtitle?: string; actions?: React.ReactNode }) {
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="rounded-2xl border border-border p-5 space-y-4" style={{ background: "linear-gradient(120deg, #1755D4, #2E6FE0)" }}>
      <div className="flex items-center justify-end gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(255,255,255,0.65)" }} />
          <input
            placeholder="Buscar ROL, RUT, nombre..."
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg w-52 focus:outline-none text-white placeholder:text-white/50"
            style={{ backgroundColor: "rgba(255,255,255,0.14)" }}
          />
        </div>
        <button className="relative p-2 rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.85)" }}>
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-400" />
        </button>
        <button className="p-2 rounded-lg transition-colors hover:bg-white/10" style={{ color: "rgba(255,255,255,0.85)" }}>
          <RefreshCw className="w-4 h-4" />
        </button>
        <div className="w-px h-5 mx-1" style={{ backgroundColor: "rgba(255,255,255,0.2)" }} />
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold text-white" style={{ backgroundColor: "rgba(255,255,255,0.2)" }}>{initials}</div>
          <span className="text-xs text-white font-medium hidden sm:block">{email}</span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight leading-snug">{title}</h2>
          {subtitle && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

// ─── MiEscritorio ───────────────────────────────────────────────────────────

export function MiEscritorio({ onNavigate, userName = "Romina", email = "demo@abogado.cl" }: { onNavigate?: (view: string) => void; userName?: string; email?: string }) {
  const [items, setItems] = useState(WORK_ITEMS);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoSLA | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);
  const [colapsados, setColapsados] = useState<Set<AccionTipo>>(new Set());

  function toggleColapso(tipo: AccionTipo) {
    setColapsados(prev => {
      const next = new Set(prev);
      next.has(tipo) ? next.delete(tipo) : next.add(tipo);
      return next;
    });
  }

  const visibles = useMemo(
    () => (estadoFiltro ? items.filter(i => i.estado === estadoFiltro) : items),
    [items, estadoFiltro]
  );

  const grupos = useMemo(() => {
    const order: AccionTipo[] = ["apercibimiento", "previo", "fuerza_publica", "despachese", "consulta"];
    return order
      .map(tipo => ({ tipo, items: visibles.filter(i => i.accionTipo === tipo) }))
      .filter(g => g.items.length > 0);
  }, [visibles]);

  const selectedItems = items.filter(i => selected.has(i.id));
  const selectedTipos = new Set(selectedItems.map(i => i.accionTipo));
  const uniformTipo = selectedTipos.size === 1 ? [...selectedTipos][0] : null;

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleGroup(tipo: AccionTipo, ids: string[]) {
    setSelected(prev => {
      const next = new Set(prev);
      const allSelected = ids.every(id => next.has(id));
      ids.forEach(id => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }

  function ejecutar(ids: string[], mensaje: string) {
    setItems(prev => prev.filter(i => !ids.includes(i.id)));
    setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
    setBanner(mensaje);
    setTimeout(() => setBanner(null), 3200);
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Encabezado */}
      <ProcuradorHeader email={email} title={`Hola ${userName}, esta es tu bandeja de gestión diaria.`} />

      {banner && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3.5 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{banner}
        </div>
      )}

      {/* Semáforo de cartera */}
      <div className="grid grid-cols-3 gap-4">
        {(["estandar", "limite", "fuera"] as EstadoSLA[]).map(estado => {
          const m = ESTADO_META[estado];
          const count = CARTERA[estado];
          const pct = Math.round((count / CARTERA.total) * 100);
          const active = estadoFiltro === estado;
          const delta = estado === "estandar" ? COMPARATIVO_EQUIPO.estandarDeltaPct : estado === "fuera" ? COMPARATIVO_EQUIPO.fueraDeltaPct : null;
          return (
            <button
              key={estado}
              onClick={() => setEstadoFiltro(active ? null : estado)}
              className={`text-left bg-card rounded-xl border p-4 transition-all ${active ? "border-accent ring-2 ring-accent/20" : "border-border hover:border-accent/40"}`}
            >
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full ${m.bg} ${m.text} border ${m.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />{m.label}
                </span>
                {delta != null && (
                  <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-medium ${delta >= 0 === (estado !== "fuera") ? "text-emerald-600" : "text-red-500"}`}>
                    {delta >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(delta)}% vs equipo
                  </span>
                )}
              </div>
              <p className="text-[28px] font-semibold text-foreground mt-2 leading-none tracking-tight">{count}</p>
              <p className="text-[12px] text-muted-foreground mt-1.5">{pct}% de tu cartera · {CARTERA.total} causas</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-5 items-start">
        {/* Bandeja de trabajo */}
        <div className="col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Inbox className="w-4 h-4 text-muted-foreground" />Bandeja de trabajo
            </h3>
            {estadoFiltro && (
              <button onClick={() => setEstadoFiltro(null)} className="flex items-center gap-1 text-[11px] text-accent hover:underline">
                <X className="w-3 h-3" />Quitar filtro "{ESTADO_META[estadoFiltro].label}"
              </button>
            )}
          </div>

          {grupos.length === 0 && (
            <div className="bg-card rounded-xl border border-border p-10 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">Bandeja al día</p>
              <p className="text-[12px] text-muted-foreground mt-1">No hay tareas pendientes con este filtro.</p>
            </div>
          )}

          {grupos.map(({ tipo, items: gItems }) => {
            const meta = ACCION_META[tipo];
            const Icon = meta.icon;
            const ids = gItems.map(i => i.id);
            const allOn = ids.every(id => selected.has(id));
            const urgentCount = gItems.filter(i => i.plazoUrgente).length;
            const abierto = !colapsados.has(tipo);
            return (
              <div key={tipo} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  onClick={() => toggleColapso(tipo)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gray-50/60 cursor-pointer select-none"
                >
                  <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${abierto ? "rotate-90" : ""}`} />
                  <input type="checkbox" checked={allOn} onClick={e => e.stopPropagation()} onChange={() => toggleGroup(tipo, ids)} className="w-3.5 h-3.5 accent-accent" />
                  <Icon className="w-4 h-4 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground">{meta.label}</p>
                    <p className="text-[11px] text-muted-foreground">{meta.hint}</p>
                  </div>
                  {urgentCount > 0 && (
                    <span className="text-[11px] font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" />{urgentCount} urgente{urgentCount > 1 ? "s" : ""}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-muted-foreground">{gItems.length}</span>
                </div>
                {abierto && (
                <div>
                  {gItems.map(item => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors">
                      <input type="checkbox" checked={selected.has(item.id)} onChange={() => toggle(item.id)} className="w-3.5 h-3.5 accent-accent shrink-0" />
                      <EstadoDot estado={item.estado} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-foreground">{item.rol}</span>
                          <span className="text-[12px] text-muted-foreground truncate">{item.deudor}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">{item.tribunal}</span>
                          {item.exhorto && (
                            <span className="text-[10px] font-mono bg-violet-50 text-violet-600 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <MapPin className="w-2.5 h-2.5" />Exhorto
                            </span>
                          )}
                          {item.detalle && <span className="text-[11px] text-muted-foreground italic truncate">"{item.detalle}"</span>}
                          {item.autor && <span className="text-[11px] font-medium text-accent">{item.autor}</span>}
                        </div>
                      </div>
                      <span className="text-[11px] font-mono text-muted-foreground shrink-0">{fCLP(item.cuantia)}</span>
                      {item.plazo && (
                        <span className={`text-[11px] font-mono font-semibold shrink-0 flex items-center gap-1 ${item.plazoUrgente ? "text-red-600" : "text-muted-foreground"}`}>
                          <Clock className="w-3 h-3" />{item.plazo}
                        </span>
                      )}
                      <button
                        onClick={() => ejecutar([item.id], `${meta.actionLabel}: 1 causa gestionada.`)}
                        className="text-[11px] font-medium text-accent hover:underline shrink-0 whitespace-nowrap"
                      >
                        {meta.actionLabel}
                      </button>
                    </div>
                  ))}
                </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          {/* Vencimientos críticos */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-semibold text-foreground">Vencimientos críticos</h3>
            </div>
            <div className="space-y-2.5">
              {VENCIMIENTOS_CRITICOS.map(v => (
                <div key={v.id} className={`p-2.5 rounded-lg border ${v.critico ? "bg-red-50 border-red-200" : "bg-gray-50 border-border"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-foreground">{v.rol}</span>
                    <span className={`text-[11px] font-mono font-bold ${v.critico ? "text-red-600" : "text-muted-foreground"}`}>{v.plazo}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{v.deudor}</p>
                  <p className="text-[11px] text-foreground font-medium mt-0.5">{v.accion}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Resumen del mes */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-foreground flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-accent" />Resumen del mes
              </h3>
              <button onClick={() => onNavigate?.("mismetricas")} className="text-[11px] text-accent hover:underline flex items-center gap-0.5">
                Ver más<ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "Demandas presentadas", value: METRICAS_MES.demandas, delta: METRICAS_MES.demandasDeltaPct },
                { label: "Notificaciones", value: METRICAS_MES.notificaciones, delta: METRICAS_MES.notificacionesDeltaPct },
                { label: "Embargos", value: METRICAS_MES.embargos, delta: METRICAS_MES.embargosDeltaPct },
              ].map(k => (
                <div key={k.label} className="flex items-center justify-between">
                  <span className="text-[12px] text-muted-foreground">{k.label}</span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-mono font-semibold text-foreground">{k.value}</span>
                    <span className={`text-[10px] font-mono ${k.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>{k.delta >= 0 ? "+" : ""}{k.delta}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de acción masiva flotante */}
      {selected.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#0B1929] text-white rounded-2xl shadow-2xl px-5 py-3 flex items-center gap-4 z-20">
          <span className="text-xs font-medium">{selected.size} seleccionado{selected.size > 1 ? "s" : ""}</span>
          {uniformTipo ? (
            <button
              onClick={() => ejecutar([...selected], `${ACCION_META[uniformTipo].actionLabel}: ${selected.size} causas gestionadas masivamente.`)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-accent hover:bg-accent/85 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              <ListChecks className="w-3.5 h-3.5" />{ACCION_META[uniformTipo].actionLabel} en bloque
            </button>
          ) : (
            <span className="text-[11px] text-white/60">Selecciona tareas de un mismo tipo para gestionar en bloque</span>
          )}
          <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MisCausas ──────────────────────────────────────────────────────────────

export function MisCausas({ email = "demo@abogado.cl" }: { email?: string } = {}) {
  const [sel, setSel] = useState<CaseRow | null>(null);
  const [tab, setTab] = useState<"datos" | "historial" | "docs">("datos");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("all");
  const [comentario, setComentario] = useState("");
  const [historialLocal, setHistorialLocal] = useState<Record<string, HistItem[]>>(HISTORIAL_MOCK);

  const filtradas = CASES.filter(c => estadoFiltro === "all" || c.estado === estadoFiltro);

  function agregarComentario() {
    if (!sel || !comentario.trim()) return;
    const nuevo: HistItem = { fecha: "Hoy", autor: "Romina Fuentes", texto: comentario.trim(), tipo: "observacion" };
    setHistorialLocal(prev => ({ ...prev, [sel.id]: [...(prev[sel.id] ?? []), nuevo] }));
    setComentario("");
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`${sel ? "w-[calc(100%-380px)]" : "w-full"} overflow-auto p-6 space-y-4`}>
        <ProcuradorHeader email={email} title="Mis Causas" subtitle={`${CARTERA.total} causas asignadas · cartera completa`} />
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filtrar</span>
          </div>
          <select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)} className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option value="all">Todos los estados</option>
            <option value="fuera">Fuera de estándar</option>
            <option value="limite">Límite de estándar</option>
            <option value="estandar">Dentro de estándar</option>
          </select>
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Buscar rol o deudor..." className="pl-8 pr-3 py-1.5 text-xs bg-card border border-border rounded-lg w-56 focus:outline-none text-foreground placeholder:text-muted-foreground" />
          </div>
          <span className="ml-auto text-xs font-mono text-muted-foreground">{filtradas.length} de {CARTERA.total} causas</span>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-gray-50/60">
                {["", "ROL · RUT", "Deudor", "Etapa", "Tribunal", "Cuantía", "Estado", "Mandante"].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtradas.map(c => (
                <tr
                  key={c.id}
                  onClick={() => { setSel(sel?.id === c.id ? null : c); setTab("datos"); }}
                  className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-gray-50/70"
                  style={{ backgroundColor: sel?.id === c.id ? "rgba(23,85,212,0.04)" : undefined }}
                >
                  <td className="px-4 py-3"><EstadoDot estado={c.estado} /></td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px] font-bold text-foreground">{c.rol}</p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{c.debtorRut}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[160px] text-foreground truncate">{c.deudor}</td>
                  <td className="px-4 py-3 text-muted-foreground">{c.etapa}</td>
                  <td className="px-4 py-3 max-w-[150px] text-muted-foreground truncate">{c.tribunal}{c.exhorto && <span className="ml-1 text-violet-500">· exhorto</span>}</td>
                  <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">{fCLP(c.cuantia)}</td>
                  <td className="px-4 py-3"><EstadoBadge estado={c.estado} /></td>
                  <td className="px-4 py-3"><span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c.mandante}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {sel && (
        <div className="w-[380px] shrink-0 border-l border-border bg-card overflow-auto flex flex-col">
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <EstadoDot estado={sel.estado} />
                  <span className="font-mono text-base font-bold text-foreground">{sel.rol}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">{sel.deudor} · {sel.debtorRut}</p>
              </div>
              <button onClick={() => setSel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <EstadoBadge estado={sel.estado} />
          </div>

          <div className="flex border-b border-border shrink-0">
            {(["datos", "historial", "docs"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${tab === t ? "text-accent border-accent" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
                {{ datos: "Datos", historial: "Historial", docs: "Docs" }[t]}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto p-4">
            {tab === "datos" && (
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Tribunal", value: sel.tribunal },
                  { label: "Etapa", value: sel.etapa },
                  { label: "Cuantía", value: fCLP(sel.cuantia) },
                  { label: "Exhorto", value: sel.exhorto ? "Sí" : "No" },
                  { label: "Mandante", value: sel.mandante },
                  { label: "Estado", value: ESTADO_META[sel.estado].label },
                ].map(f => (
                  <div key={f.label} className="bg-gray-50 rounded-lg p-2.5 col-span-1">
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                    <p className="text-xs font-semibold mt-0.5 text-foreground">{f.value}</p>
                  </div>
                ))}
              </div>
            )}
            {tab === "historial" && (
              <div className="space-y-3">
                <div className="space-y-2.5">
                  {(historialLocal[sel.id] ?? []).length === 0 && (
                    <p className="text-xs text-muted-foreground">Sin observaciones registradas.</p>
                  )}
                  {(historialLocal[sel.id] ?? []).map((h, i) => (
                    <div key={i} className="p-2.5 bg-gray-50 rounded-lg border border-border">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-foreground">{h.autor}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{h.fecha}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-snug">{h.texto}</p>
                      <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${h.tipo === "consulta" ? "bg-amber-50 text-amber-700" : h.tipo === "respuesta" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {{ observacion: "Observación", consulta: "Consulta jefatura", respuesta: "Respuesta", accion: "Acción sistema" }[h.tipo]}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && agregarComentario()}
                    placeholder="Agregar observación..."
                    className="flex-1 text-xs px-3 py-2 bg-gray-50 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground"
                  />
                  <button onClick={agregarComentario} className="p-2 bg-accent text-white rounded-lg hover:bg-accent/85 transition-colors shrink-0">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
            {tab === "docs" && (
              <div className="space-y-2">
                {DOCS.filter(d => d.rol === sel.rol).length === 0 && <p className="text-xs text-muted-foreground">Sin documentos asociados.</p>}
                {DOCS.filter(d => d.rol === sel.rol).map(d => (
                  <div key={d.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium truncate">{d.tipo}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{d.fecha}</p>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded shrink-0 ${DOC_ESTADO_META[d.estado].bg} ${DOC_ESTADO_META[d.estado].text}`}>{DOC_ESTADO_META[d.estado].label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MisDocumentos ──────────────────────────────────────────────────────────

export function MisDocumentos({ email = "demo@abogado.cl" }: { email?: string } = {}) {
  const [docs, setDocs] = useState(DOCS);
  const [generando, setGenerando] = useState(false);
  const [tipoSel, setTipoSel] = useState(TIPOS_ESCRITO[0]);
  const [banner, setBanner] = useState<string | null>(null);

  function visar(id: string) {
    setDocs(prev => prev.map(d => d.id === id ? { ...d, estado: "visado" } : d));
  }

  function generarLote() {
    const nuevo: DocItem = {
      id: `d${Date.now()}`,
      tipo: tipoSel,
      rol: "Lote masivo",
      deudor: "3 causas seleccionadas",
      estado: "visacion",
      fecha: "Ahora",
    };
    setDocs(prev => [nuevo, ...prev]);
    setGenerando(false);
    setBanner(`Se generaron 3 escritos "${tipoSel}", pendientes de visación.`);
    setTimeout(() => setBanner(null), 3200);
  }

  const pendientesVisacion = docs.filter(d => d.estado === "visacion");

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <ProcuradorHeader email={email} title="Mis Documentos" subtitle={`${pendientesVisacion.length} escritos pendientes de tu visación`} />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Generación de escritos</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{pendientesVisacion.length} pendientes de tu visación</p>
        </div>
        <button onClick={() => setGenerando(true)} className="flex items-center gap-1.5 text-xs text-white bg-accent px-3.5 py-2 rounded-lg hover:bg-accent/85 transition-colors">
          <Plus className="w-3.5 h-3.5" />Generar escrito masivo
        </button>
      </div>

      {banner && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3.5 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{banner}
        </div>
      )}

      {generando && (
        <div className="bg-card rounded-xl border border-accent/30 p-4 space-y-3">
          <p className="text-xs font-semibold text-foreground">Nuevo escrito masivo</p>
          <div className="flex items-center gap-3 flex-wrap">
            <select value={tipoSel} onChange={e => setTipoSel(e.target.value)} className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
              {TIPOS_ESCRITO.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            <span className="text-[12px] text-muted-foreground">Aplicará a las causas seleccionadas en tu bandeja (3 causas de ejemplo)</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={generarLote} className="text-xs font-semibold text-white bg-accent px-3.5 py-1.5 rounded-lg hover:bg-accent/85 transition-colors">Generar</button>
            <button onClick={() => setGenerando(false)} className="text-xs font-medium text-muted-foreground hover:text-foreground px-3.5 py-1.5 transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-gray-50/60">
              {["Tipo de escrito", "Rol / Deudor", "Estado", "Fecha", ""].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.map(d => (
              <tr key={d.id} className="border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-foreground font-medium">{d.tipo}</span>
                </td>
                <td className="px-4 py-3">
                  <p className="font-mono text-[12px] font-semibold text-foreground">{d.rol}</p>
                  <p className="text-[11px] text-muted-foreground">{d.deudor}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${DOC_ESTADO_META[d.estado].bg} ${DOC_ESTADO_META[d.estado].text}`}>{DOC_ESTADO_META[d.estado].label}</span>
                </td>
                <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{d.fecha}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 justify-end">
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><Download className="w-3.5 h-3.5" /></button>
                    {d.estado === "visacion" && (
                      <button onClick={() => visar(d.id)} className="text-[11px] font-semibold text-accent hover:underline whitespace-nowrap">Visar</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MisMetricas ────────────────────────────────────────────────────────────

export function MisMetricas({ email = "demo@abogado.cl" }: { email?: string } = {}) {
  const equipoPromedio = Math.round(EQUIPO_COMPARATIVO.reduce((a, e) => a + e.pct, 0) / EQUIPO_COMPARATIVO.length);
  const tuPct = Math.round((CARTERA.estandar / CARTERA.total) * 100);

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <ProcuradorHeader email={email} title="Mis Métricas" subtitle="Indicadores de gestión del mes y comparativo de equipo" />
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Demandas presentadas", value: METRICAS_MES.demandas, delta: METRICAS_MES.demandasDeltaPct, icon: Gavel },
          { label: "Notificaciones", value: METRICAS_MES.notificaciones, delta: METRICAS_MES.notificacionesDeltaPct, icon: Send },
          { label: "Embargos", value: METRICAS_MES.embargos, delta: METRICAS_MES.embargosDeltaPct, icon: ShieldAlert },
          { label: "Cumplimiento SLA", value: `${tuPct}%`, delta: COMPARATIVO_EQUIPO.estandarDeltaPct, icon: CheckCircle2 },
        ].map(k => {
          const Icon = k.icon;
          return (
            <div key={k.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wide">{k.label}</p>
                  <p className="text-[26px] font-semibold text-foreground mt-1 leading-none tracking-tight">{k.value}</p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-accent" />
                </div>
              </div>
              <p className={`text-[12px] mt-2.5 font-mono ${k.delta >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                {k.delta >= 0 ? "+" : ""}{k.delta}% vs. igual fecha mes anterior
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-0.5">Gestión de la semana</h3>
          <p className="text-[12px] text-muted-foreground mb-4">Demandas, notificaciones y embargos por día</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={METRICAS_SEMANA} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="d" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} />
              <Bar dataKey="demandas" name="Demandas" fill="#1755D4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="notificaciones" name="Notificaciones" fill="#7C3AED" radius={[3, 3, 0, 0]} />
              <Bar dataKey="embargos" name="Embargos" fill="#10B981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-0.5">Cumplimiento de cartera</h3>
          <p className="text-[12px] text-muted-foreground mb-3">Distribución de estados</p>
          <ResponsiveContainer width="100%" height={140}>
            <PieChart>
              <Pie
                data={[
                  { name: "Dentro de estándar", value: CARTERA.estandar, color: "#10B981" },
                  { name: "Límite de estándar", value: CARTERA.limite, color: "#F59E0B" },
                  { name: "Fuera de estándar", value: CARTERA.fuera, color: "#EF4444" },
                ]}
                cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="value"
              >
                {[{ color: "#10B981" }, { color: "#F59E0B" }, { color: "#EF4444" }].map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {[
              { name: "Dentro de estándar", value: CARTERA.estandar, color: "#10B981" },
              { name: "Límite de estándar", value: CARTERA.limite, color: "#F59E0B" },
              { name: "Fuera de estándar", value: CARTERA.fuera, color: "#EF4444" },
            ].map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: d.color }} />
                  <span className="text-[12px] text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-[12px] font-mono font-semibold text-foreground">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center gap-2 mb-4">
          <Users className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">Comparativo cumplimiento de equipo</h3>
          <span className="text-[12px] font-mono text-muted-foreground ml-auto">Promedio equipo: {equipoPromedio}%</span>
        </div>
        <div className="space-y-3">
          {EQUIPO_COMPARATIVO.map(e => (
            <div key={e.nombre}>
              <div className="flex justify-between mb-1">
                <span className={`text-[12px] ${e.tu ? "font-semibold text-foreground" : "text-muted-foreground"}`}>{e.nombre}</span>
                <span className="text-[12px] font-mono font-semibold text-foreground">{e.pct}%</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${e.pct}%`, backgroundColor: e.tu ? "#1755D4" : "#CBD5E1" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

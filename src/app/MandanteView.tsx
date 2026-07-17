import React, { useState, useRef, useEffect } from "react";
import {
  Sparkles, Volume2, Pause, Bot, Send, X, TrendingUp,
  Building2, Scale, DollarSign, Calendar, Layers, ArrowUpRight,
  ArrowDownRight, ChevronRight, ChevronDown, Target, AlertTriangle,
  Lightbulb, Clock, Check, ArrowRight, Zap,
  SlidersHorizontal, ShieldAlert, ShieldCheck, Users, Database, Mail, Smartphone,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, LineChart, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Line, LabelList,
} from "recharts";

// ─── Tipos y datos simulados ──────────────────────────────────────────────────

type Dimension = "acumulado" | "plazo" | "comparativo" | "estudios" | "cuantia" | "estado";

const DIMENSIONS: { id: Dimension; label: string; icon: React.ElementType }[] = [
  { id: "acumulado", label: "Acumulado", icon: Layers },
  { id: "plazo", label: "Por plazo", icon: Calendar },
  { id: "comparativo", label: "Comparativo", icon: TrendingUp },
  { id: "estudios", label: "Por estudio", icon: Building2 },
  { id: "cuantia", label: "Por cuantía", icon: DollarSign },
  { id: "estado", label: "Por estado", icon: Scale },
];

// recuperoPrimerSemestrePct: qué % del recupero total de la camada se concentró en los primeros 6 meses
// (gestión extrajudicial/negociación temprana vs. recupero tardío vía remate judicial — RF-MAN-024)
// cuantiaAsignada: cartera asignada al estudio (proporcional a su Nº de causas sobre el total de 1.247)
// metaMonto: meta de recupero del estudio (proporcional, ponderada por la meta global de $2.540M)
// calidadInfoPct: % de campos obligatorios reportados completos y consistentes
// en las cargas de causas del estudio (proxy de calidad de la información).
// contactoPct: tasa de contacto reportada por el estudio — Ángelo (entrevista):
// "si un estudio tiene el 80% de contacto y el promedio de los demás es 40%, ese
// dato está mal" — se usa para detectar anomalías de reporte, no completitud.
const ESTUDIOS = [
  { id: "phlegal", name: "PH Legal", causas: 512, recuperoPct: 71.2, slaPct: 88.4, tiempoProm: 142, costoProm: 214000, criticas: 18, recuperoPrimerSemestrePct: 61, cuantiaAsignada: 1_692_000_000, metaMonto: 1_044_000_000, calidadInfoPct: 96, contactoPct: 42 },
  { id: "rivas", name: "Rivas & Asociados", causas: 388, recuperoPct: 64.8, slaPct: 81.2, tiempoProm: 161, costoProm: 238000, criticas: 27, recuperoPrimerSemestrePct: 48, cuantiaAsignada: 1_282_000_000, metaMonto: 791_000_000, calidadInfoPct: 89, contactoPct: 38 },
  { id: "andes", name: "Bufete Andes", causas: 221, recuperoPct: 58.3, slaPct: 74.9, tiempoProm: 178, costoProm: 265000, criticas: 33, recuperoPrimerSemestrePct: 33, cuantiaAsignada: 730_000_000, metaMonto: 450_000_000, calidadInfoPct: 78, contactoPct: 81 },
  { id: "contreras", name: "Contreras Legal", causas: 126, recuperoPct: 52.1, slaPct: 69.5, tiempoProm: 196, costoProm: 289000, criticas: 21, recuperoPrimerSemestrePct: 29, cuantiaAsignada: 416_000_000, metaMonto: 257_000_000, calidadInfoPct: 71, contactoPct: 35 },
];

const CASE_PROFIT = [
  { rol: "C-8421-2026", estudio: "PH Legal", debtor: "Carlos González Pérez", cuantia: 21540000, gasto: 1860000, recupero: 0, margen: -1860000, ratio: -8.6, overdue: true },
  { rol: "C-9004-2026", estudio: "PH Legal", debtor: "Francisca Yáñez Soto", cuantia: 15200000, gasto: 3910000, recupero: 2100000, margen: -1810000, ratio: -11.9, overdue: true },
  { rol: "C-9187-2026", estudio: "PH Legal", debtor: "Jorge Salinas Bravo", cuantia: 12800000, gasto: 1500000, recupero: 900000, margen: -600000, ratio: -4.7, overdue: false },
  { rol: "C-7199-2026", estudio: "PH Legal", debtor: "Roberto Martínez Silva", cuantia: 89200000, gasto: 2890000, recupero: 89200000, margen: 86310000, ratio: 96.8, overdue: false },
  { rol: "C-5541-2026", estudio: "Rivas & Asociados", debtor: "María Isabel Rojas Vega", cuantia: 8750000, gasto: 620000, recupero: 4200000, margen: 3580000, ratio: 40.9, overdue: false },
  { rol: "C-6650-2026", estudio: "Rivas & Asociados", debtor: "Enrique Paredes Núñez", cuantia: 27400000, gasto: 1980000, recupero: 24100000, margen: 22120000, ratio: 80.7, overdue: false },
  { rol: "C-6891-2026", estudio: "Rivas & Asociados", debtor: "Soledad Vera Campos", cuantia: 9600000, gasto: 2400000, recupero: 0, margen: -2400000, ratio: -25.0, overdue: true },
  { rol: "C-3914-2026", estudio: "Bufete Andes", debtor: "Comercial Andina Ltda.", cuantia: 32100000, gasto: 4240000, recupero: 6200000, margen: 1960000, ratio: 6.1, overdue: false },
  { rol: "C-4477-2026", estudio: "Bufete Andes", debtor: "Patricio Lemus Ortiz", cuantia: 18300000, gasto: 5100000, recupero: 1200000, margen: -3900000, ratio: -21.3, overdue: true },
  { rol: "C-2891-2025", estudio: "Contreras Legal", debtor: "Soc. Constructora Sur S.A.", cuantia: 156000000, gasto: 12400000, recupero: 0, margen: -12400000, ratio: -7.9, overdue: true },
  { rol: "C-2755-2025", estudio: "Contreras Legal", debtor: "Marcelo Iturra Peña", cuantia: 6400000, gasto: 480000, recupero: 3900000, margen: 3420000, ratio: 53.4, overdue: false },
  { rol: "C-2999-2025", estudio: "Contreras Legal", debtor: "Valentina Cortés Muñoz", cuantia: 41200000, gasto: 8600000, recupero: 5100000, margen: -3500000, ratio: -8.5, overdue: false },
];

// Se incluyen dos camadas maduras (Jul 2024 y Ene 2025) que ya alcanzaron M12/M18,
// además de las 6 camadas recientes — así el seguimiento cubre 3, 6, 12 y 18 meses.
const COHORTS = ["Jul 2024", "Ene 2025", "Ene 2026", "Feb 2026", "Mar 2026", "Abr 2026", "May 2026", "Jun 2026"];
const MONTHS = ["M0", "M1", "M2", "M3", "M4", "M5", "M6", "M7", "M8", "M9", "M10", "M11", "M12", "M13", "M14", "M15", "M16", "M17", "M18"];
// filas = camada de originación, columnas = meses transcurridos, null = aún no alcanza esa altura de vida
const VINTAGE: (number | null)[][] = [
  [4.8, 12.9, 21.4, 29.5, 36.4, 42.3, 47.1, 50.8, 54.0, 56.7, 58.8, 60.6, 62.0, 63.1, 64.0, 64.7, 65.2, 65.6, 65.9],
  [4.1, 11.2, 18.6, 25.7, 31.7, 36.8, 41.0, 44.5, 47.4, 49.8, 51.8, 53.4, 54.7, 55.8, 56.6, 57.3, 57.8, 58.2, 58.5],
  [4.2, 11.8, 19.5, 27.1, 33.8, 39.2, 44.0, null, null, null, null, null, null, null, null, null, null, null, null],
  [3.9, 12.4, 21.0, 29.6, 36.4, 41.8, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [5.1, 14.2, 23.8, 31.9, 38.5, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [4.6, 13.1, 22.2, 30.4, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [6.0, 16.5, 26.7, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
  [5.4, 15.0, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null],
];

// Cartera asignada por camada (monto base sobre el que se calcula el recupero en
// millones de pesos) — las camadas Feb-Jun 2026 coinciden con el ingreso mensual
// total de CARTERA_INGRESO_MENSUAL; Jul 2024/Ene 2025/Ene 2026 son estimaciones
// históricas de una cartera algo menor.
const VINTAGE_MONTO_CAMADA: Record<string, number> = {
  "Jul 2024": 340,
  "Ene 2025": 385,
  "Ene 2026": 410,
  "Feb 2026": 525,
  "Mar 2026": 497,
  "Abr 2026": 460,
  "May 2026": 428,
  "Jun 2026": 395,
};

const COMPARATIVO = [
  { metric: "Recupero acumulado", actual: "$2.840M", anterior: "$2.410M", delta: 17.8, causa: "Impulsado por PH Legal (71.2% de recupero) y el cierre de 7 remates en el período." },
  { metric: "Cumplimiento SLA", actual: "84.3%", anterior: "81.0%", delta: 3.3, causa: "Mejora general, aunque Bufete Andes y Contreras Legal siguen bajo el objetivo de 90%." },
  { metric: "Costo judicial", actual: "$186M", anterior: "$201M", delta: -7.5, causa: "Menor gasto en receptores judiciales tras ajustar el límite de búsquedas negativas en deudas menores a $8M." },
  { metric: "Causas críticas", actual: "96", anterior: "112", delta: -14.3, causa: "Reducción por reactivación de causas detenidas, aunque persisten 18 sin movimiento hace más de 45 días." },
];

// ─── Gastos judiciales por categoría (RF-MAN: "¿dónde estoy gastando más?") ───
// Suma coincide con el KPI "Costo judicial" ($186M)
const GASTOS_CATEGORIAS = [
  { id: "receptores", label: "Receptores judiciales", monto: 68_000_000, deltaPct: 8.2 },
  { id: "notarios", label: "Notarios", monto: 34_000_000, deltaPct: -3.1 },
  { id: "conservadores", label: "Conservadores de bienes raíces", monto: 29_000_000, deltaPct: 4.4 },
  { id: "viajes", label: "Viajes y traslados", monto: 21_000_000, deltaPct: 12.7 },
  { id: "publicaciones", label: "Publicaciones", monto: 18_000_000, deltaPct: -1.5 },
  { id: "otros", label: "Otros gastos", monto: 16_000_000, deltaPct: 2.0 },
];
const GASTOS_TOTAL = GASTOS_CATEGORIAS.reduce((a, c) => a + c.monto, 0);
const GASTOS_TREND = [
  { x: "Feb", v: 142 }, { x: "Mar", v: 158 }, { x: "Abr", v: 165 },
  { x: "May", v: 171 }, { x: "Jun", v: 179 }, { x: "Jul", v: 186 },
];

// ─── Proyección de recupero (mensual, real vs. proyectado) ────────────────────
const MES_ACTUAL = "Jul";

const PROYECCION_RECUPERO = [
  { mes: "Feb", real: 420, proyectado: null as number | null, pesimista: null as number | null, optimista: null as number | null, actual: null as number | null },
  { mes: "Mar", real: 940, proyectado: null as number | null, pesimista: null as number | null, optimista: null as number | null, actual: null as number | null },
  { mes: "Abr", real: 1480, proyectado: null as number | null, pesimista: null as number | null, optimista: null as number | null, actual: null as number | null },
  { mes: "May", real: 2020, proyectado: null as number | null, pesimista: null as number | null, optimista: null as number | null, actual: null as number | null },
  { mes: "Jun", real: 2410, proyectado: null as number | null, pesimista: null as number | null, optimista: null as number | null, actual: 2410 as number | null },
  { mes: "Jul", real: null as number | null, proyectado: 2840, pesimista: 2840, optimista: 2840, actual: 2840 as number | null },
  { mes: "Ago", real: null as number | null, proyectado: 3220, pesimista: 3120, optimista: 3320, actual: null as number | null },
  { mes: "Sep", real: null as number | null, proyectado: 3560, pesimista: 3350, optimista: 3780, actual: null as number | null },
  { mes: "Oct", real: null as number | null, proyectado: 3870, pesimista: 3520, optimista: 4200, actual: null as number | null },
  { mes: "Nov", real: null as number | null, proyectado: 4150, pesimista: 3650, optimista: 4600, actual: null as number | null },
  { mes: "Dic", real: null as number | null, proyectado: 4400, pesimista: 3750, optimista: 4950, actual: null as number | null },
];

const PROYECCION_LABELS: Record<string, { label: string; color: string }> = {
  real: { label: "Real", color: "#1755D4" },
  proyectado: { label: "Proyectado", color: "#1755D4" },
  pesimista: { label: "Pesimista", color: "#EF4444" },
  optimista: { label: "Optimista", color: "#10B981" },
};

function ProyeccionTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const puntos = payload.filter(p => p.dataKey !== "actual" && p.value != null && PROYECCION_LABELS[p.dataKey as string]);
  if (!puntos.length) return null;
  return (
    <div style={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", padding: "8px 12px" }}>
      <p style={{ fontWeight: 600, color: "#111827", marginBottom: 2 }}>{label}{label === MES_ACTUAL ? " · mes en curso" : ""}</p>
      {puntos.map(p => {
        const info = PROYECCION_LABELS[p.dataKey as string];
        return (
          <p key={p.dataKey} style={{ color: info.color }}>{info.label}: <strong>${p.value}M</strong></p>
        );
      })}
    </div>
  );
}

function ProyeccionRecuperoChart() {
  const meses = PROYECCION_RECUPERO.map(d => d.mes);
  const [desde, setDesde] = useState(meses[0]);
  const [hasta, setHasta] = useState(meses[meses.length - 1]);
  const iDesde = meses.indexOf(desde);
  const iHasta = meses.indexOf(hasta);
  const [lo, hi] = iDesde <= iHasta ? [iDesde, iHasta] : [iHasta, iDesde];
  const sliced = PROYECCION_RECUPERO.slice(lo, hi + 1);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Proyección de recupero</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Recupero real y proyectado, millones CLP</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-muted-foreground">Desde</span>
            <select value={desde} onChange={e => setDesde(e.target.value)} className="text-xs bg-transparent focus:outline-none text-foreground">
              {meses.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
          <label className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5">
            <span className="text-[11px] text-muted-foreground">Hasta</span>
            <select value={hasta} onChange={e => setHasta(e.target.value)} className="text-xs bg-transparent focus:outline-none text-foreground">
              {meses.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </label>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={sliced} margin={{ top: 5, right: 5, bottom: 12, left: 4 }}>
          <defs>
            <linearGradient id="proyeccionMesEnCurso" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#1755D4" />
              <stop offset="100%" stopColor="#F59E0B" />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} label={{ value: "Mes", position: "insideBottom", offset: -8, fontSize: 11, fill: "#9CA3AF" }} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} label={{ value: "Recupero (M$ CLP)", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#9CA3AF" }} />
          <Tooltip content={<ProyeccionTooltip />} />
          <Line type="monotone" dataKey="real" stroke="#1755D4" strokeWidth={2.5} dot={{ r: 4, fill: "#1755D4", strokeWidth: 0 }} activeDot={{ r: 5 }} name="Real" connectNulls={false} />
          <Line type="monotone" dataKey="proyectado" stroke="#1755D4" strokeWidth={2.5} strokeDasharray="6 4" dot={{ r: 4, fill: "#fff", stroke: "#1755D4", strokeWidth: 2 }} activeDot={{ r: 5 }} name="Proyectado" connectNulls={false} />
          <Line type="monotone" dataKey="pesimista" stroke="#EF4444" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: "#fff", stroke: "#EF4444", strokeWidth: 1.5 }} activeDot={{ r: 4 }} name="Pesimista" connectNulls={false} />
          <Line type="monotone" dataKey="optimista" stroke="#10B981" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3, fill: "#fff", stroke: "#10B981", strokeWidth: 1.5 }} activeDot={{ r: 4 }} name="Optimista" connectNulls={false} />
          <Line
            type="monotone"
            dataKey="actual"
            stroke="url(#proyeccionMesEnCurso)"
            strokeWidth={3}
            strokeDasharray="5 3"
            dot={(props: any) =>
              props.payload.mes === MES_ACTUAL
                ? <circle key={`actual-${props.index}`} cx={props.cx} cy={props.cy} r={5.5} fill="#F59E0B" stroke="#fff" strokeWidth={2} />
                : <circle key={`actual-${props.index}`} cx={props.cx} cy={props.cy} r={0} />
            }
            activeDot={{ r: 6, fill: "#F59E0B" }}
            name="Mes en curso"
            legendType="none"
            connectNulls={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-3 flex-wrap">
        <span className="flex items-center gap-1.5 font-medium text-foreground"><span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: "#1755D4" }} />Línea continua: real</span>
        <span className="flex items-center gap-1.5 font-medium text-foreground"><span className="w-3 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: "#1755D4" }} />Línea punteada: proyectado</span>
        <span className="flex items-center gap-1.5 font-medium" style={{ color: "#EF4444" }}><span className="w-3 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: "#EF4444" }} />Pesimista</span>
        <span className="flex items-center gap-1.5 font-medium" style={{ color: "#10B981" }}><span className="w-3 h-0 border-t-2 border-dashed inline-block" style={{ borderColor: "#10B981" }} />Optimista</span>
        <span className="flex items-center gap-1.5 font-medium text-foreground"><span className="w-3 h-1.5 rounded-full inline-block" style={{ background: "linear-gradient(90deg, #1755D4, #F59E0B)" }} />{MES_ACTUAL}: mes en curso</span>
      </div>
    </div>
  );
}

const DIM_CHART: Record<Dimension, { title: string; sub: string; kind: "area" | "bar" | "pie"; data: any[]; dataKey: string; nameKey: string; color: string }> = {
  acumulado: {
    title: "Recupero acumulado", sub: "Millones CLP — año a la fecha, todos los estudios", kind: "area",
    data: [
      { x: "Feb", v: 420, meta: 540 }, { x: "Mar", v: 940, meta: 1090 }, { x: "Abr", v: 1480, meta: 1590 },
      { x: "May", v: 2020, meta: 2000 }, { x: "Jun", v: 2410, meta: 2250 }, { x: "Jul", v: 2840, meta: 2540 },
    ],
    dataKey: "v", nameKey: "x", color: "#1755D4",
  },
  plazo: {
    title: "Recupero por plazo transcurrido", sub: "% recuperado según antigüedad de la obligación", kind: "bar",
    data: [
      { x: "0-30d", v: 12, recomendacion: "Mantener en gestión extrajudicial: el recupero aún es bajo para justificar el costo de judicializar." },
      { x: "31-60d", v: 24, recomendacion: "Extender la gestión extrajudicial; el recupero mejora de forma sostenida sin costo judicial." },
      { x: "61-90d", v: 31, recomendacion: "Punto de decisión: 41% de este segmento paga por vía extrajudicial entre el día 90 y 120 — evaluar retrasar 30 días la asignación judicial." },
      { x: "91-180d", v: 46, recomendacion: "Priorizar la asignación judicial si no existe compromiso de pago vigente: la gestión extrajudicial pierde efectividad." },
      { x: "180d+", v: 58, recomendacion: "Judicializar de inmediato: pasado este plazo, la vía extrajudicial ya no aporta recupero adicional relevante." },
    ],
    dataKey: "v", nameKey: "x", color: "#0EA5E9",
  },
  comparativo: {
    title: "Comparativo mensual por estudio", sub: "Recupero % — mes actual vs. mes anterior", kind: "bar",
    data: ESTUDIOS.map(e => ({ x: e.name.split(" ")[0], v: e.recuperoPct })),
    dataKey: "v", nameKey: "x", color: "#7C3AED",
  },
  estudios: {
    title: "Recupero % por estudio", sub: "Comparativo entre los estudios que gestionan su cartera", kind: "bar",
    data: ESTUDIOS.map(e => ({ x: e.name, v: e.recuperoPct })),
    dataKey: "v", nameKey: "x", color: "#10B981",
  },
  cuantia: {
    title: "Recupero por tramo de cuantía", sub: "% recuperado agrupado por rango de monto reclamado", kind: "bar",
    data: [{ x: "<5M", v: 68 }, { x: "5-20M", v: 54 }, { x: "20-50M", v: 41 }, { x: "50-100M", v: 33 }, { x: ">100M", v: 22 }],
    dataKey: "v", nameKey: "x", color: "#F59E0B",
  },
  estado: {
    title: "Causas por estado", sub: "Distribución consolidada por etapa procesal", kind: "pie",
    data: [{ x: "Notificación", v: 287, color: "#3B82F6" }, { x: "Embargo", v: 194, color: "#7C3AED" }, { x: "Liquidación", v: 142, color: "#F59E0B" }, { x: "Remate", v: 89, color: "#EF4444" }, { x: "Recupero", v: 211, color: "#10B981" }],
    dataKey: "v", nameKey: "x", color: "#1755D4",
  },
};

// Siempre en M (millones), con punto como separador de miles: 1.200M, 120M, 64M.
function formatMontoMM(millones: number): string {
  const abs = Math.abs(millones);
  const fixed = Number.isInteger(abs) ? abs.toFixed(0) : abs.toFixed(1);
  const [intPart, decPart] = fixed.split(".");
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return decPart ? `${grouped}.${decPart}M` : `${grouped}M`;
}

function fCLP(n: number) { return (n < 0 ? "-$" : "$") + formatMontoMM(Math.abs(n) / 1_000_000); }

function dimFootnote(dim: Dimension) {
  const map: Record<Dimension, string> = {
    acumulado: "Acumulado año a la fecha",
    plazo: "Variación últimos 30 días",
    comparativo: "vs. período anterior",
    estudios: "Promedio ponderado entre estudios",
    cuantia: "Agregado por tramo de cuantía",
    estado: "Consolidado por estado de causa",
  };
  return map[dim];
}

// ─── Selectores de contexto del header ────────────────────────────────────────

const PERIODOS = [
  { id: "mes", label: "Mes actual" },
  { id: "trimestre", label: "Trimestre actual" },
  { id: "anio", label: "Año a la fecha" },
] as const;
type PeriodoId = (typeof PERIODOS)[number]["id"];

// ─── KPIs ─────────────────────────────────────────────────────────────────────
// 8 KPI Cards por spec VII.2: Cuantía asignada, Recupero, % Recupero (implícito en
// el delta de "Recupero acumulado"), Brecha meta, Gasto judicial, Rentabilidad, SLA, Causas activas.

const CARTERA_ADMINISTRADA_TOTAL = ESTUDIOS.reduce((a, e) => a + e.cuantiaAsignada, 0);

// Cada KPI define un objetivo/parámetro configurable y su tipo de mejora
// ("mayor_mejor" o "menor_mejor"), para poder calcular un estado tipo semáforo
// (verde/amarillo/rojo) en vez de solo mostrar la variación vs. período anterior.
type KpiTipo = "mayor_mejor" | "menor_mejor";
type KpiUnidad = "monto" | "pct" | "dias" | "num";

const KPIS = [
  { id: "cartera", label: "Cartera administrada", value: fCLP(CARTERA_ADMINISTRADA_TOTAL), delta: "+6.2%", pos: true, icon: Layers, bg: "bg-accent/10", ic: "text-accent", trend: [3620, 3780, 3850, 3960, 4040, 4120], tooltip: "Cuantía total asignada a los estudios de cobranza en el período.", actual: CARTERA_ADMINISTRADA_TOTAL / 1_000_000, objetivo: 4200, tipo: "mayor_mejor" as KpiTipo, unidad: "monto" as KpiUnidad, explicacion: "Levemente bajo el plan de asignación trimestral ($4.200M)." },
  { id: "recupero", label: "Recupero acumulado", value: "$2.840M", delta: "68.9% de la cartera", pos: true, icon: TrendingUp, bg: "bg-emerald-50", ic: "text-emerald-600", trend: [420, 940, 1480, 2020, 2410, 2840], tooltip: "Monto total recuperado a la fecha sobre la cartera administrada.", actual: 2840, objetivo: 2540, tipo: "mayor_mejor" as KpiTipo, unidad: "monto" as KpiUnidad, explicacion: "Supera la meta del período en 12%." },
  { id: "meta", label: "Cumplimiento de meta", value: "112%", delta: "Meta $2.540M · brecha +$300M", pos: true, icon: Target, bg: "bg-blue-50", ic: "text-blue-600", trend: [78, 86, 93, 101, 107, 112], tooltip: "Recupero acumulado sobre la meta del período. Brecha = recupero real − meta.", actual: 112, objetivo: 100, tipo: "mayor_mejor" as KpiTipo, unidad: "pct" as KpiUnidad, explicacion: "Brecha positiva de +$300M vs. la meta del período." },
  { id: "costo", label: "Costo judicial", value: "$186M", delta: "6.5% del recupero", pos: false, icon: DollarSign, bg: "bg-amber-50", ic: "text-amber-600", trend: [142, 158, 165, 171, 179, 186], tooltip: "Gasto judicial acumulado (receptores, notarios, conservadores, viajes, publicaciones y otros).", actual: 186, objetivo: 175, tipo: "menor_mejor" as KpiTipo, unidad: "monto" as KpiUnidad, explicacion: "6.3% sobre el presupuesto judicial autorizado del período ($175M)." },
  { id: "rentabilidad", label: "Rentabilidad", value: "20.7%", delta: "+2.1 pts vs. trim. ant.", pos: true, icon: Zap, bg: "bg-emerald-50", ic: "text-emerald-600", trend: [15.2, 16.8, 17.9, 18.6, 19.4, 20.7], tooltip: "Margen (recupero − gasto acumulado) / cuantía, promedio ponderado de la cartera.", actual: 20.7, objetivo: 18, tipo: "mayor_mejor" as KpiTipo, unidad: "pct" as KpiUnidad, explicacion: "2.7 pts sobre el objetivo de rentabilidad (18%)." },
  { id: "sla", label: "Cumplimiento SLA", value: "84.3%", delta: "+3.3 pts vs. trim. ant.", pos: true, icon: Check, bg: "bg-blue-50", ic: "text-blue-600", trend: [77.1, 79.4, 80.8, 81.9, 83.0, 84.3], tooltip: "% de causas dentro de los plazos comprometidos de SLA, consolidado entre estudios.", actual: 84.3, objetivo: 90, tipo: "mayor_mejor" as KpiTipo, unidad: "pct" as KpiUnidad, explicacion: "Bajo el objetivo de SLA (90%), aunque en mejora vs. el período anterior." },
  { id: "tiempo", label: "Tiempo prom. recuperación", value: "154 días", delta: "-9 días vs. trim. ant.", pos: true, icon: Calendar, bg: "bg-violet-50", ic: "text-violet-600", trend: [178, 172, 166, 161, 157, 154], tooltip: "Días promedio entre inicio de gestión y recupero efectivo.", actual: 154, objetivo: 150, tipo: "menor_mejor" as KpiTipo, unidad: "dias" as KpiUnidad, explicacion: "4 días sobre el objetivo (150 días), en mejora sostenida." },
  { id: "criticas", label: "Causas activas / críticas", value: "1.247 / 96", delta: "16 vencidas hoy", pos: false, icon: AlertTriangle, bg: "bg-red-50", ic: "text-red-600", trend: [104, 101, 99, 98, 97, 96], tooltip: "Causas activas totales y, de ellas, las clasificadas como críticas por severidad de riesgo.", actual: 96, objetivo: 80, tipo: "menor_mejor" as KpiTipo, unidad: "num" as KpiUnidad, explicacion: "96 causas críticas superan el umbral aceptable de 80." },
];

function kpiEstado(actual: number, objetivo: number, tipo: KpiTipo): "verde" | "amarillo" | "rojo" {
  const ratio = tipo === "mayor_mejor" ? actual / objetivo : objetivo / actual;
  if (ratio >= 1) return "verde";
  if (ratio >= 0.9) return "amarillo";
  return "rojo";
}

const KPI_ESTADO_INFO: Record<"verde" | "amarillo" | "rojo", { label: string; color: string; bg: string }> = {
  verde: { label: "En meta", color: "#059669", bg: "rgba(16,185,129,0.12)" },
  amarillo: { label: "Cerca de meta", color: "#B45309", bg: "rgba(245,158,11,0.14)" },
  rojo: { label: "Bajo meta", color: "#DC2626", bg: "rgba(239,68,68,0.12)" },
};

function formatKpiObjetivo(objetivo: number, unidad: KpiUnidad): string {
  if (unidad === "monto") return `$${formatMontoMM(objetivo)}`;
  if (unidad === "pct") return `${objetivo}%`;
  if (unidad === "dias") return `${objetivo} días`;
  return `${objetivo}`;
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 56, h = 20;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0" aria-hidden="true">
      <polyline points={points} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Resumen IA con interacción de audio ──────────────────────────────────────

// ─── Control de acordeón evidente (solo ícono, sin texto) ─────────────────────

function AccordionToggle({ expanded, onToggle, color = "#1755D4" }: { expanded: boolean; onToggle: () => void; color?: string }) {
  return (
    <button
      onClick={onToggle}
      aria-label={expanded ? "Contraer" : "Expandir"}
      className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:scale-105"
      style={{ backgroundColor: color }}
    >
      <ChevronDown className="w-4 h-4 text-white transition-transform duration-300" style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }} />
    </button>
  );
}

// ─── Estado vacío reutilizable ─────────────────────────────────────────────────
function EmptyState({ mensaje }: { mensaje: string }) {
  return (
    <p className="text-[12px] text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">{mensaje}</p>
  );
}

// Canal de entrega (Ángelo, entrevista): "se dispara un correo y me llega un
// panel todos los días"; "a veces necesitas la vista del teléfono porque te
// estás moviendo todo el día". No hay backend de envío real en este prototipo —
// esto demuestra la interacción de suscripción, no un envío efectivo.
function CanalEntregaToggle() {
  const [suscrito, setSuscrito] = useState(false);
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => setSuscrito(s => !s)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium border transition-colors"
        style={{
          borderColor: suscrito ? "#1755D4" : "var(--border)",
          backgroundColor: suscrito ? "rgba(23,85,212,0.08)" : "transparent",
          color: suscrito ? "#1755D4" : "var(--muted-foreground)",
        }}
      >
        <Mail className="w-3.5 h-3.5 shrink-0" />
        {suscrito ? "Recibirás este resumen por correo, 9:00 AM" : "Recibir este resumen por correo cada mañana"}
      </button>
      <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
        <Smartphone className="w-3.5 h-3.5 shrink-0" />
        Disponible también desde el celular
      </span>
    </div>
  );
}

function AISummaryCard() {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = new Audio("/audio/resumen-mandante.mp3");
    audio.addEventListener("ended", () => setPlaying(false));
    audioRef.current = audio;
    return () => { audio.pause(); audio.src = ""; };
  }, []);

  function toggleAudio() {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play();
      setPlaying(true);
    }
  }

  return (
    <div
      className="rounded-2xl border p-5 relative overflow-hidden"
      style={{
        borderColor: "rgba(23,85,212,0.18)",
        background: "linear-gradient(135deg, rgba(23,85,212,0.06), rgba(124,58,237,0.05))",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: "#1755D4" }}>
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-base font-semibold text-foreground">Resumen generado por IA</p>
              <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white" style={{ backgroundColor: "#1755D4" }}>IA</span>
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed max-w-2xl mt-2">
              La cartera acumula un recupero de <strong className="text-foreground font-semibold">2.840 millones de pesos</strong>, equivalente al 68.9% del total administrado, con <strong className="text-foreground font-semibold">PH Legal</strong> a la cabeza del ranking de estudios.
            </p>

            <div
              className="grid"
              style={{ gridTemplateRows: expanded ? "1fr" : "0fr", transition: "grid-template-rows 350ms cubic-bezier(0.4,0,0.2,1)" }}
            >
              <div className="overflow-hidden">
                <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-3xl">
                  De una cartera total de <strong className="text-foreground font-semibold">4.120 millones</strong>, se han recuperado <strong className="text-foreground font-semibold">2.840 millones (68.9%)</strong>, superando la meta del período en un <strong className="text-emerald-600 font-semibold">12%</strong>. <strong className="text-foreground font-semibold">PH Legal</strong> lidera con un <strong className="text-foreground font-semibold">71.2%</strong> de recupero, aunque mantiene <strong className="text-red-600 font-semibold">3 causas con rentabilidad negativa</strong> que conviene revisar, mientras que <strong className="text-foreground font-semibold">Rivas & Asociados</strong> y <strong className="text-foreground font-semibold">Contreras Legal</strong> muestran el mayor rezago relativo dentro del ranking.
                </p>
              </div>
            </div>

            <div className="mt-3">
              <CanalEntregaToggle />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={toggleAudio}
            className="shrink-0 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
            style={{
              backgroundColor: playing ? "#1755D4" : "rgba(23,85,212,0.1)",
              color: playing ? "#fff" : "#1755D4",
            }}
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            {playing ? "Reproduciendo" : "Escuchar resumen"}
            {playing && (
              <span className="flex items-end gap-0.5 h-3 ml-0.5">
                {[0, 1, 2, 3].map(i => (
                  <span key={i} className="w-0.5 bg-white rounded-full animate-pulse" style={{ height: `${4 + (i % 3) * 3}px`, animationDelay: `${i * 120}ms` }} />
                ))}
              </span>
            )}
          </button>
          <AccordionToggle expanded={expanded} onToggle={() => setExpanded(e => !e)} />
        </div>
      </div>
    </div>
  );
}

// ─── Recomendaciones con evidencia ─────────────────────────────────────────────
// Cada recomendación queda trazada a la evidencia (dato histórico) que la origina,
// su segmento, el impacto estimado y el nivel de confianza — y puede aceptarse,
// rechazarse o editarse, en vez de ser solo una frase estática.
interface Recomendacion {
  id: string;
  texto: string;
  segmento: string;
  evidencia: string;
  impactoEstimado: string;
  confianza: "alta" | "media" | "baja";
  reglaActual?: string;
  reglaPropuesta?: string;
}

const RECOMENDACIONES: Recomendacion[] = [
  {
    id: "busq-neg-8m",
    texto: "Limitar a 2 búsquedas negativas en deudas menores a $8M antes de suspender gestión.",
    segmento: "Deudas < $8M",
    reglaActual: "3 búsquedas negativas antes de suspender gestión",
    reglaPropuesta: "2 búsquedas negativas antes de suspender gestión",
    evidencia: "La 3ª búsqueda negativa agregó $18M de gasto en los últimos 12 meses y solo produjo $2M adicionales de recupero, en 162 causas de este tramo.",
    impactoEstimado: "Ahorro estimado de $18M en gasto, con impacto marginal en recupero (-$2M).",
    confianza: "alta",
  },
  {
    id: "asignacion-90-120",
    texto: "Retrasar 30 días la asignación judicial del segmento con alta probabilidad de pago extrajudicial.",
    segmento: "Mora 90-120 días, alta probabilidad de pago",
    reglaActual: "Asignar a vía judicial a los 90 días de mora",
    reglaPropuesta: "Asignar a vía judicial a los 120 días de mora",
    evidencia: "41% de este segmento paga por vía extrajudicial entre el día 90 y 120, evitando el costo judicial.",
    impactoEstimado: "Ahorro estimado de 18% en gasto judicial de este segmento, sin variación relevante en recupero.",
    confianza: "alta",
  },
  {
    id: "sla-riesgo",
    texto: "Priorizar la gestión de las 42 causas con SLA en riesgo o superado en Bufete Andes y Contreras Legal.",
    segmento: "Bufete Andes y Contreras Legal — SLA en riesgo",
    evidencia: "42 causas concentradas en ambos estudios están en riesgo o ya superaron su SLA comprometido.",
    impactoEstimado: "Evita penalizaciones contractuales y protege el cumplimiento de SLA consolidado (hoy 84.3%, objetivo 90%).",
    confianza: "alta",
  },
  {
    id: "rentabilidad-negativa-phlegal",
    texto: "Revisar con PH Legal las causas con rentabilidad negativa antes del cierre de trimestre.",
    segmento: "PH Legal — causas con ratio de rentabilidad negativo",
    evidencia: "3 causas de PH Legal muestran rentabilidad negativa: el gasto acumulado supera el recupero obtenido.",
    impactoEstimado: "Recupero neto potencial de hasta $4M si se resuelven antes del cierre de trimestre.",
    confianza: "media",
  },
  {
    id: "recupero-bajo-meta",
    texto: "Exigir plan de recuperación a Contreras Legal y Bufete Andes, ambos bajo el 60% de cumplimiento de meta.",
    segmento: "Contreras Legal y Bufete Andes",
    evidencia: "Ambos estudios están por debajo del 60% de cumplimiento de su meta de recupero del período.",
    impactoEstimado: "Sin plan de acción, la brecha vs. meta consolidada puede ampliarse en los próximos meses.",
    confianza: "media",
  },
  {
    id: "plazo-rivas",
    texto: "Escalar el plazo vencido en Rivas & Asociados.",
    segmento: "Rivas & Asociados — causas con plazo vencido",
    evidencia: "27 causas críticas y con SLA en riesgo están concentradas en este estudio.",
    impactoEstimado: "Reduce el riesgo de incumplimiento de SLA y de pérdida de causas por prescripción.",
    confianza: "media",
  },
  {
    id: "causas-detenidas",
    texto: "Reactivar las 18 causas sin movimiento procesal hace más de 45 días.",
    segmento: "Cartera consolidada — causas sin movimiento",
    evidencia: "18 causas no registran movimiento procesal en más de 45 días.",
    impactoEstimado: "Evita riesgo de prescripción y desaceleración adicional del recupero.",
    confianza: "media",
  },
  {
    id: "gasto-alto-cuantia",
    texto: "Evaluar término anticipado de las 5 causas con gasto acumulado superior al 20% de la cuantía reclamada.",
    segmento: "Cartera consolidada — gasto elevado relativo a cuantía",
    evidencia: "5 causas acumulan gasto judicial superior al 20% del monto reclamado, con recupero aún incierto.",
    impactoEstimado: "Evita seguir invirtiendo gasto en causas de baja rentabilidad esperada.",
    confianza: "baja",
  },
];

const CONFIANZA_INFO: Record<Recomendacion["confianza"], { label: string; color: string; bg: string }> = {
  alta: { label: "Confianza alta", color: "#059669", bg: "rgba(16,185,129,0.12)" },
  media: { label: "Confianza media", color: "#B45309", bg: "rgba(245,158,11,0.14)" },
  baja: { label: "Confianza baja", color: "#6B7280", bg: "rgba(107,114,128,0.12)" },
};

function useRecomendacionesDecisiones() {
  const [decisiones, setDecisiones] = useState<Record<string, "aceptada" | "rechazada">>({});
  function onDecide(id: string, v: "aceptada" | "rechazada") {
    setDecisiones(d => ({ ...d, [id]: v }));
  }
  return { decisiones, onDecide };
}

function RecomendacionCard({ r, decision, onDecide }: { r: Recomendacion; decision?: "aceptada" | "rechazada"; onDecide: (id: string, v: "aceptada" | "rechazada") => void }) {
  const conf = CONFIANZA_INFO[r.confianza];
  return (
    <div className="rounded-xl border border-border p-4" style={{ opacity: decision === "rechazada" ? 0.55 : 1 }}>
      <div className="flex items-start gap-2.5 min-w-0">
        <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5 text-accent" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground leading-relaxed">{r.texto}</p>
          <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{r.segmento}</span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: conf.color, backgroundColor: conf.bg }}>{conf.label}</span>
          </div>
          {r.reglaActual && r.reglaPropuesta && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[12px]">
              <span className="text-muted-foreground">{r.reglaActual}</span>
              <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />
              <span className="font-medium text-foreground">{r.reglaPropuesta}</span>
            </div>
          )}
          <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed"><strong className="font-semibold text-foreground/80">Evidencia:</strong> {r.evidencia}</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed"><strong className="font-semibold text-foreground/80">Impacto estimado:</strong> {r.impactoEstimado}</p>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 mt-3">
        {decision ? (
          <span className={`inline-flex items-center gap-1 text-[12px] font-medium ${decision === "aceptada" ? "text-emerald-600" : "text-muted-foreground"}`}>
            {decision === "aceptada" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
            {decision === "aceptada" ? "Aceptada" : "Rechazada"}
          </span>
        ) : (
          <>
            <button onClick={() => onDecide(r.id, "rechazada")} className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Rechazar</button>
            <button onClick={() => onDecide(r.id, "aceptada")} className="text-[12px] font-medium text-white px-3 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: "#7C3AED" }}>Aceptar</button>
          </>
        )}
      </div>
    </div>
  );
}

function RecomendacionesDirectas({
  decisiones, onDecide, limit, onVerTodas,
}: {
  decisiones: Record<string, "aceptada" | "rechazada">;
  onDecide: (id: string, v: "aceptada" | "rechazada") => void;
  limit?: number;
  onVerTodas?: () => void;
}) {
  const lista = limit ? RECOMENDACIONES.slice(0, limit) : RECOMENDACIONES;
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between gap-3 mb-1 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Lightbulb className="w-4 h-4 shrink-0" style={{ color: "#7C3AED" }} />
          <h3 className="text-base font-semibold text-foreground">Recomendaciones</h3>
          <span className="text-[10px] font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full text-white shrink-0" style={{ backgroundColor: "#7C3AED" }}>IA</span>
        </div>
        {limit && onVerTodas && (
          <button onClick={onVerTodas} className="text-[12px] font-medium text-accent hover:underline shrink-0">
            Ver todas las recomendaciones ({RECOMENDACIONES.length}) →
          </button>
        )}
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">Calculadas a partir del histórico de la cartera, con evidencia, impacto estimado y nivel de confianza</p>
      <div className="space-y-3">
        {lista.map(r => (
          <RecomendacionCard key={r.id} r={r} decision={decisiones[r.id]} onDecide={onDecide} />
        ))}
      </div>
    </div>
  );
}

// ─── Riesgos priorizados (bloque L1 — responde "¿qué cartera está en riesgo?") ─
// Se calculan a partir de los mismos datos que ya alimentan Ranking, Gastos y
// Recomendaciones — no son datos nuevos, es una relectura priorizada de lo mismo.
export type RiesgoTarget = "ranking" | "sla" | "gastos" | "recupero";

interface RiesgoItem {
  id: string;
  label: string;
  detalle: string;
  severidad: "alta" | "media";
  target: RiesgoTarget;
  // estudioIds vacío = riesgo de cartera consolidada (siempre visible, no depende del foco)
  estudioIds: string[];
}

function estudioIdPorNombre(nombre: string): string {
  return ESTUDIOS.find(e => e.name === nombre)?.id ?? "";
}

function buildRiesgos(): RiesgoItem[] {
  const slaRiesgo = ESTUDIOS.filter(e => e.slaPct < 80);
  const recuperoBajo = ESTUDIOS.filter(e => e.recuperoPct < 60);
  const fueraDeParametro = CASE_PROFIT.filter(estaFueraDeParametro);
  const causasVencidas = CASE_PROFIT.filter(c => c.overdue);

  const items: RiesgoItem[] = [];

  if (causasVencidas.length > 0) {
    items.push({
      id: "vencidas",
      label: `${causasVencidas.length} causas con plazo vencido en la muestra de seguimiento`,
      detalle: `Concentradas en ${[...new Set(causasVencidas.map(c => c.estudio))].join(", ")}.`,
      severidad: "alta",
      target: "ranking",
      estudioIds: [...new Set(causasVencidas.map(c => estudioIdPorNombre(c.estudio)))],
    });
  }
  items.push({
    id: "detenidas",
    label: "18 causas sin movimiento procesal hace más de 45 días",
    detalle: "Riesgo de prescripción y desaceleración del recupero — ver evidencia en Recomendaciones.",
    severidad: "alta",
    target: "recupero",
    estudioIds: [],
  });
  if (slaRiesgo.length > 0) {
    items.push({
      id: "sla",
      label: `SLA bajo objetivo en ${slaRiesgo.map(e => e.name).join(" y ")}`,
      detalle: `${slaRiesgo.map(e => `${e.name} ${e.slaPct}%`).join(" · ")} — objetivo consolidado 90%.`,
      severidad: "alta",
      target: "sla",
      estudioIds: slaRiesgo.map(e => e.id),
    });
  }
  if (recuperoBajo.length > 0) {
    items.push({
      id: "recupero-bajo",
      label: `Recupero bajo el 60% de meta en ${recuperoBajo.map(e => e.name).join(" y ")}`,
      detalle: `${recuperoBajo.map(e => `${e.name} ${e.recuperoPct}%`).join(" · ")}.`,
      severidad: "media",
      target: "ranking",
      estudioIds: recuperoBajo.map(e => e.id),
    });
  }
  if (fueraDeParametro.length > 0) {
    items.push({
      id: "gastos",
      label: `${fueraDeParametro.length} causas con gasto fuera de parámetro por tramo de cuantía`,
      detalle: "Gasto elevado con recupero incierto — revisar antes de continuar invirtiendo.",
      severidad: "media",
      target: "gastos",
      estudioIds: [...new Set(fueraDeParametro.map(c => estudioIdPorNombre(c.estudio)))],
    });
  }
  return items;
}

const RIESGO_SEVERIDAD_INFO: Record<RiesgoItem["severidad"], { color: string; bg: string }> = {
  alta: { color: "#DC2626", bg: "rgba(239,68,68,0.1)" },
  media: { color: "#B45309", bg: "rgba(245,158,11,0.12)" },
};

function RiesgosPanel({ onNavigate, focoEstudio }: { onNavigate: (target: RiesgoTarget) => void; focoEstudio: string | null }) {
  const todos = buildRiesgos();
  const riesgos = focoEstudio ? todos.filter(r => r.estudioIds.length === 0 || r.estudioIds.includes(focoEstudio)) : todos;
  const nombreFoco = focoEstudio ? ESTUDIOS.find(e => e.id === focoEstudio)?.name : null;
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
        <h3 className="text-base font-semibold text-foreground">Riesgos</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">Qué cartera requiere atención primero — cada ítem abre su análisis detallado{nombreFoco ? ` · filtrado por ${nombreFoco}` : ""}</p>
      {riesgos.length === 0 ? (
        <p className="text-[12px] text-muted-foreground">{nombreFoco ? `Sin riesgos relevantes detectados para ${nombreFoco} en el período.` : "Sin riesgos relevantes detectados en el período."}</p>
      ) : (
        <div className="space-y-2">
          {riesgos.map(r => {
            const info = RIESGO_SEVERIDAD_INFO[r.severidad];
            return (
              <button
                key={r.id}
                onClick={() => onNavigate(r.target)}
                className="w-full flex items-start gap-3 p-3 rounded-xl border border-border hover:bg-gray-50/70 transition-colors text-left"
              >
                <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ backgroundColor: info.color }} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-foreground leading-relaxed">{r.label}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{r.detalle}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Selector de dimensión ─────────────────────────────────────────────────────

function PeriodoSelector({ value, onChange }: { value: PeriodoId; onChange: (p: PeriodoId) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-xl p-1 w-fit">
      {PERIODOS.map(p => {
        const on = value === p.id;
        return (
          <button
            key={p.id}
            onClick={() => onChange(p.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: on ? "var(--card)" : "transparent", color: on ? "#1755D4" : "var(--muted-foreground)", boxShadow: on ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}
          >
            {p.label}
          </button>
        );
      })}
    </div>
  );
}

function DimensionTabs({ value, onChange }: { value: Dimension; onChange: (d: Dimension) => void }) {
  return (
    <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-xl p-1 w-fit">
      {DIMENSIONS.map(d => {
        const Icon = d.icon;
        const on = value === d.id;
        return (
          <button
            key={d.id}
            onClick={() => onChange(d.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
            style={{ backgroundColor: on ? "var(--card)" : "transparent", color: on ? "#1755D4" : "var(--muted-foreground)", boxShadow: on ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}
          >
            <Icon className="w-3.5 h-3.5" />
            {d.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── Panel de análisis por dimensión ───────────────────────────────────────────

function sliceByPeriodo<T>(data: T[], periodo: PeriodoId): T[] {
  const n = periodo === "mes" ? 2 : periodo === "trimestre" ? 3 : data.length;
  return data.slice(-n);
}

function DimensionPanel({ dim, periodo }: { dim: Dimension; periodo: PeriodoId }) {
  const cfg = DIM_CHART[dim];

  if (dim === "acumulado") {
    const sliced = sliceByPeriodo(cfg.data, periodo);
    const last = sliced[sliced.length - 1];
    const brecha = last.v - last.meta;
    const onTarget = brecha >= 0;
    return (
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground">{cfg.title}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{cfg.sub}</p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground shrink-0">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />Real</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-0 border-t border-dashed inline-block" style={{ borderColor: "#9CA3AF" }} />Meta</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={sliced} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey={cfg.nameKey} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} formatter={(v: number, _name: string, props: any) => [`$${formatMontoMM(v)}`, props.dataKey === "meta" ? "Meta" : "Real"]} />
            <Area type="monotone" dataKey="v" stroke={cfg.color} strokeWidth={2.5} fill="url(#mg)" dot={{ r: 3.5, fill: cfg.color, strokeWidth: 0 }} name="Recupero" />
            <Line type="monotone" dataKey="meta" stroke="#9CA3AF" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Meta" />
          </ComposedChart>
        </ResponsiveContainer>
        <p className={`text-[12px] font-mono mt-3 ${onTarget ? "text-emerald-600" : "text-red-600"}`}>
          Brecha vs. meta ({last.x}): {onTarget ? "+" : ""}${formatMontoMM(brecha)}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">{cfg.title}</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">{cfg.sub}</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        {cfg.kind === "area" ? (
          <AreaChart data={cfg.data} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="mg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={cfg.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey={cfg.nameKey} tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} />
            <Area type="monotone" dataKey={cfg.dataKey} stroke={cfg.color} strokeWidth={2.5} fill="url(#mg)" dot={{ r: 3.5, fill: cfg.color, strokeWidth: 0 }} />
          </AreaChart>
        ) : cfg.kind === "bar" ? (
          <BarChart data={cfg.data} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey={cfg.nameKey} tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} />
            <Bar dataKey={cfg.dataKey} fill={cfg.color} radius={[6, 6, 0, 0]} />
          </BarChart>
        ) : (
          <PieChart>
            <Pie data={cfg.data} cx="50%" cy="50%" innerRadius={48} outerRadius={80} paddingAngle={2} dataKey={cfg.dataKey}>
              {cfg.data.map((e, i) => <Cell key={i} fill={e.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} />
          </PieChart>
        )}
      </ResponsiveContainer>
      {cfg.kind === "pie" && (
        <div className="grid grid-cols-2 gap-2 mt-3">
          {cfg.data.map((d: any) => (
            <div key={d.x} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-sm inline-block shrink-0" style={{ backgroundColor: d.color }} />
              <span className="text-[12px] text-muted-foreground truncate">{d.x}</span>
              <span className="text-[12px] font-mono font-semibold text-foreground ml-auto">{d.v}</span>
            </div>
          ))}
        </div>
      )}
      {dim === "plazo" && (
        <div className="mt-4 space-y-2 border-t border-border pt-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Recomendación por tramo</p>
          {cfg.data.map((d: any) => (
            <div key={d.x} className="flex items-start gap-2">
              <span className="text-[11px] font-mono font-semibold text-foreground shrink-0 w-14">{d.x}</span>
              <p className="text-[12px] text-muted-foreground leading-relaxed">{d.recomendacion}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Ranking de estudios ────────────────────────────────────────────────────────

// RF-MAN-024: además de la tasa de recupero, el Mandante quiere distinguir estudios que
// recuperan rápido (gestión extrajudicial/negociación) de los que recuperan tarde (remate judicial),
// aunque el monto final sea similar.
type RankingSort = "tasa" | "velocidad" | "score";

// Score consolidado (RF-14/RF-17/RF-18): en vez de un único criterio, el ranking
// combina 5 dimensiones con pesos explícitos.
const SCORE_PESOS = {
  tasaRecupero: 0.30,
  recuperoNeto: 0.25,
  sla: 0.20,
  velocidad: 0.15,
  calidadInfo: 0.10,
} as const;

function estudioScoreDetalle(e: (typeof ESTUDIOS)[number]) {
  const recuperoMonto = e.cuantiaAsignada * (e.recuperoPct / 100);
  const gastoTotal = e.costoProm * e.causas;
  const recuperoNetoPct = Math.max(0, Math.min(100, ((recuperoMonto - gastoTotal) / e.cuantiaAsignada) * 100));
  const score =
    SCORE_PESOS.tasaRecupero * e.recuperoPct +
    SCORE_PESOS.recuperoNeto * recuperoNetoPct +
    SCORE_PESOS.sla * e.slaPct +
    SCORE_PESOS.velocidad * e.recuperoPrimerSemestrePct +
    SCORE_PESOS.calidadInfo * e.calidadInfoPct;
  return { score, recuperoNetoPct };
}

function RankingEstudios({ onSelect, focoEstudio }: { onSelect: (id: string) => void; focoEstudio?: string | null }) {
  const [sortBy, setSortBy] = useState<RankingSort>("score");
  const withScore = ESTUDIOS.map(e => ({ ...e, ...estudioScoreDetalle(e) }));
  const sorted = [...withScore].sort((a, b) =>
    sortBy === "tasa" ? b.recuperoPct - a.recuperoPct
    : sortBy === "velocidad" ? b.recuperoPrimerSemestrePct - a.recuperoPrimerSemestrePct
    : b.score - a.score
  );
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Ranking de estudios jurídicos</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Comparativo entre los estudios que gestionan su cartera</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-1">
            {([{ id: "score", label: "Score consolidado" }, { id: "tasa", label: "Tasa recupero" }, { id: "velocidad", label: "Velocidad" }] as const).map(o => (
              <button key={o.id} onClick={() => setSortBy(o.id)} className="px-2.5 py-1 rounded-md text-[12px] font-medium transition-colors" style={{ backgroundColor: sortBy === o.id ? "var(--card)" : "transparent", color: sortBy === o.id ? "#1755D4" : "var(--muted-foreground)" }}>
                {o.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{ESTUDIOS.length} estudios</span>
        </div>
      </div>
      <div className="space-y-2.5">
        {sorted.map((e, i) => (
          <button
            key={e.id}
            onClick={() => onSelect(e.id)}
            className="w-full flex items-center gap-3 p-3 rounded-xl border hover:bg-gray-50/70 transition-colors text-left"
            style={{ borderColor: focoEstudio === e.id ? "#1755D4" : "var(--border)", backgroundColor: focoEstudio === e.id ? "rgba(23,85,212,0.06)" : "transparent" }}
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold font-mono" style={{ backgroundColor: i === 0 ? "rgba(16,185,129,0.12)" : "var(--muted)", color: i === 0 ? "#059669" : "var(--muted-foreground)" }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{e.name}</p>
              {sortBy === "score" ? (
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Recupero {e.recuperoPct}% · Neto {e.recuperoNetoPct.toFixed(0)}% · SLA {e.slaPct}% · Velocidad {e.recuperoPrimerSemestrePct}% · Calidad {e.calidadInfoPct}%
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground mt-0.5">{e.causas} causas · SLA {e.slaPct}% · {e.tiempoProm}d prom.</p>
              )}
            </div>
            {sortBy === "score" ? (
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-foreground">{e.score.toFixed(1)}</p>
                <p className="text-[11px] font-mono text-muted-foreground">score /100</p>
              </div>
            ) : sortBy === "tasa" ? (
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-foreground">{e.recuperoPct}%</p>
                <p className="text-[11px] font-mono text-muted-foreground">recupero</p>
              </div>
            ) : (
              <div className="text-right shrink-0">
                <p className="text-sm font-bold font-mono text-foreground">{e.recuperoPrimerSemestrePct}%</p>
                <p className="text-[11px] font-mono text-muted-foreground">recupero en 1er semestre</p>
              </div>
            )}
            {e.criticas > 25 && <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />}
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
          </button>
        ))}
      </div>
      {sortBy === "score" && (
        <p className="text-[11px] text-muted-foreground mt-3">Score = 30% tasa de recupero + 25% recupero neto de gastos + 20% cumplimiento SLA + 15% velocidad de recupero + 10% calidad de la información reportada.</p>
      )}
      {sortBy === "velocidad" && (
        <p className="text-[11px] text-muted-foreground mt-3">% del recupero total de la camada concentrado en los primeros 6 meses — mayor % indica mejor gestión extrajudicial/negociación temprana vs. recupero tardío vía remate judicial.</p>
      )}
    </div>
  );
}

// ─── Ranking compacto (bloque L1 — quién lidera / quién queda último) ─────────

function RankingResumen({ onVerCompleto }: { onVerCompleto: () => void }) {
  const withScore = ESTUDIOS.map(e => ({ ...e, ...estudioScoreDetalle(e) }));
  const sorted = [...withScore].sort((a, b) => b.score - a.score);
  const primero = sorted[0];
  const ultimo = sorted[sorted.length - 1];
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <h3 className="text-sm font-semibold text-foreground">Ranking de estudios — resumen</h3>
        <button onClick={onVerCompleto} className="text-[12px] font-medium text-accent hover:underline shrink-0">Ver ranking completo →</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-xl border border-border">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Lidera</p>
          <p className="text-sm font-semibold text-foreground mt-1">{primero.name}</p>
          <p className="text-[11px] font-mono mt-1" style={{ color: "#059669" }}>Score {primero.score.toFixed(1)}/100</p>
        </div>
        <div className="p-3 rounded-xl border" style={{ borderColor: "rgba(239,68,68,0.35)" }}>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Queda último</p>
          <p className="text-sm font-semibold text-foreground mt-1">{ultimo.name}</p>
          <p className="text-[11px] font-mono mt-1 text-red-600">Score {ultimo.score.toFixed(1)}/100</p>
        </div>
      </div>
    </div>
  );
}

// ─── Rentabilidad ejecutiva con drill-down por estudio ────────────────────────

function RentabilidadList({ title, subtitle, rows, tone }: { title: string; subtitle: string; rows: typeof CASE_PROFIT; tone: "pos" | "neg" }) {
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      <div className="p-4 pb-2 flex items-center gap-2">
        {tone === "pos" ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" /> : <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />}
        <div>
          <h4 className="text-xs font-semibold text-foreground">{title}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
      </div>
      <div className="divide-y divide-border">
        {rows.length === 0 && <p className="px-4 py-4 text-[12px] text-muted-foreground">Sin causas para este filtro.</p>}
        {rows.map(c => (
          <div key={c.rol} className="px-4 py-2.5 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <p className="text-[12px] font-mono font-semibold text-foreground">{c.rol}</p>
                <span className="text-[10px] text-muted-foreground">· {c.estudio}</span>
                {c.overdue && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-medium text-red-700 bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                    <Clock className="w-2.5 h-2.5" />Plazo vencido
                  </span>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate mt-0.5">{c.debtor} · cuantía {fCLP(c.cuantia)}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={`text-xs font-bold font-mono ${c.ratio >= 0 ? "text-emerald-600" : "text-red-600"}`}>{c.ratio.toFixed(1)}%</p>
              <p className="text-[10px] font-mono text-muted-foreground">{fCLP(c.margen)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RentabilidadEjecutiva({ estudiosSel, onToggleEstudio }: { estudiosSel: Set<string>; onToggleEstudio: (id: string) => void }) {
  const porEstudio = ESTUDIOS.map(e => {
    const causas = CASE_PROFIT.filter(c => c.estudio === e.name);
    const avgRatio = causas.reduce((a, c) => a + c.ratio, 0) / (causas.length || 1);
    const totalMargen = causas.reduce((a, c) => a + c.margen, 0);
    const totalGasto = causas.reduce((a, c) => a + c.gasto, 0);
    const totalRecupero = causas.reduce((a, c) => a + c.recupero, 0);
    const costoDeRecupero = totalRecupero > 0 ? totalGasto / totalRecupero : null;
    const overdueCount = causas.filter(c => c.overdue).length;
    return { estudio: e.name, id: e.id, avgRatio, totalMargen, costoDeRecupero, count: causas.length, overdueCount };
  }).sort((a, b) => b.avgRatio - a.avgRatio);

  const filtered = estudiosSel.size === 0
    ? CASE_PROFIT
    : CASE_PROFIT.filter(c => estudiosSel.has(ESTUDIOS.find(e => e.name === c.estudio)?.id ?? ""));
  const top = [...filtered].sort((a, b) => b.ratio - a.ratio).slice(0, 5);
  const bottom = [...filtered].sort((a, b) => a.ratio - b.ratio).slice(0, 5);

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground">Rentabilidad ejecutiva por estudio</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Margen neto (recupero − gasto), rentabilidad sobre cuantía y costo de recupero (gasto / recupero, menor es mejor). Use el selector de estudio de arriba para filtrar el detalle de causas.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {porEstudio.map(e => {
            const on = estudiosSel.has(e.id);
            return (
              <button
                key={e.estudio}
                onClick={() => onToggleEstudio(e.id)}
                className="text-left p-3 rounded-xl border transition-colors"
                style={{ borderColor: on ? "#1755D4" : "var(--border)", backgroundColor: on ? "rgba(23,85,212,0.06)" : "transparent" }}
              >
                <p className="text-xs font-semibold text-foreground truncate">{e.estudio}</p>
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">Margen neto</span>
                    <span className={`text-[12px] font-bold font-mono ${e.totalMargen >= 0 ? "text-emerald-600" : "text-red-600"}`}>{fCLP(e.totalMargen)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">Rentabilidad / cuantía</span>
                    <span className={`text-[12px] font-bold font-mono ${e.avgRatio >= 0 ? "text-emerald-600" : "text-red-600"}`}>{e.avgRatio.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] text-muted-foreground">Costo de recupero</span>
                    <span className="text-[12px] font-bold font-mono text-foreground">{e.costoDeRecupero != null ? `$${e.costoDeRecupero.toFixed(2)}` : "—"}</span>
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5">{e.count} causas analizadas</p>
                {e.overdueCount > 0 && (
                  <p className="text-[11px] text-red-600 font-medium mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{e.overdueCount} con plazo vencido</p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RentabilidadList title="Mayor rentabilidad" subtitle="Menor gasto relativo, mayor recupero" rows={top} tone="pos" />
        <RentabilidadList title="Menor rentabilidad" subtitle="Mayor gasto relativo, menor o nulo recupero" rows={bottom} tone="neg" />
      </div>
    </div>
  );
}

// ─── Tabla vintage / cohorte ──────────────────────────────────────────────────

const VINTAGE_PALETTE = ["#1755D4", "#10B981", "#7C3AED", "#F59E0B", "#0EA5E9", "#EF4444", "#EC4899", "#84CC16"];

function VintageCohortTable({ estudiosSel }: { estudiosSel: Set<string> }) {
  const [mode, setMode] = useState<"acumulado" | "comparativo">("acumulado");

  const avgRecupero = ESTUDIOS.reduce((a, e) => a + e.recuperoPct, 0) / ESTUDIOS.length;
  const factor = estudiosSel.size === 0
    ? 1
    : ESTUDIOS.filter(e => estudiosSel.has(e.id)).reduce((a, e) => a + e.recuperoPct, 0) / (estudiosSel.size * avgRecupero);
  // % recuperado acumulado, ajustado por el factor de desempeño de los estudios seleccionados
  const vintagePct = VINTAGE.map(row => row.map(v => v == null ? null : Math.min(99, +(v * factor).toFixed(1))));
  // Monto recuperado en millones de pesos = % × cartera asignada de esa camada
  const vintageData = vintagePct.map((row, ri) => {
    const montoCamada = VINTAGE_MONTO_CAMADA[COHORTS[ri]];
    return row.map(v => v == null ? null : Math.round((v / 100) * montoCamada));
  });
  const maxMonto = Math.max(...vintageData.flat().filter((v): v is number => v != null));

  function formatMonto(v: number): string {
    return `${v}M`;
  }

  function cellColor(v: number | null) {
    if (v == null) return { backgroundColor: "transparent" };
    const alpha = Math.min(0.85, 0.12 + (v / maxMonto) * 0.73);
    return { backgroundColor: `rgba(16,185,129,${alpha})`, color: alpha > 0.45 ? "#fff" : "#065F46" };
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Recupero por camada (vintage / cohorte)</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">Millones de pesos recuperados, acumulado por camada de originación, a 3, 6, 12 y 18 meses transcurridos</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-lg p-1">
          {(["acumulado", "comparativo"] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} className="px-2.5 py-1 rounded-md text-[12px] font-medium capitalize transition-colors" style={{ backgroundColor: mode === m ? "var(--card)" : "transparent", color: mode === m ? "#1755D4" : "var(--muted-foreground)" }}>
              {m}
            </button>
          ))}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground mb-4">{estudiosSel.size === 0 ? "Todos los estudios (agregado) — use el selector de estudio de arriba para filtrar" : `Filtrado por: ${[...estudiosSel].map(id => ESTUDIOS.find(e => e.id === id)?.name).join(", ")}`}</p>

      {mode === "acumulado" ? (
        <div className="overflow-x-auto">
          <table className="w-full text-xs border-separate" style={{ borderSpacing: "3px" }}>
            <thead>
              <tr>
                <th className="text-left px-2 py-1 text-muted-foreground font-medium text-[11px] uppercase tracking-wide">Camada</th>
                {MONTHS.map(m => (
                  <th key={m} className="text-center px-2 py-1 text-muted-foreground font-medium text-[11px] uppercase tracking-wide">{m}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COHORTS.map((c, ri) => (
                <tr key={c}>
                  <td className="px-2 py-1.5 text-[12px] font-medium text-foreground whitespace-nowrap">{c}</td>
                  {MONTHS.map((_, ci) => {
                    const v = vintageData[ri][ci];
                    return (
                      <td key={ci} className="text-center rounded-md" style={{ minWidth: 40 }}>
                        <div className="rounded-md py-1.5 text-[11px] font-mono font-semibold" style={cellColor(v)}>
                          {v != null ? formatMonto(v) : "—"}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={MONTHS.map((m, ci) => {
              const row: Record<string, any> = { mes: m };
              COHORTS.forEach((c, ri) => { row[c] = vintageData[ri][ci]; });
              return row;
            })}
            margin={{ top: 5, right: 5, bottom: 0, left: -18 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => formatMonto(v)} />
            <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} formatter={(v: number) => formatMonto(v)} />
            {COHORTS.map((c, i) => (
              <Bar key={c} dataKey={c} fill={VINTAGE_PALETTE[i % VINTAGE_PALETTE.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
      <p className="text-[11px] text-muted-foreground mt-3">Datos simulados con fines demostrativos · camadas por mes de ingreso de cartera</p>
      {estudiosSel.size > 0 && (
        <p className="text-[11px] text-muted-foreground mt-1">Valores ajustados proporcionalmente al desempeño relativo de recupero de los estudios seleccionados (estimado; no es una serie histórica de cohortes por estudio).</p>
      )}
    </div>
  );
}

// ─── Cartera administrada: distribución por empresa de cobranza ───────────────

const CARTERA_ESTUDIO_COLOR: Record<string, string> = {
  phlegal: "#1755D4", rivas: "#7C3AED", andes: "#10B981", contreras: "#F59E0B",
};
const CARTERA_ESTUDIO_KEYS = ["phlegal", "rivas", "andes", "contreras"] as const;

// Saldo de cartera bajo gestión al cierre de cada mes (stock) — coincide con
// ESTUDIOS.cuantiaAsignada al cierre de julio (mes en curso).
const CARTERA_MENSUAL: Record<(typeof CARTERA_ESTUDIO_KEYS)[number] | "mes", any>[] = [
  { mes: "Feb", phlegal: 1_180_000_000, rivas: 890_000_000, andes: 510_000_000, contreras: 290_000_000 },
  { mes: "Mar", phlegal: 1_320_000_000, rivas: 990_000_000, andes: 570_000_000, contreras: 320_000_000 },
  { mes: "Abr", phlegal: 1_430_000_000, rivas: 1_080_000_000, andes: 620_000_000, contreras: 350_000_000 },
  { mes: "May", phlegal: 1_520_000_000, rivas: 1_150_000_000, andes: 660_000_000, contreras: 375_000_000 },
  { mes: "Jun", phlegal: 1_610_000_000, rivas: 1_220_000_000, andes: 700_000_000, contreras: 400_000_000 },
  { mes: "Jul", phlegal: 1_692_000_000, rivas: 1_282_000_000, andes: 730_000_000, contreras: 416_000_000 },
];

// Cartera nueva asignada cada mes (flujo) — a diferencia del saldo, un flujo sí
// puede sumarse mes a mes sin duplicar una misma deuda.
const CARTERA_INGRESO_MENSUAL: typeof CARTERA_MENSUAL = [
  { mes: "Feb", phlegal: 210_000_000, rivas: 165_000_000, andes: 95_000_000, contreras: 55_000_000 },
  { mes: "Mar", phlegal: 200_000_000, rivas: 155_000_000, andes: 90_000_000, contreras: 52_000_000 },
  { mes: "Abr", phlegal: 180_000_000, rivas: 145_000_000, andes: 85_000_000, contreras: 50_000_000 },
  { mes: "May", phlegal: 165_000_000, rivas: 135_000_000, andes: 80_000_000, contreras: 48_000_000 },
  { mes: "Jun", phlegal: 150_000_000, rivas: 125_000_000, andes: 75_000_000, contreras: 45_000_000 },
  { mes: "Jul", phlegal: 140_000_000, rivas: 118_000_000, andes: 70_000_000, contreras: 42_000_000 },
];

function buildCarteraRows(monthly: typeof CARTERA_MENSUAL, acumulado: boolean) {
  const acc: Record<string, number> = { phlegal: 0, rivas: 0, andes: 0, contreras: 0 };
  return monthly.map((row, i) => {
    const values: any = { mes: row.mes };
    let total = 0;
    for (const k of CARTERA_ESTUDIO_KEYS) {
      const prevAcc = acc[k];
      const v = acumulado ? (acc[k] += row[k]) : row[k];
      values[k] = v;
      total += v;
      const prevV = i === 0 ? null : (acumulado ? prevAcc : monthly[i - 1][k]);
      values[`${k}Var`] = prevV ? ((v - prevV) / prevV) * 100 : null;
    }
    values.total = total;
    return values;
  });
}

function CarteraTooltip({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) {
  if (!active || !payload || !payload.length) return null;
  const total = payload[0]?.payload?.total ?? 0;
  return (
    <div style={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, background: "#fff", padding: "8px 12px" }}>
      <p style={{ fontWeight: 600, color: "#111827", marginBottom: 4 }}>{label}</p>
      {[...payload].reverse().map(p => {
        const key = p.dataKey as string;
        const nombre = ESTUDIOS.find(e => e.id === key)?.name ?? key;
        const pct = total ? (p.value / total) * 100 : 0;
        const varPct = p.payload[`${key}Var`];
        return (
          <p key={key} style={{ color: p.color, marginBottom: 2 }}>
            {nombre}: <strong>{fCLP(p.value)}</strong> ({pct.toFixed(0)}%){varPct != null ? ` · ${varPct >= 0 ? "+" : ""}${varPct.toFixed(1)}% vs. mes anterior` : ""}
          </p>
        );
      })}
      <p style={{ marginTop: 4, fontWeight: 600, color: "#111827" }}>Total: {fCLP(total)}</p>
    </div>
  );
}

function CarteraAdministradaChart() {
  const [vista, setVista] = useState<"mensual" | "acumulado" | "actual">("mensual");

  const rows = vista === "mensual" ? buildCarteraRows(CARTERA_MENSUAL, false)
    : vista === "acumulado" ? buildCarteraRows(CARTERA_INGRESO_MENSUAL, true)
    : buildCarteraRows(CARTERA_MENSUAL, false).slice(-1);

  const totalActual = rows[rows.length - 1]?.total ?? 0;

  const sub = vista === "mensual"
    ? "Saldo de cartera bajo gestión al cierre de cada mes, por empresa de cobranza"
    : vista === "acumulado"
    ? "Cartera nueva asignada, acumulada en el período (flujo — no es la suma de los saldos mensuales)"
    : "Saldo vigente a la fecha, por empresa de cobranza";

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Distribución de cartera por empresa de cobranza</h3>
          <p className="text-[12px] text-muted-foreground mt-0.5">{sub}</p>
        </div>
        <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-xl p-1 w-fit shrink-0">
          {([["mensual", "Mensual"], ["acumulado", "Acumulado"], ["actual", "Saldo actual"]] as const).map(([id, label]) => (
            <button
              key={id}
              onClick={() => setVista(id)}
              className="px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors"
              style={{
                backgroundColor: vista === id ? "#fff" : "transparent",
                color: vista === id ? "#1755D4" : "#6B7280",
                boxShadow: vista === id ? "0 1px 2px rgba(0,0,0,0.06)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xl font-semibold text-foreground mt-3 mb-1">
        Cartera {vista === "acumulado" ? "asignada (acumulada)" : "en cobranza"}: {fCLP(totalActual)}
      </p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={rows} margin={{ top: 24, right: 5, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="mes" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => fCLP(v)} />
          <Tooltip content={<CarteraTooltip />} cursor={{ fill: "rgba(23,85,212,0.04)" }} />
          {CARTERA_ESTUDIO_KEYS.map((k, i) => (
            <Bar key={k} dataKey={k} stackId="cartera" fill={CARTERA_ESTUDIO_COLOR[k]} radius={i === CARTERA_ESTUDIO_KEYS.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}>
              {i === CARTERA_ESTUDIO_KEYS.length - 1 && (
                <LabelList dataKey="total" position="top" formatter={(v: number) => fCLP(v)} style={{ fontSize: 11, fill: "#111827", fontWeight: 600 }} />
              )}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-[11px] text-muted-foreground mt-3 flex-wrap">
        {CARTERA_ESTUDIO_KEYS.map(k => (
          <span key={k} className="flex items-center gap-1.5 font-medium text-foreground">
            <span className="w-3 h-3 rounded-sm inline-block" style={{ backgroundColor: CARTERA_ESTUDIO_COLOR[k] }} />
            {ESTUDIOS.find(e => e.id === k)?.name}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Bullet Chart: Recupero vs. Cuantía ────────────────────────────────────────

function BulletRow({ estudio }: { estudio: (typeof ESTUDIOS)[number] }) {
  const recuperoMonto = estudio.cuantiaAsignada * (estudio.recuperoPct / 100);
  const metaPct = (estudio.metaMonto / estudio.cuantiaAsignada) * 100;
  const recuperoBarPct = Math.min(100, (recuperoMonto / estudio.cuantiaAsignada) * 100);
  const brecha = recuperoMonto - estudio.metaMonto;
  const onTarget = brecha >= 0;
  const gastoEstudio = estudio.costoProm * estudio.causas;
  const recuperoNeto = recuperoMonto - gastoEstudio;
  const costoEficiencia = recuperoMonto > 0 ? gastoEstudio / recuperoMonto : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 gap-2">
        <span className="text-xs font-medium text-foreground truncate">{estudio.name}</span>
        <span className="text-[11px] font-mono text-muted-foreground shrink-0">{fCLP(recuperoMonto)} recuperado / {fCLP(estudio.cuantiaAsignada)} asignado</span>
      </div>
      <div className="relative h-3 bg-gray-100 rounded-full">
        <div className="h-full rounded-full transition-all" style={{ width: `${recuperoBarPct}%`, backgroundColor: onTarget ? "#10B981" : "#F59E0B" }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gray-700 rounded-full"
          style={{ left: `${metaPct}%` }}
          title={`Meta: ${fCLP(estudio.metaMonto)}`}
        />
      </div>
      <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
        <p className={`text-[11px] font-mono ${onTarget ? "text-emerald-600" : "text-amber-600"}`}>
          {onTarget ? "+" : ""}{fCLP(brecha)} vs. meta
        </p>
        <p className="text-[11px] font-mono text-muted-foreground">
          Gasto {fCLP(gastoEstudio)} · Recupero neto <span className={recuperoNeto >= 0 ? "text-emerald-600" : "text-red-600"}>{fCLP(recuperoNeto)}</span> · Costo-eficiencia ${costoEficiencia.toFixed(2)}
        </p>
      </div>
    </div>
  );
}

function BulletChartRecuperoCuantia() {
  const promedioCostoEficiencia = ESTUDIOS.reduce((a, e) => a + (e.costoProm * e.causas) / (e.cuantiaAsignada * (e.recuperoPct / 100)), 0) / ESTUDIOS.length;
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Recupero vs. cuantía por estudio</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Barra = recupero acumulado · marca vertical = meta · escala completa = cuantía asignada</p>
      </div>
      <div className="space-y-4">
        {ESTUDIOS.map(e => <BulletRow key={e.id} estudio={e} />)}
      </div>
      <p className="text-[11px] text-muted-foreground mt-4 pt-3 border-t border-border">
        <strong className="font-semibold text-foreground/80">Costo-eficiencia</strong> = gasto / recupero (menor es mejor). Promedio entre estudios: ${promedioCostoEficiencia.toFixed(2)} por peso recuperado. Un estudio que recupera menos pero gasta proporcionalmente menos puede ser preferible a uno que recupera más gastando desproporcionadamente más.
      </p>
    </div>
  );
}

// ─── Vista ejecutiva comparativa ───────────────────────────────────────────────

function ComparativaEjecutiva({ periodoLabel }: { periodoLabel: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">Comparativa ejecutiva</h3>
      <p className="text-[12px] text-muted-foreground mb-4">{periodoLabel} vs. período anterior — consolidado todos los estudios</p>
      <div className="space-y-3.5">
        {COMPARATIVO.map(c => (
          <div key={c.metric}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-foreground font-medium">{c.metric}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Ant. {c.anterior}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold font-mono text-foreground">{c.actual}</p>
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-mono font-semibold ${c.delta >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {c.delta >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {Math.abs(c.delta)}%
                </span>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{c.causa}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Gastos judiciales ──────────────────────────────────────────────────────────

// Parámetro de gasto por tramo de cuantía — Ángelo (entrevista): "no puedo gastar
// lo mismo en una deuda de 5 millones que en una de 20 millones". El umbral se
// endurece (baja) a medida que sube la cuantía, porque el gasto absoluto permitido
// ya es mayor en términos de plata aunque el % sea menor.
const GASTO_PARAMETRO_TRAMOS = [
  { hasta: 5_000_000, pct: 0.22, label: "< $5M" },
  { hasta: 20_000_000, pct: 0.15, label: "$5M - $20M" },
  { hasta: 50_000_000, pct: 0.10, label: "$20M - $50M" },
  { hasta: Infinity, pct: 0.06, label: "> $50M" },
] as const;

function gastoParametroPct(cuantia: number): number {
  return GASTO_PARAMETRO_TRAMOS.find(t => cuantia <= t.hasta)!.pct;
}

function estaFueraDeParametro(c: { gasto: number; cuantia: number }): boolean {
  return c.gasto / c.cuantia > gastoParametroPct(c.cuantia);
}

function GastosJudiciales({ focoEstudio }: { focoEstudio?: string | null } = {}) {
  const sorted = [...GASTOS_CATEGORIAS].sort((a, b) => b.monto - a.monto);
  const nombreFoco = focoEstudio ? ESTUDIOS.find(e => e.id === focoEstudio)?.name : null;
  const base = nombreFoco ? CASE_PROFIT.filter(c => c.estudio === nombreFoco) : CASE_PROFIT;

  const fueraDeParametro = base.filter(estaFueraDeParametro);
  const gastoFueraDeParametro = fueraDeParametro.reduce((a, c) => a + c.gasto, 0);
  const sinRecupero = base.filter(c => c.recupero === 0);
  const gastoSinRecupero = sinRecupero.reduce((a, c) => a + c.gasto, 0);
  const gastoMuestra = base.reduce((a, c) => a + c.gasto, 0);
  const recuperoMuestra = base.reduce((a, c) => a + c.recupero, 0);
  const costoPorPesoRecuperado = recuperoMuestra > 0 ? gastoMuestra / recuperoMuestra : 0;
  const costoPromedioPorCausa = base.length > 0 ? gastoMuestra / base.length : 0;
  const topIneficientes = [...base].sort((a, b) => (b.gasto - b.recupero) - (a.gasto - a.recupero)).slice(0, 3);

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-foreground">Gastos judiciales por categoría</h3>
        <p className="text-[12px] text-muted-foreground mt-0.5">Distribución del gasto acumulado · {fCLP(GASTOS_TOTAL)} en el período{nombreFoco ? ` · foco: ${nombreFoco}` : ""}</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          {sorted.map(g => {
            const pct = (g.monto / GASTOS_TOTAL) * 100;
            return (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1 gap-2">
                  <span className="text-xs text-foreground font-medium truncate">{g.label}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[11px] font-mono text-muted-foreground">{fCLP(g.monto)}</span>
                    <span className={`text-[11px] font-mono font-semibold ${g.deltaPct <= 0 ? "text-emerald-600" : "text-amber-600"}`}>
                      {g.deltaPct > 0 ? "+" : ""}{g.deltaPct}%
                    </span>
                  </div>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: "#F59E0B" }} />
                </div>
              </div>
            );
          })}
        </div>
        <div>
          <p className="text-[12px] text-muted-foreground mb-2">Tendencia mensual del gasto judicial total</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={GASTOS_TREND} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="x" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} formatter={(v: number) => [`$${formatMontoMM(v)}`, "Gasto"]} />
              <Area type="monotone" dataKey="v" stroke="#F59E0B" strokeWidth={2.5} fill="url(#gg)" dot={{ r: 3.5, fill: "#F59E0B", strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-foreground mb-0.5">Eficiencia del gasto por causa</p>
        <p className="text-[11px] text-muted-foreground mb-3">Calculado sobre la muestra de causas con seguimiento detallado ({CASE_PROFIT.length} causas) — no representa el 100% de la cartera.</p>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Gasto de la muestra</p>
            <p className="text-sm font-bold font-mono text-foreground mt-1">{fCLP(gastoMuestra)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Fuera de parámetro por tramo de cuantía</p>
            <p className="text-sm font-bold font-mono text-red-600 mt-1">{fCLP(gastoFueraDeParametro)} <span className="text-[11px] font-normal text-muted-foreground">· {fueraDeParametro.length} causas</span></p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Gasto con recupero cero</p>
            <p className="text-sm font-bold font-mono text-red-600 mt-1">{fCLP(gastoSinRecupero)} <span className="text-[11px] font-normal text-muted-foreground">· {sinRecupero.length} causas</span></p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Costo por $1 recuperado</p>
            <p className="text-sm font-bold font-mono text-foreground mt-1">${costoPorPesoRecuperado.toFixed(2)}</p>
          </div>
          <div className="rounded-lg border border-border p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Costo promedio por causa</p>
            <p className="text-sm font-bold font-mono text-foreground mt-1">{fCLP(costoPromedioPorCausa)}</p>
          </div>
        </div>
        <p className="text-[11px] text-muted-foreground mt-2">Parámetro por tramo de cuantía: {GASTO_PARAMETRO_TRAMOS.map(t => `${t.label} → máx. ${(t.pct * 100).toFixed(0)}%`).join(" · ")}.</p>
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mt-4 mb-2">Causas con gasto menos eficiente</p>
        {topIneficientes.length === 0 ? (
          <EmptyState mensaje={`Sin causas con seguimiento detallado para ${nombreFoco ?? "este filtro"}.`} />
        ) : (
          <div className="space-y-1.5">
            {topIneficientes.map(c => (
              <div key={c.rol} className="flex items-center justify-between gap-2 text-[12px]">
                <span className="text-foreground font-medium truncate">{c.rol} · {c.estudio}</span>
                <span className="text-muted-foreground font-mono shrink-0">Gasto {fCLP(c.gasto)} / Recupero {fCLP(c.recupero)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Chatbot IA ────────────────────────────────────────────────────────────────

interface ChatMsg { role: "user" | "assistant"; text: string }

function answerFor(q: string): string {
  const s = q.toLowerCase();
  if (s.includes("estudio") || s.includes("ranking")) return "PH Legal lidera el ranking con 71.2% de recupero y 88.4% de cumplimiento de SLA. Contreras Legal es el estudio con menor recupero relativo (52.1%).";
  if (s.includes("crítica") || s.includes("critica") || s.includes("riesgo")) return "Hay 96 causas críticas en total, 16 vencidas hoy. Se concentran principalmente en etapas de embargo y remate en Bufete Andes y Contreras Legal.";
  if (s.includes("rentab") || s.includes("costo") || s.includes("gasto")) return "El costo judicial total es de $186M (6.5% del recupero). Las causas C-8421-2026 y C-2891-2025 muestran ratio de rentabilidad negativo y deberían revisarse primero.";
  if (s.includes("meta") || s.includes("recupero")) return "El recupero acumulado es de $2.840M, equivalente a 112% de la meta del período — 68.9% de la cartera total administrada.";
  if (s.includes("cohorte") || s.includes("vintage") || s.includes("camada")) return "La camada de Abril 2026 muestra la mejor velocidad de recuperación temprana, con 30.4% acumulado a los 3 meses de originación.";
  return "Puedo ayudarle a interpretar el estado de su cartera: pregúnteme por ranking de estudios, causas críticas, rentabilidad por causa, cumplimiento de meta o las tablas de cohorte.";
}

function IACopilotPanel({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", text: "Hola, soy el asistente IA de PHLegal 3.0. Puedo ayudarle a analizar el estado de su cartera, comparar estudios o revisar rentabilidad por causa. ¿Qué desea consultar?" },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, thinking]);

  function send() {
    const q = input.trim();
    if (!q) return;
    setMessages(m => [...m, { role: "user", text: q }]);
    setInput("");
    setThinking(true);
    setTimeout(() => {
      setMessages(m => [...m, { role: "assistant", text: answerFor(q) }]);
      setThinking(false);
    }, 900);
  }

  return (
    <div className="h-full bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border shrink-0" style={{ background: "linear-gradient(135deg, rgba(23,85,212,0.08), rgba(124,58,237,0.06))" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#1755D4" }}>
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">Asistente IA · PHLegal 3.0</p>
          <p className="text-[11px] text-muted-foreground">Consultas sobre su cartera</p>
        </div>
        <button
          onClick={onClose}
          title="Minimizar asistente"
          className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            {m.role === "assistant" && (
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5" style={{ backgroundColor: "rgba(23,85,212,0.12)" }}>
                <Bot className="w-3.5 h-3.5" style={{ color: "#1755D4" }} />
              </div>
            )}
            <div
              className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed"
              style={{
                backgroundColor: m.role === "user" ? "#1755D4" : "var(--muted)",
                color: m.role === "user" ? "#fff" : "var(--foreground)",
                borderBottomRightRadius: m.role === "user" ? 4 : 16,
                borderBottomLeftRadius: m.role === "assistant" ? 4 : 16,
              }}
            >
              {m.text}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mr-2 mt-0.5" style={{ backgroundColor: "rgba(23,85,212,0.12)" }}>
              <Bot className="w-3.5 h-3.5" style={{ color: "#1755D4" }} />
            </div>
            <div className="rounded-2xl rounded-bl-sm px-3.5 py-2.5 bg-muted flex items-center gap-1">
              {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50 animate-bounce" style={{ animationDelay: `${i * 120}ms` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="p-3 border-t border-border shrink-0 flex items-center gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter") send(); }}
          placeholder="Pregunte por su cartera, estudios, rentabilidad..."
          className="flex-1 px-3 py-2 text-xs bg-muted/60 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 placeholder:text-muted-foreground text-foreground"
        />
        <button onClick={send} className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 hover:bg-accent/85 transition-colors" style={{ backgroundColor: "#1755D4" }}>
          <Send className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Header ejecutivo ──────────────────────────────────────────────────────────

function HeaderMandante({ periodoLabel }: { periodoLabel: string }) {
  return (
    <div className="rounded-2xl border border-border p-5 flex items-center justify-between gap-4 flex-wrap" style={{ background: "linear-gradient(120deg, #1755D4, #2E6FE0)" }}>
      <div>
        <h2 className="text-lg font-semibold text-white tracking-tight leading-snug">
          Hola Angelo, acá está el resumen de las gestiones de los estudios de cobranza.
        </h2>
        <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.5)" }}>Actualizado hoy, 13 de julio de 2026 · {periodoLabel}</p>
      </div>
    </div>
  );
}

// ─── Vista principal ──────────────────────────────────────────────────────────

type Nivel = "resumen" | "detalle";

// Selector de foco de estudio (header VII.2: "Selector Estudio"). "Mandante" y
// "Cartera" no aplican a este mock de un solo mandante/cartera consolidada — se
// implementa solo el selector que sí tenía sentido y que estaba duplicado entre
// Riesgos, Ranking y Gastos. Afecta L1 y L2 sin tocar el TopBar global compartido
// con otros perfiles.
function FocoEstudioSelector({ value, onChange }: { value: string | null; onChange: (id: string | null) => void }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[11px] font-medium text-muted-foreground mr-0.5">Estudio:</span>
      <button
        onClick={() => onChange(null)}
        className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors"
        style={{ borderColor: value === null ? "#1755D4" : "var(--border)", backgroundColor: value === null ? "rgba(23,85,212,0.08)" : "transparent", color: value === null ? "#1755D4" : "var(--muted-foreground)" }}
      >
        Todos
      </button>
      {ESTUDIOS.map(e => (
        <button
          key={e.id}
          onClick={() => onChange(value === e.id ? null : e.id)}
          className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors"
          style={{ borderColor: value === e.id ? "#1755D4" : "var(--border)", backgroundColor: value === e.id ? "rgba(23,85,212,0.08)" : "transparent", color: value === e.id ? "#1755D4" : "var(--muted-foreground)" }}
        >
          {e.name}
        </button>
      ))}
    </div>
  );
}

function NivelTabs({ value, onChange }: { value: Nivel; onChange: (n: Nivel) => void }) {
  const opciones: { id: Nivel; label: string }[] = [
    { id: "resumen", label: "Resumen ejecutivo" },
    { id: "detalle", label: "Análisis detallado" },
  ];
  return (
    <div className="flex items-center gap-1 bg-muted/60 border border-border rounded-xl p-1 w-fit">
      {opciones.map(o => {
        const on = value === o.id;
        return (
          <button
            key={o.id}
            onClick={() => onChange(o.id)}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors"
            style={{ backgroundColor: on ? "var(--card)" : "transparent", color: on ? "#1755D4" : "var(--muted-foreground)", boxShadow: on ? "0 1px 2px rgba(0,0,0,0.06)" : "none" }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function MandanteView({ onOpenAnalisisAvanzado }: { onOpenAnalisisAvanzado?: () => void } = {}) {
  const [nivel, setNivel] = useState<Nivel>("resumen");
  const [dim, setDim] = useState<Dimension>("acumulado");
  const [focusEstudio, setFocusEstudio] = useState<string | null>(null);
  const [periodo, setPeriodo] = useState<PeriodoId>("trimestre");
  const [iaOpen, setIaOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const periodoLabel = PERIODOS.find(p => p.id === periodo)?.label ?? PERIODOS[0].label;
  const { decisiones, onDecide } = useRecomendacionesDecisiones();

  function irADetalle(target?: RiesgoTarget) {
    if (target === "sla") setDim("estado");
    if (target === "gastos") setDim("cuantia");
    setNivel("detalle");
  }

  function actualizar() {
    setLoading(true);
    setTimeout(() => setLoading(false), 700);
  }

  return (
    <div className="flex-1 flex flex-col lg:flex-row gap-4 p-6 overflow-hidden min-h-0">
    <div className="flex-1 overflow-auto space-y-4 min-w-0 min-h-0">
      <HeaderMandante periodoLabel={periodoLabel} />

      <div className="flex items-center justify-between flex-wrap gap-3">
        <NivelTabs value={nivel} onChange={setNivel} />
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={actualizar} disabled={loading} className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50">
            {loading ? "Actualizando…" : "↻ Actualizar"}
          </button>
          {nivel === "detalle" && onOpenAnalisisAvanzado && (
            <button onClick={onOpenAnalisisAvanzado} className="text-[12px] font-medium text-accent hover:underline shrink-0">
              Análisis avanzado (vintage, simulador, scoring) →
            </button>
          )}
        </div>
      </div>

      <FocoEstudioSelector value={focusEstudio} onChange={setFocusEstudio} />

      {nivel === "resumen" ? (
        <>
          <AISummaryCard />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {loading ? (
              KPIS.map(kpi => (
                <div key={kpi.id} className="bg-card rounded-xl border border-border p-4 animate-pulse">
                  <div className="h-3 w-20 bg-muted rounded" />
                  <div className="h-5 w-16 bg-muted rounded mt-2" />
                  <div className="h-3 w-24 bg-muted rounded mt-4" />
                  <div className="h-8 w-full bg-muted rounded mt-3" />
                </div>
              ))
            ) : (
            KPIS.map(kpi => {
              const Icon = kpi.icon;
              const estado = kpiEstado(kpi.actual, kpi.objetivo, kpi.tipo);
              const info = KPI_ESTADO_INFO[estado];
              return (
                <div key={kpi.id} title={kpi.tooltip} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide leading-tight">{kpi.label}</p>
                      <p className="text-xl font-semibold text-foreground mt-1 leading-none tracking-tight">{kpi.value}</p>
                    </div>
                    <div className={`w-8 h-8 rounded-lg ${kpi.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-3.5 h-3.5 ${kpi.ic}`} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: info.color }} />
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0" style={{ color: info.color, backgroundColor: info.bg }}>{info.label}</span>
                    <span className="text-[10px] text-muted-foreground/70 shrink-0">· objetivo {formatKpiObjetivo(kpi.objetivo, kpi.unidad)}</span>
                  </div>
                  <div className="flex items-end justify-between mt-2 gap-2">
                    <div>
                      <p className={`text-[11px] font-mono ${kpi.pos ? "text-emerald-600" : "text-red-500"}`}>{kpi.delta}</p>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">{dimFootnote(dim)}</p>
                    </div>
                    <Sparkline data={kpi.trend} color={kpi.pos ? "#10B981" : "#EF4444"} />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-2 leading-snug border-t border-border pt-2">{kpi.explicacion}</p>
                </div>
              );
            })
            )}
          </div>

          <RiesgosPanel onNavigate={irADetalle} focoEstudio={focusEstudio} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankingResumen onVerCompleto={() => setNivel("detalle")} />
            <RecomendacionesDirectas decisiones={decisiones} onDecide={onDecide} limit={2} onVerTodas={() => setNivel("detalle")} />
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs font-semibold text-foreground">Análisis por dimensión</p>
              <p className="text-[12px] text-muted-foreground">Cada métrica puede analizarse por plazo, acumulado, comparativo, estudio, cuantía o estado</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <PeriodoSelector value={periodo} onChange={setPeriodo} />
              <DimensionTabs value={dim} onChange={setDim} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <DimensionPanel dim={dim} periodo={periodo} />
            </div>
            <ComparativaEjecutiva periodoLabel={periodoLabel} />
          </div>

          <GastosJudiciales focoEstudio={focusEstudio} />

          <RankingEstudios onSelect={setFocusEstudio} focoEstudio={focusEstudio} />

          <CarteraAdministradaChart />

          <BulletChartRecuperoCuantia />

          <ProyeccionRecuperoChart />

          <SlaPorHito />

          {focusEstudio && (
            <div className="bg-accent/5 border border-accent/20 rounded-xl p-4 flex items-center justify-between">
              <p className="text-xs text-foreground">
                Filtrando detalle ejecutivo por <strong>{ESTUDIOS.find(e => e.id === focusEstudio)?.name}</strong> (drill-down simulado).
              </p>
              <button onClick={() => setFocusEstudio(null)} className="text-[12px] font-medium text-accent hover:underline">Quitar filtro</button>
            </div>
          )}

          <RecomendacionesDirectas decisiones={decisiones} onDecide={onDecide} />
        </>
      )}
    </div>

    {iaOpen ? (
      <aside className="w-full lg:w-[360px] h-[420px] lg:h-auto shrink-0 min-h-0">
        <IACopilotPanel onClose={() => setIaOpen(false)} />
      </aside>
    ) : (
      <button
        onClick={() => setIaOpen(true)}
        title="Abrir asistente IA"
        className="fixed bottom-6 right-6 flex items-center gap-2 pl-3 pr-4 py-3 rounded-full shadow-lg text-white text-xs font-medium hover:brightness-110 transition-all z-10"
        style={{ background: "linear-gradient(135deg, #1755D4, #7C3AED)" }}
      >
        <Sparkles className="w-4 h-4" />
        Asistente IA
      </button>
    )}
    </div>
  );
}

// ─── Simulador de reglas de gasto (RF-08) ──────────────────────────────────────
// Basado en la evidencia de RECOMENDACIONES "busq-neg-8m": permite simular el
// número de búsquedas negativas permitidas antes de suspender gestión en deudas
// < $8M, y ver el gasto/recupero acumulado estimado para cada valor.
const SIMULADOR_BUSQUEDAS = [
  { n: 1, gasto: 14, recupero: 32 },
  { n: 2, gasto: 30, recupero: 56 },
  { n: 3, gasto: 48, recupero: 58 },
  { n: 4, gasto: 68, recupero: 59 },
  { n: 5, gasto: 90, recupero: 59.5 },
];
const REGLA_ACTUAL_BUSQUEDAS = 3;

function SimuladorReglasGasto() {
  const [n, setN] = useState(2);
  const actual = SIMULADOR_BUSQUEDAS.find(s => s.n === REGLA_ACTUAL_BUSQUEDAS)!;
  const propuesta = SIMULADOR_BUSQUEDAS.find(s => s.n === n)!;
  const deltaGasto = propuesta.gasto - actual.gasto;
  const deltaRecupero = propuesta.recupero - actual.recupero;
  const netoActual = actual.recupero - actual.gasto;
  const netoPropuesta = propuesta.recupero - propuesta.gasto;

  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <SlidersHorizontal className="w-4 h-4 shrink-0" style={{ color: "#7C3AED" }} />
        <h3 className="text-base font-semibold text-foreground">Simulador de reglas de gasto</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">Segmento: deudas &lt; $8M · regla "búsquedas negativas antes de suspender gestión"</p>

      <label className="flex items-center gap-3 mb-4">
        <span className="text-xs font-medium text-foreground shrink-0 w-32">Búsquedas simuladas</span>
        <input type="range" min={1} max={5} step={1} value={n} onChange={e => setN(Number(e.target.value))} className="flex-1 accent-accent" />
        <span className="text-sm font-bold font-mono text-foreground w-6 text-right">{n}</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-border p-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Regla actual · {REGLA_ACTUAL_BUSQUEDAS} búsquedas</p>
          <p className="text-[12px] font-mono mt-1.5">Gasto <strong className="text-foreground">${actual.gasto}M</strong></p>
          <p className="text-[12px] font-mono">Recupero <strong className="text-foreground">${actual.recupero}M</strong></p>
          <p className="text-[12px] font-mono">Neto <strong className={netoActual >= 0 ? "text-emerald-600" : "text-red-600"}>${netoActual.toFixed(1)}M</strong></p>
        </div>
        <div className="rounded-xl border p-3" style={{ borderColor: "#7C3AED" }}>
          <p className="text-[10px] uppercase tracking-wide" style={{ color: "#7C3AED" }}>Simulación · {n} búsquedas</p>
          <p className="text-[12px] font-mono mt-1.5">Gasto <strong className="text-foreground">${propuesta.gasto}M</strong> <span className={deltaGasto <= 0 ? "text-emerald-600" : "text-amber-600"}>({deltaGasto > 0 ? "+" : ""}{deltaGasto.toFixed(1)}M)</span></p>
          <p className="text-[12px] font-mono">Recupero <strong className="text-foreground">${propuesta.recupero}M</strong> <span className={deltaRecupero >= 0 ? "text-emerald-600" : "text-red-600"}>({deltaRecupero > 0 ? "+" : ""}{deltaRecupero.toFixed(1)}M)</span></p>
          <p className="text-[12px] font-mono">Neto <strong className={netoPropuesta >= 0 ? "text-emerald-600" : "text-red-600"}>${netoPropuesta.toFixed(1)}M</strong></p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={SIMULADOR_BUSQUEDAS} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="n" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `${v} búsq.`} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} formatter={(v: number, name: string) => [`$${v}M`, name === "gasto" ? "Gasto" : "Recupero"]} />
          <Bar dataKey="gasto" fill="#F59E0B" radius={[4, 4, 0, 0]} />
          <Bar dataKey="recupero" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[11px] text-muted-foreground mt-2">Valores acumulados estimados a partir del histórico de 162 causas de este tramo (ver evidencia en Recomendaciones).</p>
    </div>
  );
}

// ─── Reglas de gasto y excepciones (RF-02/03) ──────────────────────────────────
// Ángelo (entrevista): "no puedo gastar lo mismo en una deuda de 5 millones que en
// una de 20 millones" — la regla se evalúa contra el parámetro del tramo de cuantía
// de cada causa, no contra un único umbral global.
const GASTO_EXCEPCIONES = CASE_PROFIT
  .filter(estaFueraDeParametro)
  .map(c => ({ rol: c.rol, estudio: c.estudio, gastoPct: (c.gasto / c.cuantia) * 100, parametroPct: gastoParametroPct(c.cuantia) * 100 }));

function ReglasDeGasto() {
  const [decisiones, setDecisiones] = useState<Record<string, "aprobada" | "rechazada">>({});
  function onDecide(rol: string, v: "aprobada" | "rechazada") {
    setDecisiones(d => ({ ...d, [rol]: v }));
  }
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <ShieldAlert className="w-4 h-4 shrink-0" style={{ color: "#DC2626" }} />
        <h3 className="text-base font-semibold text-foreground">Reglas de gasto y excepciones</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">
        Regla configurada por tramo de cuantía: {GASTO_PARAMETRO_TRAMOS.map(t => `${t.label} → máx. ${(t.pct * 100).toFixed(0)}%`).join(" · ")}. Causas que superan el parámetro de su tramo quedan bloqueadas para nuevo gasto hasta aprobar una excepción.
      </p>
      <div className="space-y-2">
        {GASTO_EXCEPCIONES.map(c => (
          <div key={c.rol} className="flex items-center justify-between gap-2 p-3 rounded-lg border border-border">
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{c.rol} · {c.estudio}</p>
              <p className="text-[11px] text-red-600 font-mono mt-0.5">Gasto {c.gastoPct.toFixed(1)}% de la cuantía — supera el parámetro de su tramo ({c.parametroPct.toFixed(0)}%)</p>
            </div>
            {decisiones[c.rol] ? (
              <span className={`inline-flex items-center gap-1 text-[12px] font-medium shrink-0 ${decisiones[c.rol] === "aprobada" ? "text-emerald-600" : "text-muted-foreground"}`}>
                {decisiones[c.rol] === "aprobada" ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                {decisiones[c.rol] === "aprobada" ? "Excepción aprobada" : "Rechazada"}
              </span>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => onDecide(c.rol, "rechazada")} className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1">Rechazar</button>
                <button onClick={() => onDecide(c.rol, "aprobada")} className="text-[12px] font-medium text-white px-3 py-1.5 rounded-lg transition-colors" style={{ backgroundColor: "#DC2626" }}>Aprobar excepción</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Segmentación y scoring de probabilidad de pago (RF-11/12) ────────────────
const SEGMENTACION_SCORING = [
  { segmento: "0-30d", probabilidadPago: 82, accion: "Mantener en gestión extrajudicial" },
  { segmento: "31-60d", probabilidadPago: 68, accion: "Extender gestión extrajudicial" },
  { segmento: "61-90d", probabilidadPago: 51, accion: "Evaluar retraso de judicialización" },
  { segmento: "91-180d", probabilidadPago: 24, accion: "Priorizar asignación judicial" },
  { segmento: "180d+", probabilidadPago: 9, accion: "Judicializar de inmediato" },
];

function SegmentacionScoring() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">Segmentación y scoring de probabilidad de pago</h3>
      <p className="text-[12px] text-muted-foreground mb-4">Probabilidad estimada de pago por vía extrajudicial según antigüedad de la obligación, y política sugerida por segmento</p>
      <div className="space-y-2.5">
        {SEGMENTACION_SCORING.map(s => (
          <div key={s.segmento} className="flex items-center gap-3">
            <span className="text-[11px] font-mono font-semibold text-foreground shrink-0 w-16">{s.segmento}</span>
            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${s.probabilidadPago}%`, backgroundColor: s.probabilidadPago >= 50 ? "#10B981" : s.probabilidadPago >= 25 ? "#F59E0B" : "#EF4444" }} />
            </div>
            <span className="text-[12px] font-mono font-semibold text-foreground shrink-0 w-10 text-right">{s.probabilidadPago}%</span>
            <span className="text-[11px] text-muted-foreground shrink-0 w-52 truncate">{s.accion}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Piloto: grupo tratamiento vs. control (RF-13) ─────────────────────────────
const PILOTO_GASTO = [
  { grupo: "Control · antes", gasto: 1.24, recupero: 61 },
  { grupo: "Control · después", gasto: 1.21, recupero: 60 },
  { grupo: "Tratamiento · antes", gasto: 1.26, recupero: 60 },
  { grupo: "Tratamiento · después", gasto: 0.89, recupero: 58 },
];

function PilotoGrupoControl() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <Users className="w-4 h-4 shrink-0" style={{ color: "#0EA5E9" }} />
        <h3 className="text-base font-semibold text-foreground">Piloto: grupo tratamiento vs. control</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">Regla piloteada: 2 búsquedas negativas en deudas &lt; $8M (segmento tratamiento) vs. regla vigente sin cambios (segmento control)</p>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={PILOTO_GASTO} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
          <XAxis dataKey="grupo" tick={{ fontSize: 10, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `$${v}M`} />
          <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} formatter={(v: number) => [`$${v}M`, "Gasto promedio por causa"]} />
          <Bar dataKey="gasto" fill="#0EA5E9" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="text-[12px] text-foreground mt-3 leading-relaxed">
        El grupo <strong>tratamiento</strong> redujo el gasto promedio por causa en <strong className="text-emerald-600">29%</strong> (de $1.26M a $0.89M), con una variación menor en recupero (-2 pts). El grupo <strong>control</strong> se mantuvo prácticamente estable. Esto confirma el impacto estimado por el simulador de reglas de gasto.
      </p>
    </div>
  );
}

// ─── SLA configurable por hito (RF-15) ─────────────────────────────────────────
// Tiempos por hito según cita textual de Ángelo (entrevista): "tengo 5 días para
// que ingrese la demanda, 60 días para que notifique, si es en regiones 90...
// si es después de embargo 30, si es después de incautación 120".
const SLA_HITOS = [
  { hito: "Ingreso de demanda", objetivoDias: 5, cumplimientoPct: 94 },
  { hito: "Notificación judicial (90 en regiones)", objetivoDias: 60, cumplimientoPct: 81 },
  { hito: "Posterior a embargo", objetivoDias: 30, cumplimientoPct: 76 },
  { hito: "Posterior a incautación", objetivoDias: 120, cumplimientoPct: 68 },
];

function SlaPorHito() {
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <h3 className="text-sm font-semibold text-foreground mb-0.5">SLA por hito procesal</h3>
      <p className="text-[12px] text-muted-foreground mb-4">Cumplimiento configurado por etapa, con objetivo de días y tolerancia individual (no un único SLA agregado)</p>
      <div className="space-y-3">
        {SLA_HITOS.map(h => {
          const estado = h.cumplimientoPct >= 90 ? "verde" : h.cumplimientoPct >= 75 ? "amarillo" : "rojo";
          const info = KPI_ESTADO_INFO[estado];
          return (
            <div key={h.hito} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{h.hito}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">Objetivo: {h.objetivoDias} días</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full" style={{ color: info.color, backgroundColor: info.bg }}>{info.label}</span>
                <span className="text-sm font-bold font-mono text-foreground w-12 text-right">{h.cumplimientoPct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Calidad de datos por estudio (RF-19/20) ───────────────────────────────────
// Detección de anomalías (Ángelo, entrevista): "si un estudio tiene el 80% de
// contacto y el promedio de los demás es 40%, ese dato está mal" — esto es una
// capa distinta de la completitud de campos: compara el comportamiento reportado
// de cada estudio contra el promedio de sus pares y marca desviaciones grandes.
const ANOMALIA_DESVIACION_PCT = 20;

function detectarAnomaliasContacto() {
  return ESTUDIOS.map(e => {
    const otros = ESTUDIOS.filter(o => o.id !== e.id);
    const promedioOtros = otros.reduce((a, o) => a + o.contactoPct, 0) / otros.length;
    const desviacion = e.contactoPct - promedioOtros;
    return { estudio: e.name, contactoPct: e.contactoPct, promedioOtros, desviacion, anomalo: Math.abs(desviacion) >= ANOMALIA_DESVIACION_PCT };
  });
}

function CalidadDeDatos() {
  const datos = ESTUDIOS.map(e => ({
    estudio: e.name,
    calidad: e.calidadInfoPct,
    camposFaltantes: Math.round((100 - e.calidadInfoPct) * 1.2),
    inconsistencias: Math.round((100 - e.calidadInfoPct) * 0.4),
  }));
  const anomalias = detectarAnomaliasContacto().filter(a => a.anomalo);
  return (
    <div className="bg-card rounded-xl border border-border p-5">
      <div className="flex items-center gap-2.5 mb-1">
        <Database className="w-4 h-4 shrink-0" style={{ color: "#6B7280" }} />
        <h3 className="text-base font-semibold text-foreground">Calidad de datos por estudio</h3>
      </div>
      <p className="text-[12px] text-muted-foreground mb-4">% de campos obligatorios completos y consistentes en las cargas de causas reportadas por cada estudio</p>
      <div className="space-y-3">
        {datos.map(d => (
          <div key={d.estudio}>
            <div className="flex items-center justify-between mb-1 gap-2">
              <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                {d.calidad < 80 && <ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />}
                {d.estudio}
              </span>
              <span className="text-[11px] font-mono text-muted-foreground shrink-0">{d.camposFaltantes} campos faltantes · {d.inconsistencias} inconsistencias</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${d.calidad}%`, backgroundColor: d.calidad >= 90 ? "#10B981" : d.calidad >= 80 ? "#F59E0B" : "#EF4444" }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />Estudios bajo 80% de calidad quedan marcados para revisión antes de incorporar sus métricas al score consolidado del ranking.</p>

      <div className="mt-4 pt-4 border-t border-border">
        <p className="text-xs font-semibold text-foreground mb-0.5">Anomalías de comportamiento reportado</p>
        <p className="text-[11px] text-muted-foreground mb-2">Distinto de la completitud: compara la tasa de contacto de cada estudio contra el promedio de sus pares y marca desviaciones ≥ {ANOMALIA_DESVIACION_PCT} puntos — señal de que el dato reportado podría estar mal, no solo incompleto.</p>
        {anomalias.length === 0 ? (
          <p className="text-[11px] text-muted-foreground">Sin anomalías detectadas en el período.</p>
        ) : (
          <div className="space-y-1.5">
            {anomalias.map(a => (
              <div key={a.estudio} className="flex items-center justify-between gap-2 p-2.5 rounded-lg border" style={{ borderColor: "rgba(239,68,68,0.3)", backgroundColor: "rgba(239,68,68,0.05)" }}>
                <span className="text-xs font-medium text-foreground flex items-center gap-1.5"><ShieldAlert className="w-3.5 h-3.5 text-red-500 shrink-0" />{a.estudio}</span>
                <span className="text-[11px] font-mono text-red-600">{a.contactoPct}% de contacto vs. {a.promedioOtros.toFixed(0)}% promedio de pares ({a.desviacion > 0 ? "+" : ""}{a.desviacion.toFixed(0)} pts)</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Selector de estudio consolidado (reemplaza los filtros duplicados que ─────
// tenían Vintage y Rentabilidad ejecutiva, cada uno con su propio estado local) ─
function EstudioFilterBar({ estudiosSel, onToggle }: { estudiosSel: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-2 flex-wrap">
      <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mr-1">Estudio</span>
      {ESTUDIOS.map(e => {
        const on = estudiosSel.has(e.id);
        return (
          <button
            key={e.id}
            onClick={() => onToggle(e.id)}
            className="text-[11px] font-medium px-2.5 py-1 rounded-full border transition-colors"
            style={{ borderColor: on ? "#1755D4" : "var(--border)", backgroundColor: on ? "rgba(23,85,212,0.08)" : "transparent", color: on ? "#1755D4" : "var(--muted-foreground)" }}
          >
            {e.name}
          </button>
        );
      })}
      {estudiosSel.size === 0 && <span className="text-[11px] text-muted-foreground">Todos (agregado) — afecta Vintage y Rentabilidad ejecutiva</span>}
    </div>
  );
}

// ─── Inteligencia de Cartera ───────────────────────────────────────────────────

export function InteligenciaCarteraView() {
  const [estudiosSel, setEstudiosSel] = useState<Set<string>>(new Set());
  function toggleEstudio(id: string) {
    setEstudiosSel(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4 min-h-0">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs font-semibold text-amber-800">Análisis avanzado</p>
        <p className="text-[12px] text-amber-700 mt-1 leading-relaxed">
          Vista de profundidad analista: cohortes, simulación de reglas, scoring predictivo y gobierno de datos. Para la lectura ejecutiva de la cartera, use el Dashboard (Resumen ejecutivo / Análisis detallado).
        </p>
      </div>
      <EstudioFilterBar estudiosSel={estudiosSel} onToggle={toggleEstudio} />
      <VintageCohortTable estudiosSel={estudiosSel} />
      <RentabilidadEjecutiva estudiosSel={estudiosSel} onToggleEstudio={toggleEstudio} />
      <SimuladorReglasGasto />
      <ReglasDeGasto />
      <SegmentacionScoring />
      <PilotoGrupoControl />
      <CalidadDeDatos />
    </div>
  );
}

// ─── Reporte ejecutivo de una página (botón discreto del header) ──────────────
// Documento HTML autocontenido (estilos inline, sin dependencias externas) para
// que Ángelo lo revise antes de entrar a la plataforma. Se abre en una pestaña
// nueva; desde ahí, Ctrl/Cmd+P → "Guardar como PDF" produce el PDF real —
// no se agrega una librería de PDF nueva solo para esta demostración.

function svgRecuperoMensual(): string {
  const data = DIM_CHART.acumulado.data;
  const w = 560, h = 185, padL = 6, padR = 6, padB = 22, padT = 22;
  const maxV = Math.max(...data.map(d => Math.max(d.v, d.meta)));
  const plotW = w - padL - padR;
  const bw = plotW / data.length;
  const bars = data.map((d, i) => {
    const barH = ((h - padB - padT) * d.v) / maxV;
    const x = padL + i * bw + bw * 0.22;
    const barW = bw * 0.56;
    const y = h - padB - barH;
    const metaY = h - padB - ((h - padB - padT) * d.meta) / maxV;
    return `<text x="${(x + barW / 2).toFixed(1)}" y="${(y - 6).toFixed(1)}" font-size="10.5" fill="#1755D4" font-weight="700" text-anchor="middle" font-family="system-ui">$${d.v}M</text>` +
      `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${barH.toFixed(1)}" rx="3" fill="#1755D4"/>` +
      `<line x1="${(x - 3).toFixed(1)}" y1="${metaY.toFixed(1)}" x2="${(x + barW + 3).toFixed(1)}" y2="${metaY.toFixed(1)}" stroke="#F59E0B" stroke-width="2" stroke-dasharray="4,2"/>` +
      `<text x="${(x + barW / 2).toFixed(1)}" y="${h - 6}" font-size="10" fill="#6B7280" text-anchor="middle" font-family="system-ui">${d.x}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg">${bars}</svg>`;
}

function svgRankingEstudios(): string {
  const withScore = ESTUDIOS.map(e => ({ ...e, ...estudioScoreDetalle(e) })).sort((a, b) => b.score - a.score);
  const w = 320, rowH = 30;
  const h = rowH * withScore.length + 6;
  const rows = withScore.map((e, i) => {
    const barW = 170 * (e.score / 100);
    const y = i * rowH + 6;
    const color = i === 0 ? "#10B981" : i === withScore.length - 1 ? "#EF4444" : "#1755D4";
    return `<text x="0" y="${y + 13}" font-size="11" fill="#111827" font-weight="600" font-family="system-ui">${e.name}</text>` +
      `<rect x="118" y="${y}" width="170" height="16" rx="4" fill="#F3F4F6"/>` +
      `<rect x="118" y="${y}" width="${barW.toFixed(1)}" height="16" rx="4" fill="${color}"/>` +
      `<text x="${118 + 170 + 8}" y="${y + 13}" font-size="11" fill="#111827" font-weight="700" font-family="system-ui">${e.score.toFixed(1)}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${w} ${h}" width="100%" height="${h}" xmlns="http://www.w3.org/2000/svg">${rows}</svg>`;
}

const REPORTE_DONUT_COLORS = ["#1755D4", "#7C3AED", "#0EA5E9", "#F59E0B", "#10B981", "#EF4444"];

function buildGastoDonut(): { gradient: string; legend: string } {
  let acc = 0;
  const sorted = [...GASTOS_CATEGORIAS].sort((a, b) => b.monto - a.monto);
  const stops = sorted.map((g, i) => {
    const start = (acc / GASTOS_TOTAL) * 360;
    acc += g.monto;
    const end = (acc / GASTOS_TOTAL) * 360;
    return `${REPORTE_DONUT_COLORS[i % REPORTE_DONUT_COLORS.length]} ${start.toFixed(1)}deg ${end.toFixed(1)}deg`;
  }).join(", ");
  const legend = sorted.map((g, i) =>
    `<div class="legend-item"><span class="dot" style="background:${REPORTE_DONUT_COLORS[i % REPORTE_DONUT_COLORS.length]}"></span>${g.label} · ${fCLP(g.monto)}</div>`
  ).join("");
  return { gradient: stops, legend };
}

function kpiCardHTML(id: string): string {
  const kpi = KPIS.find(k => k.id === id)!;
  const estado = kpiEstado(kpi.actual, kpi.objetivo, kpi.tipo);
  const info = KPI_ESTADO_INFO[estado];
  const arrow = kpi.pos ? "▲" : "▼";
  return `
    <div class="kpi" style="background: linear-gradient(165deg, ${info.bg} 0%, #ffffff 60%); border-color: ${info.color}30;">
      <div class="kpi-top" style="background:${info.color}"></div>
      <p class="kpi-label">${kpi.label}</p>
      <p class="kpi-value">${kpi.value}</p>
      <div class="kpi-badge" style="color:${info.color};background:${info.bg}">${info.label}</div>
      <p class="kpi-delta" style="color:${kpi.pos ? "#059669" : "#DC2626"}">${arrow} ${kpi.delta}</p>
    </div>`;
}

function generarReporteEjecutivoHTML(): string {
  const riesgos = buildRiesgos().slice(0, 3);
  const recomendacion = RECOMENDACIONES[0];
  const donut = buildGastoDonut();
  const fecha = new Date().toLocaleDateString("es-CL", { day: "2-digit", month: "long", year: "numeric" });

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Reporte Ejecutivo · PHLegal 3.0</title>
<style>
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif; color: #111827; background: #F3F4F6; }
  .page { max-width: 1080px; margin: 0 auto; background: #fff; padding: 28px 34px; }
  .header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 16px; border-bottom: 2px solid #1755D4; margin-bottom: 18px; }
  .brand { display: flex; align-items: center; gap: 10px; }
  .brand .logo { width: 34px; height: 34px; border-radius: 9px; background: linear-gradient(135deg,#1755D4,#7C3AED); }
  .brand h1 { font-size: 15px; margin: 0; }
  .brand p { font-size: 11px; color: #6B7280; margin: 1px 0 0; }
  .header .meta { text-align: right; font-size: 11px; color: #6B7280; }
  .header .meta strong { color: #111827; font-size: 13px; display:block; }
  h2 { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #6B7280; margin: 0 0 10px; }
  .card { background: #fff; border: 1px solid #E5E7EB; border-radius: 12px; padding: 14px; }
  .kpis { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; margin-bottom: 18px; }
  .kpi { position: relative; overflow: hidden; border: 1px solid #E5E7EB; border-radius: 14px; padding: 14px 12px 12px; box-shadow: 0 2px 8px rgba(17,24,39,0.06); }
  .kpi-top { position: absolute; top: 0; left: 0; right: 0; height: 4px; }
  .kpi-label { font-size: 9.5px; font-weight: 600; text-transform: uppercase; letter-spacing: .03em; color: #6B7280; margin: 4px 0 0; }
  .kpi-value { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin: 4px 0 6px; }
  .kpi-badge { display: inline-block; font-size: 9px; font-weight: 700; padding: 2px 8px; border-radius: 999px; }
  .kpi-delta { font-size: 10.5px; font-weight: 600; margin: 4px 0 0; }
  .grid3 { display: grid; grid-template-columns: 1.3fr 1fr 1fr; gap: 14px; margin-bottom: 16px; }
  .grid2 { display: grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
  .legend-item { font-size: 10px; color: #374151; display: flex; align-items: center; gap: 6px; margin-top: 4px; }
  .dot { width: 8px; height: 8px; border-radius: 999px; display: inline-block; }
  .donut-wrap { display: flex; align-items: center; gap: 14px; }
  .donut { width: 96px; height: 96px; border-radius: 50%; flex-shrink: 0; display:flex; align-items:center; justify-content:center; }
  .donut-hole { width: 52px; height: 52px; border-radius: 50%; background: #fff; }
  .riesgo-item { font-size: 11px; padding: 8px 0; border-bottom: 1px solid #F3F4F6; }
  .riesgo-item:last-child { border-bottom: none; }
  .riesgo-item .label { font-weight: 600; color: #111827; }
  .riesgo-item .detalle { color: #6B7280; margin-top: 2px; }
  .reco-card { border-left: 3px solid #7C3AED; padding-left: 12px; }
  .reco-card .texto { font-size: 12.5px; font-weight: 600; margin: 0 0 6px; }
  .reco-card .tag { font-size: 9.5px; font-weight: 700; color: #059669; background: rgba(16,185,129,.12); padding: 2px 8px; border-radius: 999px; display: inline-block; margin-bottom: 6px; }
  .reco-card .line { font-size: 11px; color: #374151; margin: 3px 0; }
  .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #E5E7EB; font-size: 9.5px; color: #9CA3AF; text-align: center; }
  .toolbar { max-width: 1080px; margin: 10px auto 0; text-align: center; }
  .toolbar button { font-family: inherit; font-size: 12px; padding: 8px 16px; border-radius: 8px; border: none; background: #1755D4; color: #fff; cursor: pointer; }
  @media print {
    body { background: #fff; }
    .toolbar { display: none; }
    .page { box-shadow: none; padding: 8mm; }
    @page { size: A4 landscape; margin: 8mm; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="brand">
        <div class="logo"></div>
        <div>
          <h1>Reporte Ejecutivo · PHLegal 3.0</h1>
          <p>Cartera de cobranza judicial — Tanner Servicios Financieros</p>
        </div>
      </div>
      <div class="meta">
        <strong>${fecha}</strong>
        Trimestre actual · datos simulados
      </div>
    </div>

    <div class="kpis">
      ${["cartera", "recupero", "meta", "costo", "rentabilidad", "sla"].map(kpiCardHTML).join("")}
    </div>

    <div class="grid3">
      <div class="card">
        <h2>Recupero mensual vs. meta</h2>
        ${svgRecuperoMensual()}
      </div>
      <div class="card">
        <h2>Ranking de estudios (score)</h2>
        ${svgRankingEstudios()}
      </div>
      <div class="card">
        <h2>Gasto judicial por categoría</h2>
        <div class="donut-wrap">
          <div class="donut" style="background: conic-gradient(${donut.gradient});"><div class="donut-hole"></div></div>
          <div>${donut.legend}</div>
        </div>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <h2>Riesgos principales</h2>
        ${riesgos.map(r => `<div class="riesgo-item"><p class="label">${r.label}</p><p class="detalle">${r.detalle}</p></div>`).join("")}
      </div>
      <div class="card reco-card">
        <h2>Recomendación destacada de la IA</h2>
        <span class="tag">Confianza ${recomendacion.confianza}</span>
        <p class="texto">${recomendacion.texto}</p>
        <p class="line"><strong>Evidencia:</strong> ${recomendacion.evidencia}</p>
        <p class="line"><strong>Impacto estimado:</strong> ${recomendacion.impactoEstimado}</p>
      </div>
    </div>

    <div class="footer">Generado automáticamente por PHLegal 3.0 · datos simulados con fines demostrativos · ${fecha}</div>
  </div>
  <div class="toolbar"><button onclick="window.print()">Guardar como PDF (Ctrl/Cmd + P)</button></div>
</body>
</html>`;
}

export function abrirReporteEjecutivo(): void {
  const html = generarReporteEjecutivoHTML();
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  window.open(url, "_blank");
}

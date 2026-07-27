import React, { useMemo, useState, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Inbox, FileCheck2, Send, ShieldAlert, FileQuestion, MessageSquare,
  Clock, AlertTriangle, ChevronDown, ChevronRight, Search, X, Check,
  ArrowRight, ArrowLeft, Plus, Download, Eye, MoreHorizontal, Sparkles, MapPin,
  TrendingUp, TrendingDown, Landmark, Filter, CalendarClock,
  FileText, Gavel, Users, CheckCircle2, Circle, Bell, RefreshCw, Loader2, Pencil,
  History, Phone, Headphones, MessageCircle, Mail, User, HelpCircle, Reply,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { fetchListadoCausas, fetchCausaDetalle, fetchProcuradores, fetchMiCartera, type CausaListadoItem, type CausaWeb, type MiCarteraCausaItem } from "../lib/api";

// ─── Tipos ──────────────────────────────────────────────────────────────────

type EstadoSLA = "estandar" | "limite" | "fuera";
type AccionTipo = "apercibimiento" | "despachese" | "designacion_martillero" | "fuerza_publica" | "previo" | "consulta";

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
  semaforo?: "VERDE" | "AMARILLO" | "ROJO";
  accionTipo: AccionTipo;
  plazo?: string;
  plazoUrgente?: boolean;
  autor?: string;
  detalle?: string;
  fechaRealizacion?: string;
  fechaSolicitud?: string;
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

// ─── Mis Causas (detalle de causa) ─────────────────────────────────────────

interface TramiteRow {
  folio: number;
  fecha: string;
  etapa: string;
  tramite: "Resolución" | "Escrito" | "Actuación Receptor" | "";
  descTramite: string;
  anexo?: boolean;
  pdfUrl?: string;
}

interface Litigante {
  nombre: string;
  rut: string;
  calidad: string;
  tipo: "NATURAL" | "JURIDICA";
}

interface ExhortoRow {
  rol: string;
  fechaIngreso: string;
  tribunal: string;
  estado: string;
}

interface CausaDetalle {
  rol: string;
  pagare: string;
  tribunal: string;
  cliente: string;
  procurador: string;
  fechaIngreso: string;
  etapa: string;
  estadoAdm: "Sin archivar" | "Archivada";
  procedimiento: string;
  estadoCausa?: "ACTIVO" | "INACTIVADO";
  semaforo?: "VERDE" | "AMARILLO" | "ROJO";
  estadoCRM?: string;
  subestadoCRM?: string;
  ubicacion: "Digital" | "Física";
  estadoProc: "Tramitación" | "Concluido";
  causaOrigenRol?: string;
  badge?: string;
  nroPagare: string;
  remate?: string;
  abogadoPatrocinante: string;
  cuadernos: string[];
  historia: TramiteRow[];
  litigantes: Litigante[];
  exhortos: ExhortoRow[];
}

interface HistItem {
  fecha: string;
  autor: string;
  texto: string;
  tipo: "estado" | "tarea" | "documento" | "tribunal" | "jefatura" | "contacto" | "observacion";
  canal?: "telefono" | "whatsapp" | "mail" | "presencial";
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
  designacion_martillero: { label: "Designación de martillero", icon: Gavel, actionLabel: "Designar martillero", hint: "Remate: pendiente designación de martillero público" },
  fuerza_publica: { label: "Solicitar fuerza pública", icon: ShieldAlert, actionLabel: "Generar escrito", hint: "Oposición al retiro registrada" },
  previo: { label: "Cumplir lo ordenado", icon: FileQuestion, actionLabel: "Revisar y responder", hint: "Previo a proveer del tribunal" },
  consulta: { label: "Responder consulta", icon: MessageSquare, actionLabel: "Responder", hint: "Consulta de jefatura sobre la causa" },
};

const ESTADO_META: Record<EstadoSLA, { label: string; dot: string; bg: string; text: string; border: string; hoverBorder: string }> = {
  estandar: { label: "Gestionada", dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200", hoverBorder: "hover:border-emerald-400" },
  limite: { label: "Límite", dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200", hoverBorder: "hover:border-amber-400" },
  fuera: { label: "Crítico", dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", border: "border-red-200", hoverBorder: "hover:border-red-400" },
};

function normalizarTexto(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

// El texto real del subestado en el CRM trae palabras extra que varían
// (ej. "ACOMPAÑA DOCUMENTOS AL TRIBUNAL", no solo "Acompaña documentos"), así
// que no se puede filtrar server-side por igualdad exacta: se pide toda la
// cartera y se matchea por substring normalizado (sin tildes, minúsculas).
function accionTipoParaSubestado(subestado: string | null | undefined): AccionTipo | undefined {
  if (!subestado) return undefined;
  const n = normalizarTexto(subestado);
  if (n.includes("acompana documentos")) return "apercibimiento";
  if (n.includes("cumple lo ordenado") || n.includes("cumplir lo ordenado")) return "previo";
  if (n.includes("solicita fuerza publica") || n.includes("solicitar fuerza publica")) return "fuerza_publica";
  return undefined;
}

function primerLitiganteDeudor(cuadernos: CausaWeb["cuadernos"]): string {
  for (const cuad of cuadernos) {
    const deudor = cuad.litigantes.find(l => normalizarTexto(l.calidad).includes("ddo"));
    if (deudor) return deudor.nombre;
  }
  return cuadernos[0]?.litigantes[0]?.nombre ?? "-";
}

// Trae toda la cartera real del procurador logueado (el servidor ya fuerza
// el procurador_id de la sesión) y arma la bandeja con las causas cuyo
// subestado matchea alguno de los 3 buckets de gestión (ver
// accionTipoParaSubestado). /mi_cartera ya trae cuantia, subestado, color y
// causa_id, así que solo se pide el detalle (fetchCausaDetalle) para
// completar el nombre del deudor, que ese endpoint no entrega.
async function cargarBandejaDesdeApi(): Promise<WorkItem[]> {
  const PAGE_SIZE = 200;
  const MAX_PAGINAS = 15;
  const todas: MiCarteraCausaItem[] = [];
  for (let page = 1; page <= MAX_PAGINAS; page++) {
    const data = await fetchMiCartera({ page, page_size: PAGE_SIZE });
    todas.push(...data.causas);
    if (data.causas.length < PAGE_SIZE) break;
  }
  const candidatas = todas.filter(c => accionTipoParaSubestado(c.subestado) !== undefined);

  const CONCURRENCIA = 6;
  const items: WorkItem[] = [];
  for (let i = 0; i < candidatas.length; i += CONCURRENCIA) {
    const lote = candidatas.filter(c => c.causa_id != null).slice(i, i + CONCURRENCIA);
    const detalles = await Promise.all(
      lote.map(c => fetchCausaDetalle(c.causa_id!).catch(() => null))
    );
    detalles.forEach((detalle, idx) => {
      const causa = lote[idx];
      const accionTipo = accionTipoParaSubestado(causa.subestado);
      if (!accionTipo) return;
      items.push({
        id: String(causa.causa_id),
        rol: causa.rol,
        deudor: detalle ? primerLitiganteDeudor(detalle.cuadernos) : "-",
        tribunal: causa.tribunal,
        mandante: causa.cliente ?? "-",
        cuantia: causa.cuantia ?? 0,
        exhorto: causa.con_exhorto ?? false,
        tribunalExhortado: detalle?.exhortos_asociados[0]?.tribunal_nombre,
        estado: SEMAFORO_A_ESTADO[causa.color as "VERDE" | "AMARILLO" | "ROJO"] ?? "estandar",
        semaforo: ["VERDE", "AMARILLO", "ROJO"].includes(causa.color) ? (causa.color as "VERDE" | "AMARILLO" | "ROJO") : undefined,
        accionTipo,
        fechaSolicitud: causa.fecha_ingreso ?? undefined,
      });
    });
  }
  return items;
}

const WORK_ITEMS: WorkItem[] = [
  { id: "w1", rol: "C-7199-2026", deudor: "Roberto Martínez Silva", tribunal: "2° Juzgado Civil Santiago", mandante: "SNC", cuantia: 89200000, exhorto: false, estado: "fuera", accionTipo: "apercibimiento", plazo: "Vence esta semana 18:00", plazoUrgente: true , fechaSolicitud: "2026-07-21" },
  { id: "w2", rol: "C-3211-2026", deudor: "Alejandro Vásquez Moreno", tribunal: "1° Juzgado Civil Puente Alto", mandante: "ITAU", cuantia: 6200000, exhorto: false, estado: "fuera", accionTipo: "apercibimiento", plazo: "Vence esta semana 18:00", plazoUrgente: true , fechaSolicitud: "2026-07-20" },
  { id: "w3", rol: "C-9187-2026", deudor: "Jorge Salinas Bravo", tribunal: "4° Juzgado Civil Santiago", mandante: "SNC", cuantia: 12800000, exhorto: true, tribunalExhortado: "Juzgado de Letras de Rancagua", estado: "limite", accionTipo: "apercibimiento", plazo: "Vence prox semana 12:00" , fechaSolicitud: "2026-07-17" },
  { id: "w4", rol: "C-6812-2026", deudor: "Inversiones Torres SpA", tribunal: "3° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 45800000, exhorto: false, estado: "estandar", accionTipo: "despachese", plazo: "Vie 12:00" , fechaSolicitud: "2026-07-16" },
  { id: "w5", rol: "C-5541-2026", deudor: "María Isabel Rojas Vega", tribunal: "2° Juzgado Civil Santiago", mandante: "SNC", cuantia: 8750000, exhorto: false, estado: "estandar", accionTipo: "despachese", plazo: "Vie 12:00" , fechaSolicitud: "2026-07-15" },
  { id: "w6", rol: "C-4820-2026", deudor: "Pedro Andrés Muñoz Riquelme", tribunal: "1° Juzgado Civil Santiago", mandante: "TSF", cuantia: 18200000, exhorto: true, tribunalExhortado: "Juzgado de Letras de Talca", estado: "estandar", accionTipo: "despachese", plazo: "Vence en +1 semana 10:00" , fechaSolicitud: "2026-07-21" },
  { id: "w7", rol: "C-3914-2026", deudor: "Comercial Andina Ltda.", tribunal: "5° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 32100000, exhorto: false, estado: "limite", accionTipo: "fuerza_publica", plazo: "Vence prox semana 09:00" , fechaSolicitud: "2026-07-20" },
  { id: "w8", rol: "C-2891-2025", deudor: "Soc. Constructora Sur S.A.", tribunal: "7° Juzgado Civil Santiago", mandante: "SNC", cuantia: 156000000, exhorto: false, estado: "limite", accionTipo: "fuerza_publica", plazo: "Vence prox semana 09:00" , fechaSolicitud: "2026-07-17" },
  { id: "w9", rol: "C-6650-2026", deudor: "Enrique Paredes Núñez", tribunal: "3° Juzgado Civil Santiago", mandante: "SNC", cuantia: 27400000, exhorto: false, estado: "estandar", accionTipo: "fuerza_publica", plazo: "Vence en +1 semana 09:00" , fechaSolicitud: "2026-07-16" },
  { id: "w10", rol: "C-4477-2026", deudor: "Patricio Lemus Ortiz", tribunal: "8° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 18300000, exhorto: false, estado: "fuera", accionTipo: "previo", plazo: "Vence esta semana 17:00", plazoUrgente: true, detalle: "Previo a proveer: aclare el monto de la demanda y acompañe liquidación de saldo insoluto." , fechaSolicitud: "2026-07-15" },
  { id: "w11", rol: "C-9004-2026", deudor: "Francisca Yáñez Soto", tribunal: "2° Juzgado Civil Santiago", mandante: "SNC", cuantia: 15200000, exhorto: false, estado: "limite", accionTipo: "previo", plazo: "Vence prox semana 12:00", detalle: "Previo a proveer: señale cuántas cuotas se pagaron y descuente intereses." , fechaSolicitud: "2026-07-21" },
  { id: "w12", rol: "C-2755-2025", deudor: "Marcelo Iturra Peña", tribunal: "1° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 6400000, exhorto: false, estado: "fuera", accionTipo: "consulta", plazo: "Vence esta semana", plazoUrgente: true, autor: "Claudia (jefatura)", detalle: "¿Por qué este caso está detenido? No hay movimiento hace 20 días." , fechaSolicitud: "2026-07-20" },
  { id: "w13", rol: "C-2999-2025", deudor: "Valentina Cortés Muñoz", tribunal: "6° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 41200000, exhorto: false, estado: "limite", accionTipo: "consulta", autor: "Sergio (jefatura)", detalle: "¿Qué pasó con la última audiencia de este caso? El mandante está preguntando." , fechaSolicitud: "2026-07-17" },
  { id: "w14", rol: "C-1023-2026", deudor: "Manuel Contreras Díaz", tribunal: "4° Juzgado Civil Santiago", mandante: "SNC", cuantia: 9800000, exhorto: false, estado: "fuera", accionTipo: "apercibimiento", plazo: "Vence esta semana 18:00", plazoUrgente: true , fechaSolicitud: "2026-07-16" },
  { id: "w15", rol: "C-1587-2026", deudor: "Loreto Espinoza Carrasco", tribunal: "9° Juzgado Civil Santiago", mandante: "TSF", cuantia: 22400000, exhorto: false, estado: "limite", accionTipo: "apercibimiento", plazo: "Vence prox semana 09:00" , fechaSolicitud: "2026-07-15" },
  { id: "w16", rol: "C-2201-2026", deudor: "Distribuidora Los Andes SpA", tribunal: "1° Juzgado Civil San Bernardo", mandante: "SNC", cuantia: 63500000, exhorto: false, estado: "estandar", accionTipo: "apercibimiento", plazo: "Vence en +1 semana 12:00" , fechaSolicitud: "2026-07-21" },
  { id: "w17", rol: "C-2864-2026", deudor: "Ricardo Fuenzalida Toro", tribunal: "3° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 5300000, exhorto: true, tribunalExhortado: "Juzgado de Letras de Los Ángeles", estado: "limite", accionTipo: "apercibimiento", plazo: "Vence prox semana 12:00" , fechaSolicitud: "2026-07-20" },
  { id: "w18", rol: "C-3390-2026", deudor: "Camila Reyes Fuentes", tribunal: "6° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 14700000, exhorto: false, estado: "estandar", accionTipo: "despachese", plazo: "Vie 12:00" , fechaSolicitud: "2026-07-17" },
  { id: "w19", rol: "C-4012-2026", deudor: "Transportes Bío Bío Ltda.", tribunal: "2° Juzgado Civil Concepción", mandante: "SNC", cuantia: 71200000, exhorto: false, estado: "estandar", accionTipo: "despachese", plazo: "Vence en +1 semana 10:00" , fechaSolicitud: "2026-07-16" },
  { id: "w20", rol: "C-4588-2026", deudor: "Nicolás Bustos Herrera", tribunal: "5° Juzgado Civil Santiago", mandante: "SNC", cuantia: 3900000, exhorto: false, estado: "limite", accionTipo: "despachese", plazo: "Vence prox semana 09:00" , fechaSolicitud: "2026-07-15" },
  { id: "w21", rol: "C-5077-2026", deudor: "Agrícola Santa Elena S.A.", tribunal: "1° Juzgado Civil Rancagua", mandante: "TSF", cuantia: 38900000, exhorto: true, tribunalExhortado: "Juzgado de Letras de San Fernando", estado: "estandar", accionTipo: "despachese", plazo: "Vence en +1 semana 10:00" , fechaSolicitud: "2026-07-21" },
  { id: "w33", rol: "C-3477-2025", deudor: "Soc. Constructora Sur S.A.", tribunal: "7° Juzgado Civil Santiago", mandante: "SNC", cuantia: 156000000, exhorto: false, estado: "limite", accionTipo: "designacion_martillero", plazo: "Vence prox semana 12:00" , fechaSolicitud: "2026-07-20" },
  { id: "w34", rol: "C-3982-2025", deudor: "Agrícola Santa Elena S.A.", tribunal: "1° Juzgado Civil Rancagua", mandante: "TSF", cuantia: 38900000, exhorto: false, estado: "estandar", accionTipo: "designacion_martillero", plazo: "Vence en +1 semana 10:00" , fechaSolicitud: "2026-07-17" },
  { id: "w35", rol: "C-4530-2025", deudor: "Constructora El Roble SpA", tribunal: "4° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 98400000, exhorto: false, estado: "fuera", accionTipo: "designacion_martillero", plazo: "Vence esta semana 17:00", plazoUrgente: true , fechaSolicitud: "2026-07-16" },
  { id: "w22", rol: "C-5643-2026", deudor: "Gabriel Ossandón Rivas", tribunal: "7° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 26800000, exhorto: false, estado: "limite", accionTipo: "fuerza_publica", plazo: "Vence prox semana 09:00" , fechaSolicitud: "2026-07-15" },
  { id: "w23", rol: "C-6199-2026", deudor: "Constructora El Roble SpA", tribunal: "4° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 98400000, exhorto: false, estado: "fuera", accionTipo: "fuerza_publica", plazo: "Vence esta semana 17:00", plazoUrgente: true , fechaSolicitud: "2026-07-21" },
  { id: "w24", rol: "C-6755-2026", deudor: "Daniela Poblete Sepúlveda", tribunal: "3° Juzgado Civil Viña del Mar", mandante: "SNC", cuantia: 17300000, exhorto: false, estado: "estandar", accionTipo: "fuerza_publica", plazo: "Vence en +1 semana 09:00" , fechaSolicitud: "2026-07-20" },
  { id: "w25", rol: "C-7311-2026", deudor: "Sociedad Agrícola Maule Ltda.", tribunal: "2° Juzgado Civil Talca", mandante: "SNC", cuantia: 54600000, exhorto: true, tribunalExhortado: "Juzgado de Letras de Curicó", estado: "limite", accionTipo: "fuerza_publica", plazo: "Vence prox semana 09:00" , fechaSolicitud: "2026-07-17" },
  { id: "w26", rol: "C-7866-2026", deudor: "Tomás Cárdenas Leiva", tribunal: "8° Juzgado Civil Santiago", mandante: "TSF", cuantia: 11500000, exhorto: false, estado: "fuera", accionTipo: "previo", plazo: "Vence esta semana 17:00", plazoUrgente: true, detalle: "Previo a proveer: acompañe mandato judicial vigente y liquidación actualizada." , fechaSolicitud: "2026-07-16" },
  { id: "w27", rol: "C-8422-2026", deudor: "Comercializadora Pacífico S.A.", tribunal: "1° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 47100000, exhorto: false, estado: "limite", accionTipo: "previo", plazo: "Vence prox semana 12:00", detalle: "Previo a proveer: individualice correctamente al representante legal de la sociedad demandada." , fechaSolicitud: "2026-07-15" },
  { id: "w28", rol: "C-8977-2026", deudor: "Ximena Aravena Godoy", tribunal: "6° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 8100000, exhorto: false, estado: "estandar", accionTipo: "previo", plazo: "Vence en +1 semana 09:00", detalle: "Previo a proveer: acredite notificación válida del deudor solidario." , fechaSolicitud: "2026-07-21" },
  { id: "w29", rol: "C-9533-2026", deudor: "Felipe Zúñiga Contreras", tribunal: "5° Juzgado Civil Santiago", mandante: "SNC", cuantia: 19600000, exhorto: false, estado: "limite", accionTipo: "previo", plazo: "Vence prox semana 12:00", detalle: "Previo a proveer: aclare fecha de mora y adjunte pagaré timbrado." , fechaSolicitud: "2026-07-20" },
  { id: "w30", rol: "C-1109-2025", deudor: "Andrea Villalobos Muñoz", tribunal: "3° Juzgado Civil Santiago", mandante: "SNC", cuantia: 33400000, exhorto: false, estado: "fuera", accionTipo: "consulta", plazo: "Vence esta semana", plazoUrgente: true, autor: "Claudia (jefatura)", detalle: "¿Cuál es el estado del embargo? El mandante solicitó actualización urgente." , fechaSolicitud: "2026-07-17" },
  { id: "w31", rol: "C-1664-2025", deudor: "Rodrigo Sepúlveda Castro", tribunal: "9° Juzgado Civil Santiago", mandante: "TSF", cuantia: 24900000, exhorto: false, estado: "limite", accionTipo: "consulta", autor: "Matías (jefatura)", detalle: "¿Por qué no se ha solicitado el retiro de especies? Han pasado 15 días." , fechaSolicitud: "2026-07-16" },
  { id: "w32", rol: "C-2210-2025", deudor: "Inversiones del Sur SpA", tribunal: "2° Juzgado Civil Santiago", mandante: "ITAU", cuantia: 68700000, exhorto: false, estado: "estandar", accionTipo: "consulta", autor: "Sergio (jefatura)", detalle: "El mandante pregunta si ya se remató el bien embargado." , fechaSolicitud: "2026-07-15" },
];

// El estado (Gestionada/Límite/Crítico) debe ser siempre consistente con el
// plazo legal calculado desde fechaSolicitud: sin esto, una tarea podía
// mostrarse "Gestionada" y a la vez con el plazo legal vencido.
WORK_ITEMS.forEach(item => {
  if (item.fechaSolicitud) item.estado = estadoDesdePlazoLegal(item.fechaSolicitud);
});

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

const PDF_SAMPLES = [
  "/docs/escrito1_tsf.pdf",
  "/docs/escrito2_snc.pdf",
  "/docs/escrito2_tsf.pdf",
  "/docs/mandato_snc.pdf",
  "/docs/op1.pdf",
];

const PDF_ESCRITOS = ["/docs/escrito1_tsf.pdf", "/docs/escrito2_snc.pdf", "/docs/escrito2_tsf.pdf"];
const PDF_LITIGANTES = ["/docs/litigantes1_snc.pdf", "/docs/litigantes2_snc.pdf"];
const PDF_MANDATO = "/docs/mandato_snc.pdf";
const PDF_PAGARE = "/docs/pagare_snc.pdf";
const PDF_DETALLE_OPERACION = "/docs/op1.pdf";
const PDF_EBOOK: Record<string, string> = { SNC: "/docs/ebook1_snc.pdf", TSF: "/docs/ebook1_tsf.pdf" };

const LITIGANTES_SANTANDER: Litigante[] = [
  { nombre: "DOMINUM FINANCIAL SPA", rut: "77470204-0", calidad: "DTE.", tipo: "JURIDICA" },
  { nombre: "GINA ALICIA ARESTICH NICOLICH", rut: "10653285-0", calidad: "DDO.", tipo: "NATURAL" },
  { nombre: "INGRID LORENA KLESSE AZÓCAR", rut: "11921876-4", calidad: "AB.DTE", tipo: "NATURAL" },
  { nombre: "MÓNICA ALEJANDRA SEVINONES PINO", rut: "16076729-4", calidad: "AB.DTE", tipo: "NATURAL" },
  { nombre: "RONALD EDUARDO ZEPEDA FLORES", rut: "12504790-4", calidad: "AP.DTE", tipo: "NATURAL" },
  { nombre: "SANTANDER CONSUMER FINANCE LTDA.", rut: "76002293-4", calidad: "DTE.", tipo: "JURIDICA" },
];

const CAUSAS_DETALLE: CausaDetalle[] = [
  {
    rol: "E-632-2026", pagare: "-", tribunal: "Juzgado de Letras de Yungay", cliente: "SANTANDER", procurador: "Maria Paz Pinto",
    fechaIngreso: "2026-07-15", etapa: "0 Exhorto", estadoAdm: "Sin archivar", procedimiento: "Exhorto",
    estadoCausa: "ACTIVO", semaforo: "ROJO", estadoCRM: "EXHORTO EN TRAMITACIÓN", subestadoCRM: "PENDIENTE DILIGENCIA",
    ubicacion: "Digital", estadoProc: "Tramitación", causaOrigenRol: "C-9708-2025", badge: "VencimientoExhorto",
    nroPagare: "No recuperado", remate: "Remate suspendido a la espera del resultado del exhorto de embargo.",
    abogadoPatrocinante: "RONALD EDUARDO ZEPEDA FLORES",
    cuadernos: ["0 - Principal"],
    historia: [
      { folio: 2, fecha: "2026-07-15", etapa: "Exhorto", tramite: "Resolución", descTramite: "Cúmplase", pdfUrl: PDF_SAMPLES[0] },
      { folio: 1, fecha: "2026-07-15", etapa: "Exhorto", tramite: "Escrito", descTramite: "Ingreso Exhorto", pdfUrl: PDF_SAMPLES[1] },
    ],
    litigantes: LITIGANTES_SANTANDER,
    exhortos: [],
  },
  {
    rol: "C-9708-2025", pagare: "650074166959", tribunal: "12° Juzgado Civil de Santiago", cliente: "SANTANDER", procurador: "Maria Paz Pinto",
    fechaIngreso: "2025-07-10", etapa: "1 Notificación demanda y su proveído", estadoAdm: "Sin archivar", procedimiento: "Ejecutivo Obligación de Dar",
    estadoCausa: "ACTIVO", semaforo: "VERDE", estadoCRM: "DEMANDA PROVEIDA", subestadoCRM: "DESPÁCHESE MANDAMIENTO",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "650074166959",
    abogadoPatrocinante: "RONALD EDUARDO ZEPEDA FLORES",
    cuadernos: ["0 - Principal"],
    historia: [
      { folio: 3, fecha: "2026-07-15", etapa: "Inicio de la Tramitación", tramite: "", descTramite: "Acredita Poder", pdfUrl: PDF_SAMPLES[2] },
      { folio: 2, fecha: "2026-07-15", etapa: "Inicio de la Tramitación", tramite: "Resolución", descTramite: "Apercibimiento poder y/o título", pdfUrl: PDF_SAMPLES[3] },
      { folio: 1, fecha: "2026-07-14", etapa: "Inicio de la Tramitación", tramite: "Escrito", descTramite: "Ingreso demanda", pdfUrl: PDF_SAMPLES[4] },
    ],
    litigantes: LITIGANTES_SANTANDER,
    exhortos: [{ rol: "E-632-2026", fechaIngreso: "2026-07-15", tribunal: "Juzgado de Letras de Yungay", estado: "Tramitación" }],
  },
  {
    rol: "C-11260-2025", pagare: "650073157620", tribunal: "28° Juzgado Civil de Santiago", cliente: "SANTANDER", procurador: "Alejandro Cuevas",
    fechaIngreso: "2025-08-12", etapa: "8 Terminada", estadoAdm: "Sin archivar", procedimiento: "Ejecutivo Obligación de Dar",
    estadoCausa: "INACTIVADO", semaforo: "VERDE", estadoCRM: "TERMINO DE JUICIO", subestadoCRM: "DACION EN PAGO",
    ubicacion: "Digital", estadoProc: "Concluido", badge: "Nueva Recepcion Notificación", nroPagare: "650073157620",
    remate: "Remate suspendido: causa terminó por dación en pago del bien embargado.",
    abogadoPatrocinante: "CLAUDIA SANTANDER GUTIÉRREZ",
    cuadernos: ["2 - Apremio Ejecutivo Obligación de Dar", "1 - Principal"],
    historia: [
      { folio: 12, fecha: "2026-07-14", etapa: "Terminada", tramite: "", descTramite: "Certificado.", pdfUrl: PDF_SAMPLES[0] },
      { folio: 11, fecha: "2026-07-14", etapa: "Terminada", tramite: "Resolución", descTramite: "Certifíquese", pdfUrl: PDF_SAMPLES[1] },
      { folio: 10, fecha: "2026-07-13", etapa: "Terminada", tramite: "Escrito", descTramite: "Certificación que se indica", pdfUrl: PDF_SAMPLES[2] },
      { folio: 9, fecha: "2026-07-02", etapa: "Terminada", tramite: "Resolución", descTramite: "Mero trámite", pdfUrl: PDF_SAMPLES[3] },
      { folio: 8, fecha: "2026-06-30", etapa: "Terminada", tramite: "Escrito", descTramite: "Certificación que se indica", pdfUrl: PDF_SAMPLES[4] },
      { folio: 7, fecha: "2026-06-24", etapa: "Mandamiento", tramite: "Resolución", descTramite: "Alzamiento", pdfUrl: PDF_SAMPLES[0] },
      { folio: 7, fecha: "2026-06-24", etapa: "", tramite: "", descTramite: "Tiene por pagado el crédito" },
      { folio: 6, fecha: "2026-06-22", etapa: "Notificación demanda y su proveído", tramite: "Escrito", descTramite: "Tenga presente", anexo: true, pdfUrl: PDF_SAMPLES[1] },
      { folio: 5, fecha: "2026-06-19", etapa: "Mandamiento", tramite: "Resolución", descTramite: "Mero trámite", pdfUrl: PDF_SAMPLES[2] },
      { folio: 4, fecha: "2026-06-17", etapa: "Notificación demanda y su proveído", tramite: "Escrito", descTramite: "Tenga presente", anexo: true, pdfUrl: PDF_SAMPLES[3] },
      { folio: 3, fecha: "2025-12-31", etapa: "Mandamiento", tramite: "Actuación Receptor", descTramite: "Inscripción / Alzamiento registro (Certificación) Diligencia:31/12/2025 08:41", pdfUrl: PDF_SAMPLES[4] },
      { folio: 2, fecha: "2025-12-31", etapa: "Mandamiento", tramite: "Actuación Receptor", descTramite: "EMBARGO (Exitosa) Diligencia:16/12/2025 08:48", pdfUrl: PDF_SAMPLES[0] },
      { folio: 1, fecha: "2025-08-18", etapa: "Mandamiento", tramite: "", descTramite: "Mandamiento", pdfUrl: PDF_SAMPLES[1] },
    ],
    litigantes: [
      { nombre: "SANTANDER CONSUMER FINANCE LTDA.", rut: "76002293-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "CAROLINA PATRICIA GALLEGOS ZAMORANO", rut: "13884221-5", calidad: "DDO.", tipo: "NATURAL" },
      { nombre: "ALEJANDRO CUEVAS ROJAS", rut: "15220994-8", calidad: "AB.DTE", tipo: "NATURAL" },
    ],
    exhortos: [{ rol: "E-4942-2025", fechaIngreso: "2025-08-19", tribunal: "3° Juzgado Civil de Concepción", estado: "Concluido" }],
  },
  {
    rol: "E-4942-2025", pagare: "-", tribunal: "3° Juzgado Civil de Concepción", cliente: "SANTANDER", procurador: "Alejandro Cuevas",
    fechaIngreso: "2025-08-19", etapa: "1 Terminada", estadoAdm: "Sin archivar", procedimiento: "Exhorto",
    estadoCausa: "INACTIVADO", semaforo: "VERDE", estadoCRM: "EXHORTO DILIGENCIADO", subestadoCRM: "DEVUELTO CON RESULTADO POSITIVO",
    ubicacion: "Digital", estadoProc: "Concluido", causaOrigenRol: "C-11260-2025", badge: "Nueva Recepcion Notificación",
    nroPagare: "No recuperado",
    abogadoPatrocinante: "CLAUDIA SANTANDER GUTIÉRREZ",
    cuadernos: ["0 - Principal"],
    historia: [
      { folio: 6, fecha: "2026-02-04", etapa: "Exhorto", tramite: "Resolución", descTramite: "Devuelve con resultado positivo", pdfUrl: PDF_SAMPLES[2] },
      { folio: 5, fecha: "2026-02-02", etapa: "Exhorto", tramite: "Escrito", descTramite: "Acompaña exhorto diligenciado", pdfUrl: PDF_SAMPLES[3] },
      { folio: 4, fecha: "2025-11-26", etapa: "Exhorto", tramite: "Actuación Receptor", descTramite: "NOTIFICACIÓN DE DEMANDA (Exitosa) Diligencia:24/11/2025 10:02", pdfUrl: PDF_SAMPLES[4] },
      { folio: 3, fecha: "2025-11-26", etapa: "Exhorto", tramite: "Actuación Receptor", descTramite: "CERTIFICACIÓN BÚSQUEDAS (Búsqueda positiva) Diligencia:17/11/2025 12:38", pdfUrl: PDF_SAMPLES[0] },
      { folio: 2, fecha: "2025-08-20", etapa: "Exhorto", tramite: "Resolución", descTramite: "Cúmplase", pdfUrl: PDF_SAMPLES[1] },
      { folio: 1, fecha: "2025-08-19", etapa: "Exhorto", tramite: "Escrito", descTramite: "Ingreso Exhorto", pdfUrl: PDF_SAMPLES[2] },
    ],
    litigantes: [
      { nombre: "SANTANDER CONSUMER FINANCE LTDA.", rut: "76002293-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "CAROLINA PATRICIA GALLEGOS ZAMORANO", rut: "13884221-5", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "E-3129-2026", pagare: "-", tribunal: "Juzgado de Letras de Villa Alemana", cliente: "SANTANDER", procurador: "Romina Hernandez",
    fechaIngreso: "2026-07-15", etapa: "0 Exhorto", estadoAdm: "Sin archivar", procedimiento: "Exhorto",
    estadoCausa: "ACTIVO", semaforo: "AMARILLO", estadoCRM: "EXHORTO EN TRAMITACIÓN", subestadoCRM: "PENDIENTE DILIGENCIA",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "RONALD EDUARDO ZEPEDA FLORES",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-07-15", etapa: "Exhorto", tramite: "Escrito", descTramite: "Ingreso Exhorto", pdfUrl: PDF_SAMPLES[3] }],
    litigantes: [
      { nombre: "ITAU CORPBANCA S.A.", rut: "76645030-K", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "FELIPE ANDRÉS ROJAS BUSTAMANTE", rut: "14887632-1", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "E-2281-2026", pagare: "-", tribunal: "1° Juzgado Civil de Chillán", cliente: "TANNER", procurador: "Matias Martinez",
    fechaIngreso: "2026-07-15", etapa: "0 Exhorto", estadoAdm: "Sin archivar", procedimiento: "Exhorto",
    estadoCausa: "ACTIVO", semaforo: "AMARILLO", estadoCRM: "EXHORTO EN TRAMITACIÓN", subestadoCRM: "PENDIENTE DILIGENCIA",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "CLAUDIA SANTANDER GUTIÉRREZ",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-07-15", etapa: "Exhorto", tramite: "Escrito", descTramite: "Ingreso Exhorto", pdfUrl: PDF_SAMPLES[4] }],
    litigantes: [
      { nombre: "TANNER SERVICIOS FINANCIEROS S.A.", rut: "76370120-3", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "OSCAR HUMBERTO CID VERA", rut: "9887654-2", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "E-1400-2026", pagare: "-", tribunal: "2° Juzgado de Letras de Talca", cliente: "SANTANDER", procurador: "Maria Paz Pinto",
    fechaIngreso: "2026-07-15", etapa: "0 Exhorto", estadoAdm: "Sin archivar", procedimiento: "Exhorto",
    estadoCausa: "ACTIVO", semaforo: "VERDE", estadoCRM: "EXHORTO EN TRAMITACIÓN", subestadoCRM: "PENDIENTE DILIGENCIA",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "RONALD EDUARDO ZEPEDA FLORES",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-07-15", etapa: "Exhorto", tramite: "Escrito", descTramite: "Ingreso Exhorto", pdfUrl: PDF_SAMPLES[0] }],
    litigantes: [
      { nombre: "SANTANDER CONSUMER FINANCE LTDA.", rut: "76002293-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "MARCELA ANDREA PIZARRO SOTO", rut: "12099887-6", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "E-375-2026", pagare: "-", tribunal: "Juzgado de Letras y Gar. Santa Bárbara", cliente: "SANTANDER", procurador: "Alejandro Cuevas",
    fechaIngreso: "2026-07-15", etapa: "0 Exhorto", estadoAdm: "Sin archivar", procedimiento: "Exhorto",
    estadoCausa: "ACTIVO", semaforo: "VERDE", estadoCRM: "EXHORTO EN TRAMITACIÓN", subestadoCRM: "PENDIENTE DILIGENCIA",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "CLAUDIA SANTANDER GUTIÉRREZ",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-07-15", etapa: "Exhorto", tramite: "Escrito", descTramite: "Ingreso Exhorto", pdfUrl: PDF_SAMPLES[1] }],
    litigantes: [
      { nombre: "SANTANDER CONSUMER FINANCE LTDA.", rut: "76002293-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "HUGO ANTONIO SEGUEL LAGOS", rut: "10556677-3", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "C-9489-2026", pagare: "3655453", tribunal: "24° Juzgado Civil de Santiago", cliente: "TANNER", procurador: "Matias Martinez",
    fechaIngreso: "2026-07-14", etapa: "0 Inicio de la Tramitación", estadoAdm: "Sin archivar", procedimiento: "Ejecutivo Obligación de Dar",
    estadoCausa: "ACTIVO", semaforo: "VERDE", estadoCRM: "DEMANDA EN PREPARACIÓN", subestadoCRM: "-",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "3655453",
    abogadoPatrocinante: "RONALD EDUARDO ZEPEDA FLORES",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-07-14", etapa: "Inicio de la Tramitación", tramite: "Escrito", descTramite: "Ingreso demanda", pdfUrl: PDF_SAMPLES[2] }],
    litigantes: [
      { nombre: "TANNER SERVICIOS FINANCIEROS S.A.", rut: "76370120-3", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "JAVIERA ANTONIA MELLA CARRASCO", rut: "16330221-9", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "C-8421-2026", pagare: "-", tribunal: "2° Juzgado Civil Santiago", cliente: "BFN", procurador: "Romina Hernandez",
    fechaIngreso: "2026-07-10", etapa: "1 Notificación", estadoAdm: "Sin archivar", procedimiento: "Ejecutivo Obligación de Dar",
    estadoCausa: "ACTIVO", semaforo: "ROJO", estadoCRM: "DEMANDA PROVEIDA", subestadoCRM: "NOTIFICACIÓN PENDIENTE",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "CLAUDIA SANTANDER GUTIÉRREZ",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-07-10", etapa: "Notificación", tramite: "Escrito", descTramite: "Ingreso demanda", pdfUrl: PDF_SAMPLES[3] }],
    litigantes: [
      { nombre: "BANCO FALABELLA", rut: "96509660-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "CARLOS GONZÁLEZ PÉREZ", rut: "12345678-9", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "C-6812-2026", pagare: "-", tribunal: "3° Juzgado Civil Santiago", cliente: "ITAU", procurador: "Maria Paz Pinto",
    fechaIngreso: "2026-06-20", etapa: "0 Preparación vía ejecutiva", estadoAdm: "Sin archivar", procedimiento: "Gestión Preparatoria (Citac.Conf.Deuda)",
    estadoCausa: "ACTIVO", semaforo: "AMARILLO", estadoCRM: "DEMANDA EN PREPARACIÓN", subestadoCRM: "-",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "RONALD EDUARDO ZEPEDA FLORES",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-06-20", etapa: "Preparación vía ejecutiva", tramite: "Escrito", descTramite: "Solicita citación a confesar deuda", pdfUrl: PDF_SAMPLES[4] }],
    litigantes: [
      { nombre: "BANCO ITAÚ CORPBANCA", rut: "76645030-K", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "INVERSIONES TORRES SPA", rut: "76441229-3", calidad: "DDO.", tipo: "JURIDICA" },
    ],
    exhortos: [],
  },
  {
    rol: "C-2891-2025", pagare: "-", tribunal: "7° Juzgado Civil Santiago", cliente: "BFN", procurador: "Alejandro Cuevas",
    fechaIngreso: "2025-05-11", etapa: "9 Ejecución de Sentencia", estadoAdm: "Sin archivar", procedimiento: "Ejecutivo Obligación de Dar",
    estadoCausa: "ACTIVO", semaforo: "AMARILLO", estadoCRM: "REMATE", subestadoCRM: "REMATE FIJADO",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado", remate: "Remate fijado para el 08-08-2026 ante el 7° Juzgado Civil de Santiago.",
    abogadoPatrocinante: "CLAUDIA SANTANDER GUTIÉRREZ",
    cuadernos: ["2 - Apremio Ejecutivo Obligación de Dar", "1 - Principal"],
    historia: [{ folio: 4, fecha: "2026-07-08", etapa: "Ejecución de Sentencia", tramite: "Resolución", descTramite: "Fíjese día y hora para el remate", pdfUrl: PDF_SAMPLES[0] }],
    litigantes: [
      { nombre: "BANCO FALABELLA", rut: "96509660-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "SOC. CONSTRUCTORA SUR S.A.", rut: "99441221-5", calidad: "DDO.", tipo: "JURIDICA" },
    ],
    exhortos: [],
  },
  {
    rol: "C-7740-2026", pagare: "-", tribunal: "10° Juzgado Civil Santiago", cliente: "ITAU", procurador: "Sergio Fuentes",
    fechaIngreso: "2026-06-02", etapa: "1 Notificación", estadoAdm: "Sin archivar", procedimiento: "Ejecutivo Obligación de Dar",
    estadoCausa: "ACTIVO", semaforo: "AMARILLO", estadoCRM: "DEMANDA PROVEIDA", subestadoCRM: "-",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "PATRICIA ARAVENA MUÑOZ",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-06-02", etapa: "Notificación", tramite: "Escrito", descTramite: "Ingreso demanda", pdfUrl: PDF_SAMPLES[1] }],
    litigantes: [
      { nombre: "BANCO ITAÚ CORPBANCA", rut: "76645030-K", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "MARIO ANDRÉS SILVA ROJAS", rut: "13221004-7", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
  {
    rol: "C-8130-2026", pagare: "-", tribunal: "11° Juzgado Civil Santiago", cliente: "SNC", procurador: "Sergio Fuentes",
    fechaIngreso: "2026-06-15", etapa: "0 Preparación vía ejecutiva", estadoAdm: "Sin archivar", procedimiento: "Gestión Preparatoria (Citac.Conf.Deuda)",
    estadoCausa: "ACTIVO", semaforo: "VERDE", estadoCRM: "DEMANDA EN PREPARACIÓN", subestadoCRM: "-",
    ubicacion: "Digital", estadoProc: "Tramitación", nroPagare: "No recuperado",
    abogadoPatrocinante: "PATRICIA ARAVENA MUÑOZ",
    cuadernos: ["0 - Principal"],
    historia: [{ folio: 1, fecha: "2026-06-15", etapa: "Preparación vía ejecutiva", tramite: "Escrito", descTramite: "Solicita citación a confesar deuda", pdfUrl: PDF_SAMPLES[2] }],
    litigantes: [
      { nombre: "SANTANDER CONSUMER FINANCE LTDA.", rut: "76002293-4", calidad: "DTE.", tipo: "JURIDICA" },
      { nombre: "PAULINA ANDREA CORTEZ MENA", rut: "14993201-5", calidad: "DDO.", tipo: "NATURAL" },
    ],
    exhortos: [],
  },
];

// Genera causas de ejemplo adicionales para completar la cartera de la procuradora Romina Hernandez.
function generarCausasRomina(cantidad: number): CausaDetalle[] {
  const tribunales = [
    "1° Juzgado Civil Santiago", "2° Juzgado Civil Santiago", "3° Juzgado Civil Santiago", "4° Juzgado Civil Santiago",
    "5° Juzgado Civil Santiago", "1° Juzgado Civil Puente Alto", "2° Juzgado Civil Concepción", "1° Juzgado Civil Rancagua",
    "3° Juzgado Civil Viña del Mar", "1° Juzgado Civil San Bernardo",
  ];
  const clientes = ["SNC", "ITAU", "TSF", "BFN", "SANTANDER", "TANNER"];
  const etapasPorSemaforo: Record<NonNullable<CausaDetalle["semaforo"]>, { etapa: string; estadoCRM: string }[]> = {
    VERDE: [
      { etapa: "1 Notificación demanda y su proveído", estadoCRM: "DEMANDA PROVEIDA" },
      { etapa: "2 Excepción", estadoCRM: "EN TRAMITACIÓN" },
    ],
    AMARILLO: [
      { etapa: "3 Sentencia", estadoCRM: "SENTENCIA" },
      { etapa: "4 Cuaderno de apremio", estadoCRM: "CUADERNO DE APREMIO" },
    ],
    ROJO: [
      { etapa: "5 Embargo pendiente", estadoCRM: "EMBARGO PENDIENTE" },
      { etapa: "6 Preparación remate", estadoCRM: "PREPARACION REMATE" },
    ],
  };
  const procedimientos = ["Ejecutivo Obligación de Dar", "Gestión Preparatoria (Citac.Conf.Deuda)", "Exhorto"];
  const semaforos: NonNullable<CausaDetalle["semaforo"]>[] = ["VERDE", "VERDE", "VERDE", "AMARILLO", "AMARILLO", "ROJO"];
  const abogados = ["RONALD EDUARDO ZEPEDA FLORES", "CLAUDIA SANTANDER GUTIÉRREZ"];
  const meses = ["01", "02", "03", "04", "05", "06", "07"];

  const out: CausaDetalle[] = [];
  for (let i = 0; i < cantidad; i++) {
    const semaforo = semaforos[i % semaforos.length];
    const { etapa, estadoCRM } = etapasPorSemaforo[semaforo][i % 2];
    const dia = String((i % 27) + 1).padStart(2, "0");
    out.push({
      rol: `C-${50000 + i}-2026`,
      pagare: "-",
      tribunal: tribunales[i % tribunales.length],
      cliente: clientes[i % clientes.length],
      procurador: "Romina Hernandez",
      fechaIngreso: `2026-${meses[i % meses.length]}-${dia}`,
      etapa,
      estadoAdm: i % 6 === 0 ? "Archivada" : "Sin archivar",
      procedimiento: procedimientos[i % procedimientos.length],
      estadoCausa: i % 8 === 0 ? "INACTIVADO" : "ACTIVO",
      semaforo,
      estadoCRM,
      subestadoCRM: "-",
      ubicacion: "Digital",
      estadoProc: "Tramitación",
      nroPagare: "No recuperado",
      abogadoPatrocinante: abogados[i % abogados.length],
      cuadernos: ["0 - Principal"],
      historia: [],
      litigantes: [],
      exhortos: [],
    });
  }
  return out;
}

CAUSAS_DETALLE.push(...generarCausasRomina(498));

const HIST_TIPO_META: Record<HistItem["tipo"], { label: string; icon: React.ElementType; bg: string; text: string }> = {
  estado: { label: "Cambio de estado", icon: CalendarClock, bg: "bg-blue-50", text: "text-blue-600" },
  tarea: { label: "Tarea realizada", icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
  documento: { label: "Documento", icon: FileText, bg: "bg-indigo-50", text: "text-indigo-600" },
  tribunal: { label: "Tribunal", icon: Landmark, bg: "bg-violet-50", text: "text-violet-600" },
  jefatura: { label: "Jefatura", icon: MessageSquare, bg: "bg-amber-50", text: "text-amber-600" },
  contacto: { label: "Contacto con cliente", icon: Phone, bg: "bg-teal-50", text: "text-teal-600" },
  observacion: { label: "Observación", icon: Pencil, bg: "bg-gray-100", text: "text-gray-600" },
};

const HISTORIAL_STORE: Record<string, HistItem[]> = {
  "C-8421-2026": [
    { fecha: "10/07/2026", autor: "Sistema PJUD", texto: "Tribunal tuvo por acompañados los documentos presentados.", tipo: "tribunal" },
    { fecha: "08/07/2026", autor: "Pamela Ríos (ejecutiva comercial)", texto: "Se envió correo al mandante adjuntando el estado de avance de la causa.", tipo: "contacto", canal: "mail" },
    { fecha: "05/07/2026", autor: "Pamela Ríos (ejecutiva comercial)", texto: "Llamado telefónico al mandante: se informó estado de la causa y próximos pasos.", tipo: "contacto", canal: "telefono" },
    { fecha: "28/06/2026", autor: "Romina Fuentes", texto: "Se envió WhatsApp al mandante confirmando recepción de antecedentes.", tipo: "contacto", canal: "whatsapp" },
    { fecha: "22/06/2026", autor: "Pamela Ríos (ejecutiva comercial)", texto: "Reunión presencial con el mandante para revisar el estado de la cartera.", tipo: "contacto", canal: "presencial" },
    { fecha: "20/06/2026", autor: "Romina Fuentes", texto: "Cambio de estado: Notificación → Notificación pendiente de resultado.", tipo: "estado" },
    { fecha: "14/06/2026", autor: "Sergio (jefatura)", texto: "¿Por qué este caso no se ha movido? El mandante está preguntando.", tipo: "jefatura" },
    { fecha: "14/06/2026", autor: "Romina Fuentes", texto: "Se agotó la búsqueda de domicilio, solicité búsqueda negativa. Reintentando con nueva dirección del RNVM.", tipo: "jefatura" },
    { fecha: "23/04/2025", autor: "Romina Fuentes", texto: "Este caso me tiene chata, no hay forma de ubicar al deudor.", tipo: "observacion" },
  ],
  "C-9708-2025": [
    { fecha: "15/07/2026", autor: "Sistema PJUD", texto: "Estado diario recibido: demanda proveída, despáchese mandamiento.", tipo: "tribunal" },
    { fecha: "15/07/2026", autor: "Maria Paz Pinto", texto: "Se acompañó poder y título en el expediente.", tipo: "documento" },
    { fecha: "14/07/2026", autor: "Maria Paz Pinto", texto: "Cambio de estado: Ingreso demanda → Notificación demanda y su proveído.", tipo: "estado" },
  ],
  "C-7199-2026": [
    { fecha: "18/07/2026", autor: "Romina Fuentes", texto: "Contacto con el cliente vía WhatsApp: se solicitó copia del título ejecutivo.", tipo: "contacto", canal: "whatsapp" },
    { fecha: "15/07/2026", autor: "Sistema PJUD", texto: "Estado diario recibido: apercibimiento decretado por el tribunal.", tipo: "tribunal" },
  ],
  // Etapa 8 "Terminada" — recorrido completo del árbol de apremio/embargo/remate (flujoCobranza.ts) hasta el cierre por dación en pago.
  "C-11260-2025": [
    { fecha: "12/08/2025", autor: "Claudia Santander Gutiérrez", texto: "Cambio de etapa: Sentencia favorable → Cuaderno de apremio.", tipo: "estado" },
    { fecha: "18/08/2025", autor: "Sistema PJUD", texto: "Tribunal despachó mandamiento de embargo.", tipo: "tribunal" },
    { fecha: "16/12/2025", autor: "Claudia Santander Gutiérrez", texto: "Se practicó el embargo del bien señalado.", tipo: "tarea" },
    { fecha: "31/12/2025", autor: "Sistema PJUD", texto: "Tribunal certificó la inscripción y alzamiento en el registro.", tipo: "tribunal" },
    { fecha: "24/06/2026", autor: "Claudia Santander Gutiérrez", texto: "El deudor pagó la deuda: se registró dación en pago del bien embargado.", tipo: "tarea" },
    { fecha: "24/06/2026", autor: "Sistema PJUD", texto: "Tribunal decretó el alzamiento del embargo.", tipo: "tribunal" },
    { fecha: "14/07/2026", autor: "Claudia Santander Gutiérrez", texto: "Cambio de etapa: Alzamiento → Término de juicio (Dación en pago).", tipo: "estado" },
  ],
  // Etapa 9 "Ejecución de Sentencia" — recorrido del árbol de apremio/embargo/remate hasta la fijación de fecha de remate.
  "C-2891-2025": [
    { fecha: "15/01/2026", autor: "Claudia Santander Gutiérrez", texto: "Cambio de etapa: Sentencia favorable → Cuaderno de apremio.", tipo: "estado" },
    { fecha: "10/03/2026", autor: "Sistema PJUD", texto: "Tribunal resolvió señalar el bien embargado para remate.", tipo: "tribunal" },
    { fecha: "02/05/2026", autor: "Claudia Santander Gutiérrez", texto: "Se tramitó la designación de martillero público.", tipo: "tarea" },
    { fecha: "20/05/2026", autor: "Claudia Santander Gutiérrez", texto: "Se acompañó certificado previo al remate en el expediente.", tipo: "documento" },
    { fecha: "15/06/2026", autor: "Sistema PJUD", texto: "Notificación al martillero cursada por el tribunal.", tipo: "tribunal" },
    { fecha: "30/06/2026", autor: "Sistema PJUD", texto: "Tribunal ofició la autorización de remate.", tipo: "tribunal" },
    { fecha: "08/07/2026", autor: "Sistema PJUD", texto: "Tribunal fijó día y hora para el remate: 08-08-2026.", tipo: "tribunal" },
  ],
};

function getHistorial(rol: string): HistItem[] {
  return HISTORIAL_STORE[rol] ?? [];
}

function registrarHistorial(rol: string, entry: HistItem) {
  HISTORIAL_STORE[rol] = [entry, ...(HISTORIAL_STORE[rol] ?? [])];
}

// Toda causa con tarea pendiente "Acompañar documentos" (apercibimiento) debe
// dejar registrada en el Historial la solicitud del tribunal que la originó.
WORK_ITEMS
  .filter(item => item.accionTipo === "apercibimiento" && item.fechaSolicitud)
  .forEach(item => {
    const [y, m, d] = item.fechaSolicitud!.split("-");
    registrarHistorial(item.rol, {
      fecha: `${d}/${m}/${y}`,
      autor: "Sistema PJUD",
      texto: "Tribunal decretó apercibimiento: debe acompañar poder y/o título bajo apercibimiento de tener por no presentada la demanda.",
      tipo: "tribunal",
    });
  });

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

function plazoSinHora(plazo: string) { return plazo.replace(/\s+\d{1,2}:\d{2}$/, ""); }

const HOY_ISO = "2026-07-20";

function formatFechaCL(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
}

function Destacado({ children }: { children: React.ReactNode }) {
  return <mark className="bg-yellow-200 text-foreground font-semibold rounded px-1 py-0.5">{children}</mark>;
}

function ConfirmarRealizadoModal({
  item, label, onCancelar, onConfirmar, onRevisar,
}: { item: WorkItem; label: string; onCancelar: () => void; onConfirmar: (fecha: string) => void; onRevisar: () => void }) {
  const [fecha, setFecha] = useState(HOY_ISO);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancelar}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <p className="text-[13px] font-medium text-foreground leading-snug pt-1.5">
              Confirmo que la tarea <Destacado>{label}</Destacado> de la causa <Destacado>{item.rol}</Destacado> del mandante <Destacado>{item.mandante}</Destacado> fue realizada con fecha <Destacado>{formatFechaCL(fecha)}</Destacado>.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha de realización</p>
            <input
              type="date"
              value={fecha}
              max={HOY_ISO}
              onChange={e => setFecha(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-card focus:outline-none text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => onConfirmar(fecha)} className="w-full text-xs font-semibold rounded-lg py-2.5 bg-accent text-white hover:bg-accent/85 transition-colors">Sí, estoy seguro</button>
            <button onClick={onRevisar} className="w-full text-xs font-medium rounded-lg py-2.5 border border-border text-foreground hover:bg-gray-50 transition-colors">Revisar nuevamente</button>
            <button onClick={onCancelar} className="w-full text-xs font-medium text-muted-foreground py-1.5 hover:text-foreground transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConfirmarRealizadoMasivoModal({
  items, label, onCancelar, onConfirmar,
}: { items: WorkItem[]; label: string; onCancelar: () => void; onConfirmar: (fecha: string) => void }) {
  const [fecha, setFecha] = useState(HOY_ISO);
  const roles = items.map(i => i.rol).join(", ");
  const mandantes = [...new Set(items.map(i => i.mandante))].join(", ");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancelar}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
            </div>
            <p className="text-[13px] font-medium text-foreground leading-snug pt-1.5">
              Confirmo que la tarea <Destacado>{label}</Destacado> de las causas <Destacado>{roles}</Destacado> del mandante <Destacado>{mandantes}</Destacado> fue realizada con fecha <Destacado>{formatFechaCL(fecha)}</Destacado>.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Fecha de realización</p>
            <input
              type="date"
              value={fecha}
              max={HOY_ISO}
              onChange={e => setFecha(e.target.value)}
              className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-card focus:outline-none text-foreground"
            />
          </div>
          <div className="flex flex-col gap-2">
            <button onClick={() => onConfirmar(fecha)} className="w-full text-xs font-semibold rounded-lg py-2.5 bg-accent text-white hover:bg-accent/85 transition-colors">Sí, estoy seguro</button>
            <button onClick={onCancelar} className="w-full text-xs font-medium text-muted-foreground py-1.5 hover:text-foreground transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponderConsultaModal({
  item, onCancelar, onEnviar,
}: { item: WorkItem; onCancelar: () => void; onEnviar: (respuesta: string) => void }) {
  const [respuesta, setRespuesta] = useState("");

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancelar}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Responder consulta</h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.rol}</p>
            </div>
          </div>

          <div className="bg-gray-50 border border-border rounded-lg p-3 space-y-1.5">
            <p className="text-[12px] text-foreground leading-snug">"{item.detalle}"</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>{item.autor ?? "Jefatura"}</span>
              {item.fechaSolicitud && <span className="font-mono">{formatFechaCL(item.fechaSolicitud)}</span>}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Tu respuesta</p>
            <textarea
              value={respuesta}
              onChange={e => setRespuesta(e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta a la consulta..."
              className="w-full text-xs border border-border rounded-lg px-3 py-2.5 bg-card focus:outline-none focus:ring-1 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onEnviar(respuesta)}
              disabled={respuesta.trim().length === 0}
              className="w-full text-xs font-semibold rounded-lg py-2.5 bg-accent text-white hover:bg-accent/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enviar respuesta
            </button>
            <button onClick={onCancelar} className="w-full text-xs font-medium text-muted-foreground py-1.5 hover:text-foreground transition-colors">Cancelar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ResponderConsultasModal({
  items, onCancelar, onEnviar, onCerrar,
}: { items: WorkItem[]; onCancelar: () => void; onEnviar: (item: WorkItem, respuesta: string) => void; onCerrar: () => void }) {
  const [respondidas, setRespondidas] = useState<Set<string>>(new Set());
  const [idx, setIdx] = useState(0);
  const [respuesta, setRespuesta] = useState("");

  const pendientes = items.filter(i => !respondidas.has(i.id));
  const idxSeguro = Math.min(idx, Math.max(0, pendientes.length - 1));
  const item = pendientes[idxSeguro];

  useEffect(() => {
    if (pendientes.length === 0) onCerrar();
  }, [pendientes.length]);

  if (!item) return null;

  function irA(nuevoIdx: number) {
    setIdx(Math.max(0, Math.min(pendientes.length - 1, nuevoIdx)));
    setRespuesta("");
  }

  function enviar() {
    onEnviar(item, respuesta);
    setRespondidas(prev => new Set(prev).add(item.id));
    setRespuesta("");
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onCancelar}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4.5 h-4.5 text-accent" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-foreground">Responder consultas</h3>
              <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{item.rol}</p>
            </div>
            <span className="text-[11px] font-mono text-muted-foreground shrink-0 pt-0.5">{idxSeguro + 1} de {pendientes.length}</span>
          </div>

          <div className="bg-gray-50 border border-border rounded-lg p-3 space-y-1.5">
            <p className="text-[12px] text-foreground leading-snug">"{item.detalle}"</p>
            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1">
              <span>{item.autor ?? "Jefatura"}</span>
              {item.fechaSolicitud && <span className="font-mono">{formatFechaCL(item.fechaSolicitud)}</span>}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Tu respuesta</p>
            <textarea
              value={respuesta}
              onChange={e => setRespuesta(e.target.value)}
              rows={4}
              placeholder="Escribe tu respuesta a la consulta..."
              className="w-full text-xs border border-border rounded-lg px-3 py-2.5 bg-card focus:outline-none focus:ring-1 focus:ring-accent/30 text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => irA(idxSeguro - 1)}
              disabled={idxSeguro === 0}
              className="flex items-center gap-1 text-xs font-medium rounded-lg py-2 px-3 border border-border text-foreground hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => irA(idxSeguro + 1)}
              disabled={idxSeguro >= pendientes.length - 1}
              className="flex items-center gap-1 text-xs font-medium rounded-lg py-2 px-3 border border-border text-foreground hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={enviar}
              disabled={respuesta.trim().length === 0}
              className="flex-1 text-xs font-semibold rounded-lg py-2 border border-accent bg-accent text-white hover:bg-accent/85 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Enviar respuesta
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="flex items-center gap-1 text-xs font-medium rounded-lg py-2 px-3 border border-border invisible"
              aria-hidden="true"
              tabIndex={-1}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              className="flex items-center gap-1 text-xs font-medium rounded-lg py-2 px-3 border border-border invisible"
              aria-hidden="true"
              tabIndex={-1}
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={onCancelar} className="flex-1 text-xs font-semibold rounded-lg py-2 border border-accent text-accent hover:bg-accent/10 transition-colors">Cerrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

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

const MESES_LARGOS = ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"];

function parseFechaISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatFechaSolicitud(iso: string): string {
  const fecha = parseFechaISO(iso);
  return `Tarea solicitada el ${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]} de ${fecha.getFullYear()}`;
}

function sumarDiasHabiles(fecha: Date, dias: number): Date {
  const r = new Date(fecha);
  let restantes = dias;
  while (restantes > 0) {
    r.setDate(r.getDate() + 1);
    const dow = r.getDay();
    if (dow !== 0 && dow !== 6) restantes--;
  }
  return r;
}

function plazoLegalMeta(fechaSolicitud: string, diasHabiles = 3) {
  const deadline = sumarDiasHabiles(parseFechaISO(fechaSolicitud), diasHabiles);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  deadline.setHours(0, 0, 0, 0);
  const diasRestantes = Math.round((deadline.getTime() - hoy.getTime()) / 86400000);

  const label =
    diasRestantes >= 2 ? `Quedan ${diasRestantes} días de plazo legal`
    : diasRestantes === 1 ? "Queda 1 día de plazo legal"
    : diasRestantes === 0 ? "Vence hoy el plazo legal"
    : "Plazo legal vencido";

  const color =
    diasRestantes >= 3 ? { dot: "bg-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
    : diasRestantes === 2 ? { dot: "bg-amber-400", bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }
    : { dot: "bg-red-500", bg: "bg-red-50", text: "text-red-700", border: "border-red-200" };

  return { diasRestantes, label, ...color };
}

function estadoDesdePlazoLegal(fechaSolicitud: string, diasHabiles = 3): EstadoSLA {
  const diasRestantes = plazoLegalMeta(fechaSolicitud, diasHabiles).diasRestantes;
  if (diasRestantes >= 3) return "estandar";
  if (diasRestantes === 2) return "limite";
  return "fuera";
}

function PlazoLegalBadge({ fechaSolicitud }: { fechaSolicitud: string }) {
  const m = plazoLegalMeta(fechaSolicitud);
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${m.bg} ${m.text} border ${m.border} whitespace-nowrap`}>
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

const SEMAFORO_DOT: Record<NonNullable<CausaDetalle["semaforo"]>, string> = {
  VERDE: "bg-emerald-500", AMARILLO: "bg-amber-400", ROJO: "bg-red-500",
};

const SEMAFORO_A_ESTADO: Record<NonNullable<CausaDetalle["semaforo"]>, EstadoSLA> = {
  VERDE: "estandar", AMARILLO: "limite", ROJO: "fuera",
};

// El semáforo solo se calcula una vez que la causa entra a gestión de cobranza;
// causas en trámite de exhorto u otras etapas preliminares llegan con semaforo=null.
function SemaforoBadge({ semaforo }: { semaforo: "VERDE" | "AMARILLO" | "ROJO" | null | undefined }) {
  if (!semaforo) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-500 border border-gray-200">
        <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />Sin gestión
      </span>
    );
  }
  return <EstadoBadge estado={SEMAFORO_A_ESTADO[semaforo]} />;
}

const SEMAFORO_BLOQUE: Record<NonNullable<CausaDetalle["semaforo"]>, string> = {
  VERDE: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100 hover:border-emerald-300",
  AMARILLO: "bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300",
  ROJO: "bg-red-50 border-red-200 hover:bg-red-100 hover:border-red-300",
};

const TRAMITE_PILL: Record<TramiteRow["tramite"], string> = {
  "Resolución": "bg-indigo-100 text-indigo-700",
  "Escrito": "bg-emerald-900 text-white",
  "Actuación Receptor": "bg-emerald-900 text-white",
  "": "bg-transparent",
};

function Pill({ children, tone = "bg-gray-100 text-gray-600" }: { children: React.ReactNode; tone?: string }) {
  return <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium ${tone}`}>{children}</span>;
}

// ─── Header azul unificado (título + búsqueda, notificaciones, sync, perfil) ─

function formatActualizadoHoy(date: Date) {
  const fecha = date.toLocaleDateString("es-CL", { day: "numeric", month: "long", year: "numeric" });
  const hora = date.toLocaleTimeString("es-CL", { hour: "2-digit", minute: "2-digit" });
  return `Actualizado hoy, ${fecha}, ${hora}`;
}

export function ProcuradorHeader({
  email, title, subtitle, actions, showUpdatedAt,
}: { email: string; title: string; subtitle?: string; actions?: React.ReactNode; showUpdatedAt?: boolean }) {
  const initials = email.slice(0, 2).toUpperCase();
  return (
    <div className="rounded-2xl border border-border p-5" style={{ background: "linear-gradient(120deg, #1755D4, #2E6FE0)" }}>
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold text-white tracking-tight leading-snug">{title}</h2>
          {subtitle && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>{subtitle}</p>}
          {showUpdatedAt && <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.6)" }}>{formatActualizadoHoy(new Date())}</p>}
        </div>
        <div className="flex items-center gap-2">
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
          {actions}
        </div>
      </div>
    </div>
  );
}

// ─── Modal "Analizar con IA y resolver" ─────────────────────────────────────
// Para revertir este flujo (y volver a la ejecución directa en bloque de antes),
// basta con poner IA_SUGERENCIAS_HABILITADO en false más abajo.
export const IA_SUGERENCIAS_HABILITADO = true;

const IA_PASOS = [
  { titulo: "Analizando contenido con IA", desc: "Estamos analizando los documentos y el contexto de la causa." },
  { titulo: "Buscando coincidencias relevantes", desc: "Se están identificando causas, acciones o patrones similares." },
  { titulo: "Agrupando tareas similares", desc: "La plataforma está ordenando actividades relacionadas por tipo, prioridad y contexto." },
  { titulo: "Definiendo acciones y criterios", desc: "Se están evaluando reglas, condiciones y posibles rutas de acción." },
  { titulo: "Generando sugerencias", desc: "Se están preparando recomendaciones accionables para la gestión." },
];

const SUBIDA_PASOS = [
  { titulo: "Subiendo documentos al PJUD", desc: "Enviando los escritos revisados al sistema del Poder Judicial." },
  { titulo: "Guardando tarea realizada en el historial de la causa", desc: "Registrando la actividad en la bitácora de cada causa." },
];

interface CamposPersonalizados {
  tribunal: string;
  mandante: string;
  monto: string;
  fecha: string;
  abogado: string;
  deudor: string;
}

interface EscritoGenerado {
  causaRol: string;
  tipo: string;
  pdfUrl: string;
  cuerpo: string;
  campos: CamposPersonalizados;
}

function cuerpoEscrito(label: string, rol: string, campos: CamposPersonalizados) {
  return `En autos Rol ${rol}, caratulados "${campos.mandante} con ${campos.deudor}", seguidos ante el ${campos.tribunal}, el abogado patrocinante ${campos.abogado} viene en dar cumplimiento a lo ordenado por el tribunal, acompañando los antecedentes correspondientes a "${label}" por la suma de ${campos.monto}, con fecha ${campos.fecha}. Solicito a S.S. tener por cumplido lo ordenado y continuar con la tramitación de la causa conforme a derecho.`;
}

function resaltarCamposPersonalizados(texto: string, campos: CamposPersonalizados) {
  const valores = Object.values(campos).filter(v => v && v.trim().length > 0);
  if (valores.length === 0) return texto;
  const escapadas = valores.map(v => v.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const patron = new RegExp(`(${escapadas.join("|")})`, "g");
  return texto.split(patron).map((parte, i) =>
    valores.includes(parte)
      ? <mark key={i} className="bg-yellow-200 text-foreground rounded px-0.5">{parte}</mark>
      : <React.Fragment key={i}>{parte}</React.Fragment>
  );
}

function ProgressStage({
  title, desc, actionLabel, onAction, durationMs = 2400, onVolver, volverLabel = "Volver",
}: { title: string; desc: string; actionLabel: string; onAction: () => void; durationMs?: number; onVolver?: () => void; volverLabel?: string }) {
  const [progreso, setProgreso] = useState(0);

  useEffect(() => {
    const step = 100 / (durationMs / 120);
    const t = setInterval(() => {
      setProgreso(p => {
        if (p >= 100) { clearInterval(t); return 100; }
        return Math.min(100, p + step);
      });
    }, 120);
    return () => clearInterval(t);
  }, [durationMs]);

  const completado = progreso >= 100;

  return (
    <div className="px-6 pb-6 space-y-4">
      <div className="flex items-start gap-2.5">
        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
          {completado ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <Loader2 className="w-4 h-4 text-accent animate-spin" />}
        </div>
        <div className="min-w-0">
          <p className="text-[12px] font-medium text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{desc}</p>
        </div>
      </div>
      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all duration-150" style={{ width: `${progreso}%` }} />
      </div>
      <button
        onClick={onAction}
        disabled={!completado}
        className="w-full text-xs font-semibold rounded-lg py-2 transition-colors bg-accent text-white hover:bg-accent/85 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {actionLabel}
      </button>
      {onVolver && (
        <button
          onClick={onVolver}
          className="w-full text-xs font-medium rounded-lg py-2 border border-border text-foreground hover:bg-gray-50 transition-colors"
        >
          {volverLabel}
        </button>
      )}
    </div>
  );
}

function EscritoPdfOverlay({ escrito, onClose }: { escrito: EscritoGenerado; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl h-[80vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">{escrito.tipo}</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{escrito.causaRol}</p>
          </div>
          <button onClick={onClose} className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-foreground">Cerrar</button>
        </div>
        <div className="flex-1 bg-gray-100">
          <iframe src={escrito.pdfUrl} title={`Escrito ${escrito.causaRol}`} className="w-full h-full border-0" />
        </div>
      </div>
    </div>
  );
}

function ConfirmarSubidaOverlay({ onConfirmar, onRevisar }: { onConfirmar: () => void; onRevisar: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(15,23,42,0.6)" }}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <p className="text-[13px] font-medium text-foreground leading-snug pt-1.5">¿Estás seguro que revisaste los documentos y están correctos?</p>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={onConfirmar} className="w-full text-xs font-semibold rounded-lg py-2.5 bg-accent text-white hover:bg-accent/85 transition-colors">Sí, estoy seguro</button>
          <button onClick={onRevisar} className="w-full text-xs font-medium rounded-lg py-2.5 border border-border text-foreground hover:bg-gray-50 transition-colors">Revisaré nuevamente</button>
        </div>
      </div>
    </div>
  );
}

function AnalisisIAModal({
  items,
  meta,
  onClose,
  onEjecutar,
}: {
  items: WorkItem[];
  meta: { label: string; actionLabel: string };
  onClose: () => void;
  onEjecutar: (ids: string[], mensaje: string) => void;
}) {
  const esAcompanarDocumentos = meta.label === "Acompañar documentos";

  const [progreso, setProgreso] = useState(0);
  const [etapa, setEtapa] = useState<"progreso" | "sugerencias" | "generando" | "revision" | "subiendo">(
    esAcompanarDocumentos ? "sugerencias" : "progreso"
  );
  const [escritos, setEscritos] = useState<EscritoGenerado[]>([]);
  const [verEscrito, setVerEscrito] = useState<EscritoGenerado | null>(null);
  const [editandoIdx, setEditandoIdx] = useState<number | null>(null);
  const [confirmando, setConfirmando] = useState(false);
  const [sinAccion, setSinAccion] = useState(false);
  const [guardado, setGuardado] = useState(false);
  const [idsAEjecutar, setIdsAEjecutar] = useState<string[]>([]);
  const [advertencia] = useState<{ pasoIndex: number; texto: string } | null>(() => {
    const r = Math.random();
    if (r < 0.3) return { pasoIndex: 1, texto: "No se encontraron coincidencias" };
    if (r < 0.6) return { pasoIndex: 2, texto: "No se realizaron agrupaciones" };
    return null;
  });

  useEffect(() => {
    if (esAcompanarDocumentos) return;
    const t = setInterval(() => {
      setProgreso(p => {
        if (p >= 100) {
          clearInterval(t);
          return 100;
        }
        return p + 2;
      });
    }, 120);
    return () => clearInterval(t);
  }, [esAcompanarDocumentos]);

  const [progresoSubida, setProgresoSubida] = useState(0);
  useEffect(() => {
    if (etapa !== "subiendo") return;
    setProgresoSubida(0);
    const t = setInterval(() => {
      setProgresoSubida(p => {
        if (p >= 100) { clearInterval(t); return 100; }
        return p + 2;
      });
    }, 120);
    return () => clearInterval(t);
  }, [etapa]);

  const completadoSubida = progresoSubida >= 100;
  const pasoActualSubida = Math.min(SUBIDA_PASOS.length - 1, Math.floor(progresoSubida / (100 / SUBIDA_PASOS.length)));

  const completado = progreso >= 100;
  const pasoActual = Math.min(IA_PASOS.length - 1, Math.floor(progreso / (100 / IA_PASOS.length)));
  const segundosRestantes = Math.max(0, Math.ceil(((100 - progreso) / 100) * 6));

  const generarEscritosPara = (seleccion: WorkItem[]) => {
    setIdsAEjecutar(seleccion.map(i => i.id));
    setEscritos(seleccion.map((i, idx) => {
      const campos: CamposPersonalizados = {
        tribunal: i.tribunal,
        mandante: i.mandante,
        monto: fCLP(i.cuantia),
        fecha: "20-07-2026",
        abogado: "Romina Fuentes",
        deudor: i.deudor,
      };
      return {
        causaRol: i.rol,
        tipo: meta.label,
        pdfUrl: PDF_ESCRITOS[idx % PDF_ESCRITOS.length],
        cuerpo: cuerpoEscrito(meta.label, i.rol, campos),
        campos,
      };
    }));
    setEtapa("generando");
  };

  const marcarTareasRealizadas = () => {
    onEjecutar(
      items.map(i => i.id),
      `Se registró el envío físico de los pagarés para ${items.length} causa${items.length > 1 ? "s" : ""}.`
    );
    onClose();
  };

  const opciones: { id: string; texto: React.ReactNode; destacado?: boolean; accion: () => void }[] = [
    {
      id: "generar-todas",
      texto: `Generar escritos de "${meta.label}" para cada causa y subir al PJUD`,
      destacado: true,
      accion: () => generarEscritosPara(items),
    },
    {
      id: "revisar-independiente",
      texto: "Revisar cada causa de manera independiente y generar escritos manualmente",
      accion: () => onClose(),
    },
    {
      id: "mantener-sin-cambios",
      texto: "Mantener sin cambios",
      accion: () => setSinAccion(true),
    },
  ];

  const headerMeta: Record<typeof etapa, { title: string; desc: React.ReactNode }> = {
    progreso: {
      title: "Generando sugerencias inteligentes",
      desc: (
        <>
          La plataforma está analizando <span className="font-semibold text-foreground">{items.length} causa{items.length > 1 ? "s" : ""}</span>, comparando antecedentes y preparando acciones recomendadas.
        </>
      ),
    },
    sugerencias: {
      title: "Sugerencias de la IA",
      desc: esAcompanarDocumentos
        ? `Confirma la tarea para ${items.length} causa${items.length > 1 ? "s" : ""} seleccionada${items.length > 1 ? "s" : ""}.`
        : `Elige cómo continuar con ${items.length} causa${items.length > 1 ? "s" : ""} seleccionada${items.length > 1 ? "s" : ""}.`,
    },
    generando: {
      title: "Generando escritos",
      desc: `Creando escritos de "${meta.label}" para las causas seleccionadas.`,
    },
    revision: {
      title: "Revisar escritos generados",
      desc: `${escritos.length} escrito${escritos.length > 1 ? "s" : ""} de "${meta.label}" listo${escritos.length > 1 ? "s" : ""} para revisión.`,
    },
    subiendo: {
      title: "Subiendo documentos",
      desc: "Enviando los escritos revisados al Poder Judicial.",
    },
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`bg-card border border-border rounded-2xl shadow-2xl w-full overflow-hidden ${etapa === "revision" ? "max-w-xl" : "max-w-md"}`}>
        <div className="flex items-start gap-3 px-6 pt-6 pb-4">
          <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-4.5 h-4.5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">{headerMeta[etapa].title}</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">{headerMeta[etapa].desc}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {etapa === "progreso" && (
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-accent rounded-full transition-all duration-150" style={{ width: `${progreso}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span className="font-mono">{progreso}%</span>
                <span>{completado ? "Análisis completo" : `${segundosRestantes}s restantes`}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {IA_PASOS.map((paso, i) => {
                const esAdvertencia = advertencia?.pasoIndex === i;
                let estado: "done" | "active" | "pending" | "warning" =
                  completado || i < pasoActual ? "done" : i === pasoActual ? "active" : "pending";
                if (estado === "done" && esAdvertencia) estado = "warning";
                return (
                  <div key={paso.titulo} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {estado === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {estado === "warning" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
                      {estado === "active" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                      {estado === "pending" && <Circle className="w-3.5 h-3.5 text-gray-300" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[12px] font-medium ${estado === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{paso.titulo}</p>
                      {estado === "active" && <p className="text-[11px] text-muted-foreground mt-0.5">{paso.desc}</p>}
                      {estado === "warning" && (
                        <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 shrink-0" />{advertencia!.texto}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => setEtapa("sugerencias")}
              disabled={!completado}
              className="w-full text-xs font-semibold rounded-lg py-2 transition-colors bg-accent text-white hover:bg-accent/85 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Ver sugerencias
            </button>
          </div>
        )}

        {etapa === "sugerencias" && esAcompanarDocumentos && (
          <div className="px-6 pb-6 space-y-4">
            <div className="rounded-lg border border-accent/30 bg-accent/5 p-3.5 space-y-2">
              <p className="text-[12px] text-foreground leading-snug">
                Se han enviado físicamente los pagarés de las causas
              </p>
              <ul className="space-y-0.5">
                {items.map(i => (
                  <li key={i.id} className="font-mono text-[11px] text-muted-foreground">{i.rol}</li>
                ))}
              </ul>
            </div>
            <button
              onClick={marcarTareasRealizadas}
              className="w-full text-xs font-semibold rounded-lg py-2 transition-colors bg-accent text-white hover:bg-accent/85"
            >
              Marcar tareas como realizadas
            </button>
          </div>
        )}

        {etapa === "sugerencias" && !esAcompanarDocumentos && (
          <div className="px-6 pb-6 space-y-2">
            {opciones.map((op, i) => (
              <button
                key={op.id}
                onClick={op.accion}
                className={`w-full text-left flex items-start gap-2.5 px-3.5 py-2.5 rounded-lg border transition-colors ${
                  op.destacado
                    ? "border-accent/30 bg-accent/5 hover:bg-accent/10"
                    : "border-border hover:bg-gray-50/80 hover:border-accent/30"
                }`}
              >
                <span className={`text-[11px] font-mono font-semibold w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${op.destacado ? "bg-accent text-white" : "bg-gray-100 text-muted-foreground"}`}>
                  {i + 1}
                </span>
                <span className="text-[12px] text-foreground leading-snug">{op.texto}</span>
              </button>
            ))}
          </div>
        )}

        {etapa === "generando" && (
          <ProgressStage
            title={`Creando escritos de "${meta.label}"`}
            desc="Estamos redactando y generando los documentos para las causas seleccionadas."
            actionLabel="Revisar escritos"
            onAction={() => setEtapa("revision")}
            onVolver={() => setEtapa("sugerencias")}
          />
        )}

        {etapa === "revision" && (
          <div className="px-6 pb-6 space-y-2">
            {escritos.map((esc, i) => (
              <div key={esc.causaRol} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[12px] font-semibold text-foreground">{esc.causaRol}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{esc.tipo}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button onClick={() => setVerEscrito(esc)} className="flex items-center gap-1 text-[11px] font-medium text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                      <Eye className="w-3.5 h-3.5" /> Ver
                    </button>
                    <button onClick={() => setEditandoIdx(editandoIdx === i ? null : i)} className="flex items-center gap-1 text-[11px] font-medium text-foreground border border-border rounded-lg px-2.5 py-1.5 hover:bg-gray-50 transition-colors">
                      <Pencil className="w-3.5 h-3.5" /> {editandoIdx === i ? "Guardar" : "Editar"}
                    </button>
                  </div>
                </div>
                {editandoIdx === i && (
                  <div className="mt-2.5 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <span className="inline-block w-2.5 h-2.5 rounded-sm bg-yellow-200 border border-yellow-300 shrink-0" />
                      Los campos destacados en amarillo (monto, fecha, tribunal, mandante y abogado) fueron completados automáticamente para esta causa.
                    </div>
                    <p className="text-[12px] text-foreground leading-relaxed bg-gray-50 border border-border rounded-lg p-2.5">
                      {resaltarCamposPersonalizados(esc.cuerpo, esc.campos)}
                    </p>
                    <textarea
                      value={esc.cuerpo}
                      onChange={e => {
                        const val = e.target.value;
                        setEscritos(prev => prev.map((p, pi) => pi === i ? { ...p, cuerpo: val } : p));
                      }}
                      rows={4}
                      className="w-full text-[12px] text-foreground bg-gray-50 border border-border rounded-lg p-2.5 focus:outline-none focus:ring-1 focus:ring-accent/30"
                    />
                  </div>
                )}
              </div>
            ))}
            {guardado && <p className="text-[11px] text-emerald-600 font-medium text-center">Cambios guardados.</p>}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setEtapa("sugerencias")}
                className="text-xs font-medium rounded-lg py-2 px-3.5 border border-border text-foreground hover:bg-gray-50 transition-colors"
              >
                Volver
              </button>
              <button
                onClick={() => {
                  setEditandoIdx(null);
                  setGuardado(true);
                  window.setTimeout(() => setGuardado(false), 2000);
                }}
                className="text-xs font-medium rounded-lg py-2 px-3.5 border border-border text-foreground hover:bg-gray-50 transition-colors"
              >
                Guardar
              </button>
              <button
                onClick={() => setConfirmando(true)}
                className="flex-1 text-xs font-semibold rounded-lg py-2 transition-colors bg-accent text-white hover:bg-accent/85"
              >
                Subir Documentos
              </button>
            </div>
          </div>
        )}

        {etapa === "subiendo" && (
          <div className="px-6 pb-6 space-y-4">
            <div className="space-y-2.5">
              {SUBIDA_PASOS.map((paso, i) => {
                const estado: "done" | "active" | "pending" =
                  completadoSubida || i < pasoActualSubida ? "done" : i === pasoActualSubida ? "active" : "pending";
                return (
                  <div key={paso.titulo} className="flex items-start gap-2.5">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      {estado === "done" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                      {estado === "active" && <Loader2 className="w-4 h-4 text-accent animate-spin" />}
                      {estado === "pending" && <Circle className="w-3.5 h-3.5 text-gray-300" />}
                    </div>
                    <div className="min-w-0">
                      <p className={`text-[12px] font-medium ${estado === "pending" ? "text-muted-foreground" : "text-foreground"}`}>{paso.titulo}</p>
                      {estado === "active" && <p className="text-[11px] text-muted-foreground mt-0.5">{paso.desc}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-accent rounded-full transition-all duration-150" style={{ width: `${progresoSubida}%` }} />
            </div>
            <button
              onClick={() => {
                onEjecutar(idsAEjecutar, `Escrito de ${meta.label} generado y subido para ${idsAEjecutar.length} causa${idsAEjecutar.length > 1 ? "s" : ""}.`);
                onClose();
              }}
              disabled={!completadoSubida}
              className="w-full text-xs font-semibold rounded-lg py-2 transition-colors bg-accent text-white hover:bg-accent/85 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Listo
            </button>
          </div>
        )}
      </div>

      {verEscrito && <EscritoPdfOverlay escrito={verEscrito} onClose={() => setVerEscrito(null)} />}
      {confirmando && (
        <ConfirmarSubidaOverlay
          onConfirmar={() => { setConfirmando(false); setEtapa("subiendo"); }}
          onRevisar={() => { setConfirmando(false); setEtapa("revision"); }}
        />
      )}
      {sinAccion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6" style={{ background: "rgba(15,23,42,0.6)" }}>
          <div className="bg-card rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl space-y-4">
            <p className="text-[13px] font-medium text-foreground leading-snug">No se ejecutan acciones con las causas.</p>
            <button
              onClick={() => { setSinAccion(false); onClose(); }}
              className="w-full text-xs font-semibold rounded-lg py-2.5 bg-accent text-white hover:bg-accent/85 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MiEscritorio ───────────────────────────────────────────────────────────

export function MiEscritorio({ onNavigate, onAbrirCausa, onVerTodasRojas, userName = "Romina", email = "romina@abogado.cl" }: { onNavigate?: (view: string) => void; onAbrirCausa?: (rol: string) => void; onVerTodasRojas?: () => void; userName?: string; email?: string }) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [cartera, setCartera] = useState(CARTERA);
  const [carteraLoading, setCarteraLoading] = useState(true);
  const [carteraError, setCarteraError] = useState<string | null>(null);
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoSLA | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [banner, setBanner] = useState<string | null>(null);
  const TODOS_TIPOS: AccionTipo[] = ["apercibimiento", "despachese", "designacion_martillero", "fuerza_publica", "previo"];
  const [colapsados, setColapsados] = useState<Set<AccionTipo>>(new Set(TODOS_TIPOS));
  const [iaModalItems, setIaModalItems] = useState<WorkItem[] | null>(null);
  const [confirmarRealizado, setConfirmarRealizado] = useState<{ item: WorkItem; label: string } | null>(null);
  const [confirmarRealizadoMasivo, setConfirmarRealizadoMasivo] = useState<{ items: WorkItem[]; label: string } | null>(null);
  const [realizados, setRealizados] = useState<WorkItem[]>([]);
  const [colapsadoRealizados, setColapsadoRealizados] = useState(true);
  const [finishingIds, setFinishingIds] = useState<Set<string>>(new Set());
  const [consultasColapsado, setConsultasColapsado] = useState(true);
  const [responderConsulta, setResponderConsulta] = useState<WorkItem | null>(null);
  const [responderTodasConsultas, setResponderTodasConsultas] = useState<WorkItem[] | null>(null);
  const consultas = useMemo(() => items.filter(i => i.accionTipo === "consulta"), [items]);
  const [criticas, setCriticas] = useState<MiCarteraCausaItem[]>([]);
  const [criticasTotal, setCriticasTotal] = useState(0);
  const [criticasLoading, setCriticasLoading] = useState(true);
  const [criticasError, setCriticasError] = useState<string | null>(null);

  useEffect(() => {
    let cancelado = false;
    setCriticasLoading(true);
    setCriticasError(null);
    fetchMiCartera({ colores: ["ROJO"], page_size: 4 })
      .then(res => {
        if (cancelado) return;
        setCriticas(res.causas);
        setCriticasTotal(res.total);
      })
      .catch(err => {
        if (cancelado) return;
        setCriticasError(err instanceof Error ? err.message : "No fue posible cargar las causas críticas.");
      })
      .finally(() => { if (!cancelado) setCriticasLoading(false); });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    let cancelado = false;
    setCarteraLoading(true);
    setCarteraError(null);
    Promise.all([
      fetchMiCartera({ colores: ["VERDE"], page_size: 1 }),
      fetchMiCartera({ colores: ["AMARILLO"], page_size: 1 }),
      fetchMiCartera({ colores: ["ROJO"], page_size: 1 }),
    ])
      .then(([verde, amarillo, rojo]) => {
        if (cancelado) return;
        const estandar = verde.total, limite = amarillo.total, fuera = rojo.total;
        setCartera({ total: estandar + limite + fuera, estandar, limite, fuera });
      })
      .catch(err => {
        if (cancelado) return;
        setCarteraError(err instanceof Error ? err.message : "No fue posible cargar el resumen de cartera.");
      })
      .finally(() => { if (!cancelado) setCarteraLoading(false); });
    return () => { cancelado = true; };
  }, []);

  useEffect(() => {
    let cancelado = false;
    setItemsLoading(true);
    setItemsError(null);
    cargarBandejaDesdeApi()
      .then(reales => { if (!cancelado) setItems(reales); })
      .catch(err => {
        if (cancelado) return;
        setItemsError(err instanceof Error ? err.message : "No fue posible cargar la bandeja de trabajo.");
      })
      .finally(() => { if (!cancelado) setItemsLoading(false); });
    return () => { cancelado = true; };
  }, []);

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
    const order: AccionTipo[] = ["apercibimiento", "previo", "despachese", "fuerza_publica", "designacion_martillero"];
    return order
      .map(tipo => ({ tipo, items: visibles.filter(i => i.accionTipo === tipo) }))
      .filter(g => g.items.length > 0);
  }, [visibles]);

  const selectedItems = items.filter(i => selected.has(i.id));
  const selectedTipos = new Set(selectedItems.map(i => i.accionTipo));
  const uniformTipo = selectedTipos.size === 1 ? [...selectedTipos][0] : null;
  const esMarcarHecho = uniformTipo === "apercibimiento" || uniformTipo === "previo";
  const esResponderConsultas = uniformTipo === "consulta";

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

  function ejecutar(ids: string[], mensaje: string, fechaRealizacion: string = HOY_ISO) {
    setFinishingIds(prev => { const n = new Set(prev); ids.forEach(id => n.add(id)); return n; });
    window.setTimeout(() => {
      setItems(prev => {
        const pendientes = prev.filter(i => ids.includes(i.id));
        const limiteCompletados = pendientes.filter(i => i.estado === "limite").length;
        if (limiteCompletados > 0) {
          setCartera(c => ({ ...c, limite: c.limite - limiteCompletados, estandar: c.estandar + limiteCompletados }));
        }
        const completados = pendientes.map(i => ({ ...i, estado: "estandar" as EstadoSLA, fechaRealizacion }));
        completados.forEach(i => {
          // La causa queda al día: se refleja en verde tanto en el detalle de la
          // causa (WORK_ITEMS) como en su semáforo si además vive en CAUSAS_DETALLE.
          const origenWorkItem = WORK_ITEMS.find(w => w.id === i.id);
          if (origenWorkItem) origenWorkItem.estado = "estandar";
          const causaDetalle = CAUSAS_DETALLE.find(c => c.rol === i.rol);
          if (causaDetalle) causaDetalle.semaforo = "VERDE";

          if (i.accionTipo === "consulta") return;
          registrarHistorial(i.rol, {
            fecha: formatFechaCL(fechaRealizacion),
            autor: userName,
            texto: `Se respondió a la solicitud del tribunal "${ACCION_META[i.accionTipo].label}".`,
            tipo: "tarea",
          });
        });
        setRealizados(r => [...completados, ...r]);
        return prev.filter(i => !ids.includes(i.id));
      });
      setFinishingIds(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
    }, 650);
    setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n; });
    setBanner(mensaje);
    setTimeout(() => setBanner(null), 3200);
  }

  function enviarRespuestaConsulta(item: WorkItem, respuesta: string) {
    registrarHistorial(item.rol, {
      fecha: formatFechaCL(HOY_ISO),
      autor: userName,
      texto: `Respuesta a consulta de ${item.autor ?? "jefatura"}: "${respuesta}"`,
      tipo: "jefatura",
    });
    ejecutar([item.id], `Consulta de la causa ${item.rol} respondida.`);
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-5">
      {/* Encabezado */}
      <ProcuradorHeader email={email} title={`Hola ${userName}, esta es tu bandeja de gestión diaria.`} showUpdatedAt />

      {banner && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium px-3.5 py-2.5 rounded-xl">
          <CheckCircle2 className="w-4 h-4 shrink-0" />{banner}
        </div>
      )}

      {/* Semáforo de cartera */}
      {carteraError && <EmptyState title="No fue posible cargar el resumen de cartera" desc={carteraError} />}
      {!carteraError && carteraLoading && (
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2].map(i => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 animate-pulse">
              <div className="flex items-center justify-between">
                <div className="h-5 w-24 rounded-full bg-muted" />
                <div className="h-3.5 w-16 rounded bg-muted" />
              </div>
              <div className="h-7 w-12 rounded bg-muted mt-2.5" />
              <div className="h-3 w-32 rounded bg-muted mt-2.5" />
            </div>
          ))}
        </div>
      )}
      {!carteraError && !carteraLoading && (
      <div className="grid grid-cols-3 gap-4">
        {(["estandar", "limite", "fuera"] as EstadoSLA[]).map(estado => {
          const m = ESTADO_META[estado];
          const count = cartera[estado];
          const pct = Math.round((count / cartera.total) * 100);
          const active = estadoFiltro === estado;
          const delta = estado === "estandar" ? COMPARATIVO_EQUIPO.estandarDeltaPct : estado === "fuera" ? COMPARATIVO_EQUIPO.fueraDeltaPct : null;
          return (
            <button
              key={estado}
              onClick={() => {
                if (active) {
                  setEstadoFiltro(null);
                  setColapsados(new Set(TODOS_TIPOS));
                } else {
                  setEstadoFiltro(estado);
                  setColapsados(new Set());
                }
              }}
              className={`text-left bg-card rounded-xl border p-4 transition-all ${active ? "border-accent ring-2 ring-accent/20" : `border-border ${m.hoverBorder}`}`}
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
              <p className="text-[12px] text-muted-foreground mt-1.5">{pct}% de tu cartera · {cartera.total} causas</p>
            </button>
          );
        })}
      </div>
      )}

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

          {itemsLoading && (
            <div className="bg-card rounded-xl border border-border p-10 text-center">
              <Loader2 className="w-8 h-8 text-muted-foreground mx-auto mb-2 animate-spin" />
              <p className="text-sm font-medium text-foreground">Cargando tus causas...</p>
            </div>
          )}

          {!itemsLoading && itemsError && (
            <div className="bg-card rounded-xl border border-red-200 bg-red-50 p-10 text-center">
              <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
              <p className="text-sm font-medium text-foreground">No fue posible cargar tu bandeja</p>
              <p className="text-[12px] text-muted-foreground mt-1">{itemsError}</p>
            </div>
          )}

          {!itemsLoading && !itemsError && grupos.length === 0 && (
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
            const urgentCount = gItems.filter(i => i.estado === "fuera").length;
            const abierto = !colapsados.has(tipo);
            return (
              <div key={tipo} className="bg-card rounded-xl border border-border overflow-hidden">
                <div
                  onClick={() => toggleColapso(tipo)}
                  className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gray-50/60 cursor-pointer select-none hover:bg-gray-100 transition-colors"
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
                      <AlertTriangle className="w-3 h-3" />{urgentCount} {urgentCount > 1 ? "Críticas" : "Crítica"}
                    </span>
                  )}
                  <span className="text-[11px] font-mono text-muted-foreground">{gItems.length}</span>
                </div>
                {abierto && (
                <div>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {gItems.map(item => {
                      const finalizando = finishingIds.has(item.id);
                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            backgroundColor: finalizando ? "rgba(16,185,129,0.07)" : "rgba(0,0,0,0)",
                          }}
                          exit={{ opacity: 0, y: 12, scale: 0.98, height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          onClick={() => !finalizando && onAbrirCausa?.(item.rol)}
                          className="relative flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer overflow-hidden"
                        >
                          {finalizando && (
                            <motion.div
                              className="absolute left-4 right-4 top-1/2 h-px bg-emerald-500"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              style={{ originX: 0 }}
                            />
                          )}
                          <input type="checkbox" checked={selected.has(item.id)} disabled={finalizando} onClick={e => e.stopPropagation()} onChange={() => toggle(item.id)} className="w-3.5 h-3.5 accent-accent shrink-0" />
                          <EstadoDot estado={item.estado} />
                          <div className={`flex-1 min-w-0 transition-opacity ${finalizando ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-[12px] font-semibold text-foreground ${finalizando ? "line-through" : ""}`}>{item.rol}</span>
                              <span className="text-[10px] font-mono font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{item.mandante}</span>
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
                            {item.fechaSolicitud && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{formatFechaSolicitud(item.fechaSolicitud)}</p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            {finalizando ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />Completando…
                              </span>
                            ) : (
                              <>
                                {item.semaforo && (
                                  <span title={`Semáforo: ${item.semaforo}`} className={`w-2 h-2 rounded-full ${SEMAFORO_DOT[item.semaforo]}`} />
                                )}
                                <EstadoBadge estado={item.estado} />
                                {item.fechaSolicitud && item.estado !== "estandar" && <PlazoLegalBadge fechaSolicitud={item.fechaSolicitud} />}
                              </>
                            )}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setConfirmarRealizado({ item, label: meta.label }); }}
                            disabled={finalizando}
                            className="group text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 shrink-0 whitespace-nowrap w-[84px] py-1.5 rounded-lg inline-flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent shadow-sm transition-colors disabled:opacity-0"
                          >
                            <span className="group-hover:hidden">Pendiente</span>
                            <span className="hidden group-hover:inline">Lo hice</span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
                )}
              </div>
            );
          })}

          {/* Consultas */}
          {consultas.length > 0 && (
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div
                onClick={() => setConsultasColapsado(v => !v)}
                className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gray-50/60 cursor-pointer select-none hover:bg-gray-100 transition-colors"
              >
                <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${!consultasColapsado ? "rotate-90" : ""}`} />
                <input
                  type="checkbox"
                  checked={consultas.every(i => selected.has(i.id))}
                  onClick={e => e.stopPropagation()}
                  onChange={() => toggleGroup("consulta", consultas.map(i => i.id))}
                  className="w-3.5 h-3.5 accent-accent"
                />
                <MessageSquare className="w-4 h-4 text-accent shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground">Consultas</p>
                  <p className="text-[11px] text-muted-foreground">Consultas de jefatura sobre las causas</p>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">{consultas.length}</span>
              </div>
              {!consultasColapsado && (
                <div>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {consultas.map(item => {
                      const finalizando = finishingIds.has(item.id);
                      return (
                        <motion.div
                          layout
                          key={item.id}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{
                            opacity: 1,
                            y: 0,
                            backgroundColor: finalizando ? "rgba(16,185,129,0.07)" : "rgba(0,0,0,0)",
                          }}
                          exit={{ opacity: 0, y: 12, scale: 0.98, height: 0, paddingTop: 0, paddingBottom: 0, marginTop: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          onClick={() => !finalizando && onAbrirCausa?.(item.rol)}
                          className="relative flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer overflow-hidden"
                        >
                          {finalizando && (
                            <motion.div
                              className="absolute left-4 right-4 top-1/2 h-px bg-emerald-500"
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              style={{ originX: 0 }}
                            />
                          )}
                          <input type="checkbox" checked={selected.has(item.id)} disabled={finalizando} onClick={e => e.stopPropagation()} onChange={() => toggle(item.id)} className="w-3.5 h-3.5 accent-accent shrink-0" />
                          <EstadoDot estado={item.estado} />
                          <div className={`flex-1 min-w-0 transition-opacity ${finalizando ? "opacity-60" : ""}`}>
                            <div className="flex items-center gap-2">
                              <span className={`font-mono text-[12px] font-semibold text-foreground ${finalizando ? "line-through" : ""}`}>{item.rol}</span>
                              <span className="text-[10px] font-mono font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{item.mandante}</span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              <span className="text-[11px] text-muted-foreground">{item.tribunal}</span>
                              {item.detalle && <span className="text-[11px] text-muted-foreground italic truncate">"{item.detalle}"</span>}
                              {item.autor && <span className="text-[11px] font-medium text-accent">{item.autor}</span>}
                            </div>
                            {item.fechaSolicitud && (
                              <p className="text-[10px] text-muted-foreground mt-0.5">{formatFechaSolicitud(item.fechaSolicitud)}</p>
                            )}
                          </div>
                          <div className="shrink-0 flex items-center gap-1.5">
                            {finalizando ? (
                              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" />Completando…
                              </span>
                            ) : (
                              <>
                                {item.semaforo && (
                                  <span title={`Semáforo: ${item.semaforo}`} className={`w-2 h-2 rounded-full ${SEMAFORO_DOT[item.semaforo]}`} />
                                )}
                                <EstadoBadge estado={item.estado} />
                                {item.fechaSolicitud && item.estado !== "estandar" && <PlazoLegalBadge fechaSolicitud={item.fechaSolicitud} />}
                              </>
                            )}
                          </div>
                          <button
                            onClick={e => { e.stopPropagation(); setResponderConsulta(item); }}
                            disabled={finalizando}
                            className="group text-[11px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 shrink-0 whitespace-nowrap w-[84px] py-1.5 rounded-lg inline-flex items-center justify-center hover:bg-accent hover:text-white hover:border-accent shadow-sm transition-colors disabled:opacity-0"
                          >
                            <span className="group-hover:hidden">Pendiente</span>
                            <span className="hidden group-hover:inline">Lo hice</span>
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          )}

          {/* Separador entre pendientes y realizadas */}
          <div className="pt-3 border-t border-border" />

          {/* Tareas realizadas */}
          <div className="bg-card rounded-xl border border-border overflow-hidden">
            <div
              onClick={() => setColapsadoRealizados(v => !v)}
              className="flex items-center gap-3 px-4 py-3 border-b border-border bg-gray-50/60 cursor-pointer select-none hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className={`w-3.5 h-3.5 text-muted-foreground shrink-0 transition-transform ${!colapsadoRealizados ? "rotate-90" : ""}`} />
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground">Tareas realizadas</p>
                <p className="text-[11px] text-muted-foreground">Tareas completadas y retiradas de la bandeja de trabajo</p>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">{realizados.length}</span>
            </div>
            {!colapsadoRealizados && (
              <div>
                {realizados.length === 0 && (
                  <p className="text-[12px] text-muted-foreground px-4 py-4">Aún no hay tareas marcadas como realizadas.</p>
                )}
                <AnimatePresence initial={false}>
                  {realizados.map(item => (
                    <motion.div
                      layout
                      key={item.id}
                      initial={{ opacity: 0, y: -10, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      onClick={() => onAbrirCausa?.(item.rol)}
                      className="flex items-center gap-3 px-4 py-2.5 border-b border-border last:border-0 hover:bg-gray-50/60 transition-colors cursor-pointer"
                    >
                      <motion.span
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.25, delay: 0.1, ease: "easeOut" }}
                        className="grid place-items-center w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 shrink-0"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                      </motion.span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[12px] font-semibold text-foreground">{item.rol}</span>
                          <span className="text-[10px] font-mono font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded shrink-0">{item.mandante}</span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span className="text-[11px] text-muted-foreground">{item.tribunal}</span>
                          {item.fechaRealizacion && (
                            <span className="text-[11px] text-muted-foreground">Realizada el {formatFechaCL(item.fechaRealizacion)}</span>
                          )}
                          {item.fechaRealizacion && item.accionTipo === "consulta" && (
                            <span className="text-[11px] font-medium text-accent">Respuesta a pregunta de jefatura</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {!item.fechaRealizacion && <EstadoBadge estado={item.estado} />}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="space-y-4">
          {/* Vencimientos críticos */}
          <div className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <CalendarClock className="w-4 h-4 text-red-500" />
              <h3 className="text-xs font-semibold text-foreground">Vencimientos críticos</h3>
            </div>
            {criticasError && <p className="text-[11px] text-red-600">{criticasError}</p>}
            {!criticasError && (
            <div className="space-y-2.5">
              {criticas.map(v => (
                <div
                  key={v.causa_id ?? v.rol}
                  onClick={() => onAbrirCausa?.(v.rol)}
                  className="p-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5 hover:bg-red-100 hover:border-red-300 bg-red-50 border-red-200"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] font-semibold text-foreground">{v.rol}</span>
                    <EstadoBadge estado="fuera" />
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate mt-0.5">{v.cliente ?? "-"}</p>
                  <p className="text-[11px] text-foreground font-medium mt-0.5">{v.subestado ?? v.etapa ?? "-"}</p>
                </div>
              ))}
              {!criticasLoading && criticasTotal === 0 && (
                <p className="text-[11px] text-muted-foreground">Sin vencimientos críticos.</p>
              )}
            </div>
            )}
            {!criticasError && criticasTotal > criticas.length && (
              <button
                onClick={() => onVerTodasRojas?.()}
                className="w-full mt-2.5 text-[11px] font-medium text-accent hover:underline text-center"
              >
                Ver más ({criticasTotal} en total)
              </button>
            )}
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
              onClick={() => {
                if (esMarcarHecho) {
                  setConfirmarRealizadoMasivo({ items: selectedItems, label: ACCION_META[uniformTipo].label });
                } else if (esResponderConsultas) {
                  setResponderTodasConsultas(selectedItems);
                } else if (IA_SUGERENCIAS_HABILITADO) {
                  setIaModalItems(items.filter(i => selected.has(i.id)));
                } else {
                  ejecutar([...selected], `${ACCION_META[uniformTipo].actionLabel}: ${selected.size} causas gestionadas masivamente con apoyo de IA.`);
                }
              }}
              className="flex items-center gap-1.5 text-xs font-semibold bg-accent hover:bg-accent/85 px-3.5 py-1.5 rounded-lg transition-colors"
            >
              {esMarcarHecho || esResponderConsultas ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Sparkles className="w-3.5 h-3.5" />}
              {esMarcarHecho ? "Marcar como hecho" : esResponderConsultas ? "Responder a todas las preguntas" : "Analizar con IA y resolver"}
            </button>
          ) : (
            <span className="text-[11px] text-white/60">Selecciona tareas de un mismo tipo para gestionar en bloque</span>
          )}
          <button onClick={() => setSelected(new Set())} className="text-white/50 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {iaModalItems && uniformTipo && (
        <AnalisisIAModal
          items={iaModalItems}
          meta={ACCION_META[uniformTipo]}
          onClose={() => setIaModalItems(null)}
          onEjecutar={(ids, mensaje) => ejecutar(ids, mensaje)}
        />
      )}

      {confirmarRealizado && (
        <ConfirmarRealizadoModal
          item={confirmarRealizado.item}
          label={confirmarRealizado.label}
          onCancelar={() => setConfirmarRealizado(null)}
          onConfirmar={fecha => {
            ejecutar([confirmarRealizado.item.id], `${confirmarRealizado.label}: causa ${confirmarRealizado.item.rol} marcada como realizada (${fecha}).`, fecha);
            setConfirmarRealizado(null);
          }}
          onRevisar={() => {
            const rol = confirmarRealizado.item.rol;
            setConfirmarRealizado(null);
            onAbrirCausa?.(rol);
          }}
        />
      )}

      {confirmarRealizadoMasivo && (
        <ConfirmarRealizadoMasivoModal
          items={confirmarRealizadoMasivo.items}
          label={confirmarRealizadoMasivo.label}
          onCancelar={() => setConfirmarRealizadoMasivo(null)}
          onConfirmar={fecha => {
            ejecutar(
              confirmarRealizadoMasivo.items.map(i => i.id),
              `${confirmarRealizadoMasivo.label}: ${confirmarRealizadoMasivo.items.length} causas marcadas como realizadas (${fecha}).`,
              fecha
            );
            setConfirmarRealizadoMasivo(null);
          }}
        />
      )}

      {responderConsulta && (
        <ResponderConsultaModal
          item={responderConsulta}
          onCancelar={() => setResponderConsulta(null)}
          onEnviar={respuesta => {
            enviarRespuestaConsulta(responderConsulta, respuesta);
            setResponderConsulta(null);
          }}
        />
      )}

      {responderTodasConsultas && (
        <ResponderConsultasModal
          items={responderTodasConsultas}
          onCancelar={() => setResponderTodasConsultas(null)}
          onCerrar={() => setResponderTodasConsultas(null)}
          onEnviar={(item, respuesta) => enviarRespuestaConsulta(item, respuesta)}
        />
      )}

    </div>
  );
}

// ─── Mis Causas ─────────────────────────────────────────────────────────────

const PROCEDIMIENTOS = [
  "Básico", "Desposeimiento", "Ejecutivo Mínima Cuantía", "Ejecutivo Obligación de Dar",
  "Ejecutivo de Desposeimiento", "Exhorto", "Gestión Preparatoria (Citac.Conf.Deuda)",
  "Gestión Preparatoria Desposeimiento", "Gestión Voluntaria", "Juicio de arrendamiento",
  "Ley de Bancos", "Liquidación Forzosa", "Liquidación Forzosa Simplificada",
  "Liquidación Simplificada", "Liquidación Voluntaria", "Monitorio", "Ordinario",
  "Ordinario Mayor Cuantía", "Ordinario Menor Cuantia", "Procedimiento Prenda - Ley 20.190",
  "Voluntario - Posesión efectiva",
];

function SimpleModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,23,42,0.5)" }} onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-2xl max-h-[80vh] overflow-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">{title}</h3>
          <button onClick={onClose} className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-foreground">Cerrar</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function EmptyState({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="py-10 text-center">
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-[12px] text-muted-foreground mt-1">{desc}</p>
    </div>
  );
}

function PdfViewerModal({ row, onClose }: { row: TramiteRow; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(15,23,42,0.6)" }} onClick={onClose}>
      <div className="bg-card rounded-2xl border border-border w-full max-w-3xl h-[85vh] overflow-hidden shadow-2xl flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div>
            <p className="text-sm font-semibold text-foreground">Folio {row.folio} · {row.descTramite}</p>
            <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{row.fecha}{row.etapa && ` · ${row.etapa}`}</p>
          </div>
          <div className="flex items-center gap-2">
            {row.pdfUrl && (
              <a href={row.pdfUrl} download className="flex items-center gap-1.5 text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-foreground">
                <Download className="w-3.5 h-3.5" /> Descargar
              </a>
            )}
            <button onClick={onClose} className="text-xs font-medium border border-border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors text-foreground">Cerrar</button>
          </div>
        </div>
        <div className="flex-1 bg-gray-100">
          {row.pdfUrl ? (
            <iframe src={row.pdfUrl} title={`Documento folio ${row.folio}`} className="w-full h-full border-0" />
          ) : (
            <EmptyState title="Sin documento digitalizado" desc="Este trámite no tiene un PDF asociado." />
          )}
        </div>
      </div>
    </div>
  );
}

function TramiteTable({ rows, onVer }: { rows: TramiteRow[]; onVer: (r: TramiteRow) => void }) {
  if (rows.length === 0) return <EmptyState title="Sin registros" desc="No existen movimientos asociados a esta causa." />;
  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-border bg-gray-50/60">
            {["Ver", "Folio", "Anexos", "Fecha", "Etapa", "Trámite", "Desc. Trámite"].map(h => (
              <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide whitespace-nowrap">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-b border-border last:border-0 hover:bg-gray-50/70 transition-colors">
              <td className="px-4 py-3">
                <button onClick={() => onVer(r)} disabled={!r.pdfUrl} className={r.pdfUrl ? "text-foreground hover:text-accent transition-colors" : "text-gray-300 cursor-not-allowed"}>
                  {r.pdfUrl ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4 opacity-40" style={{ textDecoration: "line-through" }} />}
                </button>
              </td>
              <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">{r.folio}</td>
              <td className="px-4 py-3">{r.anexo && <FileText className="w-4 h-4 text-foreground" />}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{r.fecha}</td>
              <td className="px-4 py-3 text-[12px] text-muted-foreground">{r.etapa || "—"}</td>
              <td className="px-4 py-3">{r.tramite && <Pill tone={TRAMITE_PILL[r.tramite]}>{r.tramite}</Pill>}</td>
              <td className="px-4 py-3 text-[12px] text-foreground">{r.descTramite}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const CANAL_META: Record<NonNullable<HistItem["canal"]>, { label: string; icon: React.ElementType }> = {
  telefono: { label: "Llamada telefónica", icon: Headphones },
  whatsapp: { label: "WhatsApp", icon: MessageCircle },
  mail: { label: "Correo", icon: Mail },
  presencial: { label: "Contacto presencial", icon: User },
};

function historialLado(h: HistItem): "interno" | "jefatura_pregunta" | "pjud" {
  if (h.tipo === "tribunal") return "pjud";
  if (h.tipo === "jefatura" && /jefatura/i.test(h.autor)) return "jefatura_pregunta";
  return "interno";
}

function historialIcono(h: HistItem): React.ElementType {
  if (h.tipo === "contacto") return h.canal ? CANAL_META[h.canal].icon : Phone;
  if (h.tipo === "jefatura") return /jefatura/i.test(h.autor) ? HelpCircle : Reply;
  return HIST_TIPO_META[h.tipo].icon;
}

function historialEtiqueta(h: HistItem): string {
  if (h.tipo === "tribunal") return "Novedad PJUD · Estado diario";
  if (h.tipo === "jefatura") return /jefatura/i.test(h.autor) ? "Pregunta de jefatura" : "Respuesta a jefatura";
  if (h.tipo === "tarea") return "Respuesta a solicitud del tribunal";
  if (h.tipo === "documento") return "Tarea interna · Documento";
  if (h.tipo === "contacto") return `Tarea interna · ${h.canal ? CANAL_META[h.canal].label : "Contacto con cliente"}`;
  if (h.tipo === "estado") return "Tarea interna · Cambio de estado";
  return "Tarea interna · Observación";
}

function HistorialPanel({ rol, onClose }: { rol: string; onClose: () => void }) {
  const items = [...getHistorial(rol)].reverse();
  return (
    <div className="h-full bg-card border border-border rounded-2xl shadow-sm flex flex-col overflow-hidden">
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border shrink-0" style={{ background: "linear-gradient(135deg, rgba(23,85,212,0.08), rgba(124,58,237,0.06))" }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#1755D4" }}>
          <History className="w-3.5 h-3.5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-foreground">Historial · {rol}</p>
          <p className="text-[11px] text-muted-foreground">Bitácora de actividad, solo lectura</p>
        </div>
        <button onClick={onClose} title="Cerrar historial" className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors shrink-0">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5" style={{ background: "repeating-linear-gradient(135deg, rgba(0,0,0,0.015) 0px, rgba(0,0,0,0.015) 1px, transparent 1px, transparent 12px)" }}>
        {items.length === 0 ? (
          <p className="text-[12px] text-muted-foreground text-center py-6">Sin actividad registrada para esta causa.</p>
        ) : (
          items.map((h, i) => {
            const Icon = historialIcono(h);
            const lado = historialLado(h);
            const etiqueta = historialEtiqueta(h);

            if (lado === "pjud") {
              return (
                <div key={i} className="flex justify-center py-1">
                  <div className="max-w-[90%] bg-gray-100 border border-gray-200 rounded-xl px-3.5 py-2.5">
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">
                      <Icon className="w-3 h-3" />{etiqueta}
                    </div>
                    <p className="text-[12px] text-foreground text-center leading-snug mt-1">{h.texto}</p>
                    <p className="text-[10px] text-gray-400 text-center font-mono mt-1">{h.fecha}</p>
                  </div>
                </div>
              );
            }

            const esDerecha = lado === "interno";
            return (
              <div key={i} className={`flex ${esDerecha ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 shadow-sm ${
                    esDerecha
                      ? "bg-accent text-white rounded-2xl rounded-br-sm"
                      : "bg-amber-50 border border-amber-200 text-foreground rounded-2xl rounded-bl-sm"
                  }`}
                >
                  <div className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide ${esDerecha ? "text-white/80" : "text-amber-700"}`}>
                    <Icon className="w-3 h-3" />{etiqueta}
                  </div>
                  <p className={`text-[12px] leading-snug mt-1 ${esDerecha ? "text-white" : "text-foreground"}`}>{h.texto}</p>
                  <div className={`flex items-center justify-between gap-3 text-[10px] mt-1.5 ${esDerecha ? "text-white/70" : "text-amber-700/70"}`}>
                    <span className="truncate">{h.autor}</span>
                    <span className="font-mono shrink-0">{h.fecha}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CausaDetalleView({ causa, onVolver, onIrACausa }: { causa: CausaDetalle; onVolver: () => void; onIrACausa: (rol: string) => void }) {
  const [tab, setTab] = useState<"historia" | "notificaciones" | "escritos" | "litigantes" | "exhortos">("historia");
  const [cuaderno, setCuaderno] = useState(causa.cuadernos[0]);
  const [pdfRow, setPdfRow] = useState<TramiteRow | null>(null);
  const [modal, setModal] = useState<"notificaciones" | "anexos" | "remate" | null>(null);
  const [historialAbierto, setHistorialAbierto] = useState(false);

  useEffect(() => { setTab("historia"); setCuaderno(causa.cuadernos[0]); setHistorialAbierto(false); }, [causa.rol]);

  const escritos = causa.historia.filter(r => r.tramite === "Escrito");
  const anexosCount = causa.historia.filter(r => r.anexo).length;

  return (
    <div className="flex-1 flex overflow-hidden min-h-0">
    <div className="flex-1 overflow-auto p-6 space-y-4 min-w-0">
      <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
        <div className="flex items-center gap-2">
          <button onClick={onVolver} className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-gray-50 transition-colors text-foreground">Volver</button>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground tracking-tight leading-snug">Detalle de Causa {causa.rol}</h2>
          <SemaforoBadge semaforo={causa.semaforo} />
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-x-6 gap-y-1.5 border rounded-xl px-4 py-2.5 text-[12px] transition-colors ${
          causa.semaforo ? SEMAFORO_BLOQUE[causa.semaforo] : "bg-gray-50 border-border"
        }`}>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5">
            <span className="text-muted-foreground">Estado Causa: <span className="font-semibold text-foreground">{causa.estadoCausa ?? "-"}</span></span>
            <span className="text-muted-foreground flex items-center gap-1.5">Semaforo: {causa.semaforo ? <><span className={`w-2 h-2 rounded-full ${SEMAFORO_DOT[causa.semaforo]}`} /><span className="font-semibold text-foreground">{causa.semaforo}</span></> : <span className="font-semibold text-foreground">-</span>}</span>
            <span className="text-muted-foreground">Estado CRM: <span className="font-semibold text-foreground">{causa.estadoCRM ?? "-"}</span></span>
            <span className="text-muted-foreground">Subestado CRM: <span className="font-semibold text-foreground">{causa.subestadoCRM ?? "-"}</span></span>
          </div>
          <button
            onClick={() => setHistorialAbierto(v => !v)}
            className={`flex items-center gap-2 text-sm font-bold rounded-full px-4 py-2.5 shrink-0 shadow-md border-2 transition-colors ${
              historialAbierto ? "bg-accent text-white border-accent" : "bg-white text-accent border-accent hover:bg-accent hover:text-white"
            }`}
          >
            <History className="w-5 h-5" />Historial
          </button>
        </div>

        {causa.causaOrigenRol && (
          <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <div>
              <p className="text-[11px] text-blue-700">Causa de origen</p>
              <p className="font-mono text-[12px] font-semibold text-blue-900 mt-0.5">{causa.causaOrigenRol}</p>
            </div>
            <button onClick={() => onIrACausa(causa.causaOrigenRol!)} className="text-[11px] font-medium text-blue-700 hover:text-blue-900 transition-colors">Ver detalle</button>
          </div>
        )}

        <div className="border-t border-border pt-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Información General</h3>
            {causa.badge && <Pill tone="bg-white border border-indigo-300 text-indigo-700">● {causa.badge}</Pill>}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5">
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">ROL</p><p className="font-mono text-[12px] font-semibold text-foreground mt-0.5">{causa.rol}</p></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Fecha Ingreso</p><p className="font-mono text-[12px] font-semibold text-foreground mt-0.5">{causa.fechaIngreso}</p></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Estado Administrativo</p><Pill tone={causa.estadoAdm === "Sin archivar" ? "bg-gray-900 text-white" : "bg-gray-400 text-white"}>{causa.estadoAdm}</Pill></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Procedimiento</p><p className="text-[12px] font-semibold text-foreground mt-0.5">{causa.procedimiento}</p></div>

            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Tribunal</p><p className="text-[12px] font-semibold text-foreground mt-0.5">{causa.tribunal}</p></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Ubicación</p><Pill tone="bg-slate-600 text-white">{causa.ubicacion}</Pill></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Estado Proc.</p><Pill tone={causa.estadoProc === "Concluido" ? "bg-red-600 text-white" : "bg-gray-900 text-white"}>{causa.estadoProc}</Pill></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Etapa</p><p className="text-[12px] font-semibold text-foreground mt-0.5">{causa.etapa}</p></div>

            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Cliente</p><p className="text-[12px] font-semibold text-foreground mt-0.5">{causa.cliente}</p></div>
            <div><p className="text-[11px] text-muted-foreground uppercase tracking-wide">Procurador/a Asignado</p><p className="text-[12px] font-semibold text-foreground mt-0.5">{causa.procurador}</p></div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Nro Pagaré</p>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="font-mono text-[12px] font-semibold text-foreground">{causa.nroPagare}</p>
                {causa.nroPagare !== "No recuperado" && (
                  <button
                    onClick={() => setPdfRow({ folio: 0, fecha: causa.fechaIngreso, etapa: "", tramite: "", descTramite: "Pagaré", pdfUrl: PDF_PAGARE })}
                    className="text-[11px] font-medium text-accent hover:underline"
                  >
                    Ver
                  </button>
                )}
              </div>
            </div>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-wide">Remate Asociado</p>
              {causa.remate
                ? <button onClick={() => setModal("remate")} className="mt-1 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-medium hover:bg-gray-800 transition-colors">Leer más</button>
                : <p className="text-[12px] text-muted-foreground mt-0.5">Sin remate asociado</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setPdfRow({ folio: 0, fecha: causa.fechaIngreso, etapa: "Ebook", tramite: "", descTramite: "Expediente digital (ebook)", pdfUrl: PDF_EBOOK[causa.cliente] ?? PDF_EBOOK.SNC })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            <FileText className="w-4 h-4" /> Ebook
          </button>
          <button onClick={() => setModal("notificaciones")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors">
            <Inbox className="w-4 h-4" /> Notificaciones Receptor
          </button>
          <button onClick={() => setModal("anexos")} className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors">
            <Inbox className="w-4 h-4" /> Anexos {anexosCount > 0 && `(${anexosCount})`}
          </button>
          <button
            onClick={() => setPdfRow({ folio: 0, fecha: causa.fechaIngreso, etapa: "", tramite: "", descTramite: "Mandato judicial", pdfUrl: PDF_MANDATO })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            <FileText className="w-4 h-4" /> Mandato
          </button>
          <button
            onClick={() => setPdfRow({ folio: 0, fecha: causa.fechaIngreso, etapa: "", tramite: "", descTramite: "Detalle de la operación", pdfUrl: PDF_DETALLE_OPERACION })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 transition-colors"
          >
            <FileText className="w-4 h-4" /> Detalle Operación
          </button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-5">
        <h3 className="text-sm font-semibold text-foreground mb-3">Seleccionar Cuaderno</h3>
        <select value={cuaderno} onChange={e => setCuaderno(e.target.value)} className="w-full max-w-md text-xs border border-border rounded-lg px-3 py-2.5 bg-card focus:outline-none text-foreground">
          {causa.cuadernos.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        <div className="flex border-b border-border">
          {([
            ["historia", "Historia"], ["notificaciones", "Notificaciones"], ["escritos", "Escritos"],
            ["litigantes", "Litigantes"], ["exhortos", "Exhortos"],
          ] as const).map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} className={`px-4 py-2.5 text-xs font-medium border-b-2 -mb-px transition-colors ${tab === id ? "text-foreground border-foreground" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === "historia" && <TramiteTable rows={causa.historia} onVer={setPdfRow} />}
        {tab === "notificaciones" && <EmptyState title="Sin notificaciones" desc="No existen notificaciones del receptor asociadas a esta causa." />}
        {tab === "escritos" && <TramiteTable rows={escritos} onVer={setPdfRow} />}
        {tab === "litigantes" && (
          causa.litigantes.length === 0 ? <EmptyState title="Sin litigantes" desc="No existen litigantes registrados en esta causa." /> : (
            <div className="space-y-2">
              <div className="flex justify-end">
                <button
                  onClick={() => setPdfRow({ folio: 0, fecha: causa.fechaIngreso, etapa: "", tramite: "", descTramite: "Ficha de litigantes", pdfUrl: PDF_LITIGANTES[causa.rol.length % PDF_LITIGANTES.length] })}
                  className="text-[11px] font-medium text-accent hover:underline"
                >
                  Ver documento
                </button>
              </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-gray-50/60">
                    {["Nombre", "RUT", "Calidad", "Tipo"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {causa.litigantes.map((l, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-gray-50/70 transition-colors">
                      <td className="px-4 py-3 font-semibold text-[12px] text-foreground">{l.nombre}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{l.rut}</td>
                      <td className="px-4 py-3 text-[12px] text-foreground">{l.calidad}</td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">{l.tipo}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </div>
          )
        )}
        {tab === "exhortos" && (
          causa.exhortos.length === 0 ? <EmptyState title="Sin exhortos" desc="Sin exhortos asociados a esta causa." /> : (
            <div className="bg-card rounded-xl border border-border overflow-hidden overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border bg-gray-50/60">
                    {["ROL", "FECHA INGRESO", "TRIBUNAL", "ESTADO"].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {causa.exhortos.map((e, i) => (
                    <tr key={i} onClick={() => onIrACausa(e.rol)} className="border-b border-border last:border-0 hover:bg-gray-50/70 transition-colors cursor-pointer">
                      <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">{e.rol}</td>
                      <td className="px-4 py-3 font-mono text-[11px] text-muted-foreground">{e.fechaIngreso}</td>
                      <td className="px-4 py-3 text-[12px] text-foreground">{e.tribunal}</td>
                      <td className="px-4 py-3 text-[12px] text-muted-foreground">{e.estado}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>

      {pdfRow && <PdfViewerModal row={pdfRow} onClose={() => setPdfRow(null)} />}
      {modal === "notificaciones" && (
        <SimpleModal title="Notificaciones Receptor" onClose={() => setModal(null)}>
          {causa.historia.some(r => r.tramite === "Actuación Receptor") ? (
            <div className="space-y-2">
              {causa.historia.filter(r => r.tramite === "Actuación Receptor").map((r, i) => (
                <div key={i} className="p-3 bg-gray-50 rounded-lg border border-border">
                  <p className="text-[12px] font-semibold text-foreground">{r.descTramite}</p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{r.fecha}</p>
                </div>
              ))}
            </div>
          ) : <EmptyState title="Sin notificaciones" desc="No existen notificaciones del receptor asociadas a esta causa." />}
        </SimpleModal>
      )}
      {modal === "anexos" && (
        <SimpleModal title="Anexos" onClose={() => setModal(null)}>
          {anexosCount > 0 ? (
            <div className="space-y-2">
              {causa.historia.filter(r => r.anexo).map((r, i) => (
                <button key={i} onClick={() => { setModal(null); setPdfRow(r); }} className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-border hover:bg-gray-100 transition-colors text-left">
                  <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-[12px] font-medium text-foreground">Folio {r.folio} · {r.descTramite}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{r.fecha}</span>
                </button>
              ))}
            </div>
          ) : <EmptyState title="Sin Documentos Anexos" desc="No existen anexos." />}
        </SimpleModal>
      )}
      {modal === "remate" && (
        <SimpleModal title="Remate Asociado" onClose={() => setModal(null)}>
          <p className="text-[12px] text-foreground leading-relaxed">{causa.remate}</p>
        </SimpleModal>
      )}
    </div>

    {historialAbierto && (
      <aside className="w-full lg:w-[380px] shrink-0 h-full py-6 pr-6">
        <HistorialPanel rol={causa.rol} onClose={() => setHistorialAbierto(false)} />
      </aside>
    )}
    </div>
  );
}

type ColKey = "rol" | "numero_pagare" | "tribunal_nombre" | "cliente_nombre" | "procurador_nombre" | "fecha_ingreso" | "etapa" | "semaforo";

const COLUMNAS: { key: ColKey; label: string }[] = [
  { key: "rol", label: "Rol/OP" },
  { key: "numero_pagare", label: "Pagaré" },
  { key: "tribunal_nombre", label: "Tribunal" },
  { key: "cliente_nombre", label: "Cliente" },
  { key: "procurador_nombre", label: "Procurador" },
  { key: "fecha_ingreso", label: "Fec. Ingreso" },
  { key: "etapa", label: "Etapa" },
  { key: "semaforo", label: "Estado" },
];

const SEMAFORO_RANK: Record<NonNullable<CausaListadoItem["semaforo"]>, number> = { ROJO: 0, AMARILLO: 1, VERDE: 2 };

function valorColumna(c: CausaListadoItem, key: ColKey): string | number {
  if (key === "semaforo") return c.semaforo ? SEMAFORO_RANK[c.semaforo] : 3;
  return (c[key] ?? "").toString().toLowerCase();
}

// Mapea el detalle rico de GET /causa/{causa_id} a la interfaz CausaDetalle que
// ya usa CausaDetalleView. Historia y litigantes se aplanan entre cuadernos:
// el selector de cuaderno en la vista de detalle es solo informativo.
function mapCausaWebToDetalle(c: CausaWeb): CausaDetalle {
  const historia: TramiteRow[] = [];
  const litigantes: Litigante[] = [];
  for (const cuad of c.cuadernos) {
    for (const h of cuad.historia) {
      historia.push({
        folio: Number(h.folio) || 0,
        fecha: h.fecha,
        etapa: h.etapa,
        tramite: (["Resolución", "Escrito", "Actuación Receptor"].includes(h.tramite) ? h.tramite : "") as TramiteRow["tramite"],
        descTramite: h.desc_tramite,
        anexo: !!h.certificado_url,
        pdfUrl: h.documento_url ?? undefined,
      });
    }
    for (const l of cuad.litigantes) {
      litigantes.push({ nombre: l.nombre, rut: l.rut, calidad: l.calidad, tipo: l.tipo });
    }
  }
  return {
    rol: c.rol,
    pagare: c.numero_pagare ?? "-",
    tribunal: c.tribunal_nombre,
    cliente: c.cliente_nombre,
    procurador: c.procurador_nombre,
    fechaIngreso: c.fecha_ingreso,
    etapa: c.etapa,
    estadoAdm: c.est_adm === "Archivada" ? "Archivada" : "Sin archivar",
    procedimiento: c.proc,
    estadoCausa: c.estado_causa === "ACTIVO" || c.estado_causa === "INACTIVADO" ? c.estado_causa : undefined,
    semaforo: c.semaforo ?? undefined,
    estadoCRM: c.estado_crm ?? undefined,
    subestadoCRM: c.subestado_crm ?? undefined,
    ubicacion: c.ubicacion === "Física" ? "Física" : "Digital",
    estadoProc: c.estado_proc === "Concluido" ? "Concluido" : "Tramitación",
    causaOrigenRol: c.causa_origen?.rol,
    nroPagare: c.numero_pagare ?? "No recuperado",
    remate: c.remate_resumen ?? undefined,
    abogadoPatrocinante: "",
    cuadernos: c.cuadernos.map(cu => cu.nombre),
    historia,
    litigantes,
    exhortos: c.exhortos_asociados.map(e => ({
      rol: e.rol,
      fechaIngreso: e.fecha_ingreso,
      tribunal: e.tribunal_nombre,
      estado: e.estado_proc ?? "",
    })),
  };
}

const PAGE_SIZE_OPCIONES = [50, 100, 200, "TODAS"] as const;

export function MisCausas({
  email = "romina@abogado.cl",
  initialRol = null,
  initialProcurador = null,
  initialColor = null,
}: { email?: string; initialRol?: string | null; initialProcurador?: string | null; initialColor?: "VERDE" | "AMARILLO" | "ROJO" | null } = {}) {
  const [rows, setRows] = useState<CausaListadoItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [estadoAdmFiltro, setEstadoAdmFiltro] = useState("Todos");
  const [procedimientoFiltro, setProcedimientoFiltro] = useState("Todos");
  const [procuradorFiltro, setProcuradorFiltro] = useState(initialProcurador || "Todos");
  const [colorFiltro, setColorFiltro] = useState<"Todos" | "VERDE" | "AMARILLO" | "ROJO">(initialColor ?? "Todos");
  const [procuradorOpciones, setProcuradorOpciones] = useState<string[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [sortCol, setSortCol] = useState<ColKey | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [pageSize, setPageSize] = useState<number | "TODAS">(200);
  const [page, setPage] = useState(0);

  const [causaId, setCausaId] = useState<number | null>(null);
  const [detalle, setDetalle] = useState<CausaDetalle | null>(null);
  const [detalleLoading, setDetalleLoading] = useState(false);
  const [detalleError, setDetalleError] = useState<string | null>(null);

  function toggleSort(key: ColKey) {
    if (sortCol === key) {
      setSortDir(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortCol(key);
      setSortDir("asc");
    }
  }

  useEffect(() => {
    fetchProcuradores()
      .then(list => setProcuradorOpciones(list.map(p => p.nombre)))
      .catch(() => {});
  }, []);

  useEffect(() => { setPage(0); }, [estadoAdmFiltro, procedimientoFiltro, procuradorFiltro, colorFiltro, busqueda, pageSize]);

  // web_listado_causas no filtra por color de semáforo, así que cuando hay un
  // color seleccionado se usa /mi_cartera (mismo endpoint que las cards de Mi
  // Escritorio), mapeado a la forma de fila que ya usa esta tabla.
  function cargarPagina(numPagina: number, tamPagina: number): Promise<{ total: number; results: CausaListadoItem[] }> {
    if (colorFiltro === "Todos") {
      return fetchListadoCausas({
        rol: busqueda.trim() || null,
        procuradores: procuradorFiltro === "Todos" ? null : [procuradorFiltro],
        est_adm: estadoAdmFiltro === "Todos" ? null : [estadoAdmFiltro],
        proc: procedimientoFiltro === "Todos" ? null : [procedimientoFiltro],
        page: numPagina,
        page_size: tamPagina,
      });
    }
    return fetchMiCartera({
      colores: [colorFiltro],
      rol: busqueda.trim() || null,
      page: numPagina,
      page_size: tamPagina,
    }).then(res => ({
      total: res.total,
      results: res.causas.map(c => ({
        causa_id: c.causa_id ?? 0,
        semaforo: (c.color === "VERDE" || c.color === "AMARILLO" || c.color === "ROJO") ? c.color : null,
        estado_deudor: null,
        rol: c.rol,
        numero_pagare: c.numero_pagare,
        tribunal_nombre: c.tribunal,
        cliente_nombre: c.cliente,
        procurador_nombre: c.procurador_nombre ?? null,
        fecha_ingreso: c.fecha_ingreso ?? "",
        etapa: c.etapa ?? "",
      })),
    }));
  }

  useEffect(() => {
    let cancelado = false;
    setLoading(true);
    setError(null);

    async function cargarTodo() {
      if (pageSize !== "TODAS") {
        return cargarPagina(page + 1, pageSize);
      }
      // "Todas": pagina automáticamente en bloques de 200 hasta agotar el
      // total real, con un tope de seguridad.
      const TAM_BLOQUE = 200;
      const MAX_PAGINAS = 25;
      const results: CausaListadoItem[] = [];
      let total = 0;
      for (let i = 1; i <= MAX_PAGINAS; i++) {
        const res = await cargarPagina(i, TAM_BLOQUE);
        results.push(...res.results);
        total = res.total;
        if (res.results.length < TAM_BLOQUE) break;
      }
      return { results, total };
    }

    cargarTodo()
      .then(res => {
        if (cancelado) return;
        setRows(res.results);
        setTotal(res.total);
      })
      .catch(err => {
        if (cancelado) return;
        setError(err instanceof Error ? err.message : "No fue posible cargar las causas.");
        setRows([]);
        setTotal(0);
      })
      .finally(() => { if (!cancelado) setLoading(false); });
    return () => { cancelado = true; };
  }, [estadoAdmFiltro, procedimientoFiltro, procuradorFiltro, colorFiltro, busqueda, page, pageSize]);

  const filtradas = useMemo(() => {
    if (!sortCol) return rows;
    return [...rows].sort((a, b) => {
      const va = valorColumna(a, sortCol);
      const vb = valorColumna(b, sortCol);
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [rows, sortCol, sortDir]);

  async function abrirDetalle(id: number) {
    setCausaId(id);
    setDetalle(null);
    setDetalleError(null);
    setDetalleLoading(true);
    try {
      const causaWeb = await fetchCausaDetalle(id);
      setDetalle(mapCausaWebToDetalle(causaWeb));
    } catch (err) {
      setDetalleError(err instanceof Error ? err.message : "No fue posible cargar el detalle de la causa.");
    } finally {
      setDetalleLoading(false);
    }
  }

  async function abrirPorRol(rol: string) {
    setCausaId(-1);
    setDetalle(null);
    setDetalleError(null);
    setDetalleLoading(true);
    try {
      const res = await fetchListadoCausas({ rol, page: 1, page_size: 1 });
      const item = res.results[0];
      if (!item) throw new Error(`No se encontró la causa ${rol}.`);
      await abrirDetalle(item.causa_id);
    } catch (err) {
      setDetalleError(err instanceof Error ? err.message : "No fue posible cargar el detalle de la causa.");
      setDetalleLoading(false);
    }
  }

  useEffect(() => {
    if (initialRol) abrirPorRol(initialRol);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRol]);

  const totalPaginas = pageSize === "TODAS" ? 1 : Math.max(1, Math.ceil(total / pageSize));

  if (causaId !== null) {
    if (detalleLoading) {
      return (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin" /> Cargando detalle de la causa...</div>
        </div>
      );
    }
    if (detalleError) {
      return (
        <div className="flex-1 p-6 space-y-4">
          <button onClick={() => setCausaId(null)} className="px-4 py-2 rounded-lg border border-border text-xs font-medium hover:bg-gray-50 transition-colors text-foreground">Volver</button>
          <EmptyState title="No fue posible cargar la causa" desc={detalleError} />
        </div>
      );
    }
    if (detalle) {
      return <CausaDetalleView causa={detalle} onVolver={() => setCausaId(null)} onIrACausa={rol => abrirPorRol(rol)} />;
    }
  }

  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <ProcuradorHeader email={email} title="Causas" subtitle="Listado de Causas" />

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-gray-900">
          <div>
            <p className="text-white font-semibold text-sm">Filtros</p>
            <p className="text-gray-400 text-[11px] mt-0.5">Criterios operativos</p>
          </div>
          <button
            onClick={() => { setEstadoAdmFiltro("Todos"); setProcedimientoFiltro("Todos"); setProcuradorFiltro("Todos"); setColorFiltro("Todos"); setBusqueda(""); }}
            className="px-4 py-2 rounded-lg bg-gray-800 text-white text-xs font-medium hover:bg-gray-700 transition-colors"
          >
            Limpiar filtros
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-5">
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Semáforo</p>
            <select value={colorFiltro} onChange={e => setColorFiltro(e.target.value as typeof colorFiltro)} className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-card focus:outline-none text-foreground">
              <option value="Todos">Todos</option>
              <option value="VERDE">Verde</option>
              <option value="AMARILLO">Amarillo</option>
              <option value="ROJO">Rojo</option>
            </select>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Estado Adm.</p>
            <select value={estadoAdmFiltro} onChange={e => setEstadoAdmFiltro(e.target.value)} className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-card focus:outline-none text-foreground">
              <option>Todos</option>
              <option>Sin archivar</option>
              <option>Archivada</option>
            </select>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Procedimiento</p>
            <select value={procedimientoFiltro} onChange={e => setProcedimientoFiltro(e.target.value)} className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-card focus:outline-none text-foreground">
              <option>Todos</option>
              {PROCEDIMIENTOS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Procurador</p>
            <select value={procuradorFiltro} onChange={e => setProcuradorFiltro(e.target.value)} className="w-full text-xs border border-border rounded-lg px-3 py-2 bg-card focus:outline-none text-foreground">
              <option>Todos</option>
              {procuradorOpciones.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-1.5">Buscar por Rol</p>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)} placeholder="Rol u OP..." className="w-full pl-9 pr-3 py-2 text-xs bg-card border border-border rounded-lg focus:outline-none text-foreground placeholder:text-muted-foreground" />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-[11px] text-muted-foreground font-mono">{total} causas</p>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-muted-foreground mr-1">Mostrar:</span>
          {PAGE_SIZE_OPCIONES.map(opcion => (
            <button
              key={opcion}
              onClick={() => setPageSize(opcion)}
              className={`text-[11px] font-medium rounded-lg px-2.5 py-1 border transition-colors ${
                pageSize === opcion ? "bg-accent text-white border-accent" : "border-border text-foreground hover:bg-gray-50"
              }`}
            >
              {opcion === "TODAS" ? "Todas" : opcion}
            </button>
          ))}
        </div>
      </div>

      {error && <EmptyState title="No fue posible cargar las causas" desc={error} />}

      {!error && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-gray-900">
                {COLUMNAS.map(col => (
                  <th
                    key={col.key}
                    onClick={() => toggleSort(col.key)}
                    className="text-left px-4 py-3.5 text-white font-medium text-[12px] uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      <ChevronDown className={`w-3 h-3 transition-all ${sortCol === col.key ? "opacity-100" : "opacity-30"} ${sortCol === col.key && sortDir === "desc" ? "rotate-180" : ""}`} />
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr><td colSpan={8} className="px-4 py-8 text-center text-[12px] text-muted-foreground"><Loader2 className="w-4 h-4 animate-spin inline mr-2" />{pageSize === "TODAS" ? "Cargando toda la cartera, puede tardar unos segundos..." : "Cargando causas..."}</td></tr>
              )}
              {!loading && filtradas.map(c => (
                <tr key={c.causa_id} onClick={() => abrirDetalle(c.causa_id)} className="border-b border-border last:border-0 cursor-pointer hover:bg-gray-50/70 transition-colors">
                  <td className="px-4 py-3.5 font-mono text-[12px] font-semibold text-foreground">{c.rol}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground">{c.numero_pagare ?? "-"}</td>
                  <td className="px-4 py-3.5 text-[12px] text-foreground">{c.tribunal_nombre}</td>
                  <td className="px-4 py-3.5 text-[12px] text-foreground">{c.cliente_nombre ?? "-"}</td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground">{c.procurador_nombre ?? "-"}</td>
                  <td className="px-4 py-3.5 font-mono text-[11px] text-muted-foreground whitespace-nowrap">{c.fecha_ingreso}</td>
                  <td className="px-4 py-3.5 text-[12px] text-muted-foreground">{c.etapa}</td>
                  <td className="px-4 py-3.5 whitespace-nowrap"><SemaforoBadge semaforo={c.semaforo} /></td>
                </tr>
              ))}
              {!loading && filtradas.length === 0 && (
                <tr><td colSpan={8}><EmptyState title="Sin resultados" desc="Ninguna causa coincide con los filtros aplicados." /></td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">Página {page + 1} de {totalPaginas}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="text-[11px] font-medium rounded-lg px-3 py-1.5 border border-border text-foreground hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPaginas - 1, p + 1))}
              disabled={page >= totalPaginas - 1}
              className="text-[11px] font-medium rounded-lg px-3 py-1.5 border border-border text-foreground hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MisDocumentos ──────────────────────────────────────────────────────────

export function MisDocumentos({ email = "romina@abogado.cl" }: { email?: string } = {}) {
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

export function MisMetricas({ email = "romina@abogado.cl" }: { email?: string } = {}) {
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

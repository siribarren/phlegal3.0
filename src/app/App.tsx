import React, { useState } from "react";
import {
  LayoutDashboard, Briefcase, Scale, FileText, Receipt, BarChart2,
  Bell, Search, AlertCircle, Filter, MoreHorizontal, Settings,
  Phone, TrendingUp, Target, Gavel, X, Download, PlusCircle,
  RefreshCw, User, LogOut, DollarSign, MessageSquare, Eye,
  ChevronRight, Activity, Shield, BookOpen, Building2, Users, Brain
} from "lucide-react";
import Login, { PROFILES, type LoginUser, type ProfileId } from "./Login";
import MandanteView, { InteligenciaCarteraView, abrirReporteEjecutivo } from "./MandanteView";
import { MiEscritorio, MisCausas, MisDocumentos, MisMetricas } from "./ProcuradorView";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type SemColor = "green" | "yellow" | "orange" | "red" | "gray" | "blue" | "purple";
type Priority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type SLAStatus = "OK" | "AT_RISK" | "EXCEEDED";

interface Task {
  id: string;
  caseRol: string;
  debtorName: string;
  title: string;
  type: string;
  priority: Priority;
  urgencyScore: number;
  dueAt: string;
  status: "PENDING" | "IN_PROGRESS" | "BLOCKED" | "OVERDUE";
  assignedTo: string;
  semaphore: SemColor;
  mandante: string;
}

interface JCase {
  id: string;
  rol: string;
  debtorRut: string;
  debtorName: string;
  portfolio: string;
  procedureType: string;
  claimAmount: number;
  currentStage: string;
  currentStatus: string;
  slaStatus: SLAStatus;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  leadLawyer: string;
  attorney: string;
  semaphore: SemColor;
  mandante: string;
  filingDate: string;
  recoveryAmount: number;
  expenseAmount: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const TASKS: Task[] = [
  { id: "t1", caseRol: "C-8421-2026", debtorName: "Carlos González Pérez", title: "Coordinar notificación con receptor judicial", type: "CONTACT_RECEIVER", priority: "HIGH", urgencyScore: 87, dueAt: "Hoy 16:00", status: "PENDING", assignedTo: "M. Soto", semaphore: "red", mandante: "BFN" },
  { id: "t2", caseRol: "C-7199-2026", debtorName: "Roberto Martínez Silva", title: "Revisar y responder resolución de embargo", type: "COURT_RESOLUTION", priority: "CRITICAL", urgencyScore: 94, dueAt: "Hoy 18:00", status: "IN_PROGRESS", assignedTo: "A. Fuentes", semaphore: "red", mandante: "BFN" },
  { id: "t3", caseRol: "C-6812-2026", debtorName: "Inversiones Torres SpA", title: "Generar demanda ejecutiva pagaré", type: "DOCUMENT_GENERATION", priority: "HIGH", urgencyScore: 78, dueAt: "Mañana 12:00", status: "PENDING", assignedTo: "V. Lagos", semaphore: "orange", mandante: "ITAU" },
  { id: "t4", caseRol: "C-5541-2026", debtorName: "María Isabel Rojas Vega", title: "Verificar transferencia comprometida", type: "PAYMENT_VERIFICATION", priority: "HIGH", urgencyScore: 72, dueAt: "Mañana 17:00", status: "PENDING", assignedTo: "M. Soto", semaphore: "orange", mandante: "SANTANDER" },
  { id: "t5", caseRol: "C-4820-2026", debtorName: "Pedro Andrés Muñoz Riquelme", title: "Preparar antecedentes para audiencia de liquidación", type: "HEARING_PREP", priority: "MEDIUM", urgencyScore: 58, dueAt: "Vie 10:00", status: "IN_PROGRESS", assignedTo: "A. Fuentes", semaphore: "yellow", mandante: "BCI" },
  { id: "t6", caseRol: "C-3914-2026", debtorName: "Comercial Andina Ltda.", title: "Aprobar gastos receptor Zona Norte", type: "EXPENSE_APPROVAL", priority: "MEDIUM", urgencyScore: 45, dueAt: "Vie 16:00", status: "PENDING", assignedTo: "V. Lagos", semaphore: "yellow", mandante: "CHILE" },
  { id: "t7", caseRol: "C-3211-2026", debtorName: "Alejandro Vásquez Moreno", title: "Búsqueda de domicilio actualizado en RNVM", type: "ADDRESS_SEARCH", priority: "LOW", urgencyScore: 32, dueAt: "Lun 09:00", status: "BLOCKED", assignedTo: "M. Soto", semaphore: "blue", mandante: "ITAU" },
  { id: "t8", caseRol: "C-2891-2025", debtorName: "Soc. Constructora Sur S.A.", title: "Revisar tasación de inmueble embargado", type: "DOCUMENT_REVIEW", priority: "MEDIUM", urgencyScore: 61, dueAt: "Mar 14:00", status: "PENDING", assignedTo: "A. Fuentes", semaphore: "yellow", mandante: "BFN" },
];

const CASES: JCase[] = [
  { id: "c1", rol: "C-8421-2026", debtorRut: "12.345.678-9", debtorName: "Carlos González Pérez", portfolio: "Automotriz Jul 2026", procedureType: "Ejecutivo · Prenda", claimAmount: 21540000, currentStage: "NOTIFICATION", currentStatus: "Búsqueda domicilio", slaStatus: "AT_RISK", riskLevel: "HIGH", leadLawyer: "F. Morales", attorney: "M. Soto", semaphore: "red", mandante: "BFN", filingDate: "04/07/2026", recoveryAmount: 0, expenseAmount: 186000 },
  { id: "c2", rol: "C-7199-2026", debtorRut: "8.912.311-K", debtorName: "Roberto Martínez Silva", portfolio: "Hipotecario Ago 2025", procedureType: "Ejecutivo · Hipotecario", claimAmount: 89200000, currentStage: "ATTACHMENT", currentStatus: "Embargo pendiente", slaStatus: "AT_RISK", riskLevel: "HIGH", leadLawyer: "F. Morales", attorney: "A. Fuentes", semaphore: "red", mandante: "BFN", filingDate: "18/03/2026", recoveryAmount: 0, expenseAmount: 892000 },
  { id: "c3", rol: "C-6812-2026", debtorRut: "76.441.229-3", debtorName: "Inversiones Torres SpA", portfolio: "Empresa Mar 2026", procedureType: "Ejecutivo · Pagaré", claimAmount: 45800000, currentStage: "FILING_PREPARATION", currentStatus: "Demanda en preparación", slaStatus: "OK", riskLevel: "MEDIUM", leadLawyer: "C. Araya", attorney: "V. Lagos", semaphore: "yellow", mandante: "ITAU", filingDate: "—", recoveryAmount: 0, expenseAmount: 0 },
  { id: "c4", rol: "C-5541-2026", debtorRut: "14.221.009-1", debtorName: "María Isabel Rojas Vega", portfolio: "Consumo Feb 2026", procedureType: "Ejecutivo · Pagaré", claimAmount: 8750000, currentStage: "RECOVERY", currentStatus: "Convenio de pago", slaStatus: "OK", riskLevel: "LOW", leadLawyer: "C. Araya", attorney: "M. Soto", semaphore: "green", mandante: "SANTANDER", filingDate: "12/02/2026", recoveryAmount: 4200000, expenseAmount: 124000 },
  { id: "c5", rol: "C-4820-2026", debtorRut: "11.891.005-8", debtorName: "Pedro Muñoz Riquelme", portfolio: "Automotriz Ene 2026", procedureType: "Ejecutivo · Prenda", claimAmount: 18200000, currentStage: "LIQUIDATION", currentStatus: "Liquidación", slaStatus: "OK", riskLevel: "MEDIUM", leadLawyer: "F. Morales", attorney: "A. Fuentes", semaphore: "yellow", mandante: "BCI", filingDate: "09/01/2026", recoveryAmount: 0, expenseAmount: 445000 },
  { id: "c6", rol: "C-3914-2026", debtorRut: "77.112.443-0", debtorName: "Comercial Andina Ltda.", portfolio: "Empresa Nov 2025", procedureType: "Ejecutivo · Pagaré", claimAmount: 32100000, currentStage: "AUCTION_PREPARATION", currentStatus: "Preparación remate", slaStatus: "EXCEEDED", riskLevel: "CRITICAL", leadLawyer: "F. Morales", attorney: "V. Lagos", semaphore: "red", mandante: "CHILE", filingDate: "22/10/2025", recoveryAmount: 0, expenseAmount: 1240000 },
  { id: "c7", rol: "C-3211-2026", debtorRut: "13.440.882-7", debtorName: "Alejandro Vásquez Moreno", portfolio: "Consumo Sep 2025", procedureType: "Ejecutivo · Pagaré", claimAmount: 6200000, currentStage: "NOTIFICATION", currentStatus: "Notificación pendiente", slaStatus: "AT_RISK", riskLevel: "MEDIUM", leadLawyer: "C. Araya", attorney: "M. Soto", semaphore: "orange", mandante: "ITAU", filingDate: "05/09/2025", recoveryAmount: 0, expenseAmount: 78000 },
  { id: "c8", rol: "C-2891-2025", debtorRut: "99.441.221-5", debtorName: "Soc. Constructora Sur S.A.", portfolio: "Hipotecario Jul 2025", procedureType: "Ejecutivo · Hipotecario", claimAmount: 156000000, currentStage: "AUCTION", currentStatus: "Remate programado", slaStatus: "OK", riskLevel: "HIGH", leadLawyer: "F. Morales", attorney: "A. Fuentes", semaphore: "blue", mandante: "BFN", filingDate: "14/06/2025", recoveryAmount: 0, expenseAmount: 3890000 },
];

const RECOVERY_TREND = [
  { month: "Feb", real: 420, meta: 500 },
  { month: "Mar", real: 582, meta: 500 },
  { month: "Abr", real: 510, meta: 520 },
  { month: "May", real: 694, meta: 530 },
  { month: "Jun", real: 821, meta: 550 },
  { month: "Jul", real: 892, meta: 560 },
];

const CASES_BY_STAGE = [
  { stage: "Notificación", count: 287, color: "#3B82F6" },
  { stage: "Embargo", count: 194, color: "#7C3AED" },
  { stage: "Prep. demanda", count: 168, color: "#0EA5E9" },
  { stage: "Liquidación", count: 142, color: "#F59E0B" },
  { stage: "Remate", count: 89, color: "#EF4444" },
  { stage: "Recupero", count: 211, color: "#10B981" },
  { stage: "Otros", count: 156, color: "#6B7280" },
];

const SLA_PIE = [
  { name: "En SLA", value: 84, color: "#16A34A" },
  { name: "En riesgo", value: 11, color: "#D97706" },
  { name: "Superado", value: 5, color: "#DC2626" },
];

const INTERACTIONS = [
  { id: "i1", caseRol: "C-5541-2026", debtorName: "María Rojas Vega", channel: "PHONE", outcome: "PAYMENT_COMMITMENT", amount: 4200000, date: "Hoy 11:22", executive: "J. Contreras", mandante: "SANTANDER" },
  { id: "i2", caseRol: "C-4820-2026", debtorName: "Pedro Muñoz Riquelme", channel: "WHATSAPP", outcome: "CONTACT_OK", amount: null, date: "Ayer 15:40", executive: "P. Herrera", mandante: "BCI" },
  { id: "i3", caseRol: "C-3211-2026", debtorName: "Alejandro Vásquez Moreno", channel: "PHONE", outcome: "NO_CONTACT", amount: null, date: "Ayer 10:15", executive: "J. Contreras", mandante: "ITAU" },
  { id: "i4", caseRol: "C-6812-2026", debtorName: "Inversiones Torres SpA", channel: "EMAIL", outcome: "CONTACT_OK", amount: null, date: "10/07 09:30", executive: "P. Herrera", mandante: "ITAU" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fCLP(n: number) { return "$" + (n / 1_000_000).toFixed(1) + "M"; }
function fCLPFull(n: number) { return "$" + n.toLocaleString("es-CL"); }

function Sem({ color, size = "md" }: { color: SemColor; size?: "sm" | "md" }) {
  const cmap: Record<SemColor, string> = {
    green: "bg-emerald-500", yellow: "bg-amber-400", orange: "bg-orange-500",
    red: "bg-red-500", gray: "bg-gray-400", blue: "bg-blue-500", purple: "bg-violet-500",
  };
  const sz = size === "sm" ? "w-2 h-2" : "w-2.5 h-2.5";
  return <span className={`inline-block rounded-full shrink-0 ${sz} ${cmap[color]}`} />;
}

function UBadge({ score }: { score: number }) {
  const cls =
    score >= 85 ? "bg-red-50 text-red-700 border-red-200" :
    score >= 65 ? "bg-orange-50 text-orange-700 border-orange-200" :
    score >= 40 ? "bg-amber-50 text-amber-700 border-amber-200" :
    "bg-emerald-50 text-emerald-700 border-emerald-200";
  return <span className={`font-mono text-[12px] font-medium px-1.5 py-0.5 rounded border ${cls}`}>{score}</span>;
}

function PBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    CRITICAL: "bg-red-500 text-white", HIGH: "bg-orange-500 text-white",
    MEDIUM: "bg-amber-400 text-white", LOW: "bg-gray-400 text-white",
  };
  const labels: Record<Priority, string> = { CRITICAL: "Crítica", HIGH: "Alta", MEDIUM: "Media", LOW: "Baja" };
  return <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded ${map[p]}`}>{labels[p]}</span>;
}

function SLATag({ s }: { s: SLAStatus }) {
  if (s === "OK") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />OK
    </span>
  );
  if (s === "AT_RISK") return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-amber-50 text-amber-700 border border-amber-200">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />En riesgo
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] bg-red-50 text-red-700 border border-red-200">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />Superado
    </span>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "micartera", label: "Mi Cartera", icon: Briefcase, badge: 12 },
  { id: "causas", label: "Causas", icon: Scale },
  { id: "cobranza", label: "Cobranza", icon: Phone },
  { id: "documentos", label: "Documentos", icon: FileText },
  { id: "gastos", label: "Gastos", icon: Receipt },
  { id: "reportes", label: "Reportes", icon: BarChart2 },
  { id: "inteligencia-cartera", label: "Inteligencia de Cartera", icon: Brain },
];

const NAV2 = [
  { id: "consultas", label: "Consultas", icon: MessageSquare, badge: 3 },
  { id: "admin", label: "Administración", icon: Settings },
];

const NAV_ABOGADO = [
  { id: "miescritorio", label: "Mi Escritorio", icon: LayoutDashboard, badge: 13 },
  { id: "miscausas", label: "Mis Causas", icon: Scale },
  { id: "misdocumentos", label: "Mis Documentos", icon: FileText },
  { id: "mismetricas", label: "Mis Métricas", icon: BarChart2 },
];

const HIDDEN_FOR_MANDANTE = new Set(["micartera", "causas", "cobranza", "documentos"]);

function Sidebar({ active, onNav, user, onLogout }: { active: string; onNav: (id: string) => void; user: LoginUser; onLogout: () => void }) {
  const profile = PROFILES.find(p => p.id === user.profile)!;
  const initials = user.email.slice(0, 2).toUpperCase();
  const isAbogado = user.profile === "abogado";
  const nav = isAbogado ? NAV_ABOGADO : user.profile === "mandante" ? NAV.filter(n => !HIDDEN_FOR_MANDANTE.has(n.id)) : NAV;

  return (
    <aside className="w-[220px] shrink-0 flex flex-col h-full" style={{ backgroundColor: "#0B1929" }}>
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: "#1755D4" }}>
            <Gavel className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-semibold tracking-tight">PHLegal 3.0</p>
            <p className="text-[11px] font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.3)" }}>CRM JUDICIAL</p>
          </div>
        </div>
      </div>

      {/* Profile */}
      <div className="px-4 py-3.5" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold" style={{ backgroundColor: "rgba(23,85,212,0.25)", color: "#7BADF8", border: "1px solid rgba(23,85,212,0.35)" }}>
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.88)" }}>{user.email}</p>
            <p className="text-[11px] truncate" style={{ color: "rgba(255,255,255,0.38)" }}>{profile.label}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-0.5">
        {nav.map(({ id, label, icon: Icon, badge }) => {
          const on = active === id;
          return (
            <button
              key={id}
              onClick={() => onNav(id)}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors"
              style={{
                backgroundColor: on ? "#1755D4" : "transparent",
                color: on ? "#fff" : "rgba(255,255,255,0.5)",
              }}
              onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.88)"; }}
              onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="text-xs font-medium flex-1">{label}</span>
              {badge != null && (
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full" style={{ backgroundColor: on ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)", color: on ? "#fff" : "rgba(255,255,255,0.55)" }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}

        {!isAbogado && (
        <div className="pt-3 mt-3 space-y-0.5" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {NAV2.map(({ id, label, icon: Icon, badge }) => {
            const on = active === id;
            return (
              <button
                key={id}
                onClick={() => onNav(id)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors"
                style={{
                  backgroundColor: on ? "#1755D4" : "transparent",
                  color: on ? "#fff" : "rgba(255,255,255,0.5)",
                }}
                onMouseEnter={e => { if (!on) (e.currentTarget as HTMLElement).style.backgroundColor = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.88)"; }}
                onMouseLeave={e => { if (!on) (e.currentTarget as HTMLElement).style.backgroundColor = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium flex-1">{label}</span>
                {badge != null && (
                  <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.55)" }}>
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        )}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.2)" }}>CRM Judicial v3.0.0</p>
            <p className="text-[10px] font-mono" style={{ color: "rgba(255,255,255,0.15)" }}>10 julio 2026</p>
          </div>
          <button onClick={onLogout} className="transition-colors hover:opacity-80" style={{ color: "rgba(255,255,255,0.25)" }}>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── TopBar ───────────────────────────────────────────────────────────────────

function TopBar({ title, sub, user }: { title: string; sub?: string; user: LoginUser }) {
  const initials = user.email.slice(0, 2).toUpperCase();
  return (
    <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="text-sm font-semibold text-foreground leading-none">{title}</h1>
        {sub && <p className="text-[12px] text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Buscar ROL, RUT, nombre..."
            className="pl-8 pr-3 py-1.5 text-xs bg-muted/60 border border-border rounded-lg w-52 focus:outline-none focus:ring-1 focus:ring-accent/30 placeholder:text-muted-foreground"
          />
        </div>
        <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />
        </button>
        <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors">
          <RefreshCw className="w-4 h-4" />
        </button>
        {user.profile === "mandante" && (
          <button
            onClick={abrirReporteEjecutivo}
            title="Reporte ejecutivo (PDF)"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/60 rounded-lg transition-colors"
          >
            <FileText className="w-4 h-4" />
          </button>
        )}
        <div className="w-px h-5 bg-border mx-1" />
        <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-muted/60 cursor-pointer transition-colors">
          <div className="w-6 h-6 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-[10px] font-semibold text-accent">{initials}</div>
          <span className="text-xs text-foreground font-medium hidden sm:block">{user.email}</span>
        </div>
      </div>
    </header>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Causas activas", value: "1,247", delta: "+38 vs. mes ant.", pos: true, icon: Scale, bg: "bg-accent/10", ic: "text-accent" },
          { label: "Recupero julio", value: "$892M", delta: "Meta $560M · 159%", pos: true, icon: TrendingUp, bg: "bg-emerald-50", ic: "text-emerald-600" },
          { label: "Tareas críticas", value: "34", delta: "12 vencidas hoy", pos: false, icon: AlertCircle, bg: "bg-red-50", ic: "text-red-600" },
          { label: "Cumplimiento SLA", value: "84.3%", delta: "67 causas en riesgo", pos: false, icon: Target, bg: "bg-amber-50", ic: "text-amber-600" },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[12px] text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
                  <p className="text-[29px] font-semibold text-foreground mt-1 leading-none tracking-tight">{kpi.value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`w-4 h-4 ${kpi.ic}`} />
                </div>
              </div>
              <p className={`text-[12px] mt-2.5 font-mono ${kpi.pos ? "text-emerald-600" : "text-red-500"}`}>{kpi.delta}</p>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Trend */}
        <div className="col-span-2 bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-foreground">Recupero mensual</h3>
              <p className="text-[12px] text-muted-foreground mt-0.5">Millones CLP — últimos 6 meses</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><span className="w-3 h-0.5 rounded bg-accent inline-block" />Real</span>
              <span className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><span className="w-3 h-0.5 rounded bg-gray-300 inline-block" />Meta</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={RECOVERY_TREND} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id="rg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1755D4" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#1755D4" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }} formatter={(v: number) => [`$${v}M`, ""]} />
              <Area type="monotone" dataKey="real" stroke="#1755D4" strokeWidth={2.5} fill="url(#rg)" dot={{ r: 3.5, fill: "#1755D4", strokeWidth: 0 }} />
              <Area type="monotone" dataKey="meta" stroke="#CBD5E1" strokeWidth={1.5} strokeDasharray="4 4" fill="none" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* SLA donut */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-0.5">SLA Cumplimiento</h3>
          <p className="text-[12px] text-muted-foreground mb-3">1,247 causas activas</p>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie data={SLA_PIE} cx="50%" cy="50%" innerRadius={42} outerRadius={60} paddingAngle={2} dataKey="value">
                {SLA_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {SLA_PIE.map(d => (
              <div key={d.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: d.color }} />
                  <span className="text-[12px] text-muted-foreground">{d.name}</span>
                </div>
                <span className="text-[12px] font-mono font-semibold text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-3 gap-4">
        {/* Stage bars */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground mb-4">Causas por etapa</h3>
          <div className="space-y-3">
            {CASES_BY_STAGE.map(s => {
              const total = CASES_BY_STAGE.reduce((a, b) => a + b.count, 0);
              const pct = Math.round(s.count / total * 100);
              return (
                <div key={s.stage}>
                  <div className="flex justify-between mb-1">
                    <span className="text-[12px] text-muted-foreground">{s.stage}</span>
                    <span className="text-[12px] font-mono font-semibold text-foreground">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Alerts */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Alertas activas</h3>
            <span className="text-[11px] font-mono bg-red-50 text-red-600 px-2 py-0.5 rounded-full border border-red-200">7 críticas</span>
          </div>
          <div className="space-y-3">
            {[
              { t: "SLA", msg: "C-3914-2026 SLA superado en etapa Remate", ago: "hace 2h", c: "text-red-500" },
              { t: "TAREA", msg: "2 tareas críticas vencidas sin respuesta", ago: "hace 4h", c: "text-red-500" },
              { t: "PAGO", msg: "Pago pendiente de validación $5.2M", ago: "hace 5h", c: "text-amber-500" },
              { t: "PJUD", msg: "Error scraping Tribunal 18° Santiago", ago: "hace 6h", c: "text-orange-500" },
              { t: "DOC", msg: "Demanda C-6812-2026 requiere aprobación", ago: "hace 8h", c: "text-blue-500" },
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <AlertCircle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${a.c}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug">{a.msg}</p>
                  <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{a.ago}</p>
                </div>
                <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded shrink-0">{a.t}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top tasks */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Máxima prioridad</h3>
            <button className="text-xs text-accent hover:text-accent/70 font-medium transition-colors">Ver todas</button>
          </div>
          <div className="space-y-3.5">
            {TASKS.filter(t => t.urgencyScore >= 70).slice(0, 5).map(task => (
              <div key={task.id} className="flex items-start gap-2.5">
                <Sem color={task.semaphore} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground leading-snug truncate">{task.title}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="text-[11px] font-mono text-muted-foreground">{task.caseRol}</span>
                    <span className="text-[11px] text-muted-foreground">·</span>
                    <span className="text-[11px] text-muted-foreground">{task.dueAt}</span>
                  </div>
                </div>
                <UBadge score={task.urgencyScore} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Mi Cartera ───────────────────────────────────────────────────────────────

function MiCartera() {
  const [sel, setSel] = useState<Task | null>(null);
  const [mand, setMand] = useState("all");
  const [prio, setPrio] = useState("all");

  const filtered = TASKS.filter(t => {
    if (mand !== "all" && t.mandante !== mand) return false;
    if (prio === "high" && t.urgencyScore < 65) return false;
    if (prio === "critical" && t.urgencyScore < 85) return false;
    return true;
  });

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className="flex-1 overflow-auto p-6">
        {/* Filters */}
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex items-center gap-1.5 bg-card border border-border rounded-lg px-3 py-1.5">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Filtrar</span>
          </div>
          <select value={mand} onChange={e => setMand(e.target.value)} className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option value="all">Todos los mandantes</option>
            {["BFN","ITAU","SANTANDER","BCI","CHILE"].map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={prio} onChange={e => setPrio(e.target.value)} className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option value="all">Todas las prioridades</option>
            <option value="high">Urgencia alta (≥65)</option>
            <option value="critical">Urgencia crítica (≥85)</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{filtered.length} tareas</span>
            <button className="flex items-center gap-1.5 text-xs text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent/85 transition-colors">
              <PlusCircle className="w-3.5 h-3.5" />Nueva tarea
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-gray-50/60">
                {["", "Tarea", "ROL · Deudor", "Prioridad", "Urgencia", "Vence", "Asignado", "Mandante", ""].map((h, i) => (
                  <th key={i} className="text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => (
                <tr
                  key={task.id}
                  onClick={() => setSel(sel?.id === task.id ? null : task)}
                  className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-gray-50/70"
                  style={{ backgroundColor: sel?.id === task.id ? "rgba(23,85,212,0.04)" : undefined }}
                >
                  <td className="px-4 py-3"><Sem color={task.semaphore} /></td>
                  <td className="px-4 py-3 max-w-[220px]">
                    <p className="text-foreground font-medium leading-snug truncate">{task.title}</p>
                    <p className="text-[11px] font-mono text-muted-foreground mt-0.5">{task.type}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px] text-foreground font-semibold">{task.caseRol}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{task.debtorName}</p>
                  </td>
                  <td className="px-4 py-3"><PBadge p={task.priority} /></td>
                  <td className="px-4 py-3"><UBadge score={task.urgencyScore} /></td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-[12px] ${task.dueAt.startsWith("Hoy") ? "text-red-600 font-semibold" : "text-foreground"}`}>{task.dueAt}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{task.assignedTo}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{task.mandante}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-muted-foreground hover:text-foreground transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail panel */}
      {sel && (
        <div className="w-80 shrink-0 border-l border-border bg-card overflow-auto">
          <div className="p-4 border-b border-border flex items-start justify-between">
            <div className="flex-1 mr-3">
              <p className="text-sm font-semibold text-foreground leading-snug">{sel.title}</p>
              <p className="text-[12px] font-mono text-muted-foreground mt-1">{sel.caseRol} · {sel.mandante}</p>
            </div>
            <button onClick={() => setSel(null)} className="text-muted-foreground hover:text-foreground transition-colors mt-0.5">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[11px] text-muted-foreground">Urgencia</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${sel.urgencyScore}%`, backgroundColor: sel.urgencyScore >= 85 ? "#DC2626" : sel.urgencyScore >= 65 ? "#EA580C" : sel.urgencyScore >= 40 ? "#D97706" : "#16A34A" }} />
                  </div>
                  <UBadge score={sel.urgencyScore} />
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[11px] text-muted-foreground">Prioridad</p>
                <div className="mt-1.5"><PBadge p={sel.priority} /></div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[11px] text-muted-foreground">Vencimiento</p>
                <p className={`text-xs font-mono font-semibold mt-0.5 ${sel.dueAt.startsWith("Hoy") ? "text-red-600" : "text-foreground"}`}>{sel.dueAt}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-2.5">
                <p className="text-[11px] text-muted-foreground">Asignado</p>
                <p className="text-xs font-medium text-foreground mt-0.5">{sel.assignedTo}</p>
              </div>
            </div>

            <div className="pt-1 border-t border-border">
              <p className="text-xs font-semibold text-foreground mb-3">Desglose de urgencia</p>
              <div className="space-y-2">
                {[
                  { label: "Vencimiento", w: 35 }, { label: "Riesgo procesal", w: 20 },
                  { label: "SLA mandante", w: 15 }, { label: "Instrucción jefatura", w: 10 },
                  { label: "Cuantía", w: 10 }, { label: "Impacto recupero", w: 5 }, { label: "Dependencia", w: 5 },
                ].map(c => (
                  <div key={c.label} className="flex items-center gap-2">
                    <span className="text-[11px] text-muted-foreground w-36 shrink-0">{c.label}</span>
                    <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full" style={{ width: `${c.w * 3}%` }} />
                    </div>
                    <span className="text-[11px] font-mono text-muted-foreground w-5 text-right">{c.w}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-1 space-y-2">
              <button className="w-full py-2.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/85 transition-colors">
                Registrar gestión
              </button>
              <button className="w-full py-2.5 bg-gray-100 text-foreground rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors">
                Ver causa completa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Causas ───────────────────────────────────────────────────────────────────

function Causas() {
  const [sel, setSel] = useState<JCase | null>(null);
  const [tab, setTab] = useState<"timeline" | "tasks" | "docs" | "recovery">("timeline");

  const TL = [
    { date: "10/07/2026", type: "RESOLUCION", title: "Tribunal tuvo por acompañados documentos", actor: "PJUD", key: true },
    { date: "09/07/2026", type: "GASTO", title: "Gasto receptor registrado: $85.000", actor: "M. Soto", key: false },
    { date: "08/07/2026", type: "TAREA", title: "Tarea creada: coordinar notificación con receptor", actor: "Sistema", key: false },
    { date: "04/07/2026", type: "DEMANDA", title: "Demanda ejecutiva presentada en PJUD (ROL asignado)", actor: "V. Lagos", key: true },
    { date: "03/07/2026", type: "DOC", title: "Demanda ejecutiva firmada digitalmente (v4)", actor: "F. Morales", key: false },
    { date: "02/07/2026", type: "DOC", title: "Demanda ejecutiva aprobada por abogado jefe", actor: "F. Morales", key: true },
    { date: "01/07/2026", type: "ASIG", title: "Causa asignada al equipo BFN", actor: "Sistema", key: false },
  ];

  return (
    <div className="flex-1 flex overflow-hidden">
      <div className={`${sel ? "w-[calc(100%-400px)]" : "w-full"} overflow-auto p-6`}>
        {/* Toolbar */}
        <div className="flex items-center gap-2.5 mb-4">
          <select className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option>Todos los mandantes</option>
            <option>BFN</option><option>ITAU</option><option>SANTANDER</option>
          </select>
          <select className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option>Todas las etapas</option>
            <option>Notificación</option><option>Embargo</option><option>Remate</option>
          </select>
          <select className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option>Todos los SLA</option>
            <option>En riesgo</option><option>Superado</option>
          </select>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs font-mono text-muted-foreground">{CASES.length} de 1,247</span>
            <button className="flex items-center gap-1.5 text-xs text-muted-foreground border border-border bg-card px-3 py-1.5 rounded-lg hover:bg-muted/50 transition-colors">
              <Download className="w-3.5 h-3.5" />Exportar
            </button>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border bg-gray-50/60">
                {["", "ROL · RUT", "Deudor", "Tipo", "Cuantía", "Etapa · Estado", "SLA", "Abogado", "Mandante"].map((h, i) => (
                  <th key={i} className={`text-left px-4 py-3 text-muted-foreground font-medium text-[12px] uppercase tracking-wide ${i === 0 ? "w-6" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CASES.map(c => (
                <tr
                  key={c.id}
                  onClick={() => setSel(sel?.id === c.id ? null : c)}
                  className="border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-gray-50/70"
                  style={{ backgroundColor: sel?.id === c.id ? "rgba(23,85,212,0.04)" : undefined }}
                >
                  <td className="px-4 py-3"><Sem color={c.semaphore} /></td>
                  <td className="px-4 py-3">
                    <p className="font-mono text-[12px] font-bold text-foreground">{c.rol}</p>
                    <p className="font-mono text-[11px] text-muted-foreground mt-0.5">{c.debtorRut}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[140px]">
                    <p className="text-foreground truncate">{c.debtorName}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{c.portfolio}</p>
                  </td>
                  <td className="px-4 py-3 max-w-[120px] text-muted-foreground truncate">{c.procedureType}</td>
                  <td className="px-4 py-3 font-mono text-[12px] font-semibold text-foreground">{fCLP(c.claimAmount)}</td>
                  <td className="px-4 py-3">
                    <p className="text-foreground">{c.currentStatus}</p>
                    <p className="text-[11px] font-mono text-muted-foreground">{c.currentStage}</p>
                  </td>
                  <td className="px-4 py-3"><SLATag s={c.slaStatus} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{c.leadLawyer}</td>
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{c.mandante}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case panel */}
      {sel && (
        <div className="w-[400px] shrink-0 border-l border-border bg-card overflow-auto flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border shrink-0">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <Sem color={sel.semaphore} />
                  <span className="font-mono text-base font-bold text-foreground">{sel.rol}</span>
                  <SLATag s={sel.slaStatus} />
                </div>
                <p className="text-xs text-muted-foreground mt-1">{sel.debtorName} · {sel.debtorRut}</p>
                <p className="text-[12px] text-muted-foreground">{sel.portfolio} · {sel.mandante}</p>
              </div>
              <button onClick={() => setSel(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Cuantía", value: fCLP(sel.claimAmount), mono: true },
                { label: "Recupero", value: sel.recoveryAmount > 0 ? fCLP(sel.recoveryAmount) : "—", mono: true, green: sel.recoveryAmount > 0 },
                { label: "Gastos", value: sel.expenseAmount > 0 ? fCLP(sel.expenseAmount) : "—", mono: true },
                { label: "Ingreso", value: sel.filingDate, mono: true },
              ].map(f => (
                <div key={f.label} className="bg-gray-50 rounded-lg p-2">
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{f.label}</p>
                  <p className={`text-xs font-semibold mt-0.5 ${f.mono ? "font-mono" : ""} ${f.green ? "text-emerald-600" : "text-foreground"}`}>{f.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border shrink-0">
            {(["timeline", "tasks", "docs", "recovery"] as const).map(t => {
              const lbl = { timeline: "Cronología", tasks: "Tareas", docs: "Docs", recovery: "Recupero" };
              return (
                <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-[12px] font-medium transition-colors border-b-2 ${tab === t ? "text-accent border-accent" : "text-muted-foreground border-transparent hover:text-foreground"}`}>
                  {lbl[t]}
                </button>
              );
            })}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-auto p-4">
            {tab === "timeline" && (
              <div className="space-y-0">
                {TL.map((e, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${e.key ? "bg-accent" : "bg-gray-300"}`} />
                      {i < TL.length - 1 && <div className="w-px flex-1 bg-gray-100 mt-1" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <p className={`text-xs leading-snug ${e.key ? "text-foreground font-medium" : "text-muted-foreground"}`}>{e.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-mono text-muted-foreground">{e.date}</span>
                        <span className="text-[11px] text-muted-foreground">·</span>
                        <span className="text-[11px] text-muted-foreground">{e.actor}</span>
                        <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded ml-auto">{e.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {tab === "tasks" && (
              <div className="space-y-2">
                {TASKS.filter(t => t.caseRol === sel.rol).length === 0
                  ? <p className="text-xs text-muted-foreground">Sin tareas activas.</p>
                  : TASKS.filter(t => t.caseRol === sel.rol).map(task => (
                    <div key={task.id} className="p-3 bg-gray-50 rounded-xl border border-border">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs text-foreground font-medium leading-snug flex-1">{task.title}</p>
                        <UBadge score={task.urgencyScore} />
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <PBadge p={task.priority} />
                        <span className={`text-[11px] font-mono ${task.dueAt.startsWith("Hoy") ? "text-red-600 font-semibold" : "text-muted-foreground"}`}>{task.dueAt}</span>
                        <span className="text-[11px] text-muted-foreground ml-auto">{task.assignedTo}</span>
                      </div>
                    </div>
                  ))
                }
              </div>
            )}
            {tab === "docs" && (
              <div className="space-y-2">
                {[
                  { name: "Demanda ejecutiva v4", type: "DEMANDA", status: "FIRMADA", date: "03/07/2026" },
                  { name: "Título ejecutivo · Pagaré original", type: "TITULO", status: "PRESENTADO", date: "04/07/2026" },
                  { name: "Poder notarial simple", type: "PODER", status: "FIRMADO", date: "01/07/2026" },
                  { name: "Comprobante PJUD #881291", type: "COMPROBANTE", status: "ARCHIVADO", date: "04/07/2026" },
                ].map((d, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-foreground font-medium truncate">{d.name}</p>
                      <p className="text-[11px] font-mono text-muted-foreground">{d.date} · {d.status}</p>
                    </div>
                    <button className="text-muted-foreground hover:text-accent transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                  </div>
                ))}
              </div>
            )}
            {tab === "recovery" && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-border">
                  <div className="flex justify-between mb-2">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Cuantía total</p>
                      <p className="text-xl font-bold font-mono text-foreground">{fCLP(sel.claimAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[11px] text-muted-foreground">Recuperado</p>
                      <p className="text-xl font-bold font-mono text-emerald-600">{sel.recoveryAmount > 0 ? fCLP(sel.recoveryAmount) : "$0"}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.max(1, sel.recoveryAmount / sel.claimAmount * 100)}%` }} />
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">Tasa de recupero: {(sel.recoveryAmount / sel.claimAmount * 100).toFixed(1)}%</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-border">
                  <p className="text-[11px] text-muted-foreground">Gastos judiciales acumulados</p>
                  <p className="text-sm font-mono font-semibold text-foreground mt-1">{fCLPFull(sel.expenseAmount)}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl border border-border">
                  <p className="text-[11px] text-muted-foreground">Rentabilidad neta proyectada</p>
                  <p className="text-sm font-mono font-semibold text-muted-foreground mt-1">Pendiente recupero</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Cobranza ─────────────────────────────────────────────────────────────────

function Cobranza() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Compromisos activos", value: "47", sub: "$284M comprometidos", c: "text-accent" },
          { label: "Pagos en validación", value: "12", sub: "$67M pendientes de aplicar", c: "text-amber-600" },
          { label: "Recupero comercial julio", value: "$218M", sub: "38.7% del recupero total", c: "text-emerald-600" },
        ].map(k => (
          <div key={k.label} className="bg-card rounded-xl border border-border p-4">
            <p className="text-[12px] text-muted-foreground uppercase tracking-wide font-medium">{k.label}</p>
            <p className={`text-3xl font-semibold tracking-tight mt-1 ${k.c}`}>{k.value}</p>
            <p className="text-[12px] text-muted-foreground mt-1">{k.sub}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Interactions */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Gestiones recientes</h3>
            <button className="flex items-center gap-1.5 text-xs text-white bg-accent px-3 py-1.5 rounded-lg hover:bg-accent/85 transition-colors">
              <PlusCircle className="w-3.5 h-3.5" />Nueva gestión
            </button>
          </div>
          <div className="space-y-3">
            {INTERACTIONS.map(int => (
              <div key={int.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${int.channel === "PHONE" ? "bg-blue-100" : int.channel === "WHATSAPP" ? "bg-emerald-100" : "bg-gray-100"}`}>
                  {int.channel === "PHONE" ? <Phone className="w-3.5 h-3.5 text-blue-600" /> : int.channel === "WHATSAPP" ? <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> : <FileText className="w-3.5 h-3.5 text-gray-500" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground truncate">{int.debtorName}</p>
                    <span className="text-[11px] font-mono text-muted-foreground ml-2 shrink-0">{int.date}</span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground">{int.caseRol} · {int.mandante}</p>
                  <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${int.outcome === "PAYMENT_COMMITMENT" ? "bg-emerald-100 text-emerald-700" : int.outcome === "CONTACT_OK" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                      {int.outcome === "PAYMENT_COMMITMENT" ? "Compromiso de pago" : int.outcome === "CONTACT_OK" ? "Contactado" : "Sin contacto"}
                    </span>
                    {int.amount && <span className="text-[11px] font-mono font-semibold text-emerald-600">{fCLPFull(int.amount)}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment promises */}
        <div className="bg-card rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-foreground">Compromisos de pago</h3>
            <span className="text-[12px] font-mono text-muted-foreground">5 vencen esta semana</span>
          </div>
          <div className="space-y-2.5">
            {[
              { name: "María Isabel Rojas Vega", rol: "C-5541-2026", amount: 4200000, date: "Hoy", status: "PENDING" },
              { name: "Soc. Exportadora Chile Ltda.", rol: "C-4192-2026", amount: 12500000, date: "12/07", status: "PENDING" },
              { name: "Jorge Navarro Pérez", rol: "C-3881-2026", amount: 1850000, date: "15/07", status: "CONFIRMED" },
              { name: "Transportes del Sur SpA", rol: "C-3414-2026", amount: 8900000, date: "18/07", status: "PENDING" },
              { name: "Ana Cecilia Bravo Díaz", rol: "C-2990-2026", amount: 2100000, date: "01/07", status: "OVERDUE" },
            ].map((p, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-border">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs text-foreground font-medium truncate">{p.name}</p>
                    <span className="text-xs font-mono font-bold text-foreground shrink-0">{fCLPFull(p.amount)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] font-mono text-muted-foreground">{p.rol}</span>
                    <span className="text-muted-foreground">·</span>
                    <span className={`text-[11px] font-mono font-semibold ${p.date === "Hoy" || p.status === "OVERDUE" ? "text-red-600" : "text-muted-foreground"}`}>{p.date}</span>
                    <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ml-auto ${p.status === "CONFIRMED" ? "bg-emerald-100 text-emerald-700" : p.status === "OVERDUE" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                      {p.status === "CONFIRMED" ? "Confirmado" : p.status === "OVERDUE" ? "Vencido" : "Pendiente"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Reportes ─────────────────────────────────────────────────────────────────

function Reportes() {
  return (
    <div className="flex-1 overflow-auto p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground">Recupero por mandante</h3>
          <p className="text-[12px] text-muted-foreground mb-4 mt-0.5">Julio 2026 — millones CLP vs. meta</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { m: "BFN", r: 412, meta: 350 }, { m: "ITAU", r: 198, meta: 200 },
              { m: "SANTANDER", r: 145, meta: 120 }, { m: "BCI", r: 87, meta: 90 }, { m: "CHILE", r: 50, meta: 60 },
            ]} margin={{ top: 5, right: 5, bottom: 0, left: -18 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis dataKey="m" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, border: "1px solid #E5E7EB", borderRadius: 8 }} />
              <Bar dataKey="r" name="Real" fill="#1755D4" radius={[3, 3, 0, 0]} />
              <Bar dataKey="meta" name="Meta" fill="#E5E7EB" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="text-sm font-semibold text-foreground">Distribución por procedimiento</h3>
          <p className="text-[12px] text-muted-foreground mb-3 mt-0.5">Causas activas por tipo</p>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={180}>
              <PieChart>
                <Pie data={[
                  { n: "Ej. Prenda", v: 487 }, { n: "Ej. Pagaré", v: 398 },
                  { n: "Hipotecario", v: 211 }, { n: "FOGAPE", v: 98 }, { n: "Otros", v: 53 },
                ]} cx="50%" cy="50%" outerRadius={75} paddingAngle={2} dataKey="v">
                  {["#1755D4","#3B82F6","#7C3AED","#10B981","#D1D5DB"].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {[
                { n: "Ej. Prenda", v: 487, c: "#1755D4" }, { n: "Ej. Pagaré", v: 398, c: "#3B82F6" },
                { n: "Hipotecario", v: 211, c: "#7C3AED" }, { n: "FOGAPE", v: 98, c: "#10B981" }, { n: "Otros", v: 53, c: "#D1D5DB" },
              ].map(d => (
                <div key={d.n} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: d.c }} />
                    <span className="text-[12px] text-muted-foreground">{d.n}</span>
                  </div>
                  <span className="text-[12px] font-mono font-semibold text-foreground">{d.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Receptor ranking */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Ranking de receptores judiciales</h3>
            <p className="text-[12px] text-muted-foreground mt-0.5">Últimos 30 días · Región Metropolitana</p>
          </div>
          <select className="text-xs border border-border rounded-lg px-3 py-1.5 bg-card focus:outline-none text-foreground">
            <option>RM</option><option>Valparaíso</option><option>Biobío</option>
          </select>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              {["#", "Receptor", "Asignados", "Tasa éxito", "T. promedio", "Pendientes", "Score"].map(h => (
                <th key={h} className="text-left py-2.5 text-muted-foreground font-medium text-[12px] uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { rank: 1, name: "Manuel Ortega García", a: 48, success: "87.5%", avg: "3.2d", pend: 6, score: 94 },
              { rank: 2, name: "Valeria Pérez Contreras", a: 41, success: "85.4%", avg: "3.8d", pend: 8, score: 89 },
              { rank: 3, name: "Carlos Escobar Muñoz", a: 37, success: "81.1%", avg: "4.1d", pend: 11, score: 82 },
              { rank: 4, name: "Patricia Soto Vargas", a: 29, success: "75.9%", avg: "5.2d", pend: 14, score: 74 },
              { rank: 5, name: "Rodrigo Fuentes Bello", a: 24, success: "66.7%", avg: "6.8d", pend: 18, score: 58 },
            ].map(r => (
              <tr key={r.rank} className="border-b border-border last:border-0 hover:bg-gray-50/50 transition-colors">
                <td className="py-3 font-mono text-muted-foreground font-bold">{r.rank}</td>
                <td className="py-3 text-foreground font-medium">{r.name}</td>
                <td className="py-3 font-mono text-muted-foreground">{r.a}</td>
                <td className="py-3 font-mono font-semibold text-emerald-600">{r.success}</td>
                <td className="py-3 font-mono text-muted-foreground">{r.avg}</td>
                <td className="py-3 font-mono text-muted-foreground">{r.pend}</td>
                <td className="py-3"><UBadge score={r.score} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Placeholder ──────────────────────────────────────────────────────────────

function Placeholder({ title, icon: Icon, desc }: { title: string; icon: React.ElementType; desc: string }) {
  return (
    <div className="flex-1 flex items-center justify-center p-12">
      <div className="text-center max-w-xs">
        <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Icon className="w-6 h-6 text-muted-foreground" />
        </div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{desc}</p>
        <div className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 bg-accent text-white rounded-lg text-xs font-medium">
          <Activity className="w-3.5 h-3.5" />
          En desarrollo · Fase 2
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

const META: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard ejecutivo", sub: "Visión consolidada de operación · 10 julio 2026" },
  micartera: { title: "Mi Cartera", sub: "Bandeja de trabajo inteligente · Abogado Jefe" },
  causas: { title: "Causas judiciales", sub: "Gestión del expediente procesal" },
  cobranza: { title: "Cobranza y negociación", sub: "Gestiones, compromisos y pagos" },
  documentos: { title: "Documentos", sub: "Repositorio documental y escritos" },
  gastos: { title: "Gastos judiciales", sub: "Control de costos y rendiciones" },
  reportes: { title: "Reportes y analítica", sub: "Indicadores, tendencias y rankings" },
  "inteligencia-cartera": { title: "Inteligencia de Cartera", sub: "Resumen IA, recomendaciones y proyección de recupero" },
  consultas: { title: "Consultas", sub: "Comunicación entre roles" },
  admin: { title: "Administración", sub: "Configuración y parametrización" },
  miescritorio: { title: "Mi Escritorio", sub: "Bandeja de gestión diaria · Procurador" },
  miscausas: { title: "Mis Causas", sub: "Cartera asignada y detalle procesal" },
  misdocumentos: { title: "Mis Documentos", sub: "Generación y visación de escritos" },
  mismetricas: { title: "Mis Métricas", sub: "Indicadores de gestión mensual" },
};

export default function App() {
  const [user, setUser] = useState<LoginUser | null>(null);
  const [view, setView] = useState("dashboard");
  const isMandante = user?.profile === "mandante";
  const isAbogado = user?.profile === "abogado";
  const { title, sub } = view === "dashboard" && isMandante
    ? { title: "Vista Mandante", sub: "Estudios de cobranza asociados" }
    : META[view] ?? { title: view, sub: "" };

  function handleLogin(u: LoginUser) {
    setUser(u);
    setView(u.profile === "abogado" ? "miescritorio" : "dashboard");
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <Sidebar active={view} onNav={setView} user={user} onLogout={() => setUser(null)} />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {!isAbogado && !(isMandante && view === "dashboard") && <TopBar title={title} sub={sub} user={user} />}
        {view === "dashboard" && (isMandante ? <MandanteView onOpenAnalisisAvanzado={() => setView("inteligencia-cartera")} /> : <Dashboard />)}
        {view === "micartera" && <MiCartera />}
        {view === "causas" && <Causas />}
        {view === "cobranza" && <Cobranza />}
        {view === "reportes" && <Reportes />}
        {view === "inteligencia-cartera" && <InteligenciaCarteraView />}
        {view === "documentos" && <Placeholder title="Gestión documental" icon={FileText} desc="Generación masiva, versionado, firma electrónica y presentación automatizada de escritos en PJUD." />}
        {view === "gastos" && <Placeholder title="Gastos judiciales" icon={Receipt} desc="Solicitud, aprobación, rendición y control de reembolsos de gastos asociados a receptores y trámites." />}
        {view === "consultas" && <Placeholder title="Consultas y mensajería" icon={MessageSquare} desc="Comunicación bidireccional entre abogados, procuradores, ejecutivos y mandantes con trazabilidad completa." />}
        {view === "admin" && <Placeholder title="Administración del sistema" icon={Settings} desc="Usuarios, roles, mandantes, catálogos, SLA, reglas de priorización e integraciones." />}
        {isAbogado && view === "miescritorio" && <MiEscritorio onNavigate={setView} email={user.email} />}
        {isAbogado && view === "miscausas" && <MisCausas email={user.email} />}
        {isAbogado && view === "misdocumentos" && <MisDocumentos email={user.email} />}
        {isAbogado && view === "mismetricas" && <MisMetricas email={user.email} />}
      </div>
    </div>
  );
}

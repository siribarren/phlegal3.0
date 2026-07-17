import React, { useMemo, useState } from "react";
import {
  Square,
  CheckSquare,
  Loader2,
  Check,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Repeat,
  Zap,
  RotateCcw,
  ScrollText,
  Scale,
  FileText,
  FileCheck2,
  Pencil,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  UploadCloud,
  Layers,
} from "lucide-react";
import { Dialog, DialogContent } from "./components/ui/dialog";

// ─── Paleta / tokens — estética "expediente + consola de operaciones" ─────────
const C = {
  bg: "#0B1420",
  panel: "#101B2E",
  panelAlt: "#0D1626",
  card: "#152238",
  cardBorder: "#22314A",
  cardBorderActive: "#3A4E70",
  text: "#ECE7DA",
  textMuted: "#8B96AC",
  textFaint: "#57627C",
  gold: "#C9A15C",
  goldSoft: "rgba(201,161,92,0.16)",
  green: "#4C9A73",
  greenSoft: "rgba(76,154,115,0.16)",
  rust: "#C1573F",
  rustSoft: "rgba(193,87,63,0.16)",
};

const ANALYSIS_STEPS = ["Analizando antecedentes", "Evaluando variables", "Clasificando acción"];

// ─── Datos de causas ────────────────────────────────────────────────────────

interface TaskMeta {
  id: number;
  rol: string;
  tribunal: string;
  cliente: string;
  deudor: string;
  procedimiento: string;
  etapa: string;
  subestado: string;
  exhorto: boolean;
  cuantia: "Alta" | "Media" | "Baja";
  estadoAdministrativo: "Activa" | "Archivada";
  estadoProcesal: "En tramitación" | "Concluido";
  tipoDemanda: "Ejecutiva" | "Ordinaria";
  observacion?: string;
}

const TASKS_META: TaskMeta[] = [
  { id: 1, rol: "8842-2025", tribunal: "2° Juzgado Civil de Santiago", cliente: "BFN", deudor: "Carlos González Pérez", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "DESPÁCHESE MANDAMIENTO", exhorto: false, cuantia: "Alta", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva", observacion: "Falta certificado de deuda actualizado" },
  { id: 2, rol: "3310-2025", tribunal: "Juzgado Civil de Rancagua", cliente: "ITAU", deudor: "Roberto Martínez Silva", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "ENCARGA EMBARGO A RECEPTOR", exhorto: true, cuantia: "Media", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 3, rol: "9981-2024", tribunal: "4° Juzgado Civil de Santiago", cliente: "SANTANDER", deudor: "Inversiones Torres SpA", procedimiento: "Liquidación Forzosa", etapa: "Demanda", subestado: "TRIBUNAL CITA A OIR SENTENCIA", exhorto: false, cuantia: "Baja", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ordinaria" },
  { id: 4, rol: "5521-2025", tribunal: "Juzgado Civil de Concepción", cliente: "BCI", deudor: "María Isabel Rojas Vega", procedimiento: "Ejecutivo Mínima Cuantía", etapa: "Embargo", subestado: "PRIMERA BÚSQUEDA NEGATIVA", exhorto: true, cuantia: "Alta", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva", observacion: "Pendiente confirmación de domicilio" },
  { id: 5, rol: "2245-2025", tribunal: "1° Juzgado Civil de Santiago", cliente: "CHILE", deudor: "Pedro Andrés Muñoz Riquelme", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "EMBARGO VEHICULO", exhorto: false, cuantia: "Media", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 6, rol: "7712-2024", tribunal: "Juzgado Civil de Antofagasta", cliente: "ITAU", deudor: "Comercial Andina Ltda.", procedimiento: "Gestión Preparatoria (Citac.Conf.Deuda)", etapa: "Notificación", subestado: "SOLICITA GIRO DE CHEQUE", exhorto: true, cuantia: "Baja", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ordinaria" },
  { id: 7, rol: "4489-2025", tribunal: "3° Juzgado Civil de Santiago", cliente: "BFN", deudor: "Alejandro Vásquez Moreno", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "DEUDOR INTERPONE EXCEPCION", exhorto: false, cuantia: "Alta", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 8, rol: "6634-2025", tribunal: "Juzgado Civil de Temuco", cliente: "SANTANDER", deudor: "Soc. Constructora Sur S.A.", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "DESPÁCHESE MANDAMIENTO", exhorto: true, cuantia: "Media", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 9, rol: "1123-2025", tribunal: "2° Juzgado Civil de Santiago", cliente: "BCI", deudor: "Francisca Elgueta Bravo", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "ENCARGA EMBARGO A RECEPTOR", exhorto: false, cuantia: "Baja", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 10, rol: "8890-2024", tribunal: "Juzgado Civil de Rancagua", cliente: "CHILE", deudor: "Manuel Antonio Sepúlveda", procedimiento: "Liquidación Simplificada", etapa: "Demanda", subestado: "FALLO DE EXCEPCIONES", exhorto: false, cuantia: "Alta", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ordinaria" },
  { id: 11, rol: "3367-2025", tribunal: "4° Juzgado Civil de Santiago", cliente: "ITAU", deudor: "Constructora Los Aromos Ltda.", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "PRIMERA BÚSQUEDA NEGATIVA", exhorto: false, cuantia: "Media", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 12, rol: "5578-2025", tribunal: "Juzgado Civil de Concepción", cliente: "BFN", deudor: "Javiera Contreras Muñoz", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "EMBARGO VEHICULO", exhorto: true, cuantia: "Alta", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 13, rol: "2256-2025", tribunal: "1° Juzgado Civil de Santiago", cliente: "SANTANDER", deudor: "Diego Ignacio Bustos Rivas", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "DESPÁCHESE MANDAMIENTO", exhorto: false, cuantia: "Baja", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
  { id: 14, rol: "7723-2024", tribunal: "Juzgado Civil de Antofagasta", cliente: "CHILE", deudor: "Sociedad Agrícola El Boldo Ltda.", procedimiento: "Ejecutivo Obligación de Dar", etapa: "Embargo", subestado: "TRIBUNAL ACOGE TERCERÍA", exhorto: false, cuantia: "Media", estadoAdministrativo: "Activa", estadoProcesal: "En tramitación", tipoDemanda: "Ejecutiva" },
];

// ─── Árbol de decisión ──────────────────────────────────────────────────────

const COMPATIBLE_SUBESTADOS = new Set([
  "DESPÁCHESE MANDAMIENTO",
  "ENCARGA EMBARGO A RECEPTOR",
  "EMBARGO VEHICULO",
  "PRIMERA BÚSQUEDA NEGATIVA",
]);

const Z_ACCIONES: Record<string, { titulo: string; texto: string }> = {
  "TRIBUNAL CITA A OIR SENTENCIA": { titulo: "Esperar citación a oír sentencia", texto: "la causa aún no ha sido fallada; no corresponde solicitar fuerza pública hasta contar con sentencia ejecutoriada." },
  "SOLICITA GIRO DE CHEQUE": { titulo: "Tramitar giro de cheque solicitado", texto: "existe una solicitud de giro de cheque pendiente que debe resolverse antes de continuar con la vía de apremio." },
  "DEUDOR INTERPONE EXCEPCION": { titulo: "Preparar traslado de excepciones", texto: "el deudor interpuso excepciones que deben ser resueltas antes de proseguir con el embargo." },
  "FALLO DE EXCEPCIONES": { titulo: "Revisar fallo y evaluar recurso", texto: "se dictó fallo de excepciones que debe revisarse para determinar si procede recurso antes de continuar." },
  "TRIBUNAL ACOGE TERCERÍA": { titulo: "Evaluar tercería acogida", texto: "un tercero fue acogido en el procedimiento, lo que suspende la diligencia de embargo hasta su resolución." },
};

type Branch = "standard" | "variable" | "reclass";

interface Classification {
  branch: Branch;
  chain: string;
  branchLabel: string;
  docTitulo: string;
  buildDoc: (t: TaskMeta) => string;
}

function buildDocFuerzaPublica(t: TaskMeta) {
  return `EN LO PRINCIPAL: Solicita se decrete el auxilio de la fuerza pública.\nOTROSÍ: Acompaña antecedentes.\n\nS.J.L.\n\n${t.tribunal}\n\nEn autos Rol ${t.rol}, caratulados "${t.cliente} con ${t.deudor}", el procurador de la parte ejecutante viene en solicitar a US. se sirva decretar el auxilio de la fuerza pública para el cumplimiento de la diligencia de embargo trabada en autos, con facultad de allanamiento y descerrajamiento si fuere necesario, atendido el estado actual de la causa ("${t.subestado}").\n\nPOR TANTO,\nRUEGO A US.: acceder a lo solicitado.`;
}

function buildDocExhorto(t: TaskMeta) {
  return `EN LO PRINCIPAL: Solicita despacho de exhorto previo.\nOTROSÍ: Acompaña antecedentes.\n\nS.J.L.\n\n${t.tribunal}\n\nEn autos Rol ${t.rol}, caratulados "${t.cliente} con ${t.deudor}", y encontrándose la diligencia de embargo condicionada a la tramitación de exhorto, el procurador de la parte ejecutante viene en solicitar a US. se sirva despachar el exhorto correspondiente en forma previa a solicitar el auxilio de la fuerza pública, atendido el estado actual de la causa ("${t.subestado}").\n\nPOR TANTO,\nRUEGO A US.: acceder a lo solicitado.`;
}

function buildDocZ(t: TaskMeta, z: { titulo: string; texto: string }) {
  return `${z.titulo.toUpperCase()}\n\nS.J.L.\n\n${t.tribunal}\n\nEn autos Rol ${t.rol}, caratulados "${t.cliente} con ${t.deudor}", el procurador de la parte ejecutante informa a US. que, del análisis de antecedentes, la causa se encuentra actualmente en subestado "${t.subestado}", por lo que la gestión aplicable no corresponde a la solicitud de fuerza pública sino a lo siguiente: ${z.texto}\n\nSe deja constancia para los efectos legales pertinentes.`;
}

function classify(t: TaskMeta): Classification {
  if (!COMPATIBLE_SUBESTADOS.has(t.subestado)) {
    const z = Z_ACCIONES[t.subestado] ?? { titulo: "Revisión manual requerida", texto: "el subestado actual no tiene una acción automática asociada." };
    return {
      branch: "reclass",
      chain: "A ≠ situación real → Z",
      branchLabel: `Reclasificada — ${z.titulo}`,
      docTitulo: z.titulo,
      buildDoc: (task) => buildDocZ(task, z),
    };
  }
  if (t.exhorto) {
    return {
      branch: "variable",
      chain: "A → D → E",
      branchLabel: "Variable detectada — exhorto pendiente",
      docTitulo: "Oficio exhorto — despacho previo",
      buildDoc: buildDocExhorto,
    };
  }
  return {
    branch: "standard",
    chain: "A → B → C",
    branchLabel: "Ruta estándar",
    docTitulo: "Solicita fuerza pública para retiro de especies",
    buildDoc: buildDocFuerzaPublica,
  };
}

const BRANCH_COLOR: Record<Branch, string> = { standard: C.green, variable: C.gold, reclass: C.rust };
const BRANCH_ICON: Record<Branch, React.ElementType> = { standard: CheckCircle2, variable: AlertTriangle, reclass: Repeat };

// ─── Tipos de ejecución ─────────────────────────────────────────────────────

type StepStatus = "pending" | "active" | "done";
interface Runtime { steps: StepStatus[]; branch: Branch | null; }

interface GeneratedDoc {
  id: string;
  taskId: number;
  rol: string;
  titulo: string;
  cuerpo: string;
  estado: "pendiente" | "aprobado";
}

interface LedgerEntry {
  id: string;
  rol: string;
  result: "done" | "exception";
  time: string;
  text: string;
}

type Stage = "idle" | "analyzing" | "preliminary" | "next_steps" | "generating" | "pdf_review" | "uploading";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const nowStr = () => new Date().toLocaleTimeString("es-CL", { hour12: false });

const initialRuntime = (): Record<number, Runtime> =>
  Object.fromEntries(TASKS_META.map((t) => [t.id, { steps: ["pending", "pending", "pending"] as StepStatus[], branch: null }]));

// ─── Componente principal ───────────────────────────────────────────────────

export default function AccionesMasivas() {
  const metaById = useMemo(() => Object.fromEntries(TASKS_META.map((t) => [t.id, t])), []);

  const [visibleIds, setVisibleIds] = useState<number[]>(TASKS_META.map((t) => t.id));
  const [selected, setSelected] = useState<Set<number>>(() => new Set());
  const [exiting, setExiting] = useState<Set<number>>(() => new Set());
  const [stage, setStage] = useState<Stage>("idle");
  const [batchIds, setBatchIds] = useState<number[]>([]);
  const [groupInfo, setGroupInfo] = useState<{ current: number; total: number } | null>(null);
  const [runtime, setRuntime] = useState<Record<number, Runtime>>(initialRuntime);
  const [classification, setClassification] = useState<Record<number, Classification>>({});
  const [ledger, setLedger] = useState<LedgerEntry[]>([]);

  const [docs, setDocs] = useState<GeneratedDoc[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [uploadStatus, setUploadStatus] = useState<Record<string, "pending" | "uploading" | "done">>({});
  const [uploadFinished, setUploadFinished] = useState(false);

  const running = stage !== "idle";
  const processingCount = batchIds.filter((id) => runtime[id]?.steps.some((s) => s === "active")).length;
  const analyzedCount = batchIds.filter((id) => classification[id]).length;
  const observacionCount = visibleIds.filter((id) => metaById[id].observacion).length;

  const branchTally = batchIds.reduce(
    (acc, id) => {
      const cls = classification[id];
      if (cls) acc[cls.branch] += 1;
      return acc;
    },
    { standard: 0, variable: 0, reclass: 0 } as Record<Branch, number>
  );

  function toggle(id: number) {
    if (running) return;
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (running) return;
    setSelected((prev) => (prev.size === visibleIds.length ? new Set() : new Set(visibleIds)));
  }

  function setStep(id: number, idx: number, status: StepStatus) {
    setRuntime((prev) => ({ ...prev, [id]: { ...prev[id], steps: prev[id].steps.map((s, i) => (i === idx ? status : s)) } }));
  }

  function setRuntimeBranch(id: number, branch: Branch) {
    setRuntime((prev) => ({ ...prev, [id]: { ...prev[id], branch } }));
  }

  async function analyzeOne(id: number, stagger: number) {
    await sleep(stagger);
    setStep(id, 0, "active");
    await sleep(500);
    setStep(id, 0, "done");

    setStep(id, 1, "active");
    await sleep(600);
    const cls = classify(metaById[id]);
    setClassification((prev) => ({ ...prev, [id]: cls }));
    setRuntimeBranch(id, cls.branch);
    setStep(id, 1, "done");

    setStep(id, 2, "active");
    await sleep(500);
    setStep(id, 2, "done");
  }

  async function runAnalysis() {
    const ids = visibleIds.filter((id) => selected.has(id));
    if (ids.length === 0 || stage !== "idle") return;
    setBatchIds(ids);
    setStage("analyzing");

    const groups: number[][] = [];
    for (let i = 0; i < ids.length; i += 10) groups.push(ids.slice(i, i + 10));

    for (let g = 0; g < groups.length; g++) {
      setGroupInfo(groups.length > 1 ? { current: g + 1, total: groups.length } : null);
      await Promise.all(groups[g].map((id, i) => analyzeOne(id, i * 190)));
    }
    setGroupInfo(null);
    setStage("preliminary");
  }

  async function generateDocs(ids: number[]) {
    setStage("generating");
    const built: GeneratedDoc[] = [];
    for (const id of ids) {
      await sleep(420);
      const meta = metaById[id];
      const cls = classification[id];
      built.push({
        id: `${id}-${Date.now()}`,
        taskId: id,
        rol: meta.rol,
        titulo: cls.docTitulo,
        cuerpo: cls.buildDoc(meta),
        estado: "pendiente",
      });
      setDocs([...built]);
    }
    setActiveDocId(built[0]?.id ?? null);
    setStage("pdf_review");
  }

  function handleNextStepsOption(option: "all" | "onlyClean" | "reviewOnly" | "cancel") {
    if (option === "cancel") {
      setStage("preliminary");
      return;
    }
    if (option === "reviewOnly") {
      const flagged = batchIds.filter((id) => metaById[id].observacion);
      setLedger((prev) => [
        { id: `rev-${Date.now()}`, rol: "—", result: "exception", time: nowStr(), text: `Revisión manual solicitada para ${flagged.length} causa(s) con observaciones` },
        ...prev,
      ]);
      setStage("idle");
      return;
    }
    const ids = option === "all" ? batchIds : batchIds.filter((id) => !metaById[id].observacion);
    generateDocs(ids);
  }

  function approveActive() {
    if (!activeDocId) return;
    const updated = docs.map((d) => (d.id === activeDocId ? { ...d, cuerpo: editMode ? draftText : d.cuerpo, estado: "aprobado" as const } : d));
    setDocs(updated);
    setEditMode(false);
    const next = updated.find((d) => d.estado === "pendiente");
    setActiveDocId(next ? next.id : activeDocId);
  }

  function approveAllPending() {
    setDocs((prev) => prev.map((d) => ({ ...d, estado: "aprobado" as const })));
    setEditMode(false);
  }

  function startEdit() {
    const active = docs.find((d) => d.id === activeDocId);
    if (!active) return;
    setDraftText(active.cuerpo);
    setEditMode(true);
  }

  function saveEdit() {
    setDocs((prev) => prev.map((d) => (d.id === activeDocId ? { ...d, cuerpo: draftText } : d)));
    setEditMode(false);
  }

  async function startUpload() {
    setStage("uploading");
    setUploadFinished(false);
    const initial: Record<string, "pending" | "uploading" | "done"> = {};
    docs.forEach((d) => { initial[d.id] = "pending"; });
    setUploadStatus(initial);

    for (const d of docs) {
      setUploadStatus((prev) => ({ ...prev, [d.id]: "uploading" }));
      await sleep(500);
      setUploadStatus((prev) => ({ ...prev, [d.id]: "done" }));
      setLedger((prev) => [{ id: `up-${d.id}`, rol: d.rol, result: "done", time: nowStr(), text: `Documento "${d.titulo}" subido a PJUD` }, ...prev]);
    }
    setUploadFinished(true);
  }

  async function finishBatch() {
    const ids = batchIds.filter((id) => docs.some((d) => d.taskId === id));
    setExiting((prev) => new Set([...prev, ...ids]));
    await sleep(420);
    setVisibleIds((prev) => prev.filter((id) => !ids.includes(id)));
    setSelected(new Set());
    setBatchIds([]);
    setDocs([]);
    setActiveDocId(null);
    setUploadStatus({});
    setStage("idle");
  }

  function resetDemo() {
    setVisibleIds(TASKS_META.map((t) => t.id));
    setSelected(new Set());
    setExiting(new Set());
    setStage("idle");
    setBatchIds([]);
    setGroupInfo(null);
    setRuntime(initialRuntime());
    setClassification({});
    setLedger([]);
    setDocs([]);
    setActiveDocId(null);
    setEditMode(false);
    setUploadStatus({});
    setUploadFinished(false);
  }

  const allSelected = visibleIds.length > 0 && selected.size === visibleIds.length;
  const activeDoc = docs.find((d) => d.id === activeDocId) ?? null;
  const allDocsApproved = docs.length > 0 && docs.every((d) => d.estado === "aprobado");

  return (
    <div style={{ background: C.bg, color: C.text }} className="w-full h-full overflow-y-auto p-4 sm:p-8">
      <style>{`
        @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(201,161,92,0.45); } 50% { box-shadow: 0 0 0 5px rgba(201,161,92,0); } }
        .step-active { animation: pulseGlow 1.3s ease-in-out infinite; }
        @keyframes stampIn { 0% { transform: scale(0.35) rotate(-16deg); opacity: 0; } 65% { transform: scale(1.15) rotate(3deg); opacity: 1; } 100% { transform: scale(1) rotate(0deg); opacity: 1; } }
        .stamp-in { animation: stampIn 420ms cubic-bezier(.34,1.56,.64,1) both; }
        @keyframes branchIn { from { opacity: 0; transform: translateY(-4px); } to { opacity: 1; transform: translateY(0); } }
        .branch-in { animation: branchIn 300ms ease-out both; }
        @keyframes ledgerIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .ledger-in { animation: ledgerIn 360ms ease-out both; }
        @keyframes countPulse { 0% { transform: scale(1); } 40% { transform: scale(1.2); color: ${C.gold}; } 100% { transform: scale(1); } }
        .count-pulse { display: inline-block; animation: countPulse 380ms ease-out; }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div style={{ color: C.gold, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] tracking-[0.25em] uppercase mb-2">
            Panel · Acciones masivas
          </div>
          <h1 style={{ fontFamily: "'Fraunces', serif", color: C.text }} className="text-2xl sm:text-3xl font-medium mb-1.5">
            Solicitud de Fuerza Pública — lote de causas críticas
          </h1>
          <p style={{ color: C.textMuted }} className="text-sm max-w-2xl">
            100 causas críticas de tu cartera de 500 requieren acción hoy. Selecciona un grupo, deja que la IA analice
            el árbol de decisión de cada una y supervisa la generación, revisión y envío de los escritos al PJUD.
          </p>
        </div>

        {/* Leyenda de pasos */}
        <div className="flex flex-wrap gap-4 mb-6">
          {ANALYSIS_STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div style={{ borderColor: C.cardBorder, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }} className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]">
                {i + 1}
              </div>
              <span style={{ color: C.textMuted }} className="text-xs">{label}</span>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div style={{ background: C.panel, borderColor: C.cardBorder }} className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg border overflow-hidden mb-2">
          {([
            ["Seleccionadas", selected.size, C.text],
            ["Procesando", processingCount, C.gold],
            ["Analizadas", analyzedCount, C.green],
            ["Con observación", observacionCount, C.rust],
          ] as const).map(([label, value, color]) => (
            <div key={label} style={{ background: C.panelAlt }} className="px-4 py-3">
              <div style={{ color: C.textFaint }} className="text-[10px] uppercase tracking-wider mb-1">{label}</div>
              <div key={value} style={{ color, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xl font-medium count-pulse tabular-nums">{value}</div>
            </div>
          ))}
        </div>

        {(stage === "preliminary" || stage === "next_steps") && (
          <div style={{ color: C.textMuted }} className="text-xs mb-4 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span style={{ color: C.green }}>{branchTally.standard} ruta estándar</span>
            <span style={{ color: C.gold }}>{branchTally.variable} con variable</span>
            <span style={{ color: C.rust }}>{branchTally.reclass} reclasificadas</span>
          </div>
        )}

        {groupInfo && (
          <div style={{ color: C.gold, fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs mb-4 flex items-center gap-2">
            <Layers size={13} />
            Analizando grupo {groupInfo.current} de {groupInfo.total} (lotes de 10 causas)
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button onClick={toggleAll} disabled={running} style={{ color: C.textMuted }} className="flex items-center gap-2 text-sm disabled:opacity-40">
            {allSelected ? <CheckSquare size={16} color={C.gold} /> : <Square size={16} />}
            Seleccionar todas ({visibleIds.length})
          </button>

          <div className="flex-1" />

          <button onClick={resetDemo} style={{ color: C.textMuted, borderColor: C.cardBorder }} className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border hover:opacity-80 transition">
            <RotateCcw size={13} />
            Reiniciar demo
          </button>

          {stage === "preliminary" ? (
            <button onClick={() => setStage("next_steps")} style={{ background: C.gold, color: "#1A140A" }} className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition">
              <ChevronRight size={15} />
              Ver próximos pasos sugeridos
            </button>
          ) : (
            <button
              onClick={runAnalysis}
              disabled={running || selected.size === 0}
              style={{ background: running || selected.size === 0 ? C.card : C.gold, color: running || selected.size === 0 ? C.textFaint : "#1A140A" }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition disabled:cursor-not-allowed"
            >
              {stage === "analyzing" ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
              {stage === "analyzing" ? "Analizando…" : "Ejecutar análisis masivo (IA)"}
            </button>
          )}
        </div>

        {/* Lista de causas */}
        <div style={{ background: C.panel, borderColor: C.cardBorder }} className="rounded-lg border mb-8">
          {visibleIds.length === 0 && (
            <div style={{ color: C.textFaint }} className="text-sm text-center py-10 italic">
              Bandeja vacía. Reinicia la demo para volver a intentarlo.
            </div>
          )}

          {visibleIds.map((id, idx) => {
            const t = metaById[id];
            const r = runtime[id];
            const cls = classification[id];
            const isExiting = exiting.has(id);
            const isSelected = selected.has(id);
            const BranchIcon = cls ? BRANCH_ICON[cls.branch] : null;

            return (
              <div
                key={id}
                style={{
                  display: "grid",
                  gridTemplateRows: isExiting ? "0fr" : "1fr",
                  opacity: isExiting ? 0 : 1,
                  transition: "grid-template-rows 420ms cubic-bezier(.4,0,.2,1), opacity 280ms ease",
                  borderTop: idx === 0 ? "none" : `1px solid ${C.cardBorder}`,
                }}
              >
                <div style={{ overflow: "hidden", minHeight: 0 }}>
                  <div className="flex items-start gap-4 px-4 py-3.5">
                    <button onClick={() => toggle(id)} disabled={running} aria-checked={isSelected} role="checkbox" className="shrink-0 disabled:opacity-40 mt-0.5">
                      {isSelected ? <CheckSquare size={17} color={C.gold} /> : <Square size={17} color={C.textFaint} />}
                    </button>

                    <div className="min-w-[190px]">
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.text }} className="text-sm">ROL {t.rol}</div>
                      <div style={{ color: C.textFaint }} className="text-xs">{t.tribunal}</div>
                      <div style={{ color: C.textMuted }} className="text-[11px] mt-0.5">{t.procedimiento} · {t.subestado}</div>
                    </div>

                    <div className="hidden sm:flex flex-col gap-1 shrink-0">
                      <div style={{ color: C.textMuted, borderColor: C.cardBorder }} className="text-xs border rounded px-2 py-0.5 text-center">Cuantía {t.cuantia}</div>
                      {t.observacion && (
                        <div style={{ color: C.rust, borderColor: "rgba(193,87,63,0.4)" }} className="text-[10px] border rounded px-2 py-0.5 max-w-[150px]">{t.observacion}</div>
                      )}
                    </div>

                    <div className="flex-1" />

                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {r.steps.map((s, i) => (
                          <React.Fragment key={i}>
                            <div
                              className={s === "active" ? "step-active" : ""}
                              style={{
                                width: 22, height: 22, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center",
                                background: s === "done" ? (cls ? `${BRANCH_COLOR[cls.branch]}29` : C.greenSoft) : s === "active" ? C.goldSoft : "transparent",
                                border: `1px solid ${s === "done" ? (cls ? BRANCH_COLOR[cls.branch] : C.green) : s === "active" ? C.gold : C.cardBorder}`,
                              }}
                              title={ANALYSIS_STEPS[i]}
                            >
                              {s === "active" && <Loader2 size={11} color={C.gold} className="animate-spin" />}
                              {s === "done" && <Check size={11} color={cls ? BRANCH_COLOR[cls.branch] : C.green} />}
                            </div>
                            {i < r.steps.length - 1 && <div style={{ width: 10, height: 1, background: C.cardBorder }} />}
                          </React.Fragment>
                        ))}

                        {cls && BranchIcon && (
                          <div
                            key={`stamp-${id}`}
                            className="stamp-in ml-1"
                            style={{ width: 24, height: 24, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", background: `${BRANCH_COLOR[cls.branch]}29`, border: `1px solid ${BRANCH_COLOR[cls.branch]}` }}
                          >
                            <BranchIcon size={13} color={BRANCH_COLOR[cls.branch]} />
                          </div>
                        )}
                      </div>

                      {cls && (
                        <div key={`branch-${id}`} className="branch-in flex items-center gap-1.5 text-[11px] text-right max-w-[260px]" style={{ color: BRANCH_COLOR[cls.branch] }}>
                          <GitBranch size={11} className="shrink-0" />
                          <span>{cls.chain} · {cls.branchLabel}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Registro / historial */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <ScrollText size={15} color={C.gold} />
            <h2 style={{ fontFamily: "'Fraunces', serif", color: C.text }} className="text-base font-medium">Historial de acciones</h2>
          </div>

          <div style={{ background: C.panel, borderColor: C.cardBorder }} className="rounded-lg border divide-y">
            {ledger.length === 0 && (
              <div style={{ color: C.textFaint }} className="text-sm text-center py-8 italic">
                Aún no se han registrado acciones. Selecciona causas y ejecuta el análisis masivo.
              </div>
            )}
            {ledger.map((e) => (
              <div key={e.id} className="ledger-in flex items-center gap-3 px-4 py-2.5" style={{ borderColor: C.cardBorder }}>
                <div style={{ width: 3, alignSelf: "stretch", background: e.result === "done" ? C.green : C.rust, borderRadius: 2 }} />
                {e.result === "done" ? <CheckCircle2 size={14} color={C.green} className="shrink-0" /> : <AlertTriangle size={14} color={C.rust} className="shrink-0" />}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.textFaint }} className="text-xs shrink-0">{e.time}</span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.text }} className="text-xs shrink-0">{e.rol}</span>
                <span style={{ color: C.textMuted }} className="text-xs">{e.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-8 opacity-60">
          <Scale size={13} color={C.textFaint} />
          <span style={{ color: C.textFaint }} className="text-[11px]">Prototipo de flujo de gestión masiva con árbol de decisión, generación y aprobación de documentos</span>
        </div>
      </div>

      {/* ── Modal: próximos pasos sugeridos ── */}
      <Dialog open={stage === "next_steps"} onOpenChange={(open) => { if (!open) handleNextStepsOption("cancel"); }}>
        <DialogContent style={{ background: C.panel, borderColor: C.cardBorder, color: C.text }} className="sm:max-w-md">
          <div style={{ color: C.gold, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] tracking-[0.2em] uppercase mb-1">Determinando próximos pasos</div>
          <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-lg font-medium mb-1">Próximos pasos sugeridos</h3>
          <p style={{ color: C.textMuted }} className="text-xs mb-4">
            {analyzedCount} causas analizadas · {batchIds.filter((id) => metaById[id].observacion).length} con observaciones pendientes.
          </p>
          <div className="flex flex-col gap-2">
            <NextStepButton icon={Layers} label={`Generar los ${batchIds.length} documentos de forma masiva`} onClick={() => handleNextStepsOption("all")} />
            <NextStepButton icon={FileCheck2} label={`Generar solo los ${batchIds.filter((id) => !metaById[id].observacion).length} documentos sin observaciones`} onClick={() => handleNextStepsOption("onlyClean")} />
            <NextStepButton icon={AlertTriangle} label="No generar documentos y revisar las causas con observaciones" onClick={() => handleNextStepsOption("reviewOnly")} />
            <NextStepButton icon={X} label="No hacer nada" onClick={() => handleNextStepsOption("cancel")} muted />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: generando documentos ── */}
      <Dialog open={stage === "generating"} onOpenChange={() => {}}>
        <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} style={{ background: C.panel, borderColor: C.cardBorder, color: C.text }} className="sm:max-w-md [&>button]:hidden">
          <div className="flex items-center gap-2 mb-1">
            <Loader2 size={16} className="animate-spin" color={C.gold} />
            <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-lg font-medium">Generando documentos</h3>
          </div>
          <p style={{ color: C.textMuted }} className="text-xs mb-4">Documento {docs.length} de {batchIds.length > 0 ? Math.max(docs.length, 1) : 0} generado.</p>
          <div style={{ background: C.panelAlt, borderColor: C.cardBorder }} className="rounded-md border max-h-64 overflow-y-auto divide-y">
            {docs.map((d) => (
              <div key={d.id} className="ledger-in flex items-center gap-2 px-3 py-2 text-xs" style={{ borderColor: C.cardBorder }}>
                <FileText size={12} color={C.green} className="shrink-0" />
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.text }}>{d.rol}</span>
                <span style={{ color: C.textMuted }} className="truncate">{d.titulo}</span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: visor / editor PDF (obligatorio) ── */}
      <Dialog open={stage === "pdf_review"} onOpenChange={() => {}}>
        <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} style={{ background: C.panel, borderColor: C.cardBorder, color: C.text }} className="sm:max-w-4xl [&>button]:hidden">
          <div className="flex items-center justify-between mb-1">
            <div>
              <div style={{ color: C.gold, fontFamily: "'IBM Plex Mono', monospace" }} className="text-[11px] tracking-[0.2em] uppercase mb-1">Revisión obligatoria</div>
              <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-lg font-medium">Visor de documentos generados</h3>
            </div>
            <div style={{ color: C.textMuted }} className="text-xs">{docs.filter((d) => d.estado === "aprobado").length} / {docs.length} aprobados</div>
          </div>

          <div className="grid grid-cols-[220px_1fr] gap-4 mt-2" style={{ height: 440 }}>
            <div style={{ background: C.panelAlt, borderColor: C.cardBorder }} className="rounded-md border overflow-y-auto">
              {docs.map((d) => (
                <button
                  key={d.id}
                  onClick={() => { setActiveDocId(d.id); setEditMode(false); }}
                  style={{ background: d.id === activeDocId ? C.card : "transparent", borderColor: C.cardBorder, color: C.text }}
                  className="w-full text-left px-3 py-2.5 border-b flex items-start gap-2"
                >
                  {d.estado === "aprobado" ? <FileCheck2 size={13} color={C.green} className="shrink-0 mt-0.5" /> : <FileText size={13} color={C.textFaint} className="shrink-0 mt-0.5" />}
                  <div className="min-w-0">
                    <div style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-xs">{d.rol}</div>
                    <div style={{ color: C.textFaint }} className="text-[10px] truncate">{d.titulo}</div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex flex-col min-h-0">
              {activeDoc && (
                <>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => { const idx = docs.findIndex((d) => d.id === activeDocId); if (idx > 0) { setActiveDocId(docs[idx - 1].id); setEditMode(false); } }}
                        style={{ color: C.textMuted }} className="p-1"
                      ><ChevronLeft size={14} /></button>
                      <button
                        onClick={() => { const idx = docs.findIndex((d) => d.id === activeDocId); if (idx < docs.length - 1) { setActiveDocId(docs[idx + 1].id); setEditMode(false); } }}
                        style={{ color: C.textMuted }} className="p-1"
                      ><ChevronRight size={14} /></button>
                    </div>
                    {!editMode ? (
                      <button onClick={startEdit} style={{ color: C.textMuted, borderColor: C.cardBorder }} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border hover:opacity-80">
                        <Pencil size={12} /> Editar documento
                      </button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button onClick={() => setEditMode(false)} style={{ color: C.textMuted, borderColor: C.cardBorder }} className="text-xs px-2.5 py-1.5 rounded-md border hover:opacity-80">Cancelar</button>
                        <button onClick={saveEdit} style={{ color: C.text, borderColor: C.cardBorderActive }} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-md border hover:opacity-80">
                          <Save size={12} /> Guardar cambios
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-h-0 grid gap-3" style={{ gridTemplateColumns: editMode ? "1fr 1fr" : "1fr" }}>
                    {editMode && (
                      <textarea
                        value={draftText}
                        onChange={(e) => setDraftText(e.target.value)}
                        style={{ background: C.card, borderColor: C.cardBorder, color: C.text, fontFamily: "'IBM Plex Mono', monospace" }}
                        className="w-full h-full rounded-md border p-3 text-xs resize-none focus:outline-none"
                      />
                    )}
                    <div style={{ background: "#F5F1E8", color: "#1A1A1A", fontFamily: "'IBM Plex Mono', monospace" }} className="rounded-md p-6 overflow-y-auto text-[12px] leading-relaxed whitespace-pre-wrap">
                      {editMode ? draftText : activeDoc.cuerpo}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 mt-3 pt-3" style={{ borderTop: `1px solid ${C.cardBorder}` }}>
                    <button onClick={approveAllPending} style={{ color: C.textMuted, borderColor: C.cardBorder }} className="text-xs px-3 py-1.5 rounded-md border hover:opacity-80">
                      Aprobar todos los pendientes
                    </button>
                    <button
                      onClick={approveActive}
                      disabled={activeDoc.estado === "aprobado"}
                      style={{ background: activeDoc.estado === "aprobado" ? C.card : C.green, color: activeDoc.estado === "aprobado" ? C.textFaint : "#0B1420" }}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md disabled:cursor-not-allowed"
                    >
                      <Check size={13} /> {activeDoc.estado === "aprobado" ? "Aprobado" : "Aprobar documento"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="flex justify-end mt-3">
            <button
              onClick={startUpload}
              disabled={!allDocsApproved}
              style={{ background: allDocsApproved ? C.gold : C.card, color: allDocsApproved ? "#1A140A" : C.textFaint }}
              className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition disabled:cursor-not-allowed"
            >
              <UploadCloud size={15} /> Continuar y subir a PJUD
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Modal: subida a PJUD ── */}
      <Dialog open={stage === "uploading"} onOpenChange={() => {}}>
        <DialogContent onEscapeKeyDown={(e) => e.preventDefault()} onInteractOutside={(e) => e.preventDefault()} style={{ background: C.panel, borderColor: C.cardBorder, color: C.text }} className="sm:max-w-md [&>button]:hidden">
          <div className="flex items-center gap-2 mb-1">
            {uploadFinished ? <CheckCircle2 size={16} color={C.green} /> : <Loader2 size={16} className="animate-spin" color={C.gold} />}
            <h3 style={{ fontFamily: "'Fraunces', serif" }} className="text-lg font-medium">{uploadFinished ? "Subida completada" : "Subiendo a PJUD"}</h3>
          </div>
          <p style={{ color: C.textMuted }} className="text-xs mb-4">
            {Object.values(uploadStatus).filter((s) => s === "done").length} / {docs.length} documentos subidos.
          </p>
          <div style={{ background: C.panelAlt, borderColor: C.cardBorder }} className="rounded-md border max-h-64 overflow-y-auto divide-y mb-4">
            {docs.map((d) => (
              <div key={d.id} className="flex items-center gap-2 px-3 py-2 text-xs" style={{ borderColor: C.cardBorder }}>
                {uploadStatus[d.id] === "done" ? <CheckCircle2 size={12} color={C.green} className="shrink-0" /> : uploadStatus[d.id] === "uploading" ? <Loader2 size={12} className="animate-spin shrink-0" color={C.gold} /> : <div style={{ width: 12, height: 12, borderRadius: 999, border: `1px solid ${C.cardBorder}` }} className="shrink-0" />}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.text }}>{d.rol}</span>
                <span style={{ color: C.textMuted }} className="truncate">{d.titulo}</span>
              </div>
            ))}
          </div>
          {uploadFinished && (
            <div className="flex justify-end">
              <button onClick={finishBatch} style={{ background: C.gold, color: "#1A140A" }} className="text-sm font-medium px-4 py-2 rounded-md">Cerrar</button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NextStepButton({ icon: Icon, label, onClick, muted }: { icon: React.ElementType; label: string; onClick: () => void; muted?: boolean }) {
  return (
    <button
      onClick={onClick}
      style={{ background: C.panelAlt, borderColor: C.cardBorder, color: muted ? C.textFaint : C.text }}
      className="flex items-center gap-3 text-left text-sm px-3.5 py-3 rounded-lg border hover:opacity-85 transition"
    >
      <Icon size={16} color={muted ? C.textFaint : C.gold} className="shrink-0" />
      {label}
    </button>
  );
}

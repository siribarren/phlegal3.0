import React, { useMemo, useRef, useState } from "react";
import {
  Square,
  CheckSquare,
  Loader2,
  Check,
  AlertTriangle,
  CheckCircle2,
  GitBranch,
  Zap,
  RotateCcw,
  ScrollText,
  Scale,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Paleta / tokens — estética "expediente + consola de operaciones"
// ---------------------------------------------------------------------------
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

const STEPS = ["Validar antecedentes", "Evaluación IA", "Generar y enviar escrito"];

const TASKS_META = [
  { id: 1, rol: "3421-2025", tribunal: "2° Juzgado Civil de Santiago", exhorto: false, cuantia: "Alta" },
  { id: 2, rol: "1187-2025", tribunal: "Juzgado Civil de Rancagua", exhorto: true, cuantia: "Media" },
  { id: 3, rol: "9002-2024", tribunal: "4° Juzgado Civil de Santiago", exhorto: false, cuantia: "Baja" },
  { id: 4, rol: "5563-2025", tribunal: "Juzgado Civil de Concepción", exhorto: true, cuantia: "Alta" },
  { id: 5, rol: "2210-2025", tribunal: "1° Juzgado Civil de Santiago", exhorto: false, cuantia: "Media" },
  { id: 6, rol: "7788-2024", tribunal: "Juzgado Civil de Antofagasta", exhorto: true, cuantia: "Baja" },
  { id: 7, rol: "4456-2025", tribunal: "3° Juzgado Civil de Santiago", exhorto: false, cuantia: "Alta" },
  { id: 8, rol: "6699-2025", tribunal: "Juzgado Civil de Temuco", exhorto: true, cuantia: "Media" },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const initialRuntime = () =>
  Object.fromEntries(
    TASKS_META.map((t) => [t.id, { steps: ["pending", "pending", "pending"], branch: null, result: null }])
  );

export default function App() {
  const [visibleIds, setVisibleIds] = useState(TASKS_META.map((t) => t.id));
  const [selected, setSelected] = useState(() => new Set());
  const [exiting, setExiting] = useState(() => new Set());
  const [runtime, setRuntime] = useState(initialRuntime);
  const [ledger, setLedger] = useState([]);
  const [running, setRunning] = useState(false);
  const metaById = useMemo(() => Object.fromEntries(TASKS_META.map((t) => [t.id, t])), []);
  const runIdRef = useRef(0);

  const doneCount = ledger.filter((e) => e.result === "done").length;
  const exceptionCount = ledger.filter((e) => e.result === "exception").length;
  const processingCount = visibleIds.filter((id) =>
    runtime[id]?.steps.some((s) => s === "active")
  ).length;

  function toggle(id) {
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

  function setStep(id, idx, status) {
    setRuntime((prev) => ({
      ...prev,
      [id]: { ...prev[id], steps: prev[id].steps.map((s, i) => (i === idx ? status : s)) },
    }));
  }

  function setBranch(id, branch) {
    setRuntime((prev) => ({ ...prev, [id]: { ...prev[id], branch } }));
  }

  function setResult(id, result) {
    setRuntime((prev) => ({ ...prev, [id]: { ...prev[id], result } }));
  }

  async function processTask(id, stagger) {
    await sleep(stagger);

    setStep(id, 0, "active");
    await sleep(550);
    setStep(id, 0, "done");

    setStep(id, 1, "active");
    await sleep(650);
    const hasExhorto = metaById[id].exhorto;
    setBranch(id, hasExhorto ? "exhorto" : "directo");
    setStep(id, 1, "done");

    setStep(id, 2, "active");
    await sleep(600);
    const result = hasExhorto ? "exception" : "done";
    setStep(id, 2, result === "exception" ? "exception" : "done");
    setResult(id, result);

    setLedger((prev) => [
      {
        id: `${id}-${Date.now()}`,
        rol: metaById[id].rol,
        result,
        time: new Date().toLocaleTimeString("es-CL", { hour12: false }),
        text:
          result === "done"
            ? "Fuerza pública solicitada y enviada al tribunal"
            : "Excepción: requiere exhorto previo antes de continuar",
      },
      ...prev,
    ]);

    await sleep(650);
    setExiting((prev) => new Set(prev).add(id));
    await sleep(420);
    setVisibleIds((prev) => prev.filter((x) => x !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }

  async function runBatch() {
    if (running) return;
    const ids = visibleIds.filter((id) => selected.has(id));
    if (ids.length === 0) return;
    runIdRef.current += 1;
    setRunning(true);
    await Promise.all(ids.map((id, i) => processTask(id, i * 190)));
    setRunning(false);
  }

  function resetDemo() {
    setVisibleIds(TASKS_META.map((t) => t.id));
    setSelected(new Set());
    setExiting(new Set());
    setRuntime(initialRuntime());
    setLedger([]);
    setRunning(false);
  }

  const allSelected = visibleIds.length > 0 && selected.size === visibleIds.length;

  return (
    <div
      style={{ background: C.bg, color: C.text, fontFamily: "'IBM Plex Sans', sans-serif" }}
      className="w-full min-h-screen p-4 sm:p-8"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400..600&family=IBM+Plex+Mono:wght@400;500;600&family=IBM+Plex+Sans:wght@400;500;600&display=swap');

        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(201,161,92,0.45); }
          50% { box-shadow: 0 0 0 5px rgba(201,161,92,0); }
        }
        .step-active { animation: pulseGlow 1.3s ease-in-out infinite; }

        @keyframes stampIn {
          0% { transform: scale(0.35) rotate(-16deg); opacity: 0; }
          65% { transform: scale(1.15) rotate(3deg); opacity: 1; }
          100% { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        .stamp-in { animation: stampIn 420ms cubic-bezier(.34,1.56,.64,1) both; }

        @keyframes branchIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .branch-in { animation: branchIn 300ms ease-out both; }

        @keyframes ledgerIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .ledger-in { animation: ledgerIn 360ms ease-out both; }

        @keyframes countPulse {
          0% { transform: scale(1); }
          40% { transform: scale(1.2); color: ${C.gold}; }
          100% { transform: scale(1); }
        }
        .count-pulse { display: inline-block; animation: countPulse 380ms ease-out; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div
            style={{ color: C.gold, fontFamily: "'IBM Plex Mono', monospace" }}
            className="text-[11px] tracking-[0.25em] uppercase mb-2"
          >
            Panel · Acciones masivas
          </div>
          <h1
            style={{ fontFamily: "'Fraunces', serif", color: C.text }}
            className="text-2xl sm:text-3xl font-medium mb-1.5"
          >
            Solicitud de Fuerza Pública — lote de causas
          </h1>
          <p style={{ color: C.textMuted }} className="text-sm max-w-xl">
            Selecciona causas, ejecuta la acción en bloque y observa cómo cada una avanza por
            sus propias etapas y se resuelve según su árbol de decisión.
          </p>
        </div>

        {/* Leyenda de pasos (proceso real → numeración justificada) */}
        <div className="flex flex-wrap gap-4 mb-6">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                style={{ borderColor: C.cardBorder, color: C.textMuted, fontFamily: "'IBM Plex Mono', monospace" }}
                className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px]"
              >
                {i + 1}
              </div>
              <span style={{ color: C.textMuted }} className="text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Stat strip */}
        <div
          style={{ background: C.panel, borderColor: C.cardBorder }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-px rounded-lg border overflow-hidden mb-4"
        >
          {[
            ["Seleccionadas", selected.size, C.text],
            ["Procesando", processingCount, C.gold],
            ["Aprobadas", doneCount, C.green],
            ["Excepciones", exceptionCount, C.rust],
          ].map(([label, value, color]) => (
            <div key={label} style={{ background: C.panelAlt }} className="px-4 py-3">
              <div style={{ color: C.textFaint }} className="text-[10px] uppercase tracking-wider mb-1">
                {label}
              </div>
              <div
                key={value}
                style={{ color, fontFamily: "'IBM Plex Mono', monospace" }}
                className="text-xl font-medium count-pulse tabular-nums"
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <button
            onClick={toggleAll}
            disabled={running}
            style={{ color: C.textMuted }}
            className="flex items-center gap-2 text-sm disabled:opacity-40"
          >
            {allSelected ? <CheckSquare size={16} color={C.gold} /> : <Square size={16} />}
            Seleccionar todas ({visibleIds.length})
          </button>

          <div className="flex-1" />

          <button
            onClick={resetDemo}
            style={{ color: C.textMuted, borderColor: C.cardBorder }}
            className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-md border hover:opacity-80 transition"
          >
            <RotateCcw size={13} />
            Reiniciar demo
          </button>

          <button
            onClick={runBatch}
            disabled={running || selected.size === 0}
            style={{
              background: running || selected.size === 0 ? C.card : C.gold,
              color: running || selected.size === 0 ? C.textFaint : "#1A140A",
            }}
            className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-md transition disabled:cursor-not-allowed"
          >
            {running ? <Loader2 size={15} className="animate-spin" /> : <Zap size={15} />}
            Ejecutar acción masiva
          </button>
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
            const isExiting = exiting.has(id);
            const isSelected = selected.has(id);

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
                  <div className="flex items-center gap-4 px-4 py-3.5">
                    <button
                      onClick={() => toggle(id)}
                      disabled={running}
                      aria-checked={isSelected}
                      role="checkbox"
                      className="shrink-0 disabled:opacity-40"
                    >
                      {isSelected ? <CheckSquare size={17} color={C.gold} /> : <Square size={17} color={C.textFaint} />}
                    </button>

                    <div className="min-w-[150px]">
                      <div style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.text }} className="text-sm">
                        ROL {t.rol}
                      </div>
                      <div style={{ color: C.textFaint }} className="text-xs">
                        {t.tribunal}
                      </div>
                    </div>

                    <div style={{ color: C.textMuted, borderColor: C.cardBorder }} className="hidden sm:block text-xs border rounded px-2 py-0.5">
                      Cuantía {t.cuantia}
                    </div>

                    <div className="flex-1" />

                    {/* Step tracker */}
                    <div className="flex flex-col items-end gap-1.5">
                      <div className="flex items-center gap-1.5">
                        {r.steps.map((s, i) => (
                          <React.Fragment key={i}>
                            <div
                              className={s === "active" ? "step-active" : ""}
                              style={{
                                width: 22,
                                height: 22,
                                borderRadius: 999,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                background:
                                  s === "done" ? C.greenSoft : s === "exception" ? C.rustSoft : s === "active" ? C.goldSoft : "transparent",
                                border: `1px solid ${
                                  s === "done" ? C.green : s === "exception" ? C.rust : s === "active" ? C.gold : C.cardBorder
                                }`,
                              }}
                              title={STEPS[i]}
                            >
                              {s === "active" && <Loader2 size={11} color={C.gold} className="animate-spin" />}
                              {s === "done" && <Check size={11} color={C.green} />}
                              {s === "exception" && <AlertTriangle size={10} color={C.rust} />}
                            </div>
                            {i < r.steps.length - 1 && (
                              <div style={{ width: 10, height: 1, background: C.cardBorder }} />
                            )}
                          </React.Fragment>
                        ))}

                        {r.result && (
                          <div
                            key={`stamp-${id}`}
                            className="stamp-in ml-1"
                            style={{
                              width: 24,
                              height: 24,
                              borderRadius: 999,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              background: r.result === "done" ? C.greenSoft : C.rustSoft,
                              border: `1px solid ${r.result === "done" ? C.green : C.rust}`,
                            }}
                          >
                            {r.result === "done" ? (
                              <CheckCircle2 size={13} color={C.green} />
                            ) : (
                              <AlertTriangle size={13} color={C.rust} />
                            )}
                          </div>
                        )}
                      </div>

                      {r.branch && (
                        <div
                          key={`branch-${id}`}
                          className="branch-in flex items-center gap-1.5 text-[11px]"
                          style={{ color: r.branch === "directo" ? C.green : C.gold }}
                        >
                          <GitBranch size={11} />
                          {r.branch === "directo"
                            ? "Sin exhorto — envío directo al tribunal"
                            : "Con exhorto — requiere despacho previo"}
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
            <h2 style={{ fontFamily: "'Fraunces', serif", color: C.text }} className="text-base font-medium">
              Historial de acciones
            </h2>
          </div>

          <div style={{ background: C.panel, borderColor: C.cardBorder }} className="rounded-lg border divide-y" >
            {ledger.length === 0 && (
              <div style={{ color: C.textFaint }} className="text-sm text-center py-8 italic">
                Aún no se han registrado acciones. Selecciona causas y ejecuta la acción masiva.
              </div>
            )}
            {ledger.map((e) => (
              <div
                key={e.id}
                className="ledger-in flex items-center gap-3 px-4 py-2.5"
                style={{ borderColor: C.cardBorder }}
              >
                <div
                  style={{ width: 3, alignSelf: "stretch", background: e.result === "done" ? C.green : C.rust, borderRadius: 2 }}
                />
                {e.result === "done" ? (
                  <CheckCircle2 size={14} color={C.green} className="shrink-0" />
                ) : (
                  <AlertTriangle size={14} color={C.rust} className="shrink-0" />
                )}
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.textFaint }} className="text-xs shrink-0">
                  {e.time}
                </span>
                <span style={{ fontFamily: "'IBM Plex Mono', monospace", color: C.text }} className="text-xs shrink-0">
                  ROL {e.rol}
                </span>
                <span style={{ color: C.textMuted }} className="text-xs">
                  {e.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 mt-8 opacity-60">
          <Scale size={13} color={C.textFaint} />
          <span style={{ color: C.textFaint }} className="text-[11px]">
            Demo de patrones de animación para workflows de gestión masiva
          </span>
        </div>
      </div>
    </div>
  );
}

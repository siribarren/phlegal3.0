import React, { useMemo, useState } from "react";
import { GitBranch, Sparkles, AlertTriangle, ArrowRight, ShieldAlert } from "lucide-react";
import { analizarCausaSegunFlujo } from "../flujoCobranza";

// ---------------------------------------------------------------------------
// Demo: impacto de docs/flujo.pdf en el análisis de acciones por causa.
//
// Compara, para un set de causas de ejemplo, lo que hoy hace el modal
// "Analizar con IA y resolver" (ProcuradorView.tsx) — que es una simulación
// visual sin lógica real (progreso falso, warning random, split urgente/
// normal por plazo) — contra lo que se puede obtener formalizando el flujo
// del PDF como grafo de estados y derivando de ahí las acciones válidas.
// ---------------------------------------------------------------------------

const C = {
  bg: "#0B1420",
  panel: "#101B2E",
  card: "#152238",
  cardBorder: "#22314A",
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

interface CausaEjemplo {
  rol: string;
  mandante: string;
  etapa: string;
  mockIA: string; // lo que hoy mostraría el modal simulado (random/hardcoded)
}

const CAUSAS_EJEMPLO: CausaEjemplo[] = [
  { rol: "3421-2025", mandante: "Banco Sur", etapa: "DESPACHESE MANDAMIENTO", mockIA: "No se encontraron coincidencias relevantes." },
  { rol: "1187-2024", mandante: "Retail Norte", etapa: "EXHORTO EN TRAMITACION", mockIA: "Se sugiere crear escrito y subir (plazo urgente)." },
  { rol: "5502-2023", mandante: "Financiera Andes", etapa: "PREPARACION REMATE", mockIA: "No hacer nada por ahora." },
  { rol: "2290-2024", mandante: "Banco Sur", etapa: "TERMINO DE JUICIO", mockIA: "Se sugiere crear escrito y subir (plazo urgente)." },
  { rol: "9981-2025", mandante: "Cobranza Directa", etapa: "ETAPA INEXISTENTE X", mockIA: "No se encontraron coincidencias relevantes." },
];

function Badge({ children, tone }: { children: React.ReactNode; tone: "gold" | "green" | "rust" }) {
  const map = {
    gold: { bg: C.goldSoft, fg: C.gold },
    green: { bg: C.greenSoft, fg: C.green },
    rust: { bg: C.rustSoft, fg: C.rust },
  } as const;
  const t = map[tone];
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium"
      style={{ backgroundColor: t.bg, color: t.fg }}
    >
      {children}
    </span>
  );
}

export default function FlujoCobranzaDemo() {
  const [seleccion, setSeleccion] = useState(0);
  const causa = CAUSAS_EJEMPLO[seleccion];
  const analisis = useMemo(() => analizarCausaSegunFlujo(causa.etapa), [causa.etapa]);

  return (
    <div className="min-h-screen p-8" style={{ backgroundColor: C.bg, color: C.text, fontFamily: "system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-2">
          <GitBranch className="w-5 h-5" style={{ color: C.gold }} />
          <h1 className="text-lg font-semibold">Flujo de cobranza (docs/flujo.pdf) → análisis de acciones</h1>
        </div>
        <p className="text-sm" style={{ color: C.textMuted }}>
          Cada causa de ejemplo abajo trae la misma <code>etapa</code> libre que hoy guarda el CRM. A la izquierda, lo
          que produce el modal "Analizar con IA y resolver" actual (simulado). A la derecha, lo que se obtiene
          formalizando <code>docs/flujo.pdf</code> como grafo de estados (<code>flujoCobranza.ts</code>) y derivando
          de ahí las transiciones válidas desde esa etapa.
        </p>

        <div className="flex flex-wrap gap-2">
          {CAUSAS_EJEMPLO.map((c, i) => (
            <button
              key={c.rol}
              onClick={() => setSeleccion(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                backgroundColor: i === seleccion ? C.goldSoft : C.card,
                color: i === seleccion ? C.gold : C.textMuted,
                border: `1px solid ${i === seleccion ? C.gold : C.cardBorder}`,
              }}
            >
              {c.rol} · {c.etapa}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: C.card, border: `1px solid ${C.cardBorder}` }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: C.textFaint }} />
              <span className="text-sm font-medium" style={{ color: C.textFaint }}>Modal actual (simulado)</span>
            </div>
            <p className="text-xs" style={{ color: C.textMuted }}>Rol {causa.rol} · {causa.mandante}</p>
            <div className="text-sm rounded-lg p-3" style={{ backgroundColor: C.panel }}>
              {causa.mockIA}
            </div>
            <p className="text-[11px] italic" style={{ color: C.textFaint }}>
              No depende de la etapa real: el warning sale con Math.random() y la sugerencia solo mira si el plazo está urgente.
            </p>
          </div>

          <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: C.card, border: `1px solid ${C.gold}` }}>
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4" style={{ color: C.gold }} />
              <span className="text-sm font-medium" style={{ color: C.gold }}>Derivado del flujo real</span>
            </div>
            <p className="text-xs" style={{ color: C.textMuted }}>Rol {causa.rol} · {causa.mandante}</p>

            {!analisis.reconocida && (
              <div className="flex items-start gap-2 text-sm rounded-lg p-3" style={{ backgroundColor: C.rustSoft, color: C.rust }}>
                <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{analisis.alertas[0]}</span>
              </div>
            )}

            {analisis.reconocida && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <Badge tone={analisis.esTerminal ? "green" : "gold"}>{analisis.nodo!.label}</Badge>
                  <span style={{ color: C.textFaint }}>· grupo {analisis.nodo!.grupo}</span>
                </div>

                {analisis.alertas.map((a, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs rounded-lg p-2" style={{ backgroundColor: C.rustSoft, color: C.rust }}>
                    <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    <span>{a}</span>
                  </div>
                ))}

                {analisis.sugerencias.length > 0 && (
                  <div className="space-y-1.5">
                    {analisis.sugerencias.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm rounded-lg p-2" style={{ backgroundColor: C.panel }}>
                        <ArrowRight className="w-3.5 h-3.5 shrink-0" style={{ color: C.gold }} />
                        <span>{s.accion}</span>
                        <span style={{ color: C.textFaint }}>→ {s.hacia.label}</span>
                        {s.condicion && <Badge tone="gold">{s.condicion}</Badge>}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { describe, it, expect } from "vitest";
import { accionTipoParaSubestado } from "../bandejaReglas";

// ─────────────────────────────────────────────────────────────────────────
// Prueba de caracterización del motor actual de la Bandeja de Trabajo
// (docs/Bandeja_Automatica_Estado_Subestado.md), usando 5 causas reales
// tomadas de CAUSAS_DETALLE en ProcuradorView.tsx (mismo rol y subestadoCRM
// tal como aparecen ahí), cada una con un subestado distinto del árbol
// Estado → Subestado.
//
// Objetivo del documento (sección 1): decidir automáticamente si un
// Subestado implica una tarea para el procurador. Hoy (sección 3) el motor
// es un if/else fijo que solo reconoce 3 patrones ("acompaña documentos",
// "cumple lo ordenado", "solicita fuerza pública"); todo lo demás no genera
// tarea aunque sí requiera acción humana. Esta prueba documenta ese
// comportamiento actual con datos reales, no inventados, para que sirva de
// base de comparación cuando se implemente el motor de reglas configurable
// de la sección 4-5 del documento.
// ─────────────────────────────────────────────────────────────────────────

const CAUSAS_REALES: Array<{ rol: string; estadoCRM: string; subestadoCRM: string }> = [
  { rol: "E-632-2026", estadoCRM: "EXHORTO EN TRAMITACIÓN", subestadoCRM: "PENDIENTE DILIGENCIA" },
  { rol: "C-9708-2025", estadoCRM: "DEMANDA PROVEIDA", subestadoCRM: "DESPÁCHESE MANDAMIENTO" },
  { rol: "C-11260-2025", estadoCRM: "TERMINO DE JUICIO", subestadoCRM: "DACION EN PAGO" },
  { rol: "C-8421-2026", estadoCRM: "DEMANDA PROVEIDA", subestadoCRM: "NOTIFICACIÓN PENDIENTE" },
  { rol: "C-2891-2025", estadoCRM: "REMATE", subestadoCRM: "REMATE FIJADO" },
];

describe("accionTipoParaSubestado — comportamiento actual con causas reales", () => {
  it("cubre 5 causas con subestados distintos entre sí", () => {
    const subestados = new Set(CAUSAS_REALES.map((c) => c.subestadoCRM));
    expect(subestados.size).toBe(CAUSAS_REALES.length);
  });

  // Ninguno de estos 5 subestados matchea hoy los 3 patrones hardcodeados,
  // aunque al menos "DESPÁCHESE MANDAMIENTO" y "NOTIFICACIÓN PENDIENTE"
  // corresponden a trámites activos del flujo (ver flujoCobranza.ts:
  // despachese_mandamiento → notificar_receptor) que en el negocio real sí
  // requieren seguimiento del procurador. Es exactamente la brecha que
  // describe la sección 3 del documento.
  it.each(CAUSAS_REALES)(
    "causa $rol ($subestadoCRM) no genera tarea con el motor hardcodeado actual",
    ({ subestadoCRM }) => {
      expect(accionTipoParaSubestado(subestadoCRM)).toBeUndefined();
    }
  );

  it("sigue reconociendo los 3 patrones ya soportados (regresión)", () => {
    expect(accionTipoParaSubestado("ACOMPAÑA DOCUMENTOS AL TRIBUNAL")).toBe("apercibimiento");
    expect(accionTipoParaSubestado("Cumple lo ordenado")).toBe("previo");
    expect(accionTipoParaSubestado("Solicita fuerza pública")).toBe("fuerza_publica");
  });

  it("es indiferente a mayúsculas/tildes (normalización)", () => {
    expect(accionTipoParaSubestado("acompana documentos al tribunal")).toBe("apercibimiento");
  });

  it("retorna undefined para subestado vacío o nulo", () => {
    expect(accionTipoParaSubestado(null)).toBeUndefined();
    expect(accionTipoParaSubestado(undefined)).toBeUndefined();
    expect(accionTipoParaSubestado("")).toBeUndefined();
  });
});

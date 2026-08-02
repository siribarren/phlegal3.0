// ─────────────────────────────────────────────────────────────────────────
// Reglas de la Bandeja de Trabajo automática (Estado → Subestado → Tarea).
//
// Extraído de ProcuradorView.tsx para poder testear la lógica de matching
// sin depender de React/recharts/lucide (ver docs/Bandeja_Automatica_Estado_Subestado.md).
// Hoy es el `if/else` fijo de 3 patrones que describe la sección 3 de ese
// documento; a futuro debería reemplazarse por una consulta a la tabla de
// configuración `regla_tarea_subestado` propuesta en la sección 4.
// ─────────────────────────────────────────────────────────────────────────

export type AccionTipo = "apercibimiento" | "despachese" | "designacion_martillero" | "fuerza_publica" | "previo" | "consulta";

export function normalizarTexto(s: string): string {
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
export function accionTipoParaSubestado(subestado: string | null | undefined): AccionTipo | undefined {
  if (!subestado) return undefined;
  const n = normalizarTexto(subestado);
  if (n.includes("acompana documentos")) return "apercibimiento";
  if (n.includes("cumple lo ordenado") || n.includes("cumplir lo ordenado")) return "previo";
  if (n.includes("solicita fuerza publica") || n.includes("solicitar fuerza publica")) return "fuerza_publica";
  return undefined;
}

// ─────────────────────────────────────────────────────────────────────────
// Modelo del flujo de cobranza judicial (docs/flujo.pdf → grafo de estados)
//
// El PDF de Phoenix Service describe el proceso completo de un juicio
// ejecutivo de cobranza como una secuencia de estados (nodos) unidos por
// acciones/trámites (aristas), a veces condicionadas a un resultado
// (favorable/desfavorable, positiva/negativa, encontrado/no encontrado).
//
// Este archivo formaliza ese diagrama como datos: cada nodo es una etapa
// real de la causa, cada transición es una acción posible desde esa etapa.
// Sirve como fuente de verdad para sugerir la(s) próxima(s) acción(es) de
// una causa a partir de su etapa actual, en vez de reglas ad-hoc o texto
// aleatorio.
// ─────────────────────────────────────────────────────────────────────────

export type GrupoFlujo =
  | "ingreso"
  | "notificacion"
  | "judicial"
  | "apremio"
  | "embargo_remate"
  | "cierre";

export interface NodoFlujo {
  id: string;
  label: string;
  grupo: GrupoFlujo;
  /** true si la causa puede quedar cerrada al llegar a este nodo */
  esTerminal?: boolean;
}

export interface TransicionFlujo {
  from: string;
  to: string;
  accion: string;
  /** condición que gatilla esta rama, ej. "búsqueda positiva" */
  condicion?: string;
}

export const FLUJO_NODOS: NodoFlujo[] = [
  // Ingreso
  { id: "ingreso_demandas", label: "Ingreso demandas", grupo: "ingreso" },
  { id: "ingreso_tribunal", label: "Ingreso tribunal", grupo: "ingreso" },
  { id: "acompana_doc_digital", label: "Acompaña documentos digital", grupo: "ingreso" },
  { id: "ingreso_doc_fisicos", label: "Ingreso documentos físicos", grupo: "ingreso" },
  { id: "para_proveer", label: "Para proveer", grupo: "ingreso" },
  { id: "no_ha_lugar", label: "No ha lugar", grupo: "ingreso", esTerminal: true },
  { id: "cumple_lo_ordenado", label: "Cumple lo ordenado", grupo: "ingreso" },

  // Notificación
  { id: "despachese_mandamiento", label: "Despáchese mandamiento", grupo: "notificacion" },
  { id: "notificar_receptor", label: "Se encarga notificar al receptor", grupo: "notificacion" },
  { id: "busqueda_positiva", label: "Búsqueda positiva", grupo: "notificacion" },
  { id: "busqueda_negativa", label: "Búsqueda negativa", grupo: "notificacion" },
  { id: "notificada", label: "Notificada", grupo: "notificacion" },
  { id: "sin_domicilio", label: "Sin domicilio", grupo: "notificacion" },
  { id: "incobrable", label: "Incobrable", grupo: "notificacion", esTerminal: true },
  { id: "not_avisos", label: "Notificación por avisos", grupo: "notificacion" },
  { id: "de_oficio_institucional", label: "De oficio institucional", grupo: "notificacion" },

  // Etapa judicial (excepción / sentencia / apelación)
  { id: "excepcion", label: "Excepción", grupo: "judicial" },
  { id: "evacua_traslado", label: "Evacúa traslado", grupo: "judicial" },
  { id: "resolucion", label: "Resolución", grupo: "judicial" },
  { id: "recibe_causa_aprueba", label: "Se recibe la causa, aprueba", grupo: "judicial" },
  { id: "notificar_receptor_sentencia", label: "Notificar al receptor", grupo: "judicial" },
  { id: "cita_oir_sentencia", label: "Cita a oír sentencia", grupo: "judicial" },
  { id: "sentencia", label: "Sentencia", grupo: "judicial" },
  { id: "sentencia_favorable", label: "Sentencia favorable", grupo: "judicial" },
  { id: "sentencia_desfavorable", label: "Sentencia desfavorable", grupo: "judicial" },
  { id: "recurso_apelacion", label: "Recurso de apelación", grupo: "judicial" },
  { id: "apelacion_favorable", label: "Apelación favorable", grupo: "judicial" },
  { id: "apelacion_desfavorable", label: "Apelación desfavorable", grupo: "judicial" },
  { id: "termino_juicio_apelacion", label: "Término de juicio", grupo: "cierre", esTerminal: true },

  // Apremio / embargo / remate
  { id: "cuaderno_apremio", label: "Se va a estado cuaderno de apremio", grupo: "apremio" },
  { id: "senalar_bien_embargo", label: "Señalar bien embargo de vehículo", grupo: "embargo_remate" },
  { id: "resolver_designar_martillero", label: "Resolver designar martillero", grupo: "embargo_remate" },
  { id: "designar", label: "Designar", grupo: "embargo_remate" },
  { id: "previa_certificado", label: "Previa % certificado", grupo: "embargo_remate" },
  { id: "certificado", label: "Certificado", grupo: "embargo_remate" },
  { id: "notificacion_martillero", label: "Notificación martillero", grupo: "embargo_remate" },
  { id: "oficio_autoriza_remate", label: "Oficio autoriza remate", grupo: "embargo_remate" },
  { id: "oposicion_retiro", label: "Oposición retiro", grupo: "embargo_remate" },
  { id: "solicita_fuerza_publica", label: "Solicita fuerza pública retiro", grupo: "embargo_remate" },
  { id: "oficiese", label: "Oficiese", grupo: "embargo_remate" },
  { id: "encarga_incautar", label: "Se encarga a incautar", grupo: "embargo_remate" },
  { id: "no_lo_encuentra", label: "No lo encuentra", grupo: "embargo_remate" },
  { id: "juicio_terminado_no_ubicado", label: "Juicio terminado", grupo: "cierre", esTerminal: true },
  { id: "incautado", label: "Incautado", grupo: "embargo_remate" },
  { id: "martillero_fija_fecha", label: "Martillero fija fecha remate", grupo: "embargo_remate" },
  { id: "martillero_remata", label: "Martillero remata", grupo: "embargo_remate" },
  { id: "martillero_rinde_cuenta", label: "Martillero rinde cuenta", grupo: "embargo_remate" },
  { id: "solicita_cheque", label: "Se solicita cheque", grupo: "embargo_remate" },
  { id: "informe_papito_corazon", label: "Informe papito corazón", grupo: "embargo_remate" },
  { id: "retirar_cheque", label: "Retirar cheque", grupo: "embargo_remate" },
  { id: "termino_juicio_cobro", label: "Término de juicio", grupo: "cierre", esTerminal: true },
];

export const FLUJO_TRANSICIONES: TransicionFlujo[] = [
  { from: "ingreso_demandas", to: "ingreso_tribunal", accion: "Ingresar demanda al tribunal" },
  { from: "ingreso_tribunal", to: "acompana_doc_digital", accion: "Acompañar documentos digitales" },
  { from: "acompana_doc_digital", to: "ingreso_doc_fisicos", accion: "Ingresar documentos físicos" },
  { from: "ingreso_doc_fisicos", to: "para_proveer", accion: "Poner causa para proveer" },
  { from: "para_proveer", to: "no_ha_lugar", accion: "Resolver (tribunal deniega)", condicion: "no ha lugar" },
  { from: "para_proveer", to: "cumple_lo_ordenado", accion: "Resolver (tribunal acoge)", condicion: "cumple lo ordenado" },
  { from: "no_ha_lugar", to: "para_proveer", accion: "Subsanar y reingresar para proveer" },

  { from: "cumple_lo_ordenado", to: "despachese_mandamiento", accion: "Despáchese mandamiento" },
  { from: "despachese_mandamiento", to: "notificar_receptor", accion: "Encargar notificación al receptor" },
  { from: "notificar_receptor", to: "busqueda_positiva", accion: "Registrar resultado de búsqueda", condicion: "búsqueda positiva" },
  { from: "notificar_receptor", to: "busqueda_negativa", accion: "Registrar resultado de búsqueda", condicion: "búsqueda negativa" },
  { from: "busqueda_positiva", to: "notificada", accion: "Notificar" },
  { from: "busqueda_negativa", to: "sin_domicilio", accion: "Certificar sin domicilio" },
  { from: "sin_domicilio", to: "incobrable", accion: "Marcar incobrable" },
  { from: "sin_domicilio", to: "not_avisos", accion: "Notificar por avisos" },
  { from: "sin_domicilio", to: "de_oficio_institucional", accion: "Solicitar notificación de oficio institucional" },
  { from: "de_oficio_institucional", to: "notificar_receptor", accion: "Reintentar notificación al receptor" },
  { from: "not_avisos", to: "notificada", accion: "Dar por notificada (avisos)" },

  { from: "notificada", to: "excepcion", accion: "Deducir/registrar excepción" },
  { from: "notificada", to: "senalar_bien_embargo", accion: "Señalar bien para embargo" },
  { from: "excepcion", to: "evacua_traslado", accion: "Evacuar traslado" },
  { from: "evacua_traslado", to: "resolucion", accion: "Dictar resolución" },
  { from: "resolucion", to: "recibe_causa_aprueba", accion: "Recibir causa a prueba" },
  { from: "recibe_causa_aprueba", to: "notificar_receptor_sentencia", accion: "Notificar al receptor" },
  { from: "notificar_receptor_sentencia", to: "cita_oir_sentencia", accion: "Citar a oír sentencia" },
  { from: "cita_oir_sentencia", to: "sentencia", accion: "Dictar sentencia" },
  { from: "sentencia", to: "sentencia_favorable", accion: "Registrar sentencia", condicion: "favorable" },
  { from: "sentencia", to: "sentencia_desfavorable", accion: "Registrar sentencia", condicion: "desfavorable" },
  { from: "sentencia_favorable", to: "cuaderno_apremio", accion: "Pasar a cuaderno de apremio" },
  { from: "sentencia_desfavorable", to: "recurso_apelacion", accion: "Interponer recurso de apelación" },
  { from: "recurso_apelacion", to: "apelacion_favorable", accion: "Resolver apelación", condicion: "favorable" },
  { from: "recurso_apelacion", to: "apelacion_desfavorable", accion: "Resolver apelación", condicion: "desfavorable" },
  { from: "apelacion_favorable", to: "cuaderno_apremio", accion: "Pasar a cuaderno de apremio" },
  { from: "apelacion_desfavorable", to: "termino_juicio_apelacion", accion: "Dar término de juicio" },

  { from: "cuaderno_apremio", to: "senalar_bien_embargo", accion: "Señalar bien para embargo" },
  { from: "senalar_bien_embargo", to: "resolver_designar_martillero", accion: "Resolver designación de martillero" },
  { from: "resolver_designar_martillero", to: "designar", accion: "Designar martillero" },
  { from: "designar", to: "previa_certificado", accion: "Solicitar certificado previo (%)" },
  { from: "previa_certificado", to: "certificado", accion: "Emitir certificado" },
  { from: "certificado", to: "notificacion_martillero", accion: "Notificar martillero" },
  { from: "notificacion_martillero", to: "oficio_autoriza_remate", accion: "Oficiar autorización de remate" },
  { from: "oficio_autoriza_remate", to: "solicita_fuerza_publica", accion: "Solicitar fuerza pública para retiro" },
  { from: "notificacion_martillero", to: "oposicion_retiro", accion: "Registrar oposición al retiro", condicion: "hay oposición" },
  { from: "oposicion_retiro", to: "solicita_fuerza_publica", accion: "Solicitar fuerza pública para retiro" },
  { from: "solicita_fuerza_publica", to: "oficiese", accion: "Oficiar" },
  { from: "oficiese", to: "encarga_incautar", accion: "Encargar incautación" },
  { from: "encarga_incautar", to: "incautado", accion: "Registrar incautación", condicion: "bien encontrado" },
  { from: "encarga_incautar", to: "no_lo_encuentra", accion: "Registrar resultado", condicion: "bien no encontrado" },
  { from: "no_lo_encuentra", to: "juicio_terminado_no_ubicado", accion: "Dar juicio por terminado" },
  { from: "incautado", to: "martillero_fija_fecha", accion: "Fijar fecha de remate" },
  { from: "martillero_fija_fecha", to: "martillero_remata", accion: "Rematar" },
  { from: "martillero_remata", to: "martillero_rinde_cuenta", accion: "Rendir cuenta" },
  { from: "martillero_rinde_cuenta", to: "solicita_cheque", accion: "Solicitar cheque" },
  { from: "solicita_cheque", to: "informe_papito_corazon", accion: "Emitir informe (papito corazón)" },
  { from: "solicita_cheque", to: "retirar_cheque", accion: "Retirar cheque" },
  { from: "informe_papito_corazon", to: "termino_juicio_cobro", accion: "Dar término de juicio" },
  { from: "retirar_cheque", to: "termino_juicio_cobro", accion: "Dar término de juicio" },
];

// Normaliza texto libre (mayúsculas/acentos/espacios) para poder comparar
// contra los `label` del grafo o contra alias conocidos.
function normalizar(txt: string): string {
  return txt
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim();
}

// Alias: variantes de texto libre que ya existen hoy en `etapa`/`estadoCRM`/
// `subestadoCRM` (ver CAUSAS_DETALLE en ProcuradorView.tsx) y a qué nodo del
// grafo corresponden. Se agregan a mano a medida que se detectan nuevas
// variantes en datos reales — es la capa de mapeo entre "texto libre actual"
// y "estado formal del flujo".
const ALIAS_A_NODO: Record<string, string> = {
  "DESPACHESE MANDAMIENTO": "despachese_mandamiento",
  "DEMANDA PROVEIDA": "cumple_lo_ordenado",
  "EXHORTO EN TRAMITACION": "notificar_receptor",
  "PENDIENTE DILIGENCIA": "notificar_receptor",
  "EXHORTO DILIGENCIADO": "notificada",
  "DEVUELTO CON RESULTADO POSITIVO": "notificada",
  "TERMINO DE JUICIO": "termino_juicio_cobro",
  "DACION EN PAGO": "termino_juicio_cobro",
  "EMBARGO PENDIENTE": "senalar_bien_embargo",
  "PREPARACION REMATE": "designar",
  "REMATE PROGRAMADO": "martillero_fija_fecha",
  "FUERZA PUBLICA": "solicita_fuerza_publica",
};

export function encontrarNodo(etapaLibre: string): NodoFlujo | undefined {
  const norm = normalizar(etapaLibre);
  const aliasId = ALIAS_A_NODO[norm];
  if (aliasId) return FLUJO_NODOS.find((n) => n.id === aliasId);
  return FLUJO_NODOS.find((n) => normalizar(n.label) === norm);
}

export interface SugerenciaAccion {
  accion: string;
  hacia: NodoFlujo;
  condicion?: string;
}

export interface AnalisisFlujoCausa {
  etapaOriginal: string;
  nodo?: NodoFlujo;
  reconocida: boolean;
  esTerminal: boolean;
  sugerencias: SugerenciaAccion[];
  alertas: string[];
}

/**
 * Dado el texto libre de `etapa`/`estadoCRM`/`subestadoCRM` de una causa,
 * determina en qué nodo del flujo real está y qué acciones son válidas
 * desde ahí — reemplaza la sugerencia aleatoria/hardcodeada del modal
 * "Analizar con IA" por una derivada del proceso de negocio real.
 */
export function analizarCausaSegunFlujo(etapaLibre: string): AnalisisFlujoCausa {
  const nodo = encontrarNodo(etapaLibre);
  const alertas: string[] = [];

  if (!nodo) {
    alertas.push(
      `La etapa "${etapaLibre}" no coincide con ningún nodo conocido del flujo. Revisar si es una etapa nueva o un error de tipeo/CRM.`
    );
    return { etapaOriginal: etapaLibre, reconocida: false, esTerminal: false, sugerencias: [], alertas };
  }

  const sugerencias: SugerenciaAccion[] = FLUJO_TRANSICIONES.filter((t) => t.from === nodo.id).map((t) => ({
    accion: t.accion,
    hacia: FLUJO_NODOS.find((n) => n.id === t.to)!,
    condicion: t.condicion,
  }));

  if (nodo.esTerminal) {
    alertas.push("La causa está en un estado terminal del flujo: no debería requerir más acciones salvo cierre administrativo.");
  } else if (sugerencias.length === 0) {
    alertas.push("Nodo reconocido pero sin transiciones definidas en el flujo — revisar el mapa de proceso.");
  }

  return { etapaOriginal: etapaLibre, nodo, reconocida: true, esTerminal: !!nodo.esTerminal, sugerencias, alertas };
}

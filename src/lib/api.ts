// Cliente contra el BFF Procurador propio (server/), no contra la API PJUD
// directamente — ver docs/arquitectura-propuesta.md sección 10. La sesión vive
// en una cookie httpOnly que pone el BFF; el frontend nunca ve el JWT externo.

const BFF_BASE_URL = (import.meta as any).env?.VITE_BFF_BASE_URL || "/bff";

export interface ApiUser {
  email: string;
  nombre: string;
  roles: string[];
  estudioId: number;
}

async function bffFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${BFF_BASE_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...init.headers },
  });
}

export async function login(username: string, password: string): Promise<ApiUser> {
  const res = await bffFetch("/login", { method: "POST", body: JSON.stringify({ username, password }) });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || `Error de login (${res.status})`);
  }
  const data = await res.json();
  return data.user;
}

// Login de cuenta de plataforma (una por procurador, sin credenciales PJUD
// propias) — ver server/src/platformAccounts.js.
export async function loginProcurador(username: string, password: string): Promise<ApiUser> {
  const res = await bffFetch("/procurador-login", { method: "POST", body: JSON.stringify({ username, password }) });
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || `Error de login (${res.status})`);
  }
  const data = await res.json();
  return data.user;
}

export async function logout(): Promise<void> {
  await bffFetch("/logout", { method: "POST" });
}

export async function fetchCurrentUser(): Promise<ApiUser | null> {
  const res = await bffFetch("/session");
  if (!res.ok) return null;
  const data = await res.json();
  return data.user;
}

// ─── Listado de causas (tabla "Mis Causas") ────────────────────────────────

export interface CausaListadoItem {
  causa_id: number;
  semaforo: "VERDE" | "AMARILLO" | "ROJO" | null;
  estado_deudor: string | null;
  rol: string;
  numero_pagare: string | null;
  tribunal_nombre: string;
  cliente_nombre: string | null;
  procurador_nombre: string | null;
  fecha_ingreso: string;
  etapa: string;
}

export interface CausaListadoResponse {
  total: number;
  page: number;
  page_size: number;
  results: CausaListadoItem[];
}

export interface ListadoCausasParams {
  rol?: string | null;
  procuradores?: string[] | null;
  est_adm?: string[] | null;
  proc?: string[] | null;
  page?: number;
  page_size?: number;
}

async function parseOrThrow<T>(res: Response, fallbackMsg: string): Promise<T> {
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.detail || `${fallbackMsg} (${res.status})`);
  }
  return res.json();
}

export async function fetchListadoCausas(params: ListadoCausasParams): Promise<CausaListadoResponse> {
  const res = await bffFetch("/causas", { method: "POST", body: JSON.stringify(params) });
  return parseOrThrow(res, "No fue posible obtener el listado de causas");
}

export interface Procurador {
  id: number;
  estudio_id: number;
  estudio_nombre: string;
  email: string;
  nombre: string;
}

export async function fetchProcuradores(): Promise<Procurador[]> {
  const res = await bffFetch("/procuradores");
  return parseOrThrow(res, "No fue posible obtener los procuradores");
}

// ─── Detalle de causa ───────────────────────────────────────────────────────

export interface TramiteApi {
  id: number;
  folio: string;
  fecha: string;
  etapa: string;
  tramite: string;
  desc_tramite: string;
  documento_url: string | null;
  certificado_url: string | null;
}

export interface LitiganteApi {
  id: number;
  nombre: string;
  rut: string;
  calidad: string;
  tipo: "NATURAL" | "JURIDICA";
}

export interface CuadernoApi {
  id: number;
  causa_id: number;
  nombre: string;
  historia: TramiteApi[];
  litigantes: LitiganteApi[];
}

export interface ExhortoAsociadoApi {
  rol: string;
  fecha_ingreso: string;
  tribunal_nombre: string;
  estado_proc: string | null;
}

export interface CausaWeb {
  id: number;
  rol: string;
  fecha_ingreso: string;
  cliente_id: number | null;
  cliente_nombre: string;
  tribunal_id: number;
  tribunal_nombre: string;
  procurador_id: number | null;
  procurador_nombre: string;
  est_adm: string;
  proc: string;
  ubicacion: string;
  estado_proc: string;
  etapa: string;
  cuadernos: CuadernoApi[];
  causa_origen: { id: number; rol: string; fecha_ingreso: string; tribunal_nombre: string; estado_proc: string } | null;
  exhortos_asociados: ExhortoAsociadoApi[];
  remate_resumen: string | null;
  ebook_url: string | null;
  numero_pagare: string | null;
  estado_causa: string | null;
  estado_crm: string | null;
  subestado_crm: string | null;
  semaforo: "VERDE" | "AMARILLO" | "ROJO" | null;
}

export async function fetchCausaDetalle(causaId: number): Promise<CausaWeb> {
  const res = await bffFetch(`/causas/${causaId}`);
  return parseOrThrow(res, "No fue posible obtener el detalle de la causa");
}

// ─── Home / dashboard ───────────────────────────────────────────────────────

export interface SemaforoBase {
  verde: number;
  amarillo: number;
  rojo: number;
  morado: number;
  sin_gestion: number;
  total: number;
  porcentaje_verde: number;
  porcentaje_amarillo: number;
  porcentaje_rojo: number;
  porcentaje_morado: number;
  porcentaje_sin_gestion: number;
}

export interface HomeResponse {
  tipo: string;
  semaforos: {
    estudio: SemaforoBase;
  };
}

export async function fetchHome(): Promise<HomeResponse> {
  const res = await bffFetch("/home");
  return parseOrThrow(res, "No fue posible obtener el resumen de cartera");
}

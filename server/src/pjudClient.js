// Cliente hacia la API externa "Oficina Virtual PJUD". Es el único módulo del
// BFF que conoce la URL, el shape de auth y los endpoints reales del sistema
// externo — el resto del BFF y todo el frontend trabajan contra el contrato
// propio del BFF (ver routes.js).

const PJUD_API_BASE = process.env.PJUD_API_BASE || "https://web-desarrollo-593970327833.southamerica-west1.run.app/api";

class PjudApiError extends Error {
  constructor(status, body) {
    super(`PJUD API respondió ${status}`);
    this.status = status;
    this.body = body;
  }
}

async function pjudFetch(path, { method = "GET", token, body } = {}) {
  const res = await fetch(`${PJUD_API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;
  if (!res.ok) throw new PjudApiError(res.status, data);
  return data;
}

export async function login(username, password) {
  // {access_token, token_type, expires_in, refresh_token}
  return pjudFetch("/login", { method: "POST", body: { username, password } });
}

export async function refresh(refreshToken) {
  return pjudFetch("/refresh", { method: "POST", body: { refresh_token: refreshToken } });
}

export function fetchListadoCausas(token, params) {
  return pjudFetch("/web_listado_causas", { method: "POST", token, body: params });
}

export function fetchCausaDetalle(token, causaId) {
  return pjudFetch(`/causa/${causaId}`, { token });
}

export function fetchProcuradores(token) {
  return pjudFetch("/procuradores", { token });
}

export function fetchHome(token) {
  return pjudFetch("/home", { token });
}

export { PjudApiError };

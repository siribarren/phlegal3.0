import { Router } from "express";
import * as pjud from "./pjudClient.js";
import { userFromToken } from "./jwt.js";
import {
  createSession,
  getSession,
  updateSessionTokens,
  deleteSession,
  isAccessTokenExpired,
} from "./sessionStore.js";
import { getSharedAccessToken } from "./sharedSession.js";
import { derivarEmailPlataforma, passwordPlataforma } from "./platformAccounts.js";

const SESSION_COOKIE = "phlegal_session";
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 días; el refresh token de PJUD manda el límite real
};

export const router = Router();

router.get("/health", (req, res) => res.json({ ok: true }));

// Adjunta req.session y req.accessToken con un token válido (renovado si hacía
// falta), o responde 401 si no hay sesión / el refresh falló.
async function requireSession(req, res, next) {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const session = sessionId ? await getSession(sessionId) : null;
  if (!session) return res.status(401).json({ detail: "No autenticado" });

  if (session.platform) {
    try {
      req.accessToken = await getSharedAccessToken();
      req.procuradorNombre = session.procuradorNombre;
      return next();
    } catch {
      return res.status(502).json({ detail: "No fue posible conectar con PJUD" });
    }
  }

  if (!isAccessTokenExpired(session)) {
    req.accessToken = session.accessToken;
    return next();
  }

  try {
    const data = await pjud.refresh(session.refreshToken);
    await updateSessionTokens(sessionId, {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    });
    req.accessToken = data.access_token;
    next();
  } catch {
    await deleteSession(sessionId);
    res.clearCookie(SESSION_COOKIE);
    res.status(401).json({ detail: "Sesión expirada" });
  }
}

router.post("/login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(422).json({ detail: "username y password son requeridos" });
  }
  try {
    const data = await pjud.login(username, password);
    const user = userFromToken(data.access_token);
    const sessionId = await createSession({
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
      user,
    });
    res.cookie(SESSION_COOKIE, sessionId, COOKIE_OPTS);
    res.json({ user });
  } catch (err) {
    const status = err.status === 401 || err.status === 422 ? 401 : 502;
    res.status(status).json({ detail: "Correo o contraseña incorrectos." });
  }
});

// Login de cuentas de plataforma (una por procurador, ver
// platformAccounts.js): no pegan contra PJUD con credenciales propias, sino
// que validan contra la clave genérica de plataforma y quedan atadas al
// procurador real cuyo nombre matchea el username derivado. Las causas se
// consultan luego con la sesión compartida (sharedSession.js), filtradas
// server-side por ese procurador — ver requireSession.
router.post("/procurador-login", async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(422).json({ detail: "username y password son requeridos" });
  }
  if (password !== passwordPlataforma()) {
    return res.status(401).json({ detail: "Usuario o contraseña incorrectos." });
  }
  try {
    const sharedToken = await getSharedAccessToken();
    const procuradores = await pjud.fetchProcuradores(sharedToken);
    const emailNormalizado = username.trim().toLowerCase();
    const procurador = procuradores.find(p => derivarEmailPlataforma(p.nombre) === emailNormalizado);
    if (!procurador) {
      return res.status(401).json({ detail: "Usuario o contraseña incorrectos." });
    }
    const user = {
      email: emailNormalizado,
      nombre: procurador.nombre,
      roles: ["procurador"],
      estudioId: procurador.estudio_id,
    };
    const sessionId = await createSession({
      platform: true,
      procuradorNombre: procurador.nombre,
      user,
    });
    res.cookie(SESSION_COOKIE, sessionId, COOKIE_OPTS);
    res.json({ user });
  } catch (err) {
    console.error("procurador-login:", err.status, err.body ?? err.message, err);
    res.status(502).json({ detail: "No fue posible validar la cuenta con PJUD." });
  }
});

router.post("/logout", async (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  if (sessionId) await deleteSession(sessionId);
  res.clearCookie(SESSION_COOKIE);
  res.json({ ok: true });
});

router.get("/session", async (req, res) => {
  const sessionId = req.cookies?.[SESSION_COOKIE];
  const session = sessionId ? await getSession(sessionId) : null;
  if (!session) return res.status(401).json({ detail: "No autenticado" });
  res.json({ user: session.user });
});

router.post("/causas", requireSession, async (req, res) => {
  try {
    // Para cuentas de plataforma el filtro por procurador lo impone el
    // servidor con el nombre de la sesión, ignorando lo que mande el
    // cliente — así el filtro de la UI no puede usarse para ver causas de
    // otro procurador.
    const body = req.procuradorNombre
      ? { ...(req.body ?? {}), procuradores: [req.procuradorNombre] }
      : (req.body ?? {});
    const data = await pjud.fetchListadoCausas(req.accessToken, body);
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando causas" });
  }
});

router.get("/causas/:id", requireSession, async (req, res) => {
  try {
    const data = await pjud.fetchCausaDetalle(req.accessToken, req.params.id);
    if (req.procuradorNombre && data?.procurador_nombre !== req.procuradorNombre) {
      return res.status(404).json({ detail: "Causa no encontrada" });
    }
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando la causa" });
  }
});

router.get("/procuradores", requireSession, async (req, res) => {
  try {
    const data = await pjud.fetchProcuradores(req.accessToken);
    const visibles = req.procuradorNombre ? data.filter(p => p.nombre === req.procuradorNombre) : data;
    res.json(visibles);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando procuradores" });
  }
});

// /home de PJUD solo da el semáforo del estudio completo, sin desglose por
// procurador. Para cuentas de plataforma armamos el semáforo paginando
// /web_listado_causas ya forzado al procurador de la sesión (mismo filtro
// que /causas) y contando por color, en vez de mostrar la cartera de todo
// el estudio.
async function carteraPorProcurador(token, procuradorNombre) {
  const PAGE_SIZE = 200;
  const conteo = { verde: 0, amarillo: 0, rojo: 0, morado: 0, sin_gestion: 0 };
  let page = 1;
  let total = Infinity;
  let acumulado = 0;

  while (acumulado < total) {
    const data = await pjud.fetchListadoCausas(token, { procuradores: [procuradorNombre], page, page_size: PAGE_SIZE });
    total = data.total ?? 0;
    for (const c of data.results ?? []) {
      if (c.semaforo === "VERDE") conteo.verde++;
      else if (c.semaforo === "AMARILLO") conteo.amarillo++;
      else if (c.semaforo === "ROJO") conteo.rojo++;
      else conteo.sin_gestion++;
    }
    acumulado += data.results?.length ?? 0;
    if (!data.results || data.results.length === 0) break;
    page++;
  }

  const totalFinal = conteo.verde + conteo.amarillo + conteo.rojo + conteo.morado + conteo.sin_gestion;
  const pct = n => (totalFinal ? Math.round((n / totalFinal) * 1000) / 10 : 0);
  return {
    tipo: "procurador",
    semaforos: {
      estudio: {
        ...conteo,
        total: totalFinal,
        porcentaje_verde: pct(conteo.verde),
        porcentaje_amarillo: pct(conteo.amarillo),
        porcentaje_rojo: pct(conteo.rojo),
        porcentaje_morado: pct(conteo.morado),
        porcentaje_sin_gestion: pct(conteo.sin_gestion),
      },
    },
  };
}

router.get("/home", requireSession, async (req, res) => {
  try {
    const data = req.procuradorNombre
      ? await carteraPorProcurador(req.accessToken, req.procuradorNombre)
      : await pjud.fetchHome(req.accessToken);
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando el resumen de cartera" });
  }
});

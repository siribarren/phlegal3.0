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
    const data = await pjud.fetchListadoCausas(req.accessToken, req.body ?? {});
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando causas" });
  }
});

router.get("/causas/:id", requireSession, async (req, res) => {
  try {
    const data = await pjud.fetchCausaDetalle(req.accessToken, req.params.id);
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando la causa" });
  }
});

router.get("/procuradores", requireSession, async (req, res) => {
  try {
    const data = await pjud.fetchProcuradores(req.accessToken);
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando procuradores" });
  }
});

router.get("/home", requireSession, async (req, res) => {
  try {
    const data = await pjud.fetchHome(req.accessToken);
    res.json(data);
  } catch (err) {
    res.status(err.status ?? 502).json(err.body ?? { detail: "Error consultando el resumen de cartera" });
  }
});

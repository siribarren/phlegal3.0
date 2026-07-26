// Sesión única contra la API PJUD, autenticada con una cuenta real
// compartida (PJUD_SHARED_USERNAME/PJUD_SHARED_PASSWORD, solo en el
// servidor). La usan las cuentas de plataforma (una por procurador, ver
// platformAccounts.js) para poder listar causas sin que cada procurador
// tenga que tener su propio usuario en PJUD — el filtrado por procurador se
// aplica acá, no en PJUD (ver requireSession en routes.js).

import { redis } from "./redisClient.js";
import * as pjud from "./pjudClient.js";

const SHARED_SESSION_KEY = "phlegal:shared-pjud-session";
let memoryFallback = null;

async function readSharedSession() {
  if (redis) return (await redis.get(SHARED_SESSION_KEY)) ?? null;
  return memoryFallback;
}

async function writeSharedSession(session) {
  if (redis) await redis.set(SHARED_SESSION_KEY, session);
  else memoryFallback = session;
}

function sessionFromLoginData(data) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    accessTokenExpiresAt: Date.now() + data.expires_in * 1000,
  };
}

async function loginShared() {
  const username = process.env.PJUD_SHARED_USERNAME;
  const password = process.env.PJUD_SHARED_PASSWORD;
  if (!username || !password) {
    throw new Error("PJUD_SHARED_USERNAME / PJUD_SHARED_PASSWORD no están configuradas.");
  }
  const data = await pjud.login(username, password);
  const session = sessionFromLoginData(data);
  await writeSharedSession(session);
  return session;
}

// Devuelve un access_token de PJUD válido, logueando o refrescando según
// haga falta. Pensado para llamarse en cada request que lo necesite: el
// resultado ya viene cacheado (Redis) y renovado con margen.
export async function getSharedAccessToken() {
  let session = await readSharedSession();
  if (!session) {
    session = await loginShared();
    return session.accessToken;
  }

  const expiraPronto = Date.now() > session.accessTokenExpiresAt - 30_000;
  if (!expiraPronto) return session.accessToken;

  try {
    const data = await pjud.refresh(session.refreshToken);
    session = sessionFromLoginData(data);
    await writeSharedSession(session);
    return session.accessToken;
  } catch {
    session = await loginShared();
    return session.accessToken;
  }
}

// Store de sesión de usuario final (login directo PJUD o cuenta de
// plataforma). En producción (Vercel) usa Redis — necesario porque las
// funciones serverless no comparten memoria entre instancias ni sobreviven a
// un cold start. En desarrollo local (run.sh, sin credenciales de Redis) cae
// a un Map en memoria.

import { randomUUID } from "node:crypto";
import { redis } from "./redisClient.js";

const SESSION_PREFIX = "phlegal:session:";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 días

const memory = new Map();

async function writeSession(id, session) {
  if (redis) {
    await redis.set(SESSION_PREFIX + id, session, { ex: SESSION_TTL_SECONDS });
  } else {
    memory.set(id, session);
  }
}

// `session` es la forma completa a guardar: para login directo PJUD incluye
// accessToken/refreshToken/accessTokenExpiresAt; para cuentas de plataforma
// incluye { platform: true, procuradorNombre } y el accessToken se resuelve
// en cada request vía sharedSession.js (ver requireSession en routes.js).
export async function createSession(session) {
  const id = randomUUID();
  await writeSession(id, session);
  return id;
}

export async function getSession(id) {
  if (redis) return (await redis.get(SESSION_PREFIX + id)) ?? null;
  return memory.get(id) ?? null;
}

export async function updateSessionTokens(id, { accessToken, refreshToken, expiresIn }) {
  const session = await getSession(id);
  if (!session) return;
  session.accessToken = accessToken;
  if (refreshToken) session.refreshToken = refreshToken;
  session.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
  await writeSession(id, session);
}

export async function deleteSession(id) {
  if (redis) await redis.del(SESSION_PREFIX + id);
  else memory.delete(id);
}

// Margen de 30s para evitar usar un access_token que expira a mitad de request.
export function isAccessTokenExpired(session) {
  return Date.now() > session.accessTokenExpiresAt - 30_000;
}

// Store de sesión. En producción (Vercel) usa Redis vía la integración
// Upstash/KV — necesario porque las funciones serverless no comparten memoria
// entre instancias ni sobreviven a un cold start. En desarrollo local (run.sh,
// sin credenciales de Redis) cae a un Map en memoria, igual que antes.

import { randomUUID } from "node:crypto";
import { Redis } from "@upstash/redis";

const SESSION_PREFIX = "phlegal:session:";
const SESSION_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 días

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

const memory = new Map();

async function writeSession(id, session) {
  if (redis) {
    await redis.set(SESSION_PREFIX + id, session, { ex: SESSION_TTL_SECONDS });
  } else {
    memory.set(id, session);
  }
}

export async function createSession({ accessToken, refreshToken, expiresIn, user }) {
  const id = randomUUID();
  await writeSession(id, {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    user,
  });
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

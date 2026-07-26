// Cliente Redis compartido (Upstash, vía la integración de Vercel). Usado por
// sessionStore.js y sharedSession.js — null si no hay credenciales (dev local
// sin Redis configurado), en cuyo caso cada módulo cae a su propio fallback
// en memoria.

import { Redis } from "@upstash/redis";

const redisUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export const redis = redisUrl && redisToken ? new Redis({ url: redisUrl, token: redisToken }) : null;

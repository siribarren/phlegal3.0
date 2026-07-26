// Store de sesión en memoria. El navegador solo recibe un session_id opaco
// (cookie httpOnly) — los tokens de la API PJUD nunca salen del servidor.
// Nota (sección 10 del doc de arquitectura): reemplazar por Redis antes de
// correr más de una instancia del BFF, porque este Map no se comparte entre
// procesos/réplicas.

import { randomUUID } from "node:crypto";

const sessions = new Map();

export function createSession({ accessToken, refreshToken, expiresIn, user }) {
  const id = randomUUID();
  sessions.set(id, {
    accessToken,
    refreshToken,
    accessTokenExpiresAt: Date.now() + expiresIn * 1000,
    user,
  });
  return id;
}

export function getSession(id) {
  return sessions.get(id) ?? null;
}

export function updateSessionTokens(id, { accessToken, refreshToken, expiresIn }) {
  const session = sessions.get(id);
  if (!session) return;
  session.accessToken = accessToken;
  if (refreshToken) session.refreshToken = refreshToken;
  session.accessTokenExpiresAt = Date.now() + expiresIn * 1000;
}

export function deleteSession(id) {
  sessions.delete(id);
}

// Margen de 30s para evitar usar un access_token que expira a mitad de request.
export function isAccessTokenExpired(session) {
  return Date.now() > session.accessTokenExpiresAt - 30_000;
}

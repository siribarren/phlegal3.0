// Solo lectura de claims del JWT emitido por la API PJUD (no verificación de
// firma: el token llega directo desde esa API sobre TLS, no desde el cliente).

export function decodeJwtPayload(token) {
  const payload = token.split(".")[1];
  const json = Buffer.from(payload, "base64url").toString("utf8");
  return JSON.parse(json);
}

export function userFromToken(token) {
  const payload = decodeJwtPayload(token);
  return {
    email: payload.username ?? payload.sub,
    nombre: payload.nombre,
    roles: payload.roles ?? [],
    estudioId: payload.estudio_id,
  };
}

// Cuentas de plataforma: no existen en PJUD, solo autentican contra este
// servidor. El username se deriva del nombre real del procurador (que
// devuelve /procuradores usando la sesión compartida, ver sharedSession.js),
// así que la lista de cuentas válidas siempre refleja los procuradores
// actuales del estudio sin mantener una tabla aparte.
//
// Nota: si dos procuradores comparten inicial + apellido el username
// colisiona (el primero que matchee gana). Con pocos procuradores es
// improbable; si llega a pasar, hay que desambiguar a mano.

export function derivarUsername(nombreCompleto) {
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "";
  const inicial = partes[0][0];
  const apellido = partes[partes.length - 1];
  return (inicial + apellido)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function passwordPlataforma() {
  return process.env.PLATFORM_ACCOUNT_PASSWORD || "ignis2026";
}

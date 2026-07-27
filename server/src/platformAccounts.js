// Cuentas de plataforma: no existen en PJUD, solo autentican contra este
// servidor. El username se deriva del nombre real del procurador (que
// devuelve /procuradores usando la sesión compartida, ver sharedSession.js),
// así que la lista de cuentas válidas siempre refleja los procuradores
// actuales del estudio sin mantener una tabla aparte.
//
// Nota: si dos procuradores comparten inicial + apellido el username
// colisiona (el primero que matchee gana). Con pocos procuradores es
// improbable; si llega a pasar, hay que desambiguar a mano.

const DOMINIO_PLATAFORMA = "phlegal.cl";

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

export function derivarEmailPlataforma(nombreCompleto) {
  return `${derivarUsername(nombreCompleto)}@${DOMINIO_PLATAFORMA}`;
}

export function passwordPlataforma() {
  return process.env.PLATFORM_ACCOUNT_PASSWORD || "ignis2026";
}

// Excepciones de password por cuenta (username = parte del email antes de
// @phlegal.cl). Cualquier cuenta no listada aquí usa passwordPlataforma().
const PASSWORD_OVERRIDES = {
  rzepeda: process.env.PLATFORM_ACCOUNT_PASSWORD_RZEPEDA,
};

export function passwordParaUsuario(username) {
  return PASSWORD_OVERRIDES[username] || passwordPlataforma();
}

// Cuentas de plataforma "supervisor": no son procuradores reales de PJUD, así
// que no quedan atadas a un procurador y ven la cartera completa del estudio
// (a diferencia de las cuentas normales, ver requireSession en routes.js).
const CUENTAS_SUPERVISOR = [
  { username: "csantander", nombre: "Claudia Santander" },
  { username: "snorambuena", nombre: "Sergio Norambuena" },
];

export function cuentaSupervisor(username) {
  return CUENTAS_SUPERVISOR.find(c => c.username === username) ?? null;
}

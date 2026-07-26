import React, { useState } from "react";
import { Building2, TrendingUp, Scale, Phone, Flame, Lock, Mail, Check, ShieldCheck } from "lucide-react";
import { loginProcurador } from "../lib/api";

export type ProfileId = "mandante" | "abogado_jefe" | "abogado" | "ejecutivo";

export interface Profile {
  id: ProfileId;
  label: string;
  desc: string;
  icon: React.ElementType;
}

export const PROFILES: Profile[] = [
  { id: "mandante", label: "Mandante", desc: "Seguimiento de cartera y reportes", icon: Building2 },
  { id: "abogado_jefe", label: "Abogado Jefe", desc: "Visión ejecutiva e indicadores", icon: TrendingUp },
  { id: "abogado", label: "Abogado / Procurador", desc: "Gestión judicial y procesal", icon: Scale },
  { id: "ejecutivo", label: "Ejecutivo", desc: "Cobranza y gestión comercial", icon: Phone },
];

export interface LoginUser {
  profile: ProfileId;
  email: string;
  nombre?: string;
}

interface DemoAccount {
  profile: ProfileId;
  email: string;
  password: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  { profile: "mandante", email: "mandante@ignis.legal", password: "ignis2026" },
  { profile: "abogado_jefe", email: "jefatura@ignis.legal", password: "ignis2026" },
  { profile: "abogado", email: "abogado@ignis.legal", password: "ignis2026" },
  { profile: "ejecutivo", email: "ejecutivo@ignis.legal", password: "ignis2026" },
];

const PILLARS = [
  { title: "Gestión judicial", text: "Causas, plazos y trámites procesados con asistencia de IA en cada etapa." },
  { title: "Inteligencia de cartera", text: "Proyección de recupero, priorización de casos y métricas en tiempo real." },
  { title: "Trazabilidad", text: "Roles, permisos y auditoría completa para mandantes, abogados y ejecutivos." },
];

export default function Login({ onLogin }: { onLogin: (user: LoginUser) => void }) {
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedAccount = DEMO_ACCOUNTS.find(a => a.profile === profile);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) {
      setError("Selecciona un perfil para continuar.");
      return;
    }
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }

    // El perfil "Abogado / Procurador" se autentica contra la API real (Mis Causas
    // consume datos en vivo). Los demás perfiles siguen usando las cuentas demo.
    if (profile === "abogado") {
      setLoading(true);
      setError(null);
      try {
        const user = await loginProcurador(email.trim(), password);
        onLogin({ profile, email: user.email, nombre: user.nombre });
      } catch (err) {
        setError(err instanceof Error ? err.message : "No fue posible iniciar sesión.");
      } finally {
        setLoading(false);
      }
      return;
    }

    const match = DEMO_ACCOUNTS.find(
      a => a.profile === profile && a.email.toLowerCase() === email.trim().toLowerCase() && a.password === password
    );
    if (!match) {
      setError("Correo o contraseña incorrectos para el perfil seleccionado.");
      return;
    }
    setError(null);
    onLogin({ profile, email: match.email });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,122,26,0.22),_transparent_32%),radial-gradient(circle_at_bottom_left,_rgba(196,39,14,0.24),_transparent_28%),linear-gradient(145deg,_#020617_0%,_#0f172a_45%,_#111827_100%)]" />
        <div className="absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(148,163,184,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.14)_1px,transparent_1px)] [background-size:48px_48px]" />

        <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-10 px-6 py-8 lg:flex-row lg:items-center lg:gap-16 lg:px-10">
          {/* Columna izquierda: marca, slogan y características */}
          <section className="max-w-2xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm text-white/85 backdrop-blur">
              <ShieldCheck className="h-4 w-4" style={{ color: "#FF7A1A" }} />
              Plataforma de Inteligencia Legal
            </div>

            <div className="space-y-4">
              <h1 className="flex items-center gap-3 text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl shadow-lg sm:h-14 sm:w-14"
                  style={{ background: "linear-gradient(135deg, #FF7A1A 0%, #C4270E 100%)" }}
                >
                  <Flame className="h-5 w-5 text-white sm:h-7 sm:w-7" />
                </span>
                Ignis
              </h1>
              <p className="max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Ignis integra gestión judicial, cobranza e inteligencia de datos en un solo lugar,
                entregando a mandantes, abogados y ejecutivos una visión clara y accionable de cada causa.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {PILLARS.map(item => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/12 bg-white/6 p-4 backdrop-blur"
                >
                  <p className="text-sm font-semibold text-white">{item.title}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Columna derecha: login */}
          <section className="w-full max-w-md">
            <div className="rounded-2xl border border-white/10 bg-slate-900/80 shadow-2xl shadow-orange-950/30 backdrop-blur-xl">
              <div className="space-y-6 p-6 sm:p-8">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-2xl ring-1"
                    style={{ backgroundColor: "rgba(255,122,26,0.15)", color: "#FF7A1A", boxShadow: "inset 0 0 0 1px rgba(255,122,26,0.2)" }}
                  >
                    <Flame className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.24em] text-slate-400">Inicio de sesión</p>
                    <h2 className="text-2xl font-semibold">Ingresar</h2>
                  </div>
                </div>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {/* Profile selector */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Perfil</label>
                    <div className="grid grid-cols-2 gap-2.5">
                      {PROFILES.map(p => {
                        const Icon = p.icon;
                        const on = profile === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setProfile(p.id);
                              setError(null);
                            }}
                            className="relative flex flex-col items-start gap-2 rounded-xl border p-3 text-left transition-colors"
                            style={{
                              borderColor: on ? "rgba(255,122,26,0.5)" : "rgba(255,255,255,0.1)",
                              backgroundColor: on ? "rgba(255,122,26,0.1)" : "rgba(255,255,255,0.03)",
                            }}
                          >
                            {on && (
                              <span
                                className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full"
                                style={{ background: "linear-gradient(135deg, #FF7A1A 0%, #C4270E 100%)" }}
                              >
                                <Check className="h-2.5 w-2.5 text-white" />
                              </span>
                            )}
                            <div
                              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                              style={{ backgroundColor: on ? "rgba(255,122,26,0.18)" : "rgba(255,255,255,0.06)" }}
                            >
                              <Icon className="h-4 w-4" style={{ color: on ? "#FF7A1A" : "#94A3B8" }} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold leading-snug text-white">{p.label}</p>
                              <p className="mt-0.5 text-[11px] leading-snug text-slate-400">{p.desc}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">{profile === "abogado" ? "Usuario" : "Correo"}</label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type={profile === "abogado" ? "text" : "email"}
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder={profile === "abogado" ? "usuario" : "correo@ignis.legal"}
                        autoComplete="username"
                        className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/70 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Contraseña</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="h-11 w-full rounded-lg border border-white/10 bg-slate-950/70 pl-10 pr-3 text-sm text-white placeholder:text-slate-500 focus:border-orange-400/60 focus:outline-none focus:ring-1 focus:ring-orange-400/30"
                      />
                    </div>
                  </div>

                  {selectedAccount && profile !== "abogado" && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      Demo: {selectedAccount.email} / {selectedAccount.password}
                    </div>
                  )}

                  {profile === "abogado" && (
                    <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                      Usa el usuario que te asignó tu estudio (ej. iniciales + apellido). Verás solo tus propias causas.
                    </div>
                  )}

                  {error && (
                    <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-11 w-full rounded-lg text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg, #FF7A1A 0%, #C4270E 100%)" }}
                  >
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>
                </form>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
                  Si tienes problemas para acceder, contacta a tu administrador.
                </div>
              </div>
            </div>

            <p className="mt-5 text-center text-[11px] font-mono" style={{ color: "rgba(255,255,255,0.3)" }}>
              Ignis v1.0 · Plataforma de Inteligencia Legal
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}

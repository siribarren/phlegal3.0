import React, { useState } from "react";
import { Building2, TrendingUp, Scale, Phone, Gavel, Lock, Mail, Check } from "lucide-react";

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
}

export default function Login({ onLogin }: { onLogin: (user: LoginUser) => void }) {
  const [profile, setProfile] = useState<ProfileId | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) {
      setError("Selecciona un perfil para continuar.");
      return;
    }
    if (!email || !password) {
      setError("Ingresa tu correo y contraseña.");
      return;
    }
    setError(null);
    onLogin({ profile, email });
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-6" style={{ backgroundColor: "#0B1929" }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: "#1755D4" }}>
            <Gavel className="w-5 h-5 text-white" />
          </div>
          <p className="text-white text-lg font-semibold tracking-tight">PHLegal 3.0</p>
          <p className="text-[12px] font-mono tracking-widest" style={{ color: "rgba(255,255,255,0.35)" }}>CRM JUDICIAL</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-card rounded-2xl border border-border p-6 space-y-5 shadow-xl"
        >
          <div>
            <h2 className="text-sm font-semibold text-foreground">Ingresar</h2>
            <p className="text-[12px] text-muted-foreground mt-0.5">Selecciona tu perfil y accede con tus credenciales.</p>
          </div>

          {/* Profile selector */}
          <div className="grid grid-cols-2 gap-2.5">
            {PROFILES.map(p => {
              const Icon = p.icon;
              const on = profile === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => { setProfile(p.id); setError(null); onLogin({ profile: p.id, email: email || (p.id === "mandante" ? "angelo@mandante.cl" : `demo@${p.id}.cl`) }); }}
                  className="relative flex flex-col items-start gap-2 p-3 rounded-xl border text-left transition-colors"
                  style={{
                    borderColor: on ? "#1755D4" : "var(--border)",
                    backgroundColor: on ? "rgba(23,85,212,0.06)" : "transparent",
                  }}
                >
                  {on && (
                    <span className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center" style={{ backgroundColor: "#1755D4" }}>
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  )}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: on ? "rgba(23,85,212,0.15)" : "var(--muted)" }}
                  >
                    <Icon className="w-4 h-4" style={{ color: on ? "#1755D4" : "var(--muted-foreground)" }} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground leading-snug">{p.label}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-snug">{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Credentials */}
          <div className="space-y-3 pt-1">
            <div className="relative">
              <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="correo@estudio.cl"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/60 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 placeholder:text-muted-foreground text-foreground"
              />
            </div>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Contraseña"
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-muted/60 border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-accent/30 placeholder:text-muted-foreground text-foreground"
              />
            </div>
          </div>

          {error && (
            <p className="text-[12px] text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-accent text-white rounded-lg text-xs font-semibold hover:bg-accent/85 transition-colors"
          >
            Ingresar
          </button>
        </form>

        <p className="text-center text-[11px] font-mono mt-5" style={{ color: "rgba(255,255,255,0.25)" }}>
          CRM Judicial v3.0.0 · PH Legal
        </p>
      </div>
    </div>
  );
}

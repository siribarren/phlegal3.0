#!/bin/bash
# Detiene el frontend y el BFF Procurador iniciados con run.sh.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

stop_pidfile() {
  local pid_file="$1"
  local label="$2"
  if [ ! -f "$pid_file" ]; then
    echo "$label: no hay proceso registrado (no existe $pid_file)."
    return
  fi
  local pid
  pid="$(cat "$pid_file")"
  if kill -0 "$pid" 2>/dev/null; then
    pkill -P "$pid" 2>/dev/null || true
    kill "$pid" 2>/dev/null || true
    echo "$label detenido (PID $pid)."
  else
    echo "$label: el proceso $pid ya no estaba corriendo."
  fi
  rm -f "$pid_file"
}

stop_pidfile ".dev-server.pid" "Frontend"
stop_pidfile ".bff-server.pid" "BFF Procurador"

#!/bin/bash
# Detiene el servidor de desarrollo iniciado con run.sh.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PID_FILE=".dev-server.pid"

if [ ! -f "$PID_FILE" ]; then
  echo "No hay un servidor registrado (no existe $PID_FILE)."
  exit 0
fi

PID="$(cat "$PID_FILE")"

if kill -0 "$PID" 2>/dev/null; then
  # npm run dev crea un proceso hijo (vite); matamos todo el grupo.
  pkill -P "$PID" 2>/dev/null || true
  kill "$PID" 2>/dev/null || true
  echo "Servidor detenido (PID $PID)."
else
  echo "El proceso $PID ya no estaba corriendo."
fi

rm -f "$PID_FILE"

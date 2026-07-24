#!/bin/bash
# Inicia el servidor de desarrollo (vite) en segundo plano.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

PID_FILE=".dev-server.pid"
LOG_FILE=".dev-server.log"
PORT=5176

if [ -f "$PID_FILE" ] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "El servidor ya está corriendo (PID $(cat "$PID_FILE")) en http://localhost:$PORT"
  exit 0
fi

if [ ! -d node_modules ]; then
  echo "Instalando dependencias..."
  npm install
fi

echo "Iniciando servidor de desarrollo..."
nohup npm run dev > "$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"

echo "Servidor iniciado (PID $(cat "$PID_FILE")). Logs en $LOG_FILE"
echo "Disponible en http://localhost:$PORT"

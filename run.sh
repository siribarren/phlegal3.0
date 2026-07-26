#!/bin/bash
# Inicia el BFF Procurador (server/) y el frontend (vite) en segundo plano.
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

BFF_PID_FILE=".bff-server.pid"
BFF_LOG_FILE=".bff-server.log"
BFF_PORT=4001

PID_FILE=".dev-server.pid"
LOG_FILE=".dev-server.log"
PORT=5176

if [ -f "$BFF_PID_FILE" ] && kill -0 "$(cat "$BFF_PID_FILE")" 2>/dev/null; then
  echo "El BFF ya está corriendo (PID $(cat "$BFF_PID_FILE")) en http://localhost:$BFF_PORT"
else
  if [ ! -d server/node_modules ]; then
    echo "Instalando dependencias del BFF..."
    (cd server && npm install)
  fi
  echo "Iniciando BFF Procurador..."
  (cd server && nohup npm start > "$DIR/$BFF_LOG_FILE" 2>&1 &
   echo $! > "$DIR/$BFF_PID_FILE")
  echo "BFF iniciado (PID $(cat "$BFF_PID_FILE")). Logs en $BFF_LOG_FILE"
fi

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

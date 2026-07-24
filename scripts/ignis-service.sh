#!/bin/zsh
# Controla el servicio de Ignis (phlegal3.0) que corre como LaunchAgent de macOS,
# independiente de la terminal o de Claude Code. Siempre en el puerto 5176.

set -euo pipefail

LABEL="cl.phlegal.ignis.dev"
PLIST="$HOME/Library/LaunchAgents/${LABEL}.plist"
UID_GUI="gui/$(id -u)"
URL="http://localhost:5176/"

usage() {
  echo "Uso: $0 {start|stop|restart|status|logs}"
  exit 1
}

case "${1:-}" in
  start)
    launchctl bootstrap "$UID_GUI" "$PLIST" 2>/dev/null || true
    launchctl kickstart -k "${UID_GUI}/${LABEL}"
    echo "Ignis iniciado en $URL"
    ;;
  stop)
    launchctl bootout "${UID_GUI}/${LABEL}" 2>/dev/null || true
    echo "Ignis detenido."
    ;;
  restart)
    launchctl kickstart -k "${UID_GUI}/${LABEL}"
    echo "Ignis reiniciado en $URL"
    ;;
  status)
    launchctl print "${UID_GUI}/${LABEL}" 2>/dev/null | grep -E "state|pid" || echo "No está corriendo."
    ;;
  logs)
    tail -f "$HOME/Library/Logs/Ignis/dev.log"
    ;;
  *)
    usage
    ;;
esac

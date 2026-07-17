# Recomendaciones — pendientes de la vista Mandante

Este documento recoge las sugerencias para los 4 puntos que quedaron **deliberadamente sin implementar** en la reestructuración de `MandanteView.tsx` descrita en `EVALUACION_VII2_DASHBOARD_MANDANTE.md` y `ANALISIS_UX_VISTA_MANDANTE.md`. No son requerimientos triviales de UI: cada uno implica una decisión de alcance o de producto, por eso se documentan antes de tocar código.

---

## 1. Selectores globales de Mandante / Estudio / Cartera

**Sugerencia**: no tocar el `TopBar` compartido (`App.tsx`) — lo usan también los perfiles internos, con un buscador de ROL/RUT que no aplica al mandante. En su lugar, consolidar un único selector de contexto **dentro de `MandanteView`**, justo bajo `HeaderMandante`, que reemplace los 3 filtros de "estudio" que hoy existen sueltos y duplicados (en `RankingEstudios`, `RentabilidadEjecutiva` y `VintageCohortTable`). Ese selector pasaría a ser estado compartido en `MandanteView()` y se propagaría a los componentes de nivel L2.

**Trade-off**: consolidarlo implica refactorizar el filtro local de 3 componentes distintos, pero evita que el gerente vea 3 selectores de "estudio" diferentes y sin relación entre sí en la misma pantalla — que es peor experiencia que no tener selector alguno.

**Esfuerzo estimado**: medio (refactor de estado, no de diseño visual).

---

## 2. Estados de loading / error / sin datos / permisos insuficientes

**Sugerencia**: como la app no tiene backend, priorizar solo el estado que aporta valor hoy: **"filtros sin resultados"** (ya existe parcialmente en `RentabilidadList`; replicable en Ranking y Riesgos cuando un filtro de estudio deje la lista vacía). Loading/skeleton y error de integración recién tienen sentido cuando exista una capa de fetch real — construirlos ahora sería simular un problema que todavía no existe. Sí conviene dejar listos un par de componentes genéricos y reutilizables (`EmptyState`, `ErrorState`) para no tener que diseñarlos de nuevo cuando se conecte a datos reales.

**Trade-off**: implementar loading/error "de mentira" ahora es esfuerzo que se descarta parcialmente en cuanto exista backend real — mejor invertir ese tiempo cuando se defina la integración de datos.

**Esfuerzo estimado**: bajo (para el estado "sin resultados"); no aplica todavía para loading/error real.

---

## 3. Responsive mobile completo

**Sugerencia**, en orden de esfuerzo/impacto:

1. Cambiar los `grid-cols-2` / `grid-cols-3` fijos que aún quedan (Rentabilidad ejecutiva, bloque Dimensión + Comparativa, Gastos judiciales) a variantes responsive (`grid-cols-1 md:grid-cols-2`, etc.). Es mecánico y rápido.
2. El panel de IA es un `aside` de 360px fijo — en mobile necesita convertirse en un drawer o bottom-sheet en vez de ocupar espacio fijo al costado.
3. Decidir si el tab "Análisis detallado" debe ser accesible en mobile o si, tal como pide el spec original ("en móvil mostrar únicamente KPIs, IA y Riesgos"), el tab de detalle se oculta bajo cierto breakpoint y el mobile queda fijo en el resumen ejecutivo. El split L1/L2 ya implementado hace este último punto casi gratuito.

**Trade-off**: el punto 1 no tiene contra real; el punto 2 (IA como drawer) es el que más esfuerzo de implementación requiere.

**Esfuerzo estimado**: bajo (punto 1), medio-alto (punto 2), bajo (punto 3, una vez resuelto el split L1/L2 ya hecho).

---

## 4. Simulador de reglas, Piloto tratamiento/control, Segmentación/scoring y Calidad de Datos

Este es el punto que más depende de una decisión de negocio, no solo de UX.

- **Vintage y Rentabilidad ejecutiva** (ya movidos a "Análisis avanzado" en la reestructuración): tiene sentido que el mandante los siga viendo — es *su propia cartera* vista con más profundidad, coherente con el criterio de "si lo decide, empieza a analizar en detalle".
- **Simulador de reglas de gasto, Piloto tratamiento/control y Segmentación/scoring**: son herramientas de *configuración y tuning* del motor de cobranza, con vocabulario y densidad de analista (ponderadores, grupos de control, probabilidad de pago por segmento). **Sugerencia: ocultarlas para el perfil mandante** — agregarlas al mismo mecanismo que ya usa `HIDDEN_FOR_MANDANTE` en `App.tsx`, o separarlas en una vista distinta accesible solo a perfiles internos. No son insumo de decisión ejecutiva, son herramientas de operación de PHLegal.
- **Calidad de datos**: es gobierno de datos — mismo criterio que el punto anterior, oculto para el mandante, salvo que el banco pida explícitamente visibilidad de esto como parte de transparencia/auditoría contractual.

**Trade-off**: ocultar estos 4 bloques reduce la sensación de "transparencia total del motor de IA" que hoy tiene la demo, pero alinea la vista con el perfil real del usuario (gerente de banco, no analista de cobranza) y con el criterio de aceptación del spec original de mantener la vista limpia y ejecutiva.

**Esfuerzo estimado**: bajo (es principalmente una decisión de scope + ajuste de un `Set` de visibilidad, ya existe el mecanismo en el código).

---

## Resumen de prioridad sugerida

| # | Punto | Esfuerzo | Impacto en cumplimiento del spec |
|---|---|---|---|
| 3.1 | Breakpoints responsive de grillas fijas | Bajo | Medio |
| 4 | Ocultar herramientas de analista al mandante | Bajo | Alto |
| 1 | Selector de estudio consolidado | Medio | Medio |
| 2 | Estados "sin resultados" (resto) | Bajo | Bajo-medio |
| 3.2 | Panel IA como drawer en mobile | Medio-alto | Medio |
| 2 | Loading/error real | N/A hasta backend | — |

Si se quiere avanzar, el orden recomendado es: **3.1 → 4 → 1 → resto**, priorizando lo más barato con mayor impacto en el cumplimiento del criterio de aceptación ("diseño ejecutivo, limpio y orientado a decisiones").

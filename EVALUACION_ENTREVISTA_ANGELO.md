# Evaluación — Vista Mandante vs. entrevista real con el mandante (Ángelo)

## Fuente

`Gambini1.txt`, `Gambini2.txt` y `Gambini3.txt` (Desktop) son la misma entrevista: `Gambini3.txt` es la transcripción cruda línea por línea (1714 líneas); `Gambini1.txt` y `Gambini2.txt` son extractos consolidados en párrafos de esa misma grabación. El entrevistado es **Ángelo**, gerente del mandante (banco) — el mismo nombre que está hardcodeado en el saludo de `HeaderMandante` ("Hola Angelo, acá está el resumen de las gestiones..."), lo que indica que esta entrevista es, con alta probabilidad, la fuente real de la que se derivó el mock data de `MandanteView.tsx` y el propio prompt `VII.2_Dashboard_Mandante.md`.

Esta evaluación compara la vista Mandante contra lo que Ángelo pidió **textualmente**, en vez de contra el spec de diseño ya derivado (`VII.2_Dashboard_Mandante.md`, evaluado en `EVALUACION_VII2_DASHBOARD_MANDANTE.md`).

---

## 1. Lo que la entrevista confirma que SÍ está bien resuelto

| Lo que pidió Ángelo (cita) | Dónde está implementado | Estado |
|---|---|---|
| "SLA judicial... 5 días para que ingrese la demanda, 60 días para que notifique, 90 en regiones, 30 después de embargo, 120 después de incautación... cumplimiento vs SLA con tolerancia" | `SlaPorHito` | Cumple el concepto; los hitos mock (3d/15d/45d/180d) **no calzan** con los tiempos exactos que dio Ángelo — desalineación de parámetros, no de diseño. |
| "El bench se construye del SLA, las palancas de gestión y el recupero" | `RankingEstudios` con score ponderado (SLA 20%, recupero 30%, velocidad 15%, calidad de datos 10%) | Cumple. |
| "Mido en tasa, no en volumen... el tamaño del estudio es irrelevante, porque pago contra recupero variable" | `recuperoPct` (%) en todos los componentes, no monto absoluto | Cumple. |
| "Vintage por camada... a los 3, 6, 12, 18 meses" | `VintageCohortTable`, columnas M0–M18 | Cumple, coincide casi exacto con la temporalidad que describió Ángelo. |
| "Si un estudio me trae 50 gastando 30, y otro me trae 45 gastando 10, prefiero el segundo" | `BulletChartRecuperoCuantia` y `GastosJudiciales` — costo-eficiencia (gasto / recupero) | Cumple, ejemplo casi textual. |
| "Un estudio concentra el recupero al final (remate) vs. otro que lo trae parejo desde el principio (gestión extrajudicial)" | `recuperoPrimerSemestrePct` / criterio "velocidad" en `RankingEstudios` | Cumple. |
| "Las 3 búsquedas negativas para deudas < 8 millones deberían acotarse a 2; las 5 búsquedas para > 20 millones deberían extenderse a 6" | `SimuladorReglasGasto` + `RECOMENDACIONES["busq-neg-8m"]` | Cumple — **coincide casi palabra por palabra**, incluido el monto de $8M usado como ejemplo. |
| "3 grupos según probabilidad de pago extrajudicial: uno que conviene retrasar la asignación judicial, otro que conviene adelantarla, y uno tan malo que ni judicializando se recupera nada" | `SegmentacionScoring` (tramos 0-30d…180d+, con acción sugerida por tramo) | Cumple. |
| "Vamos a pilotear el cambio de reglas de asignación judicial a partir de abril o mayo, con grupos de control" | `PilotoGrupoControl` | Cumple. |
| "No tenemos CRM propio, dependemos de lo que cargan los estudios... hay que detectar cuando un dato está mal" | `CalidadDeDatos` | Cumple parcialmente — ver gap #4 abajo. |
| "Vemos los grandes [números]... no, no, no" (respuesta de Ángelo cuando le preguntan si hace drill-down a un juicio individual) | Confirma con cita textual la decisión ya tomada de sacar el detalle por ROL/nombre de deudor de la vista principal (movido a "Análisis avanzado" en la reestructuración anterior) | Cumple, validado por la fuente real. |

---

## 2. Gaps nuevos que revela la entrevista (no eran tan claros en el spec derivado)

### 2.1 Reglas de gasto por tramo de cuantía, no un umbral único
Ángelo es explícito: *"no puedo gastar lo mismo en una deuda de 5 millones que en una de 20 millones"*. Hoy `GASTO_PARAMETRO_PCT` es un 15% global aplicado a toda la cartera, sin diferenciar por rango de monto. Este gap ya estaba detectado en `EVALUACION_REQUERIMIENTOS.md`, pero ahora hay una cita textual del propio mandante pidiéndolo explícitamente — deja de ser una inferencia de diseño.

### 2.2 Canal de entrega: correo diario automático + vista móvil
Ángelo describe su realidad actual: *"tenemos los paneles en Power BI... se dispara un correo y me llega un panel todos los días"*, y menciona que a veces necesita *"la vista del teléfono porque me estoy moviendo todo el día"*. Esto no es una inferencia de UX — es un requerimiento explícito del propio mandante que el dashboard actual no cubre en absoluto: no hay envío proactivo (correo/notificación) ni una experiencia mobile-first, solo una web app de escritorio.

### 2.3 Costo por juicio individual
Ángelo menciona una métrica que hoy sí puede responder: *"yo por cada ID judicial gasto, no sé, 0,8 pesos"*. El dashboard actual no tiene un KPI aislado de "costo promedio por causa/juicio" — existe costo-eficiencia (gasto/recupero), pero no gasto/causa como indicador propio.

### 2.4 Detección de anomalías, no solo % de completitud
El ejemplo que da Ángelo es específico: *"si un estudio tiene el 80% de contacto y el promedio de los demás es 40%, ese dato está mal"* — es decir, pide **detección estadística de outliers** en el comportamiento reportado por cada estudio, no solo el % de campos completos que mide `CalidadDeDatos` hoy. Es una capa de validación distinta (comportamiento anómalo vs. completitud de datos).

---

## 3. Corrección a una recomendación anterior

En `RECOMENDACIONES_PENDIENTES_VISTA_MANDANTE.md` se sugirió **ocultar** el Simulador de reglas, el Piloto y la Segmentación del perfil mandante, por tratarse de herramientas con densidad de analista.

**La entrevista contradice esa sugerencia.** Ángelo hace una distinción filosófica explícita entre:

- **"Control"** (alertas, semáforos, SLA) — que él mismo llama *"quedarse en la primera capa de la epidermia"*, es decir, insuficiente.
- **"Aporte de valor real"** — que define exactamente como que la IA le proponga cambios a sus reglas de negocio en base al histórico de comportamiento de la cartera: *"eso sería el real aporte... vamos a pilotearlo"*.

Es decir, el Simulador de reglas y el Piloto con grupos de control **no son herramientas de analista que deban ocultarse al mandante — son literalmente lo que él pidió como el valor central de la plataforma**, por encima del control básico (KPIs y semáforos).

**Recomendación revisada**: mantener estos componentes visibles al mandante, pero simplificar su densidad visual (menos ponderadores y decimales expuestos, más lenguaje de "qué pasaría si cambio esta regla") para que sigan siendo legibles a nivel ejecutivo — no sacarlos de su vista.

---

## 4. Conclusión

La reestructuración implementada (L1 resumen ejecutivo / L2 análisis detallado / L3 análisis avanzado) sigue siendo válida en su forma, pero esta entrevista aporta tres ajustes de fondo:

1. **Las reglas de gasto y el simulador deben ser más prominentes, no menos** — son el pedido explícito más repetido de Ángelo durante toda la entrevista, y hoy conservan visibilidad para el mandante en "Análisis avanzado", lo cual es correcto y no debe revertirse.
2. **El canal de entrega (correo diario + móvil) es la brecha más grande y más citada textualmente** — más que cualquier gráfico faltante, es la ausencia más concreta entre lo pedido y lo construido.
3. **Las reglas de gasto por tramo de cuantía y la detección de anomalías en calidad de datos** son dos mejoras puntuales, acotadas, que se pueden priorizar antes que cualquier rediseño mayor de layout.

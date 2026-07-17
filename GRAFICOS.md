# Gráficos de PHLegal 3.0 — Vista Mandante

Este documento explica cada gráfico y visualización de datos presente en la Vista Mandante (`src/app/MandanteView.tsx`), qué información muestra, cómo se interactúa con él y dónde encontrarlo en el código. Todos los gráficos usan [Recharts](https://recharts.org/) y datos simulados con fines demostrativos.

Ubicación en la app:
- **Dashboard** (vista principal del Mandante): KPIs, resumen IA, análisis por dimensión, gastos, ranking, cartera administrada, rentabilidad.
- **Inteligencia de Cartera** (ítem del menú izquierdo): resumen IA repetido, recomendaciones directas y proyección de recupero.

---

## 1. KPIs con sparkline

**Componente:** grid de `KPIS` dentro de `MandanteView` (usa `Sparkline`).

Ocho tarjetas con el valor actual de un indicador (Cartera administrada, Recupero acumulado, Cumplimiento de meta, Costo judicial, Rentabilidad, Cumplimiento SLA, Tiempo promedio de recuperación, Causas activas/críticas). Cada tarjeta incluye:
- El valor actual y su variación (delta) vs. el período anterior.
- Un **sparkline** (mini gráfico de línea sin ejes) con la tendencia de los últimos 6 puntos.
- Un **semáforo** (`kpiEstado`): cada KPI tiene un `objetivo` configurable y un `tipo` ("mayor_mejor" o "menor_mejor"). El estado se calcula como `actual/objetivo` (o su inverso si es "menor_mejor"): **verde** si cumple o supera el objetivo, **amarillo** si está dentro de un 10% de tolerancia, **rojo** si está más lejos. Se muestra como una etiqueta de color junto al objetivo, y una explicación breve de la desviación debajo de la tarjeta (ej. "Bajo el objetivo de SLA (90%), aunque en mejora vs. el período anterior").

El KPI "Cartera administrada" se calcula como la suma de `cuantiaAsignada` de todos los estudios (`CARTERA_ADMINISTRADA_TOTAL`), por lo que siempre coincide con el total mostrado en el gráfico de **Cartera administrada** (sección 3).

---

## 2. Análisis por dimensión (`DimensionPanel`)

Panel central del dashboard con un selector de dimensión (`DimensionTabs`): **Acumulado, Por plazo, Comparativo, Por estudio, Por cuantía, Por estado**. Cada dimensión cambia el tipo de gráfico y los datos mostrados (`DIM_CHART`):

- **Acumulado** — gráfico de área con línea de meta punteada. Muestra el recupero acumulado mes a mes (línea sólida rellena) contra la meta del período (línea gris punteada). Debajo se indica la brecha vs. meta del último mes visible. Tiene además su propio filtro de período (Mes actual / Trimestre actual / Año a la fecha) que recorta cuántos meses se muestran (`sliceByPeriodo`).
- **Por plazo** — gráfico de barras con el % recuperado según la antigüedad de la obligación (0-30d, 31-60d, 61-90d, 91-180d, 180d+). Debajo del gráfico se lista una **recomendación por tramo** (ej. "Punto de decisión: 41% de este segmento paga por vía extrajudicial entre el día 90 y 120 — evaluar retrasar 30 días la asignación judicial"), indicando cuándo conviene adelantar o retrasar la judicialización.
- **Comparativo** — gráfico de barras con el % de recupero de cada estudio, mes actual.
- **Por estudio** — gráfico de barras con el % de recupero por estudio jurídico.
- **Por cuantía** — gráfico de barras con el % recuperado agrupado por tramo de monto reclamado.
- **Por estado** — gráfico de dona (pie) con la distribución de causas por etapa procesal (Notificación, Embargo, Liquidación, Remate, Recupero), con leyenda de colores debajo.

---

## 3. Cartera administrada — distribución por empresa de cobranza (`CarteraAdministradaChart`)

Gráfico de **columnas apiladas**, una columna por mes, donde cada segmento representa la cartera asignada a un estudio de cobranza (PH Legal, Rivas & Asociados, Bufete Andes, Contreras Legal).

Incluye un selector con tres vistas:
- **Mensual** — saldo de cartera bajo gestión al cierre de cada mes (stock). Los saldos mensuales **no se suman entre sí** porque representan el mismo stock en distintos puntos del tiempo.
- **Acumulado** — cartera **nueva asignada** en el período, acumulada mes a mes. A diferencia del stock, este es un flujo (ingreso de nuevos casos) y sí puede sumarse sin duplicar deuda.
- **Saldo actual** — una sola columna con el saldo vigente a la fecha (último mes disponible).

Cada columna tiene una etiqueta con el monto total en su parte superior. Al pasar el mouse sobre una columna, el tooltip muestra, por estudio: monto, % de participación sobre el total de esa columna y variación % vs. el mes anterior. Debajo del gráfico hay una leyenda con el color de cada estudio.

El total de la vista "Mensual"/"Saldo actual" en el último mes coincide con el KPI "Cartera administrada" de la sección 1, ya que ambos se derivan de los mismos montos por estudio.

---

## 4. Gastos judiciales por categoría (`GastosJudiciales`)

Combina dos visualizaciones en una misma tarjeta:
- **Barras de progreso horizontales** por categoría de gasto (Receptores judiciales, Notarios, Conservadores de bienes raíces, Viajes y traslados, Publicaciones, Otros), ordenadas de mayor a menor monto, cada una con su variación % vs. período anterior.
- **Gráfico de área** con la tendencia mensual del gasto judicial total (`GASTOS_TREND`), de febrero a julio.

Debajo, una sección de **eficiencia del gasto por causa** (calculada sobre la muestra de `CASE_PROFIT`, no sobre el 100% de la cartera) con 4 indicadores: gasto de la muestra, gasto **fuera de parámetro** (causas donde el gasto supera el 15% de la cuantía reclamada), gasto con **recupero cero**, y **costo por $1 recuperado**. Debajo se listan las causas con gasto menos eficiente (mayor diferencia entre gasto y recupero).

---

## 5. Ranking de estudios jurídicos (`RankingEstudios`)

Lista ordenable (no es un gráfico de Recharts, pero es la visualización comparativa principal entre estudios). Tiene un selector de criterio de orden:
- **Score consolidado** (vista por defecto) — combina 5 dimensiones con pesos explícitos (`estudioScoreDetalle`): 30% tasa de recupero + 25% recupero neto de gastos + 20% cumplimiento SLA + 15% velocidad de recupero + 10% calidad de la información reportada (`calidadInfoPct`). Cada fila muestra el desglose de las 5 métricas junto al score.
- **Tasa recupero** — ordena por % de recupero total.
- **Velocidad** — ordena por % del recupero concentrado en los primeros 6 meses de gestión (indicador de negociación extrajudicial temprana vs. recupero tardío por remate judicial).

Cada fila es clickeable y dispara un drill-down (banner de filtro) hacia el detalle ejecutivo del estudio seleccionado. Los estudios con más de 25 causas críticas muestran un ícono de alerta.

---

## 6. Recupero por camada — vintage / cohorte (`VintageCohortTable`)

Visualización de cohortes con dos modos, ahora con seguimiento de **M0 a M18** (incluye camadas maduras "Jul 2024" y "Ene 2025" que ya alcanzaron 12 y 18 meses, además de las 6 camadas recientes de 2026):
- **Acumulado** — tabla tipo *heatmap*: filas = camada de originación (mes de ingreso de la cartera), columnas = meses transcurridos desde el ingreso (M0–M18). El color de fondo de cada celda se intensifica según el % recuperado acumulado a esa altura de vida.
- **Comparativo** — gráfico de **barras agrupadas**: eje X = mes transcurrido (M0–M18), una barra de color distinto por cada camada, mostrando cómo evoluciona el % recuperado de cada cohorte en paralelo.

Incluye un filtro de **Estudio** (selección múltiple, chips): al seleccionar uno o más estudios, los valores se ajustan proporcionalmente a su desempeño relativo de recupero — se aclara explícitamente que es una estimación, no una serie histórica de cohortes por estudio (esa granularidad no existe en los datos simulados).

---

## 7. Recupero vs. cuantía por estudio — Bullet Chart (`BulletChartRecuperoCuantia`)

Un **gráfico de bala (bullet chart)** por estudio, construido con barras de progreso HTML (no un chart de Recharts), donde:
- La **barra de color** representa el monto recuperado.
- La **escala completa** de la barra representa la cuantía total asignada al estudio.
- Una **marca vertical** indica la meta de recupero del estudio.
- El color de la barra es verde si el recupero supera la meta, ámbar si está por debajo.
- Debajo de cada barra se indica la brecha en pesos vs. la meta, además de **gasto**, **recupero neto** (recupero − gasto, en verde/rojo) y **costo-eficiencia** (gasto/recupero, menor es mejor) — así un estudio que recupera menos pero gasta proporcionalmente menos puede compararse correctamente contra uno que recupera más gastando desproporcionadamente más.

---

## 8. Comparativa ejecutiva (`ComparativaEjecutiva`)

Panel lateral (no gráfico) con 4 métricas clave (Recupero acumulado, Cumplimiento SLA, Costo judicial, Causas críticas) comparando el valor actual vs. el período anterior, con flecha e indicador de variación % (verde si mejora, rojo si empeora). Cada métrica incluye además una línea de **causa de la variación** (ej. "Menor gasto en receptores judiciales tras ajustar el límite de búsquedas negativas en deudas menores a $8M"), en vez de mostrar solo el número.

---

## 9. Rentabilidad ejecutiva por estudio (`RentabilidadEjecutiva`)

No es un gráfico de Recharts, sino un panel de tarjetas + listas. Cada tarjeta por estudio muestra ahora **tres indicadores separados** en vez de uno solo:
- **Margen neto** — recupero − gasto, en pesos.
- **Rentabilidad / cuantía** — (recupero − gasto) / cuantía, en %.
- **Costo de recupero** — gasto / recupero (menor es mejor).

Además del número de causas analizadas y la cantidad con plazo vencido. Las tarjetas son clickeables y filtran las listas de abajo: **Mayor rentabilidad** y **Menor rentabilidad** (`RentabilidadList`), con el top 5 de causas (`CASE_PROFIT`) según su ratio.

---

## 10. Proyección de recupero (`ProyeccionRecuperoChart`)

Ubicado en la vista **Inteligencia de Cartera**. Gráfico de **líneas** (no de área) sobre los datos mensuales de `PROYECCION_RECUPERO`, con un selector Desde/Hasta para acotar el rango de meses mostrado. Incluye cuatro series, todas del mismo color base salvo las bandas de escenario:

- **Real** (línea continua azul) — meses que ya ocurrieron (Feb–Jun): solo tienen valor real, nunca proyectado.
- **Proyectado** (línea punteada azul) — meses futuros (Jul en adelante, incluyendo el mes en curso): solo tienen valor estimado, nunca un monto real, porque ese mes aún no ha transcurrido.
- **Mes en curso** — el tramo que conecta el último mes real (Jun) con el primer mes proyectado (Jul) se dibuja con un degradado de azul a ámbar y un punto destacado en Jul, para marcar visualmente la transición entre lo ya ocurrido y la proyección.
- **Pesimista** (línea punteada roja) y **Optimista** (línea punteada verde) — dos escenarios alternativos de proyección que divergen desde el mismo punto de partida (Jul): el escenario pesimista crece con una tendencia menor que la proyección base, el optimista con una tendencia mayor.

El tooltip muestra, para cada mes, únicamente los valores de las series que existen ese mes (no mezcla "Real" y "Proyectado" en el mismo mes) y aclara cuando corresponde al mes en curso.

---

## 11. Recomendaciones con evidencia (`RecomendacionesDirectas`)

No es un gráfico sino un panel de tarjetas de recomendación (`RECOMENDACIONES`), cada una trazada a un dato histórico concreto en vez de ser solo una frase estática. Cada tarjeta muestra:
- **Texto de la acción** directa a tomar.
- **Segmento** afectado (ej. "Deudas < $8M", "Bufete Andes y Contreras Legal — SLA en riesgo").
- **Regla actual → regla propuesta**, cuando la recomendación implica cambiar un parámetro de gestión (ej. "3 búsquedas negativas antes de suspender gestión" → "2 búsquedas negativas antes de suspender gestión").
- **Evidencia** — el dato histórico que sustenta la recomendación (ej. "La 3ª búsqueda negativa agregó $18M de gasto en los últimos 12 meses y solo produjo $2M adicionales de recupero").
- **Impacto estimado** cuantificado (ahorro de gasto, recupero neto potencial, riesgo evitado, etc.).
- **Nivel de confianza** (alta/media/baja), con color.
- Botones **Aceptar/Rechazar**: al decidir, la tarjeta queda marcada como aceptada o rechazada (atenuada visualmente si se rechaza).

Se ubica en la vista **Inteligencia de Cartera**, después del resumen IA.

---

## 12. Simulador de reglas de gasto (`SimuladorReglasGasto`)

Panel interactivo (RF-08) en **Inteligencia de Cartera**. Un slider permite simular de 1 a 5 el número de búsquedas negativas permitidas antes de suspender gestión, en el segmento de deudas < $8M. Muestra en paralelo la **regla actual** (3 búsquedas: gasto, recupero y neto) vs. la **simulación** elegida, con los deltas coloreados, más un gráfico de barras comparando gasto y recupero acumulado para cada valor posible de la regla (`SIMULADOR_BUSQUEDAS`).

---

## 13. Reglas de gasto y excepciones (`ReglasDeGasto`)

Panel de control (RF-02/03): define el parámetro de gasto configurado (máximo 15% de la cuantía reclamada) y lista las causas que lo superan (`GASTO_EXCEPCIONES`, derivado de `CASE_PROFIT`). Cada una queda bloqueada por defecto hasta que se **aprueba o rechaza una excepción** con los botones correspondientes.

---

## 14. Segmentación y scoring de probabilidad de pago (`SegmentacionScoring`)

Barras de progreso (RF-11/12) con la probabilidad estimada de pago por vía extrajudicial según antigüedad de la obligación (0-30d a 180d+), coloreadas por rango (verde ≥50%, ámbar 25-49%, rojo <25%), junto a la política de gestión sugerida para cada segmento.

---

## 15. Piloto: grupo tratamiento vs. control (`PilotoGrupoControl`)

Gráfico de barras (RF-13) que compara el gasto promedio por causa antes/después de un piloto, entre un **grupo tratamiento** (aplicó la regla de 2 búsquedas negativas) y un **grupo control** (sin cambios). Incluye una lectura del resultado: el tratamiento redujo el gasto en 29% con una variación menor en recupero, mientras el control se mantuvo estable — confirmando el impacto estimado por el simulador (sección 12).

---

## 16. SLA por hito procesal (`SlaPorHito`)

Lista (RF-15) con SLA configurado de forma independiente por etapa procesal (Primera gestión, Notificación judicial, Traba de embargo, Remate), cada uno con su propio objetivo de días y % de cumplimiento, con el mismo semáforo verde/amarillo/rojo usado en los KPIs (`KPI_ESTADO_INFO`) — en vez de un único SLA agregado.

---

## 17. Calidad de datos por estudio (`CalidadDeDatos`)

Barras de progreso (RF-19/20) con el % de campos completos/consistentes reportado por cada estudio (`calidadInfoPct` en `ESTUDIOS`), más un conteo estimado de campos faltantes e inconsistencias. Los estudios bajo 80% de calidad se marcan con un ícono de alerta, señalando que sus métricas deberían revisarse antes de incorporarlas al score consolidado del ranking (sección 5).

---

## Resumen de tipos de gráfico usados

| Tipo de gráfico       | Dónde se usa |
|------------------------|--------------|
| Área con meta punteada | Análisis por dimensión → Acumulado |
| Barras simples         | Análisis por dimensión (plazo, comparativo, estudios, cuantía), Vintage (modo comparativo) |
| Barras apiladas        | Cartera administrada por empresa de cobranza |
| Barras agrupadas       | Vintage / cohorte (modo comparativo) |
| Dona (pie)             | Análisis por dimensión → Por estado |
| Líneas (real/proyectado/escenarios) | Proyección de recupero |
| Bullet chart (HTML)    | Recupero vs. cuantía por estudio |
| Heatmap (tabla HTML)   | Vintage / cohorte (modo acumulado) |
| Sparkline              | Tarjetas KPI |

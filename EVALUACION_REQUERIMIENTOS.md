# Evaluación de cumplimiento — PHLegal 3.0 vs. requerimientos del mandante (v2)

Esta es una re-evaluación de la vista Mandante contra los mismos requerimientos (RF-01 a RF-24) de la evaluación original, después de las mejoras implementadas en `src/app/MandanteView.tsx`. Compara punto por punto qué cambió y qué nivel de cumplimiento queda hoy.

---

## Evaluación general

El diagnóstico original decía: *"la vista actual se comporta principalmente como un sistema de reportería descriptiva: muestra qué ocurrió"*. Esa brecha central — pasar de describir a **controlar, simular y recomendar** — es la que se atacó en esta ronda.

En términos simples, comparado con la versión anterior:

* **Pasaron de "no cumple" a "cumple parcialmente/alto":** KPI con semáforo, recomendaciones, ranking, vintage, rentabilidad, gastos, bullet chart, comparativa ejecutiva.
* **Pasaron de "no cubierto" a "cumple parcialmente":** reglas de gasto y excepciones, simulador de reglas, segmentación/scoring, pilotos y grupos de control, SLA por hito, calidad de datos.
* **Sigue sin cubrir (fuera del alcance de un dashboard):** canal de entrega (envío automático, móvil, conversacional) — es una decisión de arquitectura de producto, no de gráficos/KPIs.

Importante: todo esto sigue corriendo sobre **datos simulados en el front-end**, sin backend. El semáforo, el scoring, el simulador y las excepciones son mecánicas de UI funcionando sobre mock data — quedan validadas como *diseño de interacción*, pero no como *motor de reglas en producción* (eso requeriría persistencia, un pipeline de datos real y probablemente un modelo predictivo real para el scoring).

---

## Evaluación gráfico por gráfico (actualizada)

| Gráfico o panel | Evaluación anterior | Evaluación actual | Qué cambió |
|---|---|---|---|
| KPI con sparkline | Cumple parcialmente | **Cumple** | Cada KPI tiene `objetivo`, `tipo` (mayor/menor mejor) y semáforo verde/amarillo/rojo explícito (`kpiEstado`), con explicación de la desviación. Resuelve RF-22. |
| Recupero acumulado vs. meta | Cumple | Cumple | Sin cambios; ya cumplía. |
| Recupero por plazo | Cumple parcialmente | **Cumple parcialmente alto** | Cada tramo (0-30d … 180d+) ahora tiene una recomendación explícita de judicializar o mantener gestión extrajudicial. Falta el scoring numérico integrado en el mismo gráfico (ver panel 14, separado). |
| Comparativo/ranking de estudios | Cumple parcialmente | **Cumple parcialmente alto** | Nuevo "Score consolidado" con 5 dimensiones ponderadas (30% tasa, 25% recupero neto, 20% SLA, 15% velocidad, 10% calidad de datos) en vez de un criterio único. Resuelve RF-14/17/18. |
| Recupero por cuantía | Cumple parcialmente | Cumple parcialmente | Sin cambios — sigue sin reglas de gasto diferenciadas por tramo de cuantía (ver panel 13, parcialmente cubierto ahí). |
| Distribución por estado procesal | Complementario | Complementario | Sin cambios. |
| Cartera administrada por empresa | Complementario | Complementario | Se rediseñó como columnas apiladas con vista Mensual/Acumulado/Saldo actual, pero sigue siendo un gráfico de volumen, no de eficiencia — el mandante pidió evaluar por tasa, no por monto. |
| Gastos judiciales por categoría | Cumple parcialmente | **Cumple parcialmente alto** | Se agregaron 4 indicadores (gasto fuera de parámetro, gasto con recupero cero, costo por peso recuperado) y el listado de causas menos eficientes. Cubre gran parte de RF-01 a RF-04. |
| Recupero vs. cuantía (bullet chart) | Cumple parcialmente | **Cumple parcialmente alto** | Ahora muestra gasto, recupero neto y costo-eficiencia por estudio, no solo cuantía/recupero/meta. Resuelve gran parte de RF-05/17. |
| Comparativa ejecutiva | Cumple parcialmente | **Cumple parcialmente alto** | Cada métrica explica ahora la causa de la variación, no solo el delta. |
| Rentabilidad por estudio | Cumple parcialmente alto | **Cumple parcialmente alto** (consolidado) | Se separó en 3 indicadores explícitos: margen neto, rentabilidad/cuantía, costo de recupero — en vez de una sola fórmula mezclada. Resuelve RF-04/05. |
| Proyección de recupero | Complementario | Complementario | Sin cambios en su rol — sigue siendo proyección de tendencia, no simulación de reglas (eso ahora vive en el panel 12, separado). |
| Recomendaciones | No cumple funcionalmente | **Cumple parcialmente alto** | Pasaron de frases estáticas a tarjetas con segmento, evidencia histórica, impacto estimado, nivel de confianza y Aceptar/Rechazar. Resuelve gran parte de RF-07/08/09, salvo que la evidencia sigue siendo mock y no calculada en vivo. |
| **Simulador de reglas de gasto** *(nuevo)* | No cumple (RF-08) | **Cumple parcialmente** | Slider interactivo que compara regla actual vs. propuesta (búsquedas negativas) con gasto/recupero/neto estimado. Es una simulación de un solo parámetro, no un motor general de reglas. |
| **Reglas de gasto y excepciones** *(nuevo)* | No cubierto (RF-02/03) | **Cumple parcialmente** | Regla configurada (gasto máx. 15% de la cuantía) + causas fuera de parámetro bloqueadas hasta aprobar excepción. Falta la configuración de reglas *por tramo de cuantía* (solo hay un umbral global) y la persistencia real de la aprobación. |
| **Segmentación y scoring** *(nuevo)* | No cubierto (RF-11/12) | **Cumple parcialmente** | Probabilidad de pago extrajudicial estimada por tramo de mora, con política sugerida. Es un score fijo por segmento (mock), no un modelo predictivo por causa individual. |
| **Piloto: tratamiento vs. control** *(nuevo)* | No cubierto (RF-13) | **Cumple parcialmente** | Compara gasto antes/después entre ambos grupos y concluye impacto. Es un solo piloto de ejemplo (no un framework para correr y comparar pilotos arbitrarios). |
| **SLA por hito** *(nuevo)* | Parcialmente cubierto (RF-15) | **Cumple parcialmente alto** | SLA independiente por etapa procesal (Primera gestión, Notificación, Embargo, Remate), cada uno con su propio objetivo y semáforo — ya no es un único SLA agregado. Falta la segmentación por región/tolerancias configurables. |
| **Calidad de datos** *(nuevo)* | No cubierto (RF-19/20) | **Cumple parcialmente** | % de completitud por estudio, con alerta si cae bajo 80%, y vínculo explícito con el score del ranking. Es un indicador agregado por estudio, no un detalle campo por campo. |

---

## Matriz de cumplimiento por dominio (actualizada)

| Dominio solicitado | Antes | Ahora |
|---|---|---|
| Vista ejecutiva y grandes números | Alto | **Alto** (+ semáforo) |
| Recupero y cumplimiento de meta | Alto | Alto |
| Comparación entre estudios | Medio-alto | **Alto** (score consolidado) |
| Vintage y cohortes | Medio-alto | **Alto** (M0–M18 + filtro por estudio) |
| Velocidad de recupero | Medio | Medio |
| Gastos judiciales | Medio-bajo | **Medio-alto** |
| Rentabilidad y costo-eficiencia | Medio | **Medio-alto** |
| SLA judiciales | Medio-bajo | **Medio-alto** (por hito) |
| Reglas de negocio | Bajo | **Medio** (simulador + excepciones) |
| Alertas preventivas | Bajo | **Medio** (semáforo KPI + reglas de gasto) |
| Segmentación y scoring | Bajo | **Medio-bajo** (scoring fijo, no predictivo) |
| Pilotos y grupos de control | No cubierto | **Medio-bajo** (un piloto de ejemplo) |
| Recomendaciones basadas en datos | Bajo | **Medio-alto** (evidencia + impacto + confianza) |
| Calidad y gobierno de datos | No cubierto visualmente | **Medio-bajo** (indicador por estudio) |
| Canal de entrega | No demostrado | **No cubierto** (fuera de alcance de este dashboard) |

---

## Qué sigue pendiente, honestamente

1. **Todo sigue siendo mock**: el semáforo, el scoring, las excepciones aprobadas y las decisiones de recomendaciones (Aceptar/Rechazar) viven en el estado de React del navegador — se pierden al refrescar la página. No hay persistencia ni backend.
2. **El scoring de probabilidad de pago es un valor fijo por tramo**, no un modelo entrenado con el histórico real de causas — cumple la *forma* de RF-11/12 pero no la sustancia (no hay aprendizaje ni predicción por causa individual).
3. **El simulador y el piloto cubren un solo caso** (búsquedas negativas en deudas < $8M) como prueba de concepto — no son un framework genérico para simular o pilotar cualquier regla.
4. **Falta configuración real de reglas por tramo de cuantía** — hoy el parámetro de gasto (15%) es global, no diferenciado por rango de deuda como pedía RF-02.
5. **Canal de entrega no abordado** — envío automático, versión móvil e interfaz conversacional requieren infraestructura (cron/job, apps nativas, canal de mensajería) fuera del alcance de este front-end.

---

## Conclusión ejecutiva

La vista pasó de ser **principalmente descriptiva** a incorporar, aunque sea en su forma más simple, las cinco capas que pedía el mandante: **semáforo de excepción, reglas configurables con excepciones aprobables, simulación de cambios, validación con pilotos, y recomendaciones con evidencia e impacto estimado**. Los 15 dominios de la matriz original ya no tienen ningún "No cubierto" salvo el canal de entrega, que es una decisión de plataforma y no de tablero.

La brecha que queda no es de *cobertura de funcionalidades* sino de **profundidad real de los datos**: todo lo nuevo funciona correctamente como interacción de UI sobre datos simulados, pero para que esto sea la "plataforma de control y recomendación" que describía la reunión original, se necesitaría (a) un backend que persista reglas, excepciones y decisiones, (b) un pipeline que calcule el scoring y el histórico de evidencia con datos reales de causas, y (c) el canal de entrega. Ese es el trabajo que sigue después de esta capa de UI/UX.

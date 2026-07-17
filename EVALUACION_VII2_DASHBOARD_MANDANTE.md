# Evaluación — Vista Mandante vs. `VII.2_Dashboard_Mandante.md`

Esta evaluación compara la implementación actual (`src/app/MandanteView.tsx`, más la pestaña separada `InteligenciaCarteraView` y el `TopBar`/`Sidebar` de `App.tsx`) contra el prompt de diseño original del mandante: `VII.2_Dashboard_Mandante.md` (Volumen VII.2 — Prompt Figma Make, Dashboard Mandante).

Es una evaluación distinta y complementaria a `EVALUACION_REQUERIMIENTOS.md`, que compara contra un checklist de requerimientos funcionales (RF-01 a RF-24). Aquí se compara punto por punto contra el prompt de diseño real: layout, componentes, estados y criterios de aceptación.

---

## Resultado por sección del spec

| Sección del spec | Estado | Evidencia |
|---|---|---|
| **Header** (selector Mandante / Estudio / Cartera, período, búsqueda, notificaciones, IA, usuario) | **No cumple** | El `TopBar` (`App.tsx:290`) solo tiene búsqueda, campana de notificaciones y usuario. No hay selector de Mandante, Estudio ni Cartera en el header. El filtro por estudio existe suelto y duplicado dentro de 3 componentes distintos (Ranking, Rentabilidad, Vintage), cada uno con su propio control independiente. |
| **Selector de Período** | **No funcional** | Existe el arreglo `PERIODOS` y el estado `periodo` (`MandanteView.tsx:1516`), pero `setPeriodo` nunca se invoca desde ningún JSX de la vista. No hay ningún botón o selector visible que lo cambie: queda fijo en "Trimestre actual" permanentemente. Es estado muerto. |
| **Hero KPI** (8 cards: Cuantía Asignada, Recupero Acumulado, % Recupero, Brecha Meta, Gasto Judicial, Rentabilidad, SLA, Causas Activas) | **Cumple alto, con desvío** | Los 8 KPIs están presentes, cada uno con semáforo verde/amarillo/rojo, sparkline, delta y tooltip — más completo que lo pedido. Pero 2 KPIs pedidos explícitamente (`% Recupero` y `Brecha Meta`) se fusionaron en una sola card ("Cumplimiento de meta"), y apareció un KPI no solicitado ("Tiempo prom. recuperación") ocupando ese cupo. |
| **Bloque Recupero** (mensual + meta + brecha; filtros mes/trimestre/año + estudio + cartera) | **Cumple parcial** | El gráfico combinado existe (área real + línea de meta + brecha calculada). Pero no tiene selector de período funcional (ver arriba) ni filtro por estudio o cartera en ese bloque específico. |
| **Ranking Estudios** (cards con Recupero, Cumplimiento, Costo promedio, Tiempo recuperación, Rentabilidad; ordenable por cualquier indicador) | **Cumple parcial** | Solo permite ordenar por 3 criterios (score consolidado, tasa, velocidad). No se puede ordenar por "costo promedio", "tiempo de recuperación" ni "rentabilidad" individual — esos datos viven en un componente completamente separado (`RentabilidadEjecutiva`), no integrados al ranking. |
| **Recupero vs. Cuantía (Bullet Chart)** | **Cumple / excede el spec** | Tiene cuantía, recupero, meta y brecha, más gasto y costo-eficiencia por estudio (extra no pedido pero de valor). |
| **Gastos Judiciales** (treemap o barras: receptores, notarios, conservadores, viajes, publicaciones, otros + tendencia) | **Cumple** | Barras horizontales + tendencia mensual en área, con las categorías exactas del spec. |
| **Riesgos** (lista priorizada: SLA en riesgo, causas detenidas, remates próximos, gastos elevados, recupero bajo meta; cada ítem abre vista filtrada) | **No cumple** | No existe este bloque. Los riesgos aparecen mezclados como texto dentro de las tarjetas de "Recomendaciones" (no son una lista priorizada clicable), y esas Recomendaciones ni siquiera están en esta vista: viven en la pestaña separada "Inteligencia de Cartera". |
| **IA Executive Copilot** (panel derecho fijo; debe mostrar resumen ejecutivo, hallazgos, recomendaciones, nivel de confianza, fuente de datos) | **Cumple parcial** | Existe un panel lateral con chat (`IACopilotPanel`), pero responde con texto libre por coincidencia de palabras clave (`answerFor`), sin la estructura pedida (resumen / hallazgos / recomendaciones / confianza / fuente). Tampoco es "permanentemente visible": tiene botón de cierre (X) y al cerrarse queda reducido a un botón flotante (FAB). |
| **Visualización** (KPI, bullet, barras, líneas, heatmap simple, ranking, donut; evitar tablas largas, 3D, exceso de color) | **Cumple parcial, con violación explícita** | Usa los tipos de gráfico correctos y evita 3D y exceso de color. Pero la tabla vintage/cohorte (`VintageCohortTable`, 8 filas × 19 columnas) es exactamente el tipo de "tabla larga" que el spec pide evitar. Además, `RentabilidadList` muestra ROL y nombre del deudor por causa individual — el spec dice explícitamente "no mostrar tablas extensas ni detalles procesales". |
| **Estados** (loading, skeleton, sin datos, error de integración, permisos insuficientes, filtros sin resultados) | **No cumple — 0% implementado** | No hay ningún manejo de estos 6 estados en `MandanteView.tsx`. Toda la vista asume que los datos siempre están disponibles y correctos. |
| **Responsive** (Desktop 1440px, Laptop 1280px, Tablet; en móvil solo KPIs + IA + Riesgos) | **No cumple** | Solo la grilla de KPIs tiene breakpoint (`md:grid-cols-4`). El resto de bloques (`grid-cols-2`, `grid-cols-3`) no colapsan en mobile, y no existe la lógica condicional que en móvil debería mostrar únicamente KPIs, IA y Riesgos. |
| **Componentes**: Export Button, Date Range | **No cumple** | No hay botón de exportar en esta vista. El único "Exportar" del código vive en la vista "Cobranza", que está oculta para el perfil mandante (`HIDDEN_FOR_MANDANTE`). No hay date-range picker; solo tabs de período discretas (mes/trimestre/año) — y esas ni siquiera funcionan (ver arriba). |
| **Componentes**: KPI Card, Trend Card, Ranking Card, Insight Card, AI Card, Risk Card, Filters, Dashboard Tabs | **Cumple parcial** | KPI Card, Ranking Card y AI Card están bien resueltos. No hay un "Risk Card" dedicado (ver Riesgos, arriba). "Dashboard Tabs" existe solo como tabs de dimensión de análisis (`DimensionTabs`), acotado a un gráfico, no como navegación de todo el dashboard. |

---

## Criterios de aceptación — el punto más crítico

- **"Sin scroll inicial en desktop"** → **Falla claramente.** La vista apila cerca de 10 bloques grandes (KPIs, resumen IA, panel de dimensión, comparativa ejecutiva, gastos judiciales, ranking + vintage, cartera administrada, bullet chart, rentabilidad ejecutiva) en una sola columna con scroll continuo. Es lo opuesto al dashboard "todo visible sin scroll" que pide el spec.
- **"Máximo dos clics para llegar a cualquier indicador"** → Se cumple de forma trivial porque casi todo está en la misma página larga (0 clics + scroll), pero eso no es lo que el criterio buscaba resolver.
- **"Jerarquía visual clara"** → Razonable dentro de cada bloque, pero se diluye por la cantidad total de paneles apilados.
- **"IA visible permanentemente"** → Parcial: por defecto está abierta, pero el usuario puede minimizarla, violando la palabra "permanentemente".
- **"Recupero como KPI principal"** → Cumple. Es el KPI más destacado en Hero KPI, en el bloque Recupero y en el resumen de IA.
- **"Comparación inmediata entre estudios"** → Cumple bien: ranking, bullet chart, rentabilidad por estudio y vintage por estudio permiten comparar de inmediato.
- **"Diseño ejecutivo, limpio y orientado a decisiones"** → El spec pide responder 5 preguntas del mandante en menos de 30 segundos, sin tablas extensas ni detalles procesales. La vista actual se lee más como un **panel analítico denso** (con vintage cohort table, simulador de reglas, piloto de tratamiento/control, scoring de segmentación) que como el dashboard ejecutivo minimalista tipo Stripe/Linear/Notion que pedía el prompt original.

### Las 5 preguntas del Perfil (spec, sección "Perfil")

| Pregunta | ¿Se responde en la vista Dashboard Mandante? |
|---|---|
| ¿Cuánto recuperé? | Sí — KPI, bloque Recupero, resumen IA. |
| ¿Qué estudio está rindiendo mejor? | Sí — Ranking de estudios, Rentabilidad ejecutiva. |
| ¿Qué cartera está en riesgo? | Débil — no existe un bloque "Riesgos" dedicado; solo se infiere indirectamente del KPI "causas críticas" y de textos sueltos en Recomendaciones (que además están en otra pestaña). |
| ¿Dónde estoy gastando más? | Sí — Gastos Judiciales por categoría. |
| ¿Qué acciones recomienda la IA? | **No, en esta vista.** Las Recomendaciones (con evidencia, impacto y confianza) están implementadas, pero viven en la pestaña separada "Inteligencia de Cartera", no en el Dashboard Mandante donde el spec las esperaba junto al resto. |

---

## Conclusión

Comparada contra el prompt de diseño real (`VII.2_Dashboard_Mandante.md`), la vista Mandante **no cumple el criterio de aceptación central**: "sin scroll inicial" y "responde en 30 segundos" fallan porque la vista terminó siendo una página larga con paneles de análisis profundo (vintage, simulador de reglas, piloto de tratamiento/control, scoring de segmentación) en lugar del hero dashboard compacto de 8 KPIs + 5 bloques que describe el prompt.

Los componentes individuales suelen tener **más** profundidad analítica que la pedida (score consolidado ponderado, costo-eficiencia, semáforos por KPI y por SLA), pero la vista tiene tres brechas estructurales:

1. **Piezas de layout faltantes o rotas**: selector de período (no funcional), selectores de contexto en el header (Mandante/Estudio/Cartera), bloque de Riesgos, estados de carga/error/vacío, comportamiento responsive real en mobile.
2. **Fragmentación entre pestañas**: las Recomendaciones — una de las 5 preguntas clave del perfil del mandante — quedaron en "Inteligencia de Cartera", una pestaña aparte, en vez de estar en el Dashboard Mandante junto al resto.
3. **Violación de dos prohibiciones explícitas del spec**: tabla larga (vintage cohort de 19 columnas) y detalle procesal por causa (ROL y nombre de deudor visibles en Rentabilidad ejecutiva).

En síntesis: la vista cubre bien la *profundidad de contenido* de cada indicador individual, pero no cumple la *forma* del dashboard ejecutivo de 30 segundos que pedía el mandante — se necesita una revisión de layout y de qué vive en la página principal vs. en pestañas secundarias, más la implementación de las piezas hoy ausentes (Riesgos, período funcional, estados de error/vacío, responsive mobile).

# Análisis de UX — Vista Mandante

## Premisa de este análisis

El mandante es un **gerente**, no un analista. Su modo de uso tiene dos momentos claramente distintos:

1. **Vistazo ejecutivo** (0–30 segundos): abre el dashboard, responde sus 5 preguntas clave sin pensar, sin scrollear, sin interpretar tablas. Si todo está en verde, cierra la sesión.
2. **Análisis en detalle** (opcional, por decisión propia): algo le llamó la atención — un KPI en rojo, un estudio rezagado, un gasto que subió — y **decide** profundizar. Ahí sí tolera tablas, series históricas, simuladores y comparaciones finas.

El problema de fondo de la vista actual no es que falte contenido — sobra, y es bueno. El problema es que **no existen estos dos momentos**: todo vive en una sola página continua, en el mismo nivel visual, con el mismo peso. El gerente no puede "quedarse en el nivel 1"; el scroll lo empuja al nivel 2 y 3 quiera o no.

Este documento clasifica cada componente actual por el nivel de profundidad que le corresponde, y propone cómo separar la interacción en dos (o tres) niveles reales de progressive disclosure.

---

## 1. Diagnóstico: todo vive en un solo nivel

`MandanteView()` (`src/app/MandanteView.tsx:1513`) renderiza, en una sola columna con scroll continuo:

```
HeaderMandante
AISummaryCard
KPIS (8 cards)
DimensionTabs + DimensionPanel        ← analítico
ComparativaEjecutiva                  ← analítico
GastosJudiciales                      ← analítico
RankingEstudios + VintageCohortTable  ← el segundo es claramente L3
CarteraAdministradaChart              ← analítico
BulletChartRecuperoCuantia            ← analítico
RentabilidadEjecutiva (con ROL/deudor por causa)  ← operativo/L3
```

Y en una pestaña separada, `InteligenciaCarteraView()` (`MandanteView.tsx:1861`) agrega:

```
RecomendacionesDirectas   ← esto SÍ es ejecutivo, pero quedó aislado
ProyeccionRecuperoChart
SimuladorReglasGasto      ← herramienta de power user
ReglasDeGasto             ← operación de aprobación, no lectura ejecutiva
SegmentacionScoring       ← modelamiento predictivo
PilotoGrupoControl        ← análisis estadístico A/B
SlaPorHito
CalidadDeDatos            ← gobierno de datos, no decisión de negocio
```

No hay ninguna señal visual, de layout o de interacción que le diga al gerente "hasta acá es lo que necesitas ver siempre; lo que sigue es para cuando quieras indagar". Todo tiene el mismo tamaño de card, el mismo `bg-card rounded-xl border`, la misma tipografía. Jerarquía plana = carga cognitiva alta.

---

## 2. Clasificación de cada componente por nivel de profundidad

| Componente | Nivel real | Por qué |
|---|---|---|
| `HeaderMandante` | **L1** | Saludo + fecha, correcto tal cual. |
| `AISummaryCard` | **L1** | Es exactamente lo que un gerente quiere leer primero: una frase con los 3 números que importan. |
| `KPIS` (8 cards con semáforo) | **L1** | El corazón del vistazo ejecutivo. Bien resuelto individualmente. |
| **Riesgos priorizados** | **L1 — no existe** | Falta el bloque completo. Es una de las 5 preguntas clave ("¿qué cartera está en riesgo?") y hoy no tiene una respuesta directa de un vistazo. |
| `RecomendacionesDirectas` (top 2–3) | **L1** | "¿Qué acciones recomienda la IA?" es pregunta de gerente, no de analista. Hoy está aislada en otra pestaña — error de arquitectura de información, no de contenido. |
| `RankingEstudios` (top 3, colapsado) | **L1 / L2** | El *quién va primero y quién último* es ejecutivo. El detalle de score con 5 ponderadores por estudio es L2. |
| `DimensionPanel` (recupero por plazo/cuantía/estado/comparativo) | **L2** | Útil, pero es "cambiar de lente de análisis" — el gerente lo abre solo si algo del KPI lo intriga. |
| `ComparativaEjecutiva` | **L2** | Explica el *porqué* de una variación — información de seguimiento, no de primer vistazo. |
| `GastosJudiciales` (detalle por categoría + eficiencia por causa) | **L2** (el resumen) / **L3** (el detalle de causas menos eficientes) | El monto total y la categoría top es L1-adyacente; el desglose de causa por causa ya es trabajo de analista. |
| `CarteraAdministradaChart` | **L2** | Distribución por empresa — util para seguimiento, no para la decisión inicial. |
| `BulletChartRecuperoCuantia` | **L2** | Muy bueno como *segunda pantalla* tras el ranking, no como primera. |
| `VintageCohortTable` (19 columnas) | **L3** | Es la tabla larga que el propio spec del mandante pide evitar. Herramienta de análisis de cohortes, no de decisión ejecutiva. |
| `RentabilidadEjecutiva` (con ROL y nombre de deudor) | **L3** | Expone detalle procesal por causa individual — el spec original dice explícitamente "no mostrar detalles procesales". Es trabajo de abogado/analista, no de gerente de banco. |
| `ProyeccionRecuperoChart` | **L2** | Razonable como "qué pasa si sigo así", pero no crítico para el primer vistazo. |
| `SimuladorReglasGasto` | **L3** | Herramienta de configuración/simulación de reglas — uso ocasional, de un analista o del propio equipo de PHLegal, no de un gerente de banco en su revisión mensual. |
| `ReglasDeGasto` (aprobar/rechazar excepciones) | **L3 / fuera de esta vista** | Es un flujo de aprobación operativa, no de lectura. Si el mandante debe aprobar excepciones, merece su propia bandeja de tareas, no vivir mezclado en un dashboard de lectura. |
| `SegmentacionScoring` | **L3** | Modelo predictivo por segmento — insumo para el equipo de estrategia de cobranza, no para la lectura ejecutiva mensual. |
| `PilotoGrupoControl` | **L3** | Análisis estadístico de un piloto A/B — perfil de analista de datos. |
| `SlaPorHito` | **L2** | El semáforo consolidado por hito sí interesa al gerente; el desglose fino por etapa procesal es L2 alto. |
| `CalidadDeDatos` | **L3** | Gobierno de datos — relevante para el equipo que opera la plataforma, no para la decisión de negocio del mandante. |

**Resumen del desbalance**: de ~20 bloques de contenido, hoy **todos están al mismo nivel visual**, pero solo ~6 corresponden genuinamente a L1 (y 2 de esos 6 ni siquiera están en la vista principal). El resto — la mayoría — es L2/L3 mostrado con el mismo peso que un KPI.

---

## 3. Por qué esto es un problema de UX concreto, no solo de gusto

- **Ley de Hick**: más opciones/paneles visibles simultáneamente = más tiempo de decisión. Con 10+ bloques del mismo peso, el ojo no sabe dónde empezar ni dónde puede dejar de mirar.
- **Progressive disclosure violada**: el patrón correcto es mostrar lo esencial primero y revelar detalle solo ante una acción explícita del usuario (clic, expandir, cambiar de tab). Acá el "detalle" ya está expandido por defecto y en el mismo scroll.
- **Costo de scroll como costo de decisión**: cada bloque que el gerente debe scrollear para descartar ("esto no me sirve ahora") es fricción. La vista actual le cobra ese costo aunque el 90% del tiempo no lo necesite.
- **Mezcla de audiencias**: `SimuladorReglasGasto`, `PilotoGrupoControl` y `CalidadDeDatos` son herramientas de trabajo de un equipo de datos/operaciones, con vocabulario y densidad de analista (ponderadores, coeficientes, grupos de control). Ponerlas al lado de un saludo ejecutivo ("Hola Angelo...") rompe el tono y la audiencia de la página.
- **Tabla larga y detalle procesal**: ya señalados en la evaluación de requerimientos — son además, específicamente, las dos cosas que el propio prompt de diseño del mandante pide **evitar**. No es solo una preferencia de UX, es una instrucción explícita incumplida.
- **Sin affordance de "profundizar"**: no hay ningún control tipo "Ver análisis detallado →" que le dé al gerente permiso y control para decidir cuándo pasar de L1 a L2. Hoy la decisión de profundizar la toma el layout (scroll), no el usuario.

---

## 4. Propuesta de reestructuración en dos niveles

### Nivel 1 — "Vistazo ejecutivo" (una sola pantalla, sin scroll, ~5-8 segundos)

Debe caber en el viewport inicial (1440px desktop) sin scroll:

1. `HeaderMandante` (compacto).
2. `AISummaryCard` (1 frase + expandible bajo demanda — ya existe este patrón, es el modelo a copiar en toda la vista).
3. Grilla de **8 KPI cards** con semáforo (tal como está, es el mejor componente de la vista).
4. **Bloque "Riesgos" (nuevo)**: lista de 3-5 ítems priorizados (SLA en riesgo, causas detenidas, recupero bajo meta), cada uno con un link "Ver detalle →" que navega al L2 correspondiente ya filtrado.
5. **Top 2 recomendaciones de IA** (de `RecomendacionesDirectas`, no las 8), con link "Ver todas las recomendaciones →".
6. **Ranking compacto**: solo el top 1 y el estudio en peor posición, con link "Ver ranking completo →".

Todo lo demás **sale de esta pantalla por defecto**.

### Nivel 2 — "Quiero profundizar" (navegación explícita: tabs, acordeones o rutas)

Se activa por acción del usuario, no por scroll pasivo. Puede resolverse con tabs tipo "Recupero | Ranking | Gastos | Riesgos | Recomendaciones" (reutilizando el patrón que ya existe en `DimensionTabs`, pero a nivel de página completa, no solo de un gráfico):

- `DimensionPanel` completo (por plazo, cuantía, estado, comparativo).
- `ComparativaEjecutiva`.
- `GastosJudiciales` (resumen por categoría + tendencia).
- `RankingEstudios` completo con los 3 criterios de orden.
- `CarteraAdministradaChart`.
- `BulletChartRecuperoCuantia`.
- `ProyeccionRecuperoChart`.
- `SlaPorHito`.
- Lista completa de `RecomendacionesDirectas` con evidencia/impacto/confianza.

### Nivel 3 — "Análisis avanzado" (sección aparte, con expectativa explícita de perfil analista)

Puede mantenerse como pestaña separada tipo "Inteligencia de Cartera" — eso ya existe — pero **limpiando su contenido** para que sea coherente con su propio nombre, y **sacando de ahí lo que sí es L1** (recomendaciones):

- `VintageCohortTable` (con advertencia clara de que es vista analítica).
- `RentabilidadEjecutiva` — y evaluar si el detalle por ROL/deudor debe existir en la vista del mandante en absoluto, dado que el spec original lo prohíbe explícitamente. Si se mantiene, que sea aquí, nunca en L1/L2.
- `SimuladorReglasGasto`.
- `SegmentacionScoring`.
- `PilotoGrupoControl`.
- `CalidadDeDatos`.
- `ReglasDeGasto` — considerar si esto no merece ser una bandeja de tareas/aprobaciones aparte del dashboard de lectura (es una acción, no una lectura).

---

## 5. Patrones de interacción recomendados para la transición L1 → L2 → L3

1. **Expandir en el lugar** (ya usado en `AISummaryCard` con `AccordionToggle`): copiar este patrón para KPIs y Riesgos — un clic revela más contexto sin cambiar de pantalla.
2. **"Ver más →" con navegación a tab/sección**: para bloques completos (Ranking, Gastos, Recomendaciones), el link debe llevar al usuario directo al L2 correspondiente, ya filtrado por lo que motivó el interés (ej. clic en "SLA en riesgo" del bloque Riesgos abre el Ranking filtrado a los estudios con SLA bajo).
3. **Tabs de nivel de página**, no solo de gráfico: hoy `DimensionTabs` cambia el gráfico dentro de un card; se necesita un nivel de tabs superior que cambie qué *conjunto de bloques* se muestra (Resumen ejecutivo / Análisis detallado / Análisis avanzado).
4. **Nunca ocultar el KPI y el semáforo** al navegar a L2/L3 — el gerente debe poder volver a ver "estoy en verde o en rojo" sin perder el hilo, aunque esté mirando el detalle.

---

## 6. Qué SÍ está bien resuelto (para no perderlo en el rediseño)

- El patrón de `AISummaryCard`: resumen corto + expandir bajo demanda es exactamente el patrón de progressive disclosure que falta replicar en el resto de la vista.
- Los semáforos de KPI (`kpiEstado`) con objetivo explícito — el gerente entiende "verde/amarillo/rojo" sin leer números.
- El bullet chart y el ranking como mecanismos de comparación inmediata entre estudios — la lógica de comparación es sólida, solo está mal ubicada en la jerarquía de la página.
- Las recomendaciones con evidencia + impacto + confianza son un buen contenido — el problema es dónde viven, no cómo están escritas.

---

## 7. Resumen priorizado de cambios

| Prioridad | Cambio | Por qué primero |
|---|---|---|
| 1 | Definir el corte L1/L2 explícito (qué vive "siempre visible" vs. detrás de un clic) | Sin esto, cualquier otro cambio se vuelve a diluir en la misma página larga. |
| 2 | Mover el Top 2-3 de `RecomendacionesDirectas` y un resumen de `RankingEstudios` al nivel 1, junto a los KPIs | Resuelve 2 de las 5 preguntas clave que hoy no tienen respuesta directa de un vistazo. |
| 3 | Construir el bloque "Riesgos" que falta | Es la pregunta pendiente del perfil del mandante ("¿qué cartera está en riesgo?"). |
| 4 | Sacar `VintageCohortTable` y el detalle por causa de `RentabilidadEjecutiva` de la vista principal | Elimina las dos violaciones explícitas del spec (tabla larga, detalle procesal). |
| 5 | Reordenar el resto de bloques bajo un sistema de tabs de página (L2) en vez de scroll continuo | Convierte "profundizar" en una decisión activa del gerente, no un efecto pasivo del scroll. |
| 6 | Revisar si `SimuladorReglasGasto`, `PilotoGrupoControl`, `SegmentacionScoring` y `CalidadDeDatos` deben seguir en una vista dirigida al mandante, o migrar a una vista interna de PHLegal | Son herramientas de trabajo de un analista de cobranza, no de lectura ejecutiva de un banco. |

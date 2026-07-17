# Documento de Requerimientos
## Vista de Abogado/Procurador — Gestión Diaria de Causas

**Fuente:** Análisis de 3 transcripciones de reunión de definición funcional (Abogado1.txt, Abogado2.txt, Abogado3.txt — corresponden a la misma sesión de trabajo, con distinto nivel de detalle de transcripción).
**Participantes identificados:** Jorge (product owner / negocio), Sergio (jefatura), Romina (procuradora — usuaria referencia), Claudia (mención como rol abogado/jefatura), Matías, Ramiro (comercial).

---

## 1. Contexto y motivación

El estudio jurídico gestiona actualmente una cartera masiva de causas judiciales (se mencionan ejemplos de ~770 causas por procurador y objetivos de escalar a 5.000–10.000 causas por persona). El proceso actual depende en gran medida de revisión manual, caso por caso, dentro del sistema tradicional de tramitación (similar al Poder Judicial).

El objetivo del proyecto es construir una **plataforma de gestión (workflow) orientada a acciones masivas**, potenciada por IA, que permita a cada procurador/abogado:

- Ver en un único panel **todo lo que tiene pendiente de gestionar** (no tener que "acordarse" de nada).
- Agrupar causas con la misma acción pendiente y **resolverlas de forma masiva** en lugar de una por una.
- Delegar en la IA la lectura de documentos, la propuesta de la acción a seguir y la generación de escritos, dejando al procurador solo la **validación (visación)**.
- Reducir la dependencia de crecimiento en dotación (headcount) para poder escalar el volumen de causas gestionadas ("crecer en negocio, no en personas").

Existe además una visión comercial: la herramienta se busca **vender a otros estudios jurídicos** (mencionado explícitamente por Jorge, "para que Ramiro se la ofrezca a otro estudio"), por lo que debe ser genérica, simple y configurable por reglas de negocio, sin personalizaciones ad-hoc.

---

## 2. Objetivos del producto

1. Centralizar en **una sola vista** todas las tareas/novedades que un procurador debe gestionar en su cartera.
2. Habilitar la **gestión masiva** (bulk actions) de causas agrupadas por criterios comunes (tipo de acción, tribunal, cuantía, si tiene o no exhorto, etc.).
3. Automatizar la **generación de escritos** judiciales a partir de reglas de negocio y datos ya cargados en el sistema, dejando la validación humana como único paso manual.
4. Dar visibilidad de **cumplimiento (SLA)** mediante un sistema de semáforo/estado, tanto a nivel individual (procurador) como a nivel de jefatura.
5. Mantener trazabilidad completa (historial de observaciones/comentarios) de cada causa.
6. Que la meta operativa diaria del procurador sea **dejar el panel en cero** (bandeja vacía).
7. Que la solución sea **genérica y comercializable**, sin lógica específica de un solo cliente/estudio.

---

## 3. Roles / Usuarios

| Rol | Descripción | Necesidades principales |
|---|---|---|
| **Procurador / Abogado** (ej. Romina) | Usuario operativo que gestiona la cartera de causas día a día | Ver su bandeja de pendientes, ejecutar acciones masivas, visar propuestas de la IA, consultar historial de una causa puntual |
| **Jefatura** (ej. Sergio / Claudia) | Supervisa desviaciones, prioriza y hace seguimiento de la cartera de todo el equipo | Ver estado global del equipo, detectar casos "fuera de estándar" (rojo), dejar novedades/instrucciones a un procurador sobre un caso puntual, hacer seguimiento de respuestas |
| **Comercial** (mención: Ramiro) | Vende la solución a otros estudios jurídicos | Necesita que la herramienta sea genérica, simple de explicar y configurable por reglas de negocio |

---

## 4. Alcance funcional

### 4.1 Panel principal — "Workflow" / Bandeja de gestión

Vista central y por defecto del procurador. Debe cumplir:

- Listar **todas las causas/acciones pendientes** de la cartera del usuario, sin que el usuario tenga que recordarlas o buscarlas manualmente ("entra aquí automáticamente por default").
- Cada ítem del listado representa una **acción pendiente** sobre una causa (no la causa completa), por ejemplo:
  - Apercibimiento (poder o título) → acompañar documentos.
  - Demanda proveída → despáchese / encargar receptor.
  - Curso progresivo recibido.
  - Oposición al retiro registrada → solicitar fuerza pública.
  - Novedad de jefatura sobre un caso puntual.
- El objetivo operativo del día es **dejar la bandeja en cero**.
- Se debe conservar la opción de **filtrar** por: estado (semáforo), tribunal, tipo de acción, cuantía, si tiene o no exhorto, y por búsqueda libre de un proceso/rol específico (funcionalidad que ya existe hoy y debe mantenerse).
- Se debe poder ver "toda la cartera" (no solo pendientes) cuando el usuario lo requiera.
- Ítems resueltos **desaparecen automáticamente** del workflow al completarse la acción o el checklist asociado.

**Columnas / datos relevantes sugeridos para la vista masiva (a definir con el equipo, mencionados en la reunión):**
- Tribunal (de origen y, si corresponde, tribunal exhortado).
- Indicador de exhorto (sí/no).
- Cuantía / tipo de cuantía.
- Rol de la causa (ROL).
- Estado / semáforo.
- Acción propuesta.
- Plazo asociado (si la acción tiene plazo, ej. apercibimiento).

### 4.2 Sistema de semáforo / estados (SLA)

Se define un indicador de cumplimiento por causa y agregado a nivel de cartera, con **naming pensado para venta comercial** (evitar el término "rojo" tal cual, aunque internamente se use lógica de color):

| Color interno | Nombre propuesto (comercial) | Significado |
|---|---|---|
| Verde | **Dentro de estándar** | Causa gestionada correctamente / dentro de plazo |
| Amarillo | **Límite de estándar** ("al borde de pasar a rojo") | Verde en riesgo de incumplir; transición **unidireccional** (solo puede empeorar hacia el estado crítico, no hay caso que "mejore" pasando por amarillo) |
| Rojo | **Fuera de estándar** | Incumplimiento — se define como una situación grave, ya que en el modelo objetivo *no debiera existir*: si aparece, o bien corresponde reasignar la causa (falta de gestión posible por terceros: falta de receptor en una zona, búsqueda negativa agotada, etc.) o corresponde desasignar temporalmente al procurador porque no tiene ninguna acción posible sobre ese caso |

Requerimientos asociados:

- Mostrar el **% de causas dentro de estándar** por procurador (ejemplo mencionado: 770 causas, 80% en estándar).
- Comparar el desempeño del procurador contra la **media del equipo** (ej. "vas 3% mejor/peor que la media").
- Permitir a la jefatura **desasignar temporalmente** una causa de un procurador cuando este no tiene ninguna incidencia posible sobre ella (ej. falta de receptor, dato inexistente), dejándola en un "bolsón" para gestión distinta (ej. negociación con cliente).
- Cuando una causa fuera de estándar (rojo) corresponde a responsabilidad de terceros, se debe poder marcar y tratar de forma distinta a las que son responsabilidad del propio equipo.

### 4.3 Novedades y ficha de causa individual

Al ingresar al detalle de una causa (rol específico) se requiere:

- Vista completa de todos los datos actuales de la causa (ya existente, se mantiene).
- **Historial de comentarios/observaciones** de la causa (a modo de bitácora), con fecha y autor (ej. observación dejada por un procurador, consultada luego por jefatura).
- Posibilidad de que la **jefatura deje una novedad/consulta** sobre una causa puntual dirigida a un procurador (ej. "¿por qué este caso está detenido?").
  - Esa novedad debe **aparecer automáticamente en el workflow** del procurador correspondiente.
  - El procurador debe poder **responder la novedad** (acción tipo "responder consulta"), completando datos si es necesario.
  - La respuesta debe **notificar automáticamente a la jefatura**.
  - Todo el intercambio debe quedar registrado en el **historial de la causa**.
  - Se debe poder trackear el estado de estas novedades (ej. "respondido" / "no respondido") para poder generar métricas o sugerencias futuras a la herramienta.

### 4.4 Gestión y acciones masivas

Es el núcleo funcional del producto ("la clave de esto es la masividad"):

- Selección múltiple de causas (ej. selección de rangos o por filtro: "seleccionar del 1 al 40", "todas las que no tengan exhorto", etc.), similar a la lógica de selección de filas de una planilla tipo Excel.
- Posibilidad de **agrupar** causas por: estado, subestado, tipo de acción, tribunal, cuantía, presencia/ausencia de exhorto, y ejecutar sobre el grupo completo la **misma acción** en un solo paso.
- Ejecución de acciones masivas típicas mencionadas:
  - **Visación masiva de documentos** generados por la IA (aprobar/rechazar en bloque, o uno por uno dentro del bloque si se requiere).
  - **Asignación de receptor**: selección de causas → botón de acción → "asignación receptor" → selección desde nómina de receptores (por comuna/zona, ej. Santiago vs. regiones) → generación automática de **ficha estándar** con los datos requeridos (patente, tribunal, etc.) → envío automático por correo al receptor (con copia al procurador) → las causas gestionadas desaparecen del workflow y cambian de estado (semáforo) automáticamente.
  - **Solicitud de fuerza pública** de forma masiva (identificado como un caso simple/estándar de automatizar, ya que su lógica depende principalmente de si la causa tiene o no exhorto).
- Cada acción ejecutada debe reflejarse en la ficha de la causa (registro en historial) y actualizar automáticamente el estado/semáforo correspondiente.

### 4.5 Generación de escritos (individual y masiva)

- Botón/panel de **"Generar escrito"** (ubicación sugerida: parte superior derecha del panel), que despliega el listado de tipos de escrito disponibles asociados a la causa.
- El usuario selecciona el tipo de escrito y luego los casos sobre los que aplicarlo (o viceversa).
- Existen dos niveles de complejidad identificados para la generación de escritos:
  1. **Escritos estándar / masivos** (ej. solicitud de fuerza pública, exhorto para retiro): la lógica de negocio depende de pocas variables (ej. si tiene o no exhorto) y puede resolverse con reglas simples — cubre el "80% de los casos" (enfoque 80/20).
  2. **Escritos complejos** (ej. respuesta a un "previo a proveer"): requieren cruzar información de distintos documentos ya cargados en el sistema (demanda, pagaré, cartola, saldo insoluto) y, en algunos casos, realizar **cálculos** (ej. liquidación anticipada de deuda, descuento de intereses, determinación de saldo capital insoluto). Estos casos requieren definir reglas de negocio específicas por tipo de "previo" y, eventualmente, por tribunal (la respuesta puede variar según el tribunal).
- Para escritos que requieren datos adicionales no disponibles automáticamente (ej. domicilio alternativo cuando el domicilio original resulta "negativo"), el sistema debe permitir **completar manualmente los datos faltantes** antes de generar el escrito definitivo.
- Todo escrito generado por IA debe pasar por una etapa de **visación humana** (el procurador puede aceptar tal cual o editar/corregir el contenido propuesto antes de enviarlo) — el sistema **nunca ejecuta la presentación de forma 100% autónoma sin validación**.
- El sistema debe poder ir "aprendiendo" de las correcciones realizadas por el procurador para refinar futuras propuestas (mencionado como mejora esperada, no como requerimiento cerrado).

### 4.6 Confección masiva de demandas (ingreso inicial)

- El procurador debe poder **cargar un Excel** (con formato predefinido por el sistema) con el listado de casos a demandar, adjuntando los respaldos de cada caso (pagaré, cartola, saldo, mandato si corresponde).
- La IA debe **leer los documentos adjuntos y completar automáticamente los campos de la demanda** (según el tipo de demanda que corresponda entre los formatos existentes — se mencionan ~48 formatos distintos, determinados por el tipo de pagaré, existencia de aval/representante legal, mandato, etc., aunque la estructura conceptual de bloques/párrafos de la demanda es única).
- El procurador debe poder **revisar y visar cada demanda generada de forma individual** antes de la validación final (no se asume aprobación automática en este paso, dado el riesgo de "carry-over" de errores entre demandas masivas — ej. arrastre de comuna/jurisdicción incorrecta entre casos).
- **Validaciones de consistencia** antes de subir al Poder Judicial (funcionalidad aún no construida a la fecha de la reunión): por ejemplo, verificar que el rol/nombre asociado a la demanda corresponda al archivo que se está subiendo, evitando subidas masivas erróneas ("cascada de errores").
- Ya existe (y debe mantenerse) la funcionalidad de **carga masiva de patrocinios**.
- Se identifican al menos dos hitos secuenciales del proceso de demanda:
  1. Confección y presentación de la demanda.
  2. Acompañamiento de documentos / curso progresivo (para que el tribunal provea la demanda).

### 4.7 Vencimientos críticos / Calendario

- Debe existir una vista o sección de **"vencimientos de la semana"**, complementaria al calendario general ya existente en la plataforma (mirada más global).
- Debe priorizar/resaltar los **plazos críticos e impostergables** (aquellos que no admiten gestión posterior sin consecuencia grave), por ejemplo:
  - Evacuar traslado dentro de plazo de excepción.
  - Plazo para que una demanda no se tenga por no presentada (apercibimiento vencido).
- Regla de negocio: si el vencimiento cae en **sábado o domingo**, debe re-calcularse/forzarse al **día viernes**.
- Estos vencimientos deben estar siempre visibles para el procurador (no depende de que aparezcan como "novedad" o con prioridad urgente arriba del listado — deben tener presencia garantizada, con su propio indicador de semáforo).

### 4.8 Vista de jefatura

- Vista diferenciada para jefatura, enfocada en el **control de desviaciones** del equipo completo:
  - Visualizar los casos "fuera de estándar" (rojo) y "límite de estándar" (amarillo) de cada procurador.
  - Detectar situaciones excepcionales que requieren intervención de jefatura (ej. ausencia imprevista de un procurador que no puede cumplir un plazo).
  - Confirmar que **todas las causas de todos los procuradores** están representadas en algún workflow (garantía de que ninguna causa queda fuera de gestión).
  - Dejar novedades/instrucciones puntuales sobre causas específicas (ver punto 4.3).

### 4.9 Resumen ejecutivo / Panel de indicadores (KPIs)

Componente complementario (modular / tipo widget flotante), con seguimiento estándar de productividad, por ejemplo:

- Demandas presentadas en el mes (y comparación con el mes anterior a igual fecha, ej. "+10% respecto al mismo día del mes pasado").
- Notificaciones realizadas en el mes.
- Embargos trabados en el mes (a la fecha).
- % de cartera dentro de estándar vs. media del equipo.

Este panel debe mantenerse **simple**: no se busca crear múltiples vistas adicionales ("no vistas para allá, no vistas para acá, no 5.000 vistas, nada"), sino aportar contexto dentro del mismo panel principal.

### 4.10 Detalle de causa (vista clásica)

- Se debe mantener disponible el acceso al **detalle completo del juicio** (vista tipo Poder Judicial, con toda la información y documentos históricos), para consulta puntual cuando el procurador lo requiera, aunque el foco principal de la nueva plataforma **no** es la revisión causa por causa sino la gestión por acciones agrupadas.

---

## 5. Reglas de negocio identificadas

1. Toda acción/escrito generado automáticamente por el sistema **requiere visación humana** antes de ser enviado/presentado — nunca se ejecuta en piloto automático puro.
2. El estado "fuera de estándar" (rojo) es unidireccional respecto del estado "límite de estándar" (amarillo): un caso puede pasar de amarillo a rojo, pero un caso no "mejora" pasando primero por amarillo.
3. Si una causa está fuera de estándar y el procurador **no tiene ninguna acción posible** sobre ella (por causas de terceros: sin receptor disponible, búsqueda negativa agotada, etc.), debe **desasignarse temporalmente** en lugar de permanecer como incumplimiento imputable al procurador.
4. Vencimientos que caen en fin de semana se recalculan al **viernes** anterior.
5. Cada tipo de escrito/acción tiene su propia regla de negocio para determinar si puede resolverse de forma 100% estándar/masiva o si requiere revisión individual (ej. solicitud de fuerza pública vs. respuesta a un previo a proveer).
6. La existencia o no de **exhorto** es un criterio determinante para varias reglas de negocio (fuerza pública, designación de martillero, tribunal exhortante vs. exhortado).
7. Al completarse una acción masiva (ej. asignación de receptor), la causa debe **salir automáticamente** del workflow y su semáforo debe actualizarse en consecuencia.
8. La plataforma debe evitar lógica o campos "especiales" pensados solo para un cliente — todo debe resolverse mediante reglas de negocio configurables, dado el objetivo de comercializar la solución a otros estudios.

---

## 6. Requerimientos no funcionales

- **Simplicidad de UX**: el equipo de procuradores no debe requerir múltiples herramientas ni pantallas — un panel único debe cubrir el 80-20 de sus necesidades diarias.
- **Escalabilidad**: la plataforma debe soportar el crecimiento de la cartera gestionada por procurador (mención explícita de escalar de cientos a miles de causas, meta ~5.000–10.000 causas por persona) sin incremento proporcional de dotación.
- **Genericidad / configurabilidad**: reglas de negocio parametrizables por tipo de causa, tribunal, tipo de escrito, etc., sin hardcodear comportamientos específicos de un solo cliente — condición para la comercialización futura del producto.
- **Trazabilidad**: toda acción, comentario o novedad debe quedar registrada en el historial de la causa correspondiente.
- **Automatización con IA**: lectura e interpretación de documentos (demandas, pagarés, cartolas) para autocompletar datos y proponer acciones/escritos, reutilizando tecnología ya validada en otros flujos del sistema (patrocinios masivos).
- Pendiente de decisión de diseño (planteada como pregunta abierta en la reunión, sin resolución definitiva): si la interfaz visual debe **imitar la interfaz del Poder Judicial** (para facilitar adopción por otros estudios acostumbrados a ese sistema) o si debe tener una **interfaz propia y distinta**, orientada a workflow y acciones (arrastrar tareas, agrupar, resolver masivamente). Se discutió que el valor diferencial del producto está justamente en no parecerse al sistema tradicional, pero que esto debe evaluarse en función de cómo se comercialice la herramienta.

---

## 7. Preguntas abiertas / Puntos pendientes de definición

Estos puntos fueron mencionados en la reunión como pendientes de trabajo posterior con el equipo de procuradores y no cuentan con una definición cerrada:

- Definición exhaustiva de los **botones de acción** disponibles en el panel masivo (se menciona que debe trabajarse con el equipo de procuradores caso por caso).
- Definición completa de las **reglas de negocio para "previos a proveer"** por tipo y por tribunal (catálogo de casuísticas — se estima que podrían ser decenas o cientos de variantes).
- Definición de si demandas/notificaciones deben mostrarse como KPI relevante o no (mencionado como duda abierta).
- Decisión final sobre la línea visual del producto (símil Poder Judicial vs. interfaz propia tipo workflow/kanban).
- Definición de la nómina y ficha estándar de receptores por comuna/zona (Santiago vs. regiones) — se menciona que la información ya existe pero falta formalizar el proceso de generación automática de la ficha.
- Definición de cuántos "tipos de previos" existen realmente y su nivel de estandarización de respuesta.

---

## 8. Glosario de términos del dominio

| Término | Significado |
|---|---|
| **Procurador** | Profesional que gestiona operativamente la tramitación de las causas (usuario principal de la vista, ej. Romina) |
| **Workflow** | Panel/bandeja principal de gestión de tareas pendientes del procurador |
| **Novedad** | Evento o tarea pendiente que ingresa automáticamente al workflow (ej. resolución del tribunal, consulta de jefatura) |
| **Apercibimiento** | Advertencia del tribunal indicando plazo para presentar documentos, bajo sanción de tener la demanda por no presentada |
| **Curso progresivo** | Escrito presentado para acompañar documentos y permitir que se provea la demanda |
| **Despáchese** | Resolución del tribunal que da curso a la demanda |
| **Exhorto** | Solicitud de un tribunal a otro (exhortado) para realizar una diligencia fuera de su jurisdicción |
| **Previo a proveer** | Requerimiento del tribunal previo a resolver, solicitando aclaración de algún punto de la demanda (ej. monto, liquidación) |
| **Cumplir lo ordenado** | Escrito que responde a un previo a proveer |
| **Receptor** | Ministro de fe encargado de notificar/practicar diligencias judiciales |
| **Fuerza pública** | Solicitud al tribunal de auxilio de la fuerza pública para ejecutar una diligencia |
| **Fuera de estándar / rojo** | Estado de incumplimiento de SLA de una causa |
| **Límite de estándar / amarillo** | Estado de causa en riesgo de incumplimiento |
| **Dentro de estándar / verde** | Estado de causa correctamente gestionada |
| **ROL** | Número identificador de la causa judicial |
| **Patrocinio** | Autorización/representación legal asociada a la causa (mencionado con carga masiva ya existente) |

---

## 9. Resumen de módulos a construir

| Módulo | Estado mencionado en la reunión |
|---|---|
| Panel workflow / bandeja de novedades | Por construir (concepto central de la reunión) |
| Semáforo / SLA con nomenclatura comercial | Por definir naming final y construir |
| Historial de comentarios / observaciones de causa | Por construir |
| Sistema de novedades jefatura ↔ procurador | Por construir |
| Selección y acciones masivas | Por construir |
| Generación de escritos (simple y complejo) | Parcialmente existente (tecnología de lectura de documentos ya probada en otro flujo); por extender |
| Asignación masiva de receptor con ficha automática | Por construir |
| Carga masiva de demandas vía Excel + IA | Existe un prototipo probado por el equipo; falta robustecer validaciones de consistencia |
| Validación de consistencia previa a subida al Poder Judicial | No construida aún (mencionado explícitamente) |
| Carga masiva de patrocinios | Ya existe y funciona |
| Vista de vencimientos críticos de la semana | Por construir |
| Vista de calendario general | Ya existe |
| Vista de jefatura (control de desviaciones) | Por construir |
| Panel de KPIs / resumen ejecutivo | Por definir alcance final, dato disponible en el modelo |
| Filtro y búsqueda de causas | Ya existe, debe mantenerse/integrarse |
| Vista de detalle de causa (símil Poder Judicial) | Ya existe |

---

*Documento generado a partir del análisis de transcripciones de reunión. Recomendable validar con los participantes (Jorge, Sergio, equipo de procuradores) antes de avanzar a especificación técnica o diseño de UI, dado que varias definiciones quedaron abiertas durante la conversación.*

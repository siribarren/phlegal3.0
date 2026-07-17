# Requerimientos — Vista del Procurador/Abogado (Workflow de Gestión)

> Documento generado a partir del análisis de 3 transcripciones de audio (`Abogado1.txt`, `Abogado2.txt`, `Abogado3.txt`) de una reunión de diseño de producto entre Jorge, Romina, Claudia/Sergio y equipo. `Abogado2` y `Abogado3` transcriben el mismo tramo de conversación (`Abogado3` más completa); `Abogado1` cubre otro tramo. Se consolidan aquí los requerimientos funcionales planteados.

## 1. Visión general

Se busca reemplazar la mirada tradicional "causa por causa" (estilo Poder Judicial) por un **workflow único, centrado en acciones agrupadas y masivas**, apoyado por IA, que permita a un procurador gestionar carteras mucho más grandes (de cientos a miles de causas) sin aumentar headcount proporcionalmente.

Principios rectores explícitos:
- **Simple pero genérico**: la herramienta se usará internamente pero también se comercializará a otros estudios jurídicos, por lo que no puede tener funcionalidades "especiales" o hardcodeadas a un caso particular.
- **Masividad como valor central**: la clave no es ver una causa a la vez, sino agrupar N causas con la misma característica y ejecutar una acción sobre todas a la vez.
- **Todo pasa por un único panel**: el objetivo de UX es que el equipo de procuradores no necesite "miles de pantallas", sino una vista que resuelva el 80-20 de su día a día.
- **Toda acción propuesta por IA requiere visación humana**: nunca se ejecuta un escrito/acción automáticamente sin que el procurador revise y apruebe ("esto nunca va a ser autónomo, siempre requiere visación").
- **La bandeja debe tender a vacío**: el objetivo diario es dejar el workflow en cero. Si algo queda en rojo, debe ser por causas ajenas a la gestión propia (terceros), nunca por descuido interno.

## 2. Vista principal: Workflow / Bandeja de gestión (vista del procurador)

### 2.1 Estructura
- Panel único tipo lista de tareas ("to-do") que agrupa automáticamente:
  - Novedades del tribunal (nuevas resoluciones, oposiciones, apercibimientos, etc.).
  - Instrucciones/pedidos de la jefatura (Claudia/Sergio).
  - Acciones críticas próximas a vencer.
- Cada ítem de la bandeja debe tener asociada una **acción propuesta** (siguiente paso a ejecutar), no solo la notificación del evento.
- Toda causa que corresponda gestionar a este equipo debe entrar automáticamente a la bandeja **sin que el usuario tenga que recordarlo** ("por default").

### 2.2 Semáforo / SLA
- Cada causa/ítem tiene un estado de semáforo según cumplimiento de SLA:
  - **Verde / Estándar**: dentro de cumplimiento.
  - **Amarillo / Límite de estándar**: cerca de salir de cumplimiento (unidireccional: solo puede pasar a rojo, nunca "regresar" desde ahí).
  - **Rojo / Fuera de estándar**: incumplido.
- Nomenclatura pensada para venta comercial: evitar el lenguaje interno "rojo/amarillo/verde" y usar "estándar / límite de estándar / fuera de estándar".
- Al hacer clic en un semáforo (ej. "fuera de estándar") debe filtrar automáticamente el workflow mostrando solo esos casos.
- Debe existir comparación contra la media del equipo (ej. "vas 3% mejor/peor que la media de los procuradores") — dato de valor competitivo/motivacional.

### 2.3 Filtros y agrupación (estilo "Excel")
- Filtrar/agrupar por: estado, subestado, tipo de acción, tribunal, existencia de exhorto, cuantía, u otros criterios del modelo de datos.
- Debe permitir selección múltiple (ej. seleccionar rango del 1 al 40, o casos "conexos") para ejecutar una acción masiva sobre todo el conjunto seleccionado.
- Filtro personal por procurador (ver solo mi cartera) vs. vista de cartera completa (para jefatura).
- Debe soportar búsqueda de un caso puntual.

### 2.4 Datos relevantes a mostrar por ítem/ficha en el workflow
- Tribunal (de origen y, si aplica, tribunal exhortado).
- Indicador de si tiene exhorto o no.
- ROL de la causa (visible en panel/mirada ejecutiva).
- Cuantía.
- Tipo de cuantía / tipo de causa (relevante para toma de decisión y para agrupar).
- Estado del semáforo.
- Acción propuesta y plazo asociado (cuando aplica, ej. apercibimientos con plazo).

## 3. Acciones masivas

- Requerimiento central: poder seleccionar múltiples causas agrupadas por un criterio común y ejecutar **una sola acción sobre todas** (visar documentos, generar escritos, asignar receptor, solicitar fuerza pública, etc.).
- Ejemplos de acciones identificadas en el flujo de un juicio:
  1. **Confección de demanda** (ver sección 5).
  2. **Apercibimiento / acompañar documentos** — marcar como "cumplido" al dejar físicamente los documentos (pagaré, etc.) en tribunal; al marcar el check, la causa desaparece automáticamente del workflow.
  3. **Despáchese** (demanda proveída).
  4. **Encargar al receptor** (con distinción Santiago/regiones) — ver sección 4.
  5. **Solicitud de fuerza pública** — identificado como automatizable masivamente (regla simple: si tiene exhorto → generar escrito de exhorto para retiro; si no, escrito directo).
  6. **Previo a proveer / cumplir lo ordenado** — identificado como el más complejo, no estandarizable 1:1 porque depende del contenido específico de cada demanda/pagaré (ej. liquidación de saldo insoluto). Se plantea crear reglas de negocio que combinen datos ya disponibles (pagaré, cartola, saldo) para proponer una respuesta, aunque requiere mayor definición de reglas por caso/tribunal.
- Al completar una acción masiva, los ítems desaparecen del workflow y su semáforo se actualiza automáticamente (ej. de rojo/amarillo a verde).
- Botón de "generar escrito" (ubicado, según la idea original, arriba a la derecha) que despliega un menú de tipos de escrito disponibles asociados a la causa; el usuario selecciona el tipo y luego los casos a los que aplicar.
  - Algunos escritos se generan completos automáticamente.
  - Otros requieren completar datos manualmente (ej. cuando un domicilio sale "negativo" y hay que indicar uno nuevo).

## 4. Asignación de receptores

- Selección múltiple de causas → botón de acción → "Asignación receptor".
- Al ejecutar, se despliega nómina de receptores disponibles según relación/zona.
- El sistema arma automáticamente una **ficha estándar** con los datos necesarios (patente del vehículo, comuna, tribunal, etc. — estos datos vienen precargados del caso, no se ingresan manualmente en este paso).
- Al confirmar el envío:
  - Se genera un correo (o notificación) directo al receptor, con copia al correo del procurador.
  - Los casos gestionados desaparecen automáticamente del workflow y actualizan su semáforo.

## 5. Confección masiva de demandas (módulo de ingreso)

- El procurador (ej. Romina) sube un **Excel** con el listado de casos + respaldos de cada caso (pagaré, cartola, saldo, mandato si corresponde).
- El formato del Excel es definido por el equipo de producto (parametrizable).
- La IA lee los documentos (pagaré, cartola, saldo) y **redacta automáticamente los campos de la demanda** para cada caso del lote — no requiere digitación manual si se confía en el resultado.
- Al ejecutar sobre un lote (ej. 100 casos), el sistema genera las 100 demandas.
- **Revisión/visación uno a uno**: aunque la generación es masiva, cada demanda generada por IA debe ser revisada y aprobada individualmente por el procurador antes de subir (no se sube en bloque sin revisión).
- Errores observados en pruebas: la IA a veces confundía "comuna" con "jurisdicción" al determinar exhorto — pero el costo de corrección es bajo (1 minuto vs. 2 días de trabajo manual).
- **Tipos/formatos de demanda**: existen ~48 formatos de demanda distintos, exigidos por variaciones que piden los tribunales según el tipo de documento base (pagaré) — ej. demandado único vs. demandado con aval y representante legal (con o sin mandato). Conceptualmente la estructura de la demanda es una sola, compuesta por bloques/párrafos de contenido que varían según el caso; el motor de IA ya reconoce y genera correctamente los ~48 formatos.
- **Validación previa a subir al Poder Judicial** (funcionalidad aún no construida, marcada como importante):
  - Antes de subir cada causa al Poder Judicial debe haber una validación de consistencia (ej. verificar que el nombre del demandado coincide en todos los campos/documentos del expediente) para evitar errores por "arrastre" en procesos masivos.
  - Si se detecta inconsistencia, la subida de esa causa en particular debe bloquearse/marcarse para revisión, sin afectar al resto del lote.
- **Litigantes/comparecientes/representantes**: actualmente esto NO se completa automáticamente para demandas (sí existe automatización masiva para "patrocinios", que ya funciona bien) — pendiente de evaluar si se automatiza también para demandas.
- Hitos identificados en el ciclo de vida de una demanda:
  1. Confección y subida de la demanda (masivo).
  2. "Curso progresivo" / acompañamiento de documentos para que el tribunal provea la demanda.
  3. Apercibimiento (si no se acompañan documentos/título dentro de plazo, se tiene por no presentada) — tiene plazo asociado, debe notificarse de inmediato en el workflow.
  4. Acompañar documentos físicos en tribunal (checklist manual, marca "cumplido" y desaparece del workflow).
  5. Despáchese (demanda proveída).
  6. Encargar al receptor.
  7. (Camino alternativo) Previo a proveer → Cumplir lo ordenado.

## 6. Detalle de causa (vista secundaria)

- Debe mantenerse un botón/vista de "ver juicio" con el detalle completo de la causa (ya existe hoy), para cuando se necesite revisar un caso puntual — pero el uso normal del sistema debe ser vía acciones masivas, no revisión uno a uno.
- **Historial de comentarios/observaciones de la causa**:
  - Debe registrar observaciones dejadas por procuradores (con fecha), ej. comentarios de gestión libres.
  - Cuando la jefatura (Claudia/Sergio) revisa la cartera y deja una consulta sobre un caso puntual, esto debe generar una **novedad tipo "consulta abogado"** que entra al workflow del procurador responsable.
  - El procurador responde la consulta desde el workflow (acción "responder consulta"), completando los datos del caso si corresponde; la respuesta debe notificarse automáticamente a la jefatura.
  - Debe quedar trazabilidad completa en el historial de la causa: quién preguntó, cuándo, quién respondió, estado (respondido / no respondido).
  - Este historial debe alimentar mejoras futuras del sistema de sugerencias (aprendizaje sobre qué respuestas son mejores).

## 7. Vista de vencimientos / calendario

- Existe una vista de calendario global (ya construida) para vencimientos de la semana.
- Requerimiento adicional: los vencimientos **críticos** (ej. plazo de excepción, evacuar traslado, apercibimiento de tener por no presentada la demanda) deben aparecer también reflejados en el workflow principal, no solo en el calendario — no necesariamente como "novedad en rojo urgente arriba", sino garantizando que la acción pendiente ya esté asignada y visible.
- Regla de calendario: los vencimientos que caen sábado/domingo deben forzarse al día viernes.

## 8. Vista de jefatura (Claudia/Sergio)

- Vista de control de desviaciones sobre el equipo de procuradores: detecta cuándo una tarea no se resolverá a tiempo por causas ajenas al plazo normal (ej. imprevistos personales) y genera una alerta directa a la jefatura para que gestione la reasignación.
- No se detalla en profundidad en esta reunión (queda pendiente de definición), pero se deja establecido el requisito de que **todas** las causas que corresponde gestionar deben estar visibles y accionables, con el objetivo (deber ser) de que la bandeja quede en cero.
- Regla de negocio dura: un caso en rojo que "no debía estarlo" (falta de gestión propia) se considera una falta grave del proceso, y debe corregirse.
- Si un caso en rojo se debe a que el procurador ya no tiene ninguna incidencia posible sobre él (ej. no hay receptor en la zona, no hay más datos para búsqueda), debe poder **desasignarse temporalmente** del procurador y pasar a un "bolsón" para negociar con el cliente el siguiente paso (ej. marcarlo como no cobrable). Si posteriormente hay novedades, se reactiva y reasigna.

## 9. Vista ejecutiva / resumen de indicadores (widget)

- Panel resumen (posiblemente modular/flotante) con métricas personales del procurador, ej.:
  - N° de demandas presentadas en el mes.
  - N° de notificaciones realizadas en el mes.
  - N° de embargos en el mes.
  - Comparación con el mismo día del mes anterior (ej. "+10% respecto a igual fecha del mes pasado").
- Debe mantenerse simple: un widget/resumen adicional, no una vista nueva separada — se insiste en evitar la proliferación de pantallas.

## 10. Generación de escritos (acción transversal)

- Botón "generar escrito" que, al seleccionar uno o varios casos, despliega el listado de tipos de escrito disponibles para esa causa/selección.
- Al elegir un tipo de escrito:
  - Si es estándar, se genera automáticamente listo para su uso.
  - Si requiere datos adicionales (ej. domicilio alternativo cuando el original resulta negativo), el sistema debe permitir completarlos antes de generar el documento final.
- Debe funcionar tanto para un caso individual como para selección masiva.

## 11. Consideraciones de diseño/negocio transversales

- **Debate de UX pendiente**: ¿la interfaz debería parecerse visualmente al Poder Judicial (familiar para usuarios actuales) o ser una interfaz nueva orientada a workflow y acciones masivas? Se resuelve que debe primar la funcionalidad orientada a acciones masivas (agrupar, validar, ejecutar en bloque) por sobre la réplica visual del Poder Judicial, entendiendo que el valor de venta está en la multiplicación de capacidad de gestión (ej. de cientos a miles de causas por procurador), no en la familiaridad visual.
- El cambio es catalogado como "paradigmático": pasar de gestión causa-por-causa a gestión por acciones agrupadas, automatización asistida por IA, validación humana y masividad.
- Meta de negocio de largo plazo: que un procurador pueda ser "dueño" de la gestión de varios negocios/carteras completas simultáneamente gracias a las herramientas de potenciación (no es viable manualmente, sí con estas herramientas).
- Reutilización de tecnología ya probada (lectura e interpretación de documentos con IA para proponer campos de demanda) para aplicarla a otros tipos de resoluciones/escritos (ej. previos a proveer).
- Próximo paso mencionado en la reunión: definir con mayor detalle, junto al equipo de procuradores, los procesos/reglas de negocio de cada tipo de acción (se menciona explícitamente que esto aún debe socializarse y afinarse con el equipo, y que hay una lista pendiente de receptores por definir con Sergio y su equipo).

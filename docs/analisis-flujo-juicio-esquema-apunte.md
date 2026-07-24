# Análisis de documentos: flujo.pdf, juicio.doc, esquema.pdf, apunte.pdf

Los cuatro documentos están en `docs/` y describen, desde distintos ángulos, el mismo objeto: el **juicio ejecutivo de cobranza** (procedimiento civil chileno para cobrar deudas con título ejecutivo). Se complementan como cuatro capas de una misma pirámide: doctrina → esquema teórico → esquema teórico (duplicado) → proceso operativo real de un estudio de cobranza.

## 1. `apunte.pdf` — la base doctrinal (77 páginas)

Apuntes de clase de Derecho Procesal IV (Prof. Ricardo Márquez Acevedo, Universidad de Las Américas). Es el documento más extenso y técnico: explica el juicio ejecutivo desde el Código de Procedimiento Civil (CPC), artículo por artículo.

Contenido clave:
- **Estructura en dos cuadernos**: el *cuaderno ejecutivo* (demanda, excepciones, sentencia) y el *cuaderno de apremio* (mandamiento de ejecución y embargo, remate, pago) — corren en paralelo y casi no se interrumpen entre sí.
- **Título ejecutivo**: qué documentos habilitan a demandar ejecutivamente (sentencias firmes, escrituras públicas, letras/pagarés/cheques protestados, facturas, etc.) y los 4 requisitos de la obligación (constar en título ejecutivo, no prescrita, exigible, líquida).
- **Excepciones del art. 464 CPC**: lista taxativa de 18 defensas que puede oponer el deudor (incompetencia, falsedad del título, pago, prescripción, etc.), clasificadas en dilatorias, de fondo sobre el título y modos de extinguir obligaciones.
- **El embargo**: naturaleza jurídica, orden de prelación de bienes a embargar, bienes inembargables (art. 445 CPC), reembargo, ampliación/reducción/sustitución/cesación del embargo.
- **El remate**: tasación, bases del remate, purga de la hipoteca, sentencia de pago vs. sentencia de remate, qué pasa si no hay postores (adjudicación al acreedor, reducción de tasación, prenda pretoria).
- **Tercerías**: dominio, posesión, prelación y pago — los cuatro únicos terceros que la ley admite en un juicio ejecutivo.
- Variantes: juicio ejecutivo en obligaciones de hacer/no hacer, y juicio ejecutivo de mínima cuantía.

Es la **fuente de verdad normativa**: cualquier regla de negocio que se automatice (plazos, excepciones válidas, requisitos de embargo) debería poder trazarse a un artículo del CPC citado aquí.

## 2. `esquema.pdf` y `juicio.doc` — el mismo diagrama, dos formatos

Verificado con `textutil`: **`juicio.doc` y `esquema.pdf` contienen el mismo contenido** (un diagrama de cajas y flechas del juicio ejecutivo de obligación de dar). Todo indica que `esquema.pdf` es una exportación a PDF de `juicio.doc` — mismo texto, mismo layout de tablas, mismos títulos ("I.- Cuaderno Ejecutivo", "II.- Cuaderno de Apremio").

Es un resumen visual de una sola página (3 páginas en el PDF) que condensa el mismo contenido de `apunte.pdf` en forma de diagrama de flujo académico:
- Cuaderno ejecutivo: gestión preparatoria → demanda → despáchese → oposición/no oposición → sentencia.
- Cuaderno de apremio: despáchese → mandamiento de ejecución y embargo → requerimiento → paga/no paga → traba embargo → liquidación → tasación → remate → pago.
- Distingue sentencia absolutoria (alza embargo) vs. condenatoria (de pago o de remate).

**Redundancia a limpiar**: al ser el mismo contenido en dos formatos, no aporta información adicional una vez leído uno de los dos. Si el objetivo es tener una única fuente para consultar o para alimentar un sistema, conviene quedarse solo con `esquema.pdf` (o `juicio.doc`) y no mantener ambos.

## 3. `flujo.pdf` — el proceso operativo real (Phoenix Service)

A diferencia de los otros tres (que describen el **juicio ejecutivo general** tal como lo define el CPC/la doctrina), `flujo.pdf` es el diagrama de **el proceso operativo real de un estudio de cobranza** (marca "Phoenix Service"), enfocado en un caso específico: cobranza con **embargo y remate de un vehículo**.

Contiene pasos muy concretos que no aparecen en los apuntes doctrinales porque son prácticas operativas del estudio, no normas legales:
- "Búsqueda positiva/negativa" del deudor, "sin domicilio", "de oficio institucional", "incobrable" — la gestión de notificación en terreno.
- "Martillero fija fecha remate", "solicita fuerza pública retiro", "se encarga a incautar", "no lo encuentra", "informe papito corazón" — jerga operativa del día a día de la cobranza, no del CPC.
- Es el diagrama que efectivamente corresponde a los campos `etapa`/`estadoCRM`/`subestadoCRM` que hoy existen como texto libre en los datos mock del proyecto (ver `ProcuradorView.tsx`), por ejemplo "DESPACHESE MANDAMIENTO", "TERMINO DE JUICIO", "EXHORTO EN TRAMITACION".

## Cómo se relacionan los cuatro documentos

| Documento | Nivel | Rol |
|---|---|---|
| `apunte.pdf` | Normativo/doctrinal | Por qué existe cada trámite, qué exige la ley |
| `esquema.pdf` / `juicio.doc` | Teórico-visual | El mismo proceso normativo, resumido en un diagrama académico |
| `flujo.pdf` | Operativo | Cómo lo ejecuta en la práctica un estudio de cobranza, con jerga y pasos propios del negocio |

En conjunto forman una traza completa: la **ley** (apunte.pdf) define el marco; el **esquema** (esquema.pdf/juicio.doc) lo simplifica para enseñanza; el **flujo operativo** (flujo.pdf) es la interpretación que un estudio de cobranza hace de esa ley para su trabajo diario — y es este último el que ya se modeló como grafo de estados en `src/app/flujoCobranza.ts` para alimentar sugerencias de acción por causa (ver demo en `?sample=flujo`).

## Notas

- `juicio.doc` y `esquema.pdf` son duplicados de contenido; si se busca simplificar `docs/`, uno de los dos puede eliminarse sin pérdida de información.
- `apunte.pdf` es la referencia a citar si se necesita justificar legalmente un plazo, una excepción o un requisito (contiene los artículos del CPC).
- `flujo.pdf` es la referencia a usar para modelar el sistema (estados/acciones reales del negocio), no `apunte.pdf`, que describe el proceso general y no las particularidades operativas de un estudio de cobranza.

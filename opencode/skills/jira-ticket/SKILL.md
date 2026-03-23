---
name: jira-ticket
description: Create well-structured Jira tickets from user requests, following Banco Sabadell's unified cross-team standard. Covers four issue types: Story, Task, Bug, and Spike. All tickets are written in Spanish.
---

## What I do

- Transform a request, incident, feature idea, or technical need into a Jira-ready ticket
- Produce a concise title and a complete description
- Apply the correct template based on the issue type: Story, Task, Bug, or Spike
- Suggest priority, labels, and component when the information is available
- Explicitly mark assumptions when information has not been provided
- If Jira MCP tools are available, create the ticket directly instead of only drafting it

## When to use me

Use this skill when the user wants to:

- Create a Jira ticket
- Convert a loose request into a formal task
- Write a story, technical task, bug, or spike
- Standardize ticket creation across teams
- Prepare content to paste into Jira or send through Jira MCP tools

## General behavior

Always optimize for clarity, traceability, and implementation readiness.

When creating a ticket:
1. Identify the type of work: Story, Task, Bug, or Spike
2. Extract the business or technical objective
3. Separate confirmed facts from assumptions
4. Keep the summary short, specific, and action-oriented
5. Write a description that another engineer can pick up without extra back-and-forth
6. Include acceptance criteria (Stories and Bugs) or expected deliverables (Spikes)
7. Highlight dependencies, blockers, or open questions
8. Do not invent data that the user did not provide

## Language

All ticket content must be written in Spanish, regardless of the language used in the user's request. The skill instructions are in English; the output is always in Spanish.

---

## Templates by issue type

### Story

Represents a new feature or behavior that delivers value to the user or the business.

```
### Resumen
[Verbo de acción] + [qué] + [en qué contexto]

### Tipo de issue
Story

### Descripción

**Contexto:**
- ...

**Objetivo:**
- ...

**Alcance:**
- ...

**Notas técnicas:**
- ...

**Dependencias / Bloqueos:**
- ...

### Criterios de aceptación
- [ ] ...
- [ ] ...
- [ ] ...

### Metadatos sugeridos
- Prioridad: Alta | Media | Baja
- Etiquetas: ...
- Componente: ...
- Responsable: (a asignar por el equipo)
```

---

### Task

Represents internal technical work that does not deliver functionality directly visible to the user: refactoring, migrations, configuration, infrastructure improvements, etc.

```
### Resumen
[Verbo de acción] + [qué] + [en qué sistema o capa]

### Tipo de issue
Task

### Descripción

**Contexto:**
- ...

**Objetivo:**
- ...

**Alcance:**
- ...

**Notas técnicas:**
- ...

**Dependencias / Bloqueos:**
- ...

### Criterios de finalización
- [ ] ...
- [ ] ...
- [ ] ...

### Metadatos sugeridos
- Prioridad: Alta | Media | Baja
- Etiquetas: ...
- Componente: ...
- Responsable: (a asignar por el equipo)
```

---

### Bug

Represents incorrect or unexpected behavior that must be corrected.

```
### Resumen
[Corregir] + [qué falla] + [en qué pantalla o flujo]

### Tipo de issue
Bug

### Descripción

**Contexto:**
- ...

**Comportamiento actual:**
- ...

**Comportamiento esperado:**
- ...

**Pasos para reproducir:**
1. ...
2. ...
3. ...

**Entorno:**
- Navegador / dispositivo: ...
- Versión / rama: ...
- Usuario o rol afectado: ...

**Notas técnicas:**
- ...

**Dependencias / Bloqueos:**
- ...

### Criterios de aceptación
- [ ] El comportamiento incorrecto ya no ocurre
- [ ] ...
- [ ] Los flujos existentes no se ven afectados por la corrección

### Metadatos sugeridos
- Prioridad: Crítica | Alta | Media | Baja
- Etiquetas: ...
- Componente: ...
- Responsable: (a asignar por el equipo)
```

---

### Spike

Represents a research or technical exploration task whose goal is to reduce uncertainty before committing to a solution. It does not deliver functionality but produces documented knowledge.

```
### Resumen
[Investigar | Evaluar | Explorar] + [qué] + [con qué objetivo]

### Tipo de issue
Spike

### Descripción

**Contexto:**
- ...

**Pregunta o incertidumbre a resolver:**
- ...

**Alcance de la investigación:**
- ...

**Restricciones o condicionantes:**
- ...

**Dependencias / Bloqueos:**
- ...

### Entregables esperados
- [ ] Documento de decisión o recomendación con argumentos
- [ ] ...
- [ ] (Opcional) Prueba de concepto desechable

### Metadatos sugeridos
- Prioridad: Alta | Media | Baja
- Etiquetas: ...
- Componente: ...
- Responsable: (a asignar por el equipo)
```

---

## Jira creation rules

**If Jira MCP is available:**
- First inspect which Jira tools are exposed
- Map the generated fields to the MCP tool schema
- Create the issue only after the payload is complete and coherent
- If required project fields are missing, ask only for those fields
- After creation, return the created issue key and a compact summary of what was sent

**If Jira MCP is not available:**
- Generate a copy-pasteable ticket body
- Make explicit that the result is a draft and has not been created in Jira

---

## Title guidelines

A good summary should:
- Start with an action verb or a concrete subject
- Be specific about the change or problem
- Avoid vague wording like "arreglar cosas" or "mejorar módulo"
- Stay reasonably short (one line)

Good examples:
- Añadir validación de alias de beneficiario vacío en el formulario de transferencias
- Investigar el timeout intermitente en el endpoint de perfil de cliente
- Migrar los filtros del dashboard a estado reactivo compartido
- Corregir la navegación por teclado rota en la tabla de cuentas
- Evaluar compatibilidad de Native Federation con lazy loading de rutas entre MFEs

---

## Acceptance criteria guidelines

Acceptance criteria should:
- Describe observable outcomes
- Be verifiable without ambiguity
- Avoid mixing implementation detail with user-facing behavior unless necessary
- Be short and independent from each other

Spikes do not use acceptance criteria. They use **expected deliverables** instead, which describe the knowledge or artifact that must be produced at the end of the investigation.

---

## Missing information policy

Ask follow-up questions only if one of these is missing and prevents generating a useful ticket:
- The issue type cannot be inferred (Story, Task, Bug, or Spike)
- The actual problem or expected outcome is unknown
- The affected area or system is completely unknown
- Mandatory fields required by the available MCP tool are missing

Otherwise, proceed with reasonable placeholders explicitly marked as assumptions.

---

## Examples

### Example: Bug

User request:
"En la pantalla de transferencias se puede enviar el formulario sin seleccionar una cuenta de origen."

Expected result:

#### Resumen
Impedir el envío del formulario de transferencia sin cuenta de origen seleccionada

#### Tipo de issue
Bug

#### Descripción

**Contexto:**
- En la pantalla de transferencias, el usuario puede intentar enviar el formulario sin haber seleccionado una cuenta de origen

**Comportamiento actual:**
- El formulario se envía sin validar que la cuenta de origen esté seleccionada

**Comportamiento esperado:**
- El formulario bloquea el envío y muestra un mensaje de error si no se ha seleccionado cuenta de origen

**Pasos para reproducir:**
1. Acceder a la pantalla de transferencias
2. Dejar el campo de cuenta de origen vacío
3. Pulsar el botón de envío

**Entorno:**
- Navegador / dispositivo: (a completar por el equipo)
- Versión / rama: (a completar por el equipo)
- Usuario o rol afectado: cualquier usuario con acceso a transferencias

**Notas técnicas:**
- Validar tanto el estado vacío inicial como el estado tras edición
- Revisar si el backend ya rechaza la petición y alinear la validación frontend con ese comportamiento

#### Criterios de aceptación
- [ ] El formulario no puede enviarse sin una cuenta de origen seleccionada
- [ ] Se muestra un mensaje de validación claro cuando el campo está vacío
- [ ] Los flujos de transferencia válidos existentes siguen funcionando correctamente

#### Metadatos sugeridos
- Prioridad: Media
- Etiquetas: transferencias, validación, frontend
- Componente: pagos
- Responsable: (a asignar por el equipo)

---

### Example: Spike

User request:
"No sabemos si podemos usar lazy loading de rutas entre microfrontends con Native Federation. Necesitamos investigarlo."

Expected result:

#### Resumen
Investigar compatibilidad de Native Federation con lazy loading de rutas entre microfrontends

#### Tipo de issue
Spike

#### Descripción

**Contexto:**
- La arquitectura actual usa Native Federation con shell host y remotes (mfe-dashboard, mfe-users)
- Se ha planteado aplicar lazy loading de rutas entre MFEs pero se desconoce si Native Federation lo soporta de forma nativa

**Pregunta o incertidumbre a resolver:**
- ¿Permite Native Federation aplicar lazy loading de rutas entre microfrontends sin comprometer la integración actual?

**Alcance de la investigación:**
- Revisar documentación oficial de Native Federation y Angular 21
- Probar en el workspace de desarrollo con una PoC mínima
- Evaluar impacto en tiempo de carga y en la configuración de federación existente

**Restricciones o condicionantes:**
- La solución debe ser compatible con Angular 21 y la configuración actual de shell + remotes

#### Entregables esperados
- [ ] Documento de decisión con conclusión clara y argumentos
- [ ] Recomendación sobre viabilidad y enfoque si procede
- [ ] PoC desechable como evidencia técnica (opcional)

#### Metadatos sugeridos
- Prioridad: Media
- Etiquetas: microfrontends, native-federation, arquitectura, investigación
- Componente: arquitectura-frontend
- Responsable: (a asignar por el equipo)

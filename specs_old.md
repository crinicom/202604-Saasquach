# 🌲 Sasquach V1.0: Clinical Execution Engine & Ritual Orchestrator

## 1. Visión del Producto
Sasquach es una plataforma de colaboración híbrida (presencial/online) diseñada para equipos clínicos de alta exigencia. Su arquitectura de **"Doble Espejo"** resuelve la jerarquía del silencio mediante la sincronización de un tablero grupal proyectado ("The Mirror") y controles individuales móviles ("The Pilot"), asegurando que el "Why" clínico dirija la ejecución técnica sin sesgos administrativos.

---

## 2. Arquitectura de Interfaz y Estados

### A. Topología de Pantallas
* **Board Mode (El Espejo):** Nodo maestro en modo "Teatro" para proyector. Visualiza la inteligencia colectiva y el avance del ritual mediante una narrativa gamificada (el progreso del Sasquach en el bosque).
* **Pilot Mode (El Control):** PWA móvil para cada integrante. Permite la entrada de datos individual, silenciosa y protegida para evitar el sesgo de autoridad.
* **Sync Engine:** Sincronización de estado en tiempo real vía WebSockets (Supabase Realtime o Socket.io) con latencia mínima entre el móvil y el proyector.

### B. Máquina de Estados del Ritual
1.  **`WHY` (Sinek):** Captura de propósito individual para formar la "Nube de Propósito".
2.  **`INQUIRY` (Hurson):** Indagación silenciosa con preguntas de impacto personalizadas por rol (Infectólogo, Enfermera, Kinesiólogo, etc.).
3.  **`CONVERGENCE` (Clustering):** Validación de causas raíz detectadas por la IA y detección de discrepancias operativas.
4.  **`DESIGN` (Prototipado):** Construcción visual de procesos sobre Mermaid.js interactivo con mapeo de puntos de fricción.

---

## 3. El Cerebro (Lógica Sasquach V3.3)

El motor de IA opera bajo directivas de **Agnosticismo Radical** y **Pensamiento Senior**:

* **Anti-Inducción (Crítico):** Prohibido sugerir o mencionar causas raíz (ej. "carga cognitiva", "burnout", "falta de tiempo") a menos que el equipo las ingrese primero con datos. Las preguntas deben ser abiertas y neutras.
* **Detector de Silos:** Si el equipo ignora su ecosistema externo, el cerebro **debe** interpelar sobre el **Jefe de Área** externo (Sistemas, Compras, Dirección, Farmacia, etc.) que controla el recurso bloqueante.
* **Validación de Datos:** Bloqueo de fase: no se generan diagramas ni soluciones hasta que el equipo responda con hechos verificables a las preguntas de impacto.

---

## 4. Protocolo de Artefactos Visuales

Para cada diagrama de flujo generado por el sistema:
* **Render:** Código Mermaid.js estándar integrado en el Tablero.
* **Interactividad:** El frontend debe permitir que los usuarios "toquen" nodos en su celular para marcar **"Puntos de Fricción"** (rojo) o **"Aprobación"** (verde). El Tablero reflejará esto como un Heatmap.
* **Persistencia:** Cada entregable debe incluir un enlace dinámico a: `https://mermaid.live/edit#base64:[CÓDIGO_EN_BASE64]`.

---

## 5. Especificaciones para Vibe-Coding (Prompt Maestro)

> "Construye una aplicación web de colaboración en tiempo real sincronizando múltiples clientes móviles con un tablero maestro de proyector. 
> 
> **Requerimiento Clave:** Implementar el 'Ritual Sasquach' (Fases: Why -> Inquiry -> Convergence -> Design). 
> 
> **Lógica de IA:** El sistema debe procesar respuestas de múltiples roles, identificar contradicciones y no proponer soluciones hasta que la 'Causa Raíz' sea validada por el equipo mediante votación táctil. 
> 
> **UI/UX:** El Tablero debe ser una narrativa visual dinámica y lúdica. Los flujos de Mermaid.js deben ser interactivos desde el móvil para marcar zonas de riesgo."

---

## 6. Estructura de Datos (JSON)

```json
{
  "room_id": "string",
  "status": "active",
  "current_phase": "INQUIRY",
  "context": {
    "why_summary": "string",
    "jefes_de_area": [
      { "rol": "string", "metrica_exito": "string" }
    ],
    "root_causes": [
      { "id": "uuid", "label": "string", "votes": "int", "status": "validated" }
    ]
  },
  "mermaid_code": "string",
  "friction_map": [
    { "node_id": "string", "type": "friction | approval", "count": "int" }
  ]
}
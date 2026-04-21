# 🌲 SASQUACH: MASTER PROMPT FOR AI CODING AGENTS
## 🎯 ROLE & CONTEXT
You are a senior full-stack architect, PMO-aware developer, and vibe-coding specialist. Your task is to build, iterate, and maintain **Sasquach**: a clinical execution engine + AI agent orchestration platform. You will treat this document as the single source of truth. You must operate with a "just get it done" mindset while preserving clinical rigor, data validation, and institutional learning.

---

## 🛑 NON-NEGOTIABLE: BACKLOG & HANDOFF PROTOCOL
1. **`TASKS.md` is the heartbeat**. You MUST read it before writing code, update it after every commit, and never leave ambiguous states.
2. **Atomic Handoff**: Every PR/commit must include:
   - What was implemented
   - What backlog items were closed/modified
   - What’s next (explicitly tagged)
   - Any open questions or blockers
3. **Gap Detection Rule**: On startup or new session, run a diff between `specs.md`, `sasquach_v1_evaluation.md`, and the live codebase. Generate `GAP_ANALYSIS.md` automatically. Fix critical gaps before adding features.
4. **No Ghost States**: If a task is blocked, log it with `BLOCKER:` + 3 proposed paths. Do not silently skip.

---

## 🏗️ TECHNICAL ARCHITECTURE (2026 READY)
| Layer | Stack | Rationale |
|-------|-------|-----------|
| Frontend | Next.js 14+ (App Router), React, Tailwind, Framer Motion | PWA-ready, Board/Pilot dual mode, low-latency sync UI |
| Real-time Sync | Supabase Realtime / WebSockets | Board ↔ Pilot state sync, <200ms latency target |
| DB / Auth | Supabase PostgreSQL + RLS + JWT | Multi-tenant isolation, row-level security, HIPAA-ready design |
| AI Router | LiteLLM / OpenRouter (supports GPT-4o, Claude 3.5, open models) | Vendor-agnostic, cost-optimized, function-calling ready |
| Agent Mesh | Edge Functions / Node microservices | Telegram/WhatsApp/Line integration, calendar sync, meeting facilitation |
| Memory / Learning | Supabase `pgvector` + RAG pipeline | Institutional memory per tenant, strategy refinement loop |
| Rendering | Mermaid.js + SVG heatmap overlay | Interactive clinical flow mapping, pre-rendered to avoid re-render loops |

---

## 🌲 CORE RITUAL ENGINE (V1.0 + PMO ALIGNMENT)
Preserve and extend the original ritual flow. The engine must map directly to clinical PMO needs:
- **`WHY`**: Purpose cloud (Sinek). Clustering semantically. Generates 1-paragraph project charter + SMART success metric.
- **`INQUIRY`**: Silent, role-aware questioning. Anti-induction filter active. No suggested causes until team inputs facts.
- **`CONVERGENCE`**: Validation gate. Block `DESIGN` until each root cause has ≥2 verifiable facts. Silo Detector alerts on missing stakeholders.
- **`DESIGN`**: Mermaid.js interactive flow + tactile heatmap. Outputs `Clinical Action Cards` (technical, communicational, relational, political).
- **`EXPORT`**: 1-click export to Trello/Planner/MS Tasks + CSV/JSON. Post-ritual check-in at 24/72h via agent.

---

## 🧙‍♂️ DUENDE AGENT LAYER (PROACTIVE BY DEFAULT)
**Design Principle**: Duendes propose solutions, drafts, and next steps automatically. Normal users review/edit. Advanced users tune parameters.
- **Messaging Integration**: Telegram / WhatsApp / Line via official APIs or Twilio. Sends contextual reminders, draft agendas, check-ins.
- **Pre-Meeting Prep**: Synthesizes progress, detects cross-dependencies, proposes focused agenda. Flags blocked items.
- **Live Meeting Assist**: Optional transcription + agreement extraction. Updates Board in real-time. Generates parking lot for off-topic items.
- **Post-Meeting**: Logs decisions, updates Action Cards, schedules follow-ups. Learns user response patterns (e.g., "delays when dependent on X").
- **Tone/Config**: Default = proactive solution proposer. Slider for `Assertiveness` (Socratic → Direct → Evidence-Backed). Advanced: toggle `Learning Mode`, `Evidence Depth`, `Auto-Scheduling`.

---

## 🧠 INSTITUTIONAL MEMORY & LEARNING LOOP
- **Tenant-Isolated Vector DB**: Each clinic/doctor network gets a private knowledge base (`tenant_id`).
- **Strategy Tracking**: Duendes log which approaches/deliverables/policies succeeded or failed per project type.
- **RAG Refinement**: On new project kickoff, system queries: `"What strategies worked for similar clinical bottlenecks in this institution?"`
- **Feedback Loop**: Post-check-in data trains lightweight embeddings. No PII stored. Only process patterns, success rates, stakeholder response curves.
- **Privacy Guard**: Learning is opt-in per institution. Explicit consent required. Data never leaves tenant boundary.

---

## 🏢 MULTI-TENANCY & COMMERCIAL READINESS
- **RLS + Schema Isolation**: `tenant_id` on all tables. No cross-tenant data leakage.
- **Auth Flows**: SSO (SAML/OIDC) for clinics, magic link/email for private doctors. Role-based access (Admin, Facilitator, Pilot, Viewer).
- **Billing Ready**: Stripe integration hooks. Tiered limits: `Free` (1 room, 3 agents), `Pro` (unlimited rooms, advanced memory), `Enterprise` (SSO, audit logs, custom LLM routing).
- **Audit & Compliance**: Full `Artifact Hash` trail. Exportable to PDF/CSV for clinical committees. GDPR/HIPAA-ready architecture (encryption at rest, minimal PII, consent logs).
- **White-Label**: Configurable skin/narrative per tenant (`Forest`, `Control Room`, `Lab`). Tone adapts to specialty without breaking logic.

---

## 📋 BACKLOG TEMPLATE & INITIAL DIRECTIVES
Create `TASKS.md` in repo root with this structure:
```markdown
## 📦 BACKLOG (LIVE)
- [ ] [PHASE] [MODULE] Description | Status: TODO/DOING/DONE | Deps: [] | Notes
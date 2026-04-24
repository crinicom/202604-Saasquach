## 📦 BACKLOG (LIVE)

- [x] [MIGRATION] [FRAMEWORK] Migrar de Vite a Next.js 14+ (App Router) | Status: DONE | Deps: [] | Notes: Estructura src/app configurada.
- [x] [MIGRATION] [PWA] Habilitar PWA en Next.js (`next-pwa`) con estrategia offline-first para `/pilot/**` | Status: DONE | Deps: [FRAMEWORK] | Notes: next.config.ts actualizado.
- [x] [MIGRATION] [PILOT] Crear queue local (IndexedDB) + background sync para acciones de Pilot | Status: DONE | Deps: [PWA] | Notes: ActionQueue.ts implementado con idb.
- [x] [ENGINE] [CONVERGENCE] Implementar Validation Gate (>= 2 hechos por causa) | Status: DONE | Deps: [] | Notes: Lógica en RitualContext y PilotView.
- [x] [AGENT] [DUENDE] Configurar Supabase Edge Functions + Deno runtime | Status: DONE | Deps: [] | Notes: Skeleton en supabase/functions/duende-orchestrator.
- [x] [UI] [BOARD] Visualizar Validation Gate en el Mirror | Status: DONE | Deps: [ENGINE] | Notes: Mostrar "Clinical Weight" en BoardView.
- [ ] [AI] [ROUTER] Integrar LiteLLM / OpenRouter para agnosticismo de modelos | Status: TODO | Deps: [] | Notes: Soportar Claude 3.5 y GPT-4o.
- [ ] [AGENT] [DUENDE] Implementar microservicio de notificaciones (Telegram/Workplace) | Status: TODO | Deps: [] | Notes: Proactividad por defecto.
- [ ] [AUTH] [MULTI-TENANCY] Implementar RLS y aislamiento por tenant_id | Status: TODO | Deps: [] | Notes: HIPAA/GDPR readiness.
- [ ] [TEST] [QA] Test de conectividad intermitente en emulador de red lenta | Status: TODO | Deps: [PILOT] | Notes: Verificación de robustez PWA.
- [ ] [EXPORT] [INTEGRATION] Conectar fase DESIGN con Trello/Planner | Status: TODO | Deps: [] | Notes: Salida operativa a herramientas de PMO.
- [ ] [MEMORY] [RAG] Configurar pgvector y pipeline de memoria institucional | Status: TODO | Deps: [] | Notes: Aprendizaje continuo.
- [ ] [UI] [DESIGN] Generar Clinical Action Cards en fase final | Status: TODO | Deps: [ENGINE] | Notes: Categorización técnica/relacional/política.
- [ ] [ENGINE] [WHY] Generación automática de Project Charter y métricas SMART | Status: TODO | Deps: [] | Notes: Alineación estratégica.

## 📝 WORKTREE COMMITS
- [WORKTREE_FANATICAL-CARBON] Add Clinical Weight display to BoardView → DONE

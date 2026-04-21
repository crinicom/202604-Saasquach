# GAP_ANALYSIS.md (Sasquach V1.0 → V2.0 2026 Ready)

Este análisis detalla las discrepancias entre la implementación actual y las nuevas directivas de `new_specs.md`.

## 🏗️ Brechas de Arquitectura
- **Stack Tecnológico**: El proyecto actual usa **Vite**. Se requiere migración a **Next.js 14+ (App Router)** para soportar SSR, Edge Functions y una estructura más robusta.
- **Microservicios (Duende Layer)**: Se requiere implementar la lógica proactiva en **Supabase Edge Functions** (Deno) para unificar RLS y cumplimiento HIPAA/GDPR.
- **Offline-First (Pilot)**: Falta el soporte de **PWA** con Workbox y sincronización en segundo plano (Background Sync) para entornos clínicos con baja conectividad.
- **Base de Datos**: Se requiere activar `pgvector` y el pipeline de RAG para la memoria institucional por tenant.

## 🌲 Brechas del Motor de Ritual
- **Fase WHY**: Actualmente genera una nube de orbes. Falta la generación automática del **Project Charter** y métricas **SMART**.
- **Fase CONVERGENCE**: Falta el **Validation Gate** estricto (mínimo 2 hechos verificables por causa raíz).
- **Fase DESIGN**: Falta la salida de **Clinical Action Cards** (técnicas, comunicacionales, relacionales, políticas).
- **Exportación**: No existe integración con Trello, Planner o MS Tasks.

## 🧙‍♂️ Brechas de Agentes (Duende Layer)
- **Proactividad**: Falta la lógica de agentes que propongan soluciones automáticamente.
- **Notificaciones**: No hay persistencia ni recordatorios vía Telegram/WhatsApp/Twilio.
- **Preparación de Reuniones**: No existe la síntesis de progreso automática previa a la sesión.

## 🏢 Brechas Comerciales y de Cumplimiento
- **Multi-Tenancy**: Se requiere implementar RLS estricto basado en JWT y aislamiento de esquemas por `tenant_id`.
- **Billing**: No hay ganchos para Stripe ni gestión de tiers (Free/Pro/Enterprise).
- **Cumplimiento**: Falta el rastro de hash para auditoría (`Artifact Hash trail`).

## 📋 Protocolo de Seguimiento
- [ ] Crear `TASKS.md` según el formato especificado.
- [ ] Iniciar migración a Next.js 14+.
- [ ] Implementar el "Validation Gate" en Convergencia.

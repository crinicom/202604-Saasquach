import { RoomState } from '../../types';

/**
 * Lógica Sasquach V3.3 - Cerebro del Ritual
 * Agnosticismo Radical y Anti-Inducción
 */
export const SasquachBrain = {
  /**
   * Filtra entradas para prevenir la inducción de causas raíz no reportadas.
   */
  /**
   * Filtra entradas para prevenir la inducción de causas raíz no reportadas.
   * Agnosticismo Radical: Prohibido sugerir causas administrativas preestablecidas.
   */
  filterInduction: (text: string): string => {
    const forbiddenWords = ['burnout', 'sobrecarga', 'falta de tiempo', 'recursos', 'presupuesto', 'administrativo'];
    let filtered = text;
    forbiddenWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (regex.test(filtered)) {
        console.warn(`[SASQUACH BRAIN] Bloqueo de inducción detectado: "${word}"`);
        filtered = filtered.replace(regex, '[ANONIMIZADO]');
      }
    });
    return filtered;
  },

  /**
   * Detecta si el equipo está operando en un silo.
   */
  detectSilos: (state: RoomState): string[] => {
    const externalHeads = state.context.areaHeads.map(h => h.role.toLowerCase());
    const criticalExternalAreas = ['sistemas', 'compras', 'dirección', 'farmacia'];
    
    return criticalExternalAreas.filter(area => !externalHeads.includes(area));
  },

  /**
   * Genera Candidatos a Causa Raíz basados en WHYs e INQUIRIES.
   * IA sugiere Candidatos; Humanos validan Hechos.
   */
  generateRootCauseCandidates: (state: RoomState): RootCause[] => {
    const whys = state.context.whyResponses;
    const areas = state.context.areaHeads;
    
    if (whys.length < 2 || areas.length === 0) return [];

    // Lógica de Orquestación Duende:
    // 1. Agrupar WHYs por sentimiento/tema (Simulado)
    // 2. Mapear Áreas Externas (Silos) involucradas
    // 3. Proponer Cruces Críticos
    
    const candidates: RootCause[] = [
      {
        id: 'RC-ORC-001',
        label: `Asincronía en el flujo de ${areas[0]?.role || 'Actores Externos'}`,
        votes: 0,
        status: 'candidate'
      }
    ];

    if (whys.length >= 3) {
      candidates.push({
        id: 'RC-ORC-002',
        label: `Sobrecarga cognitiva por fragmentación de información`,
        votes: 0,
        status: 'candidate'
      });
    }

    if (areas.length >= 2) {
      candidates.push({
        id: 'RC-ORC-003',
        label: `Conflicto de Escalas: ${areas[0].role} vs ${areas[1].role}`,
        votes: 0,
        status: 'candidate'
      });
    }

    return candidates;
  },

  /**
   * Genera una propuesta de diagrama de Mermaid basada en el contexto actual.
   * Hook para futura integración con APIs de IA (Gemini/OpenAI).
   */
  generateMermaidProposal: (state: RoomState): string => {
    const validatedCauses = state.context.rootCauses.filter(c => c.status === 'validated');
    const actionText = state.context.ruptureCommitment;

    let code = 'graph TD\n';
    code += '  Start((Rigor Clínico)) --> Vision[Propósito: ' + (state.context.whySummary || 'Convergencia') + ']\n';
    
    if (validatedCauses.length > 0) {
      validatedCauses.forEach((cause, idx) => {
        const causeId = `C${idx}`;
        code += `  Vision --> ${causeId}{${cause.label}}\n`;
        
        if (actionText) {
          code += `  ${causeId} --> Action[Acción: ${actionText.substring(0, 40)}...]\n`;
        }
      });
    } else {
      code += '  Vision --> Waiting[Esperando Validación de Hechos...]\n';
    }

    code += '  style Start fill:#059669,stroke:#fff,stroke-width:2px\n';
    code += '  style Vision fill:#1c1c1c,stroke:#c3a343,color:#fff\n';
    code += '  classDef default fill:#1c1c1c,stroke:#c3a343,color:#fff,font-style:italic\n';
    
    return code;
  },

  /**
   * Llama a la Capa Duende (Servicio de IA real) para orquestación compleja.
   */
  callDuende: async (phase: RitualPhase, state: RoomState) => {
    try {
      const response = await fetch('/api/sasquach/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, context: state.context })
      });
      
      if (!response.ok) throw new Error('Capa Duende no responde');
      
      const data = await response.json();
      return data;
    } catch (e) {
      console.warn('[SASQUACH BRAIN] Fallo en Capa Duende, usando respaldo determinista.', e);
      return null;
    }
  },

  /**
   * Valida si el estado permite la transición a la fase de diseño.
   */
  canDesign: (state: RoomState): boolean => {
    const validatedCauses = state.context.rootCauses.filter(c => c.status === 'validated');
    return validatedCauses.length > 0;
  }
};

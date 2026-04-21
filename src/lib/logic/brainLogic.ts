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
   * Genera una propuesta de diagrama de Mermaid basada en el contexto actual.
   * Hook para futura integración con APIs de IA (Gemini/OpenAI).
   */
  generateMermaidProposal: (state: RoomState): string => {
    const validatedCauses = state.context.areaHeads.filter(a => a.status === 'validated');
    const actions = state.context.actionProposals;

    // TODO: Integrar llamada Real a API de IA aquí.
    // Por ahora usamos un generador determinista básico.
    
    let code = 'graph TD\n';
    code += '  Start((Inicio)) --> Vision[Propósito: ' + (state.context.whySummary || 'Consenso Clínico') + ']\n';
    
    validatedCauses.forEach((cause, idx) => {
      const causeId = `C${idx}`;
      code += `  Vision --> ${causeId}[Silo: ${cause.role}]\n`;
      
      const relevantActions = actions.filter(a => a.siloRole === cause.role);
      relevantActions.forEach((action, actionIdx) => {
        const actionId = `A${idx}_${actionIdx}`;
        code += `  ${causeId} --> ${actionId}("${action.text.substring(0, 30)}...")\n`;
      });
    });

    code += '  style Start fill:#059669,stroke:#fff,stroke-width:2px\n';
    code += '  classDef default fill:#1c1c1c,stroke:#c3a343,color:#fff,font-style:italic\n';
    
    return code;
  },

  /**
   * Valida si el estado permite la transición a la fase de diseño.
   */
  canDesign: (state: RoomState): boolean => {
    return state.context.areaHeads.some(c => c.status === 'validated');
  }
};

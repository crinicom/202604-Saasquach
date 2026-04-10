import { RoomState } from '../../types';

/**
 * Lógica Sasquach V3.3 - Cerebro del Ritual
 * Agnosticismo Radical y Anti-Inducción
 */
export const SasquachBrain = {
  /**
   * Filtra entradas para prevenir la inducción de causas raíz no reportadas.
   */
  filterInduction: (text: string): string => {
    const forbiddenWords = ['burnout', 'sobrecarga', 'falta de tiempo', 'recursos'];
    let filtered = text;
    forbiddenWords.forEach(word => {
      const regex = new RegExp(word, 'gi');
      if (regex.test(filtered)) {
        console.warn(`[SASQUACH BRAIN] Bloqueo de inducción detectado: "${word}"`);
        // En V1 solo alertamos, en versiones posteriores podríamos anonimizar o rechazar.
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
   * Valida si el estado permite la transición a la fase de diseño.
   */
  canDesign: (state: RoomState): boolean => {
    return state.context.rootCauses.some(c => c.status === 'validated');
  }
};

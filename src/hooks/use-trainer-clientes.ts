/**
 * Hooks para gestión de Clientes del Trainer
 * 
 * ⚠️ TEMPORALMENTE DESHABILITADO
 * TrainerService fue eliminado accidentalmente y necesita ser restaurado
 * Este archivo será habilitado cuando TrainerService esté disponible nuevamente
 */

// Stub temporal para evitar errores de compilación
export function useTrainerClientes() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

export function useClientesStats() {
  return {
    stats: {
      total: 0,
      activos: 0,
      inactivos: 0,
    },
    isLoading: false,
    error: null,
  };
}

export function useTrainerCoaches() {
  return {
    data: [],
    isLoading: false,
    error: null,
  };
}

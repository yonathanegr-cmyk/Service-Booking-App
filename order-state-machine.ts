import { OrderAggregate, OrderStatus } from "../types/order";

// Définition du Graphe de Transition (Directed Acyclic Graph)
const STATE_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  'CREATED': ['MATCHED', 'CANCELLED'],
  'MATCHED': ['ACCEPTED', 'CREATED', 'CANCELLED'], // Created si le pro refuse (re-pool)
  'ACCEPTED': ['ON_ROUTE', 'CANCELLED'],
  'ON_ROUTE': ['ON_SITE', 'CANCELLED'],
  'ON_SITE': ['IN_PROGRESS', 'CANCELLED'],
  'IN_PROGRESS': ['COMPLETED', 'DISPUTED'], // Impossible d'annuler sans frais ici
  'COMPLETED': ['PAID', 'DISPUTED'],
  'PAID': [], // Terminal state
  'CANCELLED': [], // Terminal state
  'DISPUTED': ['PAID', 'CANCELLED'] // Résolu par admin
};

export interface ValidationResult {
  allowed: boolean;
  reason?: string;
}

/**
 * LE JUGE : Vérifie si une transition est légale selon les règles métier strictes
 */
export function canTransition(
  order: OrderAggregate, 
  nextStatus: OrderStatus
): ValidationResult {
  
  // 1. Vérification de la topologie du graphe (Est-ce une route existante ?)
  const possibleNextStates = STATE_TRANSITIONS[order.currentStatus];
  if (!possibleNextStates.includes(nextStatus)) {
    return { 
      allowed: false, 
      reason: `Transition illégale de ${order.currentStatus} vers ${nextStatus}` 
    };
  }

  // 2. Règles de Garde (Business Logic Guards)
  
  // Garde: ON_SITE -> IN_PROGRESS
  // Règle: Il faut au moins une photo "BEFORE"
  if (order.currentStatus === 'ON_SITE' && nextStatus === 'IN_PROGRESS') {
    if (order.evidence.before.length === 0) {
      return {
        allowed: false,
        reason: "חובה לצלם את האזור לפני תחילת העבודה" // "Obligatoire de photographier avant..."
      };
    }
  }

  // Garde: IN_PROGRESS -> COMPLETED
  // Règle: Il faut au moins une photo "AFTER"
  if (order.currentStatus === 'IN_PROGRESS' && nextStatus === 'COMPLETED') {
    if (order.evidence.after.length === 0) {
      return {
        allowed: false,
        reason: "חובה לצלם את התוצאה הסופית לפני הסיום" // "Obligatoire de photographier le résultat..."
      };
    }
  }

  // Garde: COMPLETED -> PAID
  // Règle: Seul le Client ou l'Admin peut valider le paiement, pas le Pro
  // (Cette vérification se ferait idéalement avec le contexte de l'utilisateur connecté)

  return { allowed: true };
}

/**
 * Helper pour l'UI: Retourne la prochaine étape logique "Happy Path"
 */
export function getNextHappyPathStep(status: OrderStatus): OrderStatus | null {
  const map: Partial<Record<OrderStatus, OrderStatus>> = {
    'CREATED': 'MATCHED',
    'MATCHED': 'ACCEPTED',
    'ACCEPTED': 'ON_ROUTE',
    'ON_ROUTE': 'ON_SITE',
    'ON_SITE': 'IN_PROGRESS',
    'IN_PROGRESS': 'COMPLETED',
    'COMPLETED': 'PAID'
  };
  return map[status] || null;
}

/**
 * Helper pour l'UI: Retourne le label en Hébreu pour le statut
 */
export function getStatusLabel(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    'CREATED': 'ממתין לאישור',
    'MATCHED': 'נמצא איש מקצוע',
    'ACCEPTED': 'הזמנה אושרה',
    'ON_ROUTE': 'בדרך אליך',
    'ON_SITE': 'הגיע ליעד',
    'IN_PROGRESS': 'בעבודה',
    'COMPLETED': 'הסתיים',
    'PAID': 'שולם',
    'CANCELLED': 'בוטל',
    'DISPUTED': 'בבדיקה'
  };
  return labels[status];
}
import { AIAnalysis } from '../App';

/**
 * Simulates AI Computer Vision analysis of uploaded video/photo
 * In production, this would call an actual AI service like OpenAI Vision, Google Cloud Vision, etc.
 */
export function analyzeMedia(
  category: string,
  subProblem: string,
  complexity: 'standard' | 'complex' | 'critical',
  hasVideo: boolean
): AIAnalysis {
  // Simulate different analyses based on service category
  const analyses: { [key: string]: { [key: string]: AIAnalysis } } = {
    'Plumbing': {
      'leak': {
        summary: hasVideo 
          ? 'Analyse vidéo : Fuite d\'eau active détectée sous l\'évier de cuisine. Tuyauterie apparente en PVC. Humidité visible sur le plancher en bois.'
          : 'Problème de fuite d\'eau détecté. Analyse photo limitée.',
        detectedIssues: [
          'Fuite active au niveau du joint du siphon',
          'Corrosion visible sur les raccords',
          'Accumulation d\'eau sous l\'évier (environ 2L estimé)',
          'Plancher en bois partiellement endommagé par l\'humidité',
          'Moisissure potentielle détectée (zones sombres)',
        ],
        estimatedMaterials: [
          'Nouveau siphon en PVC (diamètre 40mm)',
          'Joints d\'étanchéité',
          'Ruban téflon',
          'Silicone sanitaire',
          'Possiblement : tuyau de raccordement flexible',
        ],
        safetyNotes: [
          'Couper l\'arrivée d\'eau avant intervention',
          'Risque de moisissure - ventiler la zone',
          'Vérifier l\'état du plancher après réparation',
        ],
        recommendations: [
          'Réparation urgente recommandée (fuite active)',
          'Inspection complète de la tuyauterie adjacente conseillée',
          'Traitement anti-moisissure du placard si nécessaire',
          'Durée estimée : 1-2 heures',
        ],
        confidenceScore: hasVideo ? 0.92 : 0.65,
      },
      'clog': {
        summary: hasVideo
          ? 'Analyse vidéo : Toilettes bouchées. Niveau d\'eau élevé visible. Pas de débordement actif. Zone propre et accessible.'
          : 'Problème de débouchage identifié.',
        detectedIssues: [
          'Toilettes obstruées - évacuation très lente',
          'Niveau d\'eau anormalement haut dans la cuvette',
          'Aucun signe de refoulement d\'égout',
          'Accès facile - salle de bain au rez-de-chaussée',
        ],
        estimatedMaterials: [
          'Débouchage mécanique (furet)',
          'Éventuellement produit déboucheur professionnel',
          'Pas de remplacement de pièces anticipé',
        ],
        safetyNotes: [
          'Éviter l\'utilisation jusqu\'à réparation',
          'Ne pas ajouter de produits chimiques',
        ],
        recommendations: [
          'Débouchage simple prévu',
          'Si récurrent, inspection caméra recommandée',
          'Durée estimée : 30-60 minutes',
        ],
        confidenceScore: hasVideo ? 0.88 : 0.60,
      },
    },
    'Cleaning': {
      'deep_cleaning': {
        summary: hasVideo
          ? 'Analyse vidéo : Appartement 3 pièces nécessitant nettoyage en profondeur. Cuisine avec graisse accumulée, salle de bain avec calcaire, salon/chambres poussiéreux.'
          : 'Nettoyage en profondeur requis.',
        detectedIssues: [
          'Cuisine : graisse sur hotte et plaques de cuisson',
          'Salle de bain : dépôts de calcaire importants',
          'Sols : poussière et traces visibles',
          'Vitres : empreintes et saleté accumulée',
          'Surface totale estimée : 70-80m²',
        ],
        estimatedMaterials: [
          'Produits dégraissants professionnels',
          'Anti-calcaire',
          'Produits multi-surfaces',
          'Chiffons microfibre',
          'Aspirateur HEPA',
        ],
        safetyNotes: [
          'Ventilation nécessaire pendant le nettoyage',
          'Produits écologiques disponibles sur demande',
        ],
        recommendations: [
          'Nettoyage approfondi de 4-6 heures recommandé',
          'Commencer par la cuisine (zone la plus sale)',
          'Service régulier hebdomadaire conseillé pour maintien',
          '2 professionnels recommandés pour efficacité',
        ],
        confidenceScore: hasVideo ? 0.90 : 0.70,
      },
    },
    'Electrical': {
      'outlet': {
        summary: hasVideo
          ? 'Analyse vidéo : Prise électrique défectueuse dans salon. Marques de brûlure visibles. Disjoncteur accessible au tableau.'
          : 'Problème électrique sur prise détecté.',
        detectedIssues: [
          'Prise murale avec traces de brûlure',
          'Décoloration du plastique autour de la prise',
          'Pas de fumée active visible',
          'Tableau électrique identifié - installation récente',
          'Hauteur standard - facilement accessible',
        ],
        estimatedMaterials: [
          'Nouvelle prise murale encastrée',
          'Dominos de raccordement',
          'Boîte d\'encastrement si endommagée',
          'Câble électrique si section défectueuse',
        ],
        safetyNotes: [
          'URGENT : Ne pas utiliser cette prise',
          'Couper le disjoncteur correspondant immédiatement',
          'Risque d\'incendie si utilisation continue',
          'Vérification conformité normes NF C 15-100 requise',
        ],
        recommendations: [
          'Intervention urgente dans les 24h',
          'Test complet du circuit électrique recommandé',
          'Vérifier les autres prises de la même ligne',
          'Durée estimée : 1-2 heures',
        ],
        confidenceScore: hasVideo ? 0.94 : 0.55,
      },
    },
  };

  // Get specific analysis or provide generic one
  const categoryAnalysis = analyses[category];
  if (categoryAnalysis && categoryAnalysis[subProblem]) {
    return categoryAnalysis[subProblem];
  }

  // Generic analysis if specific one not found
  return {
    summary: hasVideo
      ? `Analyse vidéo effectuée pour ${category} - ${subProblem}. Situation claire et bien documentée.`
      : `Demande de ${category} identifiée. Analyse limitée sans média visuel.`,
    detectedIssues: [
      `Problème de ${subProblem} identifié`,
      `Niveau de complexité : ${complexity === 'standard' ? 'Standard' : complexity === 'complex' ? 'Moyen' : 'Élevé'}`,
      hasVideo ? 'Vidéo fournie - analyse détaillée possible' : 'Pas de vidéo - évaluation sur place nécessaire',
    ],
    estimatedMaterials: [
      'Matériaux standard pour ce type d\'intervention',
      'Liste précise après évaluation sur place',
    ],
    recommendations: [
      'Intervention professionnelle recommandée',
      `Durée estimée : ${complexity === 'standard' ? '1-2' : complexity === 'complex' ? '2-4' : '4-6'} heures`,
    ],
    confidenceScore: hasVideo ? 0.75 : 0.50,
  };
}

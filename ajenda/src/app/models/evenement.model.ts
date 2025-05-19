/**
 * Interface représentant un événement dans le calendrier
 */
export interface Evenement {
    id?: number;
    titre: string;
    description?: string;
    dateDebut: string | Date;
    dateFin: string | Date;
    couleurFond?: string;
    couleurTexte?: string;
    lieu?: string;
    estJourneeEntiere?: boolean;
    userId?: number;
} 
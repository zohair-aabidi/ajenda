import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Evenement } from '../models/evenement.model';

/**
 * Service pour gérer les opérations CRUD sur les événements
 */
@Injectable({
  providedIn: 'root'
})
export class EvenementService {
  // URL de base de l'API
  private apiUrl = 'http://localhost:8080/api/evenements';

  constructor(private http: HttpClient) { }

  /**
   * Récupère tous les événements (admin seulement)
   */
  getTousLesEvenements(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(this.apiUrl);
  }

  /**
   * Récupère tous les événements de l'utilisateur connecté
   */
  getMesEvenements(): Observable<Evenement[]> {
    return this.http.get<Evenement[]>(`${this.apiUrl}/mes-evenements`);
  }

  /**
   * Récupère un événement par son ID
   */
  getEvenementById(id: number): Observable<Evenement> {
    return this.http.get<Evenement>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crée un nouvel événement
   */
  creerEvenement(evenement: Evenement): Observable<Evenement> {
    console.log('EvenementService: Création d\'un événement avec userId:', evenement.userId);
    
    // Added explicit token retrieval for debugging
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('EvenementService: Envoi de l\'événement au serveur:', evenement);
    console.log('EvenementService: En-têtes:', headers);
    
    return this.http.post<Evenement>(this.apiUrl, evenement);
  }

  /**
   * Met à jour un événement existant
   */
  mettreAJourEvenement(id: number, evenement: Evenement): Observable<Evenement> {
    // Added explicit token retrieval for debugging
    const token = this.getToken();
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    
    console.log('EvenementService: Mise à jour de l\'événement:', evenement);
    console.log('EvenementService: En-têtes:', headers);
    
    return this.http.put<Evenement>(`${this.apiUrl}/${id}`, evenement);
  }
  
  /**
   * Récupère le token JWT depuis sessionStorage pour débogage
   */
  private getToken(): string | null {
    return window.sessionStorage.getItem('auth-token');
  }  /**
   * Supprime un événement
   */
  supprimerEvenement(id: number): Observable<void> {
    console.log('EvenementService: NOUVELLE MÉTHODE - Suppression de l\'événement avec ID:', id);
    
    // Suppression directe sans options supplémentaires pour éviter tout problème
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
  
  /**
   * Ancienne méthode de suppression (désactivée)
   */
  private _supprimerEvenementOld(id: number): Observable<any> {
    console.log('EvenementService: Ancienne méthode de suppression (non utilisée)');
    return this.http.delete<any>(`${this.apiUrl}/${id}`).pipe(
      map(response => {
        console.log('EvenementService: Réponse de suppression reçue:', response);
        return response;
      }),
      catchError(error => {
        console.error('EvenementService: Erreur lors de la suppression:', error);
        throw error;
      })
    );
  }

  /**
   * Récupère les événements dans une plage de dates (admin seulement)
   */
  getEvenementsParPlage(debut: Date, fin: Date): Observable<Evenement[]> {
    const params = new HttpParams()
      .set('debut', debut.toISOString())
      .set('fin', fin.toISOString());
    return this.http.get<Evenement[]>(`${this.apiUrl}/plage`, { params });
  }

  /**
   * Récupère les événements de l'utilisateur connecté dans une plage de dates
   */
  getMesEvenementsParPlage(debut: Date, fin: Date): Observable<Evenement[]> {
    const params = new HttpParams()
      .set('debut', debut.toISOString())
      .set('fin', fin.toISOString());
    return this.http.get<Evenement[]>(`${this.apiUrl}/mes-evenements/plage`, { params });
  }

  /**
   * Recherche des événements par mot clé (admin seulement)
   */
  rechercherEvenements(motCle: string): Observable<Evenement[]> {
    const params = new HttpParams().set('motCle', motCle);
    return this.http.get<Evenement[]>(`${this.apiUrl}/recherche`, { params });
  }

  /**
   * Recherche des événements de l'utilisateur connecté par mot clé
   */
  rechercherMesEvenements(motCle: string): Observable<Evenement[]> {
    const params = new HttpParams().set('motCle', motCle);
    return this.http.get<Evenement[]>(`${this.apiUrl}/mes-evenements/recherche`, { params });
  }
}
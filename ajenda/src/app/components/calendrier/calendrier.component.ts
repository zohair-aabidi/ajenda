import { Component, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { CalendarOptions, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
import frLocale from '@fullcalendar/core/locales/fr';
import { FullCalendarModule } from '@fullcalendar/angular';
import { HttpClient } from '@angular/common/http';

import { EvenementService } from '../../services/evenement.service';
import { Evenement } from '../../models/evenement.model';
import { FormulaireEvenementComponent } from '../formulaire-evenement/formulaire-evenement.component';
import { TokenStorageService } from '../../services/token-storage.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-calendrier',
  template: `
    <div class="container mx-auto p-4">
      <div class="mb-4 flex justify-between items-center">
        <h2 class="text-xl font-semibold">Calendrier des événements</h2>
        <div class="flex space-x-2">
          <button 
            (click)="ouvrirFormulaire()" 
            class="bg-primary-light dark:bg-primary-dark text-white px-4 py-2 rounded-md hover:opacity-90 transition-opacity">
            Nouvel événement
          </button>
        </div>
      </div>
      
      <div *ngIf="authError" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <span class="block sm:inline">Une erreur d'authentification s'est produite. Veuillez vous <a [routerLink]="['/login']" class="underline font-bold">reconnecter</a>.</span>
      </div>
      
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
        <full-calendar [options]="calendarOptions"></full-calendar>
      </div>
      
      <app-formulaire-evenement 
        *ngIf="afficherFormulaire"
        [evenement]="evenementSelectionne"
        (fermer)="fermerFormulaire()"
        (sauvegarder)="sauvegarderEvenement($event)">
      </app-formulaire-evenement>
    </div>
  `,  standalone: true,
  imports: [FullCalendarModule, NgIf, FormulaireEvenementComponent, RouterLink]
})
export class CalendrierComponent implements OnInit {
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    locale: frLocale,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek'
    },
    buttonText: {
      today: "Aujourd'hui",
      month: 'Mois',
      week: 'Semaine',
      day: 'Jour',
      list: 'Liste'
    },
    events: [],
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    eventClick: this.handleEventClick.bind(this),
    select: this.handleDateSelect.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    eventResize: this.handleEventResize.bind(this)
  };
  
  afficherFormulaire = false;
  evenementSelectionne: Evenement | null = null;
  isAdmin = false;
  currentUser: any = null;
  authError = false;

  constructor(
    private evenementService: EvenementService,
    private tokenStorage: TokenStorageService,
    private authState: AuthStateService,
    private router: Router,
    private http: HttpClient
  ) {}
  ngOnInit(): void {
    console.log('Calendrier: Initialisation...');
    
    // Vérifier si l'utilisateur est connecté
    if (!this.tokenStorage.isLoggedIn()) {
      console.warn('Calendrier: Utilisateur non connecté, redirection vers la page de connexion');
      this.router.navigate(['/login']);
      return;
    }
    
    // Vérifier si le token JWT est valide
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.error('Calendrier: Aucun token disponible');
      this.authError = true;
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }
    
    // Valider le token
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Calendrier: Format de token JWT invalide');
        this.authError = true;
        this.tokenStorage.signOut();
        setTimeout(() => this.router.navigate(['/login']), 1000);
        return;
      }
      
      // Vérifier l'expiration du token
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiration = payload.exp * 1000; // Convertir en millisecondes
      const now = Date.now();
      
      console.log('Calendrier: Token JWT - Expiration:', new Date(expiration), 'Maintenant:', new Date(now));
      
      if (expiration < now) {
        console.error('Calendrier: Token JWT expiré');
        this.authError = true;
        this.tokenStorage.signOut();
        setTimeout(() => this.router.navigate(['/login']), 1000);
        return;
      }
    } catch (e) {
      console.error('Calendrier: Erreur lors de la validation du token', e);
      this.authError = true;
      this.tokenStorage.signOut();
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }
    
    // S'abonner à l'état actuel de l'utilisateur
    this.authState.getCurrentUser().subscribe(user => {
      console.log('Calendrier: Mise à jour de l\'utilisateur courant:', user?.username);
      this.currentUser = user;
      if (user) {
        this.isAdmin = user.roles && user.roles.includes('ROLE_ADMIN');
        this.chargerEvenements();
      }
    });

    // Vérifier également l'état actuel
    this.currentUser = this.tokenStorage.getUser();
    if (this.currentUser) {
      console.log('Calendrier: Utilisateur courant trouvé dans le storage:', this.currentUser.username);
      this.isAdmin = this.currentUser.roles && this.currentUser.roles.includes('ROLE_ADMIN');
      this.chargerEvenements();
    } else {
      console.error('Calendrier: Aucun utilisateur trouvé dans le storage');
      this.authError = true;
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }
  }
  
  /**
   * Charge les événements depuis l'API
   */
  chargerEvenements(): void {
    console.log('Calendrier: Chargement des événements...');
    console.log('Calendrier: Token JWT disponible:', !!this.tokenStorage.getToken());
    
    // Utiliser l'API appropriée selon le rôle de l'utilisateur
    const observableEvenements = this.isAdmin
      ? this.evenementService.getTousLesEvenements()
      : this.evenementService.getMesEvenements();

    observableEvenements.subscribe({
      next: (evenements) => {
        console.log('Calendrier: Événements récupérés:', evenements.length);
        const events: EventInput[] = evenements.map(evt => ({
          id: evt.id?.toString(),
          title: evt.titre,
          start: new Date(evt.dateDebut),
          end: new Date(evt.dateFin),
          backgroundColor: evt.couleurFond || '#4F46E5',
          textColor: evt.couleurTexte || '#FFFFFF',
          extendedProps: {
            description: evt.description,
            lieu: evt.lieu,
            userId: evt.userId
          },
          allDay: evt.estJourneeEntiere
        }));
        
        this.calendarOptions.events = events;
        this.authError = false;
      },
      error: (error) => {
        console.error('Calendrier: Erreur lors du chargement des événements', error);
        if (error.status === 401) {
          console.error('Calendrier: Erreur d\'authentification 401');
          this.authError = true;
          setTimeout(() => {
            // Si erreur persiste après 3 secondes, rediriger vers login
            if (this.authError) {
              console.log('Calendrier: Redirection vers login due à l\'erreur d\'authentification');
              this.tokenStorage.signOut();
              this.router.navigate(['/login']);
            }
          }, 3000);
        }
      }
    });
  }

  /**
   * Gère le clic sur un événement
   */
  handleEventClick(info: any): void {
    const evenement: Evenement = {
      id: parseInt(info.event.id),
      titre: info.event.title,
      description: info.event.extendedProps.description,
      dateDebut: info.event.start,
      dateFin: info.event.end || info.event.start,
      couleurFond: info.event.backgroundColor,
      couleurTexte: info.event.textColor,
      lieu: info.event.extendedProps.lieu,
      estJourneeEntiere: info.event.allDay,
      userId: info.event.extendedProps.userId || this.currentUser?.id
    };
    
    this.evenementSelectionne = evenement;
    this.afficherFormulaire = true;
  }

  /**
   * Gère la sélection d'une plage de dates
   */
  handleDateSelect(info: any): void {
    if (!this.currentUser) {
      console.error('Calendrier: Utilisateur non connecté');
      return;
    }
    
    this.evenementSelectionne = {
      titre: '',
      dateDebut: info.start,
      dateFin: info.end,
      estJourneeEntiere: info.allDay,
      userId: this.currentUser.id
    };
    this.afficherFormulaire = true;
  }

  /**
   * Gère le déplacement d'un événement
   */
  handleEventDrop(info: any): void {
    const id = parseInt(info.event.id);
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        evenement.dateDebut = info.event.start;
        evenement.dateFin = info.event.end || info.event.start;
        evenement.userId = this.currentUser?.id;
        
        this.evenementService.mettreAJourEvenement(id, evenement).subscribe({
          next: () => {
            console.log('Calendrier: Événement mis à jour avec succès');
          },
          error: (error) => {
            console.error('Calendrier: Erreur lors de la mise à jour de l\'événement', error);
            info.revert();
            
            if (error.status === 401) {
              this.authError = true;
            }
          }
        });
      },
      error: (error) => {
        console.error('Calendrier: Erreur lors de la récupération de l\'événement', error);
        info.revert();
        
        if (error.status === 401) {
          this.authError = true;
        }
      }
    });
  }

  /**
   * Gère le redimensionnement d'un événement
   */
  handleEventResize(info: any): void {
    const id = parseInt(info.event.id);
    this.evenementService.getEvenementById(id).subscribe({
      next: (evenement) => {
        evenement.dateFin = info.event.end;
        evenement.userId = this.currentUser?.id;
        
        this.evenementService.mettreAJourEvenement(id, evenement).subscribe({
          next: () => {
            console.log('Calendrier: Événement mis à jour avec succès');
          },
          error: (error) => {
            console.error('Calendrier: Erreur lors de la mise à jour de l\'événement', error);
            info.revert();
            
            if (error.status === 401) {
              this.authError = true;
            }
          }
        });
      },
      error: (error) => {
        console.error('Calendrier: Erreur lors de la récupération de l\'événement', error);
        info.revert();
        
        if (error.status === 401) {
          this.authError = true;
        }
      }
    });
  }

  /**
   * Ouvre le formulaire pour créer un nouvel événement
   */
  ouvrirFormulaire(): void {
    if (!this.currentUser) {
      console.error('Calendrier: Utilisateur non connecté');
      return;
    }
    
    const now = new Date();
    const later = new Date(now.getTime() + 60 * 60 * 1000); // +1 heure
    
    this.evenementSelectionne = {
      titre: '',
      dateDebut: now,
      dateFin: later,
      estJourneeEntiere: false,
      userId: this.currentUser.id
    };
    this.afficherFormulaire = true;
  }

  /**
   * Ferme le formulaire d'édition
   */
  fermerFormulaire(): void {
    this.afficherFormulaire = false;
    this.evenementSelectionne = null;
  }

  /**
   * Sauvegarde un événement (création, mise à jour ou suppression)
   */
  sauvegarderEvenement(evenement: any): void {
    console.log('Calendrier: Événement reçu:', evenement);
    console.log('Calendrier: Type d\'opération:', evenement._delete ? 'SUPPRESSION' : (evenement.id ? 'MISE À JOUR' : 'CRÉATION'));
    
    if (!this.currentUser) {
      console.error('Calendrier: Utilisateur non connecté');
      this.authError = true;
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }
    
    // Vérification de base du token
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.error('Calendrier: Aucun token disponible pour la requête');
      this.authError = true;
      setTimeout(() => this.router.navigate(['/login']), 1000);
      return;
    }
      // SUPPRESSION - Traitement prioritaire et séparé
    if (evenement._delete === true || evenement.action === 'DELETE') {
      const idToDelete = evenement.id;
      
      if (!idToDelete) {
        console.error('Calendrier: Impossible de supprimer un événement sans ID');
        return;
      }
      
      console.log('Calendrier: NOUVELLE MÉTHODE - Suppression de l\'événement avec ID:', idToDelete);
      
      // Fermer d'abord le formulaire pour éviter tout problème d'interface
      this.fermerFormulaire();
      
      // Appel direct à la méthode de suppression avec l'ID uniquement
      this.evenementService.supprimerEvenement(idToDelete).subscribe({
        next: () => {
          console.log('Calendrier: Événement supprimé avec succès');
          // Recharger la liste complète après suppression
          setTimeout(() => this.chargerEvenements(), 500); // Petit délai pour s'assurer que le backend a bien traité la suppression
        },
        error: (error) => {
          console.error('Calendrier: Erreur lors de la suppression de l\'événement', error);
          if (error.status === 401) {
            this.authError = true;
            setTimeout(() => {
              if (this.authError) {
                this.tokenStorage.signOut();
                this.router.navigate(['/login']);
              }
            }, 2000);
          } else {
            alert('Erreur lors de la suppression de l\'événement. Veuillez réessayer.');
          }
        }
      });
      return; // Important pour ne pas continuer avec le reste du code
    }

    // CRÉATION ou MISE À JOUR
    try {
      // Vérification plus complète du token si nécessaire
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Calendrier: Format de token JWT invalide');
        this.tokenStorage.signOut();
        this.router.navigate(['/login']);
        return;
      }
      
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiration = payload.exp * 1000; // Convertir en millisecondes
      const now = Date.now();
      
      if (expiration < now) {
        console.error('Calendrier: Token expiré, redirection vers la page de connexion');
        this.tokenStorage.signOut();
        this.router.navigate(['/login']);
        return;
      }
    } catch (e) {
      console.error('Calendrier: Erreur lors de la validation du token', e);
      this.tokenStorage.signOut();
      this.router.navigate(['/login']);
      return;
    }

    // Assurer que l'ID utilisateur est défini
    evenement.userId = this.currentUser.id;
    console.log('Calendrier: Sauvegarde de l\'événement avec userId:', evenement.userId);
    
    if (evenement.id) {
      // MISE À JOUR
      this.evenementService.mettreAJourEvenement(evenement.id, evenement).subscribe({
        next: () => {
          console.log('Calendrier: Événement mis à jour avec succès');
          this.fermerFormulaire();
          this.chargerEvenements();
        },
        error: (error) => {
          console.error('Calendrier: Erreur lors de la mise à jour de l\'événement', error);
          if (error.status === 401) {
            this.authError = true;
            setTimeout(() => {
              if (this.authError) {
                this.tokenStorage.signOut();
                this.router.navigate(['/login']);
              }
            }, 2000);
          }
        }
      });
    } else {
      // CRÉATION
      this.evenementService.creerEvenement(evenement).subscribe({
        next: () => {
          console.log('Calendrier: Événement créé avec succès');
          this.fermerFormulaire();
          this.chargerEvenements();
        },
        error: (error) => {
          console.error('Calendrier: Erreur lors de la création de l\'événement', error);
          if (error.status === 401) {
            this.authError = true;
            setTimeout(() => {
              if (this.authError) {
                this.tokenStorage.signOut();
                this.router.navigate(['/login']);
              }
            }, 2000);
          }
        }
      });
    }
  }
}
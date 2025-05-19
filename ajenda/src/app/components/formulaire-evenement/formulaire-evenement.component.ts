import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgClass, NgIf } from '@angular/common';
import { Evenement } from '../../models/evenement.model';

@Component({
  selector: 'app-formulaire-evenement',
  template: `
    <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
        <div class="p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold">
              <span *ngIf="evenement?.id">Modifier l'événement</span>
              <span *ngIf="!evenement?.id">Nouvel événement</span>
            </h3>
            <button 
              (click)="onFermer()" 
              class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form [formGroup]="evenementForm" (ngSubmit)="onSubmit()">
            <!-- Titre -->
            <div class="mb-4">
              <label for="titre" class="block text-sm font-medium mb-1">Titre *</label>
              <input 
                type="text" 
                id="titre" 
                formControlName="titre"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                [ngClass]="{'border-red-500': submitted && f['titre'].errors}"
              >
              <div *ngIf="submitted && f['titre'].errors" class="text-red-500 text-sm mt-1">
                Le titre est obligatoire
              </div>
            </div>
            
            <!-- Description -->
            <div class="mb-4">
              <label for="description" class="block text-sm font-medium mb-1">Description</label>
              <textarea 
                id="description" 
                formControlName="description"
                rows="3"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              ></textarea>
            </div>
            
            <!-- Lieu -->
            <div class="mb-4">
              <label for="lieu" class="block text-sm font-medium mb-1">Lieu</label>
              <input 
                type="text" 
                id="lieu" 
                formControlName="lieu"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              >
            </div>
            
            <!-- Journée entière -->
            <div class="mb-4 flex items-center">
              <input 
                type="checkbox" 
                id="estJourneeEntiere" 
                formControlName="estJourneeEntiere"
                class="mr-2"
              >
              <label for="estJourneeEntiere" class="text-sm font-medium">Journée entière</label>
            </div>
            
            <!-- Date et heure de début -->
            <div class="mb-4">
              <label for="dateDebut" class="block text-sm font-medium mb-1">Début *</label>
              <input 
                type="datetime-local" 
                id="dateDebut" 
                formControlName="dateDebut"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                [ngClass]="{'border-red-500': submitted && f['dateDebut'].errors}"
              >
              <div *ngIf="submitted && f['dateDebut'].errors" class="text-red-500 text-sm mt-1">
                La date de début est obligatoire
              </div>
            </div>
            
            <!-- Date et heure de fin -->
            <div class="mb-4">
              <label for="dateFin" class="block text-sm font-medium mb-1">Fin *</label>
              <input 
                type="datetime-local" 
                id="dateFin" 
                formControlName="dateFin"
                class="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                [ngClass]="{'border-red-500': submitted && f['dateFin'].errors}"
              >
              <div *ngIf="submitted && f['dateFin'].errors" class="text-red-500 text-sm mt-1">
                La date de fin est obligatoire
              </div>
            </div>
            
            <!-- Couleurs -->
            <div class="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label for="couleurFond" class="block text-sm font-medium mb-1">Couleur de fond</label>
                <input 
                  type="color" 
                  id="couleurFond" 
                  formControlName="couleurFond"
                  class="w-full h-10 border rounded-md"
                >
              </div>
              <div>
                <label for="couleurTexte" class="block text-sm font-medium mb-1">Couleur du texte</label>
                <input 
                  type="color" 
                  id="couleurTexte" 
                  formControlName="couleurTexte"
                  class="w-full h-10 border rounded-md"
                >
              </div>
            </div>
            
            <!-- Boutons -->
            <div class="flex justify-between mt-6">
              <button 
                type="button"
                *ngIf="evenement?.id"
                (click)="onSupprimer()"
                class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                Supprimer
              </button>
              <div class="flex gap-2 ml-auto">
                <button 
                  type="button"
                  (click)="onFermer()"
                  class="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                  Annuler
                </button>
                <button 
                  type="submit"
                  class="px-4 py-2 bg-primary-light dark:bg-primary-dark text-white rounded-md hover:opacity-90 transition-opacity">
                  <span *ngIf="evenement?.id">Mettre à jour</span>
                  <span *ngIf="!evenement?.id">Créer</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [ReactiveFormsModule, NgClass, NgIf]
})
export class FormulaireEvenementComponent implements OnInit, OnChanges {
  @Input() evenement: Evenement | null = null;
  @Output() fermer = new EventEmitter<void>();
  @Output() sauvegarder = new EventEmitter<Evenement>();
  
  evenementForm!: FormGroup;
  submitted = false;
  
  constructor(private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.initForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['evenement'] && this.evenementForm) {
      this.updateForm();
    }
  }
  
  /**
   * Initialise le formulaire avec des valeurs par défaut
   */
  initForm(): void {
    this.evenementForm = this.fb.group({
      id: [null],
      titre: ['', [Validators.required]],
      description: [''],
      dateDebut: ['', [Validators.required]],
      dateFin: ['', [Validators.required]],
      lieu: [''],
      estJourneeEntiere: [false],
      couleurFond: ['#4F46E5'],
      couleurTexte: ['#FFFFFF']
    });
    
    this.updateForm();
  }
  
  /**
   * Met à jour le formulaire avec les valeurs de l'événement
   */
  updateForm(): void {
    if (this.evenement) {
      // Formater les dates pour l'input datetime-local
      const dateDebut = this.formatDateForInput(this.evenement.dateDebut);
      const dateFin = this.formatDateForInput(this.evenement.dateFin);
      
      this.evenementForm.patchValue({
        id: this.evenement.id,
        titre: this.evenement.titre,
        description: this.evenement.description || '',
        dateDebut: dateDebut,
        dateFin: dateFin,
        lieu: this.evenement.lieu || '',
        estJourneeEntiere: this.evenement.estJourneeEntiere || false,
        couleurFond: this.evenement.couleurFond || '#4F46E5',
        couleurTexte: this.evenement.couleurTexte || '#FFFFFF'
      });
    }
  }
  
  /**
   * Formate une date pour l'input datetime-local
   */
  formatDateForInput(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().slice(0, 16); // Format "YYYY-MM-DDTHH:MM"
  }
  
  /**
   * Getter pour accéder facilement aux contrôles du formulaire
   */
  get f() { 
    return this.evenementForm.controls; 
  }
  
  /**
   * Gère la soumission du formulaire
   */
  onSubmit(): void {
    this.submitted = true;
    
    if (this.evenementForm.invalid) {
      return;
    }
    
    const evenementData = this.evenementForm.value;
    this.sauvegarder.emit(evenementData);
  }
  
  /**
   * Ferme le formulaire
   */
  onFermer(): void {
    this.fermer.emit();
  }
  /**
   * Supprime l'événement
   */
  onSupprimer(): void {
    if (this.evenement?.id) {
      if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
        // Simplification de l'objet de suppression - contient uniquement l'ID et le marqueur de suppression
        const deleteRequest = { 
          id: this.evenement.id,
          _delete: true 
        };
        
        console.log('FormulaireEvenement: NOUVELLE MÉTHODE - Demande de suppression:', deleteRequest);
        
        // Émission de l'événement de suppression
        this.sauvegarder.emit(deleteRequest as any);
      }
    }
  }
}
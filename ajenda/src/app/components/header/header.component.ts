import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { TokenStorageService } from '../../services/token-storage.service';
import { AuthStateService } from '../../services/auth-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  template: `
    <header class="bg-white dark:bg-gray-800 shadow-md">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center">
          <h1 class="text-2xl font-bold text-primary-light dark:text-primary-dark">
            <a [routerLink]="['/']" class="hover:text-indigo-600">Ajenda</a>
          </h1>
          <span class="ml-2 text-gray-500 dark:text-gray-400">Calendrier d'événements</span>
        </div>
        
        <div class="flex items-center space-x-4">
          <!-- Navigation links -->
          <nav class="hidden md:flex space-x-4 mr-4">
            <a *ngIf="isLoggedIn" [routerLink]="['/calendar']" 
               class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Calendrier
            </a>
            <a *ngIf="isLoggedIn" [routerLink]="['/profile']" 
               class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Mon Profil ({{ username }})
            </a>
            <a *ngIf="!isLoggedIn" [routerLink]="['/login']" 
               class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Se connecter
            </a>
            <a *ngIf="!isLoggedIn" [routerLink]="['/register']" 
               class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              S'inscrire
            </a>
            <a *ngIf="isLoggedIn" (click)="logout()" style="cursor: pointer;"
               class="text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400">
              Se déconnecter
            </a>
          </nav>
          
          <app-theme-toggle></app-theme-toggle>
        </div>
      </div>
    </header>
  `,
  standalone: true,
  imports: [ThemeToggleComponent, CommonModule, RouterLink]
})
export class HeaderComponent implements OnInit, OnDestroy {
  isLoggedIn = false;
  username: string = '';
  private authSubscription: Subscription | null = null;
  private userSubscription: Subscription | null = null;

  constructor(
    private tokenStorageService: TokenStorageService,
    private authState: AuthStateService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // S'abonner aux changements d'état d'authentification
    this.authSubscription = this.authState.isLoggedIn().subscribe(isLoggedIn => {
      this.isLoggedIn = isLoggedIn;
      
      // Si l'utilisateur est connecté, mettre à jour le nom d'utilisateur
      if (isLoggedIn) {
        this.userSubscription = this.authState.getCurrentUser().subscribe(user => {
          if (user) {
            this.username = user.username;
          }
        });
      }
    });

    // Initialiser l'état au démarrage
    const token = this.tokenStorageService.getToken();
    this.isLoggedIn = !!token;
    
    if (this.isLoggedIn) {
      const user = this.tokenStorageService.getUser();
      this.username = user?.username || '';
    }
  }

  ngOnDestroy(): void {
    // Se désabonner pour éviter les fuites de mémoire
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.tokenStorageService.signOut();
    this.authState.logout();
    this.isLoggedIn = false;
    this.username = '';
    this.router.navigate(['/login']);
  }
} 
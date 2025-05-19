import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';
import { TokenStorageService } from '../../services/token-storage.service';
import { AuthStateService } from '../../services/auth-state.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Connexion à votre compte</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div>
            <label for="username" class="block text-sm font-medium leading-6">Nom d'utilisateur</label>
            <div class="mt-2">
              <input id="username" name="username" type="text" required
                [(ngModel)]="form.username" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6">Mot de passe</label>
            </div>
            <div class="mt-2">
              <input id="password" name="password" type="password" required
                [(ngModel)]="form.password" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div *ngIf="isLoginFailed" class="p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-800">
            {{ errorMessage }}
          </div>

          <div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Se connecter
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500">
          Vous n'avez pas de compte ?
          <a [routerLink]="['/register']" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Inscrivez-vous ici
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent implements OnInit {
  form: LoginRequest = {
    username: '',
    password: ''
  };
  isLoggedIn = false;
  isLoginFailed = false;
  errorMessage = '';

  constructor(
    private authService: AuthService, 
    private tokenStorage: TokenStorageService,
    private authState: AuthStateService,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Vérifier s'il y a déjà un token valide
    const token = this.tokenStorage.getToken();
    if (token) {
      try {
        // Vérification basique de la validité du token
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.warn('Token format invalide, déconnexion...');
          this.tokenStorage.signOut();
          return;
        }
        
        // Vérification de l'expiration
        const payload = JSON.parse(atob(tokenParts[1]));
        const expirationDate = new Date(payload.exp * 1000);
        const now = new Date();
        
        console.log('Vérification du token existant - Expiration:', expirationDate, 'Maintenant:', now);
        
        if (expirationDate > now) {
          console.log('Token valide, redirection vers calendrier');
          this.isLoggedIn = true;
          this.router.navigate(['/calendar']);
        } else {
          console.warn('Token expiré, déconnexion...');
          this.tokenStorage.signOut();
        }
      } catch (e) {
        console.error('Erreur lors de la vérification du token:', e);
        this.tokenStorage.signOut();
      }
    }
  }

  onSubmit(): void {
    console.log('Tentative de connexion avec:', this.form.username);
    this.authService.login(this.form).subscribe({
      next: data => {
        console.log('Réponse de connexion reçue:', data);
        
        if (!data.token) {
          console.error('Aucun token dans la réponse');
          this.errorMessage = 'Erreur de connexion: aucun token reçu';
          this.isLoginFailed = true;
          return;
        }
        
        // Vérifier le format du token
        const tokenParts = data.token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Format de token invalide');
          this.errorMessage = 'Erreur de connexion: format de token invalide';
          this.isLoginFailed = true;
          return;
        }
        
        // Décoder le token pour afficher des informations
        try {
          const payload = JSON.parse(atob(tokenParts[1]));
          const expirationDate = new Date(payload.exp * 1000);
          console.log('Token décodé:', payload);
          console.log('Date d\'expiration:', expirationDate);
          
          // Sauvegarder le token et les données utilisateur
          this.tokenStorage.saveToken(data.token);
          this.tokenStorage.saveUser(data);
          
          // Notifier le changement d'état d'authentification
          this.authState.login(data);
          
          console.log('Token stocké avec succès');
          
          this.isLoginFailed = false;
          this.isLoggedIn = true;
          this.router.navigate(['/calendar']);
        } catch (e) {
          console.error('Erreur lors du décodage du token:', e);
          this.errorMessage = 'Erreur lors du traitement du token';
          this.isLoginFailed = true;
        }
      },
      error: err => {
        console.error('Erreur de connexion:', err);
        this.errorMessage = err.error?.message || 'Identifiants incorrects ou serveur indisponible';
        this.isLoginFailed = true;
      }
    });
  }
} 
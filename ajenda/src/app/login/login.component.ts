import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LoginRequest } from '../models/auth.models';
import { AuthService } from '../services/auth.service';
import { TokenStorageService } from '../services/token-storage.service';

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
                [(ngModel)]="form.username" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div>
            <div class="flex items-center justify-between">
              <label for="password" class="block text-sm font-medium leading-6">Mot de passe</label>
            </div>
            <div class="mt-2">
              <input id="password" name="password" type="password" required
                [(ngModel)]="form.password" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
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
          <a routerLink="/register" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Inscrivez-vous ici
          </a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
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
    private router: Router
  ) { }

  ngOnInit(): void {
    if (this.tokenStorage.getToken()) {
      this.isLoggedIn = true;
      this.router.navigate(['/calendar']);
    }
  }

  onSubmit(): void {
    this.authService.login(this.form).subscribe({
      next: data => {
        this.tokenStorage.saveToken(data.token);
        this.tokenStorage.saveUser(data);
        this.isLoginFailed = false;
        this.isLoggedIn = true;
        this.router.navigate(['/calendar']);
      },
      error: err => {
        this.errorMessage = err.error.message || 'Erreur de connexion';
        this.isLoginFailed = true;
      }
    });
  }
} 
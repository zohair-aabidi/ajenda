import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SignupRequest } from '../../models/auth.models';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterLink],
  template: `
    <div class="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
      <div class="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 class="mt-10 text-center text-2xl font-bold leading-9 tracking-tight">Créer un compte</h2>
      </div>

      <div class="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form class="space-y-6" (ngSubmit)="onSubmit()" #registerForm="ngForm">
          <div>
            <label for="username" class="block text-sm font-medium leading-6">Nom d'utilisateur</label>
            <div class="mt-2">
              <input id="username" name="username" type="text" required
                [(ngModel)]="form.username" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium leading-6">Email</label>
            <div class="mt-2">
              <input id="email" name="email" type="email" required
                [(ngModel)]="form.email" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium leading-6">Mot de passe</label>
            <div class="mt-2">
              <input id="password" name="password" type="password" required
                [(ngModel)]="form.password" class="block w-full rounded-md border-0 py-1.5 px-2 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
            </div>
          </div>
          
          <div *ngIf="isSuccessful" class="p-4 mb-4 text-sm rounded-lg bg-green-100 text-green-800">
            Inscription réussie !
          </div>

          <div *ngIf="isSignUpFailed" class="p-4 mb-4 text-sm rounded-lg bg-red-100 text-red-800">
            {{ errorMessage }}
          </div>

          <div>
            <button type="submit" class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              S'inscrire
            </button>
          </div>
        </form>

        <p class="mt-10 text-center text-sm text-gray-500">
          Déjà inscrit ?
          <a [routerLink]="['/login']" class="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
            Connectez-vous ici
          </a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  form: SignupRequest = {
    username: '',
    email: '',
    password: ''
  };
  isSuccessful = false;
  isSignUpFailed = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  onSubmit(): void {
    this.authService.register(this.form).subscribe({
      next: data => {
        this.isSuccessful = true;
        this.isSignUpFailed = false;
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: err => {
        this.errorMessage = err.error.message || "Une erreur s'est produite lors de l'inscription";
        this.isSignUpFailed = true;
      }
    });
  }
} 
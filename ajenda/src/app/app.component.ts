import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div class="min-h-screen flex flex-col">
      <app-header></app-header>
      <main class="flex-grow p-4">
        <router-outlet></router-outlet>
      </main>
      <footer class="bg-gray-100 dark:bg-gray-800 p-4 text-center text-sm">
        <p>© 2025 Ajenda - Application simple d'agenda d'événements</p>
      </footer>
    </div>
  `,
  styleUrl: './app.component.css',
  standalone: true
})
export class AppComponent implements OnInit {
  
  constructor() {}
  
  ngOnInit(): void {
    // Vérifier si l'utilisateur préfère le thème sombre
    if (localStorage.getItem('theme') === 'dark' || 
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}

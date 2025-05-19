import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

/**
 * Service pour gérer le thème de l'application (clair/sombre)
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Stocke l'état actuel du thème (true = sombre, false = clair)
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  
  // Observable pour suivre les changements de thème
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    // Initialiser avec le thème stocké ou les préférences système
    this.initTheme();
  }

  /**
   * Initialise le thème en fonction des préférences stockées ou système
   */
  private initTheme(): void {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const isDark = savedTheme === 'dark' || (!savedTheme && prefersDark);
    this.setDarkTheme(isDark);
  }

  /**
   * Définit le thème sombre ou clair
   */
  setDarkTheme(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    this.isDarkTheme.next(isDark);
  }

  /**
   * Bascule entre les thèmes sombre et clair
   */
  toggleTheme(): void {
    this.setDarkTheme(!this.isDarkTheme.value);
  }
} 
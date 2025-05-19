import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { TokenStorageService } from './token-storage.service';

@Injectable({
  providedIn: 'root'
})
export class AuthStateService {
  private loggedIn = new BehaviorSubject<boolean>(false);
  private userSubject = new BehaviorSubject<any>(null);

  constructor(private tokenStorage: TokenStorageService) {
    // Initialiser l'état d'authentification au démarrage
    this.checkAuthState();
    console.log('AuthState: Service initialisé, état de connexion:', this.loggedIn.value);
  }

  private checkAuthState(): void {
    const token = this.tokenStorage.getToken();
    const user = this.tokenStorage.getUser();
    
    console.log('AuthState: Vérification de l\'état d\'authentification');
    console.log('AuthState: Token présent:', !!token);
    console.log('AuthState: Utilisateur présent:', !!user);
    
    if (token && user) {
      this.loggedIn.next(true);
      this.userSubject.next(user);
      
      // Vérification des rôles
      if (user.roles && user.roles.length > 0) {
        console.log('AuthState: Rôles utilisateur:', user.roles);
      } else {
        console.warn('AuthState: Aucun rôle trouvé pour l\'utilisateur');
      }
    } else {
      this.loggedIn.next(false);
      this.userSubject.next(null);
    }
  }

  // Méthode à appeler après connexion réussie
  login(user: any): void {
    console.log('AuthState: Connexion utilisateur:', user.username);
    this.loggedIn.next(true);
    this.userSubject.next(user);
    console.log('AuthState: État mis à jour, connecté:', this.loggedIn.value);
    
    // Vérification des rôles
    if (user.roles && user.roles.length > 0) {
      console.log('AuthState: Rôles utilisateur:', user.roles);
    } else {
      console.warn('AuthState: Aucun rôle trouvé pour l\'utilisateur');
    }
  }

  // Méthode à appeler après déconnexion
  logout(): void {
    console.log('AuthState: Déconnexion utilisateur');
    this.loggedIn.next(false);
    this.userSubject.next(null);
    console.log('AuthState: État mis à jour, connecté:', this.loggedIn.value);
  }

  // Observable pour vérifier si l'utilisateur est connecté
  isLoggedIn(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  // Observable pour obtenir les informations de l'utilisateur
  getCurrentUser(): Observable<any> {
    return this.userSubject.asObservable();
  }
  
  // Vérifier si l'utilisateur a un rôle spécifique
  hasRole(role: string): boolean {
    const user = this.userSubject.value;
    
    if (!user || !user.roles) {
      console.log('AuthState: Vérification de rôle impossible, utilisateur non défini ou sans rôles');
      return false;
    }
    
    // Gestion des préfixes de rôle
    const roleWithPrefix = role.startsWith('ROLE_') ? role : 'ROLE_' + role;
    const hasRole = user.roles.includes(role) || user.roles.includes(roleWithPrefix);
    
    console.log(`AuthState: Vérification du rôle ${role} (ou ${roleWithPrefix}):`, hasRole);
    return hasRole;
  }
} 
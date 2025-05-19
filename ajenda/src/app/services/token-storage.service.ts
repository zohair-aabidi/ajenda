import { Injectable } from '@angular/core';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

@Injectable({
  providedIn: 'root'
})
export class TokenStorageService {
  
  constructor() { }

  signOut(): void {
    console.log('TokenStorage: Déconnexion et suppression des données de session');
    window.sessionStorage.clear();
  }

  public saveToken(token: string): void {
    window.sessionStorage.removeItem(TOKEN_KEY);
    window.sessionStorage.setItem(TOKEN_KEY, token);
    console.log('TokenStorage: Token enregistré, longueur:', token.length);
  }

  public getToken(): string | null {
    const token = window.sessionStorage.getItem(TOKEN_KEY);
    if (token) {
      console.log('TokenStorage: Token récupéré, longueur:', token.length);
    } else {
      console.log('TokenStorage: Aucun token disponible');
    }
    return token;
  }

  public saveUser(user: any): void {
    window.sessionStorage.removeItem(USER_KEY);
    window.sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    console.log('TokenStorage: Données utilisateur enregistrées:', user.username);
  }

  public getUser(): any {
    const user = window.sessionStorage.getItem(USER_KEY);
    if (user) {
      const userData = JSON.parse(user);
      console.log('TokenStorage: Données utilisateur récupérées:', userData.username);
      return userData;
    }
    console.log('TokenStorage: Aucune donnée utilisateur disponible');
    return null;
  }

  public isLoggedIn(): boolean {
    const hasToken = this.getToken() !== null;
    console.log('TokenStorage: Statut de connexion:', hasToken);
    return hasToken;
  }

  public hasRole(role: string): boolean {
    const user = this.getUser();
    return user && user.roles && user.roles.includes(role);
  }
} 
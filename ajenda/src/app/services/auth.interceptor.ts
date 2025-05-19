import { Injectable, inject } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse, HttpInterceptorFn, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';
import { Router } from '@angular/router';

const TOKEN_HEADER_KEY = 'Authorization';

// Function-based interceptor for newer Angular versions
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const tokenService = inject(TokenStorageService);
  const router = inject(Router);
  
  let authReq = req;
  const token = tokenService.getToken();
  
  console.log('Intercepteur: URL demandée:', req.url);
  console.log('Intercepteur: Méthode HTTP:', req.method);
  
  // Skip token for auth endpoints
  const isAuthUrl = req.url.includes('/api/auth/');
  if (isAuthUrl) {
    console.log('Intercepteur: Requête d\'authentification, pas besoin de token');
    return next(req);
  }
  
  // Vérifier si le token est valide avant de l'ajouter
  if (token != null) {
    try {
      // Vérification simple du format JWT (3 parties séparées par des points)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.error('Intercepteur: Format de token JWT invalide');
        tokenService.signOut();
        router.navigate(['/login']);
        return throwError(() => new Error('Token format invalid'));
      }
      
      // Vérification basique de l'expiration du token
      const payload = JSON.parse(atob(tokenParts[1]));
      const expiration = payload.exp * 1000; // Convertir en millisecondes
      const now = Date.now();
      
      console.log('Intercepteur: Expiration du token:', new Date(expiration), 'Maintenant:', new Date(now));
      
      if (expiration < now) {
        console.error('Intercepteur: Token expiré');
        tokenService.signOut();
        router.navigate(['/login']);
        return throwError(() => new Error('Token expired'));
      }
      
      console.log('Intercepteur: Token valide, ajout à la requête, longueur:', token.length);
      // Ajouter le token à toutes les requêtes
      authReq = req.clone({ 
        headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token)
      });
      
      // Log spécifique pour les requêtes POST vers l'API d'événements
      if (req.method === 'POST' && req.url.includes('/api/evenements')) {
        console.log('Intercepteur: Requête POST vers API événements avec token:', {
          url: req.url,
          headers: authReq.headers.keys(),
          hasAuthHeader: authReq.headers.has(TOKEN_HEADER_KEY),
          authHeader: authReq.headers.get(TOKEN_HEADER_KEY)?.substring(0, 20) + '...'
        });
      }
      console.log('Intercepteur: En-tête Authorization ajouté:', authReq.headers.get(TOKEN_HEADER_KEY));
    } catch (e) {
      console.error('Intercepteur: Erreur lors de la validation du token', e);
      tokenService.signOut();
      router.navigate(['/login']);
      return throwError(() => e);
    }
  } else {
    console.warn('Intercepteur: Aucun token disponible pour la requête');
    if (!isAuthUrl) {
      console.warn('Intercepteur: Requête non authentifiée vers une URL protégée');
      // Ne pas rediriger immédiatement, mais ajouter un message d'erreur dans la console
      console.error('Intercepteur: Tentative d\'accès à une ressource protégée sans authentification');
      // Retourner une erreur pour éviter que la requête ne soit envoyée sans token
      return throwError(() => new Error('Authentification requise'));
    }
  }
  
  // Ajouter un log de tous les en-têtes juste avant l'envoi de la requête
  console.log('Intercepteur: En-têtes finaux de la requête:');
  authReq.headers.keys().forEach(key => {
    console.log(`- ${key}: ${authReq.headers.get(key)}`);
  });
  
  return next(authReq).pipe(
    tap(event => {
      // Option pour déboguer les réponses réussies
    }),
    catchError((error: HttpErrorResponse) => {
      console.error('Intercepteur: Erreur HTTP:', error);
      
      if (error.status === 401) {
        console.error('Intercepteur: Erreur 401 Unauthorized');
        tokenService.signOut();
        router.navigate(['/login']);
      }
      
      return throwError(() => error);
    })
  );
};

// Keep the class-based interceptor for backward compatibility
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(
    private tokenService: TokenStorageService,
    private router: Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    let authReq = req;
    const token = this.tokenService.getToken();
    
    console.log('Intercepteur: URL demandée:', req.url);
    console.log('Intercepteur: Méthode HTTP:', req.method);
    
    // Skip token for auth endpoints
    const isAuthUrl = req.url.includes('/api/auth/');
    if (isAuthUrl) {
      console.log('Intercepteur: Requête d\'authentification, pas besoin de token');
      return next.handle(req);
    }
    
    // Vérifier si le token est valide avant de l'ajouter
    if (token != null) {
      try {
        // Vérification simple du format JWT (3 parties séparées par des points)
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          console.error('Intercepteur: Format de token JWT invalide');
          this.tokenService.signOut();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Token format invalid'));
        }
        
        // Vérification basique de l'expiration du token
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiration = payload.exp * 1000; // Convertir en millisecondes
        const now = Date.now();
        
        console.log('Intercepteur: Expiration du token:', new Date(expiration), 'Maintenant:', new Date(now));
        
        if (expiration < now) {
          console.error('Intercepteur: Token expiré');
          this.tokenService.signOut();
          this.router.navigate(['/login']);
          return throwError(() => new Error('Token expired'));
        }
        
        console.log('Intercepteur: Token valide, ajout à la requête, longueur:', token.length);
        // Ajouter le token à toutes les requêtes
        authReq = req.clone({ 
          headers: req.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token)
        });
        
        // Log spécifique pour les requêtes POST vers l'API d'événements
        if (req.method === 'POST' && req.url.includes('/api/evenements')) {
          console.log('Intercepteur: Requête POST vers API événements avec token:', {
            url: req.url,
            headers: authReq.headers.keys(),
            hasAuthHeader: authReq.headers.has(TOKEN_HEADER_KEY),
            authHeader: authReq.headers.get(TOKEN_HEADER_KEY)?.substring(0, 20) + '...'
          });
        }
        console.log('Intercepteur: En-tête Authorization ajouté:', authReq.headers.get(TOKEN_HEADER_KEY));
      } catch (e) {
        console.error('Intercepteur: Erreur lors de la validation du token', e);
        this.tokenService.signOut();
        this.router.navigate(['/login']);
        return throwError(() => e);
      }
    } else {
      console.warn('Intercepteur: Aucun token disponible pour la requête');
      if (!isAuthUrl) {
        console.warn('Intercepteur: Requête non authentifiée vers une URL protégée');
        // Ne pas rediriger immédiatement, mais ajouter un message d'erreur dans la console
        console.error('Intercepteur: Tentative d\'accès à une ressource protégée sans authentification');
        // Retourner une erreur pour éviter que la requête ne soit envoyée sans token
        return throwError(() => new Error('Authentification requise'));
      }
    }
    
    // Ajouter un log de tous les en-têtes juste avant l'envoi de la requête
    console.log('Intercepteur: En-têtes finaux de la requête:');
    authReq.headers.keys().forEach(key => {
      console.log(`- ${key}: ${authReq.headers.get(key)}`);
    });
    
    // Traiter la réponse et gérer les erreurs d'authentification
    return next.handle(authReq).pipe(
      tap(event => {
        // Option pour déboguer les réponses réussies
        // console.log('Intercepteur: Réponse réussie:', event);
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Intercepteur: Erreur HTTP:', error);
        
        if (error.status === 401) {
          console.error('Intercepteur: Erreur 401 Unauthorized', {
            url: req.url,
            hasToken: !!token,
            tokenLength: token ? token.length : 0
          });
          
          // Si erreur 401 (non autorisé), déconnecter l'utilisateur
          this.tokenService.signOut();
          this.router.navigate(['/login']);
        }
        
        return throwError(() => error);
      })
    );
  }
}

export const authInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
];
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { JwtResponse, LoginRequest, MessageResponse, SignupRequest } from '../models/auth.models';

const AUTH_API = 'http://localhost:8080/api/auth/';

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private http: HttpClient) { }

  login(loginRequest: LoginRequest): Observable<JwtResponse> {
    return this.http.post<JwtResponse>(AUTH_API + 'signin', loginRequest, httpOptions);
  }

  register(signupRequest: SignupRequest): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(AUTH_API + 'signup', signupRequest, httpOptions);
  }
} 
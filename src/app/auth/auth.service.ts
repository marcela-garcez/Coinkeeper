import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

type LoginBody = { username: string; password: string };
type LoginResponse = { token: string } | string;

const TOKEN_KEY = 'token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  constructor(private http: HttpClient, private router: Router) {}

  login(body: LoginBody): Observable<boolean> {
    return this.http.post<LoginResponse>('/api/auth/login', body).pipe(
      map((res) => {
        const raw = typeof res === 'string' ? res : res?.token ?? '';
        const token = raw.replace(/^Bearer\s+/i, '');
        if (!token) throw new Error('Token ausente na resposta');

        localStorage.setItem(TOKEN_KEY, token);

        // Remove duplicatas
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i)!;
          if (k !== TOKEN_KEY && localStorage.getItem(k) === token) {
            localStorage.removeItem(k);
          }
        }
        return true;
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']); // << redireciona para login
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

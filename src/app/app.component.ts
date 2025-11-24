import { Component, inject } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { filter } from 'rxjs/operators';
import { CommonModule, NgIf } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, CommonModule, NgIf],
  template: `
    <div class="app-container">

      <!-- SIDEBAR -->
      <nav class="sidebar" 
           [class.collapsed]="isCollapsed"
           *ngIf="auth.isLoggedIn() && !isLoginScreen">
        
        <div class="sidebar-header">
          <span class="brand">💰 Coinkeeper</span>
          <button class="toggle-btn" (click)="toggleSidebar()">☰</button>
        </div>

        <ul class="nav">
          <li class="nav-item"><a class="nav-link" routerLink="/home" routerLinkActive="active">🏠 <span>Home</span></a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/lancamentos" routerLinkActive="active">💰 <span>Lançamentos</span></a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/contas" routerLinkActive="active">💳 <span>Contas</span></a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/centroCustos" routerLinkActive="active">📊 <span>Centros de Custos</span></a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/pessoas" routerLinkActive="active">👥 <span>Pessoas</span></a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/usuarios" routerLinkActive="active">🧑‍💼 <span>Usuários</span></a></li>
          <li class="nav-item"><a class="nav-link" routerLink="/extrato" routerLinkActive="active">📈 <span>Extrato</span></a></li>
        </ul>

        <div class="sidebar-footer">
          <button class="logout-btn" (click)="auth.logout()">Sair</button>
        </div>
      </nav>

      <!-- CONTEÚDO -->
      <main class="main-content"
      [class.expanded]="isCollapsed"
      [class.no-margin]="isLoginScreen">

        <router-outlet></router-outlet>
      </main>

    </div>
  `,
  styleUrls: ['../app.component.css']
})
export class AppComponent {
  auth = inject(AuthService);
  router = inject(Router);

  isCollapsed = false;
  isLoginScreen = false;

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;

        this.isLoginScreen = 
          url.startsWith('/login') || 
          url.startsWith('/cadastro');
      });
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }
}

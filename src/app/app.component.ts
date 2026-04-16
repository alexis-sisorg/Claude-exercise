import { Component, OnInit, inject, computed } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';
import { BoardCreateModalComponent } from './features/board-create-modal/board-create-modal.component';
import { AuthService } from './services/auth.service';
import { Board } from './models/board.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BoardCreateModalComponent],
  styleUrl: './app.component.css',
  template: `
    <div class="app-shell">

      @if (!isAuthRoute()) {
        <header class="app-header">
          <div class="nav-inner">

            <div class="nav-brand">
              <svg class="brand-icon" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2L21.5 7.5V16.5L12 22L2.5 16.5V7.5L12 2Z"
                      stroke="url(#hex-grad)" stroke-width="1.5" fill="none"/>
                <circle cx="12" cy="12" r="3" fill="url(#hex-grad)"/>
                <defs>
                  <linearGradient id="hex-grad" x1="2.5" y1="2" x2="21.5" y2="22" gradientUnits="userSpaceOnUse">
                    <stop offset="0%" stop-color="#818CF8"/>
                    <stop offset="100%" stop-color="#67E8F9"/>
                  </linearGradient>
                </defs>
              </svg>
              <span class="brand-name">WorkSpace</span>
              <span class="brand-tag">v1.0</span>
            </div>

            <div class="nav-links">
              <a class="nav-link nav-link--active" href="#">Boards</a>
              <a class="nav-link" href="#">Activity</a>
              <a class="nav-link" href="#">Settings</a>
            </div>

            <div class="nav-actions">
              <div class="status-dot" title="All systems operational">
                <span class="status-pulse"></span>
              </div>
              <div class="nav-sep" aria-hidden="true"></div>

              <!-- Theme toggle -->
              <button
                class="theme-toggle"
                (click)="toggleTheme()"
                [attr.aria-label]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
                [title]="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
              >
                @if (isDark) {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4.5"/>
                    <line x1="12" y1="2"    x2="12" y2="4.5"/>
                    <line x1="12" y1="19.5" x2="12" y2="22"/>
                    <line x1="4.93" y1="4.93"   x2="6.7"   y2="6.7"/>
                    <line x1="17.3" y1="17.3"   x2="19.07" y2="19.07"/>
                    <line x1="2"    y1="12"      x2="4.5"   y2="12"/>
                    <line x1="19.5" y1="12"      x2="22"    y2="12"/>
                    <line x1="4.93" y1="19.07"   x2="6.7"   y2="17.3"/>
                    <line x1="17.3" y1="6.7"     x2="19.07" y2="4.93"/>
                  </svg>
                } @else {
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                       stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                  </svg>
                }
              </button>

              <button class="btn-new-board" (click)="openCreateModal()">
                <span class="btn-plus">+</span> New Board
              </button>

              @if (currentUser()) {
                <div class="nav-sep" aria-hidden="true"></div>
                <div class="nav-user">
                  <span class="nav-username">{{ currentUser()!.name }}</span>
                  <button class="btn-logout" (click)="logout()" title="Sign out" aria-label="Sign out">
                    <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                      <path d="M6 2H3a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M10 11l3-3-3-3M13 8H6"
                            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              }
            </div>

          </div>
        </header>
      }

      <main class="app-main">
        <router-outlet />
      </main>

    </div>

    <!-- New board modal -->
    @if (showCreateModal) {
      <app-board-create-modal
        (closeModal)="closeCreateModal()"
        (boardCreated)="onBoardCreated($event)"
      />
    }
  `
})
export class AppComponent implements OnInit {
  private router      = inject(Router);
  private authService = inject(AuthService);

  isDark = true;
  showCreateModal = false;

  private currentUrl = toSignal(
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      map(e => (e as NavigationEnd).urlAfterRedirects),
      startWith(this.router.url)
    ),
    { requireSync: true }
  );

  readonly isAuthRoute  = computed(() => this.currentUrl().startsWith('/login'));
  readonly currentUser  = this.authService.user;

  ngOnInit() {
    const saved = localStorage.getItem('theme');
    this.isDark = saved !== 'light';
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }

  toggleTheme() {
    this.isDark = !this.isDark;
    const theme = this.isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }

  openCreateModal() {
    this.showCreateModal = true;
  }

  closeCreateModal() {
    this.showCreateModal = false;
  }

  onBoardCreated(board: Board) {
    this.showCreateModal = false;
    this.router.navigate(['/board', board.id]);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}

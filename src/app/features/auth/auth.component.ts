import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

type AuthView = 'login' | 'register' | 'forgot';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.css',
})
export class AuthComponent {
  private authService = inject(AuthService);
  private router      = inject(Router);

  view         = signal<AuthView>('login');
  loading      = signal(false);
  error        = signal('');
  forgotSent   = signal(false);
  showPassword = signal(false);

  // Form fields
  name        = '';
  email       = '';
  password    = '';
  forgotEmail = '';

  constructor() {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']);
    }
  }

  setView(v: AuthView) {
    this.view.set(v);
    this.error.set('');
    this.forgotSent.set(false);
    this.name = this.email = this.password = this.forgotEmail = '';
    this.showPassword.set(false);
  }

  togglePassword() { this.showPassword.update(v => !v); }

  async onLogin() {
    if (this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Something went wrong');
    } finally {
      this.loading.set(false);
    }
  }

  async onRegister() {
    if (this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.register(this.name, this.email, this.password);
      this.router.navigate(['/']);
    } catch (e: any) {
      this.error.set(e.message ?? 'Something went wrong');
    } finally {
      this.loading.set(false);
    }
  }

  async onForgot() {
    if (this.loading()) return;
    this.error.set('');
    this.loading.set(true);
    try {
      await this.authService.forgotPassword(this.forgotEmail);
      this.forgotSent.set(true);
    } catch (e: any) {
      this.error.set(e.message ?? 'Something went wrong');
    } finally {
      this.loading.set(false);
    }
  }
}

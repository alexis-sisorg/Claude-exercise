import { Injectable, signal } from '@angular/core';

export interface AuthUser {
  name: string;
  email: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(null);
  private _isAuthenticated = signal(false);

  readonly user = this._user.asReadonly();
  readonly isAuthenticated = this._isAuthenticated.asReadonly();

  constructor() {
    const stored = localStorage.getItem('ws_user');
    if (stored) {
      try {
        this._user.set(JSON.parse(stored));
        this._isAuthenticated.set(true);
      } catch {
        localStorage.removeItem('ws_user');
      }
    }
  }

  async login(email: string, password: string): Promise<void> {
    await delay(900);
    if (!email.includes('@') || !password.trim()) {
      throw new Error('Invalid email or password');
    }
    this._persist({ name: email.split('@')[0], email });
  }

  async register(name: string, email: string, password: string): Promise<void> {
    await delay(1000);
    if (!name.trim())           throw new Error('Name is required');
    if (!email.includes('@'))   throw new Error('Enter a valid email');
    if (password.length < 6)    throw new Error('Password must be at least 6 characters');
    this._persist({ name: name.trim(), email });
  }

  async forgotPassword(email: string): Promise<void> {
    await delay(700);
    if (!email.includes('@')) throw new Error('Enter a valid email');
    // Resolves successfully — UI shows confirmation
  }

  logout(): void {
    this._user.set(null);
    this._isAuthenticated.set(false);
    localStorage.removeItem('ws_user');
  }

  private _persist(user: AuthUser): void {
    this._user.set(user);
    this._isAuthenticated.set(true);
    localStorage.setItem('ws_user', JSON.stringify(user));
  }
}

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, ms));
}

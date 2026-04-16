import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/auth.component')
        .then(m => m.AuthComponent)
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/boards-list/boards-list.component')
        .then(m => m.BoardsListComponent)
  },
  {
    path: 'board/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/board-detail/board-detail.component')
        .then(m => m.BoardDetailComponent)
  },
  {
    path: '**',
    loadComponent: () =>
      import('./features/not-found/not-found.component')
        .then(m => m.NotFoundComponent)
  }
];

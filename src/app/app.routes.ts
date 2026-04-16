import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/boards-list/boards-list.component')
        .then(m => m.BoardsListComponent)
  },
  {
    path: 'board/:id',
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

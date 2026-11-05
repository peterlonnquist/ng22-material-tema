import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Start – Material tema-demo',
    loadComponent: () => import('./start/start').then((m) => m.Start),
  },
  {
    path: 'skapa',
    title: 'Skapa ärende – Material tema-demo',
    loadComponent: () => import('./skapa/skapa').then((m) => m.Skapa),
  },
  { path: '**', redirectTo: '' },
];

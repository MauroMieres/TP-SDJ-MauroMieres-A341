import { Routes } from '@angular/router';

export const juegosRoutes: Routes = [
  {
    path: 'ahorcado',
    loadComponent: () => import('../ahorcado/ahorcado.component').then(m => m.AhorcadoComponent)
  },
  {
    path: 'mayor-menor',
    loadComponent: () => import('../mayor-menor/mayor-menor.component').then(m => m.MayorMenorComponent)
  },
  {
    path: 'rompecabezas',
    loadComponent: () =>
      import('../rompecabezas/rompecabezas.component').then(m => m.RompecabezasComponent)
  },
  {
    path: 'trivia',
    loadComponent: () =>
      import('../trivia/trivia.component').then(m => m.TriviaComponent)
  }
];

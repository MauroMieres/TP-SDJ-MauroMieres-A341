import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { QuienSoyComponent } from './components/quien-soy/quien-soy.component';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },
  { path: 'home', loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent) },
  { path: 'quien-soy', loadComponent: () => import('./components/quien-soy/quien-soy.component').then(m => m.QuienSoyComponent) },
  { path: 'chat', loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent) },

  {
    path: 'juegos',
    loadChildren: () => import('./components/juegos/juegos.routes').then(m => m.juegosRoutes)
  },

  { path: '**', component: LoginComponent }
];

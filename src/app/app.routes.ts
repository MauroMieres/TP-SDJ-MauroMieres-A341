import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { QuienSoyComponent } from './components/quien-soy/quien-soy.component';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'login',
        pathMatch: 'full'
    },
    {
        path: 'login',
        component : LoginComponent
    },
    {
        path: 'home',
        loadComponent: () => import('./components/home/home.component').then(m => m.HomeComponent),
    },
    {
        path: 'register',
        loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent),
    },
    {
        path: 'quien-soy',
        loadComponent: () => import('./components/quien-soy/quien-soy.component').then(m => m.QuienSoyComponent),
    },
    {
        path: 'chat',
        loadComponent: () => import('./components/chat/chat.component').then(m => m.ChatComponent),
    },
      {
        path: 'ahorcado',
        loadComponent: () => import('./components/ahorcado/ahorcado.component').then(m => m.AhorcadoComponent),
    },
    {
        path: 'mayor-menor',
        loadComponent: () => import('./components/mayor-menor/mayor-menor.component').then(m => m.MayorMenorComponent),
    },
    {
        path: '**',
        loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent),
    }
];

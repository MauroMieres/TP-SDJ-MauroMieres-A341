import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { UserData } from '../../models/user-data';
import { environment } from '../../../environments/environment';
import { CommonModule, NgFor } from '@angular/common';
import { CardJuegoComponent } from '../card-juego/card-juego.component';
import { Router } from '@angular/router'; 

//const supabase = createClient(environment.apiUrl, environment.publicAnonKey);
const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, CardJuegoComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})

export class HomeComponent implements OnInit {
  usersdata: UserData[] = [];
  user: any = null;

  constructor(private router: Router) {} // 👈 importante

  ngOnInit(): void {
    this.getSession();
    this.listenToAuthChanges();
  }

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    this.user = data?.session?.user || null;

    if (!this.user) {
      //de momento no es necesario, ya no pido confirmacion de mail para entrar
      console.warn('Acceso a /home denegado. Redireccionando a /login...');
      this.router.navigate(['/login']);
    }
  }

  listenToAuthChanges() {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        //console.log('Usuario logueado:', session?.user);
        this.user = session?.user;
      }

      if (event === 'SIGNED_OUT') {
        console.log(' Usuario cerró sesión');
        this.user = null;
        this.router.navigate(['/login']);
      }
    });
  }

  async logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  juegos = [
  {
    name: 'Ahorcado',
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/ahorcado.png',
    description: 'Adiviná la palabra oculta antes de que se complete el dibujo del ahorcado.',
    ruta: '/ahorcado'
  },
  {
    name: 'Mayor o Menor',
    urlPicture: 'https://cdn-icons-png.flaticon.com/512/123/123392.png',
    description: 'Adiviná si el próximo número será mayor o menor al anterior.',
    ruta: '/mayor-menor'
  },
  {
    name: 'Preguntados',
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/preguntadoss.png',
    description: 'Respondé preguntas de cultura general y sumá puntos en cada categoría.',
    ruta: '/preguntados'
  },
  {
    name: 'Juego Propio',
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/juegopropio.png',
    description: 'Cargando ...',
    ruta: '/mi-juego'
  }
];

irAJuego(ruta: string) {
  this.router.navigate([ruta]);
}

}

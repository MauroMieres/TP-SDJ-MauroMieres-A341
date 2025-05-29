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
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/ahorcado_icono.png',
    description: 'Adiviná la palabra oculta antes de ser ahorcado.',
    ruta: 'juegos/ahorcado'
  },
  {
    name: 'Mayor o Menor',
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/mayor-o-menor_icono.png',
    description: 'Adiviná si la próxima carta es mayor o menor.',
    ruta: 'juegos/mayor-menor'
  },
  {
    name: 'Trivia Simpsons',
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/trivia.png',
    description: '¿Que personaje de los simpsons es el de la imágen?',
    ruta: 'juegos/trivia'
  },
  {
    name: 'Mi juego: Rompecabezas',
    urlPicture: 'https://oyyisnrxraifeivcnpfy.supabase.co/storage/v1/object/public/images/website/miJuego.png', 
    description: 'Reordená las piezas para formar la imagen original.',
    ruta: 'juegos/rompecabezas'
  }
];

irAJuego(ruta: string) {
  this.router.navigate([ruta]);
}

}

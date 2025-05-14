import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ejemploSupabase';

  user: any = null;

  constructor() {
    // Obtenemos la sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      this.user = data.session?.user || null;
    });

    // Escuchamos cambios de login/logout
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.user = session?.user;
        //console.log(' Usuario logueado:', this.user.email);
      } else if (event === 'SIGNED_OUT') {
        this.user = null;
        console.log('Usuario deslogueado');
      }
    });
  }

  async logout() {
    await supabase.auth.signOut();
    window.location.reload(); // o navegar al login
  }
  
}


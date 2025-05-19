import { Component } from '@angular/core';
import { RouterOutlet, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

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

  constructor(private router: Router) {
    // Obtenemos la sesión inicial
    supabase.auth.getSession().then(({ data }) => {
      this.user = data.session?.user || null;
    });

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        this.user = session?.user;
      } else if (event === 'SIGNED_OUT') {
        this.user = null;
        console.log('Usuario deslogueado');
      }
    });
  }

  async logout() {
  await supabase.auth.signOut();
  this.user = null;//con esto se corrige que al cerrar sesion quedara "cacheado"
  this.router.navigate(['/login']);
}

}


import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient } from '@supabase/supabase-js'
import { environment } from '../../../environments/environment';
import { NgIf } from '@angular/common';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  username: string = "";
  password: string = "";

  errorMessage : string = "";
  constructor(private router: Router) {
  }


login() { //modificado para que luego de cerrar sesión no quede nada en cache
  supabase.auth.signInWithPassword({
    email: this.username,
    password: this.password,
  }).then(async ({ data, error }) => {

    //console.log('🔐 Resultado de signInWithPassword →', { data, error });

    if (error || !data.session) {
      if (error?.message.includes('Invalid login credentials')) {
        this.errorMessage = 'Las credenciales son inválidas';
      } else {
        this.errorMessage = 'Ocurrió un error: ' + (error?.message || 'No se pudo iniciar sesión');
      }
      console.warn('⚠️ Login fallido');
      return;
    }
    // Verificamos la sesión real luego del login
    const sessionResult = await supabase.auth.getSession();
    //console.log('📦 Sesión obtenida con getSession():', sessionResult.data.session);
    const user = sessionResult.data.session?.user;
    if (user) {
     // console.log('✅ Usuario logueado:', user.email);
      this.router.navigate(['/home']);
    } else {
      this.errorMessage = 'No se pudo obtener la sesión activa';
      console.error('❌ Sesión inválida aunque el login fue exitoso');
    }
  });
}

  autocompletar() {
  this.username = 'mauronicolasmieres@gmail.com';
  this.password = 'cacatua';
}
}


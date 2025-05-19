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


  login() {
    supabase.auth.signInWithPassword({
      email: this.username,
      password: this.password,
    }).then(({ data, error }) => {
      if (error) {
        console.error('Error:', error.message);
        this.errorMessage ='Ocurrió un error: ' + error.message;
      } else {
        this.router.navigate(['/home']);
      }
    });
  }

  autocompletar() {
  this.username = 'mauronicolasmieres@gmail.com';
  this.password = 'cacatua';
}
}

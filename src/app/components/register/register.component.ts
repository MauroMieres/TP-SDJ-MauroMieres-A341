import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { createClient, User } from '@supabase/supabase-js'
import { environment } from '../../../environments/environment';
import { timestamp } from 'rxjs';
import { CommonModule } from '@angular/common';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey)

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})

export class RegisterComponent {
  email: string = '';
  password: string = '';
  name: string = '';
  last_name: string = '';
  age: number = 0;
  file: number = 0;
  avatarUrl: File | null = null;

  errorMessage: string = "";

  constructor(private router: Router) { }

  register() {
    supabase.auth.signUp({
      email: this.email,
      password: this.password,
    }).then(({ data, error }) => {
      if (error) {
        if (error.message.includes('Email address') || error.message.includes('invalid')) {
          this.errorMessage = 'El correo electrónico no es válido';
        } if (error.message.includes('Password should be at least 6 characters')) {
          this.errorMessage = 'La contraseña debe tener al menos 6 caracteres';
        }if (error.message.includes('User already registered')) {
          this.errorMessage = 'Este correo ya se encuentra registrado';
        }
        else {
          this.errorMessage = 'Ocurrió un error: ' + error.message;
        }
        return;
      }

      console.log(' Usuario registrado:', data.user);

      supabase.auth.signInWithPassword({
        email: this.email,
        password: this.password,
      }).then(({ data: loginData, error: loginError }) => {
        if (loginError) {
          this.errorMessage = 'Error al iniciar sesión automáticamente';
          return;
        }
        this.saveUserData(loginData.user!); // Guardar en alumnos-data luego del login
      });
    });
  }

  saveUserData(user: User) {
    this.saveFile().then((fileData) => {
      const avatarUrl = fileData?.path || null;

      supabase.from('alumnos-data').insert([
        {
          authId: user.id,
          name: this.name,
          last_name: this.last_name,
          age: this.age,
          file: this.file,
          avatarUrl: avatarUrl,
          created_at: new Date().toISOString(),
          email: this.email
        }
      ]).then(({ data, error }) => {
        if (error) {
          if (error.message.includes('alumnos-data_email_key')) {
            this.errorMessage = 'El correo ya está registrado';
          }
          else {
            this.errorMessage = 'El legajo ya está registrado';
          }
        } else {
          this.router.navigate(['/home']);
        }
      });
    });
  }


  async saveFile() {
    if (!this.avatarUrl) return null;

    const { data, error } = await supabase
      .storage
      .from('images')
      .upload(`users/${this.avatarUrl.name}`, this.avatarUrl, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      console.error('Error al subir imagen:', error.message);
      return null;
    }

    return data;
  }

  onFileSelected(event: any) {
    this.avatarUrl = event.target.files[0];

    if (this.avatarUrl) {
      console.log('Archivo cargado:', this.avatarUrl.name);
    } else {
      console.warn('No se seleccionó ningún archivo.');
    }
  }
}


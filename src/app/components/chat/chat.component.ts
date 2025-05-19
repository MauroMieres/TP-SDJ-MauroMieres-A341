import { Component } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule, NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgIf, FormsModule, NgFor, DatePipe,NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent {
  user_email: string = '';
  full_name: string = '';
  message: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  messages: any[] = [];

  constructor(private router: Router) {}

  async ngOnInit() {
    const { data, error } = await supabase.auth.getSession();
    const user = data?.session?.user;

    // 🔐 Redirigir si no hay sesión
    if (!user) {
      console.warn('🔒 Usuario no logueado. Redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    this.user_email = user.email || '';

    const { data: extraData } = await supabase
      .from('alumnos-data')
      .select('name, last_name')
      .eq('authId', user.id)
      .single();

    if (extraData) {
      this.full_name = `${extraData.name} ${extraData.last_name}`;
    }

    this.loadMessages();
  }

  async sendMessage() {
    const { error } = await supabase.from('chat').insert({
      user_email: this.user_email,
      full_name: this.full_name,
      message: this.message,
      created_at: new Date().toISOString()
    });

    if (error) {
      this.errorMessage = 'No se pudo guardar el mensaje';
      this.successMessage = '';
    } else {
      //this.successMessage = 'Mensaje enviado';
      this.errorMessage = '';
      this.message = '';
      this.loadMessages(); // recargar mensajes
    }
  }

  async loadMessages() {
    const { data, error } = await supabase
      .from('chat')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error cargando mensajes:', error.message);
      return;
    }

    this.messages = data || [];
  }
}

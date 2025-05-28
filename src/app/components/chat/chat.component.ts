import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule, NgClass, NgFor, NgIf, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [NgIf, FormsModule, NgFor, DatePipe, NgClass],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnDestroy {
  private supabase: SupabaseClient;
  private channel: any;

  user_email: string = '';
  full_name: string = '';
  message: string = '';
  errorMessage: string = '';
  successMessage: string = '';
  messages: any[] = [];

  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  constructor(private router: Router) {
    this.supabase = createClient(environment.apiUrl, environment.publicAnonKey);
  }

  async ngOnInit() {
    const { data, error } = await this.supabase.auth.getSession();
    const user = data?.session?.user;

    if (!user) {
      console.warn(' Usuario no logueado. Redirigiendo...');
      this.router.navigate(['/login']);
      return;
    }

    this.user_email = user.email || '';

    const { data: extraData } = await this.supabase
      .from('alumnos-data')
      .select('name, last_name')
      .eq('authId', user.id)
      .single();

    if (extraData) {
      this.full_name = `${extraData.name} ${extraData.last_name}`;
    }

    await this.loadMessages();
    this.subscribeToNewMessages();
  }

  async sendMessage() {
    if (!this.message.trim()) return;

    const { error } = await this.supabase.from('chat').insert({
      user_email: this.user_email,
      full_name: this.full_name,
      message: this.message,
      created_at: new Date().toISOString()
    });

    if (error) {
      this.errorMessage = 'No se pudo guardar el mensaje';
      this.successMessage = '';
    } else {
      this.errorMessage = '';
      this.message = '';
      // El nuevo mensaje lo recibe realtime
    }
  }

  async loadMessages() {
    const { data, error } = await this.supabase
      .from('chat')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error cargando mensajes:', error.message);
      return;
    }

    this.messages = data || [];
    setTimeout(() => this.scrollToBottom(), 50);
  }

  subscribeToNewMessages() {
    this.channel = this.supabase
      .channel('chat-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat'
        },
        (payload) => {
          const nuevoMensaje = payload.new;
          this.messages.push(nuevoMensaje);

          // cuando el mensaje proviene de otro usuario hace sonido
          if (nuevoMensaje['user_email'] !== this.user_email) {
            this.playNotificationSound();
          }

          setTimeout(() => this.scrollToBottom(), 50);
        }
      )
      .subscribe((status) => {
        //console.log('realtime on');
      });
  }

  playNotificationSound() {
    const audio = new Audio('assets/sounds/chat_newMessage.mp3');
    audio.volume = 0.5; // control del volumen
  }

  onEnterKey() {
    this.sendMessage();
  }

  private scrollToBottom() {
    try {
      this.scrollContainer.nativeElement.scrollTop =
        this.scrollContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.warn('Error en scroll automático:', err);
    }
  }

  ngOnDestroy(): void {
    this.supabase.removeAllChannels();
  }
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-trivia',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './trivia.component.html',
  styleUrl: './trivia.component.scss'
})
export class TriviaComponent implements OnInit {
  personaje: string = '';
  imagen: string = '';
  opciones: string[] = [];
  personajes: Set<string> = new Set();
  seleccionUsuario: string | null = null;
  estado: 'esperando' | 'correcto' | 'incorrecto' = 'esperando';
  cargando: boolean = false;
  puntaje: number = 0;
  juegoTerminado: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.generarPregunta();
  }

  async generarPregunta() {
    this.cargando = true;

    let data;
    do {
      data = await this.http.get<any>('https://thesimpsonsquoteapi.glitch.me/quotes').toPromise();
    } while (!data[0].image || data[0].image.trim() === '');

    const personajeCorrecto = data[0].character;
    this.personaje = personajeCorrecto;
    this.imagen = data[0].image;

    const opcionesSet = new Set<string>();
    opcionesSet.add(personajeCorrecto);

    while (opcionesSet.size < 3) {
      const extra = await this.http.get<any>('https://thesimpsonsquoteapi.glitch.me/quotes').toPromise();
      const personajeExtra = extra[0].character;
      opcionesSet.add(personajeExtra);
    }

    this.opciones = Array.from(opcionesSet).sort(() => Math.random() - 0.5);
    this.estado = 'esperando';
    this.seleccionUsuario = null;
    this.cargando = false;

    console.log('¿Quién es?', this.personaje);
  }

  seleccionarOpcion(opcion: string) {
    this.seleccionUsuario = opcion;
    if (opcion === this.personaje) {
      this.estado = 'correcto';
      this.puntaje++;
      setTimeout(() => this.generarPregunta(), 1000); // avanzar automáticamente después de 1 segundo
    } else {
      this.estado = 'incorrecto';
      this.juegoTerminado = true;
      this.guardarPuntaje();
    }
  }

  siguiente() {
    this.generarPregunta();
  }

  reiniciarJuego() {
    this.puntaje = 0;
    this.juegoTerminado = false;
    this.generarPregunta();
  }

    async guardarPuntaje() {
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();

  if (userError || !user) {
    console.error('No se pudo obtener el usuario:', userError?.message);
    return;
  }

  // Buscar los datos del usuario en alumnos-data
  const { data: alumnoData, error: alumnoError } = await supabase
    .from('alumnos-data')
    .select('name, last_name')
    .eq('authId', user.id)
    .single();

  if (alumnoError || !alumnoData) {
    console.error('No se pudo obtener datos del alumno:', alumnoError?.message);
    return;
  }

  const nombreCompleto = `${alumnoData.name} ${alumnoData.last_name}`;

  const { error } = await supabase.from('puntuaciones').insert([
    {
      puntaje: this.puntaje,
      usuario: nombreCompleto,
      juego: 'Trivia',
    }
  ]);

  if (error) {
    console.error('❌ Error al guardar el puntaje:', error.message);
  } else {
    console.log('✅ Puntaje guardado correctamente.');
  }
}
}

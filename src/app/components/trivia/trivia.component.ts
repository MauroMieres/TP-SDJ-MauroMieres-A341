import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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
}

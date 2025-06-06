import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.scss'
})
export class MayorMenorComponent implements OnInit {
  cartas: any[] = [];
  cartaActual: any = null;
  siguienteCarta: any = null;
  cartasJugadas: any[] = [];
  contador = 0;
  perdio = false;
  juegoTerminado = false;
  mensaje = '';
  indiceActual = 0;

  readonly valores: Record<string, number> = {
    '2': 2, '3': 3, '4': 4, '5': 5,
    '6': 6, '7': 7, '8': 8, '9': 9,
    '10': 10, 'JACK': 11, 'QUEEN': 12,
    'KING': 13, 'ACE': 14
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.http.get<any>('https://deckofcardsapi.com/api/deck/new/draw/?count=50')
      .subscribe(res => {
        this.cartas = res.cards;
        this.resetEstado();
        this.cartaActual = this.cartas[0];
        this.indiceActual = 1;
        this.siguienteCarta = this.cartas[1];
        console.log('👉 Siguiente carta:', this.siguienteCarta);
      });
  }

  get siguienteCartaDisponible(): any {
    return this.cartas[this.indiceActual];
  }

  getValor(carta: any): number {
    return this.valores[carta.value as keyof typeof this.valores];
  }

  elegir(opcion: 'mayor' | 'menor') {
    const siguiente = this.siguienteCartaDisponible;
    if (!siguiente) return;

    const valorActual = this.getValor(this.cartaActual);
    const valorSiguiente = this.getValor(siguiente);

    this.cartasJugadas.push(this.cartaActual);

    const acierto = (
      (opcion === 'mayor' && valorSiguiente > valorActual) ||
      (opcion === 'menor' && valorSiguiente < valorActual)
    );

    if (valorSiguiente === valorActual) {
      this.mensaje = 'Empate: ¡no se suma punto!';
    } else if (acierto) {
      this.contador++;
      this.mensaje = '¡Correcto!';
    } else {
      this.juegoTerminado = true;
      this.perdio = true;
      this.mensaje = '¡Incorrecto!';
      this.guardarPuntaje();
    }

    this.siguienteCarta = siguiente;
    this.cartaActual = siguiente;
    this.indiceActual++;
    this.siguienteCarta = this.cartas[this.indiceActual];
    console.log('👉 Siguiente carta:', this.siguienteCarta);
  }

  resetEstado() {
    this.cartaActual = null;
    this.siguienteCarta = null;
    this.cartasJugadas = [];
    this.contador = 0;
    this.perdio = false;
    this.juegoTerminado = false;
    this.mensaje = '';
    this.indiceActual = 0;
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
      puntaje: this.contador,
      usuario: nombreCompleto,
      juego: 'Mayor o Menor',
    }
  ]);

  if (error) {
    console.error('❌ Error al guardar el puntaje:', error.message);
  } else {
    console.log('✅ Puntaje guardado correctamente.');
  }
}

}

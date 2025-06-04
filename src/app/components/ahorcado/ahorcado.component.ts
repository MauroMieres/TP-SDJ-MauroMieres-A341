import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);


@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.component.html',
  styleUrl: './ahorcado.component.scss'
})
export class AhorcadoComponent implements OnInit {

  palabra: string = '';
  letrasMostradas: string[] = [];
  letrasDisponibles: string[] = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  letrasUsadas: string[] = [];
  errores: number = 0;
  maxErrores: number = 7;
  estado: 'jugando' | 'ganado' | 'perdido' = 'jugando';
  aciertosConsecutivos: number = 0;
  cargando: boolean = true;

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.obtenerPalabra();
  }

  obtenerPalabra() {
    this.cargando = true;
    this.http.get<string[]>('https://random-word-api.herokuapp.com/word?lang=es&number=1&length=8').subscribe({
      next: (res) => {
        const palabraRaw = res[0] || 'ANGULAR';
        this.palabra = palabraRaw.toUpperCase();

        const primeraLetra = this.palabra[0];
        this.letrasMostradas = this.palabra
          .split('')
          .map((letra) => letra === primeraLetra ? letra : '_');

        this.letrasUsadas = [primeraLetra];
        this.cargando = false;
        console.log(this.palabra);
      },
      error: (err) => {
        console.error('❌ Error al obtener palabra aleatoria:', err);

        const palabrasLocales = [
          'ANGULAR', 'TSUNAMI', 'ELEFANTE', 'CIUDADES', 'MERCADOS',
          'BANDERAS', 'NAVEGADOR', 'CAMINATA', 'UNIFORME', 'HISTORIA',
          'MONEDERO', 'PROGRAMOR', 'ECONOMISTA', 'PLANTEAR', 'GIGANTES',
          'ALUMNOYA', 'BOSQUEJO', 'ESCALERA', 'PANTALLA', 'FANTASMA',
          'FRUTALES', 'GIRASOLES', 'HORMIGAS', 'FUTBOL', 'JUGUETERIA'
        ];

        const palabraRaw = palabrasLocales[Math.floor(Math.random() * palabrasLocales.length)];
        this.palabra = palabraRaw;

        const primeraLetra = this.palabra[0];
        this.letrasMostradas = this.palabra
          .split('')
          .map((letra) => letra === primeraLetra ? letra : '_');

        this.letrasUsadas = [primeraLetra];
        this.cargando = false;
        console.log(this.palabra);
      }
    });
  }

  seleccionarLetra(letra: string) {
    if (this.estado !== 'jugando' || this.letrasUsadas.includes(letra)) return;

    this.letrasUsadas.push(letra);

    if (this.palabra.includes(letra)) {
      this.palabra.split('').forEach((l, i) => {
        if (l === letra) this.letrasMostradas[i] = letra;
      });

      if (!this.letrasMostradas.includes('_')) {
        this.estado = 'ganado';
        this.aciertosConsecutivos++;

        setTimeout(() => {
          this.reiniciarJuego();
        }, 1000); // esperar 1 segundo antes de cargar la siguiente palabra
      }

    } else {
      this.errores++;
      if (this.errores >= this.maxErrores) {
        this.estado = 'perdido';
        this.guardarPuntaje();
      }
    }
  }

  reiniciarJuego() {
    this.palabra = '';
    this.letrasMostradas = [];
    this.letrasUsadas = [];
    this.errores = 0;
    this.estado = 'jugando';
    this.obtenerPalabra();
  }

  reiniciarContador() {
    this.aciertosConsecutivos = 0;
    this.reiniciarJuego();
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
      puntaje: this.aciertosConsecutivos,
      usuario: nombreCompleto,
      juego: 'Ahorcado',
    }
  ]);

  if (error) {
    console.error('❌ Error al guardar el puntaje:', error.message);
  } else {
    console.log('✅ Puntaje guardado correctamente.');
  }
}



  get dibujoAhorcado(): string {
    const partes = {
      cabeza: this.errores >= 1 ? ' O ' : '   ',
      cuello: this.errores >= 2 ? ' | ' : '   ',
      brazoDer: this.errores >= 3 ? '/' : ' ',
      brazoIzq: this.errores >= 4 ? '\\' : ' ',
      torso: this.errores >= 5 ? ' | ' : '   ',
      piernaDer: this.errores >= 6 ? '/' : ' ',
      piernaIzq: this.errores >= 7 ? '\\' : ' '
    };

    return `
  +---.
  |   |
  |  ${partes.cabeza}
  | ${partes.brazoDer}${partes.cuello}${partes.brazoIzq}
  |   ${partes.torso.trim()}
  |  ${partes.piernaDer} ${partes.piernaIzq}
=========`;
  }


  
}


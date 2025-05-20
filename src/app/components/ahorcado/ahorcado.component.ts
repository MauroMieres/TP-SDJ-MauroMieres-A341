import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HttpClient } from '@angular/common/http';

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

  cargando: boolean = true;//para que no permita jugar antes de que la palabra llegue de la api

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.obtenerPalabra();
  }

  obtenerPalabra() {
    this.cargando = true; //modificado para que siempre traiga palabras de 8 letras https://random--word--api-herokuapp-com.translate.goog/home?_x_tr_sl=en&_x_tr_tl=es&_x_tr_hl=es&_x_tr_pto=tc
    this.http.get<string[]>('https://random-word-api.herokuapp.com/word?lang=es&number=1&length=8').subscribe({
      next: (res) => {
       const palabraRaw = res[0] || 'angular';
  this.palabra = palabraRaw.toUpperCase();

  const primeraLetra = this.palabra[0];
  this.letrasMostradas = this.palabra
    .split('')
    .map((letra) => letra === primeraLetra ? letra : '_');

  this.letrasUsadas = [primeraLetra];
  this.cargando = false;
        console.log(this.palabra);
      },//esto es para cuando falla la API
      error: (err) => {
        console.error('❌ Error al obtener palabra aleatoria:', err);
        this.palabra = 'ANGULAR';
        this.letrasMostradas = this.palabra.split('').map((letra, i) => i === 0 ? letra : '_');
        this.cargando = false;
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
      }

    } else {
      this.errores++;
      if (this.errores >= this.maxErrores) {
        this.estado = 'perdido';
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

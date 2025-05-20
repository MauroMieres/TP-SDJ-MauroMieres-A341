import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mayor-menor.component.html',
  styleUrl: './mayor-menor.component.scss'
})
export class MayorMenorComponent implements OnInit {
  deckId = '';
  cartaActual: any = null;
  siguienteCarta: any = null;
  cartasJugadas: any[] = [];
  contador = 0;
  perdio = false;
  juegoTerminado = false;
  mensaje = '';

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
    this.http.get<any>('https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1')
      .subscribe(res => {
        this.deckId = res.deck_id;
        this.resetEstado();
        this.drawCard().then(carta => this.cartaActual = carta);
      });
  }

  async drawCard(): Promise<any> {
    const res = await this.http
      .get<any>(`https://deckofcardsapi.com/api/deck/${this.deckId}/draw/?count=1`)
      .toPromise();

    return res.cards[0];
  }

  getValor(carta: any): number {
    return this.valores[carta.value as keyof typeof this.valores];
  }

  async elegir(opcion: 'mayor' | 'menor') {
    const siguiente = await this.drawCard();
    const valorActual = this.getValor(this.cartaActual);
    const valorSiguiente = this.getValor(siguiente);

    this.cartasJugadas.push(this.cartaActual);

    const acierto = (
      (opcion === 'mayor' && valorSiguiente >= valorActual) ||
      (opcion === 'menor' && valorSiguiente <= valorActual)
    );

    if (acierto) {
      this.contador++;
      this.cartaActual = siguiente;
      this.siguienteCarta = null;
    } else {
      this.juegoTerminado = true;
      this.perdio = true;
      this.siguienteCarta = siguiente;
    }
  }

  resetEstado() {
    this.cartaActual = null;
    this.siguienteCarta = null;
    this.cartasJugadas = [];
    this.contador = 0;
    this.perdio = false;
    this.juegoTerminado = false;
    this.mensaje = '';
  }
}

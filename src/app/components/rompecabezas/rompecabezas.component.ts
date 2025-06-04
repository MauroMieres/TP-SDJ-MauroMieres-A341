import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-rompecabezas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rompecabezas.component.html',
  styleUrl: './rompecabezas.component.scss'
})
export class RompecabezasComponent implements OnInit {
  imagenUrl = '';
  piezas: { posicion: number; backgroundPosition: string }[] = [];
  seleccionadaIndex: number | null = null;
  movimientos = 0;
  gano = false;

  cronometro = '00:00';
  private segundos = 0;
  private intervalo: any = null;
  private comenzo = false;

  ngOnInit(): void {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.imagenUrl = `https://picsum.photos/300?random=${Date.now()}`;
    this.movimientos = 0;
    this.gano = false;
    this.seleccionadaIndex = null;
    this.comenzo = false;
    this.resetearCronometro();
    this.generarPiezas();
  }

  generarPiezas() {
    const posiciones = [];

    for (let fila = 0; fila < 3; fila++) {
      for (let col = 0; col < 3; col++) {
        posiciones.push({
          posicion: fila * 3 + col,
          backgroundPosition: `${-col * 100}px ${-fila * 100}px`
        });
      }
    }

    this.piezas = this.shuffleArray(posiciones);
  }

  shuffleArray<T>(array: T[]): T[] {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  }

  seleccionar(index: number) {
    if (this.gano) return;

    if (!this.comenzo) {
      this.comenzo = true;
      this.iniciarCronometro();
    }

    if (this.seleccionadaIndex === null) {
      this.seleccionadaIndex = index;
    } else if (this.seleccionadaIndex === index) {
      this.seleccionadaIndex = null;
    } else {
      this.intercambiar(this.seleccionadaIndex, index);
      this.movimientos++;
      this.seleccionadaIndex = null;
      this.verificarGanador();
    }
  }

  intercambiar(i: number, j: number) {
    const temp = this.piezas[i];
    this.piezas[i] = this.piezas[j];
    this.piezas[j] = temp;
  }

  verificarGanador() {
    this.gano = this.piezas.every((pieza, index) => pieza.posicion === index);
    if (this.gano) {
      clearInterval(this.intervalo);
      this.guardarPuntaje();
    }
  }

  iniciarCronometro() {
    this.intervalo = setInterval(() => {
      this.segundos++;
      const min = Math.floor(this.segundos / 60).toString().padStart(2, '0');
      const sec = (this.segundos % 60).toString().padStart(2, '0');
      this.cronometro = `${min}:${sec}`;
    }, 1000);
  }

  resetearCronometro() {
    clearInterval(this.intervalo);
    this.segundos = 0;
    this.cronometro = '00:00';
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
      puntaje: this.movimientos, //este se tiene que ordenar de menor a mayor, a diferencia de los otros //cuando hay empate debe mostrar la mas antigua
      usuario: nombreCompleto,
      juego: 'Rompecabezas',
    }
  ]);

  if (error) {
    console.error('❌ Error al guardar el puntaje:', error.message);
  } else {
    console.log('✅ Puntaje guardado correctamente.');
  }
}
}
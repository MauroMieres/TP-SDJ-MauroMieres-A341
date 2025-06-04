import { Component, OnInit } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';
import { CommonModule, NgFor, NgIf } from '@angular/common';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);


@Component({
  selector: 'app-puntajes',
  standalone: true,
  imports: [NgFor,NgIf,CommonModule],
  templateUrl: './puntajes.component.html',
  styleUrl: './puntajes.component.scss'
})
export class PuntajesComponent implements OnInit {
  juegos: string[] = ['Ahorcado', 'Mayor o Menor', 'Trivia','Rompecabezas'];
  puntajesPorJuego: Record<string, any[]> = {};
  cargando = true;
  error = '';

  async ngOnInit() {
    for (const juego of this.juegos) {
      const asc = juego === 'Rompecabezas'; // se ordena de forma inversa solo en este juego

      const { data, error } = await supabase
        .from('puntuaciones')
        .select('*')
        .eq('juego', juego)
        .order('puntaje', { ascending: asc })
        .order('created_at', { ascending: true })
        .limit(10); // traemos más para poder filtrar luego top 3 por lógica

      if (error) {
        console.error(`Error al obtener puntajes de ${juego}:`, error.message);
        this.error = `No se pudieron cargar los puntajes de ${juego}`;
        continue;
      }

      // agrupamos por puntaje y ordenamos por fecha, nos quedamos con los primeros 3
      const top3: any[] = [];
      const puntajesUnicos = new Set<number>();

      for (const row of data) {
        if (!puntajesUnicos.has(row.puntaje)) {
          top3.push(row);
          puntajesUnicos.add(row.puntaje);
        }

        if (top3.length === 3) break;
      }

      this.puntajesPorJuego[juego] = top3;
    }

    this.cargando = false;
  }
}

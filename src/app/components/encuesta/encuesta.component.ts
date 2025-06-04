import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { createClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

const supabase = createClient(environment.apiUrl, environment.publicAnonKey);

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.component.html',
  styleUrl: './encuesta.component.scss'
})
export class EncuestaComponent implements OnInit {
  encuestaForm = this.fb.group({
  nombre: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
  apellido: ['', [Validators.required, Validators.pattern(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/)]],
  edad: [null, [Validators.required, Validators.min(18), Validators.max(99)]],
  telefono: ['', [Validators.required, Validators.pattern(/^\d{1,10}$/)]],
  pregunta1: [false],
  pregunta2: ['', Validators.required],
  pregunta3: ['', Validators.required],
});

  mensaje = '';
  cargando = false;

  constructor(private fb: FormBuilder) {}

  async ngOnInit() {}

  async enviar() {
    if (this.encuestaForm.invalid) {
      this.mensaje = 'Por favor completá todos los campos correctamente.';
      return;
    }

    this.cargando = true;

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      this.mensaje = 'No se pudo obtener el usuario actual.';
      this.cargando = false;
      return;
    }

    const datos = {
      ...this.encuestaForm.value,
      id_Usuario: user.id
    };

    const { error } = await supabase.from('encuestas').insert([datos]);

    if (error) {
      console.error('❌ Error al guardar encuesta:', error.message);
      this.mensaje = 'Hubo un error al enviar la encuesta.';
    } else {
      this.mensaje = '✅ Encuesta enviada correctamente.';
      this.encuestaForm.reset();
    }

    this.cargando = false;
  }

  soloLetras(event: KeyboardEvent) {
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]$/;
  const inputChar = event.key;

  if (!regex.test(inputChar)) {
    event.preventDefault();
  }
}

soloNumeros(event: KeyboardEvent) {
  if (!/^\d$/.test(event.key)) {
    event.preventDefault();
  }
}


}

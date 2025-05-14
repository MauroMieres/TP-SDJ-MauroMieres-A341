import { Component , Input} from '@angular/core';

@Component({
  selector: 'app-card-juego',
  standalone: true,
  imports: [],
  templateUrl: './card-juego.component.html',
  styleUrl: './card-juego.component.scss'
})
export class CardJuegoComponent {
  @Input() urlPicture: string = '';
  @Input() name: string = '';
  @Input() description: string = '';
}

import { Component, OnInit } from '@angular/core';
import { UserData } from '../../models/user-data';

@Component({
  selector: 'app-quien-soy',
  standalone: true,
  imports: [],
  templateUrl: './quien-soy.component.html',
  styleUrl: './quien-soy.component.scss'
})


export class QuienSoyComponent{

  usersdata: UserData[] = [];
  explicaciónJuegoPropio : string = ""
}

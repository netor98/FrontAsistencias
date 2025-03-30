import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-horariosgeneral',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './horariosgeneral.component.html',
  styleUrl: './horariosgeneral.component.css'
})
export class HorariosgeneralComponent {
  carrera: any;
  carreras: any;
  grupo: any;
  grupos: any;
  maestro: any;
  maestros: any;
  borrarFiltros() {
    throw new Error('Method not implemented.');
  }

}

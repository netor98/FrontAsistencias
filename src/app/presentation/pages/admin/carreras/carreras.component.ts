import { Component, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Carrera } from '@domain/models/carreras.model';
import { CarreraService } from '../../../../infrastructure/admin/carreras.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import CarrerasFiltersComponent from '../../../components/carrera-filters/carrera-filters.component';

@Component({
  selector: 'app-carreras',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, CarrerasFiltersComponent],
  templateUrl: './carreras.component.html',
  styleUrl: './carreras.component.css'
})
export class CarrerasComponent implements OnInit {
  carreras: Carrera[] = [];
  filteredCarreras: Carrera[] = [];

  // Control para búsqueda y select para planes
  searchControl = new FormControl('');
  planControl = new FormControl('');

  // Para la paginación
  currentPage: number = 1;
  pageSize: number = 7;
  totalPages: number = 1;

  // Suponemos un listado de planes fijos; normalmente estos datos vendrían de un servicio
  plans = [
    { id: 0, name: 'Todos' },
    { id: 2019, name: 'Plan 2019' },
    { id: 2020, name: 'Plan 2020' },
    { id: 2021, name: 'Plan 2021' }
  ];

  private carreraService = new CarreraService();

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.loadCarreras();

    this.searchControl.valueChanges.subscribe(value => {
      this.filterAndPaginate();
    });

    this.planControl.valueChanges.subscribe(value => {
      this.filterAndPaginate();
    });
  }

  loadCarreras(): void {
    this.carreraService.getCarreras().then(data => {
      this.carreras = data;
      this.filterAndPaginate();
    });
  }

  filterAndPaginate(): void {
    const term: string = this.searchControl.value?.toLowerCase() || '';
    const selectedPlanId = this.planControl.value?.toString();

    // Filtrado por búsqueda y plan
    let filtered = this.carreras.filter(carrera => {
      const matchesTerm =
        carrera.clave.toLowerCase().includes(term) ||
        carrera.nombre.toLowerCase().includes(term);
      const matchesPlan =
        selectedPlanId === '' ||
        selectedPlanId === '0' || carrera.planId.toString() === selectedPlanId;

      return matchesTerm && matchesPlan;
    });

    // Cálculo de la paginación
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredCarreras = filtered.slice(startIndex, endIndex);
  }

  onCreate(): void {
    this.router.navigate(['/admin/carreras/form']);
  }

  onEdit(carrera: Carrera): void {
    this.router.navigate(['/admin/carreras/form'], { queryParams: { id: carrera.id } });
  }

  onDelete(id: number): void {
    if (confirm('¿Está seguro de eliminar esta carrera?')) {
      this.carreraService.deleteCarrera(id).then(() => {
        this.loadCarreras();
      });
    }
  }

  // Métodos para paginación
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.filterAndPaginate();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.filterAndPaginate();
    }
  }
}

import { Component,  OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {Carrera} from "../../../../services/interfaces";
import { CommonModule } from '@angular/common';
import CarrerasFiltersComponent from '../../../components/carrera-filters/carrera-filters.component';
import { HotToastService } from '@ngxpert/hot-toast';
import { carrerasServiceSupa } from 'src/app/services/carreras';

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

  currentFilters: { search: string; plans: string[] } = { search: '', plans: [] };


  // Para la paginación
  currentPage: number = 1;
  pageSize: number = 7;
  totalPages: number = 1;

  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  carreraToDelete!: number;
  carreraForm!: FormGroup;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private toast: HotToastService,
  ) { }

  ngOnInit(): void {
    this.loadCarreras();
    this.initForm();
  }

  loadCarreras(): void {
    this.isLoading = true;
    carrerasServiceSupa.getAll().then((data) => {
      this.carreras = data;

      this.totalPages = Math.ceil(this.carreras.length / this.pageSize);
      this.filteredCarreras = this.carreras
      this.isLoading = false;
    })
  }

  onFilterChanged(filters: { search: string, plans: string[] }): void {
    this.currentFilters = filters;
    this.currentPage = 1; // reinicia la paginación al aplicar un filtro
    this.applyFilters(filters);
  }

  applyFilters(filters: { search: string, plans: string[] }): void {
    let filtered = this.carreras;

    // Filtrado por término de búsqueda
    if (filters.search && filters.search.trim() !== '') {
      const term = filters.search.trim().toLowerCase();
      filtered = filtered.filter(carrera =>
        carrera.nombre.toLowerCase().includes(term)
      );
    }

    // Filtrado por planes seleccionados (solo si hay alguno seleccionado)
    if (filters.plans.length > 0) {
      filtered = filtered.filter(carrera =>
        filters.plans.includes(carrera.plan.toString())
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredCarreras = filtered.slice(startIndex, endIndex);
  }

  onDelete(id: number): void {
    this.editMode = false;
    this.carreraToDelete = id;
    this.carreraForm.reset();
    this.showDeleteModal = true;
  }

  onCreate(): void {
    this.editMode = false;
    this.carreraForm.reset();
    this.showFormModal = true;
  }

  openFormModal(carrera?: Carrera): void {
    console.log(carrera)
    if (carrera) {
      this.editMode = true;
      this.carreraForm.patchValue(carrera);
    } else {
      this.editMode = false;
      this.carreraForm.reset();
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  onSubmitForm(): void {
    let carrera = this.carreraForm.value;
    if (this.editMode) {

      console.log(this.carreraForm.value);
      carrerasServiceSupa.update(carrera.id, carrera).then(() => this.loadCarreras())
      this.toast.success('Carrera editada correctamente', {
        position: 'top-right',
        style: {
          border: '1px solid #4CAF50', // Color verde para el borde
          backgroundColor: '#333', // Fondo oscuro
          color: '#FFF', // Texto blanco
          padding: '16px',
          borderRadius: '8px', // Bordes redondeados
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para dar profundidad
        }
      });
    } else {
      delete carrera.id
      carrerasServiceSupa.create(carrera).then(() => this.loadCarreras())

      this.toast.success('Carrera creada correctamente', {
        position: 'top-right',
        style: {
          border: '1px solid #4CAF50', // Color verde para el borde
          backgroundColor: '#333', // Fondo oscuro
          color: '#FFF', // Texto blanco
          padding: '16px',
          borderRadius: '8px', // Bordes redondeados
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para dar profundidad
        }
      });
    }
    this.closeFormModal();
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    console.log(this.carreraToDelete)
    carrerasServiceSupa.delete(this.carreraToDelete).then(() => this.loadCarreras())
    this.toast.success('Carrera eliminada correctamente', {
      position: 'top-right',
      style: {
        border: '1px solid #4CAF50', // Color verde para el borde
        backgroundColor: '#333', // Fondo oscuro
        color: '#FFF', // Texto blanco
        padding: '16px',
        borderRadius: '8px', // Bordes redondeados
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)', // Sombra para dar profundidad
      }
    });

    this.closeDeleteModal();
    this.carreraForm.reset();
  }


  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters(this.currentFilters);
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters(this.currentFilters);
    }
  }

  private initForm(): void {
    this.carreraForm = this.fb.group({
      id: [null],
      nombre: ['', Validators.required],
      semestres: [null, Validators.required],
      plan: [null, Validators.required]
    });
  }
}

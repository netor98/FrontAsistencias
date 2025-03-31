import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Carrera } from '@domain/models/carreras.model';
import { CarreraService } from '../../../../infrastructure/admin/carreras.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import CarrerasFiltersComponent from '../../../components/carrera-filters/carrera-filters.component';
import { CarreeraCreateUseCase } from '../../../../application/usecases/carreras/create.usecase';
import { HotToastService } from '@ngxpert/hot-toast';
import { CarreeraDeleteUseCase } from '../../../../application/usecases/carreras/delete.usecase';
import { PlanService } from '../../../../infrastructure/admin/planes.service';

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

  searchControl = new FormControl('');
  planControl = new FormControl('');

  // Para la paginación
  currentPage: number = 1;
  pageSize: number = 7;
  totalPages: number = 1;

  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  carreraToDelete!: number;
  carreraForm!: FormGroup;


  constructor(private router: Router,
    private fb: FormBuilder,
    private carreraService: CarreraService,
    private createUseCase: CarreeraCreateUseCase,
    private toast: HotToastService,
    private deleteUseCase: CarreeraDeleteUseCase,
    private planesService: PlanService
  ) { }

  ngOnInit(): void {
    this.loadCarreras();
    this.initForm();
    this.planesService.getAll().subscribe(data => {
      console.log(data);
    });
  }

  loadCarreras(): void {
    this.carreraService.getAll().subscribe(data => {
      this.carreras = data;
      console.log(data);
      this.applyFilters({ search: '', plans: [] });
    }, error => {
      console.error('Error al cargar las carreras:', error);
    });
  }

  onFilterChanged(filters: { search: string, plans: string[] }): void {
    this.currentFilters = filters;
    this.currentPage = 1; // reinicia la paginación al aplicar un filtro
    this.applyFilters(filters);
  }

  applyFilters(filters: { search: string, plans: string[] }): void {
    let filtered = this.carreras;
    console.log(filters)
    // Filtrado por término de búsqueda
    if (filters.search && filters.search.trim() !== '') {
      const term = filters.search.trim().toLowerCase();
      filtered = filtered.filter(carrera =>
        carrera.clave.toLowerCase().includes(term) ||
        carrera.nombre.toLowerCase().includes(term)
      );
    }

    // Filtrado por planes seleccionados (solo si hay alguno seleccionado)
    if (filters.plans.length > 0) {
      filtered = filtered.filter(carrera =>
        filters.plans.includes(carrera.planClave)
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

  onEdit(carrera: Carrera): void {
    this.router.navigate(['/admin/carreras/form'], { queryParams: { id: carrera.id } });
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
    if (this.carreraForm.invalid) return;
    let carrera = this.carreraForm.value;
    carrera.plan = { id: carrera.planId };
    if (this.editMode) {
      // this.carreraService.updateCarrera(carrera).then(() => {
      //   this.loadCarreras();
      //   this.closeFormModal();
      // });
    } else {
      this.createUseCase.execute(carrera).subscribe(() => {
        this.loadCarreras();
      });

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


      // this.carreraService.createCarrera(carrera).then(() => {
      //   this.loadCarreras();
      //   this.closeFormModal();
      // });
    }
    this.closeFormModal();
  }

  openDeleteModal(carrera: Carrera): void {
    this.carreraToDelete = carrera.id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    console.log(this.carreraToDelete)
    this.deleteUseCase.execute(this.carreraToDelete).subscribe(() => {
      this.loadCarreras();
    });

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
      id: [''], // Oculto o de solo lectura si es necesario
      clave: ['', Validators.required],
      nombre: ['', Validators.required],
      activa: [true],
      planId: [null, Validators.required]
    });
  }
}

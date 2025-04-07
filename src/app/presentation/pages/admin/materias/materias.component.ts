import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import CarrerasFiltersComponent from '@components/carrera-filters/carrera-filters.component';
import { Materia } from '@domain/models/materias.model';
import { CarreraService } from '@infrastructure/admin/carreras.service';
import { MateriaService } from '@infrastructure/admin/materias.service';

@Component({
  selector: 'app-materias',
  imports: [ReactiveFormsModule, FormsModule, CommonModule, CarrerasFiltersComponent],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css'],
})
export class MateriasComponent implements OnInit {
  materias: any[] = [];
  carreras: any[] = [];
  filteredMaterias: any[] = [];
  materiaForm!: FormGroup;

  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  materiaIdToDelete: number | null = null;
  searchTerm = '';
  selectedCarreraFilter: number | null = null;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private materiaService: MateriaService,
    private carreraService: CarreraService
  ) { }

  ngOnInit(): void {
    this.loadMaterias();
    this.loadCarreras();
    this.initForm();
  }

  loadMaterias(): void {
    this.isLoading = true;
    this.materiaService.getAll().subscribe({
      next: (data) => {
        this.materias = data;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading materias:', error);
        this.isLoading = false;
      }
    });
  }

  loadCarreras(): void {
    this.carreraService.getAll().subscribe({
      next: (data) => {
        this.carreras = data;
        console.log(this.carreras);
      },
      error: (error) => {
        console.error('Error loading carreras:', error);
      }
    });
  }

  initForm(): void {
    this.materiaForm = this.fb.group({
      id: [''],
      clave: ['', [Validators.required, Validators.maxLength(20)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      creditos: [0, [Validators.required, Validators.min(1), Validators.max(10)]],
      carreraId: [null, Validators.required],
    });
  }

  applyFilters(): void {
    let filtered = [...this.materias];
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(materia => 
        materia.nombre.toLowerCase().includes(term) || 
        materia.clave.toLowerCase().includes(term)
      );
    }
    
    // Apply carrera filter
    if (this.selectedCarreraFilter) {
      filtered = filtered.filter(materia => 
        materia.carrera.id === this.selectedCarreraFilter
      );
    }
    
    // Update pagination
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    
    // Reset to first page if current page is out of bounds
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    // Apply pagination
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredMaterias = filtered.slice(startIndex, endIndex);
  }

  onFilterChanged(event: any): void {
    this.searchTerm = event.searchTerm || '';
    this.selectedCarreraFilter = event.carreraId || null;
    this.currentPage = 1; // Reset to first page when filters change
    this.applyFilters();
  }

  onCreate(): void {
    this.editMode = false;
    this.materiaForm.reset({
      creditos: 1, // Default value
      carreraId: null
    });
    this.showFormModal = true;
  }

  openFormModal(materia?: any): void {
    if (materia) {
      this.editMode = true;
      this.materiaForm.patchValue(materia);
    } else {
      this.editMode = false;
      this.materiaForm.reset({
        creditos: 1, // Default value
        carreraId: null
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  onSubmitForm(): void {
    if (this.materiaForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.materiaForm.controls).forEach(key => {
        const control = this.materiaForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const materia: Materia = this.materiaForm.value;
    this.isLoading = true;

    if (this.editMode) {
      this.materiaService.update(materia.id, materia).subscribe({
        next: () => {
          this.loadMaterias();
          this.closeFormModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating materia:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.materiaService.create(materia).subscribe({
        next: () => {
          this.loadMaterias();
          this.closeFormModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating materia:', error);
          this.isLoading = false;
        }
      });
    }
  }

  confirmDelete(id: number): void {
    this.materiaIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.materiaIdToDelete = null;
    this.showDeleteModal = false;
  }

  onDelete(id: number): void {
    this.isLoading = true;
    this.materiaService.delete(id).subscribe({
      next: () => {
        this.loadMaterias();
        this.showDeleteModal = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting materia:', error);
        this.isLoading = false;
      }
    });
  }

  getCarreraNombre(carreraId: number): string {
    const carrera = this.carreras.find(c => c.id === carreraId);
    return carrera ? carrera.nombre : 'N/A';
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }
}

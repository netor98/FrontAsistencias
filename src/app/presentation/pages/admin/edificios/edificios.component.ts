import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { edificiosService } from "../../../../services/edificios";
import { facultadesService } from "../../../../services/facultades";

interface Edificio {
  id?: number;
  nombre: string;
  facultad_id: number;
}

@Component({
  selector: 'app-edificios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './edificios.component.html',
  styleUrls: ['./edificios.component.css'],
})
export class EdificiosComponent implements OnInit {
  edificios: Edificio[] = [];
  filteredEdificios: Edificio[] = [];
  edificioForm!: FormGroup;
  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  edificioIdToDelete: number | null = null;
  searchTerm = '';
  isLoading = false;
  facultades: any[] = [];
  selectedFacultadFilter: number | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadEdificios();
    this.loadFacultades();
    this.initForm();
  }

  async loadEdificios(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await edificiosService.getAll();
      this.edificios = data;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading edificios:', error);
    } finally {
      this.isLoading = false;
    }
  }

  async loadFacultades(): Promise<void> {
    try {
      this.facultades = await facultadesService.getAll();
    } catch (error) {
      console.error('Error loading facultades:', error);
    }
  }

  getFacultadNombre(facultadId: number): string {
    const facultad = this.facultades.find(f => f.id === facultadId);
    return facultad ? facultad.nombre : 'N/A';
  }

  initForm(): void {
    this.edificioForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      facultad_id: [null, [Validators.required]]
    });
  }

  applyFilters(): void {
    let filtered = [...this.edificios];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(edificio =>
        (edificio.nombre && edificio.nombre.toLowerCase().includes(term))
      );
    }
    if (this.selectedFacultadFilter) {
      filtered = filtered.filter(edificio => edificio.facultad_id === this.selectedFacultadFilter);
    }
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredEdificios = filtered.slice(startIndex, endIndex);
  }

  onCreate(): void {
    this.editMode = false;
    this.edificioForm.reset({
      id: '',
      nombre: '',
      facultad_id: null
    });
    this.showFormModal = true;
  }

  openFormModal(edificio?: Edificio): void {
    if (edificio) {
      this.editMode = true;
      this.edificioForm.patchValue({
        id: edificio.id,
        nombre: edificio.nombre,
        facultad_id: edificio.facultad_id
      });
    } else {
      this.editMode = false;
      this.edificioForm.reset({
        nombre: '',
        facultad_id: null
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  async onSubmitForm(): Promise<void> {
    if (this.edificioForm.invalid) {
      Object.keys(this.edificioForm.controls).forEach(key => {
        const control = this.edificioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isLoading = true;
    try {
      const edificioData = {
        ...this.edificioForm.value,
        id: this.editMode ? this.edificioForm.value.id : undefined
      };
      let savedEdificio;
      if (this.editMode) {
        savedEdificio = await edificiosService.update(edificioData.id, edificioData);
      } else {
        savedEdificio = await edificiosService.create(edificioData);
      }
      await this.loadEdificios();
      this.closeFormModal();
    } catch (error: any) {
      console.error('Error saving edificio:', error);
      alert(`Error al guardar el edificio: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(id: number): void {
    this.edificioIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.edificioIdToDelete = null;
  }

  async onDelete(edificioId: number): Promise<void> {
    this.isLoading = true;
    try {
      await edificiosService.delete(edificioId);
      await this.loadEdificios();
      this.showDeleteModal = false;
    } catch (error: any) {
      console.error('Error deleting edificio:', error);
      alert(`Error al eliminar el edificio: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.edificioIdToDelete = null;
    }
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
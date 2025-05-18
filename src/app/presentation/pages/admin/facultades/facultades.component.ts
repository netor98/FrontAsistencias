import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { facultadesService } from "../../../../services/facultades";

interface Facultad {
  id?: number;
  nombre: string;
}

@Component({
  selector: 'app-facultades',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './facultades.component.html',
  styleUrls: ['./facultades.component.css'],
})
export class FacultadesComponent implements OnInit {
  facultades: Facultad[] = [];
  filteredFacultades: Facultad[] = [];
  facultadForm!: FormGroup;
  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  facultadIdToDelete: number | null = null;
  searchTerm = '';
  isLoading = false;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadFacultades();
    this.initForm();
  }

  async loadFacultades(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await facultadesService.getAll();
      this.facultades = data;
      console.log(this.facultades); 
      this.applyFilters();
    } catch (error) {
      console.error('Error loading facultades:', error);
    } finally {
      this.isLoading = false;
    }
  }

  initForm(): void {
    this.facultadForm = this.fb.group({
      id: [''],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
    });
  }

  applyFilters(): void {
    let filtered = [...this.facultades];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(facultad =>
        (facultad.nombre && facultad.nombre.toLowerCase().includes(term))
      );
    }
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredFacultades = filtered.slice(startIndex, endIndex);
  }

  onCreate(): void {
    this.editMode = false;
    this.facultadForm.reset({
      id: '',
      nombre: '',
    });
    this.showFormModal = true;
  }

  openFormModal(facultad?: Facultad): void {
    if (facultad) {
      this.editMode = true;
      this.facultadForm.patchValue({
        id: facultad.id,
        nombre: facultad.nombre,
      });
    } else {
      this.editMode = false;
      this.facultadForm.reset({
        nombre: '',
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  async onSubmitForm(): Promise<void> {
    if (this.facultadForm.invalid) {
      Object.keys(this.facultadForm.controls).forEach(key => {
        const control = this.facultadForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isLoading = true;
    try {
      const facultadData = {
        ...this.facultadForm.value,
        id: this.editMode ? this.facultadForm.value.id : undefined
      };
      let savedFacultad;
      if (this.editMode) {
        savedFacultad = await facultadesService.update(facultadData.id, facultadData);
      } else {
        savedFacultad = await facultadesService.create(facultadData);
      }
      await this.loadFacultades();
      this.closeFormModal();
    } catch (error: any) {
      console.error('Error saving facultad:', error);
      alert(`Error al guardar la facultad: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(id: number): void {
    this.facultadIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.facultadIdToDelete = null;
  }

  async onDelete(facultadId: number): Promise<void> {
    this.isLoading = true;
    try {
      await facultadesService.delete(facultadId);
      await this.loadFacultades();
      this.showDeleteModal = false;
    } catch (error: any) {
      console.error('Error deleting facultad:', error);
      alert(`Error al eliminar la facultad: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.facultadIdToDelete = null;
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
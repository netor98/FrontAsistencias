import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Materia } from '@domain/models/materias.model';
import { CarreraService } from '@infrastructure/admin/carreras.service';
import { MateriaService } from '@infrastructure/admin/materias.service';
import { materiasService } from "../../../../services/materias";
import { carrerasServiceSupa } from "../../../../services/carreras";

@Component({
  selector: 'app-materias',
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css'],
})
export class MateriasComponent implements OnInit {
  materias: any[] = [];
  carreras: any[] = [];
  filteredMaterias: any[] = [];
  materiaForm!: FormGroup;
  selectedFile: File | null = null;

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

  async loadMaterias(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await materiasService.getAll();
      this.materias = data;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading materias:', error);
    } finally {
      this.isLoading = false;
    }
  }

  loadCarreras(): void {
    carrerasServiceSupa.getAll().then((data) => {
      this.carreras = data;
    })
  }

  initForm(): void {
    this.materiaForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      semestre: [1, [Validators.required, Validators.min(1), Validators.max(20)]],
      carrera_id: [null, Validators.required],
      temario_url: ['']
    });
  }

  applyFilters(): void {
    let filtered = [...this.materias];

    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(materia =>
        materia.name.toLowerCase().includes(term)
      );
    }

    // Apply carrera filter
    if (this.selectedCarreraFilter) {
      filtered = filtered.filter(materia =>
        materia.carrera_id === this.selectedCarreraFilter
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
      id: '',
      name: '',
      semestre: 1,
      carrera_id: null,
      temario_url: ''
    });
    this.selectedFile = null;
    this.showFormModal = true;
  }

  openFormModal(materia?: any): void {
    if (materia) {
      this.editMode = true;
      this.materiaForm.patchValue({
        id: materia.id,
        name: materia.name,
        semestre: materia.semestre,
        carrera_id: materia.carrera_id,
        temario_url: materia.temario_url
      });
    } else {
      this.editMode = false;
      this.materiaForm.reset({
        semestre: 1, // Default value
        carrera_id: null
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
    } else {
      alert('Por favor seleccione un archivo PDF válido');
      event.target.value = '';
      this.selectedFile = null;
    }
  }

  async onSubmitForm(): Promise<void> {
    if (this.materiaForm.invalid) {
      Object.keys(this.materiaForm.controls).forEach(key => {
        const control = this.materiaForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isLoading = true;
    try {
      const materiaData = {
        ...this.materiaForm.value,
        id: this.editMode ? this.materiaForm.value.id : undefined
      };

      let savedMateria;
      if (this.editMode) {
        savedMateria = await materiasService.update(materiaData.id, materiaData);
      } else {
        savedMateria = await materiasService.create(materiaData);
      }

      if (this.selectedFile && savedMateria.id) {
        try {
          await materiasService.uploadTemario(this.selectedFile, savedMateria.id);
        } catch (error: any) {
          console.error('Error uploading temario:', error);
          alert(`Error al subir el temario: ${error.message}`);
          // Continue with the operation even if file upload fails
        }
      }

      await this.loadMaterias();
      this.closeFormModal();
    } catch (error: any) {
      console.error('Error saving materia:', error);
      alert(`Error al guardar la materia: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.selectedFile = null;
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

  async onDelete(materiaId: number): Promise<void> {
    try {
      this.isLoading = true;
      // First try to delete the temario if it exists
      try {
        await materiasService.deleteTemario(materiaId);
      } catch (error) {
        console.warn('Error deleting temario:', error);
        // Continue with materia deletion even if temario deletion fails
      }

      // Then delete the materia
      await materiasService.delete(materiaId);
      await this.loadMaterias();
      this.showDeleteModal = false;
      this.materiaIdToDelete = null;
    } catch (error: any) {
      console.error('Error deleting materia:', error);
      alert(error.message || 'Error al eliminar la materia');
    } finally {
      this.isLoading = false;
    }
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

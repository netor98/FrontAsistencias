import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { edificiosService } from "src/app/services/edificios";
import { aulasService } from "src/app/services/aulas";

interface Aula {
  id?: number;
  aula: string;
  edificio_id: number;
}

@Component({
  selector: 'app-aulas',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './aulas.component.html',
  styleUrls: ['./aulas.component.css'],
})
export class AulasComponent implements OnInit {
  aulas: Aula[] = [];
  filteredAulas: Aula[] = [];
  aulaForm!: FormGroup;
  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  aulaIdToDelete: number | null = null;
  searchTerm = '';
  isLoading = false;
  edificios: any[] = [];
  selectedEdificioFilter: number | null = null;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadAulas();
    this.loadEdificios();
    this.initForm();
  }

  async loadAulas(): Promise<void> {
    try {
      this.isLoading = true;
      
      const data = await aulasService.getAll();
      console.log('Received aulas from service:', data);
      this.aulas = data;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading aulas:', error);
      this.aulas = [];
      this.filteredAulas = [];
      alert('Error al cargar las aulas. Por favor, intente de nuevo más tarde.');
    } finally {
      this.isLoading = false;
    }
  }

  async loadEdificios(): Promise<void> {
    try {
      this.edificios = await edificiosService.getAll();
      console.log('Loaded edificios:', this.edificios);
    } catch (error) {
      console.error('Error loading edificios:', error);
    }
  }

  getEdificioNombre(edificioId: number): string {
    const edificio = this.edificios.find(e => e.id === edificioId);
    return edificio ? edificio.nombre : 'N/A';
  }

  initForm(): void {
    this.aulaForm = this.fb.group({
      id: [''],
      aula: ['', [Validators.required, Validators.maxLength(100)]],
      edificio_id: [null, [Validators.required]]
    });
  }

  applyFilters(): void {
    let filtered = [...this.aulas];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(aula =>
        (aula.aula && aula.aula.toLowerCase().includes(term))
      );
    }
    if (this.selectedEdificioFilter) {
      filtered = filtered.filter(aula => aula.edificio_id === this.selectedEdificioFilter);
    }
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredAulas = filtered.slice(startIndex, endIndex);
  }

  onCreate(): void {
    this.editMode = false;
    this.aulaForm.reset({
      id: '',
      aula: '',
      edificio_id: null
    });
    this.showFormModal = true;
  }

  openFormModal(aula?: Aula): void {
    if (aula) {
      this.editMode = true;
      this.aulaForm.patchValue({
        id: aula.id,
        aula: aula.aula,
        edificio_id: aula.edificio_id
      });
    } else {
      this.editMode = false;
      this.aulaForm.reset({
        aula: '',
        edificio_id: null
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  async onSubmitForm(): Promise<void> {
    if (this.aulaForm.invalid) {
      Object.keys(this.aulaForm.controls).forEach(key => {
        const control = this.aulaForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isLoading = true;
    try {
      const aulaData = {
        ...this.aulaForm.value,
        id: this.editMode ? this.aulaForm.value.id : undefined
      };
      console.log('Submitting data:', aulaData);
      let savedAula;
      if (this.editMode) {
        savedAula = await aulasService.update(aulaData.id, aulaData);
      } else {
        savedAula = await aulasService.create(aulaData);
      }
      await this.loadAulas();
      this.closeFormModal();
    } catch (error: any) {
      console.error('Error saving aula:', error);
      alert(`Error al guardar el aula: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(id: number): void {
    this.aulaIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.aulaIdToDelete = null;
  }

  async onDelete(aulaId: number): Promise<void> {
    this.isLoading = true;
    try {
      await aulasService.delete(aulaId);
      await this.loadAulas();
      this.showDeleteModal = false;
    } catch (error: any) {
      console.error('Error deleting aula:', error);
      alert(`Error al eliminar el aula: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.aulaIdToDelete = null;
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
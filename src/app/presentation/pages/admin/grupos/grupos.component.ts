import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { gruposService } from "../../../../services/grupos";
import { Grupo } from 'src/app/services/interfaces';
import { carrerasServiceSupa } from "../../../../services/carreras";
import { aulasService } from "src/app/services/aulas";
import { usuariosService } from "../../../../services/usuario";

@Component({
  selector: 'app-grupos',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './grupos.component.html',
  styleUrls: ['./grupos.component.css'],
})
export class GruposComponent implements OnInit {
  grupos: Grupo[] = [];
  filteredGrupos: Grupo[] = [];
  grupoForm!: FormGroup;
  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  grupoIdToDelete: number | null = null;
  searchTerm = '';
  selectedCarreraFilter: number | null = null;
  selectedAulaFilter: number | null = null;
  isLoading = false;
  carreras: any[] = [];
  aulas: any[] = [];
  usuarios: any[] = [];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadGrupos();
    this.initForm();
    this.loadCarreras();
    this.loadAulas();
    this.loadUsuarios();
  }

  async loadGrupos(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await gruposService.getAll();
      console.log('Grupos loaded:', data);
      this.grupos = data;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading grupos:', error);
      alert('Error al cargar los grupos. Por favor, intente de nuevo.');
    } finally {
      this.isLoading = false;
    }
  }

  async loadCarreras(): Promise<void> {
    try {
      this.carreras = await carrerasServiceSupa.getAll();
      console.log('Carreras loaded:', this.carreras);
    } catch (error) {
      console.error('Error loading carreras:', error);
    }
  }

  async loadAulas(): Promise<void> {
    try {
      this.aulas = await aulasService.getAll();
      console.log('Aulas loaded:', this.aulas);
    } catch (error) {
      console.error('Error loading aulas:', error);
    }
  }

  async loadUsuarios(): Promise<void> {
    try {
      this.usuarios = await usuariosService.getAll();
      console.log('Usuarios loaded:', this.usuarios);
    } catch (error) {
      console.error('Error loading usuarios:', error);
    }
  }

  getCarreraNombre(carreraId: number): string {
    const carrera = this.carreras.find(c => c.id === carreraId);
    return carrera ? carrera.nombre : 'N/A';
  }

  getAulaNombre(aulaId: number): string {
    const aula = this.aulas.find(a => a.id === aulaId);
    return aula ? aula.aula : 'N/A';
  }

  getJefeNombre(jefeNoCuenta: string): string {
    if (!jefeNoCuenta) return 'N/A';
    const jefe = this.usuarios.find(u => u.no_cuenta === jefeNoCuenta);
    return jefe ? `${jefe.nombre} ${jefe.apellidoPaterno || ''}` : 'N/A';
  }

  initForm(): void {
    this.grupoForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.maxLength(100)]],
      aula_id: [null, Validators.required],
      carrera_id: [null, Validators.required],
      jefe_nocuenta: [null, Validators.required]
    });
  }

  applyFilters(): void {
    let filtered = [...this.grupos];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(grupo =>
        (grupo.name && grupo.name.toLowerCase().includes(term))
      );
    }
    if (this.selectedCarreraFilter) {
      filtered = filtered.filter(grupo => grupo.carrera_id === this.selectedCarreraFilter);
    }
    if (this.selectedAulaFilter) {
      filtered = filtered.filter(grupo => grupo.aula_id === this.selectedAulaFilter);
    }
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredGrupos = filtered.slice(startIndex, endIndex);
  }

  onCreate(): void {
    this.editMode = false;
    this.grupoForm.reset({
      id: '',
      name: '',
      aula_id: null,
      carrera_id: null,
      jefe_nocuenta: null
    });
    this.showFormModal = true;
  }

  openFormModal(grupo?: Grupo): void {
    if (grupo) {
      this.editMode = true;
      this.grupoForm.patchValue({
        id: grupo.id,
        name: grupo.name,
        aula_id: grupo.aula_id,
        carrera_id: grupo.carrera_id,
        jefe_nocuenta: grupo.jefe_nocuenta
      });
    } else {
      this.editMode = false;
      this.grupoForm.reset({
        name: '',
        aula_id: null,
        carrera_id: null,
        jefe_nocuenta: null
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  async onSubmitForm(): Promise<void> {
    if (this.grupoForm.invalid) {
      Object.keys(this.grupoForm.controls).forEach(key => {
        const control = this.grupoForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    this.isLoading = true;
    try {
      const grupoData = {
        ...this.grupoForm.value,
        id: this.editMode ? this.grupoForm.value.id : undefined
      };
      console.log('Submitting grupo data:', grupoData);
      
      let savedGrupo;
      if (this.editMode) {
        savedGrupo = await gruposService.update(grupoData.id, grupoData);
      } else {
        savedGrupo = await gruposService.create(grupoData);
      }
      await this.loadGrupos();
      this.closeFormModal();
    } catch (error: any) {
      console.error('Error saving grupo:', error);
      alert(`Error al guardar el grupo: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(id: number): void {
    this.grupoIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.grupoIdToDelete = null;
  }

  async onDelete(grupoId: number): Promise<void> {
    this.isLoading = true;
    try {
      await gruposService.delete(grupoId);
      await this.loadGrupos();
      this.showDeleteModal = false;
    } catch (error: any) {
      console.error('Error deleting grupo:', error);
      alert(`Error al eliminar el grupo: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.grupoIdToDelete = null;
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
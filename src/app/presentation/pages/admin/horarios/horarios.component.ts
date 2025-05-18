import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { horariosService } from '../../../../services/horario-maestro';
import { HorarioMaestro } from 'src/app/services/interfaces';
import { usuariosService } from '../../../../services/usuario';
import { materiasService } from '../../../../services/materias';
import { gruposService } from '../../../../services/grupos';

@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './horarios.component.html',
  styleUrls: ['./horarios.component.css'],
})
export class HorariosComponent implements OnInit {
  horarios: HorarioMaestro[] = [];
  filteredHorarios: HorarioMaestro[] = [];
  horarioForm!: FormGroup;
  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  horarioIdToDelete: number | null = null;
  searchTerm = '';
  selectedMaestroFilter: number | null = null;
  selectedMateriaFilter: number | null = null;
  selectedGrupoFilter: number | null = null;
  selectedDiaFilter: string | null = null;
  isLoading = false;
  isMaestrosLoading = false;
  isMateriasLoading = false;
  isGruposLoading = false;
  maestros: any[] = [];
  materias: any[] = [];
  grupos: any[] = [];
  diasSemana = [
    'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
  ];
  horas = [
    '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', 
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
  ];
  
  // Track if all data is loaded for the modal
  get isModalDataLoaded(): boolean {
    return !this.isMaestrosLoading && !this.isMateriasLoading && !this.isGruposLoading;
  }

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.loadHorarios();
    this.initForm();
    this.loadAllReferenceData();
  }

  // Load all reference data in parallel
  loadAllReferenceData(): void {
    this.loadMaestros();
    this.loadMaterias();
    this.loadGrupos();
  }

  async loadHorarios(): Promise<void> {
    try {
      this.isLoading = true;
      const data = await horariosService.getAll();
      console.log('Horarios loaded:', data);
      this.horarios = data;
      this.applyFilters();
    } catch (error) {
      console.error('Error loading horarios:', error);
      alert('Error al cargar los horarios. Por favor, intente de nuevo.');
    } finally {
      this.isLoading = false;
    }
  }

  async loadMaestros(): Promise<void> {
    try {
      this.isMaestrosLoading = true;
      const usuarios = await usuariosService.getAll();
      this.maestros = usuarios.filter(u => u.role === 'Maestro');
      console.log('Maestros loaded:', this.maestros);
    } catch (error) {
      console.error('Error loading maestros:', error);
      alert('Error al cargar los profesores. Por favor, intente de nuevo.');
    } finally {
      this.isMaestrosLoading = false;
    }
  }

  async loadMaterias(): Promise<void> {
    try {
      this.isMateriasLoading = true;
      this.materias = await materiasService.getAll();
      console.log('Materias loaded:', this.materias);
    } catch (error) {
      console.error('Error loading materias:', error);
      alert('Error al cargar las materias. Por favor, intente de nuevo.');
    } finally {
      this.isMateriasLoading = false;
    }
  }

  async loadGrupos(): Promise<void> {
    try {
      this.isGruposLoading = true;
      this.grupos = await gruposService.getAll();
      console.log('Grupos loaded:', this.grupos);
    } catch (error) {
      console.error('Error loading grupos:', error);
      alert('Error al cargar los grupos. Por favor, intente de nuevo.');
    } finally {
      this.isGruposLoading = false;
    }
  }

  getMaestroNombre(maestroId: number): string {
    const maestro = this.maestros.find(m => m.id === maestroId);
    return maestro ? `${maestro.name}` : 'N/A';
  }

  getMateriaNombre(materiaId: number): string {
    const materia = this.materias.find(m => m.id === materiaId);
    return materia ? materia.name : 'N/A';
  }

  getGrupoNombre(grupoId: number): string {
    const grupo = this.grupos.find(g => g.id === grupoId);
    return grupo ? grupo.name : 'N/A';
  }

  initForm(): void {
    this.horarioForm = this.fb.group({
      id: [''],
      maestro_id: [null, Validators.required],
      materia_id: [null, Validators.required],
      grupo_id: [null, Validators.required],
      dia: ['', Validators.required],
      hora_inicio: ['', Validators.required],
      hora_fin: ['', Validators.required]
    });
  }

  applyFilters(): void {
    let filtered = [...this.horarios];
    
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(horario => {
        const maestroNombre = this.getMaestroNombre(horario.maestro_id).toLowerCase();
        const materiaNombre = this.getMateriaNombre(horario.materia_id).toLowerCase();
        return maestroNombre.includes(term) || materiaNombre.includes(term);
      });
    }
    
    if (this.selectedMaestroFilter) {
      filtered = filtered.filter(horario => horario.maestro_id === this.selectedMaestroFilter);
    }
    
    if (this.selectedMateriaFilter) {
      filtered = filtered.filter(horario => horario.materia_id === this.selectedMateriaFilter);
    }
    
    if (this.selectedGrupoFilter) {
      filtered = filtered.filter(horario => horario.grupo_id === this.selectedGrupoFilter);
    }
    
    if (this.selectedDiaFilter) {
      filtered = filtered.filter(horario => horario.dia === this.selectedDiaFilter);
    }
    
    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredHorarios = filtered.slice(startIndex, endIndex);
  }

  async onCreate(): Promise<void> {
    this.editMode = false;
    this.horarioForm.reset({
      id: '',
      maestro_id: null,
      materia_id: null,
      grupo_id: null,
      dia: '',
      hora_inicio: '',
      hora_fin: ''
    });
    
    // Ensure reference data is loaded before showing the modal
    await this.ensureReferenceDataLoaded();
    this.showFormModal = true;
  }

  async openFormModal(horario?: HorarioMaestro): Promise<void> {
    // Ensure reference data is loaded before showing the modal
    await this.ensureReferenceDataLoaded();
    
    if (horario) {
      this.editMode = true;
      console.log('Editing horario:', horario);
      
      // Check if we're dealing with the hora field or the hora_inicio/hora_fin fields
      let hora_inicio = '';
      let hora_fin = '';
      
      if (horario.hora_inicio && horario.hora_fin) {
        // Use the hora_inicio and hora_fin fields directly
        hora_inicio = horario.hora_inicio;
        hora_fin = horario.hora_fin;
      } else if (horario.hora) {
        // Try to parse the hora field (might be in format "07:00 - 09:00")
        const horaSplit = horario.hora.split(' - ');
        if (horaSplit.length === 2) {
          hora_inicio = horaSplit[0].trim();
          hora_fin = horaSplit[1].trim();
        } else {
          hora_inicio = horario.hora;
          hora_fin = '';
        }
      }
      
      const formValues = {
        id: horario.id,
        maestro_id: horario.maestro_id,
        materia_id: horario.materia_id,
        grupo_id: horario.grupo_id,
        dia: horario.dia,
        hora_inicio: hora_inicio,
        hora_fin: hora_fin
      };
      
      console.log('Setting form values:', formValues);
      this.horarioForm.patchValue(formValues);
    } else {
      this.editMode = false;
      this.horarioForm.reset({
        maestro_id: null,
        materia_id: null,
        grupo_id: null,
        dia: '',
        hora_inicio: '',
        hora_fin: ''
      });
    }
    this.showFormModal = true;
  }

  // Helper method to ensure all reference data is loaded
  async ensureReferenceDataLoaded(): Promise<void> {
    const loadPromises = [];
    
    if (this.maestros.length === 0 && !this.isMaestrosLoading) {
      loadPromises.push(this.loadMaestros());
    }
    
    if (this.materias.length === 0 && !this.isMateriasLoading) {
      loadPromises.push(this.loadMaterias());
    }
    
    if (this.grupos.length === 0 && !this.isGruposLoading) {
      loadPromises.push(this.loadGrupos());
    }
    
    if (loadPromises.length > 0) {
      await Promise.all(loadPromises).catch(error => {
        console.error('Error loading reference data:', error);
      });
    }
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  async onSubmitForm(): Promise<void> {
    if (this.horarioForm.invalid) {
      Object.keys(this.horarioForm.controls).forEach(key => {
        const control = this.horarioForm.get(key);
        control?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    try {
      const formValues = this.horarioForm.value;
      
      // Create the data object to save
      const horarioData: Partial<HorarioMaestro> = {
        maestro_id: formValues.maestro_id,
        materia_id: formValues.materia_id,
        grupo_id: formValues.grupo_id,
        dia: formValues.dia,
        hora_inicio: formValues.hora_inicio,
        hora_fin: formValues.hora_fin
      };
      
      // Add the ID for edit mode
      if (this.editMode && formValues.id) {
        horarioData.id = formValues.id;
      }
      
      console.log('Submitting horario data:', horarioData);
      
      let savedHorario;
      if (this.editMode) {
        savedHorario = await horariosService.update(horarioData.id!, horarioData);
      } else {
        savedHorario = await horariosService.create(horarioData as HorarioMaestro);
      }
      
      await this.loadHorarios();
      this.closeFormModal();
    } catch (error: any) {
      console.error('Error saving horario:', error);
      alert(`Error al guardar el horario: ${error.message}`);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(id: number): void {
    this.horarioIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.horarioIdToDelete = null;
  }

  async onDelete(horarioId: number): Promise<void> {
    this.isLoading = true;
    try {
      await horariosService.delete(horarioId);
      await this.loadHorarios();
      this.showDeleteModal = false;
    } catch (error: any) {
      console.error('Error deleting horario:', error);
      alert(`Error al eliminar el horario: ${error.message}`);
    } finally {
      this.isLoading = false;
      this.horarioIdToDelete = null;
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

  resetFilters(): void {
    this.selectedMaestroFilter = null;
    this.selectedMateriaFilter = null;
    this.selectedGrupoFilter = null;
    this.selectedDiaFilter = null;
    this.searchTerm = '';
    this.applyFilters();
  }
}

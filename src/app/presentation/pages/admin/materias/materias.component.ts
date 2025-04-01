import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import CarrerasFiltersComponent from '@components/carrera-filters/carrera-filters.component';
import { CarreraService } from '@infrastructure/admin/carreras.service';
import { MateriaService } from '@infrastructure/admin/materias.service';

@Component({
  selector: 'app-materias',
  imports: [ReactiveFormsModule, CommonModule, CarrerasFiltersComponent],
  templateUrl: './materias.component.html',
  styleUrls: ['./materias.component.css'],
})
export class MateriasComponent implements OnInit {
  materias: any[] = [];
  carreras: any[] = [];
  filteredMaterias: any[] = [];
  materiaForm!: FormGroup;

  showFormModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;

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
    this.materiaService.getAll().subscribe((data) => {
      this.materias = data;
      console.log(data)
      this.applyFilters();
    });
  }

  loadCarreras(): void {
    this.carreraService.getAll().subscribe((data) => {
      this.carreras = data;
    });
  }

  initForm(): void {
    this.materiaForm = this.fb.group({
      id: [''],
      clave: ['', Validators.required],
      nombre: ['', Validators.required],
      carreraId: [null, Validators.required],
    });
  }

  applyFilters(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredMaterias = this.materias.slice(startIndex, endIndex);
    this.totalPages = Math.ceil(this.materias.length / this.pageSize);
  }

  onCreate(): void {
    this.editMode = false;
    this.materiaForm.reset();
    this.showFormModal = true;
  }

  openFormModal(materia?: any): void {
    if (materia) {
      this.editMode = true;
      this.materiaForm.patchValue(materia);
    } else {
      this.editMode = false;
      this.materiaForm.reset();
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  onSubmitForm(): void {
    if (this.materiaForm.invalid) return;

    const materia = this.materiaForm.value;

    if (this.editMode) {
      this.materiaService.update(materia.id, materia).subscribe(() => {
        this.loadMaterias();
      });
    } else {
      this.materiaService.create(materia).subscribe(() => {
        this.loadMaterias();
      });
    }

    this.closeFormModal();
  }

  onDelete(id: number): void {
    this.materiaService.delete(id).subscribe(() => {
      this.loadMaterias();
    });
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

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { usuariosService } from 'src/app/services/usuario'; // Ajusta path según estructura
import type { Usuario } from 'src/app/services/interfaces'; // Asegúrate de que la interfaz exista

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: Usuario[] = [];
  filteredUsers: Usuario[] = [];
  userForm!: FormGroup;

  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  searchTerm = '';
  userIdToDelete: number | null = null;
  isLoading = false;

  roles = [
    { value: 'profesor', label: 'Profesor' },
    { value: 'alumno', label: 'Alumno' },
    { value: 'admin', label: 'Administrador' }
  ];
error: any;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.loadUsers();
    this.initForm();
  }

  async loadUsers(): Promise<void> {
    try {
      this.isLoading = true;
      this.users = await usuariosService.getAll();
      this.applyFilters();
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      this.isLoading = false;
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [''],
      user: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.minLength(6)]],
      rol: ['', Validators.required],
      status: [true],
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      noControl: [''],
      carrera: ['']
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nombre?.toLowerCase().includes(term) ||
        user.apellidoPaterno?.toLowerCase().includes(term)
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredUsers = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  onCreate(): void {
    this.editMode = false;
    this.userForm.reset({ status: true, rol: '' });
    this.showFormModal = true;
  }

  openFormModal(user?: Usuario): void {
    this.editMode = !!user;
    this.userForm.reset({
      ...user,
      password: '', // Vaciar password al editar
    });
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  async onSubmitForm(): Promise<void> {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach(c => c.markAsTouched());
      return;
    }

    const userData = this.userForm.value;
    this.isLoading = true;

    try {
      if (this.editMode) {
        if (!userData.password) delete userData.password;
        await usuariosService.update(userData.id, userData);
      } else {
        await usuariosService.create(userData);
      }

      await this.loadUsers();
      this.closeFormModal();
    } catch (error) {
      console.error(this.editMode ? 'Error updating user:' : 'Error creating user:', error);
    } finally {
      this.isLoading = false;
    }
  }

  confirmDelete(id: number): void {
    this.userIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.userIdToDelete = null;
    this.showDeleteModal = false;
  }

  async onDelete(id: number): Promise<void> {
    this.isLoading = true;
    try {
      await usuariosService.delete(id);
      await this.loadUsers();
      this.showDeleteModal = false;
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      this.isLoading = false;
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

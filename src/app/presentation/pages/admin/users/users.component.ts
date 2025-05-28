import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { usuariosService } from 'src/app/services/usuario';
import type { Usuario } from 'src/app/services/interfaces';

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
    { value: 'Alumno', label: 'Alumno' },
    { value: 'Jefe_de_Grupo', label: 'Jefe de Grupo' },
    { value: 'Checador', label: 'Checador' },
    { value: 'Maestro', label: 'Maestro' },
    { value: 'Administrador', label: 'Administrador' }
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
      console.log('Users loaded:', this.users);
      this.applyFilters();
    } catch (error) {
      console.error('Error loading users:', error);
      this.error = 'Error al cargar los usuarios';
    } finally {
      this.isLoading = false;
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [''],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      role: ['', Validators.required],
      numero_cuenta: ['', Validators.required]
    });
  }

  applyFilters(): void {
    let filtered = [...this.users];
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term) ||
        user.numero_cuenta?.toLowerCase().includes(term)
      );
    }

    this.totalPages = Math.ceil(filtered.length / this.pageSize);
    if (this.currentPage > this.totalPages) this.currentPage = 1;

    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredUsers = filtered.slice(startIndex, startIndex + this.pageSize);
  }

  onCreate(): void {
    this.editMode = false;
    this.userForm.reset({
      role: '',
      password: ''
    });
    this.showFormModal = true;
  }

  openFormModal(user?: Usuario): void {
    if (user) {
      this.editMode = true;
      this.userForm.patchValue({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        numero_cuenta: user.numero_cuenta
      });
      this.userForm.get('password')?.setValue('');
    } else {
      this.editMode = false;
      this.userForm.reset({
        role: '',
        password: ''
      });
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
    this.error = null;
  }

  async onSubmitForm(): Promise<void> {
    console.log('Form submitted, form valid:', this.userForm.valid);
    console.log('Form values:', this.userForm.value);
    console.log('Form errors:', this.userForm.errors);
    console.log('Form controls:', this.userForm.controls);

    if (this.userForm.invalid) {
      console.log('Form is invalid, marking all controls as touched');
      Object.values(this.userForm.controls).forEach(c => {
        c.markAsTouched();
        console.log('Control:', c.value, 'Valid:', c.valid, 'Errors:', c.errors);
      });
      return;
    }

    this.isLoading = true;
    try {
      const userData = { ...this.userForm.value };
      
      if (this.editMode && !userData.password) {
        delete userData.password;
      }

      console.log('Submitting user data:', userData);
      
      if (this.editMode) {
        console.log('Updating user with ID:', userData.id);
        await usuariosService.update(userData.id, userData);
      } else {
        delete userData.id;
        console.log('Creating new user');
        const result = await usuariosService.create(userData);
        console.log('User created:', result);
      }

      console.log('Reloading users list');
      await this.loadUsers();
      this.closeFormModal();
    } catch (error: any) {
      console.error(this.editMode ? 'Error updating user:' : 'Error creating user:', error);
      this.error = error.message || 'Error al guardar el usuario';
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
    } catch (error: any) {
      console.error('Error deleting user:', error);
      this.error = error.message || 'Error al eliminar el usuario';
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

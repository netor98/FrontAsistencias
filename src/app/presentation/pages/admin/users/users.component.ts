import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { User } from '@domain/models/user.model';
import { UserService } from '@infrastructure/admin/users.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  userForm!: FormGroup;
  
  showFormModal = false;
  showDeleteModal = false;
  editMode = false;
  currentPage = 1;
  pageSize = 7;
  totalPages = 1;
  searchTerm = '';
  userIdToDelete: string | null = null;
  isLoading = false;

  roles = [
    { value: 'profesor', label: 'Profesor' },
    { value: 'alumno', label: 'Alumno' },
    { value: 'admin', label: 'Administrador' }
  ];

  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadUsers();
    this.initForm();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.applyFilters();
        this.isLoading = false;
        console.log(this.users);
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.isLoading = false;
      }
    });
  }

  initForm(): void {
    this.userForm = this.fb.group({
      id: [''],
      user: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', this.editMode ? [] : [Validators.required, Validators.minLength(6)]],
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
    
    // Apply search filter
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.user.toLowerCase().includes(term) || 
        (user.nombre && user.nombre.toLowerCase().includes(term)) ||
        (user.apellidoPaterno && user.apellidoPaterno.toLowerCase().includes(term))
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
    this.filteredUsers = filtered.slice(startIndex, endIndex);
  }

  onCreate(): void {
    this.editMode = false;
    this.userForm.reset({
      status: true,
      rol: ''
    });
    this.showFormModal = true;
  }

  openFormModal(user?: User): void {
    if (user) {
      this.editMode = true;
      this.userForm.patchValue({
        ...user,
        password: '' // Don't show the password
      });
    } else {
      this.editMode = false;
      this.userForm.reset({
        status: true,
        rol: ''
      });
    }
    this.showFormModal = true;
  }

  closeFormModal(): void {
    this.showFormModal = false;
  }

  onSubmitForm(): void {
    if (this.userForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.userForm.controls).forEach(key => {
        const control = this.userForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    const userData = this.userForm.value;
    this.isLoading = true;

    if (this.editMode) {
      // If editing and no new password is provided, remove it from the data
      if (!userData.password) {
        delete userData.password;
      }
      
      this.userService.update(userData.id, userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeFormModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.isLoading = false;
        }
      });
    } else {
      this.userService.create(userData).subscribe({
        next: () => {
          this.loadUsers();
          this.closeFormModal();
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.isLoading = false;
        }
      });
    }
  }

  confirmDelete(id: string): void {
    this.userIdToDelete = id;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.userIdToDelete = null;
    this.showDeleteModal = false;
  }

  onDelete(id: string): void {
    this.isLoading = true;
    this.userService.delete(id).subscribe({
      next: () => {
        this.loadUsers();
        this.showDeleteModal = false;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error deleting user:', error);
        this.isLoading = false;
      }
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
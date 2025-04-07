import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { AsistenciasService } from '../../../../infrastructure/asistencias/asistencias.service';
import { Asistencia, AsistenciaComparison, CompareAsistenciasRequest } from '../../../../domain/models/asistencia.model';

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.css']
})
export class AsistenciasComponent implements OnInit, OnDestroy {
  // Form to filter/search for attendance records
  searchForm: FormGroup;
  
  // Data for the attendance comparison
  comparisonData: AsistenciaComparison | null = null;
  
  // Loading and error state
  loading = false;
  error: string | null = null;
  
  // Selected record for operations
  selectedAttendance: Asistencia | null = null;
  
  // Track subscriptions for cleanup
  private subscriptions: Subscription[] = [];
  
  constructor(
    private fb: FormBuilder,
    private asistenciasService: AsistenciasService
  ) {
    this.searchForm = this.fb.group({
      materiaxgrupoId: ['', Validators.required],
      fecha_Inicio: ['', Validators.required],
      fecha_Fin: ['']
    });
  }
  
  ngOnInit(): void {}
  
  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  onSearch(): void {
    if (this.searchForm.invalid) return;
    
    this.loading = true;
    this.error = null;
    
    const request: CompareAsistenciasRequest = this.searchForm.value;
    
    const sub = this.asistenciasService.compareAsistencias(request)
      .subscribe({
        next: (data) => {
          this.comparisonData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al obtener los datos de asistencia';
          this.loading = false;
          console.error('Error fetching attendance data', err);
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  selectAttendance(attendance: Asistencia): void {
    this.selectedAttendance = attendance;
  }
  
  // Update teacher attendance
  updateTeacherAttendance(id: number, attended: boolean): void {
    this.loading = true;
    
    const sub = this.asistenciasService.updateTeacherAttendance(id, attended)
      .subscribe({
        next: (message) => {
          // Update local data
          if (this.comparisonData && this.comparisonData.records) {
            const record = this.comparisonData.records.find(r => r.id === id);
            if (record) {
              record.asistencia_Profesor = attended;
              this.updateAttendanceStatus(record);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar la asistencia del profesor';
          this.loading = false;
          console.error('Error updating teacher attendance', err);
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Update student (group leader) attendance
  updateStudentAttendance(id: number, attended: boolean): void {
    this.loading = true;
    
    const sub = this.asistenciasService.updateStudentAttendance(id, attended)
      .subscribe({
        next: (message) => {
          // Update local data
          if (this.comparisonData && this.comparisonData.records) {
            const record = this.comparisonData.records.find(r => r.id === id);
            if (record) {
              record.asistencia_Alumno = attended;
              this.updateAttendanceStatus(record);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar la asistencia del jefe de grupo';
          this.loading = false;
          console.error('Error updating student attendance', err);
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Update checker attendance
  updateCheckerAttendance(id: number, attended: boolean): void {
    this.loading = true;
    
    const sub = this.asistenciasService.updateCheckerAttendance(id, attended)
      .subscribe({
        next: (message) => {
          // Update local data
          if (this.comparisonData && this.comparisonData.records) {
            const record = this.comparisonData.records.find(r => r.id === id);
            if (record) {
              record.asistencia_Checador = attended;
              this.updateAttendanceStatus(record);
            }
          }
          this.loading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Error al actualizar la asistencia del checador';
          this.loading = false;
          console.error('Error updating checker attendance', err);
        }
      });
    
    this.subscriptions.push(sub);
  }
  
  // Helper method to update status after changes
  private updateAttendanceStatus(record: Asistencia): void {
    const { asistencia_Profesor, asistencia_Alumno, asistencia_Checador } = record;
    
    // Update completeness
    record.isComplete = asistencia_Profesor !== null && 
                       asistencia_Alumno !== null && 
                       asistencia_Checador !== null;
    
    // Update consistency
    record.isConsistent = record.isComplete && 
                        (asistencia_Profesor === asistencia_Alumno && 
                         asistencia_Profesor === asistencia_Checador);
    
    // Update status
    if (!record.isComplete) {
      record.status = 'incomplete';
    } else if (record.isConsistent) {
      record.status = asistencia_Profesor ? 'present' : 'absent';
    } else {
      record.status = 'conflict';
    }
    
    // Update summary statistics
    if (this.comparisonData) {
      const records = this.comparisonData.records;
      const totalRecords = records.length;
      const completedRecords = records.filter(r => r.isComplete).length;
      const consistentRecords = records.filter(r => r.isConsistent).length;
      
      this.comparisonData.summary = {
        totalRecords,
        completedRecords,
        consistentRecords,
        completionRate: totalRecords > 0 ? (completedRecords / totalRecords) * 100 : 0,
        consistencyRate: completedRecords > 0 ? (consistentRecords / completedRecords) * 100 : 0
      };
    }
  }
  
  // Helper methods for UI
  getStatusClass(status: string | undefined): string {
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      case 'conflict': return 'bg-yellow-100 text-yellow-800';
      case 'incomplete': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusText(status: string | undefined): string {
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      case 'conflict': return 'Conflicto';
      case 'incomplete': return 'Incompleto';
      default: return 'Desconocido';
    }
  }
  
  resetForm(): void {
    this.searchForm.reset();
    this.comparisonData = null;
    this.error = null;
  }
} 
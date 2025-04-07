import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { AsistenciaRepository } from '../../domain/repositories/asistencia/asistencia.repository';
import { AsistenciaComparison, CompareAsistenciasRequest } from '../../domain/models/asistencia.model';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AsistenciasService implements AsistenciaRepository {
  private readonly baseUrl = environment.API_URL + '/asistencias';

  constructor(private readonly http: HttpClient) {}

  compareAsistencias(request: CompareAsistenciasRequest): Observable<AsistenciaComparison> {
    return this.http.post<AsistenciaComparison>(`${this.baseUrl}/comparar`, request).pipe(
      catchError(error => {
        console.error('Error comparing attendance records', error);
        return throwError(() => error);
      })
    );
  }

  updateTeacherAttendance(id: number, attended: boolean): Observable<string> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/profesor`, {
      id,
      asistencia_Profesor: attended
    }).pipe(
      map(response => response.message || 'Asistencia de profesor actualizada'),
      catchError(error => {
        console.error('Error updating teacher attendance', error);
        return throwError(() => error);
      })
    );
  }

  updateStudentAttendance(id: number, attended: boolean): Observable<string> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/alumno`, {
      id,
      asistencia_Alumno: attended
    }).pipe(
      map(response => response.message || 'Asistencia de alumno actualizada'),
      catchError(error => {
        console.error('Error updating student attendance', error);
        return throwError(() => error);
      })
    );
  }

  updateCheckerAttendance(id: number, attended: boolean): Observable<string> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/checador`, {
      id,
      asistencia_Checador: attended
    }).pipe(
      map(response => response.message || 'Asistencia de checador actualizada'),
      catchError(error => {
        console.error('Error updating checker attendance', error);
        return throwError(() => error);
      })
    );
  }
} 
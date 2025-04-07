import { AsistenciaComparison, CompareAsistenciasRequest } from "../../models/asistencia.model";
import { Observable } from "rxjs";

export interface AsistenciaRepository {
  /**
   * Gets all the attendance records for comparison
   * @param request Filter parameters for the attendance comparison
   */
  compareAsistencias(request: CompareAsistenciasRequest): Observable<AsistenciaComparison>;
  
  /**
   * Updates a teacher attendance record
   * @param id The attendance record ID
   * @param attended Whether the teacher attended
   */
  updateTeacherAttendance(id: number, attended: boolean): Observable<string>;
  
  /**
   * Updates a group leader attendance record
   * @param id The attendance record ID
   * @param attended Whether the group leader marked the teacher as attended
   */
  updateStudentAttendance(id: number, attended: boolean): Observable<string>;
  
  /**
   * Updates a checker attendance record
   * @param id The attendance record ID
   * @param attended Whether the checker marked the teacher as attended
   */
  updateCheckerAttendance(id: number, attended: boolean): Observable<string>;
} 
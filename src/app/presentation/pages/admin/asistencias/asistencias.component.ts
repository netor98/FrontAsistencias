import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { materiasService } from '../../../../services/materias';
import { horariosService } from '../../../../services/horario-maestro';
import { gruposService } from '../../../../services/grupos';
import { Asistencia } from '../../../../services/interfaces';
import { getAsistenciasByDateRange } from '../../../../services/asistencias';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AttendanceComparison {
  fecha: string;
  horario_id: number;
  materia: string;
  grupo: string;
  maestro: string;
  maestro_id: number;
  asistenciaProfesor: boolean | null;
  asistenciaAlumno: boolean | null;
  asistenciaChecador: boolean | null;
  isComplete: boolean;
  isConsistent: boolean;
  status: 'present' | 'absent';
}

interface AsistenciasFilters {
  maestroId: number | null;
  fechaInicio: string;
  fechaFin: string;
}

@Component({
  selector: 'app-asistencias',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './asistencias.component.html',
  styleUrls: ['./asistencias.component.css']
})
export class AsistenciasComponent implements OnInit, OnDestroy {
  // Make Math available to the template
  Math = Math;
  
  searchForm: FormGroup;
  isLoading = false;
  error: string | null = null;
  
  // Data collections
  maestros: any[] = [];
  horarios: any[] = [];
  materias: any[] = [];
  grupos: any[] = [];
  asistenciasMaestro: Asistencia[] = [];
  asistenciasAlumno: Asistencia[] = [];
  asistenciasChecador: Asistencia[] = [];
  
  // Processed data for display
  comparisonData: AttendanceComparison[] = [];
  filteredComparisonData: AttendanceComparison[] = [];
  
  // Filtered data by type for PDF export
  profesorData: AttendanceComparison[] = [];
  alumnoData: AttendanceComparison[] = [];
  checadorData: AttendanceComparison[] = [];
  
  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalPages = 1;
  
  // Selected record for details/view
  selectedAttendance: AttendanceComparison | null = null;
  showDetailModal = false;
  
  private subscriptions: Subscription[] = [];
  
  constructor(private fb: FormBuilder) {
    this.searchForm = this.fb.group({
      maestroId: [null],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required]
    });
  }
  
  ngOnInit(): void {
    this.loadTeachers();
    
    // Initialize with current month's date range
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.searchForm.patchValue({
      fechaInicio: this.formatDate(firstDay),
      fechaFin: this.formatDate(lastDay)
    });
  }
  
  ngOnDestroy(): void {
    // Clean up all subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  async loadTeachers(): Promise<void> {
    try {
      // Get all horarios to extract unique teachers with complete information
      const horarios = await horariosService.getAll2();
      
      // Load materias and grupos for reference
      this.materias = await materiasService.getAll();
      this.grupos = await gruposService.getAll();
      
      // Store horarios for later reference
      this.horarios = horarios;
      
      // Extract unique maestro_ids and their names
      const maestroMap = new Map();
      horarios.forEach((h: any) => {
        if (h.maestro && !maestroMap.has(h.maestro_id)) {
          maestroMap.set(h.maestro_id, h.maestro);
        }
      });
      
      // Create maestros array with id and name for display
      this.maestros = Array.from(maestroMap.entries()).map(([id, maestro]) => ({
        id,
        name: maestro.name
      }));
      
    } catch (error) {
      console.error('Error loading teachers:', error);
      this.error = 'Error al cargar los profesores';
    }
  }
  
  async onSearch(): Promise<void> {
    if (this.searchForm.invalid) {
      Object.keys(this.searchForm.controls).forEach(key => {
        this.searchForm.get(key)?.markAsTouched();
      });
      return;
    }
    
    this.isLoading = true;
    this.error = null;
    
    try {
      const filters: AsistenciasFilters = this.searchForm.value;
      
      // Load asistencias for the date range from Supabase
      await this.loadAsistencias(filters);
      
      // Process and compare the attendance data
      await this.processAttendanceData();
      
      // Filter data by type for PDF export
      this.filterDataByType();
      
      // Apply pagination
      this.applyPagination();
      
      // Print asistencias to console
      this.printAsistenciasToConsole();
      
    } catch (error: any) {
      console.error('Error fetching attendance data:', error);
      this.error = `Error al obtener datos de asistencia: ${error.message || 'Error desconocido'}`;
    } finally {
      this.isLoading = false;
    }
  }
  
  async loadAsistencias(filters: AsistenciasFilters): Promise<void> {
    try {
      console.log('Loading asistencias with filters:', filters);
      
      let maestroId = filters.maestroId;
      let startDate = filters.fechaInicio;
      let endDate = filters.fechaFin;
      
      // If maestroId is provided, we need to get all horarios for this teacher
      let horarioIds: number[] = [];
      
      if (maestroId) {
        // Filter horarios by maestro_id
        horarioIds = this.horarios
          .filter((h: any) => h.maestro_id === maestroId)
          .map((h: any) => h.id);
        
        console.log(`Found ${horarioIds.length} horarios for maestro ${maestroId}`);
        
        if (horarioIds.length === 0) {
          // No horarios found for this teacher
          this.asistenciasChecador = [];
          this.asistenciasMaestro = [];
          this.asistenciasAlumno = [];
          return;
        }
      }
      
      // Call the Supabase service function for each horario_id
      let allChecador: Asistencia[] = [];
      let allMaestro: Asistencia[] = [];
      let allJefe: Asistencia[] = [];

      try {
        // No specific teacher selected, get all attendance records
        const { checador, maestro, jefe } = await getAsistenciasByDateRange(
          startDate,
          endDate,
          null,
          null,
          horarioIds.length > 0 ? horarioIds[0] : null
        );
        
        console.log('Respuesta directa de Supabase:');
        console.log('- Checador:', checador.length > 0 ? 'Datos recibidos' : 'Sin datos');
        console.log('- Maestro:', maestro.length > 0 ? 'Datos recibidos' : 'Sin datos');
        console.log('- Jefe:', jefe.length > 0 ? 'Datos recibidos' : 'Sin datos');
        
        if (jefe.length === 0) {
          console.warn('⚠️ NO HAY DATOS DE JEFE/ALUMNO EN LA RESPUESTA DE SUPABASE');
          console.log('Verificar si la tabla en Supabase tiene el nombre correcto y contiene datos');
        }
        
        allChecador = checador;
        allMaestro = maestro;
        allJefe = jefe;
      } catch (innerError: any) {
        console.error('Error específico en la llamada a getAsistenciasByDateRange:', innerError);
        console.error('Stack trace:', innerError.stack);
      }
      // Log the number of records loaded
      console.log(`Data loaded: ${allChecador.length} checador records, ${allMaestro.length} maestro records, ${allJefe.length} jefe records`);
      
      // Store the results
      this.asistenciasChecador = allChecador;
      this.asistenciasMaestro = allMaestro;
      this.asistenciasAlumno = allJefe; // The jefe data is the student/alumno data
      
      // Log detailed information about the loaded data
      console.log('ALUMNO/JEFE DETAILS:', this.asistenciasAlumno.map(a => ({
        fecha: a.fecha,
        horario_id: a.horario_id,
        asistencia: a.asistencia,
        tipo: typeof a.asistencia
      })));
      
    } catch (error) {
      console.error('Error loading asistencias:', error);
      if (error instanceof Error) {
        console.error('Error message:', error.message);
        console.error('Stack trace:', error.stack);
      }
      throw error;
    }
  }
  
  async processAttendanceData(): Promise<void> {
    // Map of horario_id -> fecha -> attendance record
    const attendanceMap = new Map<string, AttendanceComparison>();
    const recordPromises: Promise<void>[] = [];

    console.log('Procesando datos de asistencias...');
    console.log('Asistencias Alumno antes de procesar:', this.asistenciasAlumno.length);
    
    // Function to process a single attendance record
    const processRecord = async (a: Asistencia, type: 'profesor' | 'alumno' | 'checador'): Promise<void> => {
      if (!a.fecha || !a.horario_id) {
        console.warn(`Registro inválido de tipo ${type}:`, a);
        return;
      }
      
      const key = `${a.horario_id}-${a.fecha}`;
      if (!attendanceMap.has(key)) {
        const record = await this.createEmptyAttendanceRecord(a.horario_id, a.fecha);
        attendanceMap.set(key, record);
      }
      
      const record = attendanceMap.get(key)!;
      
      // Update the correct field based on the record type
      switch (type) {
        case 'profesor':
          record.asistenciaProfesor = Boolean(a.asistencia);
          break;
        case 'alumno':
          record.asistenciaAlumno = Boolean(a.asistencia);
          console.log(`Procesando asistencia alumno: ${a.fecha}, ${a.horario_id}, valor: ${a.asistencia} -> ${Boolean(a.asistencia)}`);
          break;
        case 'checador':
          record.asistenciaChecador = Boolean(a.asistencia);
          break;
      }
    };
    
    // Create promises for all attendance records
    this.asistenciasMaestro.forEach(a => {
      recordPromises.push(processRecord(a, 'profesor'));
    });
    
    // Procesar datos de alumnos con verificación adicional
    if (this.asistenciasAlumno.length > 0) {
      console.log('Procesando asistencias de alumnos:', this.asistenciasAlumno.length);
      this.asistenciasAlumno.forEach(a => {
        recordPromises.push(processRecord(a, 'alumno'));
      });
    } else {
      console.warn('No hay asistencias de alumnos para procesar');
    }
    
    this.asistenciasChecador.forEach(a => {
      recordPromises.push(processRecord(a, 'checador'));
    });
    
    // Wait for all promises to complete
    await Promise.all(recordPromises);
    
    // Verificar si hay registros de alumnos en el mapa
    let tieneAlumno = false;
    for (const record of attendanceMap.values()) {
      if (record.asistenciaAlumno !== null) {
        tieneAlumno = true;
        break;
      }
    }
    
    console.log(`¿Hay registros de alumnos en el mapa?: ${tieneAlumno}`);
    
    // Convert map to array and update status fields
    this.comparisonData = Array.from(attendanceMap.values()).map(record => {
      this.updateAttendanceStatus(record);
      return record;
    });
    
    // Crear registros de alumnos si no existen
    if (!tieneAlumno && this.asistenciasAlumno.length > 0) {
      console.log('Creando registros de alumnos manualmente');
      // Si no hay registros de alumnos pero sí hay datos, crearlos manualmente
      for (const alumno of this.asistenciasAlumno) {
        if (!alumno.fecha || !alumno.horario_id) continue;
        
        // Verificar si ya existe un registro para esta fecha y horario
        const existingIndex = this.comparisonData.findIndex(
          r => r.fecha === alumno.fecha && r.horario_id === alumno.horario_id
        );
        
        if (existingIndex >= 0) {
          // Actualizar registro existente
          this.comparisonData[existingIndex].asistenciaAlumno = Boolean(alumno.asistencia);
          this.updateAttendanceStatus(this.comparisonData[existingIndex]);
        } else {
          // Crear nuevo registro
          const newRecord = await this.createEmptyAttendanceRecord(alumno.horario_id, alumno.fecha);
          newRecord.asistenciaAlumno = Boolean(alumno.asistencia);
          this.updateAttendanceStatus(newRecord);
          this.comparisonData.push(newRecord);
        }
      }
    }
    
    // Sort by date (newest first) and then by horario_id
    this.comparisonData.sort((a, b) => {
      const dateComparison = new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      if (dateComparison !== 0) return dateComparison;
      return a.horario_id - b.horario_id;
    });
    
    console.log(`Total de registros después de procesar: ${this.comparisonData.length}`);
  }
  
  filterDataByType(): void {
    // Filtrar para PDF, asegurando que los registros se filtren correctamente
    console.log('Filtrando datos por tipo...');
    console.log('Total registros antes de filtrar:', this.comparisonData.length);
    
    // Verificar si hay datos de alumnos en comparisonData
    const alumnosEnComparison = this.comparisonData.filter(r => r.asistenciaAlumno !== null).length;
    console.log(`Registros con asistenciaAlumno en comparisonData: ${alumnosEnComparison}`);
    
    // Filter data by type for PDF export - Con comprobación
    this.profesorData = this.comparisonData.filter(record => record.asistenciaProfesor !== null);
    this.alumnoData = this.comparisonData.filter(record => record.asistenciaAlumno !== null);
    this.checadorData = this.comparisonData.filter(record => record.asistenciaChecador !== null);
    
    console.log(`Después de filtrar - Profesor: ${this.profesorData.length}, Alumno: ${this.alumnoData.length}, Checador: ${this.checadorData.length}`);
    
    // Si no hay datos de alumnos en el filtro pero sí hay datos crudos, crearlos manualmente
    if (this.alumnoData.length === 0 && this.asistenciasAlumno.length > 0) {
      console.warn('⚠️ RECONSTRUYENDO DATOS DE ALUMNOS PARA PDF');
      
      this.alumnoData = this.asistenciasAlumno.map(a => {
        // Buscar si existe un registro correspondiente en comparisonData
        const existingRecord = this.comparisonData.find(
          r => r.fecha === a.fecha && r.horario_id === a.horario_id
        );
        
        if (existingRecord) {
          // Si existe, asegurarse de que tenga el valor de asistencia del alumno
          existingRecord.asistenciaAlumno = Boolean(a.asistencia);
          return existingRecord;
        } else {
          // Si no existe, crear uno nuevo (esto debería ser raro, pero por si acaso)
          const newRecord: AttendanceComparison = {
            fecha: a.fecha || '',
            horario_id: a.horario_id || 0,
            materia: 'Desconocida',
            grupo: 'Desconocido',
            maestro: 'Desconocido',
            maestro_id: 0,
            asistenciaProfesor: null,
            asistenciaAlumno: Boolean(a.asistencia),
            asistenciaChecador: null,
            isComplete: false,
            isConsistent: false,
            status: Boolean(a.asistencia) ? 'present' : 'absent'
          };
          
          return newRecord;
        }
      });
      
      console.log(`Reconstruidos ${this.alumnoData.length} registros de alumnos`);
    }
  }
  
  async createEmptyAttendanceRecord(horario_id: number, fecha: string): Promise<AttendanceComparison> {
    // Look up related information from horario record
    let materia = 'Desconocida';
    let grupo = 'Desconocido';
    let maestro = 'Desconocido';
    let maestro_id = 0;
    
    try {
      // Get the horario details
      const horario = await horariosService.getById(horario_id);
      
      if (horario) {
        // Get materia name
        const materiaObj = this.materias.find(m => m.id === horario.materia_id);
        if (materiaObj) {
          materia = materiaObj.name;
        }
        
        // Get grupo name
        const grupoObj = this.grupos.find(g => g.id === horario.grupo_id);
        if (grupoObj) {
          grupo = grupoObj.name;
        }
        
        // Store maestro_id and name
        maestro_id = horario.maestro_id;
        const maestroObj = this.maestros.find(m => m.id === maestro_id);
        if (maestroObj) {
          maestro = maestroObj.name;
        }
      }
    } catch (error) {
      console.error(`Error obtaining details for horario ${horario_id}:`, error);
    }
    
    return {
      fecha,
      horario_id,
      materia,
      grupo,
      maestro,
      maestro_id,
      asistenciaProfesor: null,
      asistenciaAlumno: null,
      asistenciaChecador: null,
      isComplete: false,
      isConsistent: false,
      status: 'absent'
    };
  }
  
  updateAttendanceStatus(record: AttendanceComparison): void {
    const { asistenciaProfesor, asistenciaAlumno, asistenciaChecador } = record;
    
    // Update completeness
    record.isComplete = asistenciaProfesor !== null && 
                       asistenciaAlumno !== null && 
                       asistenciaChecador !== null;
    
    // Update consistency
    record.isConsistent = record.isComplete && 
                       asistenciaProfesor === asistenciaAlumno && 
                       asistenciaProfesor === asistenciaChecador;
    
    // Update status - determine by majority or priority
    let trueCount = 0;
    let falseCount = 0;
    
    // Count true and false values
    if (asistenciaProfesor === true) trueCount++;
    if (asistenciaProfesor === false) falseCount++;
    
    if (asistenciaAlumno === true) trueCount++;
    if (asistenciaAlumno === false) falseCount++;
    
    if (asistenciaChecador === true) trueCount++;
    if (asistenciaChecador === false) falseCount++;
    
    // Set status based on majority
    record.status = trueCount >= falseCount ? 'present' : 'absent';
  }
  
  applyPagination(): void {
    this.totalPages = Math.ceil(this.comparisonData.length / this.pageSize);
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredComparisonData = this.comparisonData.slice(startIndex, endIndex);
  }
  
  generatePDF(): void {
    console.log('Generating PDF report with data:');
    console.log('Profesor data:', this.profesorData.length);
    console.log('Alumno data:', this.alumnoData.length);
    console.log('Checador data:', this.checadorData.length);
    
    // Debug info about alumno data
    if (this.alumnoData.length === 0 && this.asistenciasAlumno.length > 0) {
      console.warn('⚠️ No se están generando registros de alumnos para el PDF a pesar de tener datos crudos');
      // Intentar regenerar los datos de alumno
      this.alumnoData = this.comparisonData.filter(record => record.asistenciaAlumno !== null);
      console.log('Después de regenerar, Alumno data:', this.alumnoData.length);
    }
    
    try {
      // Create PDF document
      const doc = new jsPDF();
      
      // Set document information
      const title = 'Reporte de Asistencias';
      const selectedTeacher = this.searchForm.value.maestroId 
        ? `Profesor ID: ${this.searchForm.value.maestroId}` 
        : 'Todos los profesores';
      const dateRange = `${this.searchForm.value.fechaInicio} al ${this.searchForm.value.fechaFin}`;
      
      // Add title and date with adjusted spacing
      doc.setFontSize(18);
      doc.text(title, 14, 22);
      
      doc.setFontSize(11);
      doc.text(`Profesor: ${selectedTeacher}`, 14, 32);
      doc.text(`Período: ${dateRange}`, 14, 40);
      doc.text(`Generado: ${new Date().toLocaleString()}`, 14, 48);
      
      // Add summary information with adjusted spacing
      doc.setFontSize(14);
      doc.text('Resumen de Registros', 14, 60);
      
      doc.setFontSize(10);
      doc.text(`Total de registros: ${this.comparisonData.length}`, 14, 70);
      doc.text(`Registros de Profesor: ${this.profesorData.length}`, 14, 78);
      doc.text(`Registros de Alumnos: ${this.alumnoData.length}`, 14, 86);
      doc.text(`Registros de Checador: ${this.checadorData.length}`, 14, 94);
      
      // Add graphs - Summary chart
      this.addAttendanceSummaryChart(doc, 105);
      
      // Add section for Professor attendance with adjusted spacing
      let yPos = 220;
      
      doc.setFontSize(14);
      doc.text('Registros de Asistencia - Profesor', 14, yPos);
      yPos += 20;
      
      // Add professor attendance table
      if (this.profesorData.length > 0) {
        const profesorTableData = this.profesorData.map((record) => [
          record.fecha,
          record.materia,
          record.grupo,
          record.asistenciaProfesor ? 'ASISTIÓ (TRUE)' : 'NO ASISTIÓ (FALSE)',
          this.getStatusText(record.status)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Fecha', 'Materia', 'Grupo', 'Asistencia', 'Estado']],
          body: profesorTableData,
          theme: 'striped',
          headStyles: { fillColor: [41, 128, 185], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 35 },
            4: { cellWidth: 20 }
          },
          styles: { fontSize: 8, cellPadding: 2 }
        });
        
        yPos = (doc as any).lastAutoTable?.finalY || yPos + 50;
      } else {
        doc.setFontSize(10);
        doc.text('No hay registros de asistencia de profesor para mostrar.', 14, yPos);
        yPos += 20;
      }
      
      // Add new page for student attendance if needed
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      } else {
        yPos += 20;
      }
      
      // Add section for Student attendance with adjusted spacing
      doc.setFontSize(14);
      doc.text('Registros de Asistencia - Alumno (Jefe de Grupo)', 14, yPos);
      yPos += 20;
      
      // Add student attendance table
      if (this.alumnoData.length > 0) {
        const alumnoTableData = this.alumnoData.map((record) => [
          record.fecha,
          record.materia,
          record.grupo,
          record.asistenciaAlumno ? 'ASISTIÓ (TRUE)' : 'NO ASISTIÓ (FALSE)',
          this.getStatusText(record.status)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Fecha', 'Materia', 'Grupo', 'Asistencia', 'Estado']],
          body: alumnoTableData,
          theme: 'striped',
          headStyles: { fillColor: [39, 174, 96], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 35 },
            4: { cellWidth: 20 }
          },
          styles: { fontSize: 8, cellPadding: 2 }
        });
        
        yPos = (doc as any).lastAutoTable?.finalY || yPos + 50;
      } else {
        doc.setFontSize(10);
        doc.text('No hay registros de asistencia de alumno para mostrar.', 14, yPos);
        yPos += 20;
      }
      
      // Add new page for checker attendance
      doc.addPage();
      yPos = 60;
      
      // Add attendance type comparison chart
      this.addAttendanceTypeChart(doc, yPos);
      yPos += 110;
      
      // Add section for Checker attendance with adjusted spacing
      doc.setFontSize(14);
      doc.text('Registros de Asistencia - Checador', 14, yPos);
      yPos += 20;
      
      // Add checker attendance table
      if (this.checadorData.length > 0) {
        const checadorTableData = this.checadorData.map((record) => [
          record.fecha,
          record.materia,
          record.grupo,
          record.asistenciaChecador ? 'ASISTIÓ (TRUE)' : 'NO ASISTIÓ (FALSE)',
          this.getStatusText(record.status)
        ]);
        
        autoTable(doc, {
          startY: yPos,
          head: [['Fecha', 'Materia', 'Grupo', 'Asistencia', 'Estado']],
          body: checadorTableData,
          theme: 'striped',
          headStyles: { fillColor: [142, 68, 173], textColor: 255 },
          columnStyles: {
            0: { cellWidth: 25 },
            1: { cellWidth: 35 },
            2: { cellWidth: 20 },
            3: { cellWidth: 35 },
            4: { cellWidth: 20 }
          },
          styles: { fontSize: 8, cellPadding: 2 }
        });
      } else {
        doc.setFontSize(10);
        doc.text('No hay registros de asistencia de checador para mostrar.', 14, yPos);
      }
      
      // Save the PDF
      const fileName = `reporte_asistencias_${new Date().toISOString().slice(0, 10)}.pdf`;
      doc.save(fileName);
      console.log(`PDF saved as ${fileName}`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
      this.error = 'Error al generar el PDF';
    }
  }
  
  // Add a bar chart showing attendance summary (present/absent)
  addAttendanceSummaryChart(doc: jsPDF, yPos: number): void {
    // Chart title
    doc.setFontSize(12);
    doc.text('Gráfica Resumen de Asistencias', 14, yPos);
    
    // Count different status types
    const presentCount = this.comparisonData.filter(record => record.status === 'present').length;
    const absentCount = this.comparisonData.filter(record => record.status === 'absent').length;
    
    // Calculate max value for scaling
    const maxCount = Math.max(presentCount, absentCount);
    const chartWidth = 170;
    const chartHeight = 50;
    const barWidth = 50;
    
    // Chart legend
    doc.setFontSize(8);
    doc.setDrawColor(0);
    
    // Draw legend items with adjusted positions
    doc.setFillColor(39, 174, 96); // Green for present
    doc.rect(20, yPos + 5, 8, 8, 'F');
    doc.text('ASISTIÓ (TRUE)', 30, yPos + 10);
    
    doc.setFillColor(231, 76, 60); // Red for absent
    doc.rect(110, yPos + 5, 8, 8, 'F');
    doc.text('NO ASISTIÓ (FALSE)', 120, yPos + 10);
    
    // Start drawing bars from y position
    yPos += 20;
    
    // Draw horizontal axis
    doc.setDrawColor(0);
    doc.line(14, yPos + chartHeight, 14 + chartWidth, yPos + chartHeight);
    
    // Calculate positions to center the bars
    const firstBarX = 50;
    const secondBarX = 120;
    
    // Draw bars
    // Present
    const presentHeight = maxCount > 0 ? (presentCount / maxCount) * chartHeight : 0;
    doc.setFillColor(39, 174, 96); // Green for present
    doc.rect(firstBarX, yPos + chartHeight - presentHeight, barWidth, presentHeight, 'F');
    doc.setFontSize(10);
    doc.text(presentCount.toString(), firstBarX + barWidth/2 - 3, yPos + chartHeight - presentHeight - 5);
    
    // Absent
    const absentHeight = maxCount > 0 ? (absentCount / maxCount) * chartHeight : 0;
    doc.setFillColor(231, 76, 60); // Red for absent
    doc.rect(secondBarX, yPos + chartHeight - absentHeight, barWidth, absentHeight, 'F');
    doc.text(absentCount.toString(), secondBarX + barWidth/2 - 3, yPos + chartHeight - absentHeight - 5);
    
    // Add labels below the bars with adjusted positions
    doc.setFontSize(7);
    doc.text('ASISTIÓ (TRUE)', firstBarX + barWidth/2 - 15, yPos + chartHeight + 10);
    doc.text('NO ASISTIÓ (FALSE)', secondBarX + barWidth/2 - 20, yPos + chartHeight + 10);
  }
  
  // Add a pie chart comparing attendance by type
  addAttendanceTypeChart(doc: jsPDF, yPos: number): void {
    // Chart title
    doc.setFontSize(12);
    doc.text('Comparación de Registros por Tipo', 14, yPos);
    yPos += 5;
    
    // Calculate total records of each type
    const profesorRecords = this.profesorData.length;
    const alumnoRecords = this.alumnoData.length;
    const checadorRecords = this.checadorData.length;
    
    const total = profesorRecords + alumnoRecords + checadorRecords;
    if (total === 0) {
      doc.setFontSize(10);
      doc.text('No hay datos suficientes para mostrar el gráfico', 14, yPos + 10);
      return;
    }
    
    // Present counts for each type
    const profesorPresent = this.profesorData.filter(r => r.asistenciaProfesor === true).length;
    const alumnoPresent = this.alumnoData.filter(r => r.asistenciaAlumno === true).length;
    const checadorPresent = this.checadorData.filter(r => r.asistenciaChecador === true).length;
    
    // Absent counts for each type
    const profesorAbsent = this.profesorData.filter(r => r.asistenciaProfesor === false).length;
    const alumnoAbsent = this.alumnoData.filter(r => r.asistenciaAlumno === false).length;
    const checadorAbsent = this.checadorData.filter(r => r.asistenciaChecador === false).length;
    
    // Draw legend with adjusted positioning
    doc.setFontSize(8);
    
    // Legend for record types - adjusted positioning
    const legendY = yPos + 5;
    doc.setFillColor(41, 128, 185); // Blue for profesor
    doc.rect(14, legendY, 8, 8, 'F');
    doc.text('Profesor', 25, legendY + 5);
    
    doc.setFillColor(39, 174, 96); // Green for alumno
    doc.rect(70, legendY, 8, 8, 'F');
    doc.text('Alumno', 81, legendY + 5);
    
    doc.setFillColor(142, 68, 173); // Purple for checador
    doc.rect(126, legendY, 8, 8, 'F');
    doc.text('Checador', 137, legendY + 5);
    
    yPos += 20;
    
    // Draw bar chart for presence comparison
    const centerX = 50;
    const chartWidth = 125;
    const barHeight = 13;
    const barSpacing = 7;
    
    // Title with adjusted positioning
    doc.setFontSize(10);
    doc.text('Asistencias Registradas por Tipo (TRUE)', 14, yPos);
    
    // Draw bars for Present with improved spacing
    doc.setFillColor(41, 128, 185); // Blue for profesor
    const profesorPresentWidth = profesorPresent > 0 ? (profesorPresent / Math.max(profesorRecords, 1)) * chartWidth : 0;
    doc.rect(centerX, yPos + 10, profesorPresentWidth, barHeight, 'F');
    doc.setFontSize(8);
    doc.text(`${profesorPresent}/${profesorRecords}`, centerX + profesorPresentWidth + 5, yPos + 10 + barHeight - 5);
    doc.text('Profesor', centerX - 40, yPos + 10 + barHeight/2);
    
    const alumnoY = yPos + 10 + barHeight + barSpacing;
    doc.setFillColor(39, 174, 96); // Green for alumno
    const alumnoPresentWidth = alumnoPresent > 0 ? (alumnoPresent / Math.max(alumnoRecords, 1)) * chartWidth : 0;
    doc.rect(centerX, alumnoY, alumnoPresentWidth, barHeight, 'F');
    doc.text(`${alumnoPresent}/${alumnoRecords}`, centerX + alumnoPresentWidth + 5, alumnoY + barHeight - 5);
    doc.text('Alumno', centerX - 40, alumnoY + barHeight/2);
    
    const checadorY = alumnoY + barHeight + barSpacing;
    doc.setFillColor(142, 68, 173); // Purple for checador
    const checadorPresentWidth = checadorPresent > 0 ? (checadorPresent / Math.max(checadorRecords, 1)) * chartWidth : 0;
    doc.rect(centerX, checadorY, checadorPresentWidth, barHeight, 'F');
    doc.text(`${checadorPresent}/${checadorRecords}`, centerX + checadorPresentWidth + 5, checadorY + barHeight - 5);
    doc.text('Checador', centerX - 40, checadorY + barHeight/2);
  }
  
  // Helper methods
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  
  getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-gray-100 text-gray-800';
    
    switch (status) {
      case 'present': return 'bg-green-100 text-green-800';
      case 'absent': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
  
  getStatusText(status: string | undefined): string {
    if (!status) return 'Desconocido';
    
    switch (status) {
      case 'present': return 'Presente';
      case 'absent': return 'Ausente';
      default: return 'Desconocido';
    }
  }
  
  // Returns the name of the selected teacher based on the maestroId in the form
  getSelectedTeacherName(): string {
    const maestroId = this.searchForm?.value?.maestroId;
    if (!maestroId) {
      return '';
    }
    const maestro = this.maestros?.find((m: any) => m.id === maestroId);
    return maestro ? maestro.name : '';
  }
  
  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }
  
  resetForm(): void {
    this.searchForm.reset();
    this.comparisonData = [];
    this.filteredComparisonData = [];
    this.profesorData = [];
    this.alumnoData = [];
    this.checadorData = [];
    this.error = null;
    
    // Initialize with current month's date range
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    this.searchForm.patchValue({
      fechaInicio: this.formatDate(firstDay),
      fechaFin: this.formatDate(lastDay)
    });
  }
  
  viewAttendanceDetails(attendance: AttendanceComparison): void {
    this.selectedAttendance = attendance;
    this.showDetailModal = true;
  }
  
  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedAttendance = null;
  }
  
  // Función para imprimir las asistencias en la consola
  printAsistenciasToConsole(): void {
    console.log('==================== DATOS DE ASISTENCIAS ====================');
    console.log('--- DATOS CRUDOS ---');
    console.log('Asistencias Maestro:', this.asistenciasMaestro);
    console.log('Asistencias Alumno:', this.asistenciasAlumno);
    console.log('Asistencias Checador:', this.asistenciasChecador);
    
    console.log('--- DATOS PROCESADOS ---');
    console.log('Datos de Comparación:', this.comparisonData);
    
    console.log('--- RESUMEN ---');
    const presentes = this.comparisonData.filter(r => r.status === 'present').length;
    const ausentes = this.comparisonData.filter(r => r.status === 'absent').length;
    
    console.log(`Total de registros: ${this.comparisonData.length}`);
    console.log(`Presentes (TRUE): ${presentes}`);
    console.log(`Ausentes (FALSE): ${ausentes}`);
    
    console.log('--- VALORES DE ASISTENCIA POR TIPO ---');
    console.log('MAESTRO:');
    this.asistenciasMaestro.forEach(a => {
      console.log(`Fecha: ${a.fecha}, Horario ID: ${a.horario_id}, Asistencia: ${a.asistencia} (${typeof a.asistencia})`);
    });
    
    console.log('ALUMNO:');
    this.asistenciasAlumno.forEach(a => {
      console.log(`Fecha: ${a.fecha}, Horario ID: ${a.horario_id}, Asistencia: ${a.asistencia} (${typeof a.asistencia})`);
    });
    
    console.log('CHECADOR:');
    this.asistenciasChecador.forEach(a => {
      console.log(`Fecha: ${a.fecha}, Horario ID: ${a.horario_id}, Asistencia: ${a.asistencia} (${typeof a.asistencia})`);
    });
    
    console.log('--- DATOS FILTRADOS PARA PDF ---');
    console.log('MAESTRO:', this.profesorData.length, 'registros');
    console.log('ALUMNO:', this.alumnoData.length, 'registros');
    console.log('CHECADOR:', this.checadorData.length, 'registros');
    
    if (this.alumnoData.length === 0 && this.asistenciasAlumno.length > 0) {
      console.warn('⚠️ ADVERTENCIA: Hay datos de asistencia de alumnos pero no se están filtrando correctamente');
      console.log('Primer registro de alumno:', this.asistenciasAlumno[0]);
    }
    
    console.log('============================================================');
  }
}
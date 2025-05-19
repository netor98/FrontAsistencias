import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { horariosService } from "src/app/services/horario-maestro"
import { HorarioMaestro, Carrera, Asistencia } from "src/app/services/interfaces"
import { carrerasService } from "src/app/services/carreras";
import { asistenciasService } from "src/app/services/asistencias"
import { authService } from "src/app/services/login";

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string // Added classroom field
  day?: string
}

interface WeekInfo {
  weekNumber: number
  startDate: Date
  endDate: Date
}

interface GroupInfo {
  id: string
  name: string
  career: string
  classes: ClassItem[]
}

interface FilterOptions {
  classroom: string
  teacher: string
  career: string
  time: string
}

// Define attendance status type
type AttendanceStatus = "asistio" | "no-asistio" | "pendiente"

@Component({
  selector: "app-checador-home",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./checador-home.component.html",
})

export class ChecadorHomeComponent implements OnInit {
  schoolCycle = "2024-2025"
  period = "1"

  showingSuccess = false;
  showingError = false;

  horarios: HorarioMaestro[] = [];

  // Current date information
  today = new Date()
  currentDayName: string
  currentDayIndex: number
  formattedDate: string
  isWeekend = false;

  // Filters
  filters: FilterOptions = {
    classroom: "",
    teacher: "",
    career: "",
    time: "",
  }

  // Options for dropdowns
  schoolCycles: string[] = ["2023-2024", "2024-2025", "2025-2026"]
  periods: string[] = ["1", "2", "3"]

  careers: { id: string; name: string }[] = [];
  rawCarreras: Carrera[] = [];

  // Derived filter options (will be populated from data)
  classroomOptions: string[] = []
  teacherOptions: string[] = []
  timeOptions: string[] = []

  groupsData: GroupInfo[] = []

  isLoading = true;

  weekdays: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // For tracking attendance
  attendanceStatus: { [key: string]: { [key: string]: AttendanceStatus } } = {}

  // For week tracking
  currentWeek: WeekInfo
  weeks: WeekInfo[] = []

  // Mapa para registrar IDs de asistencias existentes
  existingAttendances: Map<string, Asistencia> = new Map();

  // Estado de guardado
  isSaving = false;
  saveSuccess = false;
  saveError = false;
  errorMessage = '';

  // Propiedades para filtro de hora actual
  currentTimeFilter: boolean = true; // Activado por defecto
  currentTimeClasses: Set<number> = new Set(); // IDs de las clases actuales

  constructor() {
    // Get current day information
    const dayOfWeek = this.today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // If weekend (Sunday or Saturday)
      this.currentDayIndex = 0; // Default to Monday for UI
      this.isWeekend = true; // Add a new flag to indicate it's weekend
    } else {
      // Weekday: Convert JS day (1-5) to our index (0-4)
      this.currentDayIndex = dayOfWeek - 1;
      this.isWeekend = false;
    }

    this.currentDayName = this.weekdays[this.currentDayIndex];

    // Format today's date
    this.formattedDate = this.today.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    this.currentWeek = this.getCurrentWeekInfo()
    this.generateWeeksForSemester()

    // Initialize attendance status for all groups
    this.groupsData.forEach((group) => {
      this.attendanceStatus[group.id] = {}
    })

    // Extract unique classrooms and teachers for filter dropdowns
    this.extractFilterOptions()
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true; // Indicar que estamos cargando

    try {
      // Obtener las carreras primero
      this.rawCarreras = await carrerasService.getAll();
      console.log('Carreras obtenidas:', this.rawCarreras);

      // Mapear las carreras al formato requerido por el componente
      this.mapCarreras();

      // Obtener los horarios
      this.horarios = await horariosService.getAll();
      console.log('Horarios obtenidos:', this.horarios);

      // Procesar los horarios para adaptarlos al formato del componente
      this.processHorarios();

      // Identificar clases en curso actualmente
      this.identifyCurrentTimeClasses();

      // Obtener asistencias registradas para el día actual
      await this.loadExistingAttendances();

      // Ya hemos terminado de cargar
      this.isLoading = false;
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      this.isLoading = false; // Asegurarnos de quitar el estado de carga incluso si hay error
    }
  }

  // Método para mapear las carreras de la API al formato del componente
  mapCarreras(): void {
    if (!this.rawCarreras || this.rawCarreras.length === 0) {
      return;
    }

    this.careers = this.rawCarreras.map(carrera => {
      // Determinar el id según el nombre
      let careerId = 'unknown';
      const carreraNombre = carrera.nombre.toLowerCase();

      if (carreraNombre.includes('sistemas')) {
        careerId = 'ing-sistemas';
      } else if (carreraNombre.includes('industrial')) {
        careerId = 'ing-industrial';
      } else if (carreraNombre.includes('mecatrónica') || carreraNombre.includes('mecatronica')) {
        careerId = 'ing-mecatronica';
      } else if (carreraNombre.includes('administración') || carreraNombre.includes('administracion')) {
        careerId = 'lic-administracion';
      } else {
        // Para cualquier otra carrera, usar el ID como identificador
        careerId = `carrera-${carrera.id}`;
      }

      return {
        id: careerId,
        name: carrera.nombre.trim()
      };
    });

    console.log('Carreras mapeadas:', this.careers);
  }

  processHorarios(): void {
    if (!this.horarios || this.horarios.length === 0) {
      console.log('No hay horarios para procesar');
      return;
    }

    // Crear mapa para agrupar por carrera y grupo
    const groupMap: Map<string, GroupInfo> = new Map();

    this.horarios.forEach(horario => {
      // Determinar careerID basado en la carrera del horario
      let careerId = 'unknown';
      if (horario.carreras) {
        // Usar el mapeo de carreras para encontrar el careerId
        const carreraEncontrada = this.careers.find(
          c => c.name.toLowerCase() === horario.carreras?.nombre?.toLowerCase().trim()
        );

        if (carreraEncontrada) {
          careerId = carreraEncontrada.id;
        } else {
          // Si no se encuentra, usar el método anterior
          const carreraNombre = horario.carreras.nombre || '';
          if (carreraNombre.toLowerCase().includes('sistemas')) {
            careerId = 'ing-sistemas';
          } else if (carreraNombre.toLowerCase().includes('industrial')) {
            careerId = 'ing-industrial';
          } else if (carreraNombre.toLowerCase().includes('mecatrónica') ||
            carreraNombre.toLowerCase().includes('mecatronica')) {
            careerId = 'ing-mecatronica';
          } else if (carreraNombre.toLowerCase().includes('administración') ||
            carreraNombre.toLowerCase().includes('administracion')) {
            careerId = 'lic-administracion';
          }
        }
      }

      // Crear ID para el grupo
      const groupName = horario.grupo?.name || 'default';
      const groupId = `${careerId}-${groupName}`;

      // Obtener o crear el grupo en el mapa
      if (!groupMap.has(groupId)) {
        groupMap.set(groupId, {
          id: groupId,
          name: groupName,
          career: careerId,
          classes: []
        });
      }

      // Preparar el horario en formato compatible con el componente
      const group = groupMap.get(groupId);
      if (group) {
        group.classes.push({
          id: horario.id,
          time: `${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`,
          subject: horario.materias?.name || 'Sin materia',
          teacher: horario.maestro?.name || 'Sin profesor',
          classroom: horario.aulas?.aula || 'Sin aula',
          day: horario.dia || ''  // Agregar el día del horario
        });
      }
    });

    // Convertir el mapa de grupos a un array
    const processedGroups = Array.from(groupMap.values());
    console.log('Grupos procesados:', processedGroups);

    // Reemplazar los datos de prueba con los datos reales
    this.groupsData = processedGroups;

    // Actualizar las opciones de filtrado para los nuevos datos
    this.extractFilterOptions();

    // Inicializar el estado de asistencia para los nuevos grupos
    this.initializeAttendanceStatus();
  }

  // Método auxiliar para inicializar el estado de asistencia
  initializeAttendanceStatus(): void {
    this.attendanceStatus = {};
    this.groupsData.forEach((group) => {
      this.attendanceStatus[group.id] = {};
      group.classes.forEach((classItem) => {
        // Solo inicializa para el día actual
        const key = `${classItem.id}-${this.currentDayName}`;
        this.attendanceStatus[group.id][key] = "pendiente";
      });
    });
  }

  // Método para determinar qué clases están en curso ahora
  identifyCurrentTimeClasses(): void {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    // Limpiar set anterior
    this.currentTimeClasses.clear();

    this.groupsData.forEach(group => {
      group.classes.forEach(classItem => {
        // Solo procesar clases del día actual
        if (classItem.day && classItem.day !== this.currentDayName) {
          return;
        }

        const [startTime, endTime] = classItem.time.split(' - ');

        // Convertir horas de inicio y fin a minutos desde medianoche
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);

        const startTimeInMinutes = startHour * 60 + startMinute;
        const endTimeInMinutes = endHour * 60 + endMinute;

        // Verificar si la hora actual está dentro del rango de la clase
        if (currentTimeInMinutes >= startTimeInMinutes && currentTimeInMinutes <= endTimeInMinutes) {
          this.currentTimeClasses.add(classItem.id);
        }
      });
    });

    console.log('Clases en curso actualmente:', Array.from(this.currentTimeClasses));
  }


  extractFilterOptions(): void {
    // Extract unique classrooms
    const classrooms = new Set<string>()
    // Extract unique teachers
    const teachers = new Set<string>()
    // Extract unique times
    const times = new Set<string>()

    this.groupsData.forEach((group) => {
      group.classes.forEach((classItem) => {
        classrooms.add(classItem.classroom)
        teachers.add(classItem.teacher)
        times.add(classItem.time)
      })
    })

    this.classroomOptions = Array.from(classrooms).sort()
    this.teacherOptions = Array.from(teachers).sort()

    // Sort times chronologically based on the start time
    this.timeOptions = Array.from(times).sort((a, b) => {
      const timeA = a.split(" - ")[0]
      const timeB = b.split(" - ")[0]
      return timeA.localeCompare(timeB)
    })
  }

  getCurrentWeekInfo(): WeekInfo {
    const today = new Date()
    const firstDayOfYear = new Date(today.getFullYear(), 0, 1)
    const pastDaysOfYear = (today.getTime() - firstDayOfYear.getTime()) / 86400000

    // Calculate current week number (1-52)
    const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)

    // Calculate start of week (Monday)
    const dayOfWeek = today.getDay() || 7 // Convert Sunday (0) to 7
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - dayOfWeek + 1) // Monday

    // Calculate end of week (Friday for school week)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 4) // Friday

    return { weekNumber, startDate, endDate }
  }

  generateWeeksForSemester(): void {
    // Generate weeks for the current semester (approximately 16 weeks)
    const startWeek = this.currentWeek.weekNumber - 8 // Assume we're in the middle of the semester

    for (let i = 0; i < 16; i++) {
      const weekNumber = startWeek + i
      if (weekNumber > 0 && weekNumber <= 52) {
        // Calculate dates for this week
        const startDate = new Date(this.currentWeek.startDate)
        startDate.setDate(startDate.getDate() + (i - 8) * 7)

        const endDate = new Date(startDate)
        endDate.setDate(startDate.getDate() + 4)

        this.weeks.push({ weekNumber, startDate, endDate })
      }
    }
  }

  formatWeekDisplay(week: WeekInfo): string {
    const startMonth = week.startDate.toLocaleDateString("es-ES", { month: "short" })
    const endMonth = week.endDate.toLocaleDateString("es-ES", { month: "short" })

    const startDay = week.startDate.getDate()
    const endDay = week.endDate.getDate()

    if (startMonth === endMonth) {
      return `Semana ${week.weekNumber}: ${startDay} - ${endDay} ${startMonth}`
    } else {
      return `Semana ${week.weekNumber}: ${startDay} ${startMonth} - ${endDay} ${endMonth}`
    }
  }

  isCurrentWeek(week: WeekInfo): boolean {
    return week.weekNumber === this.currentWeek.weekNumber
  }

  selectWeek(week: WeekInfo): void {
    this.currentWeek = week
  }

  compareWeeks(week1: WeekInfo, week2: WeekInfo): boolean {
    return week1 && week2 ? week1.weekNumber === week2.weekNumber : week1 === week2
  }

  async loadExistingAttendances(): Promise<void> {
    try {
      // Obtener la fecha actual en formato YYYY-MM-DD
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      // Obtener todas las asistencias de checador
      const asistencias = await asistenciasService.getAsistenciasChecador();

      // Filtrar asistencias para el día actual
      const todaysAttendances = asistencias.filter(a => a.fecha === formattedDate);
      console.log('Asistencias encontradas para hoy:', todaysAttendances);

      // IMPORTANTE: Limpiar el mapa antes de llenarlo
      this.existingAttendances.clear();

      // Actualizar el mapa de asistencias existentes y el estado de attendance
      todaysAttendances.forEach(asistencia => {
        // Crear una clave única para identificar esta asistencia
        const key = `${asistencia.horario_id}-${this.currentDayName}`;

        // Guardar la asistencia en el mapa para referencia futura
        // Asegurarnos de almacenar el registro completo con su id
        this.existingAttendances.set(key, asistencia);

        // Identificar a qué grupo pertenece esta asistencia
        const classInfo = this.findClassInfoByHorarioId(asistencia.horario_id);

        if (classInfo) {
          // Actualizar el estado de asistencia en nuestro modelo de UI
          if (!this.attendanceStatus[classInfo.groupId]) {
            this.attendanceStatus[classInfo.groupId] = {};
          }

          this.attendanceStatus[classInfo.groupId][key] = asistencia.asistencia ? "asistio" : "no-asistio";
          console.log(`Cargada asistencia para ${key}: ${this.attendanceStatus[classInfo.groupId][key]}`);
        }
      });
    } catch (error) {
      console.error('Error al cargar asistencias existentes:', error);
    }
  }

  // Método auxiliar para encontrar información de una clase por su horario_id
  findClassInfoByHorarioId(horarioId: number): { groupId: string, classItem: ClassItem } | null {
    for (const group of this.groupsData) {
      for (const classItem of group.classes) {
        if (classItem.id === horarioId) {
          return { groupId: group.id, classItem };
        }
      }
    }
    return null;
  }

  async setAttendanceStatus(groupId: string, classId: number, status: AttendanceStatus): Promise<void> {
    if (!this.attendanceStatus[groupId]) {
      this.attendanceStatus[groupId] = {};
    }

    // Clave única para esta clase y día
    const key = `${classId}-${this.currentDayName}`;
    const currentStatus = this.attendanceStatus[groupId][key];

    // Si se hace clic en el mismo estado ya seleccionado, volver a pendiente
    // Si se hace clic en un estado diferente al actual, cambiar al nuevo estado
    if (currentStatus === status) {
      this.attendanceStatus[groupId][key] = "pendiente";
    } else {
      this.attendanceStatus[groupId][key] = status;
    }

    // Guarda los cambios inmediatamente en la base de datos
    await this.saveAttendanceForClass(groupId, classId, key);
  }

  async saveAttendanceForClass(groupId: string, classId: number, key: string): Promise<void> {
    try {
      // Obtener el estado actual de asistencia para esta clase
      const status = this.attendanceStatus[groupId][key];

      // Preparar datos de asistencia
      const fecha = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
      const asistencia = status === "asistio"; // true para asistio, false para no-asistio

      // Obtener el ID de usuario del checador actual
      const currentUser = authService.getCurrentUser();
      const id_user = currentUser?.id ? Number(currentUser.id) : 0;

      if (id_user === 0) {
        console.error('No se pudo obtener el ID del usuario actual');
        return;
      }

      // Verificar si ya existe una asistencia PARA ESTE HORARIO en este día
      const existingAttendance = this.existingAttendances.get(key);

      if (existingAttendance && existingAttendance.id) {
        // Actualizar asistencia existente solo si no está en estado pendiente
        if (status !== "pendiente") {
          console.log('Actualizando asistencia existente ID:', existingAttendance.id);
          console.log('Datos a actualizar:', {
            id: existingAttendance.id,
            horario_id: classId,
            fecha,
            asistencia,
            id_user
          });

          const updatedAttendance = await asistenciasService.updateAsistenciaChecador(
            existingAttendance.id,
            classId,
            fecha,
            asistencia,
            id_user
          );

          if (updatedAttendance) {
            this.existingAttendances.set(key, updatedAttendance);
          } else {
            // Si falla la actualización, consulta directamente por ID
            const refreshedAttendance = await asistenciasService.getAsistenciaChecadorById(existingAttendance.id);
            if (refreshedAttendance) {
              console.log('Asistencia refrescada:', refreshedAttendance);
              this.existingAttendances.set(key, refreshedAttendance);
            } else {
              // Si todo falla, actualiza la instancia actual como fallback
              existingAttendance.asistencia = asistencia;
              this.existingAttendances.set(key, existingAttendance);
            }
          }
        }
        // Si está en pendiente, no hacemos nada pero mantenemos el registro
      } else if (status !== "pendiente") {
        // Crear nueva asistencia solo si no está en estado pendiente
        console.log('Creando nueva asistencia para horario ID:', classId);

        try {
          const newAttendance = await asistenciasService.createAsistenciaChecador(
            classId,
            fecha,
            asistencia,
            id_user
          );

          if (newAttendance) {
            console.log('Nueva asistencia creada:', newAttendance);
            this.existingAttendances.set(key, newAttendance);
            this.showSuccessNotification();
          } else {
            console.error('Error: No se recibieron datos después de crear la asistencia');
            this.showErrorNotification('Error al crear la asistencia. Inténtalo nuevamente.');

            // Verificar si se creó la asistencia a pesar del error
            this.verificarAsistenciaCreada(classId, fecha);
          }
        } catch (error) {
          console.error('Error al crear nueva asistencia:', error);
          this.showErrorNotification('Error al crear la asistencia. Inténtalo nuevamente.');

          // Verificar si se creó la asistencia a pesar del error
          this.verificarAsistenciaCreada(classId, fecha);
        }
      }

      // Solo mostramos notificación de éxito si no está en pendiente
      if (status !== "pendiente") {
        this.showSuccessNotification();
      }

    } catch (error) {
      console.error('Error al guardar asistencia:', error);
      this.saveError = true;
      this.errorMessage = 'Error al guardar la asistencia. Inténtalo nuevamente.';
      setTimeout(() => {
        this.saveError = false;
      }, 3000);
    }
  }

  // Método para verificar si la asistencia se creó a pesar del error
  async verificarAsistenciaCreada(horarioId: number, fecha: string): Promise<void> {
    try {
      // Obtener todas las asistencias
      const asistencias = await asistenciasService.getAsistenciasChecador();

      // Filtrar por horario y fecha
      const asistenciaEncontrada = asistencias.find(a =>
        a.horario_id === horarioId && a.fecha === fecha
      );

      if (asistenciaEncontrada) {
        console.log('Se encontró la asistencia que parecía fallida:', asistenciaEncontrada);

        // Actualizar el mapa de asistencias existentes
        const key = `${horarioId}-${this.currentDayName}`;
        this.existingAttendances.set(key, asistenciaEncontrada);

        // Actualizar UI
        const classInfo = this.findClassInfoByHorarioId(horarioId);
        if (classInfo) {
          if (!this.attendanceStatus[classInfo.groupId]) {
            this.attendanceStatus[classInfo.groupId] = {};
          }

          this.attendanceStatus[classInfo.groupId][key] = asistenciaEncontrada.asistencia ? "asistio" : "no-asistio";
        }
      }
    } catch (error) {
      console.error('Error al verificar la asistencia creada:', error);
    }
  }

  // New method to check if a specific status is set
  isAttendanceStatus(groupId: string, classId: number, status: AttendanceStatus): boolean {
    if (!this.attendanceStatus[groupId]) {
      return status === "pendiente"
    }
    // Only check for the current day
    const key = `${classId}-${this.currentDayName}`
    return this.attendanceStatus[groupId][key] === status
  }

  // Keep the original method for backward compatibility
  getAttendanceStatus(groupId: string, classId: number): AttendanceStatus {
    if (!this.attendanceStatus[groupId]) {
      return "pendiente"
    }
    // Only get status for the current day
    const key = `${classId}-${this.currentDayName}`
    return this.attendanceStatus[groupId][key] || "pendiente"
  }

  resetFilters(): void {
    this.filters = {
      classroom: "",
      teacher: "",
      career: "",
      time: "",
    }
  }

  hasAnyClassForCurrentDay(): boolean {
    return this.groupsData.some(group =>
      group.classes.some(classItem =>
        !classItem.day || classItem.day === this.currentDayName
      )
    );
  }

  // Filter groups based on selected criteria
  // filterGroups(): GroupInfo[] {
  //   // Si no hay datos, retornar array vacío
  //   if (!this.groupsData || this.groupsData.length === 0) {
  //     return [];
  //   }

  //   return this.groupsData.filter((group) => {
  //     // First check if the group has any classes for the current day
  //     const hasClassesForCurrentDay = group.classes.some(classItem =>
  //       !classItem.day || classItem.day === this.currentDayName
  //     );

  //     // If no classes for the current day, filter out this group
  //     if (!hasClassesForCurrentDay) {
  //       return false;
  //     }

  //     // Continue with other filters as before
  //     // Filter by career
  //     if (this.filters.career && group.career !== this.filters.career) {
  //       return false;
  //     }

  //     // Filter by classroom or teacher (check if any class matches)
  //     if (this.filters.classroom || this.filters.teacher || this.filters.time) {
  //       return group.classes.some((classItem) => {
  //         // Only consider classes for the current day
  //         if (classItem.day && classItem.day !== this.currentDayName) {
  //           return false;
  //         }

  //         // Filter by current time if that filter is enabled
  //         if (this.currentTimeFilter && !this.currentTimeClasses.has(classItem.id)) {
  //           return false;
  //         }

  //         // Filter by classroom
  //         if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
  //           return false;
  //         }

  //         // Filter by teacher
  //         if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
  //           return false;
  //         }

  //         // Filter by time
  //         if (this.filters.time && classItem.time !== this.filters.time) {
  //           return false;
  //         }

  //         return true;
  //       });
  //     }

  //     return true;
  //   });
  // }

  // Filter groups based on selected criteria
  filterGroups(): GroupInfo[] {
    // Si no hay datos, retornar array vacío
    if (!this.groupsData || this.groupsData.length === 0) {
      return [];
    }

    return this.groupsData
      .filter((group) => {
        // First check if the group has any classes for the current day
        const hasClassesForCurrentDay = group.classes.some(classItem =>
          !classItem.day || classItem.day === this.currentDayName
        );

        // If no classes for the current day, filter out this group
        if (!hasClassesForCurrentDay) {
          return false;
        }

        // Continue with other filters as before
        // Filter by career
        if (this.filters.career && group.career !== this.filters.career) {
          return false;
        }

        // Filter by classroom or teacher (check if any class matches)
        if (this.filters.classroom || this.filters.teacher || this.filters.time || this.currentTimeFilter) {
          const hasAnyMatchingClass = group.classes.some((classItem) => {
            // Only consider classes for the current day
            if (classItem.day && classItem.day !== this.currentDayName) {
              return false;
            }

            // Filter by current time if that filter is enabled
            if (this.currentTimeFilter && !this.currentTimeClasses.has(classItem.id)) {
              return false;
            }

            // Filter by classroom
            if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
              return false;
            }

            // Filter by teacher
            if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
              return false;
            }

            // Filter by time
            if (this.filters.time && classItem.time !== this.filters.time) {
              return false;
            }

            return true;
          });

          return hasAnyMatchingClass;
        }

        return true;
      })
      // Filtrar para eliminar los grupos que no tienen clases después de aplicar los filtros
      .map(group => {
        return {
          ...group,
          classes: this.filterClasses(group.classes)
        };
      })
      .filter(group => group.classes.length > 0); // Solo mantener grupos con clases
  }

  // Método para verificar si hay alguna clase en curso actualmente
  hasCurrentTimeClasses(): boolean {
    return this.currentTimeClasses.size > 0;
  }

  // Filter classes within a group based on selected criteria
  filterClasses(classes: ClassItem[]): ClassItem[] {
    // Primero filtrar por el día actual
    let filteredClasses = classes.filter(classItem =>
      !classItem.day || classItem.day === this.currentDayName
    );

    // Filtrar por hora actual si está habilitado
    if (this.currentTimeFilter) {
      filteredClasses = filteredClasses.filter(classItem =>
        this.currentTimeClasses.has(classItem.id)
      );
    }

    // Luego aplicar los demás filtros
    if (!this.filters.classroom && !this.filters.teacher && !this.filters.time) {
      return filteredClasses;
    }

    return filteredClasses.filter((classItem) => {
      // Filter by classroom
      if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
        return false;
      }

      // Filter by teacher
      if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
        return false;
      }

      // Filter by time
      if (this.filters.time && classItem.time !== this.filters.time) {
        return false;
      }

      return true;
    });
  }

  getCareerName(careerId: string): string {
    const career = this.careers.find((c) => c.id === careerId)
    return career ? career.name : ""
  }

  // Método para mostrar la notificación de éxito
  showSuccessNotification(): void {
    this.saveSuccess = true;
    this.showingSuccess = true;

    // Ocultar después de un tiempo
    setTimeout(() => {
      this.saveSuccess = false;

      // Dar tiempo para que termine la animación antes de eliminar completamente
      setTimeout(() => {
        this.showingSuccess = false;
      }, 300);
    }, 1500);
  }

  // Método para mostrar la notificación de error
  showErrorNotification(message: string): void {
    this.errorMessage = message;
    this.saveError = true;
    this.showingError = true;

    // Ocultar después de un tiempo
    setTimeout(() => {
      this.saveError = false;

      // Dar tiempo para que termine la animación antes de eliminar completamente
      setTimeout(() => {
        this.showingError = false;
      }, 300);
    }, 3000);
  }
}
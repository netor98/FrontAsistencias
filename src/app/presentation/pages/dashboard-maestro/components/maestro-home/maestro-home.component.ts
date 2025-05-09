import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { horariosService } from "src/app/services/horario-maestro"
import { authService } from "src/app/services/login"
import { carrerasService } from "src/app/services/carreras"
import { Carrera } from "src/app/services/interfaces"

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string
  group: string
  dayOfWeek?: string // Día de la semana en que ocurre la clase
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
  subject: string
  classroom: string
  group: string
  time: string
}

// Define attendance status type
type AttendanceStatus = "asistio" | "no-asistio" | "pendiente"

@Component({
  selector: "app-maestro-home",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./maestro-home.component.html",
})
export class MaestroHomeComponent implements OnInit {
  schoolCycle = "2024-2025"
  period = "1"

  // Current date information
  today = new Date()
  currentDayName: string
  currentDayIndex: number
  formattedDate: string

  // Filters
  filters: FilterOptions = {
    subject: "",
    classroom: "",
    group: "",
    time: "",
  }

  // Options for dropdowns
  schoolCycles: string[] = ["2023-2024", "2024-2025", "2025-2026"]
  periods: string[] = ["1", "2"]
  careers: { id: string; name: string }[] = [];
  rawCarreras: Carrera[] = [];

  // Derived filter options (will be populated from data)
  subjectOptions: string[] = []
  classroomOptions: string[] = []
  groupOptions: string[] = []
  timeOptions: string[] = []

  // Sample data for multiple groups
  groupsData: GroupInfo[] = []

  isLoading = true;

  weekdays: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // For tracking attendance
  attendanceStatus: { [key: string]: { [key: string]: AttendanceStatus } } = {}

  // For week tracking
  currentWeek: WeekInfo
  weeks: WeekInfo[] = []

  constructor() {
    // Get current day information
    this.currentDayIndex = this.today.getDay() - 1 // 0 = Monday, 4 = Friday
    if (this.currentDayIndex < 0 || this.currentDayIndex > 4) {
      // If weekend, default to Monday
      this.currentDayIndex = 0
    }
    this.currentDayName = this.weekdays[this.currentDayIndex]

    // Format today's date
    this.formattedDate = this.today.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    this.currentWeek = this.getCurrentWeekInfo()
    this.generateWeeksForSemester()

    // Initialize attendance status for all groups
    this.groupsData.forEach((group) => {
      this.attendanceStatus[group.id] = {}
    })

    // Extract unique filter options
    this.extractFilterOptions()
  }

  // async ngOnInit(): Promise<void> {

  //   this.isLoading = true;

  //   // Obtener el usuario actual
  //   const currentUser = authService.getCurrentUser();

  //   if (currentUser && currentUser.id) {
  //     console.log('Usuario maestro actual:', currentUser);

  //     try {
  //       // Convertir el ID a número si viene como string
  //       const maestroId = typeof currentUser.id === 'string'
  //         ? parseInt(currentUser.id, 10)
  //         : currentUser.id;

  //       console.log('Obteniendo horarios para maestro ID:', maestroId);

  //       // Obtener los horarios del maestro
  //       const horarios = await horariosService.getByMaestro(maestroId);

  //       console.log('Horarios del maestro obtenidos:', horarios);

  //       if (horarios.length === 0) {
  //         console.log('El maestro no tiene horarios asignados.');
  //       } else {
  //         // Mostrar información detallada de cada horario
  //         console.log('Detalle de horarios:');
  //         horarios.forEach((horario, index) => {
  //           console.log(`Horario #${index + 1}:`);
  //           console.log(`- Día: ${horario.dia}`);
  //           console.log(`- Hora: ${horario.hora_inicio} - ${horario.hora_fin}`);
  //           console.log(`- Materia: ${horario.materias?.name || 'No especificada'}`);
  //           console.log(`- Grupo: ${horario.grupo?.name || 'No especificado'}`);
  //           console.log(`- Aula: ${horario.aulas?.aula || 'No especificada'}`);
  //           console.log(`- Carrera: ${horario.carreras?.nombre || 'No especificada'}`);
  //         });

  //         // Procesar los horarios para mostrarlos en la UI
  //         this.processHorarios(horarios);
  //         // Al terminar:
  //         this.isLoading = false;
  //       }
  //     } catch (error) {
  //       console.error('Error al obtener horarios del maestro:', error);

  //     }
  //   } else {
  //     console.error('No se pudo obtener el ID del maestro actual');
  //   }

  //   // Initialize attendance status for all classes and days in all groups
  //   this.groupsData.forEach((group) => {
  //     group.classes.forEach((classItem) => {
  //       // Initialize for all days of the week
  //       this.weekdays.forEach((day) => {
  //         if (!this.attendanceStatus[group.id]) {
  //           this.attendanceStatus[group.id] = {}
  //         }
  //         this.attendanceStatus[group.id][`${classItem.id}-${day}`] = "pendiente"
  //       })
  //     })
  //   })
  // }

  // Método para procesar los horarios obtenidos de la API
  async ngOnInit(): Promise<void> {
    this.isLoading = true;

    try {
      // Obtener las carreras primero (similar a checador-home)
      this.rawCarreras = await carrerasService.getAll();
      console.log('Carreras obtenidas:', this.rawCarreras);

      // Mapear las carreras al formato requerido por el componente
      this.mapCarreras();

      // Obtener el usuario actual
      const currentUser = authService.getCurrentUser();

      if (currentUser && currentUser.id) {
        console.log('Usuario maestro actual:', currentUser);

        try {
          // Convertir el ID a número si viene como string
          const maestroId = typeof currentUser.id === 'string'
            ? parseInt(currentUser.id, 10)
            : currentUser.id;

          console.log('Obteniendo horarios para maestro ID:', maestroId);

          // Obtener los horarios del maestro
          const horarios = await horariosService.getByMaestro(maestroId);

          console.log('Horarios del maestro obtenidos:', horarios);

          if (horarios.length === 0) {
            console.log('El maestro no tiene horarios asignados.');
            this.isLoading = false;
          } else {
            // Mostrar información detallada de cada horario
            console.log('Detalle de horarios:');
            horarios.forEach((horario, index) => {
              console.log(`Horario #${index + 1}:`);
              console.log(`- Día: ${horario.dia}`);
              console.log(`- Hora: ${horario.hora_inicio} - ${horario.hora_fin}`);
              console.log(`- Materia: ${horario.materias?.name || 'No especificada'}`);
              console.log(`- Grupo: ${horario.grupo?.name || 'No especificado'}`);
              console.log(`- Aula: ${horario.aulas?.aula || 'No especificada'}`);
              console.log(`- Carrera: ${horario.carreras?.nombre || 'No especificada'}`);
            });

            // Procesar los horarios para mostrarlos en la UI
            this.processHorarios(horarios);
          }
        } catch (error) {
          console.error('Error al obtener horarios del maestro:', error);
        }
      } else {
        console.error('No se pudo obtener el ID del maestro actual');
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error al obtener carreras:', error);
      this.isLoading = false;
    }

    // Initialize attendance status for all classes and days in all groups
    this.initializeAttendanceStatus();
  }

  // Método para inicializar el estado de asistencia
  initializeAttendanceStatus(): void {
    this.groupsData.forEach((group) => {
      group.classes.forEach((classItem) => {
        // Initialize for all days of the week
        this.weekdays.forEach((day) => {
          if (!this.attendanceStatus[group.id]) {
            this.attendanceStatus[group.id] = {}
          }
          if (this.hasClassOnDay(classItem, day)) {
            this.attendanceStatus[group.id][`${classItem.id}-${day}`] = "pendiente"
          }
        })
      })
    })
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

  processHorarios(horarios: any[]): void {
    // Crear mapa para agrupar por carrera y grupo
    const groupMap: Map<string, GroupInfo> = new Map();

    horarios.forEach(horario => {
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
          } else {
            // Para cualquier otra carrera, usar el ID como identificador
            careerId = `carrera-${horario.carreras.id}`;
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
          time: `${horario.hora_inicio?.slice(0, 5) || '00:00'} - ${horario.hora_fin?.slice(0, 5) || '00:00'}`,
          subject: horario.materias?.name || 'Sin materia',
          teacher: horario.maestro?.name || 'Sin profesor',
          classroom: horario.aulas?.aula || 'Sin aula',
          group: groupName,
          // Guardar el día de la semana para esta clase
          dayOfWeek: horario.dia || ''
        });
      }
    });

    // Log para depuración
    console.log('IDs de carreras identificadas:',
      Array.from(groupMap.values()).map(g => g.career).filter((v, i, a) => a.indexOf(v) === i));

    // Convertir el mapa de grupos a un array
    const processedGroups = Array.from(groupMap.values());
    console.log('Grupos procesados para UI:', processedGroups);

    // Reemplazar los datos de prueba con los datos reales
    this.groupsData = processedGroups;

    // Actualizar las opciones de filtrado para los nuevos datos
    this.extractFilterOptions();

    // Marcar que la carga ha finalizado
    this.isLoading = false;
  }

  
  hasClassOnDay(classItem: ClassItem, day: string): boolean {
    if (!classItem.dayOfWeek) return false;

    // Normaliza los nombres de los días para la comparación (elimina acentos y convierte a minúsculas)
    const normalizeDay = (d: string) => d.toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return normalizeDay(classItem.dayOfWeek) === normalizeDay(day);
  }

  extractFilterOptions(): void {
    // Extract unique subjects
    const subjects = new Set<string>()
    // Extract unique classrooms
    const classrooms = new Set<string>()
    // Extract unique groups
    const groups = new Set<string>()
    // Extract unique times
    const times = new Set<string>()

    this.groupsData.forEach((group) => {
      groups.add(group.name)

      group.classes.forEach((classItem) => {
        subjects.add(classItem.subject)
        classrooms.add(classItem.classroom)
        times.add(classItem.time)
      })
    })

    this.subjectOptions = Array.from(subjects).sort()
    this.classroomOptions = Array.from(classrooms).sort()
    this.groupOptions = Array.from(groups).sort()
    this.timeOptions = Array.from(times).sort((a, b) => {
      // Sort times chronologically
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

  setAttendanceStatus(groupId: string, classId: number, day: string, status: AttendanceStatus): void {
    if (!this.attendanceStatus[groupId]) {
      this.attendanceStatus[groupId] = {}
    }
    const key = `${classId}-${day}`
    this.attendanceStatus[groupId][key] = status
  }

  getAttendanceStatus(groupId: string, classId: number, day: string): AttendanceStatus {
    if (!this.attendanceStatus[groupId]) {
      return "pendiente"
    }
    const key = `${classId}-${day}`
    return this.attendanceStatus[groupId][key] || "pendiente"
  }

  isAttendanceStatus(groupId: string, classId: number, day: string, status: AttendanceStatus): boolean {
    return this.getAttendanceStatus(groupId, classId, day) === status
  }

  resetFilters(): void {
    this.filters = {
      subject: "",
      classroom: "",
      group: "",
      time: "",
    }
  }

  // Filter groups based on selected criteria
  filterGroups(): GroupInfo[] {
    return this.groupsData.filter((group) => {
      // Filter by group
      if (this.filters.group && group.name !== this.filters.group) {
        return false
      }

      // Check if any class matches the other filters
      if (this.filters.subject || this.filters.classroom || this.filters.time) {
        return group.classes.some((classItem) => {
          // Filter by subject
          if (this.filters.subject && classItem.subject !== this.filters.subject) {
            return false
          }

          // Filter by classroom
          if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
            return false
          }

          // Filter by time
          if (this.filters.time && classItem.time !== this.filters.time) {
            return false
          }

          return true
        })
      }

      return true
    })
  }

  // Filter classes within a group based on selected criteria
  filterClasses(classes: ClassItem[]): ClassItem[] {
    if (!this.filters.subject && !this.filters.classroom && !this.filters.time) {
      return classes
    }

    return classes.filter((classItem) => {
      // Filter by subject
      if (this.filters.subject && classItem.subject !== this.filters.subject) {
        return false
      }

      // Filter by classroom
      if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
        return false
      }

      // Filter by time
      if (this.filters.time && classItem.time !== this.filters.time) {
        return false
      }

      return true
    })
  }

  getCareerName(careerId: string): string {
    const career = this.careers.find((c) => c.id === careerId);
    return career ? career.name : "Carrera no especificada";
  }

  saveAttendance(): void {
    console.log("Saving attendance for all groups:", this.attendanceStatus)
    // Here you would typically send the data to a backend service
    alert("Asistencias guardadas correctamente")
  }

  // Helper method to determine if a day is the current day
  isCurrentDay(day: string): boolean {
    return day === this.currentDayName
  }
}


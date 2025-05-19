import { Component, type OnInit } from "@angular/core"
import { CommonModule, KeyValue } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { horariosService } from "src/app/services/horario-maestro"
import { HorarioMaestro, Carrera, HorarioMaestro2 } from "src/app/services/interfaces"
import { carrerasServiceSupa } from "src/app/services/carreras"

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string
  day: string
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

// Actualizar la interfaz FilterOptions para incluir el filtro de tiempo
interface FilterOptions {
  classroom: string
  teacher: string
  career: string
  time: string // Agregar filtro de tiempo
  day: string
}

// Define attendance status type
type AttendanceStatus = "asistio" | "no-asistio" | "pendiente"

@Component({
  selector: "app-checador-horarios",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./checador-horarios.component.html",
})

export class ChecadorHorariosComponent implements OnInit {
  // Propiedades para datos de la API
  horarios: HorarioMaestro2[] = [];
  rawCarreras: Carrera[] = [];
  isLoading = true;

  schoolCycle = "2024-2025"
  period = "1"

  // Current date information
  today = new Date()
  currentDayName: string
  currentDayIndex: number
  formattedDate: string

  // Actualizar la inicialización de filters para incluir time
  filters: FilterOptions = {
    classroom: "",
    teacher: "",
    career: "",
    time: "", // Inicializar filtro de tiempo
    day: "",
  }

  // Options for dropdowns
  schoolCycles: string[] = ["2023-2024", "2024-2025", "2025-2026"]
  periods: string[] = ["1", "2", "3"]
  careers: { id: string; name: string }[] = [
    { id: "ing-sistemas", name: "Ingeniería en Sistemas Computacionales" },
    { id: "ing-industrial", name: "Ingeniería Industrial" },
    { id: "ing-mecatronica", name: "Ingeniería Mecatrónica" },
    { id: "lic-administracion", name: "Licenciatura en Administración" },
  ]

  // Derived filter options (will be populated from data)
  classroomOptions: string[] = []
  teacherOptions: string[] = []
  // Agregar timeOptions como propiedad
  timeOptions: string[] = []
  dayOptions: string[] = [];

  // Sample data for multiple groups
  groupsData: GroupInfo[] = []

  weekdays: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // For tracking attendance
  attendanceStatus: { [key: string]: { [key: string]: AttendanceStatus } } = {}

  // For week tracking
  currentWeek: WeekInfo
  weeks: WeekInfo[] = [];

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

    // Extract unique classrooms and teachers for filter dropdowns
    this.extractFilterOptions()
  }

  // ngOnInit(): void {
  //   // Initialize attendance status for all classes and days in all groups
  //   this.groupsData.forEach((group) => {
  //     group.classes.forEach((classItem) => {
  //       // Only initialize for the current day
  //       const key = `${classItem.id}-${this.currentDayName}`
  //       if (!this.attendanceStatus[group.id]) {
  //         this.attendanceStatus[group.id] = {}
  //       }
  //       this.attendanceStatus[group.id][key] = "pendiente"
  //     })
  //   })
  // }
  async ngOnInit(): Promise<void> {
    this.isLoading = true;

    try {
      // Obtener las carreras primero
      this.rawCarreras = await carrerasServiceSupa.getAll();
      console.log('Carreras obtenidas:', this.rawCarreras);

      // Mapear las carreras al formato requerido por el componente
      this.mapCarreras();

      // Obtener los horarios
      this.horarios = await horariosService.getAll();
      console.log('Horarios obtenidos:', this.horarios);

      // Procesar los horarios para adaptarlos al formato del componente
      this.processHorarios();

      this.isLoading = false;
    } catch (error) {
      console.error('Error al obtener horarios:', error);
      this.isLoading = false;
    }
  }

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
          day: horario.dia || 'No especificado'  // Incluir el día del horario
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
  }

  // Modificar el método extractFilterOptions para incluir la extracción de horarios
  extractFilterOptions(): void {
    // Extract unique classrooms
    const classrooms = new Set<string>();
    // Extract unique teachers
    const teachers = new Set<string>();
    // Extract unique times
    const times = new Set<string>();
    // Extract unique days
    const days = new Set<string>();

    this.groupsData.forEach((group) => {
      group.classes.forEach((classItem) => {
        classrooms.add(classItem.classroom);
        teachers.add(classItem.teacher);
        times.add(classItem.time);
        if (classItem.day) {
          days.add(classItem.day);
        }
      });
    });

    this.classroomOptions = Array.from(classrooms).sort()
    this.teacherOptions = Array.from(teachers).sort()

    // Sort times chronologically based on the start time
    this.timeOptions = Array.from(times).sort((a, b) => {
      const timeA = a.split(" - ")[0]
      const timeB = b.split(" - ")[0]
      return timeA.localeCompare(timeB)
    })

    // Opcional: Si quieres añadir filtro por día
    this.dayOptions = Array.from(days).sort((a, b) => {
      const dayOrder: Record<string, number> = {
        "Lunes": 1,
        "Martes": 2,
        "Miércoles": 3,
        "Jueves": 4,
        "Viernes": 5
      };
      return (dayOrder[a] || 99) - (dayOrder[b] || 99);
    });
  }

  sortClassesByDayAndTime(classes: ClassItem[]): ClassItem[] {
    // Crear un mapa del orden de los días para ordenar correctamente
    const dayOrder: Record<string, number> = {
      'Lunes': 1,
      'Martes': 2,
      'Miércoles': 3,
      'Jueves': 4,
      'Viernes': 5,
      'No especificado': 99
    };
  
    // Ordenar primero por día y luego por hora
    return [...classes].sort((a, b) => {
      // Si los días son diferentes, ordenar por día
      if (a.day !== b.day) {
        return (dayOrder[a.day] || 99) - (dayOrder[b.day] || 99);
      }
      
      // Si los días son iguales, ordenar por hora
      const timeA = a.time.split(' - ')[0];
      const timeB = b.time.split(' - ')[0];
      return timeA.localeCompare(timeB);
    });
  }

  // Método para agrupar las clases por día
  getClassesByDay(classes: ClassItem[]): { [key: string]: ClassItem[] } {
    const classesByDay: { [key: string]: ClassItem[] } = {};

    // Filtrar primero las clases según los filtros actuales
    const filteredClasses = this.filterClasses(classes);

    // Agrupar por día
    filteredClasses.forEach(classItem => {
      const day = classItem.day || 'No especificado';
      if (!classesByDay[day]) {
        classesByDay[day] = [];
      }
      classesByDay[day].push(classItem);
    });

    // Ordenar cada día por hora
    Object.keys(classesByDay).forEach(day => {
      classesByDay[day].sort((a, b) => {
        const timeA = a.time.split(' - ')[0];
        const timeB = b.time.split(' - ')[0];
        return timeA.localeCompare(timeB);
      });
    });

    return classesByDay;
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

  // New method to set attendance status
  setAttendanceStatus(groupId: string, classId: number, status: AttendanceStatus): void {
    if (!this.attendanceStatus[groupId]) {
      this.attendanceStatus[groupId] = {}
    }
    // Only update for the current day
    const key = `${classId}-${this.currentDayName}`
    this.attendanceStatus[groupId][key] = status
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
      day: "",
    }
  }

  // Modificar el método filterGroups para incluir el filtro de tiempo
  filterGroups(): GroupInfo[] {
    return this.groupsData.filter((group) => {
      // Filter by career
      if (this.filters.career && group.career !== this.filters.career) {
        return false
      }

      // Filter by classroom, teacher, or time (check if any class matches)
      if (this.filters.classroom || this.filters.teacher || this.filters.time || this.filters.day) {
        return group.classes.some((classItem) => {
          // Filter by day
          if (this.filters.day && classItem.day !== this.filters.day) {
            return false;
          }

          // Filter by classroom
          if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
            return false
          }

          // Filter by teacher
          if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
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

  // Modificar el método filterClasses para incluir el filtro de tiempo
  filterClasses(classes: ClassItem[]): ClassItem[] {
    if (!this.filters.classroom && !this.filters.teacher && !this.filters.time) {
      return classes
    }

    return classes.filter((classItem) => {
      // Filter by classroom
      if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
        return false
      }

      // Filter by teacher
      if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
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
    const career = this.careers.find((c) => c.id === careerId)
    return career ? career.name : ""
  }

  saveAttendance(): void {
    console.log("Saving attendance for all groups:", this.attendanceStatus)
    // Here you would typically send the data to a backend service
    alert("Asistencias guardadas correctamente")
  }
}


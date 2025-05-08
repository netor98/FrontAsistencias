import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { horariosService } from "src/app/services/horario-maestro"
import { authService } from "src/app/services/login"

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string
  group: string
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
  careers: { id: string; name: string }[] = [
    { id: "ing-sistemas", name: "Ingeniería en Sistemas Computacionales" },
    { id: "ing-industrial", name: "Ingeniería Industrial" },
    { id: "ing-mecatronica", name: "Ingeniería Mecatrónica" },
    { id: "lic-administracion", name: "Licenciatura en Administración" },
  ]

  // Derived filter options (will be populated from data)
  subjectOptions: string[] = []
  classroomOptions: string[] = []
  groupOptions: string[] = []
  timeOptions: string[] = []

  // Sample data for multiple groups
  groupsData: GroupInfo[] = [
    {
      id: "ing-sistemas-A",
      name: "A",
      career: "ing-sistemas",
      classes: [
        {
          id: 1,
          time: "7:00 - 8:30",
          subject: "Programación Orientada a Objetos",
          teacher: "Prof. García",
          classroom: "A-101",
          group: "A",
        },
        {
          id: 2,
          time: "8:30 - 10:00",
          subject: "Bases de Datos",
          teacher: "Prof. Rodríguez",
          classroom: "A-102",
          group: "A",
        },
        {
          id: 3,
          time: "10:30 - 12:00",
          subject: "Redes de Computadoras",
          teacher: "Prof. López",
          classroom: "A-103",
          group: "A",
        },
        {
          id: 4,
          time: "12:00 - 13:30",
          subject: "Sistemas Operativos",
          teacher: "Prof. Martínez",
          classroom: "A-104",
          group: "A",
        },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Ingeniería de Software",
          teacher: "Prof. Sánchez",
          classroom: "A-105",
          group: "A",
        },
      ],
    },
    {
      id: "ing-sistemas-B",
      name: "B",
      career: "ing-sistemas",
      classes: [
        {
          id: 1,
          time: "7:00 - 8:30",
          subject: "Programación Web",
          teacher: "Prof. Torres",
          classroom: "B-201",
          group: "B",
        },
        {
          id: 2,
          time: "8:30 - 10:00",
          subject: "Inteligencia Artificial",
          teacher: "Prof. Gómez",
          classroom: "B-202",
          group: "B",
        },
        {
          id: 3,
          time: "10:30 - 12:00",
          subject: "Seguridad Informática",
          teacher: "Prof. Díaz",
          classroom: "B-203",
          group: "B",
        },
        {
          id: 4,
          time: "12:00 - 13:30",
          subject: "Desarrollo Móvil",
          teacher: "Prof. Pérez",
          classroom: "B-204",
          group: "B",
        },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Arquitectura de Computadoras",
          teacher: "Prof. Ramírez",
          classroom: "B-205",
          group: "B",
        },
      ],
    },
    {
      id: "ing-industrial-A",
      name: "A",
      career: "ing-industrial",
      classes: [
        {
          id: 1,
          time: "7:00 - 8:30",
          subject: "Procesos de Manufactura",
          teacher: "Prof. Hernández",
          classroom: "C-301",
          group: "A",
        },
        {
          id: 2,
          time: "8:30 - 10:00",
          subject: "Gestión de Calidad",
          teacher: "Prof. Flores",
          classroom: "C-302",
          group: "A",
        },
        {
          id: 3,
          time: "10:30 - 12:00",
          subject: "Logística Industrial",
          teacher: "Prof. Vargas",
          classroom: "C-303",
          group: "A",
        },
        {
          id: 4,
          time: "12:00 - 13:30",
          subject: "Seguridad Industrial",
          teacher: "Prof. Castro",
          classroom: "C-304",
          group: "A",
        },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Investigación de Operaciones",
          teacher: "Prof. Morales",
          classroom: "C-305",
          group: "A",
        },
      ],
    },
    {
      id: "ing-industrial-B",
      name: "B",
      career: "ing-industrial",
      classes: [
        {
          id: 1,
          time: "7:00 - 8:30",
          subject: "Diseño Industrial",
          teacher: "Prof. Mendoza",
          classroom: "D-401",
          group: "B",
        },
        { id: 2, time: "8:30 - 10:00", subject: "Ergonomía", teacher: "Prof. Jiménez", classroom: "D-402", group: "B" },
        {
          id: 3,
          time: "10:30 - 12:00",
          subject: "Gestión de Proyectos",
          teacher: "Prof. Ortega",
          classroom: "D-403",
          group: "B",
        },
        {
          id: 4,
          time: "12:00 - 13:30",
          subject: "Control Estadístico",
          teacher: "Prof. Núñez",
          classroom: "D-404",
          group: "B",
        },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Manufactura Esbelta",
          teacher: "Prof. Vega",
          classroom: "D-405",
          group: "B",
        },
      ],
    },
  ]

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

  async ngOnInit(): Promise<void> {
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
    }

    // Initialize attendance status for all classes and days in all groups
    this.groupsData.forEach((group) => {
      group.classes.forEach((classItem) => {
        // Initialize for all days of the week
        this.weekdays.forEach((day) => {
          if (!this.attendanceStatus[group.id]) {
            this.attendanceStatus[group.id] = {}
          }
          this.attendanceStatus[group.id][`${classItem.id}-${day}`] = "pendiente"
        })
      })
    })
  }

  // Método para procesar los horarios obtenidos de la API
  processHorarios(horarios: any[]): void {
    // Crear mapa para agrupar por carrera y grupo
    const groupMap: Map<string, GroupInfo> = new Map();

    horarios.forEach(horario => {
      // Determinar careerID basado en la carrera del horario
      let careerId = 'unknown';
      if (horario.carreras) {
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
          careerId = `carrera-${horario.carreras.id}`;
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
          group: groupName
        });
      }
    });

    // Convertir el mapa de grupos a un array
    const processedGroups = Array.from(groupMap.values());
    console.log('Grupos procesados para UI:', processedGroups);

    // Reemplazar los datos de prueba con los datos reales
    this.groupsData = processedGroups;

    // Actualizar las opciones de filtrado para los nuevos datos
    this.extractFilterOptions();
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
    const career = this.careers.find((c) => c.id === careerId)
    return career ? career.name : ""
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


import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { horariosService } from "src/app/services/horario-maestro"
import { HorarioMaestro } from "src/app/services/interfaces"

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string // Added classroom field
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
  careers: { id: string; name: string }[] = [
    { id: "ing-sistemas", name: "Ingeniería en Sistemas Computacionales" },
    { id: "ing-industrial", name: "Ingeniería Industrial" },
    { id: "ing-mecatronica", name: "Ingeniería Mecatrónica" },
    { id: "lic-administracion", name: "Licenciatura en Administración" },
  ]

  // Derived filter options (will be populated from data)
  classroomOptions: string[] = []
  teacherOptions: string[] = []
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
          time: "07:00 - 08:30",
          subject: "Programación Orientada a Objetos",
          teacher: "Prof. García",
          classroom: "A-101",
        },
        { id: 2, time: "08:30 - 10:00", subject: "Bases de Datos", teacher: "Prof. Rodríguez", classroom: "A-102" },
        { id: 3, time: "10:30 - 12:00", subject: "Redes de Computadoras", teacher: "Prof. López", classroom: "A-103" },
        { id: 4, time: "12:00 - 13:30", subject: "Sistemas Operativos", teacher: "Prof. Martínez", classroom: "A-104" },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Ingeniería de Software",
          teacher: "Prof. Sánchez",
          classroom: "A-105",
        },
      ],
    },
    {
      id: "ing-sistemas-B",
      name: "B",
      career: "ing-sistemas",
      classes: [
        { id: 1, time: "07:00 - 08:30", subject: "Programación Web", teacher: "Prof. Torres", classroom: "B-201" },
        {
          id: 2,
          time: "08:30 - 10:00",
          subject: "Inteligencia Artificial",
          teacher: "Prof. Gómez",
          classroom: "B-202",
        },
        { id: 3, time: "10:30 - 12:00", subject: "Seguridad Informática", teacher: "Prof. Díaz", classroom: "B-203" },
        { id: 4, time: "12:00 - 13:30", subject: "Desarrollo Móvil", teacher: "Prof. Pérez", classroom: "B-204" },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Arquitectura de Computadoras",
          teacher: "Prof. Ramírez",
          classroom: "B-205",
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
          time: "07:00 - 08:30",
          subject: "Procesos de Manufactura",
          teacher: "Prof. Hernández",
          classroom: "C-301",
        },
        { id: 2, time: "08:30 - 10:00", subject: "Gestión de Calidad", teacher: "Prof. Flores", classroom: "C-302" },
        { id: 3, time: "10:30 - 12:00", subject: "Logística Industrial", teacher: "Prof. Vargas", classroom: "C-303" },
        { id: 4, time: "12:00 - 13:30", subject: "Seguridad Industrial", teacher: "Prof. Castro", classroom: "C-304" },
        {
          id: 5,
          time: "13:30 - 15:00",
          subject: "Investigación de Operaciones",
          teacher: "Prof. Morales",
          classroom: "C-305",
        },
      ],
    },
    {
      id: "ing-industrial-B",
      name: "B",
      career: "ing-industrial",
      classes: [
        { id: 1, time: "07:00 - 08:30", subject: "Diseño Industrial", teacher: "Prof. Mendoza", classroom: "D-401" },
        { id: 2, time: "08:30 - 10:00", subject: "Ergonomía", teacher: "Prof. Jiménez", classroom: "D-402" },
        { id: 3, time: "10:30 - 12:00", subject: "Gestión de Proyectos", teacher: "Prof. Ortega", classroom: "D-403" },
        { id: 4, time: "12:00 - 13:30", subject: "Control Estadístico", teacher: "Prof. Núñez", classroom: "D-404" },
        { id: 5, time: "13:30 - 15:00", subject: "Manufactura Esbelta", teacher: "Prof. Vega", classroom: "D-405" },
      ],
    },
    {
      id: "ing-mecatronica-A",
      name: "A",
      career: "ing-mecatronica",
      classes: [
        { id: 1, time: "07:00 - 08:30", subject: "Robótica", teacher: "Prof. Reyes", classroom: "E-501" },
        { id: 2, time: "08:30 - 10:00", subject: "Sistemas Embebidos", teacher: "Prof. Luna", classroom: "E-502" },
        { id: 3, time: "10:30 - 12:00", subject: "Automatización", teacher: "Prof. Soto", classroom: "E-503" },
        { id: 4, time: "12:00 - 13:30", subject: "Electrónica Digital", teacher: "Prof. Campos", classroom: "E-504" },
        { id: 5, time: "13:30 - 15:00", subject: "Diseño Mecánico", teacher: "Prof. Ríos", classroom: "E-505" },
      ],
    },
    {
      id: "lic-administracion-A",
      name: "A",
      career: "lic-administracion",
      classes: [
        { id: 1, time: "07:00 - 08:30", subject: "Contabilidad", teacher: "Prof. Guzmán", classroom: "F-601" },
        { id: 2, time: "08:30 - 10:00", subject: "Economía", teacher: "Prof. Ponce", classroom: "F-602" },
        { id: 3, time: "10:30 - 12:00", subject: "Mercadotecnia", teacher: "Prof. Aguilar", classroom: "F-603" },
        { id: 4, time: "12:00 - 13:30", subject: "Recursos Humanos", teacher: "Prof. Zavala", classroom: "F-604" },
        { id: 5, time: "13:30 - 15:00", subject: "Finanzas", teacher: "Prof. Montes", classroom: "F-605" },
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
    // // Get current day information
    // this.currentDayIndex = this.today.getDay() - 1 // 0 = Monday, 4 = Friday
    // if (this.currentDayIndex < 0 || this.currentDayIndex > 4) {
    //   // If weekend, default to Monday
    //   this.currentDayIndex = 0
    // }
    // this.currentDayName = this.weekdays[this.currentDayIndex]

    // // Format today's date
    // this.formattedDate = this.today.toLocaleDateString("es-ES", {
    //   year: "numeric",
    //   month: "long",
    //   day: "numeric",
    // })

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
    // Initialize attendance status for all classes and days in all groups
    this.groupsData.forEach((group) => {
      group.classes.forEach((classItem) => {
        // Only initialize for the current day
        const key = `${classItem.id}-${this.currentDayName}`
        if (!this.attendanceStatus[group.id]) {
          this.attendanceStatus[group.id] = {}
        }
        this.attendanceStatus[group.id][key] = "pendiente"
      })
    })

    // Obtener los horarios desde el servicio
    try {
      this.horarios = await horariosService.getAll();
      console.log('Horarios obtenidos:', this.horarios);

      // Opcional: Procesar los horarios para adaptarlos al formato del componente
      // this.processHorarios();
    } catch (error) {
      console.error('Error al obtener horarios:', error);
    }
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
    }
  }

  // Filter groups based on selected criteria
  filterGroups(): GroupInfo[] {
    return this.groupsData.filter((group) => {
      // Filter by career
      if (this.filters.career && group.career !== this.filters.career) {
        return false
      }

      // Filter by classroom or teacher (check if any class matches)
      if (this.filters.classroom || this.filters.teacher || this.filters.time) {
        return group.classes.some((classItem) => {
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

  // Filter classes within a group based on selected criteria
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


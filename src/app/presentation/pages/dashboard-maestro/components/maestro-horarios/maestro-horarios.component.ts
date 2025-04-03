import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

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
  group: string // Changed from teacher to group
  career: string
}

@Component({
  selector: "app-maestro-horarios",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./maestro-horarios.component.html",
})
export class MaestroHorariosComponent implements OnInit {
  schoolCycle = "2024-2025"
  period = "1"

  // Current date information
  today = new Date()
  currentDayName: string
  currentDayIndex: number
  formattedDate: string

  // Filters
  filters: FilterOptions = {
    classroom: "",
    group: "", // Changed from teacher to group
    career: "",
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
  groupOptions: string[] = [] // Changed from teacherOptions to groupOptions

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
        },
        { id: 2, time: "8:30 - 10:00", subject: "Bases de Datos", teacher: "Prof. Rodríguez", classroom: "A-102" },
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
    
  ]

  weekdays: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // For tracking attendance
  attendanceStatus: { [key: string]: { [key: string]: string } } = {}

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

    // Extract unique classrooms and groups for filter dropdowns
    this.extractFilterOptions()
  }

  ngOnInit(): void {
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
  }

  extractFilterOptions(): void {
    // Extract unique classrooms
    const classrooms = new Set<string>()
    // Extract unique groups
    const groups = new Set<string>()

    this.groupsData.forEach((group) => {
      // Add group name to groups set
      groups.add(group.name)

      group.classes.forEach((classItem) => {
        classrooms.add(classItem.classroom)
      })
    })

    this.classroomOptions = Array.from(classrooms).sort()
    this.groupOptions = Array.from(groups).sort()
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

  updateAttendance(groupId: string, classId: number, status: string): void {
    if (!this.attendanceStatus[groupId]) {
      this.attendanceStatus[groupId] = {}
    }
    // Only update for the current day
    const key = `${classId}-${this.currentDayName}`
    this.attendanceStatus[groupId][key] = status
  }

  getAttendanceStatus(groupId: string, classId: number): string {
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
      group: "", // Changed from teacher to group
      career: "",
    }
  }

  // Filter groups based on selected criteria
  filterGroups(): GroupInfo[] {
    return this.groupsData.filter((group) => {
      // Filter by career
      if (this.filters.career && group.career !== this.filters.career) {
        return false
      }

      // Filter by group
      if (this.filters.group && group.name !== this.filters.group) {
        return false
      }

      // Filter by classroom (check if any class matches)
      if (this.filters.classroom) {
        return group.classes.some((classItem) => {
          // Filter by classroom
          if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
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
    if (!this.filters.classroom) {
      return classes
    }

    return classes.filter((classItem) => {
      // Filter by classroom
      if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
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


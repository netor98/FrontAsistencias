import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
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

@Component({
  selector: "app-checador-home",
  imports: [CommonModule, FormsModule],
  templateUrl: "./checador-home.component.html",
})
export class ChecadorHomeComponent implements OnInit {
  schoolCycle = "2024-2025"
  period = "1"
  selectedCareer = "ing-sistemas"
  selectedGroup = "A"
  selectedGroupId = "ing-sistemas-A"

  schoolCycles: string[] = ["2023-2024", "2024-2025", "2025-2026"]
  periods: string[] = ["1", "2", "3"]
  careers: { id: string; name: string }[] = [
    { id: "ing-sistemas", name: "Ingeniería en Sistemas Computacionales" },
    { id: "ing-industrial", name: "Ingeniería Industrial" },
    { id: "ing-mecatronica", name: "Ingeniería Mecatrónica" },
    { id: "lic-administracion", name: "Licenciatura en Administración" },
  ]
  groups: string[] = ["A", "B", "C", "D"]

  // Sample data for multiple groups
  groupsData: GroupInfo[] = [
    {
      id: "ing-sistemas-A",
      name: "A",
      career: "ing-sistemas",
      classes: [
        { id: 1, time: "7:00 - 8:30", subject: "Programación Orientada a Objetos", teacher: "Prof. García" },
        { id: 2, time: "8:30 - 10:00", subject: "Bases de Datos", teacher: "Prof. Rodríguez" },
        { id: 3, time: "10:30 - 12:00", subject: "Redes de Computadoras", teacher: "Prof. López" },
        { id: 4, time: "12:00 - 13:30", subject: "Sistemas Operativos", teacher: "Prof. Martínez" },
        { id: 5, time: "13:30 - 15:00", subject: "Ingeniería de Software", teacher: "Prof. Sánchez" },
      ],
    },
    {
      id: "ing-sistemas-B",
      name: "B",
      career: "ing-sistemas",
      classes: [
        { id: 1, time: "7:00 - 8:30", subject: "Programación Web", teacher: "Prof. Torres" },
        { id: 2, time: "8:30 - 10:00", subject: "Inteligencia Artificial", teacher: "Prof. Gómez" },
        { id: 3, time: "10:30 - 12:00", subject: "Seguridad Informática", teacher: "Prof. Díaz" },
        { id: 4, time: "12:00 - 13:30", subject: "Desarrollo Móvil", teacher: "Prof. Pérez" },
        { id: 5, time: "13:30 - 15:00", subject: "Arquitectura de Computadoras", teacher: "Prof. Ramírez" },
      ],
    },
    {
      id: "ing-industrial-A",
      name: "A",
      career: "ing-industrial",
      classes: [
        { id: 1, time: "7:00 - 8:30", subject: "Procesos de Manufactura", teacher: "Prof. Hernández" },
        { id: 2, time: "8:30 - 10:00", subject: "Gestión de Calidad", teacher: "Prof. Flores" },
        { id: 3, time: "10:30 - 12:00", subject: "Logística Industrial", teacher: "Prof. Vargas" },
        { id: 4, time: "12:00 - 13:30", subject: "Seguridad Industrial", teacher: "Prof. Castro" },
        { id: 5, time: "13:30 - 15:00", subject: "Investigación de Operaciones", teacher: "Prof. Morales" },
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
    this.currentWeek = this.getCurrentWeekInfo()
    this.generateWeeksForSemester()

    // Initialize attendance status for all groups
    this.groupsData.forEach((group) => {
      this.attendanceStatus[group.id] = {}
    })
  }

  ngOnInit(): void {
    // Initialize attendance status for all classes and days in all groups
    this.groupsData.forEach((group) => {
      group.classes.forEach((classItem) => {
        this.weekdays.forEach((day) => {
          if (!this.attendanceStatus[group.id]) {
            this.attendanceStatus[group.id] = {}
          }
          this.attendanceStatus[group.id][`${classItem.id}-${day}`] = "pendiente"
        })
      })
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

  updateAttendance(groupId: string, classId: number, day: string, status: string): void {
    if (!this.attendanceStatus[groupId]) {
      this.attendanceStatus[groupId] = {}
    }
    this.attendanceStatus[groupId][`${classId}-${day}`] = status
  }

  getAttendanceStatus(groupId: string, classId: number, day: string): string {
    if (!this.attendanceStatus[groupId]) {
      return "pendiente"
    }
    return this.attendanceStatus[groupId][`${classId}-${day}`] || "pendiente"
  }

  onCareerChange(): void {
    // Update available groups based on selected career
    const availableGroups = this.groupsData
      .filter((group) => group.career === this.selectedCareer)
      .map((group) => group.name)

    // Set the first available group as selected
    if (availableGroups.length > 0) {
      this.selectedGroup = availableGroups[0]
      this.updateSelectedGroupId()
    }
  }

  onGroupChange(): void {
    this.updateSelectedGroupId()
  }

  updateSelectedGroupId(): void {
    this.selectedGroupId = `${this.selectedCareer}-${this.selectedGroup}`
  }

  getSelectedGroupData(): GroupInfo | undefined {
    return this.groupsData.find((group) => group.id === this.selectedGroupId)
  }

  getCareerName(careerId: string): string {
    const career = this.careers.find((c) => c.id === careerId)
    return career ? career.name : ""
  }

  saveAttendance(): void {
    console.log("Saving attendance for group:", this.selectedGroupId)
    console.log("Attendance data:", this.attendanceStatus[this.selectedGroupId])
    // Here you would typically send the data to a backend service
    alert("Asistencias guardadas correctamente")
  }
}


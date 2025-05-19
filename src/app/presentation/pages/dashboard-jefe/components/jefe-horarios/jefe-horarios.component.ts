import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { authService } from "src/app/services/login"
import { horariosService } from "src/app/services/horario-maestro"
import { carrerasServiceSupa } from "src/app/services/carreras"
import { Grupo, HorarioMaestro, Carrera } from "src/app/services/interfaces"

interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string
  day: string // Añadido para incluir el día de la semana
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
  day: string // Añadido filtro por día
}

@Component({
  selector: "app-jefe-horarios",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./jefe-horarios.component.html",
})
export class JefeHorariosComponent implements OnInit {
  schoolCycle = "2024-2025"
  period = "1"
  isLoading = true
  error: string | null = null

  // Current date information
  today = new Date()
  currentDayName: string
  currentDayIndex: number
  formattedDate: string

  // Datos del grupo actual
  currentGrupo: Grupo | null = null
  carreraName: string = ""

  // Filters
  filters: FilterOptions = {
    classroom: "",
    teacher: "",
    day: "",
  }

  // Options for dropdowns
  schoolCycles: string[] = ["2023-2024", "2024-2025", "2025-2026"]
  periods: string[] = ["1", "2", "3"]

  // Derived filter options (will be populated from data)
  classroomOptions: string[] = []
  teacherOptions: string[] = []

  // Data for UI - se llenará con los datos reales
  groupData: GroupInfo | null = null

  weekdays: string[] = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"]

  // For tracking attendance - no usado en este componente pero mantenido por compatibilidad
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
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true
    this.error = null

    try {
      // 1. Obtener el usuario actual
      const currentUser = authService.getCurrentUser()

      if (!currentUser) {
        this.error = "No se ha iniciado sesión. Por favor inicie sesión nuevamente."
        this.isLoading = false
        return
      }

      // Verificar que sea jefe de grupo
      if (currentUser.role !== "Jefe de grupo" && currentUser.role !== "Jefe de Grupo") {
        this.error = "Este usuario no tiene rol de Jefe de Grupo."
        this.isLoading = false
        return
      }

      // Verificar que tenga número de cuenta
      if (!currentUser.numero_cuenta) {
        this.error = "Este usuario no tiene un número de cuenta asignado."
        this.isLoading = false
        return
      }

      console.log("Jefe de grupo encontrado:", currentUser)

      // 2. Obtener el grupo asociado al jefe
      this.currentGrupo = await horariosService.getByJefeNoCuenta(currentUser.numero_cuenta)

      if (!this.currentGrupo) {
        this.error = "No se encontró un grupo asignado a este Jefe de Grupo."
        this.isLoading = false
        return
      }

      console.log("Grupo encontrado:", this.currentGrupo)

      // 3. Obtener la información de la carrera
      if (this.currentGrupo.carrera_id) {
        const carrera = await carrerasServiceSupa.getById(this.currentGrupo.carrera_id)
        if (carrera) {
          this.carreraName = carrera.nombre
        }
      }

      // 4. Obtener los horarios del grupo
      const horarios = await horariosService.getByGrupo(this.currentGrupo.id!)

      console.log("Horarios obtenidos:", horarios)

      // 5. Procesar los horarios para mostrar en la UI
      this.processSchedule(horarios)

    } catch (error) {
      console.error("Error al cargar horarios:", error)
      this.error = "Error al cargar horarios. Por favor intente nuevamente."
    } finally {
      this.isLoading = false
    }
  }

  // Procesar los horarios obtenidos de la API
  processSchedule(horarios: any[]): void {
    if (!this.currentGrupo) return

    // Crear el objeto GroupInfo para el grupo actual
    const careerId = `carrera-${this.currentGrupo.carrera_id}`
    const groupName = this.currentGrupo.name || 'Sin nombre'

    // Crear array de ClassItem a partir de los horarios
    const classes: ClassItem[] = horarios.map(horario => ({
      id: horario.id,
      time: `${horario.hora_inicio?.slice(0, 5) || '00:00'} - ${horario.hora_fin?.slice(0, 5) || '00:00'}`,
      subject: horario.materias?.name || 'Sin materia',
      teacher: horario.maestro?.name || 'Sin profesor',
      classroom: horario.aulas?.aula || 'Sin aula',
      day: horario.dia || 'No especificado'
    }))

    // Guardar en groupData
    this.groupData = {
      id: `${careerId}-${groupName}`,
      name: groupName,
      career: careerId,
      classes
    }

    console.log("Datos procesados:", this.groupData)

    // Extraer opciones para filtros
    this.extractFilterOptions(classes)
  }

  // Extraer opciones para los filtros desde las clases
  extractFilterOptions(classes: ClassItem[]): void {
    // Extract unique classrooms
    const classrooms = new Set<string>()
    // Extract unique teachers
    const teachers = new Set<string>()

    classes.forEach((classItem) => {
      if (classItem.classroom) classrooms.add(classItem.classroom)
      if (classItem.teacher) teachers.add(classItem.teacher)
    })

    this.classroomOptions = Array.from(classrooms).sort()
    this.teacherOptions = Array.from(teachers).sort()
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

  resetFilters(): void {
    this.filters = {
      classroom: "",
      teacher: "",
      day: "",
    }
  }

  // Filtrar clases basándose en los criterios seleccionados
  filterClasses(): ClassItem[] {
    if (!this.groupData?.classes) return []

    return this.groupData.classes.filter((classItem) => {
      // Filter by classroom
      if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
        return false
      }

      // Filter by teacher
      if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
        return false
      }

      // Filter by day
      if (this.filters.day && classItem.day !== this.filters.day) {
        return false
      }

      return true
    })
  }

  // Agrupar las clases por día de la semana y aplicar filtros adicionales
  getClassesByDay(day: string): ClassItem[] {
    if (!this.groupData?.classes) return []

    return this.groupData.classes.filter(cls => {
      // Siempre filtrar por el día específico
      if (cls.day !== day) return false;

      // Aplicar filtro de aula si está seleccionado
      if (this.filters.classroom && cls.classroom !== this.filters.classroom) {
        return false;
      }

      // Aplicar filtro de maestro si está seleccionado
      if (this.filters.teacher && cls.teacher !== this.filters.teacher) {
        return false;
      }

      return true;
    });
  }

  // Método para verificar si todas las listas de clases por día están vacías después de aplicar filtros
  allDaysEmpty(): boolean {
    return this.weekdays.every(day => this.getClassesByDay(day).length === 0);
  }

  // Verificar si hay clases para un día específico (para la vista)
  hasClassesForDay(day: string): boolean {
    return this.getClassesByDay(day).length > 0
  }

  // Verificar si hay alguna clase que cumple con los filtros
  hasFilteredClasses(): boolean {
    return this.filterClasses().length > 0
  }
}
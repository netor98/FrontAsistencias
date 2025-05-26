import { Component, type OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule } from "@angular/forms"
import { Router } from "@angular/router"
import { horariosService } from "src/app/services/horario-maestro"
import { carrerasServiceSupa } from "src/app/services/carreras"

// Interfaces
interface ClassItem {
  id: number
  time: string
  subject: string
  teacher: string
  classroom: string
  day?: string
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

@Component({
  selector: "app-horariosgeneral",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./horariosgeneral.component.html",
})
export class HorariosgeneralComponent implements OnInit {
  formattedDate: string
  isLoading = true
  filters: FilterOptions = {
    classroom: "",
    teacher: "",
    career: "",
    time: "",
  }

  careers: { id: string; name: string }[] = []
  groupsData: GroupInfo[] = []

  classroomOptions: string[] = []
  teacherOptions: string[] = []
  timeOptions: string[] = []

  // Días de la semana ordenados
  diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  // Agregar una nueva propiedad para mantener los datos originales
  originalGroupsData: GroupInfo[] = []

  constructor(private router: Router) {
    this.formattedDate = new Date().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  async ngOnInit(): Promise<void> {
    this.isLoading = true
    try {
      // Cargar datos reales
      await this.loadCarreras()
      await this.loadHorarios()
    } catch (error) {
      console.error("Error al cargar datos:", error)
    } finally {
      this.isLoading = false
    }
  }

  async loadCarreras(): Promise<void> {
    try {
      const carreras = await carrerasServiceSupa.getAll()
      if (carreras && carreras.length > 0) {
        this.careers = carreras.map((carrera: any) => ({
          id: carrera.id.toString(),
          name: carrera.nombre ? carrera.nombre.trim() : `Carrera ${carrera.id}`,
        }))
        console.log("Carreras cargadas:", this.careers)
      } else {
        console.warn("No se encontraron carreras en la base de datos")
      }
    } catch (error) {
      console.error("Error al cargar carreras:", error)
    }
  }

  async loadHorarios(): Promise<void> {
    try {
      // Usar el método getAll2() que carga las relaciones completas
      let horarios
      try {
        console.log("Cargando horarios con relaciones completas...")
        horarios = await horariosService.getAll2()
      } catch (supabaseError) {
        console.warn("Error de Supabase, intentando nuevamente:", supabaseError)
        await new Promise((resolve) => setTimeout(resolve, 1000))
        horarios = await horariosService.getAll2()
      }

      if (!horarios || horarios.length === 0) {
        console.warn("No se encontraron horarios en la base de datos")

        return
      }

      console.log("Horarios cargados con relaciones:", horarios)
      console.log("Primer horario con relaciones:", horarios[0])

      // Procesar los horarios
      this.processHorarios(horarios)
    } catch (error) {
      console.error("Error al cargar horarios:", error)

    }
  }

  // Método simplificado para procesar horarios con relaciones completas
  processHorarios(horarios: any[]): void {
    try {
      console.log("=== PROCESANDO HORARIOS CON RELACIONES ===")
      console.log("Total de horarios:", horarios.length)

      const groupMap: Map<string, GroupInfo> = new Map()
      const classrooms = new Set<string>()
      const teachers = new Set<string>()
      const times = new Set<string>()

      for (const horario of horarios) {
        console.log("Procesando horario:", horario)

        if (!horario.id) {
          console.warn("Horario sin ID, saltando")
          continue
        }

        // Extraer datos del grupo
        const grupoName = horario.grupo?.name || `Grupo ${horario.grupo_id || "Sin ID"}`

        // Extraer carrera ID desde las relaciones
        let carreraId = "0"
        if (horario.carreras?.id) {
          carreraId = horario.carreras.id.toString()
        }

        const groupId = `${carreraId}-${grupoName}`

        // Crear grupo si no existe
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            id: groupId,
            name: grupoName,
            career: carreraId,
            classes: [],
          })
          console.log("✅ Grupo creado:", groupId)
        }

        const group = groupMap.get(groupId)
        if (group) {
          // Formatear horarios
          const horaInicio = this.formatTime(horario.hora_inicio || "07:00")
          const horaFin = this.formatTime(horario.hora_fin || "08:30")
          const time = `${horaInicio} - ${horaFin}`

          // Normalizar día
          const day = horario.dia ? horario.dia.charAt(0).toUpperCase() + horario.dia.slice(1).toLowerCase() : "Lunes"

          // Extraer información desde las relaciones
          const subject = horario.materias?.name || "Sin materia"
          const teacher = horario.maestro?.name || "Sin profesor"
          const classroom = horario.aulas?.aula || "Sin aula"

          const classItem: ClassItem = {
            id: horario.id,
            time,
            subject,
            teacher,
            classroom,
            day,
          }

          group.classes.push(classItem)

          // Agregar a opciones de filtro solo si tienen valores válidos
          if (classroom && classroom !== "Sin aula") classrooms.add(classroom)
          if (teacher && teacher !== "Sin profesor") teachers.add(teacher)
          times.add(time)

          console.log("✅ Clase procesada:", classItem)
        }
      }

      // Guardar datos
      this.originalGroupsData = Array.from(groupMap.values())
      this.groupsData = JSON.parse(JSON.stringify(this.originalGroupsData))

      console.log("=== RESUMEN FINAL ===")
      console.log("Grupos procesados:", this.originalGroupsData.length)
      console.log("Datos finales:", this.originalGroupsData)

      if (this.originalGroupsData.length === 0) {
        console.warn("No se procesaron datos, cargando ejemplos")

        return
      }

      // Generar opciones de filtro
      this.classroomOptions = Array.from(classrooms).sort()
      this.teacherOptions = Array.from(teachers).sort()
      this.timeOptions = Array.from(times).sort((a, b) => {
        const timeA = a.split(" - ")[0]
        const timeB = b.split(" - ")[0]
        return timeA.localeCompare(timeB)
      })

      console.log("=== OPCIONES DE FILTRO ===")
      console.log("Aulas:", this.classroomOptions)
      console.log("Maestros:", this.teacherOptions)
      console.log("Horarios:", this.timeOptions)
    } catch (error) {
      console.error("Error al procesar horarios:", error)
   
    }
  }

  applyFilters(): void {
    let filteredGroups = JSON.parse(JSON.stringify(this.originalGroupsData))

    if (!this.filters.classroom && !this.filters.teacher && !this.filters.career && !this.filters.time) {
      this.groupsData = filteredGroups
      return
    }

    filteredGroups = filteredGroups.filter((group: GroupInfo) => {
      if (this.filters.career && group.career !== this.filters.career) {
        return false
      }

      const filteredClasses = group.classes.filter((classItem: ClassItem) => {
        if (this.filters.classroom && classItem.classroom !== this.filters.classroom) {
          return false
        }
        if (this.filters.teacher && classItem.teacher !== this.filters.teacher) {
          return false
        }
        if (this.filters.time && classItem.time !== this.filters.time) {
          return false
        }
        return true
      })

      if (filteredClasses.length > 0) {
        group.classes = filteredClasses
        return true
      }
      return false
    })

    this.groupsData = filteredGroups
  }

  formatTime(timeString: string): string {
    if (!timeString) return "00:00"

    if (timeString.includes(":")) {
      return timeString.slice(0, 5)
    }

    const seconds = Number.parseInt(timeString, 10)
    if (!isNaN(seconds)) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }

    return timeString
  }

  getCareerName(careerId: string): string {
    const career = this.careers.find((c) => c.id === careerId)
    return career ? career.name : "Sin carrera"
  }

  getClassesForDay(group: GroupInfo, day: string): ClassItem[] {
    return group.classes.filter((classItem) => classItem.day === day)
  }

  getUniqueTimesForGroup(group: GroupInfo): string[] {
    const times = new Set<string>()
    group.classes.forEach((classItem) => {
      times.add(classItem.time)
    })
    return Array.from(times).sort((a, b) => {
      const timeA = a.split(" - ")[0]
      const timeB = b.split(" - ")[0]
      return timeA.localeCompare(timeB)
    })
  }

  getClassForTimeAndDay(group: GroupInfo, time: string, day: string): ClassItem | null {
    return group.classes.find((classItem) => classItem.time === time && classItem.day === day) || null
  }

  resetFilters(): void {
    this.filters = {
      classroom: "",
      teacher: "",
      career: "",
      time: "",
    }
    this.groupsData = JSON.parse(JSON.stringify(this.originalGroupsData))
  }

  onFilterChange(): void {
    this.applyFilters()
  }

  navigateToHome(): void {
    this.router.navigate(["/"])
  }

  
}

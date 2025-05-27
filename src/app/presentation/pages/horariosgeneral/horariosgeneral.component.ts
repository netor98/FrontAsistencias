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
      await this.loadCarreras()
      await this.loadHorarios()
    } catch (error) {
      console.error("Error al cargar datos:", error)
      this.groupsData = []
    } finally {
      this.isLoading = false
    }
  }

  async loadCarreras(): Promise<void> {
    try {
      console.log("Cargando carreras...")
      const carreras = await carrerasServiceSupa.getAll()

      if (carreras && carreras.length > 0) {
        this.careers = carreras.map((carrera: any) => ({
          id: carrera.id.toString(),
          name: carrera.nombre ? carrera.nombre.trim() : `Carrera ${carrera.id}`,
        }))
        console.log("Carreras cargadas:", this.careers.length)
      } else {
        console.warn("No se encontraron carreras")
      }
    } catch (error) {
      console.error("Error al cargar carreras:", error)
    }
  }

  async loadHorarios(): Promise<void> {
    try {
      console.log("=== INICIANDO CARGA DE HORARIOS ===")

      // Usar el método getAll2() que ya tiene las relaciones
      const horarios = await horariosService.getAll2()

      console.log(`Horarios recibidos: ${horarios?.length || 0}`)

      if (!horarios || horarios.length === 0) {
        console.warn("No se encontraron horarios en la base de datos")
        this.groupsData = []
        return
      }

      console.log("Primer horario recibido:", horarios[0])

      // Procesar los horarios
      await this.processHorariosWithRelations(horarios)
    } catch (error) {
      console.error("Error al cargar horarios:", error)
      this.groupsData = []
    }
  }

  async processHorariosWithRelations(horarios: any[]): Promise<void> {
    try {
      console.log("=== PROCESANDO HORARIOS ===")
      console.log(`Total horarios a procesar: ${horarios.length}`)

      const groupMap: Map<string, GroupInfo> = new Map()
      const classrooms = new Set<string>()
      const teachers = new Set<string>()
      const times = new Set<string>()

      for (const [index, horario] of horarios.entries()) {
        console.log(`\n--- Procesando horario ${index + 1}/${horarios.length} ---`)
        console.log("Horario raw:", {
          id: horario.id,
          dia: horario.dia,
          hora_inicio: horario.hora_inicio,
          hora_fin: horario.hora_fin,
          maestro_id: horario.maestro_id,
          materia_id: horario.materia_id,
          grupo_id: horario.grupo_id,
          aula_id: horario.aula_id,
        })

        if (!horario.id) {
          console.warn(`Horario ${index + 1} no tiene ID, saltando...`)
          continue
        }

        // Extraer información del grupo
        const grupoName = horario.grupo?.name || `Grupo ${horario.grupo_id || "Sin ID"}`
        console.log("Grupo extraído:", grupoName)

        // Extraer carrera ID
        let carreraId = "0"
        if (horario.carreras?.id) {
          carreraId = horario.carreras.id.toString()
        } else if (horario.grupo?.carrera_id) {
          carreraId = horario.grupo.carrera_id.toString()
        }
        console.log("Carrera ID extraído:", carreraId)

        const groupId = `${carreraId}-${grupoName}`
        console.log("Group ID generado:", groupId)

        // Crear grupo si no existe
        if (!groupMap.has(groupId)) {
          groupMap.set(groupId, {
            id: groupId,
            name: grupoName,
            career: carreraId,
            classes: [],
          })
          console.log(`Nuevo grupo creado: ${groupId}`)
        }

        const group = groupMap.get(groupId)!

        // Formatear tiempo
        const horaInicio = this.formatTime(horario.hora_inicio)
        const horaFin = this.formatTime(horario.hora_fin)
        const time = `${horaInicio} - ${horaFin}`
        console.log("Tiempo formateado:", time)

        // Normalizar día
        const day = this.normalizeDayName(horario.dia)
        console.log("Día normalizado:", day)

        // Extraer datos de las relaciones
        const subject = horario.materias?.name || "Sin materia"
        const teacher = horario.maestro?.name || "Sin profesor"
        const classroom = horario.aulas?.aula || "Sin aula"

        console.log("Datos extraídos:", { subject, teacher, classroom })

        const classItem: ClassItem = {
          id: horario.id,
          time,
          subject,
          teacher,
          classroom,
          day,
        }

        group.classes.push(classItem)

        // Agregar a opciones de filtro
        if (classroom !== "Sin aula") classrooms.add(classroom)
        if (teacher !== "Sin profesor") teachers.add(teacher)
        times.add(time)

        console.log(`✓ Procesado: ${subject} - ${teacher} - ${classroom} - ${day} ${time}`)
      }

      // Guardar datos
      this.originalGroupsData = Array.from(groupMap.values())
      this.groupsData = JSON.parse(JSON.stringify(this.originalGroupsData))

      // Generar opciones de filtro
      this.classroomOptions = Array.from(classrooms).sort()
      this.teacherOptions = Array.from(teachers).sort()
      this.timeOptions = Array.from(times).sort((a, b) => {
        const timeA = a.split(" - ")[0]
        const timeB = b.split(" - ")[0]
        return timeA.localeCompare(timeB)
      })

      console.log("=== RESUMEN FINAL ===")
      console.log(`Grupos procesados: ${this.originalGroupsData.length}`)
      console.log(`Aulas: ${this.classroomOptions.length}`)
      console.log(`Maestros: ${this.teacherOptions.length}`)
      console.log(`Horarios: ${this.timeOptions.length}`)

      // Log de grupos creados
      this.originalGroupsData.forEach((group) => {
        console.log(`Grupo ${group.id}: ${group.classes.length} clases`)
      })
    } catch (error) {
      console.error("Error al procesar horarios:", error)
      this.groupsData = []
    }
  }

  normalizeDayName(dia: string): string {
    if (!dia) return "Lunes"

    const dayMap: { [key: string]: string } = {
      lunes: "Lunes",
      martes: "Martes",
      miercoles: "Miércoles",
      miércoles: "Miércoles",
      jueves: "Jueves",
      viernes: "Viernes",
      sabado: "Sábado",
      sábado: "Sábado",
      domingo: "Domingo",
    }

    const normalizedDay = dayMap[dia.toLowerCase()]
    return normalizedDay || dia.charAt(0).toUpperCase() + dia.slice(1).toLowerCase()
  }

  formatTime(timeString: string): string {
    if (!timeString) return "00:00"

    // Si ya está en formato HH:MM
    if (timeString.includes(":")) {
      return timeString.slice(0, 5)
    }

    // Si es un número de segundos
    const seconds = Number.parseInt(timeString, 10)
    if (!isNaN(seconds)) {
      const hours = Math.floor(seconds / 3600)
      const minutes = Math.floor((seconds % 3600) / 60)
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`
    }

    return timeString
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

  getCareerName(careerId: string): string {
    const career = this.careers.find((c) => c.id === careerId)
    return career ? career.name : "Sin carrera"
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

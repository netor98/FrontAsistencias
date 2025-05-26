import { supabase } from "./supabaseConnection"
import type { Carrera } from "./interfaces"

export const carrerasServiceSupa = {
  async getAll(): Promise<Carrera[]> {
    try {
      console.log("Fetching all carreras...")
      const { data, error } = await supabase.from("carreras").select("*").order("nombre", { ascending: true })

      console.log(data)
      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message)
      }

      return data as Carrera[]
    } catch (error: any) {
      console.error("Error fetching carreras:", error)
      throw error
    }
  },

  async getPlanes(): Promise<number[]> {
    try {
      const { data, error } = await supabase.from("carreras").select("plan")

      if (error) throw new Error(error.message)

      const uniquePlans = new Set(data.map((item: any) => item.plan))
      return Array.from(uniquePlans) as number[]
    } catch (error: any) {
      console.error("Error fetching planes:", error)
      throw error
    }
  },

  async getById(id: number): Promise<Carrera | null> {
    try {
      const { data, error } = await supabase.from("carreras").select("*").eq("id", id).single()

      if (error) throw new Error(error.message)
      return data as Carrera
    } catch (error: any) {
      console.error(`Error fetching carrera with id ${id}:`, error)
      throw error
    }
  },

  async create(carrera: Carrera): Promise<Carrera> {
    try {
      const { data, error } = await supabase.from("carreras").insert(carrera).select().single()

      if (error) throw new Error(error.message)
      return data as Carrera
    } catch (error: any) {
      console.error("Error creating carrera:", error)
      throw error
    }
  },

  async update(id: number, carrera: Partial<Carrera>): Promise<Carrera> {
    try {
      const { data, error } = await supabase.from("carreras").update(carrera).eq("id", id).select().single()

      if (error) throw new Error(error.message)
      return data as Carrera
    } catch (error: any) {
      console.error(`Error updating carrera with id ${id}:`, error)
      throw error
    }
  },

  async checkDependencies(id: number): Promise<{
    canDelete: boolean
    dependencies: {
      materias: number
      grupos: number
      horarios: number
    }
    details: {
      materias: any[]
      grupos: any[]
    }
  }> {
    try {
      console.log(`Checking dependencies for carrera ${id}...`)

      // Verificar materias asociadas
      const { data: materias, error: materiasError } = await supabase
        .from("materias")
        .select("id, name")
        .eq("carrera_id", id)

      if (materiasError) throw new Error(materiasError.message)

      // Verificar grupos asociados
      const { data: grupos, error: gruposError } = await supabase.from("grupo").select("id, name").eq("carrera_id", id)

      if (gruposError) throw new Error(gruposError.message)

      // Verificar horarios asociados (a través de grupos)
      const grupoIds = grupos?.map((g) => g.id) || []
      let horariosCount = 0

      if (grupoIds.length > 0) {
        const { data: horarios, error: horariosError } = await supabase
          .from("horario-maestro")
          .select("id")
          .in("grupo_id", grupoIds)

        if (horariosError) throw new Error(horariosError.message)
        horariosCount = horarios?.length || 0
      }

      const dependencies = {
        materias: materias?.length || 0,
        grupos: grupos?.length || 0,
        horarios: horariosCount,
      }

      const canDelete = dependencies.materias === 0 && dependencies.grupos === 0 && dependencies.horarios === 0

      console.log(`Dependencies for carrera ${id}:`, dependencies)

      return {
        canDelete,
        dependencies,
        details: {
          materias: materias || [],
          grupos: grupos || [],
        },
      }
    } catch (error: any) {
      console.error(`Error checking dependencies for carrera ${id}:`, error)
      throw error
    }
  },

  async deleteWithDependencies(id: number): Promise<{
    success: boolean
    message: string
    deletedItems?: {
      horarios: number
      grupos: number
      materias: number
    }
  }> {
    try {
      console.log(`Starting cascade delete for carrera ${id}...`)

      const deletedItems = {
        horarios: 0,
        grupos: 0,
        materias: 0,
      }

      // 1. Obtener grupos de esta carrera
      const { data: grupos, error: gruposError } = await supabase.from("grupo").select("id").eq("carrera_id", id)

      if (gruposError) throw new Error(`Error obteniendo grupos: ${gruposError.message}`)

      if (grupos && grupos.length > 0) {
        const grupoIds = grupos.map((g) => g.id)

        // 2. Eliminar horarios asociados a estos grupos
        const { data: deletedHorarios, error: horariosError } = await supabase
          .from("horario-maestro")
          .delete()
          .in("grupo_id", grupoIds)
          .select("id")

        if (horariosError) throw new Error(`Error eliminando horarios: ${horariosError.message}`)
        deletedItems.horarios = deletedHorarios?.length || 0

        // 3. Eliminar grupos
        const { data: deletedGrupos, error: gruposDeleteError } = await supabase
          .from("grupo")
          .delete()
          .eq("carrera_id", id)
          .select("id")

        if (gruposDeleteError) throw new Error(`Error eliminando grupos: ${gruposDeleteError.message}`)
        deletedItems.grupos = deletedGrupos?.length || 0
      }

      // 4. Eliminar materias
      const { data: deletedMaterias, error: materiasError } = await supabase
        .from("materias")
        .delete()
        .eq("carrera_id", id)
        .select("id")

      if (materiasError) throw new Error(`Error eliminando materias: ${materiasError.message}`)
      deletedItems.materias = deletedMaterias?.length || 0

      // 5. Finalmente eliminar la carrera
      const { error: carreraError } = await supabase.from("carreras").delete().eq("id", id)

      if (carreraError) throw new Error(`Error eliminando carrera: ${carreraError.message}`)

      console.log(`Carrera ${id} eliminada exitosamente con dependencias:`, deletedItems)

      return {
        success: true,
        message: "Carrera y todas sus dependencias eliminadas exitosamente",
        deletedItems,
      }
    } catch (error: any) {
      console.error(`Error in cascade delete for carrera ${id}:`, error)
      return {
        success: false,
        message: error.message,
      }
    }
  },

  async delete(id: number): Promise<void> {
    try {
      // Primero verificar si se puede eliminar sin dependencias
      const { canDelete, dependencies } = await this.checkDependencies(id)

      if (!canDelete) {
        const dependencyMessages = []
        if (dependencies.materias > 0) dependencyMessages.push(`${dependencies.materias} materias`)
        if (dependencies.grupos > 0) dependencyMessages.push(`${dependencies.grupos} grupos`)
        if (dependencies.horarios > 0) dependencyMessages.push(`${dependencies.horarios} horarios`)

        throw new Error(
          `No se puede eliminar la carrera porque tiene dependencias: ${dependencyMessages.join(", ")}. ` +
            "Use el método deleteWithDependencies() para eliminar en cascada.",
        )
      }

      // Si no hay dependencias, eliminar directamente
      const { error } = await supabase.from("carreras").delete().eq("id", id)

      if (error) throw new Error(error.message)

      console.log(`Carrera ${id} eliminada exitosamente`)
    } catch (error: any) {
      console.error(`Error deleting carrera with id ${id}:`, error)
      throw error
    }
  },

  async safeDelete(id: number): Promise<{
    success: boolean
    message: string
    dependencies?: {
      materias: number
      grupos: number
      horarios: number
    }
    details?: {
      materias: any[]
      grupos: any[]
    }
  }> {
    try {
      const { canDelete, dependencies, details } = await this.checkDependencies(id)

      if (!canDelete) {
        return {
          success: false,
          message: "No se puede eliminar la carrera porque tiene dependencias",
          dependencies,
          details,
        }
      }

      await this.delete(id)
      return {
        success: true,
        message: "Carrera eliminada exitosamente",
      }
    } catch (error: any) {
      return {
        success: false,
        message: error.message,
      }
    }
  },
}

// Mantener compatibilidad con el nombre anterior
export const carrerasService = carrerasServiceSupa

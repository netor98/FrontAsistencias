import { supabase } from "./supabaseConnection"
import type { Usuario } from "./interfaces"

export const usuariosService = {
  async getAll(): Promise<Usuario[]> {
    try {
      console.log("Fetching all usuarios from Supabase...")
      const { data, error } = await supabase.from("usuarios").select("*").order("id", { ascending: true })

      if (error) {
        console.error("Supabase error:", error)
        throw new Error(error.message)
      }

      console.log("Fetched usuarios:", data?.length || 0)
      return data as Usuario[]
    } catch (error: any) {
      console.error("Error fetching usuarios:", error)
      throw error
    }
  },

  async getById(id: number): Promise<Usuario | null> {
    try {
      const { data, error } = await supabase.from("usuarios").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          return null // No encontrado
        }
        throw new Error(error.message)
      }

      return data as Usuario
    } catch (error: any) {
      console.error(`Error fetching usuario with id ${id}:`, error)
      throw error
    }
  },

  async getByNumeroCuenta(numeroCuenta: string): Promise<Usuario | null> {
    try {
      console.log(`Searching for user with numero_cuenta: ${numeroCuenta}`)
      const { data, error } = await supabase.from("usuarios").select("*").eq("numero_cuenta", numeroCuenta).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Usuario no encontrado")
          return null // No encontrado
        }
        console.error("Error al buscar usuario por número de cuenta:", error.message)
        throw new Error(error.message)
      }

      console.log("Usuario encontrado:", data)
      return data as Usuario
    } catch (error: any) {
      console.error("Error inesperado al buscar usuario por número de cuenta:", error)
      throw error
    }
  },

  async create(usuario: Omit<Usuario, "id">): Promise<Usuario> {
    try {
      console.log("Creating usuario:", usuario)
      const { data, error } = await supabase.from("usuarios").insert(usuario).select().single()

      if (error) {
        console.error("Error creating usuario:", error)
        throw new Error(error.message)
      }

      console.log("Usuario created successfully:", data)
      return data as Usuario
    } catch (error: any) {
      console.error("Error creating usuario:", error)
      throw error
    }
  },

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    try {
      console.log(`Updating usuario ${id}:`, usuario)
      const { data, error } = await supabase.from("usuarios").update(usuario).eq("id", id).select().single()

      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("No se encontró el usuario para actualizar")
        }
        throw new Error(error.message)
      }

      console.log("Usuario updated successfully:", data)
      return data as Usuario
    } catch (error: any) {
      console.error(`Error updating usuario with id ${id}:`, error)
      throw error
    }
  },

  async delete(id: number): Promise<void> {
    try {
      console.log(`Deleting usuario with id ${id}`)
      const { error } = await supabase.from("usuarios").delete().eq("id", id)

      if (error) {
        console.error("Error deleting usuario:", error)
        throw new Error(error.message)
      }

      console.log(`Usuario ${id} deleted successfully`)
    } catch (error: any) {
      console.error(`Error deleting usuario with id ${id}:`, error)
      throw error
    }
  },

  async authenticate(numeroCuenta: string, password: string): Promise<Usuario | null> {
    try {
      console.log(`Authenticating user: ${numeroCuenta}`)
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("numero_cuenta", numeroCuenta)
        .eq("password", password)
        .single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log("Invalid credentials")
          return null // Credenciales inválidas
        }
        throw new Error(error.message)
      }

      console.log("User authenticated successfully")
      return data as Usuario
    } catch (error: any) {
      console.error("Error authenticating user:", error)
      throw error
    }
  },

  async changePassword(id: number, newPassword: string): Promise<void> {
    try {
      console.log(`Changing password for user ${id}`)
      const { error } = await supabase.from("usuarios").update({ password: newPassword }).eq("id", id)

      if (error) {
        throw new Error(error.message)
      }

      console.log("Password changed successfully")
    } catch (error: any) {
      console.error(`Error changing password for user ${id}:`, error)
      throw error
    }
  },
}

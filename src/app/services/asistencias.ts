import { supabase } from './supabaseConnection';
import { Asistencia } from './interfaces';


export const asistenciasService = {
  // Métodos para manejar asistencias de checador
  async getAsistenciasChecador(): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_checador')
      .select('*');

    if (error) {
      console.error('Error al obtener asistencias de checador:', error.message);
      return [];
    }
    return data as Asistencia[];
  },

  async getAsistenciaChecadorById(id: number): Promise<Asistencia | null> {
    const { data, error } = await supabase
      .from('asistencia_checador')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener la asistencia de checador:', error.message);
      return null;
    }
    return data as Asistencia;
  },

  async createAsistenciaChecador(horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
    const { data, error } = await supabase
      .from('asistencia_checador')
      .insert([{ horario_id, fecha, asistencia, id_user }])
      .select();

    if (error) {
      console.error('Error al crear la asistencia de checador:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No se pudo crear la asistencia de checador');
      return null;
    }

    return data[0] as Asistencia;
  },

  async updateAsistenciaChecador(id: number, horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
    const { data, error } = await supabase
      .from('asistencia_checador')
      .update({ horario_id, fecha, asistencia, id_user })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar la asistencia de checador:', error.message);
      return null;
    }

    // Verificar si data existe y tiene elementos
    if (!data || data.length === 0) {
      console.error('Asistencia de checador no actualizada');
      return null;
    }
    return data[0] as Asistencia;
  },

  async deleteAsistenciaChecador(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('asistencia_checador')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error al eliminar la asistencia de checador:', error.message);
      return false;
    }
  
    // Si no hay error, consideramos que la eliminación fue exitosa
    return true;
  },


  // Métodos para manejar asistencias de maestro
  async getAsistenciasMaestro(): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*');

    if (error) {
      console.error('Error al obtener asistencias de maestro:', error.message);
      return [];
    }
    return data as Asistencia[];
  },

  async getAsistenciaMaestroById(id: number): Promise<Asistencia | null> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error al obtener la asistencia de maestro:', error.message);
      return null;
    }
    return data as Asistencia;
  },

  async createAsistenciaMaestro(horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .insert([{ horario_id, fecha, asistencia, id_user }])
      .select();

    if (error) {
      console.error('Error al crear la asistencia de maestro:', error.message);
      return null;
    }

    if (!data || data.length === 0) {
      console.error('No se pudo crear la asistencia de maestro');
      return null;
    }

    return data[0] as Asistencia;
  },

  async updateAsistenciaMaestro(id: number, horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .update({ horario_id, fecha, asistencia, id_user })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Error al actualizar la asistencia de maestro:', error.message);
      return null;
    }

    // Verificar si data existe y tiene elementos
    if (!data || data.length === 0) {
      console.error('Asistencia de maestro no actualizada');
      return null;
    }
    return data[0] as Asistencia;
  },

  async deleteAsistenciaMaestro(id: number): Promise<boolean> {
    const { error } = await supabase
      .from('asistencia_maestro')
      .delete()
      .eq('id', id);
  
    if (error) {
      console.error('Error al eliminar la asistencia de maestro:', error.message);
      return false;
    }
  
    // Si no hay error, consideramos que la eliminación fue exitosa
    return true;
  },

  
  async getAsistenciasByMaestroAndDate(maestroId: number, fecha: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .eq('id_user', maestroId)
      .eq('fecha', fecha);

    if (error) {
      console.error('Error al obtener asistencias por maestro y fecha:', error.message);
      return [];
    }
    return data as Asistencia[];
  },

  // Método para buscar asistencias por horario y fecha
  async getAsistenciasByHorarioAndDate(horarioId: number, fecha: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .eq('horario_id', horarioId)
      .eq('fecha', fecha);

    if (error) {
      console.error('Error al obtener asistencias por horario y fecha:', error.message);
      return [];
    }
    return data as Asistencia[];
  },

  // Método para crear o actualizar una asistencia (upsert)
  async upsertAsistenciaMaestro(horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
    // Primero buscamos si ya existe una asistencia para este horario y fecha
    const existingAsistencias = await this.getAsistenciasByHorarioAndDate(horario_id, fecha);
    
    if (existingAsistencias.length > 0) {
      // Ya existe, actualizar
      return this.updateAsistenciaMaestro(
        existingAsistencias[0].id, 
        horario_id, 
        fecha, 
        asistencia, 
        id_user
      );
    } else {
      // No existe, crear nueva
      return this.createAsistenciaMaestro(
        horario_id, 
        fecha, 
        asistencia, 
        id_user
      );
    }
  },

  // Método para obtener todas las asistencias por rango de fechas
  async getAsistenciasByDateRange(startDate: string, endDate: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate);

    if (error) {
      console.error('Error al obtener asistencias por rango de fechas:', error.message);
      return [];
    }
    return data as Asistencia[];
  },

  // Método para obtener asistencias por maestro y rango de fechas
  async getAsistenciasByMaestroAndDateRange(maestroId: number, startDate: string, endDate: string): Promise<Asistencia[]> {
    const { data, error } = await supabase
      .from('asistencia_maestro')
      .select('*')
      .eq('id_user', maestroId)
      .gte('fecha', startDate)
      .lte('fecha', endDate);

    if (error) {
      console.error('Error al obtener asistencias por maestro y rango de fechas:', error.message);
      return [];
    }
    return data as Asistencia[];
  }

}

// // Obtener todas las asistencias de checador
// async function getAsistenciasChecador(): Promise<Asistencia[]> {
//   const { data, error } = await supabase
//     .from('asistencia_checador')
//     .select('*');

//   if (error) {
//     console.error('Error al obtener asistencias de checador:', error.message);
//     return [];
//   }
//   return data as Asistencia[];
// }

// // Obtener una asistencia de checador por ID
// async function getAsistenciaChecadorById(id: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_checador')
//     .select('*')
//     .eq('id', id)
//     .single();

//   if (error) {
//     console.error('Error al obtener la asistencia de checador:', error.message);
//     return null;
//   }
//   return data as Asistencia;
// }

// // Crear una nueva asistencia de checador
// async function createAsistenciaChecador(horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_checador')
//     .insert([{ horario_id, fecha, asistencia, id_user }]);

//   if (error) {
//     console.error('Error al crear la asistencia de checador:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo crear la asistencia de checador');
//     return null;
//   }


//   return data[0] as Asistencia;
// }

// // Actualizar una asistencia de checador por ID
// async function updateAsistenciaChecador(id: number, horario_id: number, fecha: string, asistencia: boolean, id_user: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_checador')
//     .update({ horario_id, fecha, asistencia, id_user })
//     .eq('id', id);

//   if (error) {
//     console.error('Error al actualizar la asistencia de checador:', error.message);
//     return null;
//   }

//     // Verificar si data es null
//     if (!data) {
//       console.error('Asistencia de checador no actualizada');
//       return null;
//     }
//   return data[0] as Asistencia;
// }

// // Eliminar una asistencia de checador por ID
// async function deleteAsistenciaChecador(id: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_checador')
//     .delete()
//     .eq('id', id);

//   if (error) {
//     console.error('Error al eliminar la asistencia de checador:', error.message);
//     return null;
//   }

//      // Verificar si data es null
//     if (!data) {
//       console.error('Asistencia de checador no eliminada');
//       return null;
//     }


//   return data[0] as Asistencia;
// }


// // Obtener todas las asistencias de maestro
// async function getAsistenciasMaestro(): Promise<Asistencia[]> {
//   const { data, error } = await supabase
//     .from('asistencia_maestro')
//     .select('*');

//   if (error) {
//     console.error('Error al obtener asistencias de maestro:', error.message);
//     return [];
//   }
//   return data as Asistencia[];
// }

// // Obtener una asistencia de maestro por ID
// async function getAsistenciaMaestroById(id: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_maestro')
//     .select('*')
//     .eq('id', id)
//     .single();

//   if (error) {
//     console.error('Error al obtener la asistencia de maestro:', error.message);
//     return null;
//   }
//   return data as Asistencia;
// }

// // Crear una nueva asistencia de maestro
// async function createAsistenciaMaestro(horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_maestro')
//     .insert([{ horario_id, fecha, asistencia }]);

//   if (error) {
//     console.error('Error al crear la asistencia de maestro:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo crear la asistencia de maestro');
//     return null;
//   }

//   return data[0] as Asistencia;
// }

// // Actualizar una asistencia de maestro por ID
// async function updateAsistenciaMaestro(id: number, horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_maestro')
//     .update({ horario_id, fecha, asistencia })
//     .eq('id', id);

//   if (error) {
//     console.error('Error al actualizar la asistencia de maestro:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo actualizar la asistencia de maestro');
//     return null;
//   }

//   return data[0] as Asistencia;
// }

// // Eliminar una asistencia de maestro por ID
// async function deleteAsistenciaMaestro(id: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistencia_maestro')
//     .delete()
//     .eq('id', id);

//   if (error) {
//     console.error('Error al eliminar la asistencia de maestro:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo eliminar la asistencia de maestro');
//     return null;
//   }

//   return data[0] as Asistencia;
// }


// // Obtener todas las asistencias de jefe
// async function getAsistenciasJefe(): Promise<Asistencia[]> {
//   const { data, error } = await supabase
//     .from('asistecia_jefe')
//     .select('*');

//   if (error) {
//     console.error('Error al obtener asistencias de jefe:', error.message);
//     return [];
//   }
//   return data as Asistencia[];
// }

// // Obtener una asistencia de jefe por ID
// async function getAsistenciaJefeById(id: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistecia_jefe')
//     .select('*')
//     .eq('id', id)
//     .single();

//   if (error) {
//     console.error('Error al obtener la asistencia de jefe:', error.message);
//     return null;
//   }
//   return data as Asistencia;
// }

// // Crear una nueva asistencia de jefe
// async function createAsistenciaJefe(horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistecia_jefe')
//     .insert([{ horario_id, fecha, asistencia }]);

//   if (error) {
//     console.error('Error al crear la asistencia de jefe:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo crear la asistencia de jefe');
//     return null;
//   }

//   return data[0] as Asistencia;
// }

// // Actualizar una asistencia de jefe por ID
// async function updateAsistenciaJefe(id: number, horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistecia_jefe')
//     .update({ horario_id, fecha, asistencia })
//     .eq('id', id);

//   if (error) {
//     console.error('Error al actualizar la asistencia de jefe:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo actualizar la asistencia de jefe');
//     return null;
//   }


//   return data[0] as Asistencia;
// }

// // Eliminar una asistencia de jefe por ID
// async function deleteAsistenciaJefe(id: number): Promise<Asistencia | null> {
//   const { data, error } = await supabase
//     .from('asistecia_jefe')
//     .delete()
//     .eq('id', id);

//   if (error) {
//     console.error('Error al eliminar la asistencia de jefe:', error.message);
//     return null;
//   }

//   if (!data) {
//     console.error('No se pudo eliminar la asistencia de jefe');
//     return null;
//   }

//   return data[0] as Asistencia;
// }
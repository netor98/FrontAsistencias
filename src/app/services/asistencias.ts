import { supabase } from './supabaseConnection';
import { Asistencia } from './interfaces';

export {
  getAsistenciasChecador,
  getAsistenciaChecadorById,
  createAsistenciaChecador,
  updateAsistenciaChecador,
  deleteAsistenciaChecador,
  getAsistenciasMaestro,
  getAsistenciaMaestroById,
  createAsistenciaMaestro,
  updateAsistenciaMaestro,
  deleteAsistenciaMaestro,
  getAsistenciasJefe,
  getAsistenciaJefeById,
  createAsistenciaJefe,
  updateAsistenciaJefe,
  deleteAsistenciaJefe,
  getAsistenciasByDateRange
};

// New method to get asistencias within a date range
async function getAsistenciasByDateRange(
  startDate: string, 
  endDate: string, 
  materiaId?: number | null, 
  grupoId?: number | null,
  horarioId?: number | null
): Promise<{
  checador: Asistencia[], 
  maestro: Asistencia[], 
  jefe: Asistencia[]
}> {
  try {
    // Base query for each table
    let checadorQuery = supabase
      .from('asistencia_checador')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate);
      
    let maestroQuery = supabase
      .from('asistencia_maestro')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate);
      
    let jefeQuery = supabase
      .from('asistencia_jefe')
      .select('*')
      .gte('fecha', startDate)
      .lte('fecha', endDate);
    
    // If horarioId is provided, filter directly by that
    if (horarioId) {
      checadorQuery = checadorQuery.eq('horario_id', horarioId);
      maestroQuery = maestroQuery.eq('horario_id', horarioId);
      jefeQuery = jefeQuery.eq('horario_id', horarioId);
    }
    // If materiaId or grupoId are provided, we need to join with horario to filter
    else if (materiaId || grupoId) {
      // First get the matching horario_ids
      let horarioQuery = supabase
        .from('horario-maestro')
        .select('id');
      
      if (materiaId) {
        horarioQuery = horarioQuery.eq('materia_id', materiaId);
      }
      
      if (grupoId) {
        horarioQuery = horarioQuery.eq('grupo_id', grupoId);
      }
      
      const { data: horarioData, error: horarioError } = await horarioQuery;
      
      if (horarioError) {
        console.error('Error al obtener horarios:', horarioError.message);
        return { checador: [], maestro: [], jefe: [] };
      }
      
      if (horarioData && horarioData.length > 0) {
        const horarioIds = horarioData.map(h => h.id);
        
        // Add horario_id filter to each query
        checadorQuery = checadorQuery.in('horario_id', horarioIds);
        maestroQuery = maestroQuery.in('horario_id', horarioIds);
        jefeQuery = jefeQuery.in('horario_id', horarioIds);
        console.log('horarioIds', horarioIds);
        console.log('checadorQuery', checadorQuery);
        console.log('maestroQuery', maestroQuery);
        console.log('jefeQuery', jefeQuery);
      } else {
        // No matching horarios, return empty results
        return { checador: [], maestro: [], jefe: [] };
      }
    }
    
    // Execute all three queries in parallel
    const [checadorResult, maestroResult, jefeResult] = await Promise.all([
      checadorQuery,
      maestroQuery,
      jefeQuery
    ]);
    
    const { data: checadorData, error: checadorError } = checadorResult;
    const { data: maestroData, error: maestroError } = maestroResult;
    const { data: jefeData, error: jefeError } = jefeResult;
    
    if (checadorError) {
      console.error('Error al obtener asistencias de checador:', checadorError.message);
    }
    
    if (maestroError) {
      console.error('Error al obtener asistencias de maestro:', maestroError.message);
    }
    
    if (jefeError) {
      console.error('Error al obtener asistencias de jefe:', jefeError.message);
    }
    console.log('jefeData', jefeData);
    console.log('maestroData', maestroData);
    console.log('checadorData', checadorData);
    return {
      checador: checadorData || [],
      maestro: maestroData || [],
      jefe: jefeData || []
    };
    
  } catch (error: any) {
    console.error('Error general al obtener asistencias:', error.message);
    return { checador: [], maestro: [], jefe: [] };
  }
}

// Obtener todas las asistencias de checador
async function getAsistenciasChecador(): Promise<Asistencia[]> {
  const { data, error } = await supabase
    .from('asistencia_checador')
    .select('*');

  if (error) {
    console.error('Error al obtener asistencias de checador:', error.message);
    return [];
  }
  return data as Asistencia[];
}

// Obtener una asistencia de checador por ID
async function getAsistenciaChecadorById(id: number): Promise<Asistencia | null> {
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
}

// Crear una nueva asistencia de checador
async function createAsistenciaChecador(horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_checador')
    .insert([{ horario_id, fecha, asistencia }]);

  if (error) {
    console.error('Error al crear la asistencia de checador:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo crear la asistencia de checador');
    return null;
  }


  return data[0] as Asistencia;
}

// Actualizar una asistencia de checador por ID
async function updateAsistenciaChecador(id: number, horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_checador')
    .update({ horario_id, fecha, asistencia })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar la asistencia de checador:', error.message);
    return null;
  }

    // Verificar si data es null
    if (!data) {
      console.error('Asistencia de checador no actualizada');
      return null;
    }
  return data[0] as Asistencia;
}

// Eliminar una asistencia de checador por ID
async function deleteAsistenciaChecador(id: number): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_checador')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar la asistencia de checador:', error.message);
    return null;
  }

     // Verificar si data es null
    if (!data) {
      console.error('Asistencia de checador no eliminada');
      return null;
    }


  return data[0] as Asistencia;
}


// Obtener todas las asistencias de maestro
async function getAsistenciasMaestro(): Promise<Asistencia[]> {
  const { data, error } = await supabase
    .from('asistencia_maestro')
    .select('*');

  if (error) {
    console.error('Error al obtener asistencias de maestro:', error.message);
    return [];
  }
  return data as Asistencia[];
}

// Obtener una asistencia de maestro por ID
async function getAsistenciaMaestroById(id: number): Promise<Asistencia | null> {
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
}

// Crear una nueva asistencia de maestro
async function createAsistenciaMaestro(horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_maestro')
    .insert([{ horario_id, fecha, asistencia }]);

  if (error) {
    console.error('Error al crear la asistencia de maestro:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo crear la asistencia de maestro');
    return null;
  }

  return data[0] as Asistencia;
}

// Actualizar una asistencia de maestro por ID
async function updateAsistenciaMaestro(id: number, horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_maestro')
    .update({ horario_id, fecha, asistencia })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar la asistencia de maestro:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo actualizar la asistencia de maestro');
    return null;
  }

  return data[0] as Asistencia;
}

// Eliminar una asistencia de maestro por ID
async function deleteAsistenciaMaestro(id: number): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_maestro')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar la asistencia de maestro:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo eliminar la asistencia de maestro');
    return null;
  }

  return data[0] as Asistencia;
}


// Obtener todas las asistencias de jefe
async function getAsistenciasJefe(): Promise<Asistencia[]> {
  const { data, error } = await supabase
    .from('asistencia_jefe')
    .select('*');

  if (error) {
    console.error('Error al obtener asistencias de jefe:', error.message);
    return [];
  }
  return data as Asistencia[];
}

// Obtener una asistencia de jefe por ID
async function getAsistenciaJefeById(id: number): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_jefe')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error al obtener la asistencia de jefe:', error.message);
    return null;
  }
  return data as Asistencia;
}

// Crear una nueva asistencia de jefe
async function createAsistenciaJefe(horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_jefe')
    .insert([{ horario_id, fecha, asistencia }]);

  if (error) {
    console.error('Error al crear la asistencia de jefe:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo crear la asistencia de jefe');
    return null;
  }

  return data[0] as Asistencia;
}

// Actualizar una asistencia de jefe por ID
async function updateAsistenciaJefe(id: number, horario_id: number, fecha: string, asistencia: string): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_jefe')
    .update({ horario_id, fecha, asistencia })
    .eq('id', id);

  if (error) {
    console.error('Error al actualizar la asistencia de jefe:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo actualizar la asistencia de jefe');
    return null;
  }


  return data[0] as Asistencia;
}

// Eliminar una asistencia de jefe por ID
async function deleteAsistenciaJefe(id: number): Promise<Asistencia | null> {
  const { data, error } = await supabase
    .from('asistencia_jefe')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error al eliminar la asistencia de jefe:', error.message);
    return null;
  }

  if (!data) {
    console.error('No se pudo eliminar la asistencia de jefe');
    return null;
  }

  return data[0] as Asistencia;
}
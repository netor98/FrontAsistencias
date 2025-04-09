import { supabase } from './supabaseConnection';
import { Asistencia } from './interfaces';



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
    .from('asistecia_jefe')
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
    .from('asistecia_jefe')
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
    .from('asistecia_jefe')
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
    .from('asistecia_jefe')
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
    .from('asistecia_jefe')
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
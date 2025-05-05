import { supabase } from './supabaseConnection';
import { HorarioMaestro, Grupo } from './interfaces';

export interface HorarioCompleto {
  id: number;
  dia: string;
  hora_inicio: string;
  hora_fin: string;
  maestro: {
    id: number;
    name: string;
  };
  materia: {
    id: number;
    name: string;
  };
  grupo: {
    id: number;
    name: string;
  };
  aula: {
    id: number;
    name: string;
  };
  carrera: {
    id: number;
    nombre: string;
  };
}

export const horariosService = {
  async getAll(): Promise<HorarioMaestro[]> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*');

    if (error) throw new Error(error.message);
    return data as HorarioMaestro[];
  },

  async getById(id: number): Promise<HorarioMaestro | null> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  },

  async getHorariosConGrupo(maestroId?: number): Promise<HorarioCompleto[]> {
    let query = supabase
      .from('horario-maestro')
      .select(`
        id,
        dia,
        hora_inicio,
        hora_fin,
        maestro:maestro_id(id, name),
        materia:materia_id(id, name),
        grupo:grupo_id(
          id, 
          name,
          carrera:carrera_id(id, nombre),
          aula:aula_id(id, name)
        )
      `);
    
    // Aplicar filtro por maestro si se proporciona
    if (maestroId !== undefined) {
      query = query.eq('maestro_id', maestroId);
    }
    
    const { data, error } = await query;
  
    if (error) throw new Error(`Error al obtener horarios: ${error.message}`);
    
    // Transformar los resultados al formato esperado - corrigiendo estructura
    const horarios: HorarioCompleto[] = data.map(item => {
      // Asegurarnos de que maestro sea un objeto y no un array
      const maestroData = Array.isArray(item.maestro) ? item.maestro[0] : item.maestro;
      // Asegurarnos de que materia sea un objeto y no un array
      const materiaData = Array.isArray(item.materia) ? item.materia[0] : item.materia;
      // Asegurarnos de que grupo sea un objeto y no un array
      const grupoData = Array.isArray(item.grupo) ? item.grupo[0] : item.grupo;
      
      // Manejar los casos en que carrera y aula puedan ser arrays o no existir
      const aulaData = grupoData?.aula ? 
        (Array.isArray(grupoData.aula) ? grupoData.aula[0] : grupoData.aula) : 
        { id: 0, name: '' };
        
      const carreraData = grupoData?.carrera ?
        (Array.isArray(grupoData.carrera) ? grupoData.carrera[0] : grupoData.carrera) :
        { id: 0, nombre: '' };
      
      return {
        id: item.id,
        dia: item.dia,
        hora_inicio: item.hora_inicio,
        hora_fin: item.hora_fin,
        maestro: {
          id: maestroData?.id || 0,
          name: maestroData?.name || ''
        },
        materia: {
          id: materiaData?.id || 0,
          name: materiaData?.name || ''
        },
        grupo: {
          id: grupoData?.id || 0,
          name: grupoData?.name || ''
        },
        aula: {
          id: aulaData?.id || 0,
          name: aulaData?.name || ''
        },
        carrera: {
          id: carreraData?.id || 0,
          nombre: carreraData?.nombre || ''
        }
      };
    });
    
    return horarios;
  },
  
  // Actualizar el método de horario completo por ID con los mismos ajustes
  async getHorarioCompletoById(id: number): Promise<HorarioCompleto | null> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select(`
        id,
        dia,
        hora_inicio,
        hora_fin,
        maestro:maestro_id(id, name),
        materia:materia_id(id, name),
        grupo:grupo_id(
          id, 
          name,
          carrera:carrera_id(id, nombre),
          aula:aula_id(id, name)
        )
      `)
      .eq('id', id)
      .single();
  
    if (error) throw new Error(`Error al obtener horario: ${error.message}`);
    
    if (!data) return null;
    
    // Asegurarnos de que maestro sea un objeto y no un array
    const maestroData = Array.isArray(data.maestro) ? data.maestro[0] : data.maestro;
    // Asegurarnos de que materia sea un objeto y no un array
    const materiaData = Array.isArray(data.materia) ? data.materia[0] : data.materia;
    // Asegurarnos de que grupo sea un objeto y no un array
    const grupoData = Array.isArray(data.grupo) ? data.grupo[0] : data.grupo;
    
    // Manejar los casos en que carrera y aula puedan ser arrays o no existir
    const aulaData = grupoData?.aula ? 
      (Array.isArray(grupoData.aula) ? grupoData.aula[0] : grupoData.aula) : 
      { id: 0, name: '' };
      
    const carreraData = grupoData?.carrera ?
      (Array.isArray(grupoData.carrera) ? grupoData.carrera[0] : grupoData.carrera) :
      { id: 0, nombre: '' };
    
    const horario: HorarioCompleto = {
      id: data.id,
      dia: data.dia,
      hora_inicio: data.hora_inicio,
      hora_fin: data.hora_fin,
      maestro: {
        id: maestroData?.id || 0,
        name: maestroData?.name || ''
      },
      materia: {
        id: materiaData?.id || 0,
        name: materiaData?.name || ''
      },
      grupo: {
        id: grupoData?.id || 0,
        name: grupoData?.name || ''
      },
      aula: {
        id: aulaData?.id || 0,
        name: aulaData?.name || ''
      },
      carrera: {
        id: carreraData?.id || 0,
        nombre: carreraData?.nombre || ''
      }
    };
    
    return horario;
  },

  async getByMaestro(maestroId: number): Promise<HorarioMaestro[]> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*')
      .eq('maestro_id', maestroId);

    if (error) throw new Error(error.message);
    return data as HorarioMaestro[];
  },

  async getByGrupo(grupoId: number): Promise<HorarioMaestro[]> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .select('*')
      .eq('grupo_id', grupoId);

    if (error) throw new Error(error.message);
    return data as HorarioMaestro[];
  },

  async create(horario: HorarioMaestro): Promise<HorarioMaestro> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .insert(horario)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  },

  async update(id: number, horario: Partial<HorarioMaestro>): Promise<HorarioMaestro> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .update(horario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('horario-maestro')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async registrarAsistencia(id: number, asistio: boolean): Promise<HorarioMaestro> {
    const { data, error } = await supabase
      .from('horario-maestro')
      .update({ asistencia: asistio })
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as HorarioMaestro;
  }
};
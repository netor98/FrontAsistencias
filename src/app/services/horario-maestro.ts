import { supabase } from './supabaseConnection';
import { HorarioMaestro, Grupo } from './interfaces';


export const horariosService = {
  // async getAll(): Promise<HorarioMaestro[]> {
  //   const { data, error } = await supabase
  //     .from('horario-maestro')
  //     .select('*');

  //   if (error) throw new Error(error.message);
  //   return data as HorarioMaestro[];
  // },
  async getAll(): Promise<any[]> {
    // Primero obtenemos los horarios básicos
    const { data: horarios, error } = await supabase
      .from('horario-maestro')
      .select(`
        *,
        maestro:maestro_id(id, name, email),
        materias:materia_id(id, name),
        grupo:grupo_id(id, name)
      `);
  
    if (error) throw new Error(error.message);
    
    // Si no hay horarios, retornamos un array vacío
    if (!horarios || horarios.length === 0) {
      return [];
    }
    
    // Obtenemos los grupos para conseguir aula_id y carrera_id
    const grupoIds = [...new Set(horarios.map(h => h.grupo_id).filter(Boolean))];
    
    if (grupoIds.length > 0) {
      const { data: grupos, error: gruposError } = await supabase
        .from('grupo')
        .select('id, aula_id, carrera_id')
        .in('id', grupoIds);
        
      if (gruposError) throw new Error(gruposError.message);
      
      if (grupos && grupos.length > 0) {
        // Creamos mapas para buscar rápidamente
        const gruposMap = Object.fromEntries(grupos.map(g => [g.id, g]));
        
        // Obtenemos aulas
        const aulaIds = [...new Set(grupos.map(g => g.aula_id).filter(Boolean))];
        if (aulaIds.length > 0) {
          const { data: aulas, error: aulasError } = await supabase
            .from('aulas')
            .select('id, aula')
            .in('id', aulaIds);
            
          if (aulasError) throw new Error(aulasError.message);
          
          if (aulas && aulas.length > 0) {
            const aulasMap = Object.fromEntries(aulas.map(a => [a.id, a]));
            
            // Asignamos aulas a los horarios
            horarios.forEach(horario => {
              const grupo = gruposMap[horario.grupo_id];
              if (grupo && grupo.aula_id) {
                horario.aulas = aulasMap[grupo.aula_id];
              }
            });
          }
        }
        
        // Obtenemos carreras
        const carreraIds = [...new Set(grupos.map(g => g.carrera_id).filter(Boolean))];
        if (carreraIds.length > 0) {
          const { data: carreras, error: carrerasError } = await supabase
            .from('carreras')
            .select('id, nombre')
            .in('id', carreraIds);
            
          if (carrerasError) throw new Error(carrerasError.message);
          
          if (carreras && carreras.length > 0) {
            const carrerasMap = Object.fromEntries(carreras.map(c => [c.id, c]));
            
            // Asignamos carreras a los horarios
            horarios.forEach(horario => {
              const grupo = gruposMap[horario.grupo_id];
              if (grupo && grupo.carrera_id) {
                horario.carreras = carrerasMap[grupo.carrera_id];
              }
            });
          }
        }
      }
    }
    
    return horarios;
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


  async getByMaestro(maestroId: number): Promise<any[]> {
    // Primero obtenemos los horarios básicos filtrados por maestro_id
    const { data: horarios, error } = await supabase
      .from('horario-maestro')
      .select(`
        *,
        maestro:maestro_id(id, name, email),
        materias:materia_id(id, name),
        grupo:grupo_id(id, name)
      `)
      .eq('maestro_id', maestroId); // Filtro por ID de maestro
    
    if (error) throw new Error(error.message);
    
    // Si no hay horarios, retornamos un array vacío
    if (!horarios || horarios.length === 0) {
      return [];
    }
    
    // Obtenemos los grupos para conseguir aula_id y carrera_id
    const grupoIds = [...new Set(horarios.map(h => h.grupo_id).filter(Boolean))];
    
    if (grupoIds.length > 0) {
      const { data: grupos, error: gruposError } = await supabase
        .from('grupo')
        .select('id, aula_id, carrera_id')
        .in('id', grupoIds);
        
      if (gruposError) throw new Error(gruposError.message);
      
      if (grupos && grupos.length > 0) {
        // Creamos mapas para buscar rápidamente
        const gruposMap = Object.fromEntries(grupos.map(g => [g.id, g]));
        
        // Obtenemos aulas
        const aulaIds = [...new Set(grupos.map(g => g.aula_id).filter(Boolean))];
        if (aulaIds.length > 0) {
          const { data: aulas, error: aulasError } = await supabase
            .from('aulas')
            .select('id, aula')
            .in('id', aulaIds);
            
          if (aulasError) throw new Error(aulasError.message);
          
          if (aulas && aulas.length > 0) {
            const aulasMap = Object.fromEntries(aulas.map(a => [a.id, a]));
            
            // Asignamos aulas a los horarios
            horarios.forEach(horario => {
              const grupo = gruposMap[horario.grupo_id];
              if (grupo && grupo.aula_id) {
                horario.aulas = aulasMap[grupo.aula_id];
              }
            });
          }
        }
        
        // Obtenemos carreras
        const carreraIds = [...new Set(grupos.map(g => g.carrera_id).filter(Boolean))];
        if (carreraIds.length > 0) {
          const { data: carreras, error: carrerasError } = await supabase
            .from('carreras')
            .select('id, nombre')
            .in('id', carreraIds);
            
          if (carrerasError) throw new Error(carrerasError.message);
          
          if (carreras && carreras.length > 0) {
            const carrerasMap = Object.fromEntries(carreras.map(c => [c.id, c]));
            
            // Asignamos carreras a los horarios
            horarios.forEach(horario => {
              const grupo = gruposMap[horario.grupo_id];
              if (grupo && grupo.carrera_id) {
                horario.carreras = carrerasMap[grupo.carrera_id];
              }
            });
          }
        }
      }
    }
    
    return horarios;
  },

  async getByGrupo(grupoId: number): Promise<any[]> {
    // Primero obtenemos los horarios básicos filtrados por grupo_id
    const { data: horarios, error } = await supabase
      .from('horario-maestro')
      .select(`
        *,
        maestro:maestro_id(id, name, email),
        materias:materia_id(id, name),
        grupo:grupo_id(id, name)
      `)
      .eq('grupo_id', grupoId); // Filtro por ID de grupo
    
    if (error) throw new Error(error.message);
    
    // Si no hay horarios, retornamos un array vacío
    if (!horarios || horarios.length === 0) {
      return [];
    }
    
    // Obtenemos los datos del grupo para conseguir aula_id y carrera_id
    const { data: grupo, error: grupoError } = await supabase
      .from('grupo')
      .select('id, aula_id, carrera_id')
      .eq('id', grupoId)
      .single();
      
    if (grupoError) throw new Error(grupoError.message);
    
    if (grupo) {
      // Creamos el mapa para buscar rápidamente
      const gruposMap = { [grupo.id]: grupo };
      
      // Obtenemos aulas si el grupo tiene aula_id
      if (grupo.aula_id) {
        const { data: aula, error: aulaError } = await supabase
          .from('aulas')
          .select('id, aula')
          .eq('id', grupo.aula_id)
          .single();
          
        if (aulaError) throw new Error(aulaError.message);
        
        if (aula) {
          const aulasMap = { [aula.id]: aula };
          
          // Asignamos aulas a los horarios
          horarios.forEach(horario => {
            horario.aulas = aula;
          });
        }
      }
      
      // Obtenemos carrera si el grupo tiene carrera_id
      if (grupo.carrera_id) {
        const { data: carrera, error: carreraError } = await supabase
          .from('carreras')
          .select('id, nombre')
          .eq('id', grupo.carrera_id)
          .single();
          
        if (carreraError) throw new Error(carreraError.message);
        
        if (carrera) {
          // Asignamos carrera a los horarios
          horarios.forEach(horario => {
            horario.carreras = carrera;
          });
        }
      }
    }
    
    return horarios;
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
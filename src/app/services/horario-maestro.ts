import { supabase } from './supabaseConnection';
import { HorarioMaestro, Grupo } from './interfaces';


export const horariosService = {
  async getAll(): Promise<HorarioMaestro[]> {
    try {
      console.log('Fetching all horarios...');
      const { data, error } = await supabase
        .from('horario-maestro')
        .select('*')
        .order('dia', { ascending: true });

      if (error) throw new Error(error.message);
      console.log(`Fetched ${data?.length || 0} horarios.`);
      return data as HorarioMaestro[];
    } catch (error: any) {
      console.error('Error fetching horarios:', error);
      throw error;
    }
  },

  async getAll2(): Promise<any[]> {
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
    try {
      console.log(`Fetching horario with id ${id}...`);
      const { data, error } = await supabase
        .from('horario-maestro')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      console.log('Fetched horario:', data);
      return data as HorarioMaestro;
    } catch (error: any) {
      console.error(`Error fetching horario with id ${id}:`, error);
      throw error;
    }
  },

  async getByMaestro(maestroId: number): Promise<HorarioMaestro[]> {
    try {
      console.log(`Fetching horarios for maestro with id ${maestroId}...`);
      const { data, error } = await supabase
        .from('horario-maestro')
        .select('*')
        .eq('maestro_id', maestroId)
        .order('dia', { ascending: true });

      if (error) throw new Error(error.message);
      console.log(`Fetched ${data?.length || 0} horarios for maestro ${maestroId}.`);
      return data as HorarioMaestro[];
    } catch (error: any) {
      console.error(`Error fetching horarios for maestro ${maestroId}:`, error);
      throw error;
    }
  },

  async getByGrupo(grupoId: number): Promise<HorarioMaestro[]> {
    try {
      console.log(`Fetching horarios for grupo with id ${grupoId}...`);
      const { data, error } = await supabase
        .from('horario-maestro')
        .select('*')
        .eq('grupo_id', grupoId)
        .order('dia', { ascending: true });

      if (error) throw new Error(error.message);
      console.log(`Fetched ${data?.length || 0} horarios for grupo ${grupoId}.`);
      return data as HorarioMaestro[];
    } catch (error: any) {
      console.error(`Error fetching horarios for grupo ${grupoId}:`, error);
      throw error;
    }
  },

  async getByMaestro2(maestroId: number): Promise<any[]> {
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

  async getByJefeNoCuenta(numeroCuenta: string): Promise<Grupo | null> {
    const { data, error } = await supabase
      .from('grupo')
      .select('*')
      .eq('jefe_nocuenta', numeroCuenta)
      .single();

    if (error) {
      console.error('Error obteniendo grupo por jefe:', error.message);
      return null;
    }
    return data as Grupo;
  },

  async getByGrupo2(grupoId: number): Promise<any[]> {
    // Primero obtenemos los horarios básicos filtrados por grupo_id
    const { data: horarios, error } = await supabase
      .from('horario-maestro')
      .select(`
        *,
        maestro:maestro_id(id, name, email),
        materias:materia_id(id, name),
        grupo:grupo_id(id, name)
      `)
      .eq('grupo_id', grupoId) // Filtro por ID de grupo
      .order('dia', { ascending: true });

    if (error) throw new Error(error.message);

    // Si no hay horarios, retornamos un array vacío
    if (!horarios || horarios.length === 0) {
      return [];
    }

    // Obtenemos el grupo para conseguir aula_id y carrera_id
    const { data: grupo, error: grupoError } = await supabase
      .from('grupo')
      .select('id, aula_id, carrera_id')
      .eq('id', grupoId)
      .single();

    if (grupoError) {
      console.error(`Error al obtener grupo ${grupoId}:`, grupoError);
    }

    if (grupo) {
      // Obtenemos el aula
      if (grupo.aula_id) {
        const { data: aula, error: aulaError } = await supabase
          .from('aulas')
          .select('id, aula')
          .eq('id', grupo.aula_id)
          .single();

        if (aulaError) {
          console.error(`Error al obtener aula ${grupo.aula_id}:`, aulaError);
        }

        if (aula) {
          // Asignamos aula a todos los horarios
          horarios.forEach(horario => {
            horario.aulas = aula;
          });
        }
      }

      // Obtenemos la carrera
      if (grupo.carrera_id) {
        const { data: carrera, error: carreraError } = await supabase
          .from('carreras')
          .select('id, nombre')
          .eq('id', grupo.carrera_id)
          .single();

        if (carreraError) {
          console.error(`Error al obtener carrera ${grupo.carrera_id}:`, carreraError);
        }

        if (carrera) {
          // Asignamos carrera a todos los horarios
          horarios.forEach(horario => {
            horario.carreras = carrera;
          });
        }
      }
    }

    console.log(`Fetched ${horarios.length} horarios for grupo ${grupoId} with complete relations.`);
    return horarios;
  },

  async create(horario: HorarioMaestro): Promise<HorarioMaestro> {
    try {
      // Remove id to let the database generate it
      const { id, ...horarioData } = horario;
      
      console.log('Creating horario with data:', horarioData);
      const { data, error } = await supabase
        .from('horario-maestro')
        .insert(horarioData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('Created horario:', data);
      return data as HorarioMaestro;
    } catch (error: any) {
      console.error('Error creating horario:', error);
      throw error;
    }
  },

  async update(id: number, horario: Partial<HorarioMaestro>): Promise<HorarioMaestro> {
    try {
      // Remove id from the update data
      const { id: _, ...horarioData } = horario;
      
      console.log(`Updating horario ${id} with data:`, horarioData);
      const { data, error } = await supabase
        .from('horario-maestro')
        .update(horarioData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('Updated horario:', data);
      return data as HorarioMaestro;
    } catch (error: any) {
      console.error(`Error updating horario with id ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      console.log(`Deleting horario with id ${id}`);
      const { error } = await supabase
        .from('horario-maestro')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      console.log(`Deleted horario with id ${id}`);
    } catch (error: any) {
      console.error(`Error deleting horario with id ${id}:`, error);
      throw error;
    }
  },

  async registrarAsistencia(id: number, asistio: boolean): Promise<HorarioMaestro> {
    try {
      console.log(`Registrando asistencia para horario ${id}: ${asistio ? 'Asistió' : 'No asistió'}`);
      const { data, error } = await supabase
        .from('horario-maestro')
        .update({ asistencia: asistio })
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('Asistencia registrada:', data);
      return data as HorarioMaestro;
    } catch (error: any) {
      console.error(`Error registrando asistencia para horario ${id}:`, error);
      throw error;
    }
  }
};
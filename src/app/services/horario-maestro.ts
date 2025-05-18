import { supabase } from './supabaseConnection';
import { HorarioMaestro } from './interfaces';

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
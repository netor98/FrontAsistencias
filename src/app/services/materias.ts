import { supabase } from './supabaseConnection';
import { Materia } from './interfaces';


export const materiasService = {
  async getAll(): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*');

    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getBySemestre(semestre: number): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('semestre', semestre);

    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getByCarrera(carreraId: number): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('carrera_id', carreraId);

    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getBySemestreAndCarrera(semestre: number, carreraId: number): Promise<Materia[]> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('semestre', semestre)
      .eq('carrera_id', carreraId);

    if (error) throw new Error(error.message);
    return data as Materia[];
  },

  async getById(id: number): Promise<Materia | null> {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Materia;
  },

  async create(materia: Materia): Promise<Materia> {
    const { data, error } = await supabase
      .from('materias')
      .insert(materia)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Materia;
  },

  async update(id: number, materia: Partial<Materia>): Promise<Materia> {
    const { data, error } = await supabase
      .from('materias')
      .update(materia)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Materia;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};
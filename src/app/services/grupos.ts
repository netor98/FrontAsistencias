import { supabase } from './supabaseConnection';
import { Grupo } from './interfaces';


export const gruposService = {
  async getAll(): Promise<Grupo[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('*');

    if (error) throw new Error(error.message);
    return data as Grupo[];
  },

  async getById(id: number): Promise<Grupo | null> {
    const { data, error } = await supabase
      .from('grupo')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async create(grupo: Grupo): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupo')
      .insert(grupo)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async update(id: number, grupo: Partial<Grupo>): Promise<Grupo> {
    const { data, error } = await supabase
      .from('grupo')
      .update(grupo)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Grupo;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('grupo')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  },

  async getClassrooms(): Promise<string[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('classroom');

    if (error) throw new Error(error.message);

    // Obtener valores únicos
    const classrooms = data.map(item => item.classroom);
    return [...new Set(classrooms)];
  },

  async getBuildings(): Promise<string[]> {
    const { data, error } = await supabase
      .from('grupo')
      .select('building');

    if (error) throw new Error(error.message);

    // Obtener valores únicos
    const buildings = data.map(item => item.building);
    return [...new Set(buildings)];
  }
};
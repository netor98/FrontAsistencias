import { supabase } from './supabaseConnection';
import { Grupo } from './interfaces';


export const gruposService = {
  async getAll(): Promise<Grupo[]> {
    try {
      console.log('Fetching all grupos...');
      const { data, error } = await supabase
        .from('grupo')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw new Error(error.message);
      console.log('Fetched grupos:', data);
      return data as Grupo[];
    } catch (error: any) {
      console.error('Error fetching grupos:', error);
      throw error;
    }
  },

  async getById(id: number): Promise<Grupo | null> {
    try {
      const { data, error } = await supabase
        .from('grupo')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw new Error(error.message);
      return data as Grupo;
    } catch (error: any) {
      console.error(`Error fetching grupo with id ${id}:`, error);
      throw error;
    }
  },

  async create(grupo: Grupo): Promise<Grupo> {
    try {
      // Remove id to let the database generate it
      const { id, ...grupoData } = grupo;
      
      console.log('Creating grupo with data:', grupoData);
      const { data, error } = await supabase
        .from('grupo')
        .insert(grupoData)
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('Created grupo:', data);
      return data as Grupo;
    } catch (error: any) {
      console.error('Error creating grupo:', error);
      throw error;
    }
  },

  async update(id: number, grupo: Partial<Grupo>): Promise<Grupo> {
    try {
      // Remove id from the update data
      const { id: _, ...grupoData } = grupo;
      
      console.log(`Updating grupo ${id} with data:`, grupoData);
      const { data, error } = await supabase
        .from('grupo')
        .update(grupoData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      console.log('Updated grupo:', data);
      return data as Grupo;
    } catch (error: any) {
      console.error(`Error updating grupo with id ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number): Promise<void> {
    try {
      console.log(`Deleting grupo with id ${id}`);
      const { error } = await supabase
        .from('grupo')
        .delete()
        .eq('id', id);

      if (error) throw new Error(error.message);
      console.log(`Deleted grupo with id ${id}`);
    } catch (error: any) {
      console.error(`Error deleting grupo with id ${id}:`, error);
      throw error;
    }
  },

  async getClassrooms(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('grupo')
        .select('classroom');

      if (error) throw new Error(error.message);

      // Get unique values
      const classrooms = data.map(item => item.classroom);
      return [...new Set(classrooms)];
    } catch (error: any) {
      console.error('Error fetching classrooms:', error);
      return [];
    }
  },

  async getBuildings(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('grupo')
        .select('building');

      if (error) throw new Error(error.message);

      // Get unique values
      const buildings = data.map(item => item.building);
      return [...new Set(buildings)];
    } catch (error: any) {
      console.error('Error fetching buildings:', error);
      return [];
    }
  }
};
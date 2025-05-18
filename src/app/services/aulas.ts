import { supabase } from './supabaseConnection';

export const aulasService = {
  async getAll() {
    try {
      console.log('Starting to fetch aulas...');
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .order('aula', { ascending: true });
      
      console.log('Aulas data received:', data);
      console.log('Aulas error:', error);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching aulas:', error);
      return [];
    }
  },

  async getById(id: number) {
    try {
      const { data, error } = await supabase
        .from('aulas')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error fetching aula with id ${id}:`, error);
      throw error;
    }
  },

  async create(aula: any) {
    try {
      const { id, ...aulaData } = aula;
      
      const { data, error } = await supabase
        .from('aulas')
        .insert([aulaData])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating aula:', error);
      throw error;
    }
  },

  async update(id: number, aula: any) {
    try {
      const { id: _, ...aulaData } = aula;
      
      const { data, error } = await supabase
        .from('aulas')
        .update(aulaData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error updating aula with id ${id}:`, error);
      throw error;
    }
  },

  async delete(id: number) {
    try {
      const { error } = await supabase
        .from('aulas')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting aula with id ${id}:`, error);
      throw error;
    }
  }
}; 
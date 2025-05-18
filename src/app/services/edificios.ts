import { supabase } from './supabaseConnection';

export const edificiosService = {
  async getAll() {
    const { data, error } = await supabase
      .from('edificios')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('edificios')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(edificio: any) {
    const { id, ...edificioData } = edificio;
    
    const { data, error } = await supabase
      .from('edificios')
      .insert([edificioData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, edificio: any) {
    const { id: _, ...edificioData } = edificio;
    
    const { data, error } = await supabase
      .from('edificios')
      .update(edificioData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('edificios')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 
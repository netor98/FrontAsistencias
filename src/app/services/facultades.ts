import { supabase } from './supabaseConnection';

export const facultadesService = {
  async getAll() {
    const { data, error } = await supabase
      .from('facultades')
      .select('*')
      .order('nombre', { ascending: true });
    
    if (error) throw error;
    return data;
  },

  async getById(id: number) {
    const { data, error } = await supabase
      .from('facultades')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  },

  async create(facultad: any) {
    const { id, ...facultadData } = facultad;
    
    const { data, error } = await supabase
      .from('facultades')
      .insert([facultadData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async update(id: number, facultad: any) {
    const { id: _, ...facultadData } = facultad;
    
    const { data, error } = await supabase
      .from('facultades')
      .update(facultadData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  async delete(id: number) {
    const { error } = await supabase
      .from('facultades')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }
}; 
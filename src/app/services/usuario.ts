import { supabase } from './supabaseConnection';
import { Usuario } from './interfaces';



export const usuariosService = {
  async getAll(): Promise<Usuario[]> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*');

    if (error) throw new Error(error.message);
    return data as Usuario[];
  },

  async getById(id: number): Promise<Usuario | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Usuario;
  },

  async create(usuario: Usuario): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .insert(usuario)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Usuario;
  },

  async update(id: number, usuario: Partial<Usuario>): Promise<Usuario> {
    const { data, error } = await supabase
      .from('usuarios')
      .update(usuario)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Usuario;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};
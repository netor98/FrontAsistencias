import { supabase } from './supabaseConnection';
import { Carrera } from './interfaces';

export const carrerasServiceSupa = {
  async getAll(): Promise<Carrera[]> {

    const { data, error } = await supabase
      .from('carreras')
      .select('*');

    console.log(data)
    if (error) throw new Error(error.message);
    return data as Carrera[];
  },

  async getPlanes(): Promise<number[]> {
    const { data, error } = await supabase
      .from('carreras')
      .select('plan');

    if (error) throw new Error(error.message);

    const uniquePlans = new Set(data.map((item: any) => item.plan));
    return Array.from(uniquePlans) as number[];
  },

  async getById(id: number): Promise<Carrera | null> {
    const { data, error } = await supabase
      .from('carreras')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw new Error(error.message);
    return data as Carrera;
  },

  async create(carrera: Carrera): Promise<Carrera> {
    const { data, error } = await supabase
      .from('carreras')
      .insert(carrera)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Carrera;
  },

  async update(id: number, carrera: Partial<Carrera>): Promise<Carrera> {
    const { data, error } = await supabase
      .from('carreras')
      .update(carrera)
      .eq('id', id)
      .select()
      .single();

    if (error) throw new Error(error.message);
    return data as Carrera;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('carreras')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
  }
};

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

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('No se encontró la materia para actualizar');
      }
      throw new Error(error.message);
    }
    return data as Materia;
  },

  async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error('No se encontró la materia para eliminar');
      }
      throw new Error(error.message);
    }
  },

  async uploadTemario(file: File, materiaId: number): Promise<string> {
    try {
      // First, check if there's an existing temario to delete
      const materia = await this.getById(materiaId);
      if (materia?.temario_url) {
        await this.deleteTemario(materiaId);
      }

      // Generate a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `temario_${materiaId}_${Date.now()}.${fileExt}`;
      const filePath = `temarios/${fileName}`;

      // Upload the file to Supabase storage
      const { error: uploadError, data } = await supabase.storage
        .from('temarios')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'application/pdf'
        });

      if (uploadError) {
        throw new Error(`Error al subir el archivo: ${uploadError.message}`);
      }

      // Get the signed URL with token
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('temarios')
        .createSignedUrl(filePath, 31536000); // 1 year expiration

      if (signedUrlError || !signedUrlData?.signedUrl) {
        // If getting signed URL fails, try to delete the uploaded file
        await supabase.storage
          .from('temarios')
          .remove([filePath]);
        throw new Error(`Error al generar la URL firmada: ${signedUrlError?.message || 'No se pudo generar la URL firmada'}`);
      }

      // Update the materia with the new temario_url
      const { error: updateError } = await supabase
        .from('materias')
        .update({ temario_url: signedUrlData.signedUrl })
        .eq('id', materiaId);

      if (updateError) {
        // If update fails, try to delete the uploaded file
        await supabase.storage
          .from('temarios')
          .remove([filePath]);
        throw new Error(`Error al actualizar la materia: ${updateError.message}`);
      }

      return signedUrlData.signedUrl;
    } catch (error: any) {
      throw new Error(`Error en el proceso de subida: ${error.message}`);
    }
  },

  async deleteTemario(materiaId: number): Promise<void> {
    try {
      const materia = await this.getById(materiaId);
      if (!materia?.temario_url) return;

      // Extract the file path from the URL
      const url = new URL(materia.temario_url);
      const filePath = url.pathname.split('/').pop();
      if (!filePath) return;

      // Delete the file from storage
      const { error: deleteError } = await supabase.storage
        .from('temarios')
        .remove([`temarios/${filePath}`]);

      if (deleteError) {
        throw new Error(`Error al eliminar el archivo: ${deleteError.message}`);
      }

      // Remove the temario_url from the materia
      const { error: updateError } = await supabase
        .from('materias')
        .update({ temario_url: null })
        .eq('id', materiaId);

      if (updateError) {
        throw new Error(`Error al actualizar la materia: ${updateError.message}`);
      }
    } catch (error: any) {
      throw new Error(`Error en el proceso de eliminación: ${error.message}`);
    }
  }
};
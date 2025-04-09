import { supabase } from './supabaseConnection';



async function login(email: string, password: string) {
  // Buscar el usuario en la tabla 'usuarios'
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('email', email)
    .single(); // Obtiene un solo registro

  if (error) {
    console.error('Error al buscar el usuario:', error.message);
    return;
  }

  if (data) {
    // Comparar la contraseña ingresada con la contraseña almacenada
    if (data.password === password) {
      console.log('Inicio de sesión exitoso:', data);
      // Aquí puedes manejar la sesión del usuario (por ejemplo, almacenar el estado de la sesión)
    } else {
      console.error('Contraseña incorrecta');
    }
  } else {
    console.error('Usuario no encontrado');
  }
}


function logout() {
  // Eliminar la información del usuario del almacenamiento local
  localStorage.removeItem('user');
  console.log('Sesión cerrada exitosamente');
}
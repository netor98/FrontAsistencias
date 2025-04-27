// import { supabase } from './supabaseConnection';



// async function login(email: string, password: string) {
//   // Buscar el usuario en la tabla 'usuarios'
//   const { data, error } = await supabase
//     .from('usuarios')
//     .select('*')
//     .eq('email', email)
//     .single(); // Obtiene un solo registro

//   if (error) {
//     console.error('Error al buscar el usuario:', error.message);
//     return;
//   }

//   if (data) {
//     // Comparar la contraseña ingresada con la contraseña almacenada
//     if (data.password === password) {
//       console.log('Inicio de sesión exitoso:', data);
//       // Aquí puedes manejar la sesión del usuario (por ejemplo, almacenar el estado de la sesión)
//     } else {
//       console.error('Contraseña incorrecta');
//     }
//   } else {
//     console.error('Usuario no encontrado');
//   }
// }


// function logout() {
//   // Eliminar la información del usuario del almacenamiento local
//   localStorage.removeItem('user');
//   console.log('Sesión cerrada exitosamente');
// }

import { supabase } from './supabaseConnection';

export interface User {
  id?: string;
  email?: string;
  numero_cuenta?: string;
  password?: string;
  role?: string;
  name?: string;
  // Otros campos que pueda tener tu usuario
}

export interface LoginResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class AuthService {
  /**
   * Intenta autenticar a un usuario por email o número de cuenta
   * @param identifier Email o número de cuenta
   * @param password Contraseña del usuario
   * @returns Objeto con resultado de autenticación
   */
  async login(identifier: string, password: string): Promise<LoginResponse> {
    try {
      // Intentar buscar por email primero
      const { data: emailUser, error: emailError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', identifier)
        .single();

      // Si no encuentra por email, busca por número de cuenta
      if (emailError) {
        const { data: accountNumberUser, error: usernameError } = await supabase
          .from('usuarios')
          .select('*')
          .eq('numero_cuenta', identifier)
          .single();
        
        if (usernameError) {
          return { 
            success: false,
            error: 'Número de cuenta o correo electrónico no encontrado'
          };
        }

        // Verificar contraseña para usuario encontrado por número de cuenta
        if (accountNumberUser.password === password) {
          return {
            success: true,
            user: accountNumberUser
          };
        } else {
          return {
            success: false,
            error: 'Contraseña incorrecta'
          };
        }
      } else {
        // Verificar contraseña para usuario encontrado por email
        if (emailUser.password === password) {
          return {
            success: true,
            user: emailUser
          };
        } else {
          return {
            success: false,
            error: 'Contraseña incorrecta'
          };
        }
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      return {
        success: false,
        error: 'Error al iniciar sesión'
      };
    }
  }

  /**
   * Guarda la sesión del usuario según preferencia de recordar
   * @param user Datos del usuario
   * @param remember Indicador si se debe recordar la sesión
   */
  saveUserSession(user: User, remember: boolean): void {
    // Crear una copia del usuario para no modificar el objeto original
    const userToSave = { ...user };
    
    // Formatear el rol si es necesario
    if (userToSave.role === 'Jefe_de_Grupo') {
      userToSave.role = 'Jefe de Grupo';
    }
    
    // Guardar en el almacenamiento según preferencia
    if (remember) {
      localStorage.setItem('user', JSON.stringify(userToSave));
    } else {
      sessionStorage.setItem('user', JSON.stringify(userToSave));
    }

    // if (remember) {
    //   localStorage.setItem('user', JSON.stringify(user));
    // } else {
    //   sessionStorage.setItem('user', JSON.stringify(user));
    // }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    localStorage.removeItem('user');
    sessionStorage.removeItem('user');
  }

  /**
   * Verifica si hay una sesión activa
   * @returns Usuario autenticado o null
   */
  getCurrentUser(): User | null {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  }
}

// Exportar una instancia única del servicio
export const authService = new AuthService();
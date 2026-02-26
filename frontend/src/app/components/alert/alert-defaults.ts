import { AlertLibrary } from "../../models/alert.model";

export const ALERT_LIBRARY: AlertLibrary = {
  error: {
    generic: { title: 'Algo salió mal', msg: 'Error inesperado.' },
    auth: { title: 'Error de Autenticación', msg: 'Tu sesión ha expirado.' },
    login: { title: 'Credenciales Incorrectas', msg: 'Correo o contraseña erróneos.' },
    server: { title: 'Error del Servidor', msg: 'Problemas técnicos, vuelve pronto.' },
    notFound: { title: 'Error 404', msg: 'La página o recurso que buscas no existe.', redirectToHome: true}
  },
  success: {
    generic: { title: 'Éxito', msg: 'Operación realizada.' },
    registration: { title: '¡Bienvenido!', msg: 'Cuenta creada con éxito.' },
    password: { title: 'Seguridad OK', msg: 'Contraseña actualizada.' },
  },
  warning: {
    generic: { title: 'Cuidado', msg: 'Esto puede tener consecuencias.' },
    delete: { title: 'Cuidado', msg: 'Esta acción no se puede deshacer.' },
  },
  info: {
    generic: { title: 'Información', msg: '' },
    updates: { title: 'Novedades', msg: 'Hemos actualizado la aplicación.' },
  }
};

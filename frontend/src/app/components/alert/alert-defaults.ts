import { AlertLibrary } from "../../models/alert.model";

export const ALERT_LIBRARY: AlertLibrary = {
  error: {
    generic: { title: 'Algo salió mal', msg: 'Error inesperado.' },
    auth: { title: 'Error de Autenticación', msg: 'Tu sesión ha expirado.' },
    login: { title: 'Credenciales Incorrectas', msg: 'Correo o contraseña erróneos.' },
    server: { title: 'Error del Servidor', msg: 'Problemas técnicos, vuelve pronto.' },
    notFound: { title: 'Error 404', msg: 'La página o recurso que buscas no existe.', redirectToHome: true},
    payment: { title: 'Error en el pago', msg: 'Hubo un problema al verificar tu suscripción. Inténtalo de nuevo.' }
  },
  success: {
    generic: { title: 'Éxito', msg: 'Operación realizada.' },
    registration: { title: '¡Bienvenido!', msg: 'Cuenta creada con éxito.' },
    password: { title: 'Seguridad OK', msg: 'Contraseña actualizada.' },
    premium: { title: '¡Premium Activado!', msg: 'Tu pago se ha verificado. Ya puedes disfrutar de todas las ventajas.' }
  },
  warning: {
    generic: { title: 'Cuidado', msg: 'Esto puede tener consecuencias.' },
    delete: { title: 'Cuidado', msg: 'Esta acción no se puede deshacer.' },
    noCommonInterests: {title: 'Swap no disponible', msg: 'No puedes hacer un swap con este usuario porque no tenéis intereses en común.', redirectToHome: true}
  },
  info: {
    generic: { title: 'Información', msg: '' },
    updates: { title: 'Novedades', msg: 'Hemos actualizado la aplicación.' },
  }
};

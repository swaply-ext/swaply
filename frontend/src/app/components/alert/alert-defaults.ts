import { AlertLibrary } from "../../models/alert.model";

export const ALERT_LIBRARY: AlertLibrary = {
  error: {
    generic: { title: 'Algo salió mal', msg: 'Error inesperado.' },
    auth: { title: 'Error de Autenticación', msg: 'Tu sesión ha expirado.' },
    login: { title: 'Credenciales Incorrectas', msg: 'Correo o contraseña erróneos.' },
    server: { title: 'Error del Servidor', msg: 'Problemas técnicos, vuelve pronto.' },
    notFound: { title: 'Error 404', msg: 'La página o recurso que buscas no existe.', redirectToHome: true },
    payment: { title: 'Error en el pago', msg: 'Hubo un problema al verificar tu suscripción. Inténtalo de nuevo.' },
    emailInUse: { title: 'Correo ya registrado', msg: 'El correo electrónico ya está registrado. ¿Olvidaste tu contraseña?' },
    registerFailed: { title: 'Error al registrarse', msg: 'Hubo un error al intentar registrarte. Inténtalo más tarde.' }
  },
  success: {
    generic: { title: 'Éxito', msg: 'Operación realizada.' },
    registration: { title: '¡Bienvenido!', msg: 'Cuenta creada con éxito.' },
    password: { title: 'Seguridad OK', msg: 'Contraseña actualizada.' },
    premium: { title: '¡Premium Activado!', msg: 'Tu pago se ha verificado. Ya puedes disfrutar de todas las ventajas.' },
    swapAccepted: { title: '¡Swap Confirmado!', msg: 'Ya puedes empezar a chatear.' },
    swapRejected: { title: 'Swap Rechazado', msg: 'Has rechazado la solicitud correctamente.' }
  },
  warning: {
    generic: { title: 'Cuidado', msg: 'Esto puede tener consecuencias.' },
    delete: { title: 'Cuidado', msg: 'Esta acción no se puede deshacer.' },
    noCommonInterests: { title: 'Swap no disponible', msg: 'No puedes hacer un swap con este usuario porque no tenéis intereses en común.', redirectToHome: true },
    usernameInUse: { title: 'Usuario no disponible', msg: 'El nombre de usuario ya está en uso. Prueba con otro.' }
  },
  info: {
    generic: { title: 'Información', msg: '' },
    updates: { title: 'Novedades', msg: 'Hemos actualizado la aplicación.' },
  }
};
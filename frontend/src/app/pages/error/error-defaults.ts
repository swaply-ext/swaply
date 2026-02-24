import { ErrorPayload } from "../../models/error-payload.model";

export const ERROR_DEFAULTS: Record<string, ErrorPayload> = {
  'auth': {
    title: 'Error de Autenticación',
    msg: 'Tu sesión ha expirado o no tienes permisos para estar aquí.',
    type: 'auth'
  },
  'login':{
    title: 'Credenciales Incorrectas',
    msg: 'El correo o la contraseña no coinciden.',
    type: 'login'
  },
  'not-found': {
    title: 'Error 404',
    msg: 'La página o recurso que buscas no existe.',
    type: 'not-found'
  },
  'server': {
    title: 'Error del Servidor',
    msg: 'Estamos teniendo problemas técnicos. Inténtalo más tarde.',
    type: 'server'
  },
  'generic': {
    title: 'Algo salió mal',
    msg: 'Ha ocurrido un error inesperado. Por favor, contacta con el soporte.',
    type: 'generic'
  }
};

export interface ErrorPayload {
  title: string;
  msg: string;
  type?: 'auth' | 'not-found' | 'generic' | 'server' | 'login';
}

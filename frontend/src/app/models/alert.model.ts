export type AlertCategory = 'success' | 'error' | 'warning' | 'info';

export interface AlertData {
  title: string;
  msg: string;
  redirectToHome?: boolean;
}

export type AlertLibrary = Record<AlertCategory, Record<string, AlertData>>;

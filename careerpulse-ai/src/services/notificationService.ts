import { capacitorService } from './capacitorService';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  description?: string;
  duration?: number;
}

type NotificationListener = (toast: ToastMessage) => void;

class NotificationService {
  private listeners: NotificationListener[] = [];

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  show(type: ToastMessage['type'], title: string, description?: string, duration = 4000) {
    const toast: ToastMessage = {
      id: 'toast-' + Math.random().toString(36).substring(2, 9),
      type,
      title,
      description,
      duration
    };

    // Trigger haptic feedback on mobile devices
    if (type === 'success') capacitorService.triggerHaptic([10, 30, 10]);
    if (type === 'error') capacitorService.triggerHaptic([50, 50, 50]);

    this.listeners.forEach(listener => listener(toast));
  }

  success(title: string, description?: string) {
    this.show('success', title, description);
  }

  info(title: string, description?: string) {
    this.show('info', title, description);
  }

  warning(title: string, description?: string) {
    this.show('warning', title, description);
  }

  error(title: string, description?: string) {
    this.show('error', title, description);
  }
}

export const notificationService = new NotificationService();

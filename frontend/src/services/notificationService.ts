export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

type ToastListener = (toasts: Toast[]) => void;

class NotificationService {
  private toasts: Toast[] = [];
  private listeners: Set<ToastListener> = new Set();

  public subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    listener(this.toasts);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener(this.toasts));
  }

  public show(type: Toast['type'], title: string, message: string, durationMs = 4000): void {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = { id, type, title, message };
    this.toasts = [toast, ...this.toasts];
    this.notify();

    setTimeout(() => {
      this.remove(id);
    }, durationMs);
  }

  public success(title: string, message: string): void {
    this.show('success', title, message);
  }

  public error(title: string, message: string): void {
    this.show('error', title, message);
  }

  public info(title: string, message: string): void {
    this.show('info', title, message);
  }

  public warning(title: string, message: string): void {
    this.show('warning', title, message);
  }

  public remove(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }
}

export const notificationService = new NotificationService();

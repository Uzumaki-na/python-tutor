import toast, { Toast } from 'react-hot-toast';

interface ToastOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
}

export function useToast() {
  const defaultOptions: ToastOptions = {
    duration: 4000,
    position: 'bottom-right',
  };

  const success = (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      ...defaultOptions,
      ...options,
    });
  };

  const error = (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      ...defaultOptions,
      ...options,
    });
  };

  const info = (message: string, options?: ToastOptions) => {
    return toast(message, {
      ...defaultOptions,
      ...options,
    });
  };

  const loading = (message: string, options?: ToastOptions): Toast => {
    return toast.loading(message, {
      ...defaultOptions,
      ...options,
    });
  };

  const dismiss = (toastId: string) => {
    toast.dismiss(toastId);
  };

  return {
    success,
    error,
    info,
    loading,
    dismiss,
  };
}

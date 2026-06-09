import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Toast, ToastProps } from '@/components/ui/Toast';
import { CustomAlert } from '@/components/ui/CustomAlert';

interface AlertOptions {
  title: string;
  message: string;
  type: 'success' | 'error';
  buttonLabel?: string;
  onPress?: () => void;
  secondaryButtonLabel?: string;
  onSecondaryPress?: () => void;
}

interface FeedbackContextType {
  showToast: (message: string, type: 'success' | 'error' | 'info') => void;
  showAlert: (options: AlertOptions) => void;
  hideAlert: () => void;
}

const FeedbackContext = createContext<FeedbackContextType | null>(null);

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Omit<ToastProps, 'onDismiss'>[]>([]);
  const [alertConfig, setAlertConfig] = useState<AlertOptions & { visible: boolean }>({
    visible: false,
    title: '',
    message: '',
    type: 'success',
  });

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const handleDismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showAlert = useCallback((options: AlertOptions) => {
    setAlertConfig({
      visible: true,
      ...options,
    });
  }, []);

  const hideAlert = useCallback(() => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  }, []);

  const handleAlertConfirm = useCallback(() => {
    hideAlert();
    if (alertConfig.onPress) {
      alertConfig.onPress();
    }
  }, [alertConfig, hideAlert]);

  const handleAlertSecondary = useCallback(() => {
    hideAlert();
    if (alertConfig.onSecondaryPress) {
      alertConfig.onSecondaryPress();
    }
  }, [alertConfig, hideAlert]);

  return (
    <FeedbackContext.Provider value={{ showToast, showAlert, hideAlert }}>
      {children}
      {/* Toast Overlay */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onDismiss={handleDismissToast}
        />
      ))}
      {/* Alert Overlay */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        buttonLabel={alertConfig.buttonLabel}
        onPress={handleAlertConfirm}
        secondaryButtonLabel={alertConfig.secondaryButtonLabel}
        onSecondaryPress={handleAlertSecondary}
      />
    </FeedbackContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useToast must be used within a FeedbackProvider');
  return ctx.showToast;
}

export function useAlert() {
  const ctx = useContext(FeedbackContext);
  if (!ctx) throw new Error('useAlert must be used within a FeedbackProvider');
  return {
    showAlert: ctx.showAlert,
    hideAlert: ctx.hideAlert,
  };
}

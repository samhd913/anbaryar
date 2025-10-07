import { useState } from 'react';

interface AlertButton {
  text: string;
  onPress: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface AlertState {
  visible: boolean;
  title: string;
  message: string;
  buttons: AlertButton[];
}

export function useCustomAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    title: '',
    message: '',
    buttons: [],
  });

  const showAlert = (
    title: string,
    message: string,
    buttons: AlertButton[] = [{ text: 'باشه', onPress: () => {} }]
  ) => {
    setAlertState({
      visible: true,
      title,
      message,
      buttons,
    });
  };

  const showSuccessAlert = (message: string) => {
    showAlert('✅ موفقیت', message, [
      { text: 'باشه', onPress: () => {} }
    ]);
  };

  const showErrorAlert = (message: string) => {
    showAlert('❌ خطا', message, [
      { text: 'باشه', onPress: () => {} }
    ]);
  };

  const showConfirmAlert = (
    title: string,
    message: string,
    onConfirm: () => void,
    confirmText: string = 'تأیید',
    cancelText: string = 'لغو'
  ) => {
    showAlert(title, message, [
      { text: cancelText, onPress: () => {}, style: 'cancel' },
      { text: confirmText, onPress: onConfirm, style: 'destructive' }
    ]);
  };

  const hideAlert = () => {
    setAlertState(prev => ({ ...prev, visible: false }));
  };

  return {
    alertState,
    showAlert,
    showSuccessAlert,
    showErrorAlert,
    showConfirmAlert,
    hideAlert,
  };
}

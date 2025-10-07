import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

interface ImportStatusProps {
  isVisible: boolean;
  message: string;
  isSuccess: boolean;
  onClose: () => void;
}

export const ImportStatus: React.FC<ImportStatusProps> = ({
  isVisible,
  message,
  isSuccess,
  onClose,
}) => {
  if (!isVisible) return null;

  return (
    <View style={[styles.container, isSuccess ? styles.success : styles.error]}>
      <Text style={styles.message}>{message}</Text>
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeText}>✕</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    margin: 16,
    borderRadius: 8,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  success: {
    backgroundColor: Colors.success + '20',
    borderColor: Colors.success,
    borderWidth: 1,
  },
  error: {
    backgroundColor: Colors.error + '20',
    borderColor: Colors.error,
    borderWidth: 1,
  },
  message: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
  closeText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: 'bold',
  },
});

import * as DocumentPicker from 'expo-document-picker';
import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';

interface FilePickerProps {
  onFileSelected: (fileUri: string) => void;
  title?: string;
}

export const FilePicker: React.FC<FilePickerProps> = ({ 
  onFileSelected, 
  title = 'انتخاب فایل' 
}) => {
  const handleFileSelection = async () => {
    try {
      
      // First try with specific types
      let result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
          'text/csv',
          'application/csv',
        ],
        copyToCacheDirectory: true,
        allowsMultipleSelection: false,
      });


      // If no file selected, try with all types
      if (result.canceled) {
        result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true,
          allowsMultipleSelection: false,
        });
      }

      if (!result.canceled && result.assets?.[0]) {
        const file = result.assets[0];
        const fileName = file.name || 'unknown';
        const fileSize = file.size || 0;
        
        console.log('Selected file:', {
          name: fileName,
          size: fileSize,
          uri: file.uri,
          type: file.mimeType
        });
        
        // Check if it's a supported file type
        const supportedExtensions = ['.csv', '.xlsx', '.xls'];
        const hasValidExtension = supportedExtensions.some(ext => 
          fileName.toLowerCase().endsWith(ext)
        );

        if (hasValidExtension) {
          console.log('File type is supported, calling onFileSelected...');
          onFileSelected(file.uri);
        } else {
          console.log('File type not supported:', fileName);
          Alert.alert(
            'نوع فایل پشتیبانی نمی‌شود',
            `فایل "${fileName}" از نوع پشتیبانی شده نیست.\nلطفاً فایل CSV یا Excel انتخاب کنید.`,
            [{ text: 'باشه' }]
          );
        }
      } else {
        console.log('No file selected or result was canceled');
      }
    } catch (error) {
      console.error('File picker error:', error);
      Alert.alert(
        'خطا در انتخاب فایل', 
        `خطای جزئیات: ${error instanceof Error ? error.message : 'خطای نامشخص'}`
      );
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleFileSelection}>
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});

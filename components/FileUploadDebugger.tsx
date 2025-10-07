import { FileSystem } from 'expo-file-system/legacy';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Colors } from '../constants/colors';

interface FileUploadDebuggerProps {
  onFileTested: (result: any) => void;
}

export const FileUploadDebugger: React.FC<FileUploadDebuggerProps> = ({ onFileTested }) => {
  const [debugInfo, setDebugInfo] = useState<string[]>([]);

  const addDebugInfo = (info: string) => {
    console.log('DEBUG:', info);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${info}`]);
  };

  const testFileAccess = async (fileUri: string) => {
    try {
      addDebugInfo(`Testing file access for: ${fileUri}`);
      
      // Test file existence
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      addDebugInfo(`File exists: ${fileInfo.exists}`);
      addDebugInfo(`File size: ${fileInfo.size} bytes`);
      addDebugInfo(`File URI: ${fileInfo.uri}`);
      
      if (!fileInfo.exists) {
        throw new Error('فایل وجود ندارد');
      }
      
      // Test reading as text
      try {
        const textContent = await FileSystem.readAsStringAsync(fileUri, {
          encoding: 'utf8' as any,
        });
        addDebugInfo(`Text content length: ${textContent.length}`);
        addDebugInfo(`First 100 chars: ${textContent.substring(0, 100)}`);
      } catch (textError) {
        addDebugInfo(`Text reading failed: ${textError}`);
      }
      
      // Test reading as base64
      try {
        const base64Content = await FileSystem.readAsStringAsync(fileUri, {
          encoding: 'base64' as any,
        });
        addDebugInfo(`Base64 content length: ${base64Content.length}`);
      } catch (base64Error) {
        addDebugInfo(`Base64 reading failed: ${base64Error}`);
      }
      
      onFileTested({
        success: true,
        fileInfo,
        debugInfo: debugInfo
      });
      
    } catch (error) {
      addDebugInfo(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      onFileTested({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        debugInfo: debugInfo
      });
    }
  };

  const clearDebugInfo = () => {
    setDebugInfo([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>File Upload Debugger</Text>
      
      <TouchableOpacity 
        style={styles.button} 
        onPress={clearDebugInfo}
      >
        <Text style={styles.buttonText}>پاک کردن لاگ‌ها</Text>
      </TouchableOpacity>
      
      <ScrollView style={styles.debugContainer}>
        {debugInfo.map((info, index) => (
          <Text key={index} style={styles.debugText}>
            {info}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: Colors.surface,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  debugContainer: {
    maxHeight: 200,
    backgroundColor: Colors.background,
    borderRadius: 8,
    padding: 8,
  },
  debugText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontFamily: 'monospace',
    marginBottom: 2,
  },
});

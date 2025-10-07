import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../stores/AuthStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, setLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      setLoading(true);
      
      // Check if user is authenticated
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
        return;
      }
      
      setLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, router, setLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0072FF" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});

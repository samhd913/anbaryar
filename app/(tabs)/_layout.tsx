import { Tabs } from 'expo-router';
import React from 'react';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 140,
          paddingTop: 8,
          paddingBottom: 30,
        },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: '700',
          marginTop: 4,
        },
        tabBarIconStyle: {
          marginTop: 0,
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'خانه',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <IconSymbol 
              size={32} 
              name="house.fill" 
              color={focused ? '#0072FF' : '#6B7280'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'شمارش انبار',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <IconSymbol 
              size={32} 
              name="list.bullet" 
              color={focused ? '#0072FF' : '#6B7280'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="drugs"
        options={{
          title: 'داروها',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <IconSymbol 
              size={32} 
              name="pills.fill" 
              color={focused ? '#0072FF' : '#6B7280'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="reports"
        options={{
          title: 'گزارشات',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <IconSymbol 
              size={32} 
              name="chart.bar" 
              color={focused ? '#0072FF' : '#6B7280'} 
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'تنظیمات',
          tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
            <IconSymbol 
              size={32} 
              name="settings" 
              color={focused ? '#0072FF' : '#6B7280'} 
            />
          ),
        }}
      />
    </Tabs>
  );
}

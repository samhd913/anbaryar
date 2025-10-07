import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();

  const features = [
    {
      icon: '📊',
      title: 'شمارش انبار',
      description: 'شمارش دقیق موجودی داروها و مقایسه با سیستم',
      action: () => router.push('/(tabs)/inventory'),
      gradient: ['#0072FF', '#4DB8FF'],
      iconBg: '#0072FF',
    },
    {
      icon: '🏥',
      title: 'مدیریت داروها',
      description: 'مشاهده و مدیریت لیست کامل داروها',
      action: () => router.push('/(tabs)/drugs'),
      gradient: ['#1E3A8A', '#1E40AF'],
      iconBg: '#1E3A8A',
    },
    {
      icon: '📈',
      title: 'گزارشات',
      description: 'نمایش آمار و گزارش‌های تفصیلی شمارش',
      action: () => router.push('/(tabs)/reports'),
      gradient: ['#0072FF', '#4DB8FF'],
      iconBg: '#0072FF',
    },
    {
      icon: '⚙️',
      title: 'تنظیمات',
      description: 'مدیریت فایل‌ها، خروجی و پاک‌سازی داده‌ها',
      action: () => router.push('/(tabs)/explore'),
      gradient: ['#1E3A8A', '#1E40AF'],
      iconBg: '#1E3A8A',
    },
  ];


  const recentActivities = [
    {
      icon: '📥',
      title: 'وارد کردن فایل',
      description: 'آخرین فایل Excel وارد شد',
      time: '2 ساعت پیش',
      color: '#0072FF',
    },
    {
      icon: '📊',
      title: 'شمارش انبار',
      description: 'شمارش 15 قلم دارو انجام شد',
      time: '1 روز پیش',
      color: '#4DB8FF',
    },
    {
      icon: '📤',
      title: 'خروجی گزارش',
      description: 'گزارش Excel ایجاد شد',
      time: '3 روز پیش',
      color: '#87CEEB',
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0072FF" />
      
      {/* Background Gradient */}
      <LinearGradient
        colors={['#0072FF', '#4DB8FF', '#87CEEB']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Floating Orbs */}
      <View style={styles.orb1} />
      <View style={styles.orb2} />
      <View style={styles.orb3} />

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoWrapper}>
              <Image 
                source={require('../../assets/img/logo.png')} 
                style={styles.logoImage}
                resizeMode="contain"
              />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.appName}>انبار یار</Text>
              <Text style={styles.tagline}>سیستم مدیریت انبار داروخانه</Text>
            </View>
          </View>
          <Text style={styles.description}>
            اپلیکیشن هوشمند شمارش و مدیریت موجودی داروخانه‌ها با قابلیت‌های پیشرفته
          </Text>
        </View>

        {/* Welcome Banner */}
        <View style={styles.welcomeBanner}>
          <LinearGradient
            colors={['#0072FF', '#4DB8FF', '#87CEEB']}
            style={styles.welcomeGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.welcomeContent}>
              <View style={styles.welcomeTextContainer}>
                <Text style={styles.welcomeTitle}>به انبار یار خوش آمدید!</Text>
                <Text style={styles.welcomeSubtitle}>
                  مدیریت هوشمند انبار داروخانه با تکنولوژی پیشرفته
                </Text>
              </View>
            </View>
            <View style={styles.welcomeStats}>
              <View style={styles.welcomeStatItem}>
                <Text style={styles.welcomeStatNumber}>100%</Text>
                <Text style={styles.welcomeStatLabel}>دقت</Text>
              </View>
              <View style={styles.welcomeStatDivider} />
              <View style={styles.welcomeStatItem}>
                <Text style={styles.welcomeStatNumber}>24/7</Text>
                <Text style={styles.welcomeStatLabel}>پشتیبانی</Text>
              </View>
              <View style={styles.welcomeStatDivider} />
              <View style={styles.welcomeStatItem}>
                <Text style={styles.welcomeStatNumber}>∞</Text>
                <Text style={styles.welcomeStatLabel}>امکانات</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>امکانات اصلی</Text>
          {features.map((feature, index) => (
            <TouchableOpacity
              key={index}
              style={styles.featureCard}
              onPress={feature.action}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={feature.gradient as [string, string]}
                style={styles.featureGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <View style={styles.featureContent}>
                  <View style={[styles.featureIconContainer, { backgroundColor: feature.iconBg + '30' }]}>
                    <Text style={styles.featureIcon}>{feature.icon}</Text>
                  </View>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>{feature.title}</Text>
                    <Text style={styles.featureDescription}>{feature.description}</Text>
                  </View>
                  <View style={styles.arrowContainer}>
                    <Text style={styles.arrow}>→</Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activities */}
        <View style={styles.activitiesSection}>
          <Text style={styles.sectionTitle}>فعالیت‌های اخیر</Text>
          <View style={styles.activitiesContainer}>
            {recentActivities.map((activity, index) => (
              <View key={index} style={styles.activityItem}>
                <View style={[styles.activityIconContainer, { backgroundColor: activity.color + '20' }]}>
                  <Text style={styles.activityIcon}>{activity.icon}</Text>
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>{activity.title}</Text>
                  <Text style={styles.activityDescription}>{activity.description}</Text>
                  <Text style={styles.activityTime}>{activity.time}</Text>
                </View>
                <View style={[styles.activityIndicator, { backgroundColor: activity.color }]} />
              </View>
            ))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>نکات مفید</Text>
          <View style={styles.tipsContainer}>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>💡</Text>
              <Text style={styles.tipText}>
                برای بهترین نتیجه، فایل Excel را با فرمت UTF-8 ذخیره کنید
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>🔍</Text>
              <Text style={styles.tipText}>
                از جستجو برای یافتن سریع داروها استفاده کنید
              </Text>
            </View>
            <View style={styles.tipCard}>
              <Text style={styles.tipIcon}>📱</Text>
              <Text style={styles.tipText}>
                اپلیکیشن را به‌روز نگه دارید تا از آخرین ویژگی‌ها استفاده کنید
              </Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.supportSection}>
          <LinearGradient
            colors={['#1E3A8A', '#1E40AF']}
            style={styles.supportGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.supportTitle}>پشتیبانی و راهنمایی</Text>
            <Text style={styles.supportDescription}>
              برای راهنمایی و پشتیبانی با ما در تماس باشید
            </Text>
            <View style={styles.supportInfo}>
              <Text style={styles.supportContact}>📧 hdsajjad82@gmail.com</Text>
              <Text style={styles.supportPhone}>📞 09231104618</Text>
            </View>
          </LinearGradient>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            طراحی و توسعه: سجاد حیدری
          </Text>
          <Text style={styles.footerText}>
            © 2024 انبار یار - تمامی حقوق محفوظ است
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0072FF',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  orb1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  orb2: {
    position: 'absolute',
    top: 100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  orb3: {
    position: 'absolute',
    bottom: -100,
    right: -100,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 24,
    zIndex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoImage: {
    width: 110,
    height: 110,
  },
  titleContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  description: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeBanner: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  welcomeGradient: {
    borderRadius: 24,
    padding: 24,
    elevation: 12,
    shadowColor: 'rgba(0, 0, 0, 0.4)',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeTextContainer: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  welcomeSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  welcomeStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  welcomeStatNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  welcomeStatLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  welcomeStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 8,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featureCard: {
    marginBottom: 16,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  featureGradient: {
    padding: 20,
  },
  featureContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  featureDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  arrowContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  arrow: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  activitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  activitiesContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  activityIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  activityDescription: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  activityTime: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  activityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  tipsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: 12,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 20,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  supportSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  supportGradient: {
    borderRadius: 20,
    padding: 24,
    elevation: 8,
    shadowColor: 'rgba(0, 0, 0, 0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  supportTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  supportDescription: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  supportInfo: {
    alignItems: 'center',
  },
  supportContact: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  supportPhone: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '800',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
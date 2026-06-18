import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  Dimensions,
  ActivityIndicator,
  useColorScheme,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';

const { width } = Dimensions.get('window');

const themes = {
  light: {
    bgGradient: ['#f8fafc', '#eff6ff', '#e0f2fe'] as const,
    cardBg: 'rgba(255, 255, 255, 0.85)',
    cardBorder: 'rgba(255, 255, 255, 0.6)',
    textPrimary: '#0f172a',
    textSecondary: '#64748b',
    inputBg: 'rgba(241, 245, 249, 0.8)',
    inputBorder: '#e2e8f0',
    inputFocusedBorder: '#2563eb',
    inputTextColor: '#1e293b',
    buttonText: '#ffffff',
    linkText: '#1e40af',
    shadowColor: '#0f172a',
  },
  dark: {
    bgGradient: ['#030712', '#0b0f19', '#111827'] as const,
    cardBg: 'rgba(17, 24, 39, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    inputBg: 'rgba(31, 41, 55, 0.5)',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputFocusedBorder: '#3b82f6',
    inputTextColor: '#f1f5f9',
    buttonText: '#ffffff',
    linkText: '#60a5fa',
    shadowColor: '#000000',
  }
};

export default function LoginScreen({ navigation }: any) {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<'email' | 'password' | null>(null);
  const { login } = useAuth();

  const theme = isDarkMode ? themes.dark : themes.light;

  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const toggleTheme = () => {
    triggerHaptic();
    setIsDarkMode(!isDarkMode);
  };

  const handleLogin = async () => {
    triggerHaptic();
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await login(email.trim(), password);
    } catch (error: any) {
      let msg = 'Login failed. Please try again.';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        msg = 'Server is starting up, please wait a moment and try again.';
      } else if (!error.response) {
        msg = 'Cannot connect to server. Please check your internet connection.';
      } else {
        msg = error.response?.data?.message || 'Invalid email or password.';
      }
      Alert.alert('Login Error', msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigateRegister = () => {
    triggerHaptic();
    navigation.navigate('Register');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.bgGradient[0] }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.bgGradient}
        style={StyleSheet.absoluteFillObject}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* Decorative ambient glow elements */}
      <View 
        style={[
          styles.ambientGlow1, 
          { 
            backgroundColor: isDarkMode ? 'rgba(79, 70, 229, 0.12)' : 'rgba(59, 130, 246, 0.08)' 
          }
        ]} 
      />
      <View 
        style={[
          styles.ambientGlow2, 
          { 
            backgroundColor: isDarkMode ? 'rgba(236, 72, 153, 0.09)' : 'rgba(147, 51, 234, 0.05)' 
          }
        ]} 
      />

      {/* Floating Theme Toggle */}
      <TouchableOpacity 
        style={[styles.themeToggleBtn, { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }]} 
        onPress={toggleTheme}
        activeOpacity={0.7}
      >
        <Ionicons 
          name={isDarkMode ? "sunny" : "moon"} 
          size={20} 
          color={theme.textPrimary} 
        />
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={[styles.logoCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
          <Image
            source={require('../../../assets/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.title, { color: theme.textPrimary }]}>CDMS</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>Church Database Management System</Text>

        <View 
          style={[
            styles.card, 
            { 
              backgroundColor: theme.cardBg, 
              borderColor: theme.cardBorder,
              shadowColor: theme.shadowColor,
            }
          ]}
        >
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Welcome Back</Text>
          <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Sign in to your account to continue</Text>

          {/* Email input field */}
          <View 
            style={[
              styles.inputContainer, 
              { 
                backgroundColor: theme.inputBg, 
                borderColor: focusedInput === 'email' ? theme.inputFocusedBorder : theme.inputBorder 
              }
            ]}
          >
            <Ionicons 
              name="mail-outline" 
              size={20} 
              color={focusedInput === 'email' ? '#3b82f6' : '#94a3b8'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.inputTextColor }]}
              placeholder="Email address"
              placeholderTextColor="#94a3b8"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          {/* Password input field */}
          <View 
            style={[
              styles.inputContainer, 
              { 
                backgroundColor: theme.inputBg, 
                borderColor: focusedInput === 'password' ? theme.inputFocusedBorder : theme.inputBorder 
              }
            ]}
          >
            <Ionicons 
              name="lock-closed-outline" 
              size={20} 
              color={focusedInput === 'password' ? '#3b82f6' : '#94a3b8'} 
              style={styles.inputIcon} 
            />
            <TextInput
              style={[styles.input, { color: theme.inputTextColor }]}
              placeholder="Password"
              placeholderTextColor="#94a3b8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
            />
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              style={styles.eyeIcon}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color="#94a3b8" 
              />
            </TouchableOpacity>
          </View>

          {/* Action button */}
          <TouchableOpacity
            style={styles.buttonContainer}
            onPress={handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#2563eb', '#4f46e5']}
              style={styles.button}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Sign up link */}
          <TouchableOpacity 
            onPress={handleNavigateRegister}
            style={styles.registerLink}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkTextText, { color: theme.textSecondary }]}>
              Don't have an account? <Text style={[styles.linkTextHighlight, { color: theme.linkText }]}>Sign Up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ambientGlow1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    top: '12%',
    left: -80,
  },
  ambientGlow2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: '18%',
    right: -80,
  },
  themeToggleBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    right: 24,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logoCard: {
    width: 80,
    height: 80,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  logo: {
    width: 54,
    height: 54,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 4,
    marginBottom: 28,
    textAlign: 'center',
  },
  card: {
    width: width - 48,
    borderRadius: 26,
    padding: 24,
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  cardSubtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 8,
  },
  buttonContainer: {
    marginTop: 6,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  button: {
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkTextText: {
    fontSize: 13,
  },
  linkTextHighlight: {
    fontWeight: '600',
  },
});

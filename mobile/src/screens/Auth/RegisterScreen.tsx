import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Linking,
  useColorScheme,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

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
    strengthBg: '#e2e8f0',
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
    strengthBg: '#374151',
    shadowColor: '#000000',
  }
};

export default function RegisterScreen({ navigation }: any) {
  const systemScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemScheme === 'dark');
  const [step, setStep] = useState<'type' | 'search' | 'form'>('type');
  
  // Church search state
  const [churchQuery, setChurchQuery] = useState('');
  const [churchResults, setChurchResults] = useState<any[]>([]);
  const [selectedChurch, setSelectedChurch] = useState<any | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<any>(null);

  // Form inputs state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  
  // Modal state
  const [showChurchModal, setShowChurchModal] = useState(false);

  const { register } = useAuth();
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

  // Search Debouncing
  const handleSearchChange = (text: string) => {
    setChurchQuery(text);
    if (searchTimeout) clearTimeout(searchTimeout);
    
    if (text.length < 2) {
      setChurchResults([]);
      return;
    }
    
    const timeout = setTimeout(() => {
      searchChurches(text);
    }, 400);
    setSearchTimeout(timeout);
  };

  const searchChurches = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await api.get('/approvals/churches/search', { params: { query } });
      setChurchResults(response.data || []);
    } catch (error) {
      console.error('Failed to search churches:', error);
      setChurchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // Password criteria checklist (same as web app)
  const getPasswordCriteria = () => {
    return [
      { label: "8+ characters", met: password.length >= 8 },
      { label: "Uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Lowercase letter", met: /[a-z]/.test(password) },
      { label: "Number", met: /[0-9]/.test(password) },
    ];
  };

  const getStrengthLevel = () => {
    const metCount = getPasswordCriteria().filter(c => c.met).length;
    if (password.length === 0) return 0;
    if (metCount <= 1) return 1;
    if (metCount <= 3) return 2;
    return 3;
  };

  const handleRegister = async () => {
    triggerHaptic();
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    const metCount = getPasswordCriteria().filter(c => c.met).length;
    if (metCount < 4) {
      Alert.alert('Weak Password', 'Password must meet all 4 strength requirements.');
      return;
    }

    setIsLoading(true);
    try {
      await register({ 
        firstName: firstName.trim(), 
        lastName: lastName.trim(), 
        email: email.trim(), 
        password,
        churchId: selectedChurch?.id 
      });
      
      Alert.alert('Success', 'Registration submitted! Awaiting administrator approval.', [
        { text: 'OK', onPress: () => navigation.navigate('Login') }
      ]);
    } catch (error: any) {
      Alert.alert('Registration Error', error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    triggerHaptic();
    if (step === 'form') {
      setStep('search');
    } else if (step === 'search') {
      setStep('type');
    } else {
      navigation.goBack();
    }
  };

  const openWebPortal = () => {
    triggerHaptic();
    setShowChurchModal(false);
    // Strip '/api' from the backend API URL to get the base domain, or fallback to localhost
    const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://cdmsbackend.onrender.com/api';
    const baseDomain = apiUrl.replace('/api', '');
    const registerChurchUrl = `${baseDomain}/register/church`;
    
    Linking.openURL(registerChurchUrl).catch((err) => {
      Alert.alert('Error', 'Unable to open link automatically. Please navigate to the website portal on a desktop browser.');
    });
  };

  const renderPasswordStrength = () => {
    if (!password) return null;
    const strength = getStrengthLevel();
    const criteria = getPasswordCriteria();
    const colors = ['#e2e8f0', '#ef4444', '#f59e0b', '#10b981'];
    
    return (
      <View style={styles.strengthContainer}>
        <View style={styles.strengthBars}>
          {[0, 1, 2, 3].map((i) => (
            <View
              key={i}
              style={[
                styles.strengthBar,
                { 
                  backgroundColor: i <= strength ? colors[strength] : theme.strengthBg,
                }
              ]}
            />
          ))}
        </View>
        <View style={styles.criteriaGrid}>
          {criteria.map((c) => (
            <View key={c.label} style={styles.criteriaRow}>
              <Ionicons 
                name={c.met ? "checkmark-circle" : "close-circle"} 
                size={14} 
                color={c.met ? "#10b981" : "#ef4444"} 
                style={{ marginRight: 4 }}
              />
              <Text style={[styles.criteriaText, { color: c.met ? '#10b981' : theme.textSecondary }]}>
                {c.label}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
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

      {/* Ambient glow backgrounds */}
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

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step navigation arrow on top left */}
        <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>Join Community</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {step === 'type' ? 'Select how you would like to register' : 
             step === 'search' ? 'Find your church community to request membership' : 
             'Complete details to request your member account'}
          </Text>
        </View>

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
          {/* STEP 1: Registration Type Selection */}
          {step === 'type' && (
            <View style={styles.typeStepContainer}>
              <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Account Type</Text>
              
              <TouchableOpacity 
                style={[styles.choiceCard, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                onPress={() => {
                  triggerHaptic();
                  setStep('search');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.choiceHeader}>
                  <View style={[styles.choiceIconContainer, { backgroundColor: '#e0e7ff' }]}>
                    <Ionicons name="person" size={22} color="#4f46e5" />
                  </View>
                  <View style={styles.choiceTextContainer}>
                    <Text style={[styles.choiceTitle, { color: theme.textPrimary }]}>Register as Member</Text>
                    <Text style={[styles.choiceDesc, { color: theme.textSecondary }]}>Join an existing church</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.choiceCard, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                onPress={() => {
                  triggerHaptic();
                  setShowChurchModal(true);
                }}
                activeOpacity={0.7}
              >
                <View style={styles.choiceHeader}>
                  <View style={[styles.choiceIconContainer, { backgroundColor: '#ccfbf1' }]}>
                    <Ionicons name="business" size={22} color="#0f766e" />
                  </View>
                  <View style={styles.choiceTextContainer}>
                    <Text style={[styles.choiceTitle, { color: theme.textPrimary }]}>Register Church</Text>
                    <Text style={[styles.choiceDesc, { color: theme.textSecondary }]}>Register a new church system</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                </View>
              </TouchableOpacity>
            </View>
          )}

          {/* STEP 2: Find Church to Join */}
          {step === 'search' && (
            <View style={styles.searchStepContainer}>
              <Text style={[styles.stepTitle, { color: theme.textPrimary }]}>Find Your Church</Text>
              
              <View 
                style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: focusedInput === 'search' ? theme.inputFocusedBorder : theme.inputBorder 
                  }
                ]}
              >
                <Ionicons name="search" size={20} color="#94a3b8" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.inputTextColor }]}
                  placeholder="Search church by name..."
                  placeholderTextColor="#94a3b8"
                  value={churchQuery}
                  onChangeText={handleSearchChange}
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('search')}
                  onBlur={() => setFocusedInput(null)}
                />
                {isSearching && <ActivityIndicator size="small" color="#1e40af" />}
              </View>

              <ScrollView style={styles.resultsScroll} nestedScrollEnabled={true} showsVerticalScrollIndicator={false}>
                {churchResults.length > 0 ? (
                  churchResults.map((church) => (
                    <TouchableOpacity
                      key={church.id}
                      style={[styles.resultCard, { backgroundColor: theme.inputBg, borderColor: theme.inputBorder }]}
                      onPress={() => {
                        triggerHaptic();
                        setSelectedChurch(church);
                        setStep('form');
                      }}
                      activeOpacity={0.75}
                    >
                      <Ionicons name="business-outline" size={20} color="#3b82f6" style={{ marginRight: 12 }} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.resultName, { color: theme.textPrimary }]}>{church.name}</Text>
                        <Text style={[styles.resultLocation, { color: theme.textSecondary }]}>
                          {church.city}, {church.state}
                        </Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
                    </TouchableOpacity>
                  ))
                ) : (
                  churchQuery.length >= 2 && !isSearching && (
                    <Text style={[styles.noResultsText, { color: theme.textSecondary }]}>
                      No churches found matching &quot;{churchQuery}&quot;
                    </Text>
                  )
                )}
              </ScrollView>
            </View>
          )}

          {/* STEP 3: Complete Account Form */}
          {step === 'form' && (
            <View style={styles.formStepContainer}>
              <View style={styles.selectedChurchBadge}>
                <Ionicons name="business" size={14} color="#1e40af" style={{ marginRight: 6 }} />
                <Text style={styles.selectedChurchBadgeText} numberOfLines={1}>
                  Joining: {selectedChurch?.name}
                </Text>
              </View>

              <View style={styles.row}>
                <View 
                  style={[
                    styles.inputContainer, 
                    styles.halfInputContainer,
                    { 
                      backgroundColor: theme.inputBg, 
                      borderColor: focusedInput === 'firstName' ? theme.inputFocusedBorder : theme.inputBorder 
                    }
                  ]}
                >
                  <Ionicons name="person-outline" size={18} color={focusedInput === 'firstName' ? '#3b82f6' : '#94a3b8'} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { color: theme.inputTextColor }]}
                    placeholder="First Name"
                    placeholderTextColor="#94a3b8"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCorrect={false}
                    onFocus={() => setFocusedInput('firstName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
                <View 
                  style={[
                    styles.inputContainer, 
                    styles.halfInputContainer,
                    { 
                      backgroundColor: theme.inputBg, 
                      borderColor: focusedInput === 'lastName' ? theme.inputFocusedBorder : theme.inputBorder 
                    }
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: theme.inputTextColor, paddingLeft: 0 }]}
                    placeholder="Last Name"
                    placeholderTextColor="#94a3b8"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCorrect={false}
                    onFocus={() => setFocusedInput('lastName')}
                    onBlur={() => setFocusedInput(null)}
                  />
                </View>
              </View>

              <View 
                style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: focusedInput === 'email' ? theme.inputFocusedBorder : theme.inputBorder 
                  }
                ]}
              >
                <Ionicons name="mail-outline" size={18} color={focusedInput === 'email' ? '#3b82f6' : '#94a3b8'} style={styles.inputIcon} />
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

              <View 
                style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: focusedInput === 'password' ? theme.inputFocusedBorder : theme.inputBorder 
                  }
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={focusedInput === 'password' ? '#3b82f6' : '#94a3b8'} style={styles.inputIcon} />
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
                    size={18} 
                    color="#94a3b8" 
                  />
                </TouchableOpacity>
              </View>

              {renderPasswordStrength()}

              <View 
                style={[
                  styles.inputContainer, 
                  { 
                    backgroundColor: theme.inputBg, 
                    borderColor: focusedInput === 'confirmPassword' ? theme.inputFocusedBorder : theme.inputBorder 
                  }
                ]}
              >
                <Ionicons name="lock-closed-outline" size={18} color={focusedInput === 'confirmPassword' ? '#3b82f6' : '#94a3b8'} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: theme.inputTextColor }]}
                  placeholder="Confirm Password"
                  placeholderTextColor="#94a3b8"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              <TouchableOpacity
                style={styles.buttonContainer}
                onPress={handleRegister}
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
                    <Text style={styles.buttonText}>Submit Details</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity 
            onPress={() => {
              triggerHaptic();
              navigation.navigate('Login');
            }}
            style={styles.loginLink}
            activeOpacity={0.7}
          >
            <Text style={[styles.linkTextText, { color: theme.textSecondary }]}>
              Already have an account? <Text style={[styles.linkTextHighlight, { color: theme.linkText }]}>Sign In</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Web Onboarding Modal (Church Registration) */}
      <Modal
        visible={showChurchModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowChurchModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.modalCard, { backgroundColor: isDarkMode ? '#1e293b' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#ccfbf1' }]}>
                <Ionicons name="business" size={28} color="#0f766e" />
              </View>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Register Church</Text>
            </View>
            <Text style={[styles.modalText, { color: theme.textSecondary }]}>
              Registering a new church involves setting up multitenant database domains, subscribing to a platform tier, and uploading custom branding logs.
            </Text>
            <Text style={[styles.modalTextHighlight, { color: theme.textPrimary }]}>
              Please complete church onboarding on our desktop web portal.
            </Text>
            <View style={styles.modalBtns}>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnCancel, { borderColor: theme.inputBorder }]} 
                onPress={() => { triggerHaptic(); setShowChurchModal(false); }}
              >
                <Text style={[styles.modalBtnTextCancel, { color: theme.textSecondary }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, styles.modalBtnConfirm]} 
                onPress={openWebPortal}
              >
                <Text style={styles.modalBtnTextConfirm}>Open Web Portal</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    top: '10%',
    left: -80,
  },
  ambientGlow2: {
    position: 'absolute',
    width: 260,
    height: 260,
    borderRadius: 130,
    bottom: '12%',
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
  },
  backBtn: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 20,
    padding: 8,
    borderRadius: 12,
    zIndex: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
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
  stepTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  typeStepContainer: {
    width: '100%',
  },
  choiceCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    marginBottom: 14,
  },
  choiceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  choiceIconContainer: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  choiceTextContainer: {
    flex: 1,
  },
  choiceTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  choiceDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  searchStepContainer: {
    width: '100%',
  },
  resultsScroll: {
    maxHeight: 220,
    marginTop: 6,
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultLocation: {
    fontSize: 11,
    marginTop: 2,
  },
  noResultsText: {
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 20,
  },
  formStepContainer: {
    width: '100%',
  },
  selectedChurchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eff6ff',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    maxWidth: '100%',
  },
  selectedChurchBadgeText: {
    fontSize: 12,
    color: '#1e40af',
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
  },
  halfInputContainer: {
    flex: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  eyeIcon: {
    padding: 8,
  },
  strengthContainer: {
    marginBottom: 14,
    paddingHorizontal: 4,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  strengthBar: {
    height: 4,
    flex: 1,
    borderRadius: 2,
  },
  criteriaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  criteriaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '47%',
  },
  criteriaText: {
    fontSize: 11,
    fontWeight: '500',
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
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  loginLink: {
    marginTop: 16,
    alignItems: 'center',
  },
  linkTextText: {
    fontSize: 13,
  },
  linkTextHighlight: {
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 18,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalText: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 12,
  },
  modalTextHighlight: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 20,
  },
  modalBtns: {
    flexDirection: 'row',
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    borderWidth: 1,
  },
  modalBtnConfirm: {
    backgroundColor: '#0f766e',
  },
  modalBtnTextCancel: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBtnTextConfirm: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});

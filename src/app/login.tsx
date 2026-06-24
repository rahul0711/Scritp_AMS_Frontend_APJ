import { useState, useRef } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  StyleSheet,
  TextInput as TextInputType,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { login } from '@/services/auth';
import { useAuthStore } from '@/store/authStore';
import logo from '../../assets/logos.png';

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const passwordRef = useRef<TextInputType>(null);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { allRecords, role } = await login(username.trim(), password);
      setAuth(allRecords, role);
      router.replace(role === 'faculty' ? '/faculty' : '/student');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior="padding"
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 24}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Blue Header ── */}
        <LinearGradient
          colors={['#1565C0', '#1E88E5', '#42A5F5']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image source={logo} style={styles.logo} resizeMode="contain" />
          <Text style={styles.appName}>Attendance Management System</Text>
          <Text style={styles.appSub}>Powered by Script India</Text>
        </LinearGradient>

        {/* ── White Card ── */}
        <View style={styles.card}>
          <Text style={styles.welcomeTitle}>Welcome Back</Text>
          <Text style={styles.welcomeSub}>Sign in to your account</Text>

          {/* Username */}
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#b0b8c9"
            value={username}
            onChangeText={(t) => { setUsername(t); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            blurOnSubmit={false}
          />

          {/* Password */}
          <Text style={[styles.label, { marginTop: 14 }]}>Password</Text>
          <TextInput
            ref={passwordRef}
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#b0b8c9"
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#1565C0', '#42A5F5']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginGradient}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.loginText}>Sign In</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          © {new Date().getFullYear()} Script India. All rights reserved.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#EBF3FF',
  },
  scroll: {
    flexGrow: 1,
    alignItems: 'center',
    paddingBottom: 36,
  },

  /* Header */
  header: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 72,
    paddingBottom: 52,
    paddingHorizontal: 28,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  logo: {
    width: 150,
    height: 90,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  appName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  appSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
    letterSpacing: 0.5,
  },

  /* Card */
  card: {
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 30,
    marginTop: -28,
    elevation: 6,
    shadowColor: '#1565C0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.10,
    shadowRadius: 16,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0D1B3E',
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 13,
    color: '#7A8BAD',
    marginBottom: 24,
  },

  /* Inputs */
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#3D5080',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: '#D6E4FF',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0D1B3E',
    backgroundColor: '#F4F8FF',
  },

  /* Error */
  errorBox: {
    backgroundColor: '#FFF0F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 14,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  errorText: {
    fontSize: 13,
    color: '#DC2626',
    fontWeight: '500',
  },

  /* Button */
  loginBtn: {
    marginTop: 24,
    borderRadius: 14,
    overflow: 'hidden',
  },
  loginGradient: {
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* Footer */
  footer: {
    fontSize: 11,
    color: '#9BACC8',
    textAlign: 'center',
    marginTop: 28,
    paddingHorizontal: 20,
  },
});

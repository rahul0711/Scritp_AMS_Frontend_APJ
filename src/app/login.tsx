import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { login } from '@/services/auth';
import logo from '../../assets/logo.png';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { user, role } = await login(username.trim(), password);
      router.replace({
        pathname: role === 'faculty' ? '/faculty' : '/student',
        params: { user: JSON.stringify(user) },
      });
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top spacer ── */}
        <View style={styles.topSpacer} />

        {/* ── Script India Logo ── */}
        <View style={styles.logoWrapper}>
          <Image source={logo} style={styles.logoImage} resizeMode="contain" />
        </View>

        {/* ── App Title ── */}
        <Text style={styles.appTitle}>AMS QR Scanner</Text>
        <Text style={styles.appSubtitle}>Employee Attendance System</Text>

        {/* ── Login Card ── */}
        <View style={styles.card}>
          {/* Username */}
          <Text style={styles.fieldLabel}>Username</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your username"
            placeholderTextColor="#aab0c0"
            value={username}
            onChangeText={text => { setUsername(text); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />

          {/* Password */}
          <Text style={styles.fieldLabel}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            placeholderTextColor="#aab0c0"
            value={password}
            onChangeText={text => { setPassword(text); setError(''); }}
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />

          {/* Error */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Bottom spacer ── */}
        <View style={styles.bottomSpacer} />

        {/* ── Footer ── */}
        <Text style={styles.footer}>Design &amp; Developed By SCRIPT INDIA</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 24,
  },

  /* ── Spacers ── */
  topSpacer: {
    height: 60,
  },
  bottomSpacer: {
    flex: 1,
    minHeight: 40,
  },

  /* ── Logo ── */
  logoWrapper: {
    marginBottom: 28,
    alignItems: 'center',
  },
  logoImage: {
    width: 160,
    height: 56,
  },

  /* ── Titles ── */
  appTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: '#1e3a8a',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  appSubtitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    marginBottom: 28,
    letterSpacing: 0.2,
  },

  /* ── Card ── */
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 26,
    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // Android shadow
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e8ecf4',
  },

  /* ── Form fields ── */
  fieldLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 8,
    marginTop: 4,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#d1d9e8',
    borderRadius: 10,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#1a1a2e',
    backgroundColor: '#fafbff',
    marginBottom: 16,
  },

  /* ── Error ── */
  errorText: {
    color: '#e53935',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 12,
  },

  /* ── Login button ── */
  loginBtn: {
    backgroundColor: '#1e3a8a',
    borderRadius: 10,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loginBtnText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },

  /* ── Footer ── */
  footer: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1a1a2e',
    textAlign: 'center',
    paddingBottom: 10,
  },
});

import { useState } from 'react';
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
} from 'react-native';
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

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { allRecords, role } = await login(username.trim(), password);
      // Persist to store (AsyncStorage backed)
      setAuth(allRecords, role);
      router.replace(role === 'faculty' ? '/faculty' : '/student');
    } catch (err: any) {
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-neutral-100">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          contentContainerClassName="flex-grow justify-center items-center px-7 py-10"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo */}
          <Image
            source={logo}
            className="w-40 h-40 mb-8"
            resizeMode="contain"
          />

          {/* Card */}
          <View
            className="w-full bg-white rounded-2xl px-6 py-7"
            style={{ elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 }}
          >
            <Text className="text-[22px] font-bold text-neutral-900 mb-1">
              Welcome Back
            </Text>
            <Text className="text-sm text-neutral-400 mb-6">
              Sign in to continue
            </Text>

            {/* Username */}
            <Text className="text-[13px] font-semibold text-neutral-700 mb-1.5">
              Username
            </Text>
            <TextInput
              className="h-12 border border-neutral-200 rounded-xl px-3.5 text-[15px] text-neutral-900 bg-neutral-50 mb-4"
              placeholder="Enter your username"
              placeholderTextColor="#b0b0b0"
              value={username}
              onChangeText={text => { setUsername(text); setError(''); }}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />

            {/* Password */}
            <Text className="text-[13px] font-semibold text-neutral-700 mb-1.5">
              Password
            </Text>
            <TextInput
              className="h-12 border border-neutral-200 rounded-xl px-3.5 text-[15px] text-neutral-900 bg-neutral-50 mb-4"
              placeholder="Enter your password"
              placeholderTextColor="#b0b0b0"
              value={password}
              onChangeText={text => { setPassword(text); setError(''); }}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />

            {/* Error */}
            {error ? (
              <Text className="text-red-600 text-[13px] font-medium text-center mb-3">
                {error}
              </Text>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-[#1a1a2e] rounded-xl h-[50px] items-center justify-center mt-1 ${loading ? 'opacity-70' : ''}`}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text className="text-white text-base font-semibold tracking-wide">
                  Login
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <Text className="text-xs text-neutral-400 text-center mt-8">
            Designed & Developed By SCRIPT INDIA
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

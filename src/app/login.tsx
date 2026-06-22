import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { login } from '@/services/auth';
import logo from '../../assets/logo.png';

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
      className="flex-1 bg-[#123499]"
    >
      {/* ── Branded header ── */}
      <View className="flex-1 items-center justify-center px-6">
        {/* Logo card */}
        <View className="w-64 h-20 bg-white rounded-md items-center justify-center mb-7 px-4 shadow-md">
          <Image source={logo} className="w-56 h-16" resizeMode="contain" />
        </View>

        {/* App name */}
        <Text className="text-white text-3xl font-black tracking-widest uppercase mb-1">
          Script AMS
        </Text>
        <Text className="text-white/50 text-xs tracking-[3px] uppercase mb-6">
          Attendance Management System
        </Text>

        {/* Powered by badge */}
        <View className="flex-row items-center gap-x-1">
          <Text className="text-white/40 text-xs">Powered by</Text>
          <Text className="text-white/60 text-xs font-semibold"> SCRIPT </Text>
          <View className="bg-[#0d2580] border border-white/20 px-2 py-0.5 rounded-sm">
            <Text className="text-white text-xs font-bold tracking-wider">INDIA</Text>
          </View>
        </View>
      </View>

      {/* ── Login card ── */}
      <View className="bg-white rounded-t-3xl px-6 pt-4 pb-10 shadow-2xl">
        {/* Drag handle */}
        <View className="w-10 h-1 bg-gray-200 rounded-full self-center mb-7" />

        <Text className="text-amber-500 text-xs font-bold tracking-[3px] uppercase mb-1">
          Secure Access
        </Text>
        <Text className="text-gray-900 text-2xl font-bold mb-6">
          Sign in to your account
        </Text>

        {/* Username */}
        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Username
        </Text>
        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 h-14 mb-4">
          <Ionicons name="person-outline" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 text-gray-800 text-sm ml-3"
            placeholder="Enter your username"
            placeholderTextColor="#9ca3af"
            value={username}
            onChangeText={text => { setUsername(text); setError(''); }}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
          />
        </View>

        {/* Password */}
        <Text className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
          Password
        </Text>
        <View className="flex-row items-center bg-gray-50 border border-gray-100 rounded-xl px-4 h-14 mb-2">
          <Ionicons name="lock-closed-outline" size={18} color="#9ca3af" />
          <TextInput
            className="flex-1 text-gray-800 text-sm ml-3"
            placeholder="••••••••"
            placeholderTextColor="#9ca3af"
            value={password}
            onChangeText={text => { setPassword(text); setError(''); }}
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setShowPassword(v => !v)} hitSlop={10}>
            <Ionicons
              name={showPassword ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color="#9ca3af"
            />
          </TouchableOpacity>
        </View>

        {/* Forgot password */}
        <View className="items-end mb-5">
          <TouchableOpacity hitSlop={10}>
            <Text className="text-[#123499] text-sm font-semibold">Forgot password?</Text>
          </TouchableOpacity>
        </View>

        {/* Error */}
        {error ? (
          <View className="bg-red-50 border border-red-100 rounded-lg px-4 py-3 mb-4">
            <Text className="text-red-500 text-xs font-medium text-center">{error}</Text>
          </View>
        ) : null}

        {/* Sign in button */}
        <TouchableOpacity
          className="bg-[#123499] rounded-xl h-14 items-center justify-center flex-row gap-x-2"
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text className="text-white font-bold text-sm tracking-[4px] uppercase">
                Sign In
              </Text>
              <Ionicons name="arrow-forward" size={16} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text className="text-gray-300 text-xs text-center mt-5">
          Created by Script India
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import { useRouter, useRootNavigationState } from 'expo-router';
import logo from '../../../assets/logo.png';

export default function SplashScreen() {
  const router = useRouter();
  const rootState = useRootNavigationState();

  useEffect(() => {
    if (!rootState?.key) return;
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 2500);
    return () => clearTimeout(timer);
  }, [rootState?.key]);

  return (
    <View className="flex-1 items-center justify-center bg-[#123499]">

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
  );
}

import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

type UserData = {
  userName: string;
  courseName: string;
  semesterName: string;
};

export default function StudentDashboard() {
  const { user } = useLocalSearchParams<{ user: string }>();
  const userData: UserData | null = user ? JSON.parse(user) : null;

  return (
    <View className="flex-1 bg-[#123499] items-center justify-center px-6">
      <Text className="text-white text-3xl font-black mb-2">Student Dashboard</Text>
      {userData && (
        <Text className="text-white/70 text-base">Welcome, {userData.userName}</Text>
      )}
    </View>
  );
}

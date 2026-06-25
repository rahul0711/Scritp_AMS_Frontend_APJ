import { login } from "@/services/auth";
import { useAuthStore } from "@/store/authStore";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Eye, EyeOff, GraduationCap, Lock, User } from "lucide-react-native";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TextInput as TextInputType,
  TouchableOpacity,
  View,
} from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loginMode, setLoginMode] = useState<"faculty" | "student">("faculty");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const passwordRef = useRef<TextInputType>(null);

  async function handleLogin() {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { allRecords, role } = await login(username.trim(), password);
      setAuth(allRecords, role);
      router.replace(role === "faculty" ? "/faculty" : "/student");
    } catch (err: any) {
      setError(err?.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LinearGradient
      colors={["#1A4FC4", "#0A2E8A", "#061E6E"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.3, y: 1 }}
      style={styles.gradientBg}
    >
      {/* Decorative circles */}
      <View style={styles.circleLarge} />
      <View style={styles.circleMedium} />
      <View style={styles.circleBottomRight} />

      {/* Dot grid top-right */}
      <View style={styles.dotGrid}>
        {[...Array(5)].map((_, r) => (
          <View key={r} style={{ flexDirection: "row", gap: 7, marginBottom: 7 }}>
            {[...Array(5)].map((_, c) => (
              <View
                key={c}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: 2,
                  backgroundColor: "rgba(255,255,255,0.25)",
                }}
              />
            ))}
          </View>
        ))}
      </View>

      <KeyboardAvoidingView
        style={styles.root}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header Logo (above card) ── */}
          <View style={styles.headerLogo}>
            <Text style={styles.logoScript}>SCRIPT</Text>
            <View style={styles.logoIndiaBox}>
              <Text style={styles.logoIndia}>INDIA</Text>
            </View>
          </View>

          {/* ── Login Card ── */}
          <View style={styles.card}>
            {/* Graduation Cap Icon */}
            <View style={styles.capCircle}>
              <GraduationCap size={28} color="#1A4FC4" />
            </View>

            {/* Title & Subtitle */}
            <Text style={styles.title}>
              {loginMode === "faculty" ? "Faculty Portal" : "Student Portal"}
            </Text>
            <Text style={styles.subtitle}>
              {loginMode === "faculty"
                ? "Manage Classes. Mark Attendance. Build Records."
                : "View Attendance. Track Progress. Check Reports."}
            </Text>

            {/* Username / Enrollment Input */}
            <View style={styles.inputContainer}>
              <User size={18} color="#8A9BB8" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={loginMode === "student" ? "Enrollment Number" : "Username"}
                placeholderTextColor="#B0BDD0"
                value={username}
                onChangeText={(t) => {
                  setUsername(t);
                  setError("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                blurOnSubmit={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Lock size={18} color="#8A9BB8" style={styles.inputIcon} />
              <TextInput
                ref={passwordRef}
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#B0BDD0"
                value={password}
                onChangeText={(t) => {
                  setPassword(t);
                  setError("");
                }}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
              >
                {showPassword ? (
                  <EyeOff size={18} color="#8A9BB8" />
                ) : (
                  <Eye size={18} color="#B0BDD0" />
                )}
              </TouchableOpacity>
            </View>

            {/* Error Message */}
            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Login Button */}
            <TouchableOpacity
              style={styles.loginBtn}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.loginText}>Login</Text>
              )}
            </TouchableOpacity>

            {/* Mode Switch */}
            <TouchableOpacity
              activeOpacity={0.7}
              style={styles.modeSwitchContainer}
              onPress={() => {
                setLoginMode(loginMode === "faculty" ? "student" : "faculty");
                setUsername("");
                setPassword("");
                setError("");
              }}
            >
              <Text style={styles.modeSwitchText}>
                {loginMode === "faculty" ? "Student Login" : "Faculty Login"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Developed and Designed by</Text>
            <View style={styles.footerLogoRow}>
              <Text style={styles.logoScriptSmall}>SCRIPT</Text>
              <View style={styles.logoIndiaBoxSmall}>
                <Text style={styles.logoIndiaSmall}>INDIA</Text>
              </View>
            </View>
            <Text style={styles.footerSubtitle}>
              Empowering Education with Technology
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  gradientBg: {
    flex: 1,
  },
  scroll: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },

  // ── Decorative Background ──
  circleLarge: {
    position: "absolute",
    top: -120,
    left: -120,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  circleMedium: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  circleBottomRight: {
    position: "absolute",
    bottom: -80,
    right: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  dotGrid: {
    position: "absolute",
    top: 48,
    right: 24,
  },

  // ── Header Logo (above card) ──
  headerLogo: {
    alignItems: "center",
    marginBottom: 32,
    backgroundColor: "#ffffff",
    padding: 10,
    // borderRadius: 10,
  },
  logoScript: {
    fontSize: 32,
    fontWeight: "800",
    color: "#000000",
    letterSpacing: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  logoIndiaBox: {
    backgroundColor: "#1A4FC4",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 5,
    borderRadius: 4,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 130,
  },
  logoIndia: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 8,
    paddingLeft: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },

  // ── White Card ──
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 28,
    alignItems: "center",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
  },

  // Graduation cap circle
  capCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#EBF1FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  // Info text
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1A3C8C",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12.5,
    color: "#64748B",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 18,
  },

  // Form fields
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#DDE4F0",
    borderRadius: 14,
    height: 52,
    backgroundColor: "#F8FAFF",
    paddingHorizontal: 14,
    marginBottom: 14,
    width: "100%",
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 14.5,
    color: "#0F172A",
  },
  eyeButton: {
    padding: 4,
  },

  // Error
  errorBox: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    width: "100%",
  },
  errorText: {
    color: "#DC2626",
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "center",
  },

  // Login button
  loginBtn: {
    backgroundColor: "#1A4FC4",
    borderRadius: 14,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 4,
    marginBottom: 14,
    elevation: 4,
    shadowColor: "#1A4FC4",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  // Mode switch
  modeSwitchContainer: {
    paddingVertical: 4,
  },
  modeSwitchText: {
    color: "#1A4FC4",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },

  // ── Footer ──
  footerContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.55)",
    fontSize: 11.5,
    fontWeight: "500",
    marginBottom: 8,
  },
  footerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 6,
  },
  logoScriptSmall: {
    fontSize: 17,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  logoIndiaBoxSmall: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIndiaSmall: {
    color: "#1A4FC4",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    paddingLeft: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  footerSubtitle: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 11,
    textAlign: "center",
  },
});

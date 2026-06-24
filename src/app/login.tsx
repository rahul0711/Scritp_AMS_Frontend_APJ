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
      colors={["#0A42BA", "#002570"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={styles.gradientBg}
    >
      <KeyboardAvoidingView
        style={styles.root}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 24}
      >
        {/* Abstract Background Elements */}
        <View style={styles.circleOverlay} />
        <View style={styles.circleOverlay2} />
        <View style={styles.dotGrid}>
          {[...Array(6)].map((_, r) => (
            <View key={r} style={{ flexDirection: "row", gap: 6 }}>
              {[...Array(6)].map((_, c) => (
                <View
                  key={c}
                  style={{
                    width: 4,
                    height: 4,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.18)",
                  }}
                />
              ))}
            </View>
          ))}
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.cardContainer}>
            {/* ── Login Card ── */}
            <View style={styles.card}>
              {/* Logo SCRIPT INDIA */}
              <View style={styles.logoContainer}>
                <Text style={styles.logoScript}>SCRIPT</Text>
                <View style={styles.logoIndiaBox}>
                  <Text style={styles.logoIndia}>INDIA</Text>
                </View>
              </View>

              {/* Divider with Graduation Cap */}
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <View style={styles.capCircle}>
                  <GraduationCap size={20} color="#0D4EBA" />
                </View>
                <View style={styles.dividerLine} />
              </View>

              {/* Attendance System Info */}
              <Text style={styles.title}>Student Attendance System</Text>
              <Text style={styles.subtitle}>
                Mark Attendance. Track Progress. Build Future.
              </Text>

              {/* Username Input */}
              <View style={styles.inputContainer}>
                <User size={20} color="#5A6B8F" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  placeholderTextColor="#A0AEC0"
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
                <Lock size={20} color="#5A6B8F" style={styles.inputIcon} />
                <TextInput
                  ref={passwordRef}
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#A0AEC0"
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
                    <EyeOff size={20} color="#5A6B8F" />
                  ) : (
                    <Eye size={20} color="#5A6B8F" />
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

              {/* Forgot Password Link */}
              <TouchableOpacity activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* ── Footer ── */}
          <View style={styles.footerContainer}>
            <Text style={styles.footerText}>Developed and Designed by</Text>
            <View style={styles.footerLogoRow}>
              <View style={styles.footerLine} />
              <View style={styles.footerLogoContainer}>
                <Text style={styles.logoScriptSmall}>SCRIPT</Text>
                <View style={styles.logoIndiaBoxSmall}>
                  <Text style={styles.logoIndiaSmall}>INDIA</Text>
                </View>
              </View>
              <View style={styles.footerLine} />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  cardContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  // Background decorative elements
  circleOverlay: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    borderWidth: 40,
    borderColor: "rgba(255, 255, 255, 0.02)",
  },
  circleOverlay2: {
    position: "absolute",
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 20,
    borderColor: "rgba(255, 255, 255, 0.02)",
  },
  dotGrid: {
    position: "absolute",
    top: 50,
    right: 30,
    gap: 6,
  },
  // White card
  card: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    paddingHorizontal: 24,
    paddingVertical: 36,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  // Logo SCRIPT INDIA
  logoContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoScript: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1E293B",
    letterSpacing: 8,
    textAlign: "center",
    textTransform: "uppercase",
  },
  logoIndiaBox: {
    backgroundColor: "#0D4EBA",
    width: 180,
    paddingVertical: 6,
    borderRadius: 4,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIndia: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 9,
    paddingLeft: 9, // offsets trailing letterSpacing for perfect centering
    textAlign: "center",
    textTransform: "uppercase",
  },
  // Divider cap row
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    gap: 10,
  },
  dividerLine: {
    height: 1,
    backgroundColor: "#E2E8F0",
    flex: 1,
  },
  capCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#EBF3FF",
    borderWidth: 1.5,
    borderColor: "#D6E4FF",
    alignItems: "center",
    justifyContent: "center",
  },
  // Info text
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0D4EBA",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 4,
    marginBottom: 24,
  },
  // Form fields
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    height: 54,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 15,
    color: "#0F172A",
  },
  eyeButton: {
    padding: 4,
  },
  // Login button
  loginBtn: {
    backgroundColor: "#0D4EBA",
    borderRadius: 16,
    height: 52,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 16,
  },
  loginText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  forgotText: {
    color: "#0D4EBA",
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
  },
  // Footer
  footerContainer: {
    marginTop: 40,
    alignItems: "center",
  },
  footerText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 8,
  },
  footerLogoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "80%",
    gap: 12,
  },
  footerLine: {
    height: 1,
    backgroundColor: "rgba(255,255,255,0.2)",
    flex: 1,
  },
  footerLogoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoScriptSmall: {
    fontSize: 18,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  logoIndiaBoxSmall: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIndiaSmall: {
    color: "#0D4EBA",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    paddingLeft: 2,
    textAlign: "center",
    textTransform: "uppercase",
  },
  footerSubtitle: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 11,
    marginTop: 8,
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: "#FFF1F2",
    borderWidth: 1,
    borderColor: "#FECDD3",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
});

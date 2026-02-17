import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Animated, Modal, StatusBar, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Button } from "../../components/promotions/atoms/Button";
import { Input } from "../../components/promotions/atoms/Input";
import { Text } from "../../components/promotions/atoms/Text";
import { PromotionList } from "../../components/promotions/organisms/PromotionList";
import { Promotion } from "../../store/promotions/promotionsSlice";
import { ThemeProvider, useTheme } from "../../theme/promotions/ThemeProvider";
import { appStyles } from "../../theme/promotions/styles";
import { api } from "../../utils/promotions/api";

type ValidationStatus = "IDLE" | "LOADING" | "ENABLED" | "DISABLED" | "INVALID";

// Inner component that uses the theme
function PromotionsScreenContent() {
  const router = useRouter();
  const { toggleTheme, isDark, theme } = useTheme();
  const themeIconAnim = useRef(new Animated.Value(isDark ? 1 : 0)).current;

  // Validation modal state
  const [showValidateModal, setShowValidateModal] = useState(false);
  const [validateCode, setValidateCode] = useState("");
  const [validationStatus, setValidationStatus] = useState<ValidationStatus>("IDLE");
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    Animated.timing(themeIconAnim, {
      toValue: isDark ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [isDark, themeIconAnim]);

  const handleEditPromotion = useCallback((promotion: Promotion) => {
    router.push({ pathname: "/promotions/create", params: { promotion: JSON.stringify(promotion) } });
  }, []);

  const handleValidate = async () => {
    if (!validateCode.trim()) {
      Alert.alert("Error", "Please enter a promo code to validate");
      return;
    }

    setValidating(true);
    setValidationStatus("LOADING");

    try {
      await api.post("/promotions/validate", {
        promo_code: validateCode.trim().toUpperCase(),
        order_amount: 100,
      });
      
      // If no error was thrown, validation was successful
      setValidationStatus("ENABLED");
    } catch (error: any) {
      console.log("Validation error caught:", error);
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message || "";
      
      console.log("Error status:", status, "message:", message);
      
      if (status === 404) {
        setValidationStatus("INVALID");
      } else if (
        message &&
        typeof message === "string" &&
        (message.toLowerCase().includes("inactive") || 
         message.toLowerCase().includes("expired") || 
         message.toLowerCase().includes("not started") || 
         message.toLowerCase().includes("usage limit"))
      ) {
        setValidationStatus("DISABLED");
      } else {
        setValidationStatus("INVALID");
      }
    } finally {
      setValidating(false);
    }
  };

  const closeValidateModal = () => {
    setShowValidateModal(false);
    setValidateCode("");
    setValidationStatus("IDLE");
  };

  return (
    <View style={[appStyles.homeScreen.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={appStyles.homeScreen.headerGradient}
      >
        <View style={appStyles.homeScreen.headerContent}>
          <View>
            <Text style={appStyles.homeScreen.headerTitle}>Promotions</Text>
            <Text style={appStyles.homeScreen.headerSubtitle}>Manage your discount codes</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={toggleTheme}
            style={[appStyles.homeScreen.themeButton, { backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme"
          >
            <View style={appStyles.homeScreen.themeButtonIconStack}>
              <Animated.Text
                style={[
                  appStyles.homeScreen.themeButtonIcon,
                  {
                    opacity: themeIconAnim,
                    transform: [
                      {
                        scale: themeIconAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                  },
                ]}
              >
                ☀︎
              </Animated.Text>
              <Animated.Text
                style={[
                  appStyles.homeScreen.themeButtonIcon,
                  {
                    opacity: themeIconAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [1, 0],
                    }),
                    transform: [
                      {
                        scale: themeIconAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [1, 0.9],
                        }),
                      },
                    ],
                  },
                ]}
              >
                ☾
              </Animated.Text>
            </View>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Promotion List */}
      <PromotionList onEditPromotion={handleEditPromotion} />

      {/* Create Button */}
      <View style={appStyles.homeScreen.createButtonContainer}>
        <Button
          title="+ Create New Promotion"
          onPress={() => router.push("/promotions/create")}
          style={{ backgroundColor: theme.primary }}
        />
      </View>

      {/* Floating Validate Button */}
      <TouchableOpacity
        style={[appStyles.homeScreen.floatingButton, { backgroundColor: theme.secondary }]}
        onPress={() => setShowValidateModal(true)}
        activeOpacity={0.8}
      >
        <Text style={appStyles.homeScreen.floatingButtonText}>✓</Text>
      </TouchableOpacity>

      {/* Validation Modal */}
      <Modal
        visible={showValidateModal}
        transparent
        animationType="fade"
        onRequestClose={closeValidateModal}
      >
        <View style={appStyles.homeScreen.modalOverlay}>
          <View style={[appStyles.homeScreen.modalContent, { backgroundColor: theme.card }]}>
            <Text style={[appStyles.homeScreen.modalTitle, { color: theme.text }]}>Validate Promo Code</Text>
            
            <Input
              placeholder="Enter promo code"
              value={validateCode}
              onChangeText={(val) => {
                setValidateCode(val.toUpperCase());
                setValidationStatus("IDLE");
              }}
              autoCapitalize="characters"
              style={{ backgroundColor: theme.background, color: theme.text, borderColor: theme.border }}
            />
            
            <TouchableOpacity
              style={[
                appStyles.homeScreen.validateButton,
                { backgroundColor: theme.primary },
                (validating || !validateCode.trim()) && appStyles.homeScreen.validateButtonDisabled,
              ]}
              onPress={handleValidate}
              disabled={validating || !validateCode.trim()}
            >
              <Text style={appStyles.homeScreen.validateButtonText}>
                {validating ? "Validating..." : "Validate"}
              </Text>
            </TouchableOpacity>
            
            {/* Status Display */}
            {validationStatus !== "IDLE" && validationStatus !== "LOADING" && (
              <View
                style={[
                  appStyles.homeScreen.statusContainer,
                  validationStatus === "ENABLED" && appStyles.homeScreen.statusEnabled,
                  validationStatus === "DISABLED" && appStyles.homeScreen.statusDisabled,
                  validationStatus === "INVALID" && appStyles.homeScreen.statusInvalid,
                ]}
              >
                <Text
                  style={[
                    appStyles.homeScreen.statusText,
                    validationStatus === "ENABLED" && appStyles.homeScreen.statusTextEnabled,
                    validationStatus === "DISABLED" && appStyles.homeScreen.statusTextDisabled,
                    validationStatus === "INVALID" && appStyles.homeScreen.statusTextInvalid,
                  ]}
                >
                  {validationStatus === "ENABLED" && "✓ ENABLED"}
                  {validationStatus === "DISABLED" && "⚠ DISABLED"}
                  {validationStatus === "INVALID" && "✕ INVALID"}
                </Text>
              </View>
            )}
            
            <TouchableOpacity
              style={appStyles.homeScreen.closeButton}
              onPress={closeValidateModal}
            >
              <Text style={[appStyles.homeScreen.closeButtonText, { color: theme.textSecondary }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// Main export with ThemeProvider wrapper
export default function PromotionsScreen() {
  return (
    <ThemeProvider>
      <PromotionsScreenContent />
    </ThemeProvider>
  );
}

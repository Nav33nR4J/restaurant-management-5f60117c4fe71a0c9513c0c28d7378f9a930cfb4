import { LinearGradient } from "expo-linear-gradient";
import {
  ActivityIndicator,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";

import { useEffect, useMemo, useRef } from "react";
import useSafeNavigation from "../hooks/useSafeNavigation";
import { loadUserFromStorage } from "../store/authSlice";
import { Flavor, loadFlavorFromStorage, saveFlavorToStorage, setFlavor } from "../store/flavorSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { toggleTheme } from "../store/themeSlice";
import { appStyles } from "../styles";
import { getTheme } from "../theme";
import { Loggers } from "../utils/logger";

// Flavor options
const FLAVOR_OPTIONS: { id: Flavor; name: string; description: string; color: string }[] = [
  { 
    id: "HQ", 
    name: "Headquarters", 
    description: "Manage menus & pricing",
    color: "#7C3AED"
  },
  { 
    id: "USER", 
    name: "Customer", 
    description: "Browse & order food",
    color: "#E11D48"
  },
  { 
    id: "BRANCH", 
    name: "Branch", 
    description: "Manage stock & orders",
    color: "#2563EB"
  },
];

export default function Home() {
  const { safeReplace, safePush } = useSafeNavigation(300); // Increased delay for better transition
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const flavorLoading = useAppSelector((state) => state.flavor.loading);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = useMemo(() => getTheme(flavor, resolvedMode), [flavor, resolvedMode]);

  // Combine loading states
  const isLoading = authLoading || flavorLoading;

  // Load user from storage and flavor on mount
  useEffect(() => {
    Loggers.auth.info("App started, loading user from storage");
    dispatch(loadUserFromStorage());
    dispatch(loadFlavorFromStorage());
  }, [dispatch]);

  // Redirect to menu if already logged in using safe navigation
  // Use ref to prevent re-navigation loop when loading new user
  const navigationAttempted = useRef(false);
  useEffect(() => {
    // Only redirect after loading is complete and haven't attempted yet
    if (!isLoading && isLoggedIn && !navigationAttempted.current) {
      navigationAttempted.current = true;
      // Add a longer delay to ensure navigator is fully mounted and ready
      // This prevents the "action not handled" warning
      const timer = setTimeout(() => {
        Loggers.navigation.info("Auto-redirecting logged-in user to menu");
        // Use setTimeout again to ensure the navigator is completely ready
        setTimeout(() => {
          safeReplace("menu");
        }, 200);
      }, 500);
      
      return () => {
        clearTimeout(timer);
        navigationAttempted.current = false;
      };
    }
  }, [isLoading, isLoggedIn, safeReplace]);

  const handleOrderNow = () => {
    safePush("order");
  };

  const handleFlavorChange = (newFlavor: Flavor) => {
    dispatch(setFlavor(newFlavor));
    dispatch(saveFlavorToStorage(newFlavor));
    Loggers.flavor.info(`Flavor changed to ${newFlavor}`, { newFlavor });
  };

  if (isLoading) {
    return (
      <View style={[appStyles.home.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <View style={[appStyles.home.container, { backgroundColor: theme.background }]}>
      <ImageBackground
        source={{
          uri: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5",
        }}
        style={appStyles.home.hero}
      >
        <LinearGradient
          colors={[
            "rgba(0,0,0,0.85)",
            "rgba(0,0,0,0.55)",
            "rgba(0,0,0,0.95)",
          ]}
          style={StyleSheet.absoluteFill}
        />

        <View style={appStyles.home.heroContent}>
          <Text style={[appStyles.home.brand, { color: "#FFF" }]}>
            FoodHub
          </Text>

          <Text style={[appStyles.home.tagline, { color: theme.accent }]}>
            Fresh ingredients. Bold flavors.
          </Text>

          {/* Flavor Selector */}
          <View style={appStyles.home.flavorSelector}>
            <Text style={[appStyles.home.flavorLabel, { color: "#FFF" }]}>
              Select Mode:
            </Text>
            <View style={appStyles.home.flavorButtons}>
              {FLAVOR_OPTIONS.map((option) => (
                <Pressable
                  key={option.id}
                  onPress={() => handleFlavorChange(option.id)}
                  style={[
                    appStyles.home.flavorButton,
                    { 
                      backgroundColor: flavor === option.id ? option.color : "rgba(255,255,255,0.15)",
                      borderColor: flavor === option.id ? option.color : "rgba(255,255,255,0.3)",
                    },
                  ]}
                >
                  <Text style={[
                    appStyles.home.flavorButtonText,
                    { color: flavor === option.id ? "#FFF" : "rgba(255,255,255,0.7)" },
                  ]}>
                    {option.name}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <Pressable
            style={[appStyles.home.cta, { backgroundColor: theme.primary }]}
            onPress={handleOrderNow}
          >
            <Text style={appStyles.home.ctaText}>Order Now</Text>
          </Pressable>

          <Pressable
            style={appStyles.home.themeToggle}
            onPress={() => dispatch(toggleTheme())}
          >
            <Text style={[appStyles.home.themeToggleText, { color: "#FFF" }]}>
              Toggle {resolvedMode === "dark" ? "Light" : "Dark"}
            </Text>
          </Pressable>
        </View>
      </ImageBackground>
    </View>
  );
}


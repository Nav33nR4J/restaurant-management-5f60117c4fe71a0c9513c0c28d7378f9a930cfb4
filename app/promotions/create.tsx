import { router, useGlobalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Text } from "../../components/promotions/atoms/Text";
import { PromotionForm } from "../../components/promotions/organisms/PromotionForm";
import { Promotion } from "../../store/promotions/promotionsSlice";
import { ThemeProvider, useTheme } from "../../theme/promotions/ThemeProvider";
import { appStyles } from "../../theme/promotions/styles";
import { api } from "../../utils/promotions/api";

// Inner component that uses the theme
function CreatePromotionContent() {
  const { isDark, theme } = useTheme();
  const params = useGlobalSearchParams();
  const editingPromotion = params.promotion ? JSON.parse(params.promotion as string) as Promotion : undefined;
  const isEditing = !!editingPromotion;
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      if (isEditing && editingPromotion?.id) {
        await api.put(`/promotions/${editingPromotion.id}`, data);
      } else {
        await api.post("/promotions", data);
      }
      router.back();
    } catch (error) {
      console.error("Error saving promotion:", error);
      Alert.alert("Error", "Failed to save promotion");
    } finally {
      setIsLoading(false);
    }
  }, [isEditing, editingPromotion]);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const handleBack = useCallback(() => {
    router.back();
  }, []);

  return (
    <SafeAreaView style={[appStyles.createPromotionScreen.container, { backgroundColor: isDark ? theme.background : "#FFFFFF" }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <LinearGradient
        colors={[theme.gradientStart, theme.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={appStyles.createPromotionScreen.headerGradient}
      >
        <View style={appStyles.createPromotionScreen.headerContent}>
          <TouchableOpacity onPress={handleBack} style={appStyles.createPromotionScreen.backButton}>
            <Text style={appStyles.createPromotionScreen.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={appStyles.createPromotionScreen.headerTitle}>
            {isEditing ? "Edit Promotion" : "Create Promotion"}
          </Text>
          <View style={appStyles.createPromotionScreen.placeholder} />
        </View>
      </LinearGradient>

      {/* Form */}
      <ScrollView 
        contentContainerStyle={appStyles.createPromotionScreen.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <PromotionForm 
          initialData={editingPromotion}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

// Main export with ThemeProvider wrapper
export default function CreatePromotionScreen() {
  return (
    <ThemeProvider>
      <CreatePromotionContent />
    </ThemeProvider>
  );
}


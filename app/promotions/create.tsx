import { router, useGlobalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StatusBar, TouchableOpacity, View } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { Text } from "../../components/promotions/atoms/Text";
import { PromotionForm } from "../../components/promotions/organisms/PromotionForm";
import { CustomItemDiscount, Promotion } from "../../store/promotions/promotionsSlice";
import { ThemeProvider, useTheme } from "../../theme/promotions/ThemeProvider";
import { appStyles } from "../../theme/promotions/styles";
import { api } from "../../utils/promotions/api";

// Transform Promotion to form initial data format
const transformPromotionToFormData = (promotion?: Promotion) => {
  if (!promotion) return undefined;
  
  return {
    id: promotion.id,
    promo_code: promotion.promo_code,
    title: promotion.title,
    discount_type: promotion.discount_type,
    discount_value: promotion.discount_value,
    min_order_amount: promotion.min_order_amount,
    max_discount_amount: promotion.max_discount_amount ?? undefined,
    usage_limit: promotion.usage_limit ?? null,
    start_date: promotion.start_at.split(' ')[0], // Extract date part
    end_date: promotion.end_at.split(' ')[0],
    is_active: promotion.status === 'ACTIVE',
    description: promotion.description || undefined,
    custom_items: promotion.custom_items as CustomItemDiscount[] | undefined,
  };
};

// Inner component that uses the theme
function CreatePromotionContent() {
  const { isDark, theme } = useTheme();
  const params = useGlobalSearchParams();
  const editingPromotion = params.promotion 
    ? JSON.parse(params.promotion as string) as Promotion 
    : undefined;
  const isEditing = !!editingPromotion;
  const [isLoading, setIsLoading] = useState(false);

  // Transform the promotion data for the form
  const formInitialData = transformPromotionToFormData(editingPromotion);

  const handleSubmit = useCallback(async (data: any) => {
    setIsLoading(true);
    try {
      if (isEditing && editingPromotion?.id) {
        await api.put(`/promotions/${editingPromotion.id}`, data);
      } else {
        await api.post("/promotions", data);
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409 && message) {
        Alert.alert("Duplicate Promo Code", message);
      } else {
        Alert.alert("Error", "Failed to save promotion. Please try again.");
      }
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
          initialData={formInitialData}
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


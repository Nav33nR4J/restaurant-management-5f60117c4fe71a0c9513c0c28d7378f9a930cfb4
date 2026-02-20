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
  
  // Handle date format - remove time part if present
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    // If it contains space, it's datetime - extract just the date part
    if (dateStr.includes(' ')) {
      return dateStr.split(' ')[0];
    }
    return dateStr;
  };
  
  return {
    id: promotion.id,
    promo_code: promotion.promo_code,
    title: promotion.title,
    type: promotion.type,
    value: promotion.value,
    min_order_amount: promotion.min_order_amount,
    max_discount_amount: promotion.max_discount_amount ?? undefined,
    usage_limit: promotion.usage_limit ?? null,
    start_at: formatDate(promotion.start_at),
    end_at: formatDate(promotion.end_at),
    status: promotion.status,
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
      // Transform frontend field names to match backend API expectations
      const apiData = {
        promo_code: data.promo_code,
        title: data.title,
        // Backend expects type as PERCENTAGE, FIXED, or CUSTOM_ITEMS
        type: data.type,
        // Ensure value is a number (can be 0 for CUSTOM_ITEMS type)
        value: data.value != null ? Number(data.value) : 0,
        min_order_amount: data.min_order_amount,
        max_discount_amount: data.max_discount_amount,
        usage_limit: data.usage_limit,
        // Backend expects start_at and end_at
        start_at: data.start_at,
        end_at: data.end_at,
        description: data.description,
        // Backend expects is_active boolean
        is_active: data.is_active === true,
        custom_items: data.custom_items || [],
      };

      if (isEditing && editingPromotion?.id) {
        await api.put(`/promotions/${editingPromotion.id}`, apiData);
      } else {
        await api.post("/promotions", apiData);
      }
      router.back();
    } catch (error: any) {
      console.error("Error saving promotion:", error);
      const status = error?.response?.status;
      const message = error?.response?.data?.message;
      if (status === 409 && message) {
        Alert.alert("Duplicate Promo Code", message);
      } else if (status === 400 && message) {
        // Handle validation errors (including date validation)
        Alert.alert("Validation Error", message);
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


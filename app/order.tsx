import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
  View,
} from "react-native";

import useSafeNavigation from "../hooks/useSafeNavigation";
import { loadUserFromStorage, saveUserToStorage } from "../store/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { appStyles } from "../styles";
import { getTheme } from "../theme";
import { showError } from "../utils/alertUtils";
import { withOpacity } from "../utils/colorUtils";
import { AuthMessages } from "../utils/errorMessages";
import { Loggers } from "../utils/logger";
import {
  sanitizeInput,
  validateDOB,
  validateEmail,
  validateMinLength,
  validatePhone,
  validateRequired,
} from "../utils/validation";

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  dob: string;
  email: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  email?: string;
}

// Memoized form input component with validation state
const FormInput = memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  placeholderTextColor, 
  keyboardType, 
  maxLength, 
  multiline, 
  style, 
  theme,
  error,
  showError: showErr,
  onBlur
}: any) => (
  <View style={appStyles.order.inputGroup}>
    <Text style={[appStyles.order.label, { color: theme.text }]}>
      {label}
    </Text>
    <TextInput
      style={[
        appStyles.order.input, 
        { backgroundColor: theme.muted, color: theme.text }, 
        style,
        showErr && error ? { borderWidth: 1, borderColor: theme.primary } : {}
      ]}
      placeholder={placeholder}
      placeholderTextColor={placeholderTextColor}
      value={value}
      onChangeText={onChangeText}
      keyboardType={keyboardType}
      maxLength={maxLength}
      multiline={multiline}
      onBlur={onBlur}
    />
    {showErr && error && (
      <Text style={[appStyles.order.errorText, { color: theme.primary }]}>
        {error}
      </Text>
    )}
  </View>
));
FormInput.displayName = "FormInput";

// Memoized initial view component
const OrderInitialView = memo(({ theme, onOrderPress }: { theme: any; onOrderPress: () => void }) => (
  <View style={[appStyles.order.container, { backgroundColor: theme.background }]}>
    <LinearGradient
      colors={[
        withOpacity(theme.primary, 0.12),
        withOpacity(theme.accent, 0.06),
      ]}
      style={StyleSheet.absoluteFill}
    />
    
    <View style={appStyles.order.orderContainer}>
      <View style={appStyles.order.orderCard}>
        <View style={[appStyles.order.iconContainer, { backgroundColor: theme.primary }]}>
          <Ionicons name="restaurant-outline" size={48} color="#FFF" />
        </View>
        
        <Text style={[appStyles.order.orderTitle, { color: theme.text }]}>
          Ready to Order?
        </Text>
        
        <Text style={[appStyles.order.orderSubtitle, { color: withOpacity(theme.text, 0.5) }]}>
          Please fill in your details to get started with your food order.
        </Text>

        <Pressable
          style={[appStyles.order.orderButton, { backgroundColor: theme.primary }]}
          onPress={onOrderPress}
        >
          <Text style={appStyles.order.orderButtonText}>Order Now</Text>
          <Ionicons name="arrow-forward" size={20} color="#FFF" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    </View>
  </View>
));
OrderInitialView.displayName = "OrderInitialView";

// Main component
function OrderPage() {
  const { safeReplace } = useSafeNavigation(300);
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.theme.mode);
  const flavor = useAppSelector((state) => state.flavor.currentFlavor);
  const isLoggedIn = useAppSelector((state) => state.auth.isLoggedIn);
  const authLoading = useAppSelector((state) => state.auth.loading);
  const user = useAppSelector((state) => state.auth.user);
  const system = useColorScheme() ?? "light";
  const resolvedMode = mode === "light" || mode === "dark" ? mode : system;

  const theme = useMemo(() => getTheme(flavor, resolvedMode), [flavor, resolvedMode]);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    dob: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});
  const isLoading = authLoading;

  // Load user from storage on mount
  useEffect(() => {
    dispatch(loadUserFromStorage());
  }, [dispatch]);

  // Update form with loaded user data
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        address: user.address,
        dob: user.dob,
        email: user.email,
      });
    }
  }, [user]);

  // If logged in, redirect to menu using safe navigation
  useEffect(() => {
    // Only redirect after loading is complete and user is logged in
    if (!isLoading && isLoggedIn) {
      const timer = setTimeout(() => {
        safeReplace("menu");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isLoggedIn, safeReplace]);

  // Validate a single field and return error message if any
  const validateSingleField = useCallback((field: keyof FormData, value: string): string | undefined => {
    switch (field) {
      case "firstName": {
        const requiredResult = validateRequired(value.trim(), "First name");
        if (!requiredResult.isValid) return requiredResult.error;
        const minLengthResult = validateMinLength(value.trim(), "First name", 2);
        if (!minLengthResult.isValid) return minLengthResult.error;
        return undefined;
      }
      case "lastName": {
        const requiredResult = validateRequired(value.trim(), "Last name");
        if (!requiredResult.isValid) return requiredResult.error;
        const minLengthResult = validateMinLength(value.trim(), "Last name", 2);
        if (!minLengthResult.isValid) return minLengthResult.error;
        return undefined;
      }
      case "phone": {
        const phoneResult = validatePhone(value.trim(), "Phone number", 10);
        return phoneResult.isValid ? undefined : phoneResult.error;
      }
      case "address": {
        const requiredResult = validateRequired(value, "Address");
        if (!requiredResult.isValid) return requiredResult.error;
        const minLengthResult = validateMinLength(value, "Address", 10);
        return minLengthResult.isValid ? undefined : minLengthResult.error;
      }
      case "dob": {
        const dobResult = validateDOB(value.trim());
        return dobResult.isValid ? undefined : dobResult.error;
      }
      case "email": {
        const emailResult = validateEmail(value.trim(), "Email");
        return emailResult.isValid ? undefined : emailResult.error;
      }
      default:
        return undefined;
    }
  }, []);

  // Handle input change with validation
  const handleInputChange = useCallback((field: keyof FormData, value: string) => {
    const sanitizedValue = sanitizeInput(value);
    setFormData((prev) => ({ ...prev, [field]: sanitizedValue }));
    
    if (touchedFields[field]) {
      const error = validateSingleField(field, sanitizedValue);
      setFormErrors((prev) => ({ ...prev, [field]: error }));
    }
  }, [touchedFields, validateSingleField]);

  // Mark field as touched when user leaves it
  const handleBlur = useCallback((field: keyof FormData) => {
    setTouchedFields((prev) => ({ ...prev, [field]: true }));
    const error = validateSingleField(field, formData[field]);
    setFormErrors((prev) => ({ ...prev, [field]: error }));
  }, [formData, validateSingleField]);

  // Validate entire form
  const validateForm = useCallback((): boolean => {
    const errors: FormErrors = {};
    let hasErrors = false;

    (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
      const error = validateSingleField(field, formData[field]);
      if (error) {
        errors[field] = error;
        hasErrors = true;
      }
    });

    setFormErrors(errors);
    setTouchedFields((prev) => {
      const updated = { ...prev };
      (Object.keys(formData) as Array<keyof FormData>).forEach((field) => {
        updated[field] = true;
      });
      return updated;
    });

    return !hasErrors;
  }, [formData, validateSingleField]);

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await dispatch(saveUserToStorage(formData)).unwrap();
      // Navigate after a small delay to allow state to update
      setTimeout(() => {
        router.replace('/menu');
      }, 100);
    } catch (error) {
      Loggers.auth.error("Signup failed", error);
      showError("Error", AuthMessages.errors.saveUserFailed);
    } finally {
      setIsSubmitting(false);
    }
  }, [dispatch, formData, validateForm]);

  if (isLoading) {
    return (
      <View style={[appStyles.order.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (!showForm) {
    return <OrderInitialView theme={theme} onOrderPress={() => setShowForm(true)} />;
  }

  return (
    <KeyboardAvoidingView
      style={[appStyles.order.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <ScrollView
        contentContainerStyle={appStyles.order.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={appStyles.order.header}>
          <Pressable onPress={() => setShowForm(false)}>
            <Ionicons name="arrow-back" size={24} color={theme.text} />
          </Pressable>
          <Text style={[appStyles.order.title, { color: theme.text }]}>
            Sign Up
          </Text>
        </View>

        <View style={appStyles.order.formContainer}>
          <FormInput
            label="First Name"
            value={formData.firstName}
            onChangeText={(value: string) => handleInputChange("firstName", value)}
            placeholder="Enter first name"
            placeholderTextColor={withOpacity(theme.text, 0.5)}
            theme={theme}
            returnKeyType="next"
            error={formErrors.firstName}
            showError={touchedFields.firstName}
            onBlur={() => handleBlur("firstName")}
          />

          <FormInput
            label="Last Name"
            value={formData.lastName}
            onChangeText={(value: string) => handleInputChange("lastName", value)}
            placeholder="Enter last name"
            placeholderTextColor={withOpacity(theme.text, 0.5)}
            theme={theme}
            returnKeyType="next"
            error={formErrors.lastName}
            showError={touchedFields.lastName}
            onBlur={() => handleBlur("lastName")}
          />

          <FormInput
            label="Phone Number"
            value={formData.phone}
            onChangeText={(value: string) => handleInputChange("phone", value)}
            placeholder="Enter phone number"
            placeholderTextColor={withOpacity(theme.text, 0.5)}
            theme={theme}
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="next"
            error={formErrors.phone}
            showError={touchedFields.phone}
            onBlur={() => handleBlur("phone")}
          />

          <FormInput
            label="Address"
            value={formData.address}
            onChangeText={(value: string) => handleInputChange("address", value)}
            placeholder="Enter address"
            placeholderTextColor={withOpacity(theme.text, 0.5)}
            theme={theme}
            multiline
            numberOfLines={3}
            returnKeyType="next"
            style={{ height: 80, textAlignVertical: "top" }}
            error={formErrors.address}
            showError={touchedFields.address}
            onBlur={() => handleBlur("address")}
          />

          <FormInput
            label="Date of Birth"
            value={formData.dob}
            onChangeText={(value: string) => handleInputChange("dob", value)}
            placeholder="DD/MM/YYYY"
            placeholderTextColor={withOpacity(theme.text, 0.5)}
            theme={theme}
            returnKeyType="next"
            error={formErrors.dob}
            showError={touchedFields.dob}
            onBlur={() => handleBlur("dob")}
          />

          <FormInput
            label="Email ID"
            value={formData.email}
            onChangeText={(value: string) => handleInputChange("email", value)}
            placeholder="Enter email"
            placeholderTextColor={withOpacity(theme.text, 0.5)}
            theme={theme}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="done"
            error={formErrors.email}
            showError={touchedFields.email}
            onBlur={() => handleBlur("email")}
          />

          <Pressable
            style={[appStyles.order.orderButton, { backgroundColor: theme.primary }]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={appStyles.order.orderButtonText}>Sign Up</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Export memoized component
export default memo(OrderPage);


import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { useProfileValidation } from "../hooks/useProfileValidation";
import { UserData, saveUserToStorage, updateUser } from "../store/authSlice";
import { useAppDispatch } from "../store/hooks";
import { componentStyles } from "../styles";
import { showError } from "../utils/alertUtils";
import { Loggers } from "../utils/logger";
import { sanitizeInput } from "../utils/validation";
import { ProfileActions } from "./profile/ProfileActions";
import { ProfileFields } from "./profile/ProfileFields";
import { ProfileHeader } from "./profile/ProfileHeader";

interface ProfileModalProps {
  visible: boolean;
  onClose: () => void;
  user: UserData | null;
  onLogout: () => void;
  theme: {
    background: string;
    primary: string;
    accent: string;
    text: string;
    muted: string;
    card: string[] | [string, string, ...string[]];
    border: string;
  };
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  email?: string;
}

// Loading placeholder component
const LoadingPlaceholder = ({ theme }: { theme: any }) => (
  <View style={componentStyles.profileModal.loadingContainer}>
    <ActivityIndicator size="large" color={theme.primary} />
    <Text
      style={[
        componentStyles.profileModal.loadingText,
        { color: theme.text, marginTop: 16 },
      ]}
    >
      Loading profile...
    </Text>
  </View>
);

export default function ProfileModal({
  visible,
  onClose,
  user,
  onLogout,
  theme,
}: ProfileModalProps) {
  const dispatch = useAppDispatch();
  const { validateSingleField, validateForm } = useProfileValidation();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UserData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({});

  // Reset form data when modal opens with user data
  useEffect(() => {
    if (visible) {
      if (user) {
        setFormData(user);
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          phone: "",
          address: "",
          dob: "",
          email: "",
        });
      }
      setFormErrors({});
      setTouchedFields({});
      setIsEditing(false);
    }
  }, [visible, user]);

  // Handle input change with validation
  const handleInputChange = useCallback(
    (field: keyof UserData, value: string) => {
      const sanitizedValue = sanitizeInput(value);
      setFormData((prev) => (prev ? { ...prev, [field]: sanitizedValue } : null));

      if (touchedFields[field] && formData) {
        const error = validateSingleField(field, sanitizedValue);
        setFormErrors((prev) => ({ ...prev, [field]: error || "" }));
      }
    },
    [touchedFields, validateSingleField, formData]
  );

  // Mark field as touched when user leaves it
  const handleBlur = useCallback(
    (field: keyof UserData) => {
      setTouchedFields((prev) => ({ ...prev, [field]: true }));
      if (formData) {
        const error = validateSingleField(field, formData[field]);
        setFormErrors((prev) => ({ ...prev, [field]: error || "" }));
      }
    },
    [formData, validateSingleField]
  );

  // Validate entire form
  const handleValidateForm = useCallback((): boolean => {
    if (!formData) return false;

    const errors = validateForm(formData);
    setFormErrors(errors);
    setTouchedFields((prev) => {
      const updated = { ...prev };
      Object.keys(formData).forEach((field) => {
        updated[field] = true;
      });
      return updated;
    });

    return Object.keys(errors).length === 0;
  }, [formData, validateForm]);

  const handleSave = async () => {
    if (!formData) return;

    if (!handleValidateForm()) {
      showError("Validation Error", "Please fix the errors before saving.");
      return;
    }

    try {
      dispatch(updateUser(formData));
      await dispatch(saveUserToStorage(formData));
      setIsEditing(false);
      Loggers.auth.info("Profile updated successfully");
    } catch (error) {
      Loggers.auth.error("Failed to update profile", error);
      showError("Error", "Failed to save profile changes. Please try again.");
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        firstName: "",
        lastName: "",
        phone: "",
        address: "",
        dob: "",
        email: "",
      });
    }
    setFormErrors({});
    setTouchedFields({});
    setIsEditing(false);
  };

  const handleEditPress = () => {
    setIsEditing(true);
  };

  const handleLogoutPress = () => {
    setIsEditing(false);
    onLogout();
  };

  const handleBackdropPress = (event: any) => {
    event.stopPropagation();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={componentStyles.profileModal.modalOverlay}
      >
        <Pressable
          style={componentStyles.profileModal.modalBackdrop}
          onPress={handleBackdropPress}
        />
        <View
          style={[
            componentStyles.profileModal.modalContainer,
            { backgroundColor: theme.background },
          ]}
          onStartShouldSetResponder={() => true}
          onResponderReject={(e) => e.stopPropagation()}
        >
          {formData ? (
            <>
              <ProfileHeader
                formData={formData}
                isEditing={isEditing}
                theme={theme}
                onEditPress={handleEditPress}
                onCancel={onClose}
              />
              <ProfileFields
                formData={formData}
                formErrors={formErrors}
                touchedFields={touchedFields}
                isEditing={isEditing}
                theme={theme}
                onInputChange={handleInputChange}
                onBlur={handleBlur}
              />
              <ProfileActions
                isEditing={isEditing}
                theme={theme}
                onCancel={handleCancel}
                onSave={handleSave}
                onLogout={handleLogoutPress}
              />
            </>
          ) : (
            <LoadingPlaceholder theme={theme} />
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}


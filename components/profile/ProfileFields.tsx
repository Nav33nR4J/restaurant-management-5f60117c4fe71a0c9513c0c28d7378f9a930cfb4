import React from "react";
import { ScrollView, Text, TextInput, View } from "react-native";
import { UserData } from "../../store/authSlice";
import { componentStyles } from "../../styles";
import { withOpacity } from "../../utils/colorUtils";

interface FormErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  dob?: string;
  email?: string;
}

interface ProfileFieldsProps {
  formData: UserData;
  formErrors: FormErrors;
  touchedFields: Record<string, boolean>;
  isEditing: boolean;
  theme: any;
  onInputChange: (field: keyof UserData, value: string) => void;
  onBlur: (field: keyof UserData) => void;
}

interface FieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  editable: boolean;
  theme: any;
  keyboardType?: "default" | "email-address" | "phone-pad";
  placeholder?: string;
  error?: string;
  showError?: boolean;
  onBlur?: () => void;
}

const ProfileField = ({
  label,
  value,
  onChangeText,
  editable,
  theme,
  keyboardType = "default",
  placeholder,
  error,
  showError,
  onBlur,
}: FieldProps) => (
  <View style={componentStyles.profileModal.fieldContainer}>
    <Text
      style={[componentStyles.profileModal.fieldLabel, { color: theme.accent }]}
    >
      {label}
    </Text>
    <TextInput
      style={[
        componentStyles.profileModal.fieldInput,
        {
          color: theme.text,
          backgroundColor: editable
            ? Array.isArray(theme.card)
              ? theme.card[0]
              : theme.card
            : withOpacity(theme.muted, 0.18),
          borderColor:
            showError && error ? theme.primary : theme.border,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      editable={editable}
      keyboardType={keyboardType}
      placeholder={placeholder}
      placeholderTextColor={withOpacity(theme.text, 0.35)}
      onBlur={onBlur}
    />
    {showError && error && (
      <Text
        style={[
          componentStyles.profileModal.errorText,
          { color: theme.primary },
        ]}
      >
        {error}
      </Text>
    )}
  </View>
);

export const ProfileFields = ({
  formData,
  formErrors,
  touchedFields,
  isEditing,
  theme,
  onInputChange,
  onBlur,
}: ProfileFieldsProps) => (
  <ScrollView
    style={componentStyles.profileModal.scrollView}
    showsVerticalScrollIndicator={false}
    keyboardShouldPersistTaps="handled"
  >
    <View style={componentStyles.profileModal.fieldsContainer}>
      <View style={componentStyles.profileModal.row}>
        <View style={componentStyles.profileModal.fieldWrapperLeft}>
          <ProfileField
            label="First Name"
            value={formData.firstName}
            onChangeText={(text) => onInputChange("firstName", text)}
            editable={isEditing}
            theme={theme}
            placeholder="Enter first name"
            error={formErrors.firstName}
            showError={touchedFields.firstName && isEditing}
            onBlur={() => onBlur("firstName")}
          />
        </View>
        <View style={componentStyles.profileModal.fieldWrapperRight}>
          <ProfileField
            label="Last Name"
            value={formData.lastName}
            onChangeText={(text) => onInputChange("lastName", text)}
            editable={isEditing}
            theme={theme}
            placeholder="Enter last name"
            error={formErrors.lastName}
            showError={touchedFields.lastName && isEditing}
            onBlur={() => onBlur("lastName")}
          />
        </View>
      </View>

      <ProfileField
        label="Email"
        value={formData.email}
        onChangeText={(text) => onInputChange("email", text)}
        editable={isEditing}
        theme={theme}
        keyboardType="email-address"
        placeholder="Enter email"
        error={formErrors.email}
        showError={touchedFields.email && isEditing}
        onBlur={() => onBlur("email")}
      />

      <ProfileField
        label="Phone"
        value={formData.phone}
        onChangeText={(text) => onInputChange("phone", text)}
        editable={isEditing}
        theme={theme}
        keyboardType="phone-pad"
        placeholder="Enter phone number"
        error={formErrors.phone}
        showError={touchedFields.phone && isEditing}
        onBlur={() => onBlur("phone")}
      />

      <ProfileField
        label="Date of Birth"
        value={formData.dob}
        onChangeText={(text) => onInputChange("dob", text)}
        editable={isEditing}
        theme={theme}
        placeholder="DD/MM/YYYY"
        error={formErrors.dob}
        showError={touchedFields.dob && isEditing}
        onBlur={() => onBlur("dob")}
      />

      <View style={componentStyles.profileModal.fieldContainer}>
        <Text
          style={[
            componentStyles.profileModal.fieldLabel,
            { color: theme.accent },
          ]}
        >
          Address
        </Text>
        <TextInput
          style={[
            componentStyles.profileModal.fieldInput,
            componentStyles.profileModal.addressInput,
            {
              color: theme.text,
              backgroundColor: isEditing
                ? Array.isArray(theme.card)
                  ? theme.card[0]
                  : theme.card
                : withOpacity(theme.muted, 0.18),
              borderColor:
                touchedFields.address && isEditing && formErrors.address
                  ? theme.primary
                  : theme.border,
            },
          ]}
          value={formData.address}
          onChangeText={(text) => onInputChange("address", text)}
          editable={isEditing}
          multiline
          textAlignVertical="top"
          placeholder="Enter address"
          placeholderTextColor={withOpacity(theme.text, 0.35)}
          onBlur={() => onBlur("address")}
        />
        {touchedFields.address && isEditing && formErrors.address && (
          <Text
            style={[
              componentStyles.profileModal.errorText,
              { color: theme.primary },
            ]}
          >
            {formErrors.address}
          </Text>
        )}
      </View>

      {/* Spacing for logout button */}
      <View style={{ height: 100 }} />
    </View>
  </ScrollView>
);


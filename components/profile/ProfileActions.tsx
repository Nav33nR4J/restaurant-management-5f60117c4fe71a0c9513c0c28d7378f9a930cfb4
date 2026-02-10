import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, View } from "react-native";
import { componentStyles } from "../../styles";

interface ProfileActionsProps {
  isEditing: boolean;
  theme: any;
  onCancel: () => void;
  onSave: () => void;
  onLogout: () => void;
}

interface ActionButtonProps {
  title: string;
  onPress: () => void;
  variant: "primary" | "muted";
  theme: any;
  icon?: React.ReactNode;
}

const ActionButton = ({
  title,
  onPress,
  variant,
  theme,
  icon,
}: ActionButtonProps) => {
  const isPrimary = variant === "primary";
  return (
    <View
      style={[
        isPrimary
          ? componentStyles.profileModal.saveButton
          : componentStyles.profileModal.cancelButton,
        isPrimary && { backgroundColor: theme.primary },
        !isPrimary && { borderColor: theme.border },
      ]}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        {icon}
        <Text
          onPress={onPress}
          style={[
            isPrimary
              ? componentStyles.profileModal.saveButtonText
              : componentStyles.profileModal.cancelButtonText,
            isPrimary && { color: "#FFF" },
            !isPrimary && { color: theme.text },
          ]}
        >
          {title}
        </Text>
      </View>
    </View>
  );
};

export const ProfileActions = ({
  isEditing,
  theme,
  onCancel,
  onSave,
  onLogout,
}: ProfileActionsProps) => {
  if (isEditing) {
    return (
      <View style={componentStyles.profileModal.actionButtons}>
        <ActionButton
          title="Cancel"
          onPress={onCancel}
          variant="muted"
          theme={theme}
        />
        <ActionButton
          title="Save Changes"
          onPress={onSave}
          variant="primary"
          theme={theme}
        />
      </View>
    );
  }

  return (
    <View style={componentStyles.profileModal.logoutContainer}>
      <View
        style={[
          componentStyles.profileModal.logoutButton,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons
          name="log-out-outline"
          size={20}
          color="#FFF"
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            componentStyles.profileModal.logoutText,
            { color: "#FFF" },
          ]}
          onPress={onLogout}
        >
          Sign Out
        </Text>
      </View>
    </View>
  );
};


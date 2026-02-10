import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, Text, View } from "react-native";
import { UserData } from "../../store/authSlice";
import { componentStyles } from "../../styles";

interface ProfileHeaderProps {
  formData: UserData;
  isEditing: boolean;
  theme: any;
  onEditPress: () => void;
  onCancel: () => void;
}

const CloseButton = ({
  onPress,
  theme,
}: {
  onPress: () => void;
  theme: any;
}) => (
  <Pressable
    onPress={onPress}
    hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
  >
    <Ionicons name="close" size={24} color={theme.text} />
  </Pressable>
);

export const ProfileHeader = ({
  formData,
  isEditing,
  theme,
  onEditPress,
  onCancel,
}: ProfileHeaderProps) => (
  <>
    {/* Header */}
    <View style={componentStyles.profileModal.modalHeader}>
      <Text style={[componentStyles.profileModal.modalTitle, { color: theme.text }]}>
        Profile
      </Text>
      <CloseButton onPress={onCancel} theme={theme} />
    </View>

    {/* Profile Header */}
    <View style={componentStyles.profileModal.profileHeader}>
      <View
        style={[
          componentStyles.profileModal.avatar,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons name="person" size={40} color="#FFF" />
      </View>
      <Text style={[componentStyles.profileModal.userName, { color: theme.text }]}>
        {formData.firstName} {formData.lastName}
      </Text>

      {/* Profile Info Summary */}
      <View style={componentStyles.profileModal.profileInfoContainer}>
        <View style={componentStyles.profileModal.infoRow}>
          <View style={componentStyles.profileModal.infoItem}>
            <Ionicons name="mail-outline" size={14} color={theme.accent} />
            <Text
              style={[componentStyles.profileModal.infoText, { color: theme.text }]}
              numberOfLines={1}
            >
              {formData.email}
            </Text>
          </View>
          <View style={componentStyles.profileModal.infoItem}>
            <Ionicons name="call-outline" size={14} color={theme.accent} />
            <Text
              style={[componentStyles.profileModal.infoText, { color: theme.text }]}
            >
              {formData.phone}
            </Text>
          </View>
        </View>
        <View style={componentStyles.profileModal.infoRow}>
          <View style={[componentStyles.profileModal.infoItem, { flex: 1 }]}>
            <Ionicons name="calendar-outline" size={14} color={theme.accent} />
            <Text
              style={[componentStyles.profileModal.infoText, { color: theme.text }]}
            >
              DOB: {formData.dob}
            </Text>
          </View>
        </View>
        <View style={componentStyles.profileModal.infoRow}>
          <View style={componentStyles.profileModal.infoItem}>
            <Ionicons name="location-outline" size={14} color={theme.accent} />
            <Text
              style={[componentStyles.profileModal.infoText, { color: theme.text }]}
              numberOfLines={2}
            >
              {formData.address}
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={onEditPress}
        style={[
          componentStyles.profileModal.editButton,
          { backgroundColor: theme.primary },
        ]}
      >
        <Ionicons
          name={isEditing ? "close-outline" : "create-outline"}
          size={16}
          color="#FFF"
          style={{ marginRight: 6 }}
        />
        <Text style={componentStyles.profileModal.editButtonText}>
          {isEditing ? "Cancel" : "Edit"}
        </Text>
      </Pressable>
    </View>
  </>
);


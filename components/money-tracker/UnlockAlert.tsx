import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";

interface UnlockAlertProps {
  visible: boolean;
  amountNeeded: number;
  discountTitle: string;
  currentProgress: number; // 0-100
  onDismiss: () => void;
}

export function UnlockAlert({
  visible,
  amountNeeded,
  discountTitle,
  currentProgress,
  onDismiss,
}: UnlockAlertProps) {
  const [slideAnim] = useState(new Animated.Value(100));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>🔓</Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.title}>Almost There!</Text>
          <Text style={styles.message}>
            Buy for <Text style={styles.highlight}>₹{amountNeeded}</Text> more to unlock {discountTitle}
          </Text>
        </View>
        
        <Pressable 
          onPress={onDismiss} 
          style={styles.closeButton}
          hitSlop={8}
        >
          <Ionicons name="close-circle" size={22} color="#FFF" />
        </Pressable>
      </View>
      
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar, 
            { width: `${Math.min(currentProgress, 100)}%` }
          ]} 
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: "#4CAF50",
    borderRadius: 16,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 18,
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: "#FFF",
    fontSize: 13,
    fontWeight: "700",
  },
  message: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 11,
    marginTop: 1,
  },
  highlight: {
    color: "#FFD700",
    fontWeight: "800",
  },
  closeButton: {
    padding: 2,
  },
  progressContainer: {
    height: 4,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFD700",
    borderRadius: 2,
  },
});

export default UnlockAlert;

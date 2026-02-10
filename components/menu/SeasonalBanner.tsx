
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SeasonalMenu } from "../../config/config";
import { SeasonalMenuManager } from "../../utils/seasonalMenu";

interface SeasonalBannerProps {
  currentSeasonalMenu: SeasonalMenu | null;
  seasonalMenuManager: SeasonalMenuManager | null;
}

/**
 * Format time remaining for display
 */
function formatCountdown(hours: number, minutes: number, seconds: number): string {
  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  parts.push(`${seconds}s`);
  return parts.join(' ');
}

/**
 * Seasonal menu banner component with countdown timer
 */
export function SeasonalBanner({
  currentSeasonalMenu,
  seasonalMenuManager,
}: SeasonalBannerProps) {
  const [countdown, setCountdown] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<{ hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!currentSeasonalMenu || !seasonalMenuManager) {
      setCountdown(null);
      setTimeRemaining(null);
      return;
    }

    const updateCountdown = () => {
      const timeInfo = seasonalMenuManager.getTimeUntilMenuEnd(currentSeasonalMenu);
      
      if (timeInfo) {
        setTimeRemaining(timeInfo);
        setCountdown(formatCountdown(timeInfo.hours, timeInfo.minutes, timeInfo.seconds));
      } else {
        setCountdown(null);
        setTimeRemaining(null);
      }
    };

    // Initial update
    updateCountdown();

    // Update every second for smooth countdown
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [currentSeasonalMenu, seasonalMenuManager]);

  if (!currentSeasonalMenu) return null;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  };

  return (
    <View style={styles.seasonalBanner}>
      <View style={styles.headerRow}>
        <Text style={styles.seasonalBannerTitle}>🎉 {currentSeasonalMenu.name}</Text>
        {countdown && (
          <View style={styles.countdownBadge}>
            <Text style={styles.countdownText}>{countdown}</Text>
          </View>
        )}
      </View>
      
      <Text style={styles.seasonalBannerSubtitle}>{currentSeasonalMenu.description}</Text>
      
      <View style={styles.timeRow}>
        <View style={styles.timeBadge}>
          <Text style={styles.timeBadgeText}>
            🕐 {formatTime(currentSeasonalMenu.startTime)} - {formatTime(currentSeasonalMenu.endTime)}
          </Text>
        </View>
        
        {timeRemaining && (timeRemaining.hours > 0 || timeRemaining.minutes > 5) && (
          <Text style={styles.timeRemainingText}>
            {timeRemaining.hours > 0 ? `${timeRemaining.hours}h ${timeRemaining.minutes}m left` : `${timeRemaining.minutes}m left`}
          </Text>
        )}
      </View>

      {timeRemaining && timeRemaining.hours === 0 && timeRemaining.minutes <= 5 && (
        <View style={styles.endingSoonBadge}>
          <Text style={styles.endingSoonText}>Ending soon!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  seasonalBanner: {
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
    backgroundColor: '#6366F1', // Indigo primary color
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  seasonalBannerTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "700",
  },
  countdownBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  countdownText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    fontVariant: ['tabular-nums'],
  },
  seasonalBannerSubtitle: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.9,
    marginTop: 4,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 12,
  },
  timeBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  timeBadgeText: {
    color: "#FFF",
    fontSize: 13,
  },
  timeRemainingText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
  },
  endingSoonBadge: {
    marginTop: 8,
    backgroundColor: '#EF4444', // Red for urgency
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  endingSoonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "600",
  },
});


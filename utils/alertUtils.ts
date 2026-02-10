/**
 * Alert Utility Functions
 * Centralized alert handling for the application
 * Use these functions instead of direct Alert.alert() calls
 */

import { Alert, AlertButton, AlertOptions } from "react-native";

/**
 * Alert button configurations
 */
const OK_BUTTON: AlertButton = { text: "OK" };
const CANCEL_BUTTON: AlertButton = { text: "Cancel", style: "cancel" };
const TRY_AGAIN_BUTTON: AlertButton = { text: "Try Again" };
const CONFIRM_BUTTON: AlertButton = { text: "Confirm" };

/**
 * Show an error alert
 * @param title - Error title
 * @param message - Error message
 * @param onDismiss - Optional callback when alert is dismissed
 */
export function showError(
  title: string,
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(
    title,
    message,
    [{ text: "OK", onPress: () => onDismiss?.() }],
    { cancelable: true }
  );
}

/**
 * Show a warning alert
 * @param title - Warning title
 * @param message - Warning message
 * @param onConfirm - Optional callback when confirmed
 * @param showCancel - Whether to show cancel button
 */
export function showWarning(
  title: string,
  message: string,
  onConfirm?: () => void,
  showCancel: boolean = false
): void {
  const buttons: AlertButton[] = showCancel
    ? [
        { ...CANCEL_BUTTON, onPress: () => onConfirm?.() },
        CONFIRM_BUTTON,
      ]
    : [{ ...OK_BUTTON, onPress: () => onConfirm?.() }];

  Alert.alert(title, message, buttons, { cancelable: !showCancel });
}

/**
 * Show a success alert
 * @param title - Success title
 * @param message - Success message
 * @param onDismiss - Optional callback when alert is dismissed
 */
export function showSuccess(
  title: string,
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(
    title,
    message,
    [{ text: "OK", onPress: () => onDismiss?.() }],
    { cancelable: true }
  );
}

/**
 * Show an info alert
 * @param title - Info title
 * @param message - Info message
 * @param onDismiss - Optional callback when alert is dismissed
 */
export function showInfo(
  title: string,
  message: string,
  onDismiss?: () => void
): void {
  Alert.alert(
    title,
    message,
    [{ text: "OK", onPress: () => onDismiss?.() }],
    { cancelable: true }
  );
}

/**
 * Show a confirmation alert with Confirm and Cancel buttons
 * @param title - Confirmation title
 * @param message - Confirmation message
 * @param onConfirm - Callback when confirmed
 * @param onCancel - Optional callback when cancelled
 * @param confirmText - Custom confirm button text
 * @param cancelText - Custom cancel button text
 */
export function showConfirmation(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
  confirmText: string = "Confirm",
  cancelText: string = "Cancel"
): void {
  Alert.alert(
    title,
    message,
    [
      {
        text: cancelText,
        style: "cancel",
        onPress: () => onCancel?.(),
      },
      {
        text: confirmText,
        style: "default",
        onPress: onConfirm,
      },
    ],
    { cancelable: true }
  );
}

/**
 * Show an alert with custom buttons
 * @param title - Alert title
 * @param message - Alert message
 * @param buttons - Array of button configurations
 * @param options - Alert options
 */
export function showCustomAlert(
  title: string,
  message: string,
  buttons: AlertButton[],
  options?: AlertOptions
): void {
  Alert.alert(title, message, buttons, {
    cancelable: true,
    ...options,
  });
}

/**
 * Show a network error alert
 * @param onRetry - Optional callback for retry action
 */
export function showNetworkError(onRetry?: () => void): void {
  showError(
    "Connection Error",
    "Unable to connect. Please check your internet connection.",
    onRetry
  );
}

/**
 * Show a generic error alert
 * @param error - Error message or Error object
 * @param onDismiss - Optional callback
 */
export function showGenericError(error: string | Error, onDismiss?: () => void): void {
  const message = error instanceof Error ? error.message : error;
  showError("Error", message, onDismiss);
}

/**
 * Show form validation error
 * @param fieldName - Name of the field with error
 * @param message - Validation error message
 */
export function showValidationError(fieldName: string, message: string): void {
  showError("Validation Error", `${fieldName}: ${message}`);
}

/**
 * Show loading indicator alert (non-blocking)
 * Note: This returns the Alert to allow programmatic dismissal
 * @param title - Loading title
 * @param message - Loading message
 */
export function showLoadingAlert(
  title: string = "Loading...",
  message: string = "Please wait"
): void {
  Alert.alert(title, message, [], { cancelable: false });
}

/**
 * Dismiss the current alert if visible
 * Note: In React Native, there's no direct API to dismiss Alert.
 * This is a placeholder for future implementations or native modules.
 */
export function dismissAlert(): void {
  // React Native doesn't provide a native way to dismiss alerts programmatically
  // This could be extended with native modules if needed
  console.log("Alert dismissal requested - implement via native module if needed");
}


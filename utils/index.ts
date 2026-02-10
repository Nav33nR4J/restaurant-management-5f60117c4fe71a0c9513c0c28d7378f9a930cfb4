// Error Messages
export {
    AppMessages, AuthMessages,
    CartMessages,
    FormMessages, NavigationMessages,
    ThemeMessages, ValidationMessages
} from "./errorMessages";

// Alert Utilities
export {
    dismissAlert, showConfirmation,
    showCustomAlert, showError, showGenericError, showInfo, showLoadingAlert, showNetworkError, showSuccess, showValidationError, showWarning
} from "./alertUtils";

// Logger Utilities
export {
    debug, errorWithStack, getLogLevel, group, info, logError, Loggers, LogLevel, logPerformance, setLogLevel, warn
} from "./logger";

// Validation Utilities
export {
    createDebouncedValidator, FieldValidation, formatPhoneNumber, getInputValidationState, isEmpty, sanitizeInput, sanitizeObject, validateCartForCheckout, validateCustom,
    validateDOB, validateEmail, validateField, validateMaxLength,
    validateMinLength, validateOrderForm, validatePattern, validatePhone,
    validateProfileForm, validateRequired, ValidationResult
} from "./validation";

// Color Utilities
export {
    blendColors, darkenColor,
    getContrastColor, hexToRgba,
    lightenColor, parseColor, transparentize, withOpacity
} from "./colorUtils";

// Memoization Utilities
export {
    checkDepsChange, createMemoizedSelector, LRUCache,
    memoize, memoizedCompute, shallowCompareArrays,
    shallowCompareObjects, useStable
} from "./memoize";

// Style Utilities
export {
    combineSpacing, composeStyles, conditionalStyle, createShadowStyle, createThemeStyle, flatten, flattenStyles, getStyleValue,
    hasStyleProperty, mergeStyles, platformSpecific, responsiveSize,
    StyleSheet, useFlattenedStyle,
    useStyles
} from "./styleUtils";


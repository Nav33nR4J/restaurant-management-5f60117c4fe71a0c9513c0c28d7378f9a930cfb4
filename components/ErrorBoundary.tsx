import { Ionicons } from "@expo/vector-icons";
import React, { Component, ErrorInfo, ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { componentStyles } from "../styles";
import { Loggers } from "../utils/logger";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: string | null;
}

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the app
 */
export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging
    Loggers.database.error("Component caught error:", error, { componentStack: errorInfo.componentStack });

    this.setState({
      error,
      errorInfo: errorInfo.componentStack || null,
    });

    // Also log to console for development
    console.error("ErrorBoundary caught an error:", error);
    console.error("Component stack:", errorInfo.componentStack);
  }

  private handleRetry = () => {
    Loggers.database.info("User clicked retry");
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private handleReload = () => {
    Loggers.database.info("User clicked reload");
    // Trigger a full app reload
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  public render() {
    if (this.state.hasError) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error fallback UI
      return (
        <View style={componentStyles.errorBoundary.container}>
          <View style={componentStyles.errorBoundary.errorCard}>
            <Ionicons name="warning" size={64} color="#EF4444" />

            <Text style={componentStyles.errorBoundary.title}>Oops! Something went wrong</Text>

            <Text style={componentStyles.errorBoundary.message}>
              {this.state.error?.message || "An unknown error occurred"}
            </Text>

            {__DEV__ && this.state.errorInfo && (
              <View style={componentStyles.errorBoundary.devInfo}>
                <Text style={componentStyles.errorBoundary.devTitle}>Development Info:</Text>
                <Text style={componentStyles.errorBoundary.stackTrace}>
                  {this.state.error?.stack || "No stack trace available"}
                </Text>
              </View>
            )}

            <View style={componentStyles.errorBoundary.buttonContainer}>
              <TouchableOpacity
                style={[componentStyles.errorBoundary.button, componentStyles.errorBoundary.retryButton]}
                onPress={this.handleRetry}
              >
                <Text style={componentStyles.errorBoundary.buttonText}>Retry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[componentStyles.errorBoundary.button, componentStyles.errorBoundary.reloadButton]}
                onPress={this.handleReload}
              >
                <Text style={componentStyles.errorBoundary.buttonText}>Reload App</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * Hook to programmatically trigger error boundary reset
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const triggerError = (err: Error) => {
    setError(err);
  };

  const resetError = () => {
    setError(null);
  };

  if (error) {
    throw error;
  }

  return { triggerError, resetError };
}


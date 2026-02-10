import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import { Loggers } from "../utils/logger";

/**
 * Safe navigation hook for Expo Router
 * - Prevents rapid navigation crashes
 * - Queues navigation calls
 * - Uses ONLY expo-router (no react-navigation mix)
 */
export function useSafeNavigation(delay: number = 200) {
  const router = useRouter();

  const lastNavTime = useRef<number>(0);
  const isNavigating = useRef<boolean>(false);
  const navigationQueue = useRef<Array<() => void>>([]);

  /** Normalize route to expo-router path */
  const normalizeRoute = (route: string) => {
    // already a path
    if (route.startsWith("/")) return route;
    // convert "menu" -> "/menu"
    return `/${route}`;
  };

  /** Process queued navigation actions safely */
  useEffect(() => {
    if (navigationQueue.current.length === 0 || isNavigating.current) return;

    const processQueue = async () => {
      isNavigating.current = true;

      while (navigationQueue.current.length > 0) {
        const action = navigationQueue.current.shift();
        if (!action) continue;

        const now = Date.now();
        if (now - lastNavTime.current >= delay) {
          lastNavTime.current = now;
          action();
          await new Promise((res) => setTimeout(res, 100));
        }
      }

      isNavigating.current = false;
    };

    processQueue();
  }, [delay]);

  /** Safe replace */
  const safeReplace = useCallback(
    (route: string) => {
      const path = normalizeRoute(route);
      const now = Date.now();

      if (isNavigating.current || now - lastNavTime.current < delay) {
        Loggers.navigation.info(`Queued replace → ${path}`);
        navigationQueue.current.push(() => router.replace(path));
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Replace → ${path}`);
      router.replace(path);
    },
    [router, delay]
  );

  /** Safe push */
  const safePush = useCallback(
    (route: string) => {
      const path = normalizeRoute(route);
      const now = Date.now();

      if (isNavigating.current || now - lastNavTime.current < delay) {
        Loggers.navigation.info(`Queued push → ${path}`);
        navigationQueue.current.push(() => router.push(path));
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Push → ${path}`);
      router.push(path);
    },
    [router, delay]
  );

  /** Safe navigate */
  const safeNavigate = useCallback(
    (route: string) => {
      const path = normalizeRoute(route);
      const now = Date.now();

      if (isNavigating.current || now - lastNavTime.current < delay) {
        Loggers.navigation.info(`Queued navigate → ${path}`);
        navigationQueue.current.push(() => router.navigate(path));
        return;
      }

      lastNavTime.current = now;
      Loggers.navigation.info(`Navigate → ${path}`);
      router.navigate(path);
    },
    [router, delay]
  );

  /** Safe go back */
  const safeGoBack = useCallback(() => {
    const now = Date.now();

    if (now - lastNavTime.current < delay) {
      Loggers.navigation.warn("GoBack skipped (too fast)");
      return;
    }

    if (router.canGoBack()) {
      lastNavTime.current = now;
      Loggers.navigation.info("Go back");
      router.back();
    } else {
      Loggers.navigation.warn("Cannot go back");
    }
  }, [router, delay]);

  return {
    safeReplace,
    safePush,
    safeNavigate,
    safeGoBack,
  };
}

export default useSafeNavigation;

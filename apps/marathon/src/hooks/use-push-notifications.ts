"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./use-auth";

interface UsePushNotificationsReturn {
  permission: NotificationPermission | "unsupported";
  subscription: PushSubscription | null;
  isSupported: boolean;
  isLoading: boolean;
  error: string | null;
  requestPermission: () => Promise<boolean>;
  subscribe: () => Promise<PushSubscription | null>;
  unsubscribe: () => Promise<boolean>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const { user } = useAuth();
  const [permission, setPermission] = useState<
    NotificationPermission | "unsupported"
  >("default");
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isSupported =
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window;

  // Check initial permission and subscription
  useEffect(() => {
    if (!isSupported) {
      setPermission("unsupported");
      return;
    }

    setPermission(Notification.permission);

    // Check for existing subscription
    navigator.serviceWorker.ready.then((registration) => {
      registration.pushManager.getSubscription().then((sub) => {
        setSubscription(sub);
      });
    });
  }, [isSupported]);

  // Register service worker on mount
  useEffect(() => {
    if (!isSupported) return;

    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker registered:", registration);
      })
      .catch((err) => {
        console.error("Service Worker registration failed:", err);
        setError("Service Worker 등록에 실패했습니다.");
      });
  }, [isSupported]);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError("이 브라우저는 푸시 알림을 지원하지 않습니다.");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (err) {
      console.error("Permission request failed:", err);
      setError("알림 권한 요청에 실패했습니다.");
      return false;
    }
  }, [isSupported]);

  const subscribe = useCallback(async (): Promise<PushSubscription | null> => {
    if (!isSupported || !user) {
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      // First request permission if not granted
      if (Notification.permission !== "granted") {
        const granted = await requestPermission();
        if (!granted) {
          setError("알림 권한이 거부되었습니다.");
          return null;
        }
      }

      const registration = await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setError("VAPID 키가 설정되지 않았습니다.");
        return null;
      }

      // Subscribe to push notifications with VAPID key
      const pushSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidPublicKey,
      });

      // Send subscription to server
      const response = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: pushSubscription.toJSON(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save subscription to server");
      }

      setSubscription(pushSubscription);
      return pushSubscription;
    } catch (err) {
      console.error("Subscription failed:", err);
      setError("푸시 알림 구독에 실패했습니다.");
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, user, requestPermission]);

  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!subscription) {
      return true;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Unsubscribe from push manager
      await subscription.unsubscribe();

      // Notify server
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
        }),
      });

      setSubscription(null);
      return true;
    } catch (err) {
      console.error("Unsubscribe failed:", err);
      setError("푸시 알림 구독 해제에 실패했습니다.");
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

  return {
    permission,
    subscription,
    isSupported,
    isLoading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
  };
}

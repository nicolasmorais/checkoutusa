"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff } from "lucide-react";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from([...rawData].map((char) => char.charCodeAt(0)));
}

export function PushNotificationToggle() {
  const [subscribed, setSubscribed] = useState(false);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    setSupported(true);

    navigator.serviceWorker.ready.then(async (registration) => {
      const existing = await registration.pushManager.getSubscription();
      setSubscribed(!!existing);
    });
  }, []);

  async function enable() {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) {
      toast.error("Push notifications are not configured");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      toast.error("Notification permission denied");
      return;
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });

    const json = subscription.toJSON();
    const res = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: json.endpoint, keys: json.keys }),
    });

    if (!res.ok) {
      toast.error("Failed to enable notifications");
      return;
    }

    setSubscribed(true);
    toast.success("Sale notifications enabled");
  }

  async function disable() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await fetch("/api/push/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      });
      await subscription.unsubscribe();
    }
    setSubscribed(false);
    toast.success("Sale notifications disabled");
  }

  if (!supported) return null;

  return (
    <button
      onClick={subscribed ? disable : enable}
      className="flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-neutral-600 hover:text-neutral-900"
      title={subscribed ? "Disable sale notifications" : "Enable sale notifications"}
    >
      {subscribed ? <Bell size={16} className="text-emerald-600" /> : <BellOff size={16} />}
      {subscribed ? "Notifications on" : "Enable notifications"}
    </button>
  );
}

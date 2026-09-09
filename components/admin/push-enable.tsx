"use client";

import { useEffect, useState } from "react";
import { Bell, BellOff, BellRing } from "lucide-react";
import { adminFetch } from "@/lib/admin-client";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

type Props = {
  notify: (type: "ok" | "err", text: string) => void;
};

export function AdminPushEnable({ notify }: Props) {
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const ok = typeof window !== "undefined"
      && "serviceWorker" in navigator
      && "PushManager" in window
      && "Notification" in window;
    setSupported(ok);
    if (!ok) return;

    (async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration("/");
        const sub = await reg?.pushManager.getSubscription();
        setEnabled(Boolean(sub));
      } catch {
        setEnabled(false);
      }
    })();
  }, []);

  const enable = async () => {
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        notify("err", "Разреши известията в настройките на телефона/браузъра.");
        return;
      }

      const vapidRes = await adminFetch("/api/admin/push/vapid");
      const vapid = await vapidRes.json();
      if (!vapidRes.ok || !vapid.publicKey) {
        notify("err", "Липсва VAPID ключ. Свържи се с разработчика.");
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
      await navigator.serviceWorker.ready;

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapid.publicKey),
        });
      }

      const json = sub.toJSON();
      const save = await adminFetch("/api/admin/push/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          endpoint: json.endpoint,
          keys: json.keys,
        }),
      });
      if (!save.ok) {
        notify("err", "Не успяхме да запишем устройството за известия.");
        return;
      }

      setEnabled(true);
      notify("ok", "Известията са включени. Ще получаваш сигнал при нова поръчка.");
    } catch (err) {
      console.error(err);
      notify("err", "Грешка при включване на известията.");
    } finally {
      setBusy(false);
    }
  };

  const disable = async () => {
    setBusy(true);
    try {
      const reg = await navigator.serviceWorker.getRegistration("/");
      const sub = await reg?.pushManager.getSubscription();
      if (sub) {
        await adminFetch("/api/admin/push/subscribe", {
          method: "DELETE",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setEnabled(false);
      notify("ok", "Известията са изключени на това устройство.");
    } catch {
      notify("err", "Не успяхме да изключим известията.");
    } finally {
      setBusy(false);
    }
  };

  if (!supported) {
    return (
      <div className="admin-card admin-card-body" style={{ marginBottom: 16 }}>
        <h3><Bell size={18} /> Известия на телефона</h3>
        <p>Този браузър не поддържа push известия. Отвори админа от Chrome/Safari на телефона и го добави към началния екран.</p>
      </div>
    );
  }

  return (
    <div className="admin-card admin-card-body" style={{ marginBottom: 16 }}>
      <h3>{enabled ? <BellRing size={18} /> : <Bell size={18} />} Известия при нова поръчка</h3>
      <p style={{ marginBottom: 12 }}>
        Добави `/admin` към началния екран (PWA), после включи известията тук.
        При всяка нова поръчка телефонът ще получи сигнал.
      </p>
      {enabled ? (
        <button className="admin-btn admin-btn-secondary admin-btn-sm" type="button" disabled={busy} onClick={disable}>
          <BellOff size={16} /> Изключи на това устройство
        </button>
      ) : (
        <button className="admin-btn admin-btn-primary admin-btn-sm" type="button" disabled={busy} onClick={enable}>
          <Bell size={16} /> {busy ? "Включване…" : "Включи известия"}
        </button>
      )}
    </div>
  );
}

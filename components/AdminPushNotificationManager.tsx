"use client";

import React, { useEffect, useState } from 'react';
import { Bell, BellRing, BellOff, CheckCircle2, AlertCircle, Loader2, Send, Smartphone } from 'lucide-react';

const FALLBACK_VAPID_PUBLIC_KEY = 'BMWY6n7hf1jDA5cUXtok5GwSYA5ckVUi3rsbXh9tX6cmogH35IgoO-PGj0d6hHrVnz0ajWU0bEtFZaHjiIRpAPk';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function AdminPushNotificationManager() {
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [testSending, setTestSending] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [activeDeviceCount, setActiveDeviceCount] = useState<number>(0);

  useEffect(() => {
    // Check environment (iOS detection and standalone/PWA mode)
    const ua = navigator.userAgent || '';
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    setIsIOS(isIOSDevice);

    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // Check Push and Service Worker support
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (!supported) {
      setLoading(false);
      return;
    }

    setPermission(Notification.permission);

    // Fetch active device count
    fetch('/api/admin/push/subscribe')
      .then((res) => res.json())
      .then((data) => {
        if (data.activeSubscriptions !== undefined) {
          setActiveDeviceCount(data.activeSubscriptions);
        }
      })
      .catch(() => {});

    // Check if this browser already has an active push subscription
    navigator.serviceWorker.ready
      .then((registration) => registration.pushManager.getSubscription())
      .then((subscription) => {
        if (subscription) {
          setIsSubscribed(true);
        }
      })
      .catch((err) => {
        console.error('Error checking push subscription:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleSubscribe = async () => {
    setActionLoading(true);
    setStatusMessage(null);

    try {
      // 1. Request Notification permission
      const currentPerm = await Notification.requestPermission();
      setPermission(currentPerm);

      if (currentPerm !== 'granted') {
        setStatusMessage({
          text: currentPerm === 'denied'
            ? 'Varsler er blokkert i nettleseren. Gå til innstillinger på enheten for å tillate varsler fra denne siden.'
            : 'Tillatelse til varsler ble ikke gitt.',
          type: 'error',
        });
        setActionLoading(false);
        return;
      }

      // 2. Fetch VAPID public key
      const statusRes = await fetch('/api/admin/push/subscribe');
      const statusData = await statusRes.json();
      const vapidPublicKey = statusData.vapidPublicKey || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || FALLBACK_VAPID_PUBLIC_KEY;

      if (!vapidPublicKey) {
        throw new Error('VAPID public key mangler fra serveren.');
      }

      // 3. Register Service Worker if not registered
      let registration = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!registration) {
        registration = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
      }

      await navigator.serviceWorker.ready;

      // 4. Subscribe to PushManager
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      let subscription = await registration.pushManager.getSubscription();

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey,
        });
      }

      // 5. Save subscription to backend DB
      const saveRes = await fetch('/api/admin/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('p256dh') || new ArrayBuffer(0))))),
            auth: btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(subscription.getKey('auth') || new ArrayBuffer(0))))),
          },
          userAgent: navigator.userAgent,
        }),
      });

      if (!saveRes.ok) {
        const errJson = await saveRes.json();
        throw new Error(errJson.error || 'Kunne ikke lagre abonnement i databasen.');
      }

      setIsSubscribed(true);
      setStatusMessage({
        text: 'Push-varsler er nå aktivert på denne enheten! Du vil få varsel på låst skjerm ved nye bookinger.',
        type: 'success',
      });

      // Update count
      const updatedStatus = await fetch('/api/admin/push/subscribe').then((r) => r.json());
      if (updatedStatus.activeSubscriptions !== undefined) {
        setActiveDeviceCount(updatedStatus.activeSubscriptions);
      }
    } catch (err: any) {
      console.error('Subscription error:', err);
      setStatusMessage({
        text: `Feil ved aktivering: ${err?.message || 'Ukjent feil'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setActionLoading(true);
    setStatusMessage(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await fetch('/api/admin/push/subscribe', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      setStatusMessage({
        text: 'Push-varsler er deaktivert for denne enheten.',
        type: 'info',
      });

      const updatedStatus = await fetch('/api/admin/push/subscribe').then((r) => r.json());
      if (updatedStatus.activeSubscriptions !== undefined) {
        setActiveDeviceCount(updatedStatus.activeSubscriptions);
      }
    } catch (err: any) {
      console.error('Unsubscribe error:', err);
      setStatusMessage({
        text: `Feil ved deaktivering: ${err?.message || 'Ukjent feil'}`,
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendTest = async () => {
    setTestSending(true);
    setStatusMessage(null);

    try {
      const res = await fetch('/api/admin/push/test', {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setStatusMessage({
          text: `✅ Testvarsel sendt! Sjekk varselsenteret / låst skjerm på telefonen din.`,
          type: 'success',
        });
      } else {
        setStatusMessage({
          text: `Kunne ikke sende testvarsel: ${data.error || 'Ukjent feil'}`,
          type: 'error',
        });
      }
    } catch (err: any) {
      setStatusMessage({
        text: `Feil ved sending av test: ${err?.message || 'Nettverksfeil'}`,
        type: 'error',
      });
    } finally {
      setTestSending(false);
    }
  };

  return (
    <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 text-zinc-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-5 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9C39FF]/15 border border-[#9C39FF]/30 flex items-center justify-center text-[#9C39FF]">
            {isSubscribed ? <BellRing className="w-5 h-5 text-emerald-400" /> : <Bell className="w-5 h-5" />}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              Push-varsler på mobil og PC
              {isSubscribed && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-medium">
                  Aktiv på denne enheten
                </span>
              )}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Motta øyeblikkelige varsler på låst skjerm når en ny booking gjennomføres eller en ny henvendelse mottas.
            </p>
          </div>
        </div>

        {activeDeviceCount > 0 && (
          <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-auto bg-zinc-800/60 px-3 py-1.5 rounded-lg border border-zinc-700/50">
            <Smartphone className="w-3.5 h-3.5 text-zinc-300" />
            <span>
              {activeDeviceCount} {activeDeviceCount === 1 ? 'enhet tilkoblet' : 'enheter tilkoblet'}
            </span>
          </div>
        )}
      </div>

      {/* iOS guidance note */}
      {isIOS && !isStandalone && (
        <div className="mb-5 bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl text-xs text-amber-200 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-300">Tips for iPhone / iPad (iOS 16.4+):</p>
            <p className="text-zinc-300 leading-relaxed">
              Apple tillater kun web-push når nettsiden er lagret på Hjem-skjermen: Trykk på <strong>Del-ikonet</strong> (firkant med pil opp) i Safari, og velg <strong>«Legg til på Hjem-skjerm»</strong>. Åpne deretter appen derfra for å aktivere varsler.
            </p>
          </div>
        </div>
      )}

      {/* Unsupported browser warning */}
      {isSupported === false && (
        <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-xs text-red-300 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>Nettleseren din støtter dessverre ikke Web Push API. Bruk Safari på iOS 16.4+ (som Hjem-skjerm app) eller Chrome/Edge.</span>
        </div>
      )}

      {/* Main Controls */}
      {isSupported !== false && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-zinc-400 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#9C39FF]" />
                Sjekker enhetsstatus...
              </div>
            ) : isSubscribed ? (
              <>
                <button
                  onClick={handleSendTest}
                  disabled={testSending}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#9C39FF] hover:bg-[#8A2BE2] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-[#9C39FF]/20 disabled:opacity-50"
                >
                  {testSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send testvarsel til telefonen
                </button>

                <button
                  onClick={handleUnsubscribe}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium rounded-xl border border-zinc-700 transition-all disabled:opacity-50"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <BellOff className="w-3.5 h-3.5 text-zinc-400" />}
                  Deaktiver på denne enheten
                </button>
              </>
            ) : (
              <button
                onClick={handleSubscribe}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#9C39FF] to-[#6A0DAD] hover:from-[#8A2BE2] hover:to-[#5c0b96] text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-[#9C39FF]/25 disabled:opacity-50"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                Aktiver push-varsler på denne enheten
              </button>
            )}
          </div>

          {/* Feedback messages */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2.5 transition-all ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-300'
                  : statusMessage.type === 'error'
                  ? 'bg-red-500/10 border border-red-500/25 text-red-300'
                  : 'bg-zinc-800 border border-zinc-700 text-zinc-300'
              }`}
            >
              {statusMessage.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />}
              {statusMessage.type === 'error' && <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

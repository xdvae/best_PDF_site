import { useEffect, useRef, useState } from "react";

interface AdModalProps {
  show: boolean;
  onComplete: () => void; // called when countdown ends or user skips
  countdown?: number; // seconds before skip, default 5
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

/**
 * Shows a fullscreen ad overlay after a conversion.
 * Auto-dismisses after `countdown` seconds, or user can skip early.
 * The actual download/result callback fires via onComplete.
 */
export default function AdModal({ show, onComplete, countdown = 5 }: AdModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(countdown);
  const [canSkip, setCanSkip] = useState(false);
  const adRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Reset and start countdown each time modal opens
  useEffect(() => {
    if (!show) return;
    setSecondsLeft(countdown);
    setCanSkip(false);

    // Push a new ad unit when the modal mounts
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {}

    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setCanSkip(true);
          return 0;
        }
        if (prev <= countdown - 2) setCanSkip(true); // allow skip after 2s on paid
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current!);
  }, [show, countdown]);

  if (!show) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0,0,0,0.85)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "16px",
      }}
    >
      {/* Header */}
      <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
        Your file is ready — ad playing
      </p>

      {/* Ad unit */}
      <div
        ref={adRef}
        style={{
          background: "#1f2937",
          borderRadius: "12px",
          overflow: "hidden",
          width: "min(728px, 95vw)",
          minHeight: "90px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ins
          className="adsbygoogle"
          style={{ display: "block", width: "100%", minHeight: "90px" }}
          data-ad-client="ca-pub-6692853049142212"
          data-ad-slot="auto"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>

      {/* Skip / countdown button */}
      <button
        onClick={canSkip ? onComplete : undefined}
        style={{
          padding: "10px 28px",
          borderRadius: "8px",
          border: "none",
          cursor: canSkip ? "pointer" : "default",
          background: canSkip ? "#2563eb" : "#374151",
          color: canSkip ? "#fff" : "#9ca3af",
          fontSize: "14px",
          fontWeight: 600,
          transition: "all 0.2s",
          minWidth: "160px",
        }}
      >
        {secondsLeft > 0
          ? `Download in ${secondsLeft}s…`
          : "Download File →"}
      </button>

      <p style={{ color: "#6b7280", fontSize: "11px", margin: 0 }}>
        Ads keep OmniPDF free for everyone
      </p>
    </div>
  );
}

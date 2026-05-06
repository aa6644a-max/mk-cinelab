"use client";

import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";

export default function AnnouncementBanner() {
  const [text, setText] = useState<string | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch("/api/site-settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((data) => {
        if (data.announcement_enabled && data.announcement_text) {
          setText(data.announcement_text);
        }
      })
      .catch(() => {});
  }, []);

  if (!text || dismissed) return null;

  return (
    <div className="bg-yellow-950/60 border border-yellow-800/60 rounded-xl px-4 py-3 flex items-start gap-3">
      <Megaphone className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-yellow-200 flex-1 leading-relaxed whitespace-pre-wrap">{text}</p>
      <button
        onClick={() => setDismissed(true)}
        className="text-yellow-700 hover:text-yellow-400 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

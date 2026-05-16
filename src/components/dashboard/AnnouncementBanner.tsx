"use client";

import { useState } from "react";
import { Megaphone, X } from "lucide-react";

interface Props {
  text: string;
}

export default function AnnouncementBanner({ text }: Props) {
  const [dismissed, setDismissed] = useState(false);

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

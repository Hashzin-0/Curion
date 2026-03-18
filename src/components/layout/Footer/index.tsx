'use client';

import { LANDING_MESSAGES } from "@/lib/constants/messages/landing";

export function Footer() {
  return (
    <footer className="mt-auto py-12 text-slate-400 text-sm">
      {LANDING_MESSAGES.footer.copy.replace(
        "{year}",
        new Date().getFullYear().toString()
      )}
    </footer>
  );
}

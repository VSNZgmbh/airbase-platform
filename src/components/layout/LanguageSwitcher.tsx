"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { routing } from "@/i18n/routing";

const LOCALE_LABELS: Record<string, string> = {
  de: "DE",
  en: "EN",
  fr: "FR",
};

function setLocaleCookie(locale: string) {
  document.cookie = `NEXT_LOCALE=${locale};path=/;max-age=31536000;SameSite=Lax`;
}

interface LanguageSwitcherProps {
  currentLocale?: string;
  className?: string;
}

export function LanguageSwitcher({
  currentLocale = "de",
  className = "",
}: LanguageSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchLocale(locale: string) {
    setLocaleCookie(locale);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {routing.locales.map((locale) => (
        <button
          key={locale}
          onClick={() => switchLocale(locale)}
          disabled={isPending}
          className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
            locale === currentLocale
              ? "bg-[#00B4D8] text-white"
              : "text-white/60 hover:text-white"
          }`}
          aria-label={`Switch to ${locale.toUpperCase()}`}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}

"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";

interface PDFDownloadButtonProps {
  href: string;
  fileName: string;
  accent?: string;
  className?: string;
}

export default function PDFDownloadButton({
  href,
  fileName,
  accent = "#E30613",
  className = "",
}: PDFDownloadButtonProps) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (downloading) return;
    setDownloading(true);

    try {
      const res = await fetch(href);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF download failed:", err);
      alert("PDF download failed. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className={`no-print fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 shadow-lg disabled:opacity-70 ${className}`}
      style={{ background: accent }}
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {downloading ? "Downloading..." : "Download PDF"}
      </span>
    </button>
  );
}

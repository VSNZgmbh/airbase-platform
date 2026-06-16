"use client";

import { useState, useEffect } from "react";
import { Download, Loader2 } from "lucide-react";

interface PDFDownloadButtonProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: React.ReactElement<any>;
  fileName: string;
  accent?: string;
  className?: string;
}

export default function PDFDownloadButton({
  document: pdfDocument,
  fileName,
  accent = "#E30613",
  className = "",
}: PDFDownloadButtonProps) {
  const [generating, setGenerating] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [blobUrl]);

  const handleDownload = async () => {
    if (generating) return;
    setGenerating(true);

    try {
      const { pdf } = await import("@react-pdf/renderer");
      const blob = await pdf(pdfDocument as React.ReactElement<any>).toBlob();
      const url = URL.createObjectURL(blob);

      // Trigger download
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);

      // Clean up previous URL
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      setBlobUrl(url);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={generating}
      className={`no-print fixed z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-all hover:brightness-110 shadow-lg disabled:opacity-70 ${className}`}
      style={{ background: accent }}
    >
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      <span className="hidden sm:inline">
        {generating ? "Generating..." : "Download PDF"}
      </span>
    </button>
  );
}

import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";
import { renderToBuffer } from "@react-pdf/renderer";
import { FinancialPlanPDF } from "@/components/pdf/FinancialPlanPDF";

export async function GET() {
  try {
    const logoPath = join(process.cwd(), "public", "airbase-logo-pdf.png");
    const logoBuffer = readFileSync(logoPath);
    const logoDataUri = `data:image/png;base64,${logoBuffer.toString("base64")}`;

    const buffer = await renderToBuffer(
      <FinancialPlanPDF logoSrc={logoDataUri} />
    );

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="airBASE-Financial-Plan.pdf"',
      },
    });
  } catch (err) {
    console.error("Financial Plan PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 }
    );
  }
}

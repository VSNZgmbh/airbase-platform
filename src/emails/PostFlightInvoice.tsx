import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface Props {
  customerName: string;
  bookingIdentifier: string;
  invoiceNumber: string;
  serviceType: string;
  flightDate: string;
  subtotalCHF: string;
  vatCHF: string;
  totalCHF: string;
  dueDate: string;
  reportUrl?: string;
  appUrl?: string;
}

export function PostFlightInvoice({
  customerName,
  bookingIdentifier,
  invoiceNumber,
  serviceType,
  flightDate,
  subtotalCHF,
  vatCHF,
  totalCHF,
  dueDate,
  reportUrl,
  appUrl = "https://airbase.one",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Rechnung {invoiceNumber} für Ihren Flug — AIRBASE</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Flug abgeschlossen — Rechnung</Heading>
          <Text style={text}>Guten Tag {customerName},</Text>
          <Text style={text}>
            Ihr Drohnenflug wurde erfolgreich abgeschlossen. Anbei finden Sie Ihre
            Rechnung sowie den Flugbericht.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>Rechnungsnummer</Text>
            <Text style={value}>{invoiceNumber}</Text>
            <Text style={label}>Buchungsnummer</Text>
            <Text style={value}>{bookingIdentifier}</Text>
            <Text style={label}>Leistung</Text>
            <Text style={value}>{serviceType}</Text>
            <Text style={label}>Flugdatum</Text>
            <Text style={value}>{flightDate}</Text>
          </Section>

          <Section style={priceBox}>
            <div style={priceRow}>
              <Text style={priceLabel}>Nettobetrag</Text>
              <Text style={priceValue}>CHF {subtotalCHF}</Text>
            </div>
            <div style={priceRow}>
              <Text style={priceLabel}>MwSt. (8.1%)</Text>
              <Text style={priceValue}>CHF {vatCHF}</Text>
            </div>
            <Hr style={{ borderColor: "#d1d5db", margin: "8px 0" }} />
            <div style={priceRow}>
              <Text style={{ ...priceLabel, fontWeight: "700", color: "#111827" }}>
                Gesamtbetrag
              </Text>
              <Text style={{ ...priceValue, fontWeight: "700", color: "#111827" }}>
                CHF {totalCHF}
              </Text>
            </div>
            <Text style={{ ...priceLabel, marginTop: "12px" }}>
              Zahlbar bis: {dueDate}
            </Text>
          </Section>

          {reportUrl && (
            <Button href={reportUrl} style={button}>
              Flugbericht (PDF) herunterladen
            </Button>
          )}

          <Hr style={hr} />
          <Text style={footer}>
            Ihr Dashboard:{" "}
            <a href={`${appUrl}/dashboard`} style={link}>
              {appUrl}/dashboard
            </a>
          </Text>
          <Text style={footer}>
            Mit freundlichen Grüssen
            <br />
            Das AIRBASE-Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PostFlightInvoice;

const body: React.CSSProperties = {
  backgroundColor: "#f6f9fc",
  fontFamily: "'Helvetica Neue', Helvetica, Arial, sans-serif",
};
const container: React.CSSProperties = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "40px 24px",
  borderRadius: "8px",
  maxWidth: "560px",
};
const h1: React.CSSProperties = {
  color: "#1a1a2e",
  fontSize: "24px",
  fontWeight: "700",
  marginBottom: "24px",
};
const text: React.CSSProperties = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.6",
  marginBottom: "12px",
};
const infoBox: React.CSSProperties = {
  backgroundColor: "#f3f4f6",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "16px",
};
const priceBox: React.CSSProperties = {
  backgroundColor: "#f0fdf4",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "24px",
};
const priceRow: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};
const priceLabel: React.CSSProperties = {
  color: "#374151",
  fontSize: "14px",
  margin: "4px 0",
};
const priceValue: React.CSSProperties = {
  color: "#374151",
  fontSize: "14px",
  margin: "4px 0",
};
const label: React.CSSProperties = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "600",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  marginBottom: "2px",
  marginTop: "12px",
};
const value: React.CSSProperties = {
  color: "#111827",
  fontSize: "15px",
  fontWeight: "600",
  marginTop: "0",
};
const button: React.CSSProperties = {
  backgroundColor: "#16a34a",
  borderRadius: "8px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  padding: "12px 24px",
  textDecoration: "none",
  display: "inline-block",
  marginBottom: "24px",
};
const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  marginBottom: "20px",
};
const footer: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
};
const link: React.CSSProperties = {
  color: "#2563eb",
};

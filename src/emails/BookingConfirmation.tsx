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
  serviceType: string;
  requestedDate: string;
  totalCHF: string;
  paymentUrl?: string;
  appUrl?: string;
}

export function BookingConfirmation({
  customerName,
  bookingIdentifier,
  serviceType,
  requestedDate,
  totalCHF,
  paymentUrl,
  appUrl = "https://airbase.one",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Buchungsbestätigung {bookingIdentifier} — Airbase</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Buchungsbestätigung</Heading>
          <Text style={text}>Guten Tag {customerName},</Text>
          <Text style={text}>
            Vielen Dank für Ihre Buchung. Wir haben Ihre Anfrage erhalten und werden
            sie so bald wie möglich bearbeiten.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>Buchungsnummer</Text>
            <Text style={value}>{bookingIdentifier}</Text>
            <Text style={label}>Leistung</Text>
            <Text style={value}>{serviceType}</Text>
            <Text style={label}>Gewünschtes Datum</Text>
            <Text style={value}>{requestedDate}</Text>
            <Text style={label}>Gesamtbetrag (inkl. MwSt.)</Text>
            <Text style={value}>CHF {totalCHF}</Text>
          </Section>

          {paymentUrl && (
            <>
              <Text style={text}>
                Ihr Angebot wurde genehmigt. Bitte tätigen Sie die Zahlung über
                folgenden Link, um Ihren Flug zu bestätigen:
              </Text>
              <Button href={paymentUrl} style={button}>
                Jetzt bezahlen
              </Button>
            </>
          )}

          <Hr style={hr} />

          <Text style={footer}>
            Ihr Buchungsstatus ist jederzeit im{" "}
            <a href={`${appUrl}/dashboard`} style={link}>
              Airbase Dashboard
            </a>{" "}
            einsehbar.
          </Text>
          <Text style={footer}>
            Mit freundlichen Grüssen
            <br />
            Das Airbase-Team
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

export default BookingConfirmation;

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
  marginBottom: "24px",
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
  backgroundColor: "#2563eb",
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

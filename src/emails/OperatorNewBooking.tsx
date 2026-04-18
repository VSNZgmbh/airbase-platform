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
  bookingIdentifier: string;
  customerName: string;
  serviceType: string;
  requestedDate: string;
  payloadWeightKg: string;
  deliveryAddress: string;
  totalCHF: string;
  operatorUrl?: string;
}

export function OperatorNewBooking({
  bookingIdentifier,
  customerName,
  serviceType,
  requestedDate,
  payloadWeightKg,
  deliveryAddress,
  totalCHF,
  operatorUrl = "https://voltair.one/operator",
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Neue Buchungsanfrage {bookingIdentifier} — VOLTAIR Operator</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Neue Buchungsanfrage</Heading>
          <Text style={text}>
            Eine neue Buchungsanfrage ist eingegangen und wartet auf Ihre Genehmigung.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>Buchungsnummer</Text>
            <Text style={value}>{bookingIdentifier}</Text>
            <Text style={label}>Kunde</Text>
            <Text style={value}>{customerName}</Text>
            <Text style={label}>Leistung</Text>
            <Text style={value}>{serviceType}</Text>
            <Text style={label}>Gewünschtes Datum</Text>
            <Text style={value}>{requestedDate}</Text>
            <Text style={label}>Nutzlast</Text>
            <Text style={value}>{payloadWeightKg} kg</Text>
            <Text style={label}>Lieferadresse</Text>
            <Text style={value}>{deliveryAddress}</Text>
            <Text style={label}>Gesamtbetrag</Text>
            <Text style={value}>CHF {totalCHF}</Text>
          </Section>

          <Button href={operatorUrl} style={button}>
            Im Operator-Panel ansehen
          </Button>

          <Hr style={hr} />
          <Text style={footer}>VOLTAIR Operator-System</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default OperatorNewBooking;

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
  backgroundColor: "#7c3aed",
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
};

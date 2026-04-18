import {
  Body,
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
  pilotName: string;
  bookingIdentifier: string;
  serviceType: string;
  scheduledDeparture: string;
  payloadWeightKg: string;
  deliveryAddress: string;
  droneModel: string;
  soraCategory?: string;
  notes?: string;
}

export function PilotFlightAssignment({
  pilotName,
  bookingIdentifier,
  serviceType,
  scheduledDeparture,
  payloadWeightKg,
  deliveryAddress,
  droneModel,
  soraCategory,
  notes,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>Neuer Flugauftrag {bookingIdentifier} — AIRBASE</Preview>
      <Body style={body}>
        <Container style={container}>
          <Heading style={h1}>Neuer Flugauftrag</Heading>
          <Text style={text}>Guten Tag {pilotName},</Text>
          <Text style={text}>
            Ihnen wurde ein neuer Flugauftrag zugewiesen. Bitte prüfen Sie die Details
            und bestätigen Sie die Ausführung im Pilot-Portal.
          </Text>

          <Section style={infoBox}>
            <Text style={label}>Auftragsnummer</Text>
            <Text style={value}>{bookingIdentifier}</Text>
            <Text style={label}>Leistung</Text>
            <Text style={value}>{serviceType}</Text>
            <Text style={label}>Geplanter Abflug</Text>
            <Text style={value}>{scheduledDeparture}</Text>
            <Text style={label}>Nutzlast</Text>
            <Text style={value}>{payloadWeightKg} kg</Text>
            <Text style={label}>Lieferadresse</Text>
            <Text style={value}>{deliveryAddress}</Text>
            <Text style={label}>Eingesetzte Drohne</Text>
            <Text style={value}>{droneModel}</Text>
            {soraCategory && (
              <>
                <Text style={label}>SORA-Kategorie</Text>
                <Text style={value}>{soraCategory}</Text>
              </>
            )}
            {notes && (
              <>
                <Text style={label}>Hinweise des Operators</Text>
                <Text style={value}>{notes}</Text>
              </>
            )}
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Bitte loggen Sie sich im AIRBASE Pilot-Portal ein, um den Vorflugcheck
            abzuschliessen und das Post-Flight-Log einzureichen.
          </Text>
          <Text style={footer}>Das AIRBASE-Team</Text>
        </Container>
      </Body>
    </Html>
  );
}

export default PilotFlightAssignment;

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
  backgroundColor: "#eef2ff",
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
const hr: React.CSSProperties = {
  borderColor: "#e5e7eb",
  marginBottom: "20px",
};
const footer: React.CSSProperties = {
  color: "#9ca3af",
  fontSize: "13px",
  lineHeight: "1.5",
};

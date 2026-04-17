import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#1f2937",
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 48,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 32,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#2563eb",
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
  },
  brandSub: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  docTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    color: "#374151",
    textAlign: "right",
  },
  docMeta: {
    fontSize: 9,
    color: "#6b7280",
    textAlign: "right",
    marginTop: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#1d4ed8",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#dbeafe",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  gridItem: {
    width: "50%",
    marginBottom: 8,
    paddingRight: 12,
  },
  fieldLabel: {
    fontSize: 8,
    color: "#9ca3af",
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  fieldValue: {
    fontSize: 10,
    color: "#111827",
  },
  checklistRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  checkMark: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: "#16a34a",
    backgroundColor: "#dcfce7",
    marginRight: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMarkText: {
    fontSize: 8,
    color: "#16a34a",
    fontFamily: "Helvetica-Bold",
  },
  checkItemText: {
    fontSize: 9,
    color: "#374151",
  },
  notesBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 10,
    marginTop: 6,
  },
  notesText: {
    fontSize: 9,
    color: "#374151",
    lineHeight: 1.5,
  },
  warningBox: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  warningText: {
    fontSize: 9,
    color: "#b91c1c",
  },
  footer: {
    position: "absolute",
    bottom: 28,
    left: 48,
    right: 48,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: "#9ca3af",
  },
  soraBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  soraLabel: {
    fontSize: 9,
    color: "#1d4ed8",
    fontFamily: "Helvetica-Bold",
    marginRight: 8,
  },
  soraValue: {
    fontSize: 10,
    color: "#1d4ed8",
    fontFamily: "Helvetica-Bold",
  },
});

const SORA_CHECKLIST = [
  "Akku vollständig geladen und geprüft",
  "Propeller auf Schäden geprüft",
  "GPS-Signal stabil (min. 8 Satelliten)",
  "Hinderniserkennungs-Sensoren kalibriert",
  "Wetterkonditionen innerhalb der Betriebsgrenzen",
  "Luftraum-Freigabe bestätigt (NOTAM geprüft)",
  "Kommunikation mit Bodenstelle hergestellt",
  "Nutzlast korrekt gesichert und gewogen",
];

export interface FlightReportData {
  // Booking
  bookingIdentifier: string;
  serviceType: string;
  serviceSubtype?: string;
  customerName: string;
  // Route
  deliveryAddress: string;
  pickupAddress?: string;
  routeDistanceKm?: string;
  // Cargo
  payloadWeightKg: string;
  payloadDescription?: string;
  isDangerousGoods: boolean;
  // Flight
  pilotName: string;
  droneModel: string;
  droneSerial: string;
  scheduledDeparture?: string;
  actualDeparture?: string;
  actualArrival?: string;
  flightDurationMinutes?: number;
  soraCategory?: string;
  grcScore?: number;
  arcScore?: number;
  // Post-flight
  actualWeightKg?: number;
  notes?: string;
  incidentReport?: string;
  // Invoice
  invoiceNumber?: string;
  totalCHF?: string;
  // Meta
  reportGeneratedAt: string;
}

export function FlightReport({ data }: { data: FlightReportData }) {
  return (
    <Document
      title={`Airbase Flugbericht — ${data.bookingIdentifier}`}
      author="Airbase AG"
      subject="Drohnenflug-Bericht"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AIRBASE</Text>
            <Text style={styles.brandSub}>Drohnenlogistik Schweiz</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>FLUGBERICHT</Text>
            <Text style={styles.docMeta}>{data.bookingIdentifier}</Text>
            <Text style={styles.docMeta}>Erstellt: {data.reportGeneratedAt}</Text>
          </View>
        </View>

        {/* SORA Compliance Banner */}
        {data.soraCategory && (
          <View style={[styles.section, { marginBottom: 16 }]}>
            <View style={styles.soraBox}>
              <Text style={styles.soraLabel}>SORA-Konformität:</Text>
              <Text style={styles.soraValue}>Kategorie {data.soraCategory}</Text>
              {data.grcScore != null && (
                <Text style={[styles.soraLabel, { marginLeft: 16 }]}>
                  GRC: {data.grcScore}  |  ARC: {data.arcScore ?? "—"}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* Flight Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FLUGDETAILS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Leistung</Text>
              <Text style={styles.fieldValue}>{data.serviceType}
                {data.serviceSubtype ? ` — ${data.serviceSubtype}` : ""}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Kunde</Text>
              <Text style={styles.fieldValue}>{data.customerName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Pilot</Text>
              <Text style={styles.fieldValue}>{data.pilotName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Drohne</Text>
              <Text style={styles.fieldValue}>{data.droneModel} ({data.droneSerial})</Text>
            </View>
            {data.scheduledDeparture && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Geplanter Abflug</Text>
                <Text style={styles.fieldValue}>{data.scheduledDeparture}</Text>
              </View>
            )}
            {data.actualDeparture && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Tatsächlicher Abflug</Text>
                <Text style={styles.fieldValue}>{data.actualDeparture}</Text>
              </View>
            )}
            {data.actualArrival && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Landung</Text>
                <Text style={styles.fieldValue}>{data.actualArrival}</Text>
              </View>
            )}
            {data.flightDurationMinutes != null && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Flugdauer</Text>
                <Text style={styles.fieldValue}>{data.flightDurationMinutes} Minuten</Text>
              </View>
            )}
          </View>
        </View>

        {/* Route */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROUTE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Abflugort</Text>
              <Text style={styles.fieldValue}>{data.pickupAddress ?? "Airbase Hub"}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Lieferadresse</Text>
              <Text style={styles.fieldValue}>{data.deliveryAddress}</Text>
            </View>
            {data.routeDistanceKm && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Routendistanz</Text>
                <Text style={styles.fieldValue}>{data.routeDistanceKm} km</Text>
              </View>
            )}
          </View>
        </View>

        {/* Cargo */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NUTZLAST</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Geplantes Gewicht</Text>
              <Text style={styles.fieldValue}>{data.payloadWeightKg} kg</Text>
            </View>
            {data.actualWeightKg != null && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Tatsächliches Gewicht</Text>
                <Text style={styles.fieldValue}>{data.actualWeightKg} kg</Text>
              </View>
            )}
            {data.payloadDescription && (
              <View style={[styles.gridItem, { width: "100%" }]}>
                <Text style={styles.fieldLabel}>Beschreibung</Text>
                <Text style={styles.fieldValue}>{data.payloadDescription}</Text>
              </View>
            )}
          </View>
          {data.isDangerousGoods && (
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>⚠ GEFAHRGUT — Sonderhandhabung erforderlich</Text>
            </View>
          )}
        </View>

        {/* SORA Safety Checklist */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SORA-CHECKLISTE (VORFLUGKONTROLLE)</Text>
          {SORA_CHECKLIST.map((item, idx) => (
            <View key={idx} style={styles.checklistRow}>
              <View style={styles.checkMark}>
                <Text style={styles.checkMarkText}>✓</Text>
              </View>
              <Text style={styles.checkItemText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Notes */}
        {(data.notes || data.incidentReport) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>NOTIZEN & BERICHT</Text>
            {data.notes && (
              <>
                <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>Pilot-Notizen</Text>
                <View style={styles.notesBox}>
                  <Text style={styles.notesText}>{data.notes}</Text>
                </View>
              </>
            )}
            {data.incidentReport && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 10, marginBottom: 4 }]}>
                  Zwischenfall-Bericht
                </Text>
                <View style={styles.warningBox}>
                  <Text style={styles.warningText}>{data.incidentReport}</Text>
                </View>
              </>
            )}
          </View>
        )}

        {/* Invoice Summary */}
        {data.invoiceNumber && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>RECHNUNGSÜBERSICHT</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Rechnungsnummer</Text>
                <Text style={styles.fieldValue}>{data.invoiceNumber}</Text>
              </View>
              {data.totalCHF && (
                <View style={styles.gridItem}>
                  <Text style={styles.fieldLabel}>Gesamtbetrag (inkl. MwSt.)</Text>
                  <Text style={styles.fieldValue}>CHF {data.totalCHF}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            Airbase AG · Drohnenlogistik Schweiz · airbase.one
          </Text>
          <Text style={styles.footerText} render={({ pageNumber, totalPages }) =>
            `Seite ${pageNumber} / ${totalPages}`
          } />
        </View>
      </Page>
    </Document>
  );
}

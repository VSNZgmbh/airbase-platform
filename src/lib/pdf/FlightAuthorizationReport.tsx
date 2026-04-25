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
    borderBottomColor: "#D32F2F",
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#D32F2F",
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
    marginBottom: 18,
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
  gridItemFull: {
    width: "100%",
    marginBottom: 8,
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
  decisionBox: {
    borderWidth: 1,
    borderRadius: 4,
    padding: 10,
    marginBottom: 8,
  },
  decisionApproved: {
    backgroundColor: "#dcfce7",
    borderColor: "#16a34a",
  },
  decisionRejected: {
    backgroundColor: "#fef2f2",
    borderColor: "#dc2626",
  },
  decisionEscalated: {
    backgroundColor: "#fef3c7",
    borderColor: "#d97706",
  },
  decisionLabel: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
  },
  decisionApprovedText: { color: "#16a34a" },
  decisionRejectedText: { color: "#dc2626" },
  decisionEscalatedText: { color: "#d97706" },
  decisionReason: {
    fontSize: 9,
    color: "#374151",
    marginTop: 4,
  },
  soraBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 4,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  soraItem: {
    marginRight: 20,
    marginBottom: 4,
  },
  soraLabel: {
    fontSize: 8,
    color: "#1d4ed8",
    fontFamily: "Helvetica-Bold",
  },
  soraValue: {
    fontSize: 11,
    color: "#1d4ed8",
    fontFamily: "Helvetica-Bold",
  },
  weatherBox: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 8,
    marginBottom: 6,
  },
  weatherSafe: { backgroundColor: "#f0fdf4" },
  weatherMarginal: { backgroundColor: "#fffbeb" },
  weatherUnsafe: { backgroundColor: "#fef2f2" },
  warningText: {
    fontSize: 9,
    color: "#b91c1c",
    marginTop: 2,
  },
  chainRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  chainStep: {
    fontSize: 9,
    color: "#374151",
  },
  chainArrow: {
    fontSize: 10,
    color: "#9ca3af",
    marginHorizontal: 6,
  },
  sorRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  sorId: {
    fontSize: 9,
    color: "#1d4ed8",
    fontFamily: "Helvetica-Bold",
  },
  sorTitle: {
    fontSize: 9,
    color: "#374151",
    marginLeft: 6,
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
  legalBox: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  legalText: {
    fontSize: 8,
    color: "#6b7280",
    lineHeight: 1.5,
  },
});

export interface FlightAuthorizationReportData {
  // Authorization metadata
  authorizationId: string;
  lucNumber: string;
  tenantName: string;
  createdAt: string;
  decidedAt: string;
  requestedForDatetime: string;

  // Route
  pickupLat: string;
  pickupLng: string;
  deliveryLat: string;
  deliveryLng: string;
  altitudeAgl: number;

  // SORA snapshot
  sailLevel: string;
  grcScore: number;
  arcLevel: string;
  overallRisk: string;
  soraDetails?: {
    populationDensity?: string;
    airspaceClass?: string;
    alpineZone?: boolean;
    riskFactors?: string[];
  };

  // Weather snapshot
  weather: {
    overallCondition: "safe" | "marginal" | "unsafe";
    pickup: {
      windSpeedMs: number;
      precipitationMm: number;
      visibilityM: number | null;
      temperature: number;
      warnings: string[];
    };
    delivery: {
      windSpeedMs: number;
      precipitationMm: number;
      visibilityM: number | null;
      temperature: number;
      warnings: string[];
    };
  };

  // NOTAM status
  notam: {
    overallSeverity: string;
    alerts: string[];
    affectedAreas: string[];
  };

  // Decision chain
  decision: "approved" | "rejected" | "escalated";
  decisionReason: string;
  decisionBy: string;
  decisionByUserId?: string;
  safetyManagerDecision?: string;
  safetyManagerUserId?: string;
  safetyManagerDecidedAt?: string;

  // Linked SOR IDs
  linkedSORs: Array<{
    id: string;
    title: string;
    severity: string;
  }>;

  // Export metadata
  bazlExportedAt?: string;
  retentionExpiresAt?: string;
  reportGeneratedAt: string;
}

function formatCoord(lat: string, lng: string): string {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  return `${Math.abs(latNum).toFixed(5)}${latNum >= 0 ? "N" : "S"}, ${Math.abs(lngNum).toFixed(5)}${lngNum >= 0 ? "E" : "W"}`;
}

function DecisionBanner({ data }: { data: FlightAuthorizationReportData }) {
  const boxStyle =
    data.decision === "approved"
      ? styles.decisionApproved
      : data.decision === "rejected"
        ? styles.decisionRejected
        : styles.decisionEscalated;
  const textStyle =
    data.decision === "approved"
      ? styles.decisionApprovedText
      : data.decision === "rejected"
        ? styles.decisionRejectedText
        : styles.decisionEscalatedText;
  const label =
    data.decision === "approved"
      ? "GENEHMIGT"
      : data.decision === "rejected"
        ? "ABGELEHNT"
        : "ESKALIERT";

  return (
    <View style={[styles.decisionBox, boxStyle]}>
      <Text style={[styles.decisionLabel, textStyle]}>{label}</Text>
      <Text style={styles.decisionReason}>{data.decisionReason}</Text>
    </View>
  );
}

export function FlightAuthorizationReport({
  data,
}: {
  data: FlightAuthorizationReportData;
}) {
  return (
    <Document
      title={`BAZL Flug-Autorisierung — ${data.authorizationId}`}
      author="VSNZ GmbH"
      subject="LUC Flug-Autorisierungsbericht"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AIRBASE</Text>
            <Text style={styles.brandSub}>LUC Flug-Autorisierung</Text>
            <Text style={styles.brandSub}>{data.lucNumber}</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>AUTORISIERUNGSBERICHT</Text>
            <Text style={styles.docMeta}>ID: {data.authorizationId.slice(0, 8)}</Text>
            <Text style={styles.docMeta}>Erstellt: {data.reportGeneratedAt}</Text>
          </View>
        </View>

        {/* Decision Banner */}
        <DecisionBanner data={data} />

        {/* Authorization Metadata */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUTORISIERUNG</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Autorisierungs-ID</Text>
              <Text style={styles.fieldValue}>{data.authorizationId}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>LUC-Nummer</Text>
              <Text style={styles.fieldValue}>{data.lucNumber}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Betreiber</Text>
              <Text style={styles.fieldValue}>{data.tenantName}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Geplant für</Text>
              <Text style={styles.fieldValue}>{data.requestedForDatetime}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Erstellt</Text>
              <Text style={styles.fieldValue}>{data.createdAt}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Entschieden</Text>
              <Text style={styles.fieldValue}>{data.decidedAt}</Text>
            </View>
          </View>
        </View>

        {/* Route Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ROUTE</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Abflug (WGS84)</Text>
              <Text style={styles.fieldValue}>
                {formatCoord(data.pickupLat, data.pickupLng)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Ziel (WGS84)</Text>
              <Text style={styles.fieldValue}>
                {formatCoord(data.deliveryLat, data.deliveryLng)}
              </Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Flughoehe AGL</Text>
              <Text style={styles.fieldValue}>{data.altitudeAgl} m</Text>
            </View>
          </View>
        </View>

        {/* SORA Assessment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SORA-BEWERTUNG</Text>
          <View style={styles.soraBox}>
            <View style={styles.soraItem}>
              <Text style={styles.soraLabel}>SAIL</Text>
              <Text style={styles.soraValue}>{data.sailLevel}</Text>
            </View>
            <View style={styles.soraItem}>
              <Text style={styles.soraLabel}>GRC</Text>
              <Text style={styles.soraValue}>{data.grcScore}</Text>
            </View>
            <View style={styles.soraItem}>
              <Text style={styles.soraLabel}>ARC</Text>
              <Text style={styles.soraValue}>{data.arcLevel}</Text>
            </View>
            <View style={styles.soraItem}>
              <Text style={styles.soraLabel}>Gesamtrisiko</Text>
              <Text style={styles.soraValue}>{data.overallRisk}</Text>
            </View>
          </View>
          {data.soraDetails?.riskFactors && data.soraDetails.riskFactors.length > 0 && (
            <View style={{ marginTop: 6 }}>
              <Text style={styles.fieldLabel}>Risikofaktoren</Text>
              {data.soraDetails.riskFactors.map((factor, idx) => (
                <Text key={idx} style={{ fontSize: 9, color: "#374151", marginLeft: 8 }}>
                  {"\u2022"} {factor}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Weather Snapshot */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WETTER-SNAPSHOT</Text>
          <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>
            Gesamtzustand:{" "}
            {data.weather.overallCondition === "safe"
              ? "SICHER"
              : data.weather.overallCondition === "marginal"
                ? "MARGINAL"
                : "UNSICHER"}
          </Text>
          <View style={styles.grid}>
            {(["pickup", "delivery"] as const).map((point) => (
              <View key={point} style={styles.gridItem}>
                <View
                  style={[
                    styles.weatherBox,
                    data.weather.overallCondition === "unsafe"
                      ? styles.weatherUnsafe
                      : data.weather.overallCondition === "marginal" || data.weather[point].warnings.length > 0
                        ? styles.weatherMarginal
                        : styles.weatherSafe,
                  ]}
                >
                  <Text style={[styles.fieldLabel, { marginBottom: 4 }]}>
                    {point === "pickup" ? "Abflug" : "Ziel"}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#374151" }}>
                    Wind: {data.weather[point].windSpeedMs.toFixed(1)} m/s
                  </Text>
                  <Text style={{ fontSize: 9, color: "#374151" }}>
                    Niederschlag: {data.weather[point].precipitationMm.toFixed(1)} mm/h
                  </Text>
                  <Text style={{ fontSize: 9, color: "#374151" }}>
                    Sicht:{" "}
                    {data.weather[point].visibilityM != null
                      ? `${data.weather[point].visibilityM} m`
                      : "k.A."}
                  </Text>
                  <Text style={{ fontSize: 9, color: "#374151" }}>
                    Temperatur: {data.weather[point].temperature.toFixed(1)}°C
                  </Text>
                  {data.weather[point].warnings.map((w, idx) => (
                    <Text key={idx} style={styles.warningText}>
                      {w}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* NOTAM Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>NOTAM-STATUS</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Gesamtschwere</Text>
              <Text style={styles.fieldValue}>{data.notam.overallSeverity}</Text>
            </View>
          </View>
          {data.notam.alerts.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.fieldLabel}>Warnungen</Text>
              {data.notam.alerts.map((alert, idx) => (
                <Text key={idx} style={{ fontSize: 9, color: "#b91c1c", marginLeft: 8 }}>
                  {"\u2022"} {alert}
                </Text>
              ))}
            </View>
          )}
          {data.notam.affectedAreas.length > 0 && (
            <View style={{ marginTop: 4 }}>
              <Text style={styles.fieldLabel}>Betroffene Gebiete</Text>
              {data.notam.affectedAreas.map((area, idx) => (
                <Text key={idx} style={{ fontSize: 9, color: "#374151", marginLeft: 8 }}>
                  {"\u2022"} {area}
                </Text>
              ))}
            </View>
          )}
        </View>

        {/* Decision Chain */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ENTSCHEIDUNGSKETTE</Text>
          <View style={styles.chainRow}>
            <Text style={styles.chainStep}>
              1. KI-System ({data.decisionBy === "system" ? data.decision : "eskaliert"})
            </Text>
          </View>
          {data.safetyManagerDecision && (
            <View style={styles.chainRow}>
              <Text style={styles.chainArrow}>{"\u2192"}</Text>
              <Text style={styles.chainStep}>
                2. Safety Manager: {data.safetyManagerDecision}
                {data.safetyManagerUserId
                  ? ` (${data.safetyManagerUserId})`
                  : ""}
                {data.safetyManagerDecidedAt
                  ? ` — ${data.safetyManagerDecidedAt}`
                  : ""}
              </Text>
            </View>
          )}
          {data.decisionBy === "accountable_manager" && (
            <View style={styles.chainRow}>
              <Text style={styles.chainArrow}>{"\u2192"}</Text>
              <Text style={styles.chainStep}>
                3. Accountable Manager: {data.decision}
                {data.decisionByUserId ? ` (${data.decisionByUserId})` : ""}
                {" — "}{data.decidedAt}
              </Text>
            </View>
          )}
        </View>

        {/* Linked SORs */}
        {data.linkedSORs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VERKNÜPFTE SOR-BERICHTE</Text>
            {data.linkedSORs.map((sor) => (
              <View key={sor.id} style={styles.sorRow}>
                <Text style={styles.sorId}>{sor.id.slice(0, 8)}</Text>
                <Text style={styles.sorTitle}>
                  [{sor.severity.toUpperCase()}] {sor.title}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Retention & Legal */}
        <View style={styles.section}>
          <View style={styles.legalBox}>
            <Text style={styles.legalText}>
              Aufbewahrungsfrist: 3 Jahre ab Flugdatum (BAZL LUC-Anforderungen).
              {data.retentionExpiresAt
                ? ` Ablauf: ${data.retentionExpiresAt}.`
                : ""}
            </Text>
            <Text style={[styles.legalText, { marginTop: 4 }]}>
              Dieses Dokument wurde automatisch generiert und ist Teil der
              LUC-Selbstautorisierungsdokumentation gemäß EASA UAS Regulation
              (EU) 2019/947 und BAZL-Richtlinien.
            </Text>
            {data.bazlExportedAt && (
              <Text style={[styles.legalText, { marginTop: 4 }]}>
                BAZL-Export: {data.bazlExportedAt}
              </Text>
            )}
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            VSNZ GmbH {"\u00B7"} LUC Autorisierung {"\u00B7"} airbase.swiss
          </Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) =>
              `Seite ${pageNumber} / ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}

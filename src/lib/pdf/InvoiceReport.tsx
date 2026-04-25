import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

export interface InvoiceReportData {
  invoiceNumber: string;
  bookingIdentifier: string;
  customerName: string;
  customerAddress?: string;
  customerCity?: string;
  serviceType: string;
  flightDate: string;
  subtotalCHF: string;
  vatPercent: string;
  vatCHF: string;
  totalCHF: string;
  dueDate: string;
  generatedAt: string;
}

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
    borderBottomColor: "#7c3aed",
  },
  brand: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#7c3aed",
  },
  brandSub: {
    fontSize: 9,
    color: "#6b7280",
    marginTop: 2,
  },
  docTitle: {
    fontSize: 14,
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
    color: "#7c3aed",
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#ede9fe",
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
  table: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRowLast: {
    flexDirection: "row",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  tableRowTotal: {
    flexDirection: "row",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: "#f0fdf4",
  },
  tableLabel: {
    flex: 1,
    fontSize: 10,
    color: "#374151",
  },
  tableValue: {
    width: 120,
    fontSize: 10,
    color: "#374151",
    textAlign: "right",
  },
  tableLabelBold: {
    flex: 1,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
  },
  tableValueBold: {
    width: 120,
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#111827",
    textAlign: "right",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 48,
    right: 48,
    textAlign: "center",
    fontSize: 8,
    color: "#9ca3af",
  },
});

export function InvoiceReport({ data }: { data: InvoiceReportData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brand}>AIRBASE</Text>
            <Text style={styles.brandSub}>Swiss Drone Delivery</Text>
          </View>
          <View>
            <Text style={styles.docTitle}>Rechnung</Text>
            <Text style={styles.docMeta}>{data.invoiceNumber}</Text>
            <Text style={styles.docMeta}>Erstellt: {data.generatedAt}</Text>
          </View>
        </View>

        {/* Customer info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rechnungsempfänger</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Kunde</Text>
              <Text style={styles.fieldValue}>{data.customerName}</Text>
            </View>
            {data.customerAddress && (
              <View style={styles.gridItem}>
                <Text style={styles.fieldLabel}>Adresse</Text>
                <Text style={styles.fieldValue}>
                  {data.customerAddress}
                  {data.customerCity ? `, ${data.customerCity}` : ""}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Service details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Leistungsdetails</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Buchungsnummer</Text>
              <Text style={styles.fieldValue}>{data.bookingIdentifier}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Leistung</Text>
              <Text style={styles.fieldValue}>{data.serviceType}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Flugdatum</Text>
              <Text style={styles.fieldValue}>{data.flightDate}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Zahlbar bis</Text>
              <Text style={styles.fieldValue}>{data.dueDate}</Text>
            </View>
          </View>
        </View>

        {/* Pricing table */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Betrag</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Nettobetrag</Text>
              <Text style={styles.tableValue}>CHF {data.subtotalCHF}</Text>
            </View>
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>MwSt. ({data.vatPercent}%)</Text>
              <Text style={styles.tableValue}>CHF {data.vatCHF}</Text>
            </View>
            <View style={styles.tableRowTotal}>
              <Text style={styles.tableLabelBold}>Gesamtbetrag</Text>
              <Text style={styles.tableValueBold}>CHF {data.totalCHF}</Text>
            </View>
          </View>
        </View>

        {/* Payment info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zahlungsinformationen</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Zahlungsempfänger</Text>
              <Text style={styles.fieldValue}>AIRBASE AG</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={styles.fieldLabel}>Referenz</Text>
              <Text style={styles.fieldValue}>{data.invoiceNumber}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          AIRBASE AG — Swiss Drone Delivery — airbase.swiss
        </Text>
      </Page>
    </Document>
  );
}

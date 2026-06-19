import {
  Document,
  Page,
  View,
  Text,
  Image,
  StyleSheet,
} from "@react-pdf/renderer";

/* ─── Brand Colors ─── */
const C = {
  accent: "#E30613",
  gold: "#B8860B",
  green: "#16A34A",
  red: "#E30613",
  text: "#1A1A2E",
  textSecondary: "#4A4A5A",
  textMuted: "#8A8A9A",
  bg: "#FFFFFF",
  bgAlt: "#F8F9FA",
  border: "#E8E8EE",
};

const s = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: C.bg,
    padding: 36,
    fontFamily: "Helvetica",
    position: "relative",
  },
  footer: {
    position: "absolute",
    bottom: 14,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: { fontSize: 7, color: C.textMuted },
  sectionNum: {
    fontSize: 8,
    color: C.accent,
    borderWidth: 1,
    borderColor: C.accent + "40",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    letterSpacing: 1.5,
    marginBottom: 6,
    alignSelf: "flex-start",
  },
  h1: { fontSize: 24, fontWeight: "bold", color: C.text, marginBottom: 4 },
  h2: { fontSize: 16, fontWeight: "bold", color: C.text, marginBottom: 6 },
  h3: { fontSize: 11, fontWeight: "bold", color: C.text, marginBottom: 4 },
  subtitle: { fontSize: 9, color: C.textMuted, marginBottom: 12 },
  body: { fontSize: 8, color: C.textSecondary, lineHeight: 1.5 },
  card: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 10,
    backgroundColor: C.bg,
    marginBottom: 6,
  },
  row: { flexDirection: "row", gap: 6 },
  col: { flex: 1 },
  divider: { height: 1, backgroundColor: C.border, marginVertical: 8 },
  // Table styles
  tHead: {
    flexDirection: "row",
    backgroundColor: C.bgAlt,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  tCell: { fontSize: 7, color: C.textSecondary },
  tCellBold: { fontSize: 7, fontWeight: "bold", color: C.text },
  tCellAccent: { fontSize: 7, fontWeight: "bold", color: C.accent },
  tCellGreen: { fontSize: 7, fontWeight: "bold", color: C.green },
  tCellRed: { fontSize: 7, fontWeight: "bold", color: C.red },
  kpiBox: {
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 6,
    padding: 8,
    alignItems: "center",
    flex: 1,
  },
  kpiValue: { fontSize: 14, fontWeight: "bold", color: C.accent },
  kpiLabel: {
    fontSize: 6,
    color: C.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 2,
    textAlign: "center",
  },
  bullet: { flexDirection: "row", gap: 4, marginBottom: 3 },
  bulletDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: C.accent,
    marginTop: 3,
  },
  bulletText: { flex: 1, fontSize: 8, color: C.textSecondary, lineHeight: 1.4 },
  barBg: {
    height: 6,
    backgroundColor: C.border,
    borderRadius: 3,
    overflow: "hidden",
    marginVertical: 2,
  },
});

function Footer({ page, total }: { page: number; total: number }) {
  return (
    <View style={s.footer}>
      <Text style={s.footerText}>airBASE Aviation -- Confidential</Text>
      <Text style={s.footerText}>
        {page} / {total}
      </Text>
    </View>
  );
}

const TOTAL = 12;

export function FinancialPlanPDF({ logoSrc = "/airbase-logo-pdf.png" }: { logoSrc?: string } = {}) {
  return (
    <Document
      title="airBASE Aviation - Financial Plan 2026"
      author="airBASE Aviation"
      subject="Confidential Financial Plan"
    >
      {/* ═══ COVER PAGE ═══ */}
      <Page
        size="A4"
        style={{
          flexDirection: "column",
          backgroundColor: "#1A1A2E",
          padding: 40,
          fontFamily: "Helvetica",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Image
          src={logoSrc}
          style={{ width: 140, marginBottom: 24, opacity: 0.9 }}
        />
        <Text
          style={{
            fontSize: 8,
            color: "rgba(255,255,255,0.4)",
            letterSpacing: 3,
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Investor-Grade Financial Projections
        </Text>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "bold",
            color: "#FFFFFF",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          Financial Plan
        </Text>
        <Text
          style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", marginBottom: 32 }}
        >
          Confidential -- June 2026
        </Text>

        {/* Highlight KPIs */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[
            { label: "Revenue Y6", value: "CHF 24.1M", sub: "76% EBITDA margin" },
            { label: "Contribution Margin", value: "87.4%", sub: "Per drone unit" },
            { label: "Break-Even", value: "Year 2", sub: "Operational" },
            { label: "6-Yr Cumulative", value: "+CHF 43.9M", sub: "Cash flow" },
          ].map((kpi) => (
            <View
              key={kpi.label}
              style={{
                width: "48%",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.1)",
                borderRadius: 6,
                padding: 10,
                alignItems: "center",
                backgroundColor: "rgba(255,255,255,0.04)",
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: "bold", color: "#FFFFFF" }}>
                {kpi.value}
              </Text>
              <Text
                style={{
                  fontSize: 6,
                  color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                  marginTop: 2,
                }}
              >
                {kpi.label}
              </Text>
              <Text style={{ fontSize: 6, color: "rgba(255,255,255,0.25)", marginTop: 1 }}>
                {kpi.sub}
              </Text>
            </View>
          ))}
        </View>

        <View style={[s.footer, { bottom: 20 }]}>
          <Text style={[s.footerText, { color: "rgba(255,255,255,0.3)" }]}>
            airBASE Aviation -- Confidential
          </Text>
          <Text style={[s.footerText, { color: "rgba(255,255,255,0.3)" }]}>
            1 / {TOTAL}
          </Text>
        </View>
      </Page>

      {/* ═══ TABLE OF CONTENTS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.h2}>Table of Contents</Text>
        <View style={s.divider} />
        {[
          { num: "01", title: "Unit Economics", sub: "Per drone P&L -- CHF 700K revenue, 90% margin" },
          { num: "02", title: "6-Year P&L", sub: "CHF 120K to CHF 24.1M with 76% EBITDA margin" },
          { num: "03", title: "Break-Even Analysis", sub: "Operational break-even Month 7-8" },
          { num: "04", title: "Cash Flow", sub: "-CHF 465K to +CHF 43.9M cumulative" },
          { num: "05", title: "Use of Funds", sub: "CHF 1.5M across seven strategic pillars" },
          { num: "06", title: "Investor ROI", sub: "Convertible note returns by scenario" },
          { num: "07", title: "Franchise Economics", sub: "Partner P&L + HQ recurring revenue" },
          { num: "08", title: "Fleet Growth", sub: "2 to 30 own drones + 35 franchise partners over 6 years" },
          { num: "09", title: "Platform GMV", sub: "CHF 97.6M total ecosystem value" },
          { num: "10", title: "Sensitivity Analysis", sub: "Revenue sensitivity grid + risk factors" },
        ].map((item) => (
          <View
            key={item.num}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              paddingVertical: 6,
              borderBottomWidth: 1,
              borderBottomColor: C.border,
            }}
          >
            <Text style={{ fontSize: 9, fontWeight: "bold", color: C.accent, width: 20 }}>
              {item.num}
            </Text>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold", color: C.text }}>
                {item.title}
              </Text>
              <Text style={{ fontSize: 7, color: C.textMuted }}>{item.sub}</Text>
            </View>
          </View>
        ))}
        <Footer page={2} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 1: UNIT ECONOMICS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>01</Text>
        <Text style={s.h2}>Unit Economics</Text>
        <Text style={s.subtitle}>
          Per drone profit & loss -- CHF 700K revenue, 90.4% contribution margin
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Revenue / Drone", value: "CHF 700K", sub: "200 days x CHF 3,500/day" },
            { label: "Contribution Margin", value: "CHF 633K", sub: "90.4% margin" },
            { label: "CAPEX / Drone", value: "CHF 49K", sub: "T100 full set (base)" },
            { label: "Annual OPEX", value: "CHF 12.9K", sub: "Maint + insurance + battery" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={s.kpiValue}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 1 }}>
                {kpi.sub}
              </Text>
            </View>
          ))}
        </View>

        {/* CAPEX Table */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Capital Expenditure (CAPEX)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 140 }]}>Item</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Conservative</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Base</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Optimistic</Text>
          </View>
          {[
            ["Drone (T100, full set)", "CHF 45,000", "CHF 40,000", "CHF 35,000"],
            ["Extra battery sets (3-4x)", "CHF 10,000", "CHF 9,000", "CHF 8,000"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { width: 140 }]}>{row[0]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[2]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[3]}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { width: 140 }]}>Total per drone</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 55,000</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 49,000</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 43,000</Text>
          </View>
        </View>

        {/* Revenue per Drone */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Revenue per Drone (Base Case)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Metric</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Value</Text>
          </View>
          {[
            ["Operational days/year", "200"],
            ["Average daily rate (blended)", "CHF 3,500"],
            ["Gross revenue per drone/year", "CHF 700,000"],
            ["Direct costs (maintenance, insurance)", "CHF 12,900"],
            ["Crew cost allocation (1 pilot, salaried)", "CHF 75,000"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { flex: 2 }]}>Contribution margin per drone</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 612,100 (87.4%)</Text>
          </View>
        </View>

        {/* OPEX Table */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Annual Operating Cost per Drone
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Item</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cost/Year</Text>
          </View>
          {[
            ["Maintenance (12% of purchase)", "CHF 5,400"],
            ["Insurance (liability + full)", "CHF 3,000"],
            ["Battery replacement reserve", "CHF 4,500"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { flex: 2 }]}>Total annual OPEX</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 12,900</Text>
          </View>
        </View>
        <Footer page={3} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 2: 6-YEAR P&L ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>02</Text>
        <Text style={s.h2}>6-Year Profit & Loss</Text>
        <Text style={s.subtitle}>
          From CHF 120K (Year 1) to CHF 24.1M (Year 6) with 76% EBITDA margin
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 8 }}>
          {[
            { label: "Year 6 Revenue", value: "CHF 24.1M" },
            { label: "Year 6 EBITDA", value: "CHF 18.3M" },
            { label: "Own Drones (Y6)", value: "30 drones" },
            { label: "Franchise Partners", value: "35" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 12 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Consolidated P&L */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Consolidated P&L
          </Text>
          {/* Header */}
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 90 }]}> </Text>
            {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((h) => (
              <Text key={h} style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{h}</Text>
            ))}
          </View>
          {/* Fleet */}
          {[
            { label: "Own Drones", vals: ["2", "10", "16", "22", "26", "30"] },
            { label: "Pilots", vals: ["1", "2", "3", "4", "5", "6"] },
            { label: "Core Team", vals: ["0", "2", "4", "6", "8", "10"] },
            { label: "Hubs", vals: ["1", "4", "5", "6", "6", "6"] },
            { label: "Franchise Partners", vals: ["0", "0", "5", "12", "24", "35"], bold: true },
          ].map((row) => (
            <View key={row.label} style={[s.tRow, row.bold ? { borderBottomWidth: 2, borderBottomColor: C.border } : {}]}>
              <Text style={[row.bold ? s.tCellBold : s.tCell, { width: 90 }]}>{row.label}</Text>
              {row.vals.map((v, i) => (
                <Text key={i} style={[row.bold ? s.tCellBold : s.tCell, { flex: 1, textAlign: "right" }]}>{v}</Text>
              ))}
            </View>
          ))}
          {/* Revenue */}
          <View style={{ paddingTop: 4, paddingBottom: 2 }}>
            <Text style={{ fontSize: 6, color: C.accent, letterSpacing: 1, textTransform: "uppercase" }}>Revenue</Text>
          </View>
          {[
            { label: "Own DaaS", vals: ["120K", "2,000K", "5,280K", "8,140K", "10,400K", "12,600K"] },
            { label: "Gov/Military", vals: ["--", "120K", "240K", "480K", "720K", "960K"] },
            { label: "Subtotal Own Ops", vals: ["120K", "2,120K", "5,520K", "8,620K", "11,120K", "13,560K"], accent: true },
            { label: "Franchise entry fees", vals: ["--", "--", "175K", "245K", "420K", "385K"] },
            { label: "Hardware margin", vals: ["--", "--", "150K", "210K", "360K", "330K"] },
            { label: "Royalties (9%)", vals: ["--", "--", "567K", "2,052K", "4,320K", "7,560K"] },
            { label: "SaaS + LUC fees", vals: ["--", "--", "90K", "216K", "432K", "630K"] },
            { label: "Marketing pool (2%)", vals: ["--", "--", "126K", "456K", "960K", "1,680K"] },
            { label: "Subtotal Franchise", vals: ["--", "--", "1,108K", "3,179K", "6,492K", "10,585K"], gold: true },
          ].map((row) => (
            <View
              key={row.label}
              style={[
                s.tRow,
                row.accent ? { backgroundColor: C.accent + "08" } : {},
                row.gold ? { backgroundColor: C.gold + "08" } : {},
              ]}
            >
              <Text
                style={[
                  row.accent ? s.tCellAccent : row.gold ? { ...s.tCellBold, color: C.gold } : s.tCell,
                  { width: 90 },
                ]}
              >
                {row.label}
              </Text>
              {row.vals.map((v, i) => (
                <Text
                  key={i}
                  style={[
                    row.accent ? s.tCellAccent : row.gold ? { ...s.tCellBold, color: C.gold } : s.tCell,
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  {v}
                </Text>
              ))}
            </View>
          ))}
          {/* Total Revenue */}
          <View style={[s.tRow, { backgroundColor: C.accent + "12", borderBottomWidth: 2, borderBottomColor: C.accent }]}>
            <Text style={[s.tCellAccent, { width: 90, fontSize: 8 }]}>TOTAL REVENUE</Text>
            {["120K", "2,120K", "6,628K", "11,799K", "17,612K", "24,145K"].map((v, i) => (
              <Text key={i} style={[s.tCellAccent, { flex: 1, textAlign: "right", fontSize: 8 }]}>{v}</Text>
            ))}
          </View>
          {/* Costs */}
          <View style={{ paddingTop: 4, paddingBottom: 2 }}>
            <Text style={{ fontSize: 6, color: C.textMuted, letterSpacing: 1, textTransform: "uppercase" }}>Costs</Text>
          </View>
          {[
            { label: "Drone CAPEX", vals: ["98K", "392K", "294K", "294K", "196K", "294K"] },
            { label: "Fleet OPEX", vals: ["26K", "130K", "208K", "286K", "338K", "390K"] },
            { label: "Crew costs (1 pilot/drone, salaried)", vals: ["75K", "150K", "225K", "300K", "375K", "450K"] },
            { label: "CEO salary", vals: ["60K", "100K", "100K", "150K", "180K", "200K"] },
            { label: "HQ Assistant", vals: ["55K", "57K", "59K", "61K", "63K", "65K"] },
            { label: "Safety Manager", vals: ["20K", "40K", "60K", "80K", "100K", "100K"] },
            { label: "Hub/HQ rent", vals: ["36K", "144K", "180K", "216K", "216K", "216K"] },
            { label: "Ops vehicles", vals: ["50K", "100K", "150K", "175K", "200K", "250K"] },
            { label: "Fixed & platform", vals: ["110K", "200K", "250K", "300K", "350K", "410K"] },
            { label: "Core team salaries", vals: ["0", "240K", "480K", "720K", "960K", "1,200K"] },
            { label: "Franchise ops", vals: ["0", "0", "180K", "360K", "600K", "900K"] },
            { label: "Marketing", vals: ["30K", "80K", "150K", "250K", "400K", "600K"] },
            { label: "Intl. expansion", vals: ["0", "0", "0", "200K", "400K", "600K"] },
            { label: "Reserve (idle time, contingency)", vals: ["25K", "50K", "75K", "100K", "125K", "150K"] },
          ].map((row) => (
            <View key={row.label} style={s.tRow}>
              <Text style={[s.tCell, { width: 90 }]}>{row.label}</Text>
              {row.vals.map((v, i) => (
                <Text key={i} style={[s.tCell, { flex: 1, textAlign: "right" }]}>{v}</Text>
              ))}
            </View>
          ))}
          <View style={[s.tRow, { borderBottomWidth: 2, borderBottomColor: C.border }]}>
            <Text style={[s.tCellBold, { width: 90 }]}>TOTAL COSTS</Text>
            {["585K", "1,683K", "2,411K", "3,492K", "4,503K", "5,825K"].map((v, i) => (
              <Text key={i} style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{v}</Text>
            ))}
          </View>
          {/* EBITDA */}
          <View style={[s.tRow, { backgroundColor: C.green + "10" }]}>
            <Text style={[s.tCellGreen, { width: 90, fontSize: 8 }]}>EBITDA</Text>
            {[
              { v: "-465K", neg: true },
              { v: "437K", neg: false },
              { v: "4,217K", neg: false },
              { v: "8,307K", neg: false },
              { v: "13,109K", neg: false },
              { v: "18,320K", neg: false },
            ].map((item, i) => (
              <Text
                key={i}
                style={[
                  item.neg ? s.tCellRed : s.tCellGreen,
                  { flex: 1, textAlign: "right", fontSize: 8 },
                ]}
              >
                {item.v}
              </Text>
            ))}
          </View>
          <View style={s.tRow}>
            <Text style={[s.tCell, { width: 90 }]}>EBITDA Margin</Text>
            {["neg.", "21%", "64%", "70%", "74%", "76%"].map((v, i) => (
              <Text
                key={i}
                style={[
                  v === "neg." ? s.tCellRed : s.tCellGreen,
                  { flex: 1, textAlign: "right" },
                ]}
              >
                {v}
              </Text>
            ))}
          </View>
        </View>
        <Footer page={4} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 3: BREAK-EVEN ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>03</Text>
        <Text style={s.h2}>Break-Even Analysis</Text>
        <Text style={s.subtitle}>
          Operational break-even at Month 7-8, full P&L break-even at Month 25
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Monthly Fixed Costs", value: "CHF 26K", sub: "Year 1 incl. CEO, team" },
            { label: "Daily Contribution", value: "CHF 1,750", sub: "Per drone average" },
            { label: "Operational B/E", value: "Month 7-8", sub: "~15 ops days/month" },
            { label: "Full P&L B/E", value: "Month 25", sub: "Early Year 3" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 13 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
              <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 1 }}>{kpi.sub}</Text>
            </View>
          ))}
        </View>

        {/* Timeline */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Break-Even Timeline
          </Text>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
            {[
              { month: "M1", label: "Launch", color: C.red },
              { month: "M7-8", label: "Ops B/E", color: C.gold },
              { month: "M25", label: "Full B/E", color: C.green },
              { month: "M36+", label: "Scale", color: C.green },
            ].map((m) => (
              <View key={m.month} style={{ alignItems: "center" }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: m.color, marginBottom: 4 }} />
                <Text style={{ fontSize: 8, fontWeight: "bold", color: m.color }}>{m.month}</Text>
                <Text style={{ fontSize: 7, color: C.textMuted }}>{m.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Detailed metrics */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Detailed Break-Even Metrics
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Metric</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Value</Text>
          </View>
          {[
            ["Monthly fixed costs (Year 1)", "CHF 26,000"],
            ["Average daily contribution (1 drone)", "CHF 1,750"],
            ["Break-even point", "~15 operational days/month"],
            ["Operational break-even", "Month 7-8"],
            ["Full P&L break-even", "Month 25 (early Year 3)"],
          ].map((row, i) => (
            <View key={i} style={s.tRow}>
              <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
            </View>
          ))}
        </View>

        {/* ═══ SECTION 4: CASH FLOW ═══ */}
        <View style={{ marginTop: 16 }}>
          <Text style={s.sectionNum}>04</Text>
          <Text style={s.h2}>Cash Flow & Runway</Text>
          <Text style={s.subtitle}>
            Cumulative cash flow from -CHF 465K to +CHF 43.9M over 6 years
          </Text>
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.green, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Cash Flow Summary
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 50 }]}> </Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cash In</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cash Out</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Net</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Cumulative</Text>
          </View>
          {[
            { yr: "Year 1", ci: "120K", co: "585K", net: "-465K", cum: "-465K", neg: true },
            { yr: "Year 2", ci: "2,120K", co: "1,683K", net: "+437K", cum: "-28K", neg: true },
            { yr: "Year 3", ci: "6,628K", co: "2,411K", net: "+4,217K", cum: "+4,189K", neg: false },
            { yr: "Year 4", ci: "11,799K", co: "3,492K", net: "+8,307K", cum: "+12,496K", neg: false },
            { yr: "Year 5", ci: "17,612K", co: "4,503K", net: "+13,109K", cum: "+25,605K", neg: false },
            { yr: "Year 6", ci: "24,145K", co: "5,825K", net: "+18,320K", cum: "+43,925K", neg: false },
          ].map((row) => (
            <View key={row.yr} style={s.tRow}>
              <Text style={[s.tCellBold, { width: 50 }]}>{row.yr}</Text>
              <Text style={[s.tCellGreen, { flex: 1, textAlign: "right" }]}>{row.ci}</Text>
              <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row.co}</Text>
              <Text style={[row.neg ? s.tCellRed : s.tCellGreen, { flex: 1, textAlign: "right" }]}>{row.net}</Text>
              <Text style={[row.neg ? s.tCellRed : s.tCellGreen, { flex: 1, textAlign: "right", fontWeight: "bold" }]}>{row.cum}</Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 7, color: C.textSecondary, marginTop: 4 }}>
          With CHF 1.5M raised: covers Year 1 investment (-CHF 465K) with CHF 1.035M reserve. Cumulative P&L positive from Year 3. Total 6-year EBITDA: CHF 43.9M.
        </Text>
        <Footer page={5} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 5: USE OF FUNDS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>05</Text>
        <Text style={s.h2}>Use of Funds — CHF 1.5M</Text>
        <Text style={s.subtitle}>
          Allocation of seed round capital across seven strategic pillars
        </Text>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>
            Capital Allocation
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { flex: 2 }]}>Category</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Amount</Text>
            <Text style={[s.tCellBold, { width: 40, textAlign: "right" }]}>%</Text>
          </View>
          {[
            { name: "Fleet", amount: "CHF 550K", pct: "37%", color: C.accent },
            { name: "Hub Infrastructure", amount: "CHF 350K", pct: "23%", color: C.gold },
            { name: "Working Capital", amount: "CHF 220K", pct: "15%", color: C.textMuted },
            { name: "Sales & Marketing", amount: "CHF 150K", pct: "10%", color: C.green },
            { name: "LUC + Legal", amount: "CHF 90K", pct: "6%", color: "#8B5CF6" },
            { name: "Software & APIs", amount: "CHF 80K", pct: "5%", color: "#06B6D4" },
            { name: "Insurance", amount: "CHF 60K", pct: "4%", color: "#FF6B6B" },
          ].map((item) => (
            <View key={item.name} style={s.tRow}>
              <View style={{ flex: 2, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <View style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: item.color }} />
                <Text style={s.tCell}>{item.name}</Text>
              </View>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{item.amount}</Text>
              <Text style={[s.tCell, { width: 40, textAlign: "right" }]}>{item.pct}</Text>
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08", borderBottomWidth: 2, borderBottomColor: C.accent }]}>
            <Text style={[s.tCellAccent, { flex: 2 }]}>Total</Text>
            <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>CHF 1,500K</Text>
            <Text style={[s.tCellAccent, { width: 40, textAlign: "right" }]}>100%</Text>
          </View>
        </View>

        {/* Visual bar representation */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 8 }}>
            Allocation Breakdown
          </Text>
          {[
            { name: "Fleet", amount: 550, color: C.accent },
            { name: "Hub Infrastructure", amount: 350, color: C.gold },
            { name: "Working Capital", amount: 220, color: C.textMuted },
            { name: "Sales & Marketing", amount: 150, color: C.green },
            { name: "LUC + Legal", amount: 90, color: "#8B5CF6" },
            { name: "Software & APIs", amount: 80, color: "#06B6D4" },
            { name: "Insurance", amount: 60, color: "#FF6B6B" },
          ].map((item) => (
            <View key={item.name} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
              <Text style={{ fontSize: 6, color: C.textMuted, width: 70 }}>{item.name}</Text>
              <View style={[s.barBg, { flex: 1 }]}>
                <View style={{ height: 6, width: `${(item.amount / 550) * 100}%`, backgroundColor: item.color, borderRadius: 3 }} />
              </View>
              <Text style={{ fontSize: 7, fontWeight: "bold", color: item.color, width: 50, textAlign: "right" }}>
                CHF {item.amount}K
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 7, color: C.textSecondary, marginTop: 4 }}>
          Primary focus: fleet acquisition (37%) and hub infrastructure (23%) to establish operational capacity across 4 hubs with 10 drones by Year 2.
        </Text>
        <Footer page={6} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 6: INVESTOR ROI ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>06</Text>
        <Text style={s.h2}>Investor ROI</Text>
        <Text style={s.subtitle}>
          Interactive calculator -- pick your investment amount, see projected returns
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Pre-Money", value: "CHF 8.5M" },
            { label: "Interest Rate", value: "6% p.a." },
            { label: "Conversion Discount", value: "20%" },
            { label: "Instrument", value: "Convertible Note" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 11 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        {/* Convertible Note Terms */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, marginBottom: 6 }}>
            Convertible Note Terms
          </Text>
          {[
            "1. Structure: Convertible loan with 6% p.a. accruing interest",
            "2. Conversion discount: 20% at next qualified round",
            "3. Pre-money valuation: CHF 8.5M",
            "4. Exit target: Trade sale in 6-8 years (5-10x ARR tech multiple)",
          ].map((text) => (
            <View key={text} style={s.bullet}>
              <View style={s.bulletDot} />
              <Text style={s.bulletText}>{text}</Text>
            </View>
          ))}
          <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 4 }}>
            * Terms indicative. Final terms subject to formal agreement.
          </Text>
        </View>

        {/* Exit Targets */}
        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.gold, marginBottom: 6 }}>
            Exit Targets
          </Text>
          {[
            { label: "Timeline", value: "Trade sale in 6-8 years" },
            { label: "Valuation basis", value: "5-10x ARR tech multiple (AI + LUC moat)" },
            { label: "Potential acquirers", value: "Die Post, Planzer, Kuehne+Nagel, Implenia, intl. drone infra companies" },
          ].map((item) => (
            <View key={item.label} style={{ flexDirection: "row", gap: 6, marginBottom: 3 }}>
              <Text style={{ fontSize: 7, fontWeight: "bold", color: C.accent, width: 80 }}>
                {item.label}:
              </Text>
              <Text style={{ fontSize: 7, color: C.textSecondary, flex: 1 }}>
                {item.value}
              </Text>
            </View>
          ))}
        </View>
        <Footer page={7} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 7: FRANCHISE ECONOMICS ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>07</Text>
        <Text style={s.h2}>Franchise Unit Economics</Text>
        <Text style={s.subtitle}>
          Partner P&L + HQ recurring revenue per franchise partner
        </Text>

        <View style={s.row}>
          {/* Partner P&L */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              Franchise Partner P&L (per unit/year)
            </Text>
            <View style={s.tHead}>
              <Text style={[s.tCellBold, { flex: 2 }]}>Item</Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Amount</Text>
            </View>
            {[
              ["Revenue (200d x CHF 3,500)", "CHF 700,000"],
              ["Royalty to HQ (9%)", "-CHF 63,000"],
              ["Marketing pool (2%)", "-CHF 14,000"],
              ["SaaS + LUC fee", "-CHF 18,000"],
              ["Crew costs (1 pilot)", "-CHF 87,500"],
              ["Drone OPEX", "-CHF 12,900"],
              ["Vehicle OPEX", "-CHF 8,000"],
            ].map((row, i) => (
              <View key={i} style={s.tRow}>
                <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
                <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              </View>
            ))}
            <View style={[s.tRow, { backgroundColor: C.green + "10" }]}>
              <Text style={[s.tCellGreen, { flex: 2 }]}>Partner Net Income</Text>
              <Text style={[s.tCellGreen, { flex: 1, textAlign: "right" }]}>CHF 496,600</Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: C.green }}>~6x ROI</Text>
              <Text style={{ fontSize: 6, color: C.textMuted }}>on entry investment</Text>
            </View>
          </View>

          {/* HQ Revenue */}
          <View style={[s.card, s.col]}>
            <Text style={{ fontSize: 8, fontWeight: "bold", color: C.gold, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
              HQ Revenue per Partner
            </Text>
            <View style={s.tHead}>
              <Text style={[s.tCellBold, { flex: 2 }]}>Stream</Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Annual</Text>
            </View>
            {[
              ["Entry fee (amortised)", "CHF 7,000"],
              ["Hardware margin (amortised)", "CHF 6,000"],
              ["Royalties (9%)", "CHF 63,000"],
              ["Marketing pool (2%)", "CHF 14,000"],
              ["SaaS + LUC fee", "CHF 18,000"],
            ].map((row, i) => (
              <View key={i} style={s.tRow}>
                <Text style={[s.tCell, { flex: 2 }]}>{row[0]}</Text>
                <Text style={[s.tCell, { flex: 1, textAlign: "right" }]}>{row[1]}</Text>
              </View>
            ))}
            <View style={[s.tRow, { backgroundColor: C.gold + "10" }]}>
              <Text style={[{ ...s.tCellBold, color: C.gold }, { flex: 2 }]}>
                HQ recurring per partner
              </Text>
              <Text style={[{ ...s.tCellBold, color: C.gold }, { flex: 1, textAlign: "right" }]}>
                CHF 95,000
              </Text>
            </View>
            <View style={{ alignItems: "center", marginTop: 8 }}>
              <Text style={{ fontSize: 14, fontWeight: "bold", color: C.gold }}>CHF 95K</Text>
              <Text style={{ fontSize: 6, color: C.textMuted }}>recurring per partner/year</Text>
            </View>
          </View>
        </View>

        {/* ═══ SECTION 8: FLEET GROWTH ═══ */}
        <View style={{ marginTop: 16 }}>
          <Text style={s.sectionNum}>08</Text>
          <Text style={s.h2}>Fleet Growth</Text>
          <Text style={s.subtitle}>
            From 2 drones (Year 1) to 30 own drones + 35 franchise partners (Year 6)
          </Text>
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Fleet & Crew Scale
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 50 }]}> </Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Own</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Franchise</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>Total</Text>
          </View>
          {[
            { year: "Year 1", own: 2, franchise: 0, total: 2 },
            { year: "Year 2", own: 10, franchise: 0, total: 10 },
            { year: "Year 3", own: 16, franchise: 5, total: 21 },
            { year: "Year 4", own: 22, franchise: 12, total: 34 },
            { year: "Year 5", own: 26, franchise: 24, total: 50 },
            { year: "Year 6", own: 30, franchise: 35, total: 65 },
          ].map((row) => (
            <View key={row.year} style={s.tRow}>
              <Text style={[s.tCellBold, { width: 50 }]}>{row.year}</Text>
              <Text style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>{row.own}</Text>
              <Text style={[{ ...s.tCellBold, color: C.gold }, { flex: 1, textAlign: "right" }]}>
                {row.franchise || "--"}
              </Text>
              <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{row.total}</Text>
            </View>
          ))}
          {/* Visual bar representation */}
          <View style={{ marginTop: 8 }}>
            {[
              { year: "Year 1", total: 2 },
              { year: "Year 2", total: 10 },
              { year: "Year 3", total: 21 },
              { year: "Year 4", total: 34 },
              { year: "Year 5", total: 50 },
              { year: "Year 6", total: 65 },
            ].map((row) => (
              <View key={row.year} style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 3 }}>
                <Text style={{ fontSize: 6, color: C.textMuted, width: 35 }}>{row.year}</Text>
                <View style={[s.barBg, { flex: 1 }]}>
                  <View style={{ height: 6, width: `${(row.total / 65) * 100}%`, backgroundColor: C.accent, borderRadius: 3 }} />
                </View>
                <Text style={{ fontSize: 7, fontWeight: "bold", color: C.accent, width: 30, textAlign: "right" }}>
                  {row.total}
                </Text>
              </View>
            ))}
          </View>
        </View>
        <Footer page={8} total={TOTAL} />
      </Page>

      {/* ═══ SECTION 9: PLATFORM GMV ═══ */}
      <Page size="A4" style={s.page}>
        <Text style={s.sectionNum}>09</Text>
        <Text style={s.h2}>Platform GMV</Text>
        <Text style={s.subtitle}>
          Total ecosystem value -- own operations + franchise partner gross revenue
        </Text>

        <View style={{ flexDirection: "row", gap: 6, marginBottom: 10 }}>
          {[
            { label: "Year 6 Platform GMV", value: "CHF 97.6M" },
            { label: "HQ Take Rate", value: "25%" },
            { label: "Franchise Partners", value: "35" },
          ].map((kpi) => (
            <View key={kpi.label} style={s.kpiBox}>
              <Text style={[s.kpiValue, { fontSize: 14 }]}>{kpi.value}</Text>
              <Text style={s.kpiLabel}>{kpi.label}</Text>
            </View>
          ))}
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Platform GMV Growth
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 100 }]}> </Text>
            {["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"].map((h) => (
              <Text key={h} style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>{h}</Text>
            ))}
          </View>
          {[
            { label: "Own Operations", vals: ["120K", "2,120K", "5,520K", "8,620K", "11,120K", "13,560K"] },
            { label: "Franchise Gross Rev.", vals: ["--", "--", "6,300K", "22,800K", "48,000K", "84,000K"] },
          ].map((row) => (
            <View key={row.label} style={s.tRow}>
              <Text style={[s.tCell, { width: 100 }]}>{row.label}</Text>
              {row.vals.map((v, i) => (
                <Text key={i} style={[s.tCell, { flex: 1, textAlign: "right" }]}>{v}</Text>
              ))}
            </View>
          ))}
          <View style={[s.tRow, { backgroundColor: C.accent + "08" }]}>
            <Text style={[s.tCellAccent, { width: 100 }]}>Total Platform GMV</Text>
            {["120K", "2,120K", "11,820K", "31,420K", "59,120K", "97,560K"].map((v, i) => (
              <Text key={i} style={[s.tCellAccent, { flex: 1, textAlign: "right" }]}>{v}</Text>
            ))}
          </View>
        </View>

        <Text style={{ fontSize: 7, color: C.textSecondary, marginTop: 4 }}>
          HQ captures ~25% as direct revenue through own operations, royalties, SaaS fees, and franchise margins.
        </Text>

        {/* ═══ SECTION 10: SENSITIVITY ANALYSIS ═══ */}
        <View style={{ marginTop: 20 }}>
          <Text style={s.sectionNum}>10</Text>
          <Text style={s.h2}>Sensitivity Analysis</Text>
          <Text style={s.subtitle}>
            Revenue sensitivity to utilisation rates and daily pricing (Year 6, 30 own drones)
          </Text>
        </View>

        <View style={s.card}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.accent, letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
            Revenue Sensitivity Grid (Year 6)
          </Text>
          <View style={s.tHead}>
            <Text style={[s.tCellBold, { width: 65 }]}>Days \ Rate</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 3,000</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 3,500</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 4,000</Text>
            <Text style={[s.tCellBold, { flex: 1, textAlign: "right" }]}>CHF 4,500</Text>
          </View>
          {[
            { days: "150 days", vals: ["13.5M", "15.8M", "18.0M", "20.3M"] },
            { days: "180 days", vals: ["16.2M", "18.9M", "21.6M", "24.3M"] },
            { days: "200 days*", vals: ["18.0M", "21.0M", "24.0M", "27.0M"], base: true },
            { days: "220 days", vals: ["19.8M", "23.1M", "26.4M", "29.7M"] },
          ].map((row) => (
            <View key={row.days} style={[s.tRow, row.base ? { backgroundColor: C.accent + "08" } : {}]}>
              <Text style={[row.base ? s.tCellAccent : s.tCellBold, { width: 65 }]}>
                {row.days}
              </Text>
              {row.vals.map((v, i) => (
                <Text
                  key={i}
                  style={[
                    row.base && i === 1
                      ? { ...s.tCellAccent, fontSize: 8 }
                      : s.tCell,
                    { flex: 1, textAlign: "right" },
                  ]}
                >
                  CHF {v}
                </Text>
              ))}
            </View>
          ))}
          <Text style={{ fontSize: 6, color: C.textMuted, marginTop: 4 }}>
            * Base case: 200 days x CHF 3,500/day = CHF 21.0M (own-ops DaaS)
          </Text>
        </View>

        {/* Risk Factors */}
        <View style={[s.card, { marginTop: 8 }]}>
          <Text style={{ fontSize: 8, fontWeight: "bold", color: C.text, marginBottom: 6 }}>
            Key Risk Factors & Mitigations
          </Text>
          {[
            { risk: "Regulatory delay (LUC)", mitigation: "SORA enables commercial ops while LUC pending" },
            { risk: "Weather / utilisation", mitigation: "Gov retainers provide baseline revenue regardless of weather" },
            { risk: "Competition", mitigation: "LUC + AI moat = 18+ month head start; no Swiss competitor close" },
            { risk: "Drone reliability", mitigation: "Hub-level redundancy (2-3 drones per hub) + 24h rapid replacement" },
          ].map((item) => (
            <View key={item.risk} style={{ flexDirection: "row", gap: 6, marginBottom: 4 }}>
              <Text style={{ fontSize: 7, fontWeight: "bold", color: C.accent, width: 100 }}>
                {item.risk}
              </Text>
              <Text style={{ fontSize: 7, color: C.textSecondary, flex: 1 }}>
                {item.mitigation}
              </Text>
            </View>
          ))}
        </View>

        <Text style={{ fontSize: 7, color: C.textMuted, marginTop: 8, fontStyle: "italic" }}>
          Based on management estimates. Subject to market conditions and regulatory timelines.
        </Text>
        <Footer page={9} total={TOTAL} />
      </Page>
    </Document>
  );
}
